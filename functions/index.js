const functions = require('firebase-functions');
const app = require('./src/app');
const aggregator = require('./src/controllers/aggregator');

exports.api = functions.https.onRequest(app);

exports.documentCounter = functions.firestore.document('messages/{message}').onWrite(aggregator);
