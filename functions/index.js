const { onRequest } = require("firebase-functions/v2/https");
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
