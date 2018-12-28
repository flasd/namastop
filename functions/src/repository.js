const admin = require('firebase-admin');

admin.initializeApp();

const { firestore } = admin;
firestore().settings({ timestampsInSnapshots: true });

module.exports = firestore;
