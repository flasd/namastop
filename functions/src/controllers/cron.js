const axios = require('axios');
const qs = require('qs');
const secureCompare = require('secure-compare');
const functions = require('firebase-functions');
const promisePool = require('es6-promise-pool');
const { trimObject } = require('../utils');

const PromisePool = promisePool.PromisePool;
const AXIOS_OPTIONS = {
  headers: {
    Authentication: `Bearer ${functions.config().slack.key}`
  }
};

/**
 * @function getMembers
 * @param  {?String} cursor  O cursor para a pŕoxima página de usuários,
 * @param  {?Array<Object>} members A lista de usuários obtida até agora,
 * @return {Promise} Resolve com todos os usuários.
 */
async function getMembers(cursor, members = []) {
  const queryString = qs.stringify(
    trimObject({
      token: functions.config().slack.key,
      limit: 200,
      cursor
    })
  );

  const response = await axios.get(
    `https://slack.com/api/users.list?${queryString}`
  );

  if (response.data && response.data.ok) {
    const {
      response_metadata: { next_cursor }
    } = data;

    const nextMembers = [...members, ...data.members];

    if (next_cursor.length > 0) {
      return await getMembers(next_cursor, nextMembers);
    }

    return [...members, ...data.members];
  }

  throw new Error(JSON.stringify(response));
}

/**
 * @function sendMessages
 * @param  {Array<Object>} members Lista com todos os usuários,
 * @return {Promise} Resolve se a mensagem for enviada.
 */
async function sendMessages(members) {
  if (members.length > 0) {
    const current = members.pop();

    const queryString = qs.stringify({
      token: functions.config().slack.key,
      user: current
    });

    const {
      data: {
        channel: { id }
      }
    } = await axios.post(
      'https://slack.com/api/im.open',
      {
        user: current.id
      },
      AXIOS_OPTIONS
    );

    const { data } = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: id,
        text: `Olá ${current.name}!
 Lembre-se de tirar alguns minutinhos do seu dia para agradecer a ajuda que você recebeu essa semana!
 Use o comando '/namastop' para agradecer alguem que te ajudou!`
      },
      AXIOS_OPTIONS
    );

    return await new Promise(r => setTimeout(() => r(), 500));
  }

  return null;
}

module.exports = async function cronController(request, response) {
  const { key } = request.query;

  if (!secureCompare(key, functions.config().cron.key)) {
    console.error('Chave inválida recebida.');

    return response.status(403).send();
  }

  try {
    const members = await getMembers();

    const pool = new PromisePool(() => sendMessages(members), 5);
    await pool.start();

    return response.status(200).send();
  } catch (error) {
    console.error(error);
    return response.status(500).send();
  }
};
