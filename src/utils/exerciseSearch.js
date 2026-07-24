let cachedExercisesData = null;

export const loadExercisesData = async () => {
  if (cachedExercisesData) return cachedExercisesData;
  try {
    const module = await import('../lib/exercises.json');
    cachedExercisesData = module.default || module;
    return cachedExercisesData;
  } catch (err) {
    console.error('Failed to load exercise dataset:', err);
    return [];
  }
};

export const getCachedExercises = () => cachedExercisesData || [];

export const isFuzzyMatch = (str1, str2) => {
  if (!str1 || !str2) return false;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (Math.abs(s1.length - s2.length) > 2) return false;
  let dist = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] !== s2[i]) dist++;
  }
  return dist <= 2 && s1.length >= 4;
};

export const searchAndRankExercises = (query, dataset) => {
  const activeDataset = dataset || cachedExercisesData || [];
  if (!query || !query.trim() || !activeDataset.length) return [];
  
  const qClean = query.toLowerCase().trim();
  const tokens = qClean.split(/\s+/).filter(Boolean);

  const scored = [];

  for (let i = 0; i < activeDataset.length; i++) {
    const ex = activeDataset[i];
    const name = (ex.name || '').toLowerCase();
    const bodyPart = (ex.body_part || '').toLowerCase();
    const target = (ex.target || '').toLowerCase();
    const equipment = (ex.equipment || '').toLowerCase();
    const category = (ex.category || '').toLowerCase();
    const instructions = (ex.instructions || '').toLowerCase();

    const fullText = `${name} ${bodyPart} ${target} ${equipment} ${category} ${instructions}`;

    let cachedWords = null;

    // Every query token must match somewhere in fullText or fuzzy match
    const allTokensMatch = tokens.every(token => {
      if (fullText.includes(token)) return true;
      if (!cachedWords) {
        cachedWords = fullText.split(/[\s\-_,()]+/);
      }
      return cachedWords.some(w => isFuzzyMatch(token, w));
    });

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
    if (!cachedWords) {
      cachedWords = fullText.split(/[\s\-_,()]+/);
    }
    tokens.forEach(token => {
      if (cachedWords.includes(token)) score += 40;
    });

    // Equipment match bonus (e.g., equipment === 'dumbbell')
    if (tokens.some(t => equipment.includes(t))) score += 30;

    // Target muscle match bonus
    if (tokens.some(t => target.includes(t) || bodyPart.includes(t))) score += 20;

    scored.push({ ex, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(x => x.ex);
};
