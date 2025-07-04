// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccountKey.json"); // Path to your downloaded service account

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports =admin;