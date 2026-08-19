// Food search service — replaces /api/food Next.js route
// OpenFoodFacts API is CORS-friendly, so direct client calls work

export async function searchFood(query) {
  if (!query || query.trim().length < 2) {
    return { products: [] };
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=true&page_size=8`,
      {
        headers: {
          'User-Agent': 'CalyxoPWA - Web - Version 1.0 - https://calyxo.app'
        }
      }
    );

    if (!response.ok) {
      return { products: [] };
    }

    return await response.json();
  } catch (err) {
    console.error("OpenFoodFacts search error", err);
    return { products: [] };
  }
}
