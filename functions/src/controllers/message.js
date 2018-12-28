const requestPromise = require('request-promise-native');
const qs = require('qs');
const functions = require('firebase-functions');
const firestore = require('../repository');

const AXIOS_OPTIONS = {
  headers: {
    Authentication: `Bearer ${functions.config().slack.key}`,
  },
};

module.exports = async function messageController(request, response) {
  const { body } = request;
  let useUrl = false;

  setTimeout(() => {
    useUrl = true;
    response.status(200).send();
  }, 3000);

  try {
    // Adquirir informações de quem enviou a mensagem;
    const senderQs = qs.stringify({
      token: functions.config().slack.key,
      user: body.user_id,
    });

    const sender = await requestPromise({
      uri: `https://slack.com/api/users.info?${senderQs}`,
      json: true,
    });

    // Adquirir informações de quem foi mencionado mensagem na mensagem;
    const [, reciverId] = body.text.match(/<@(\w+)\|/);

    const reciverQs = qs.stringify({
      token: functions.config().slack.key,
      user: reciverId.replace(/\W/g, ''),
    });

    const reciver = await requestPromise({
      uri: `https://slack.com/api/users.info?${reciverQs}`,
      json: true,
    });

    // Salva a mensagem no banco
    await firestore()
      .collection('messages')
      .add({
        fromId: sender.user.id,
        fromName: sender.user.name,
        fromPicture: sender.user.profile.image_192,
        toId: reciver.user.id,
        toName: reciver.user.name,
        toPicture: reciver.user.profile.image_192,
        createdAt: new Date(),
        text: body.text.replace(/, <@\w+(|\w+)?>/, ''),
      });

    const slackResponse = {
      text: 'Sua mensagem foi adicionada ao mural!',
      attachments: [
        {
          text:
            'Acesse namastop-app.firebaseapp.com para ver todas as mensagens!',
        },
      ],
    };

    if (useUrl) {
      await requestPromise({
        method: 'POST',
        uri: body.response_url,
        body: slackResponse,
        json: true,
        ...AXIOS_OPTIONS,
      });

      return;
    }

    response.status(200).json(slackResponse);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    const slackResponse = {
      text: 'Aldo deu errado do nosso lado. Tente novamente.',
    };

    if (useUrl) {
      try {
        await requestPromise({
          method: 'POST',
          uri: body.response_url,
          body: slackResponse,
          json: true,
          ...AXIOS_OPTIONS,
        });
      } catch (anotherError) {
        // here be dragons
        // eslint-disable-next-line no-console
        console.error(error);
        return;
      }
    }

    response.status(500).json(slackResponse);
  }
};
