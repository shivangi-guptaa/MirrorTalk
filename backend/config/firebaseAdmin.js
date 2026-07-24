const admin = require("firebase-admin");

let initialized = false;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    try {
      serviceAccount = require("./firebaseServiceAccount.json");
    } catch {
      console.log("⚠️ firebaseServiceAccount.json not found. Google Auth backend verification will use fallback.");
    }
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("🔥 Firebase Admin SDK initialized");
  }
} catch (err) {
  console.error("⚠️ Firebase Admin SDK Init Warning:", err.message);
}

module.exports = admin;
