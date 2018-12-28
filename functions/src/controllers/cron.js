const requestPromise = require('request-promise-native');
const qs = require('qs');
const secureCompare = require('secure-compare');
const functions = require('firebase-functions');
const PromisePool = require('es6-promise-pool');

/**
 * @function getMembers
 * @param  {?String} cursor  O cursor para a pŕoxima página de usuários,
 * @param  {?Array<Object>} members A lista de usuários obtida até agora,
 * @return {Promise} Resolve com todos os usuários.
 */
async function getMembers(cursor, members = []) {
  const queryString = qs.stringify({
    token: functions.config().slack.key,
    limit: 200,
    cursor,
  });

  const response = await requestPromise({
    uri: `https://slack.com/api/users.list?${queryString}`,
    json: true,
  });

  if (response && response.ok) {
    const {
      response_metadata: { next_cursor: nextCursor },
      members: newMembers,
    } = response;

    const nextMembers = [...members, ...newMembers];

    if (nextCursor.length > 0) {
      return getMembers(nextCursor, nextMembers);
    }

    return nextMembers;
  }

  throw new Error(JSON.stringify(response));
}

/**
 * @function sendMessage
 * @param  {Object} member Objeto do membro do Slack,
 * @return {Promise} Resolve depois de 500ms de delay.
 */
async function sendMessage(member) {
  if (member.id === 'USLACKBOT' || member.is_bot) {
    return Promise.resolve();
  }

  const channelResponse = await requestPromise({
    method: 'POST',
    uri: `https://slack.com/api/im.open?${qs.stringify({
      token: functions.config().slack.key,
      user: member.id,
    })}`,
    json: true,
  });

  if (!channelResponse.ok) {
    // eslint-disable-next-line no-console
    console.error(`Messaging user failed ${channelResponse.error}`);

    return Promise.resolve();
  }

  await requestPromise({
    method: 'POST',
    uri: `https://slack.com/api/chat.postMessage?${qs.stringify({
      token: functions.config().slack.key,
      channel: channelResponse.channel.id,
      text: `Olá ${member.name}!
Lembre-se de tirar alguns minutinhos do seu dia para agradecer a ajuda que você recebeu essa semana!
Use o comando '/namastop' para agradecer alguem que te ajudou!`,
    })}`,
    json: true,
  });

  return new Promise(r => setTimeout(() => r(), 500));
}

/**
 * @function sendMessages
 * @param  {Array<Object>} members Lista com todos os usuários,
 * @return {PromisePool} Retorna a pool de promises.
 */
function sendMessages(members) {
  const clone = [...members];

  return new PromisePool(() => {
    if (clone.length > 0) {
      const current = members.pop();

      if (!current) {
        return null;
      }

      return sendMessage(current);
    }

    return null;
  }, 3);
}

module.exports = async function cronController(request, response) {
  const { key } = request.query;

  if (!secureCompare(key, functions.config().cron.key)) {
    // eslint-disable-next-line no-console
    console.error('Chave inválida recebida.');

    response.status(403).end();
    return;
  }

  try {
    const members = await getMembers();

    const pool = sendMessages(members);
    await pool.start();

    response.status(200).end();
    return;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    response.status(500).end();
  }
};
