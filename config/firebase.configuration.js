const admin = require("firebase-admin");
const serviceAccount = require("./safe-heaven-56a05-firebase-adminsdk-fbsvc-02a8752a92.json");

if (!admin.apps.length) {
  console.log("Initializing Firebase Admin with service account:", serviceAccount.client_email);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;