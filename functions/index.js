const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.exportTrainingLogs = onRequest(async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection("TrainingLogs")
      .where("rating", "==", 1)
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push(doc.data());
    });

    // Format to Gemini specifications
    const jsonlContent = logs.map(log => JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: log.user_query }]
        },
        {
          role: "model",
          parts: [{ text: log.bot_response }]
        }
      ]
    })).join('\n');

    // Save to Cloud Storage bucket
    const bucket = getStorage().bucket();
    const file = bucket.file("exports/calyxo_fine_tuning.jsonl");
    await file.save(jsonlContent, {
      contentType: "application/x-jsonlines",
      metadata: {
        cacheControl: "no-cache"
      }
    });

    res.status(200).send({
      message: "Export completed successfully.",
      filePath: "exports/calyxo_fine_tuning.jsonl"
    });
  } catch (error) {
    console.error("Export function error:", error);
    res.status(500).send({ error: error.message });
  }
});

exports.setUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in.");
  }

  const callerUid = request.auth.uid;
  const db = getFirestore();

  // Verify caller is admin
  const callerProfileSnap = await db.collection("users_metrics").doc(`${callerUid}_profile`).get();
  if (!callerProfileSnap.exists) {
    throw new HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerRole = callerProfileSnap.data().role;
  if (callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can change roles.");
  }

  const targetUid = request.data.targetUid;
  const newRole = request.data.newRole;

  if (!['user', 'trainer', 'dietitian', 'admin'].includes(newRole)) {
    throw new HttpsError("invalid-argument", "Invalid role specified.");
  }

  await db.collection("users_metrics").doc(`${targetUid}_profile`).update({
    role: newRole
  });

  return { success: true, role: newRole };
});
