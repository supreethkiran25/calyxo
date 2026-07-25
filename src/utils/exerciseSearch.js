let cachedExercisesData = null;
let fetchPromise = null;

const preprocessExercise = (ex) => {
  if (ex._searchStr) return ex;
  const name = (ex.name || '').toLowerCase();
  const bodyPart = (ex.body_part || '').toLowerCase();
  const target = (ex.target || '').toLowerCase();
  const equipment = (ex.equipment || '').toLowerCase();
  const category = (ex.category || '').toLowerCase();
  const instructions = (ex.instructions || '').toLowerCase();

  const fullText = `${name} ${bodyPart} ${target} ${equipment} ${category} ${instructions}`;
  ex._searchStr = fullText;
  ex._nameLower = name;
  ex._words = fullText.split(/[\s\-_,()]+/);
  return ex;
};

export const loadExercisesData = async () => {
  if (cachedExercisesData) return cachedExercisesData;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch('/data/exercises.json');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const rawData = await res.json();
      cachedExercisesData = Array.isArray(rawData) ? rawData.map(preprocessExercise) : [];
      return cachedExercisesData;
    } catch (err) {
      console.error('Failed to load exercise dataset:', err);
      cachedExercisesData = [];
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export const isFuzzyMatch = (str1, str2) => {
  if (!str1 || !str2) return false;
  const s1 = String(str1).toLowerCase();
  const s2 = String(str2).toLowerCase();
  return s1.includes(s2) || s2.includes(s1);
};

export const getCachedExercises = () => cachedExercisesData || [];

export const searchAndRankExercises = (query, dataset) => {
  const activeDataset = dataset || cachedExercisesData || [];
  if (!query || !query.trim() || !activeDataset.length) return [];
  
  const qClean = query.toLowerCase().trim();
  const tokens = qClean.split(/\s+/).filter(Boolean);

  const scored = [];

  for (let i = 0; i < activeDataset.length; i++) {
    const ex = activeDataset[i];
    if (!ex._searchStr) preprocessExercise(ex);

    const fullText = ex._searchStr;
    const name = ex._nameLower || '';
    const cachedWords = ex._words || [];
    const target = (ex.target || '').toLowerCase();
    const bodyPart = (ex.body_part || '').toLowerCase();
    const equipment = (ex.equipment || '').toLowerCase();

    // High-performance tokenized match using String.prototype.includes()
    const allTokensMatch = tokens.every(token => fullText.includes(token));
    if (!allTokensMatch) continue;

    // Calculate Relevance Score
    let score = 0;

    // Exact full string match in name
    if (name === qClean) score += 500;

    // All query tokens are in the exercise name itself
    const allInName = tokens.every(token => name.includes(token));
    if (allInName) score += 300;

    // Substring match in name
    if (name.includes(qClean)) score += 200;

    // Name starts with the query or first query token
    if (name.startsWith(qClean)) score += 150;
    else if (tokens.length > 0 && name.startsWith(tokens[0])) score += 50;

    // Word boundary matches in name
    tokens.forEach(token => {
      if (cachedWords.includes(token)) score += 40;
    });

    // Equipment match bonus
    if (tokens.some(t => equipment.includes(t))) score += 30;

    // Target muscle match bonus
    if (tokens.some(t => target.includes(t) || bodyPart.includes(t))) score += 20;

    scored.push({ ex, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(x => x.ex);
};
