import { NextResponse } from 'next/server';
import { assignWorkoutToClient } from '@/lib/dbService';

export async function POST(req) {
  try {
    const assignment = await req.json();
    if (!assignment.clientId || !assignment.workoutName || !assignment.exercises) {
      return NextResponse.json({ error: "Missing required assignment parameters" }, { status: 400 });
    }
    const result = await assignWorkoutToClient(assignment);
    return NextResponse.json({ success: !!result, assignment: result });
  } catch (err) {
    console.error("Assign workout API error", err);
    return NextResponse.json({ error: err.message || "Failed to assign workout" }, { status: 500 });
  }
}
