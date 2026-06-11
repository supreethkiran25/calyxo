import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [], results: [] });
    }

    const response = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ suggestions: [], results: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("wger exercise proxy error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
