const admin = require("firebase-admin");

const serviceAccount = require("./firebaseServiceAccountKey.json"); // المسار صح كده

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
