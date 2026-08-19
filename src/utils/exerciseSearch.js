let cachedExercisesData = null;
let fetchPromise = null;

const normalizeWord = (w) => {
  if (!w) return '';
  let str = String(w).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (str.endsWith('ies')) str = str.slice(0, -3) + 'y';
  else if (str.endsWith('es') && str.length > 3) str = str.slice(0, -2);
  else if (str.endsWith('s') && !str.endsWith('ss') && str.length > 3) str = str.slice(0, -1);
  return str;
};

const preprocessExercise = (ex) => {
  if (ex._searchStr) return ex;
  const name = (ex.name || '').toLowerCase();
  const bodyPart = (ex.body_part || '').toLowerCase();
  const target = (ex.target || '').toLowerCase();
  const equipment = (ex.equipment || '').toLowerCase();
  const category = (ex.category || '').toLowerCase();
  const instructions = (ex.instructions || '').toLowerCase();

  let aliases = '';
  if (bodyPart.includes('chest') || target.includes('chest') || target.includes('pectoralis') || name.includes('bench') || name.includes('dip') || name.includes('fly')) {
    aliases += ' pec pecs chest chestday push fly press dip dips';
  }
  if (bodyPart.includes('arms') || target.includes('biceps') || target.includes('brachialis') || name.includes('curl')) {
    aliases += ' bicep biceps arm arms pull curl curls';
  }
  if (bodyPart.includes('arms') || target.includes('triceps') || name.includes('extension') || name.includes('pushdown')) {
    aliases += ' tricep triceps arm arms push skullcrusher skullcrushers';
  }
  if (bodyPart.includes('back') || target.includes('latissimus') || target.includes('trapezius') || target.includes('rhomboids') || name.includes('row') || name.includes('pull')) {
    aliases += ' back lats lat trap traps pull row rows pulldown pullup pullups';
  }
  if (bodyPart.includes('shoulders') || target.includes('deltoids') || target.includes('shoulder') || name.includes('press') || name.includes('raise')) {
    aliases += ' shoulder shoulders delt delts press presses overhead lateral raises';
  }
  if (bodyPart.includes('legs') || target.includes('quadriceps') || target.includes('hamstrings') || target.includes('glutes') || target.includes('calves') || name.includes('squat') || name.includes('lunge')) {
    aliases += ' leg legs quad quads glute glutes hamstring hamstrings calf calves squat squats lunge lunges legpress';
  }
  if (bodyPart.includes('waist') || target.includes('abs') || target.includes('abdominals') || name.includes('crunch') || name.includes('plank')) {
    aliases += ' abs ab core stomach waist crunch crunches plank planks';
  }

  const fullText = `${name} ${bodyPart} ${target} ${equipment} ${category} ${aliases} ${instructions}`;
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

// Immediately kick off preload in browser
if (typeof window !== 'undefined') {
  loadExercisesData();
}

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
  const rawTokens = qClean.split(/\s+/).filter(Boolean);
  const normTokens = rawTokens.map(normalizeWord).filter(Boolean);

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

    let matchedCount = 0;
    rawTokens.forEach((token, idx) => {
      const norm = normTokens[idx] || normalizeWord(token);
      if (fullText.includes(token) || (norm && fullText.includes(norm))) {
        matchedCount++;
      }
    });

    if (matchedCount === 0) continue;

    let score = matchedCount * 40;

    // Exact full string match in name
    if (name === qClean) score += 500;

    // All query tokens are in exercise name
    const allInName = rawTokens.every((token, idx) => {
      const norm = normTokens[idx];
      return name.includes(token) || (norm && name.includes(norm));
    });
    if (allInName) score += 300;

    // Substring match in name
    if (name.includes(qClean)) score += 200;

    // Name starts with the query
    if (name.startsWith(qClean)) score += 150;

    // Target or body part match
    if (rawTokens.some(t => target.includes(t) || bodyPart.includes(t))) score += 50;

    scored.push({ ex, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(x => x.ex);
};

export const getExerciseImage = (item) => {
  if (!item) return null;

  // 1. Direct gif_url or image on item object (if not an unsplash url)
  if (item.gif_url && typeof item.gif_url === 'string' && item.gif_url.trim().length > 0 && !item.gif_url.includes('unsplash.com')) return item.gif_url;
  if (item.image && typeof item.image === 'string' && item.image.trim().length > 0 && !item.image.includes('unsplash.com')) return item.image;

  const dataset = getCachedExercises();
  const rawName = typeof item === 'string' ? item : (item.name || item.alt || item.title || '');
  const cleanName = rawName.toLowerCase().trim();

  // 2. Direct ID lookup in dataset
  if (item.id && dataset && dataset.length) {
    const cleanId = String(item.id).padStart(4, '0');
    const idMatch = dataset.find(x => String(x.id).padStart(4, '0') === cleanId);
    if (idMatch) {
      if (idMatch.gif_url && typeof idMatch.gif_url === 'string') return idMatch.gif_url;
      if (idMatch.image && typeof idMatch.image === 'string') return idMatch.image;
    }
  }

  // 3. Dynamic lookup in loaded dataset by name / fuzzy match
  if (cleanName && dataset && dataset.length) {
    // Exact or direct substring match
    const directMatch = dataset.find(x => (x.name || '').toLowerCase().trim() === cleanName) ||
                        dataset.find(x => (x.name || '').toLowerCase().includes(cleanName) || cleanName.includes((x.name || '').toLowerCase()));
    if (directMatch) {
      if (directMatch.gif_url && typeof directMatch.gif_url === 'string') return directMatch.gif_url;
      if (directMatch.image && typeof directMatch.image === 'string') return directMatch.image;
    }

    // Tokenized fuzzy match
    const ranked = searchAndRankExercises(cleanName, dataset);
    if (ranked && ranked.length > 0) {
      const topMatch = ranked[0];
      if (topMatch.gif_url && typeof topMatch.gif_url === 'string') return topMatch.gif_url;
      if (topMatch.image && typeof topMatch.image === 'string') return topMatch.image;
    }
  }

  return null;
};

export const getDistinctFallback = (nameStr) => {
  return null;
};
