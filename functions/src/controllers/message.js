const axios = require('axios');
const qs = require('qs');
const secureCompare = require('secure-compare');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const AXIOS_OPTIONS = {
  headers: {
    Authentication: `Bearer ${functions.config().slack.key}`
  }
};

admin.initializeApp();

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
      user: body.user_id
    });

    const { data: sender } = await axios.get(
      `https://slack.com/api/users.info?${senderQs}`
    );

    // Adquirir informações de quem foi mencionado mensagem na mensagem;
    const [reciverId] = body.text.match(/<@\w+>/);

    const reciverQs = qs.stringify({
      token: functions.config().slack.key,
      user: reciverId.replace(/\W/g, '')
    });

    const { data: reciver } = await axios.get(
      `https://slack.com/api/users.info?${reciverQs}`
    );

    // Salva a mensagem no banco
    await admin
      .firestore()
      .collection('messages')
      .add({
        fromId: sender.id,
        fromName: sender.name,
        fromPicture: sender.profile.image_192,
        toId: reciver.id,
        toName: reciver.name,
        toPicture: reciver.profile.image_192,
        createdAt: new Date(),
        text: body.text.replace(/, <@\w+>/, '')
      });

    const response = {
      text: 'Sua mensagem foi adicionada ao mural!',
      attachments: [
        {
          text:
            'Acesse namastop-app.firebaseapp.com para ver todas as mensagens!'
        }
      ]
    };

    if (useUrl) {
      await axios.post(body.response_url, response, AXIOS_OPTIONS);

      return;
    }

    response.status(200).json(response);
  } catch (error) {
    console.error(error);
    const response = {
      text: 'Aldo deu errado do nosso lado. Tente novamente.'
    };

    if (useUrl) {
      try {
        await axios.post(body.response_url, response, AXIOS_OPTIONS);
      } catch (anotherError) {
        // here be dragons
        console.error(error);
        return;
      }
    }

    response.status(200).json(response);
  }
};
