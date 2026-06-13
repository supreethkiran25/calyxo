import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(req) {
  try {
    let logs = [];
    const isMockFirebase = !db.app.options.apiKey || db.app.options.apiKey === "mock-api-key";

    if (!isMockFirebase) {
      const q = query(collection(db, "TrainingLogs"), where("rating", "==", 1));
      const snap = await getDocs(q);
      logs = snap.docs.map(doc => doc.data());
    }

    // Convert logs to Gemini JSONL format
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

    return new Response(jsonlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-jsonlines',
        'Content-Disposition': 'attachment; filename="calyxo_fine_tuning.jsonl"'
      }
    });

  } catch (err) {
    console.error("Export logs GET error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { logs } = await req.json();
    
    // Filter to only positive logs
    const positiveLogs = (logs || []).filter(log => log.rating === 1);

    // Convert logs to Gemini JSONL format
    const jsonlContent = positiveLogs.map(log => JSON.stringify({
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

    return new Response(jsonlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-jsonlines',
        'Content-Disposition': 'attachment; filename="calyxo_fine_tuning.jsonl"'
      }
    });
  } catch (err) {
    console.error("Export logs POST error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
