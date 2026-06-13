import { NextResponse } from 'next/server';
import { assignMealPlanToClient } from '@/lib/dbService';

export async function POST(req) {
  try {
    const assignment = await req.json();
    if (!assignment.clientId || !assignment.meals || !assignment.calories) {
      return NextResponse.json({ error: "Missing required meal plan parameters" }, { status: 400 });
    }
    const result = await assignMealPlanToClient(assignment);
    return NextResponse.json({ success: !!result, assignment: result });
  } catch (err) {
    console.error("Assign meal plan API error", err);
    return NextResponse.json({ error: err.message || "Failed to assign meal plan" }, { status: 500 });
  }
}
