import { NextResponse } from 'next/server';
import { fetchAllUsers, updateUserRole } from '@/lib/dbService';

export async function GET(req) {
  try {
    const users = await fetchAllUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin list users API error", err);
    return NextResponse.json({ error: err.message || "Failed to list users" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const success = await updateUserRole(userId, role);
    return NextResponse.json({ success });
  } catch (err) {
    console.error("Admin update user role API error", err);
    return NextResponse.json({ error: err.message || "Failed to update role" }, { status: 500 });
  }
}
