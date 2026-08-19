// Workout exercise search service — replaces /api/workout Next.js route
// wger.de API is CORS-friendly for client-side requests

export async function searchExercises(query) {
  if (!query || query.trim().length < 2) {
    return { suggestions: [], results: [] };
  }

  try {
    const response = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { suggestions: [], results: [] };
    }

    return await response.json();
  } catch (err) {
    console.error("wger exercise search error", err);
    return { suggestions: [], results: [] };
  }
}
