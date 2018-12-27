const express = require('express');
const helmet = require('helmet');
const cronController = require('./controllers/cron');
const messageController = require('./controllers/message');

const app = express();

// Helmet aumenta a segurança de aplicações Express;
app.use(helmet());

// Habitita parsin de forms enviados via url;
app.use(express.urlencoded())

// Registra os controllers:
app.get('/cron', cronController);
app.post('/message', messageController);

module.exports = app;
