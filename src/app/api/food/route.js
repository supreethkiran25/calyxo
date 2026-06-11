import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] });
    }

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=true&page_size=8`,
      {
        headers: {
          'User-Agent': 'CalyxoPWA - Web - Version 1.0 - https://calyxo.app'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ products: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("OpenFoodFacts proxy error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
