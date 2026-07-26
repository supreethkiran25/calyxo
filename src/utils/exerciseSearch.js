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

  let aliases = '';
  if (bodyPart.includes('chest') || target.includes('chest') || target.includes('pectoralis') || name.includes('bench') || name.includes('dip') || name.includes('fly')) {
    aliases += ' pec pecs chest chestday push fly press dip';
  }
  if (bodyPart.includes('arms') || target.includes('biceps') || target.includes('brachialis') || name.includes('curl')) {
    aliases += ' bicep biceps arm arms pull curl';
  }
  if (bodyPart.includes('arms') || target.includes('triceps') || name.includes('extension') || name.includes('pushdown')) {
    aliases += ' tricep triceps arm arms push skullcrusher';
  }
  if (bodyPart.includes('back') || target.includes('latissimus') || target.includes('trapezius') || target.includes('rhomboids') || name.includes('row') || name.includes('pull')) {
    aliases += ' back lats lat trap traps pull row pulldown pullup';
  }
  if (bodyPart.includes('shoulders') || target.includes('deltoids') || target.includes('shoulder') || name.includes('press') || name.includes('raise')) {
    aliases += ' shoulder shoulders delt delts press overhead lateral';
  }
  if (bodyPart.includes('legs') || target.includes('quadriceps') || target.includes('hamstrings') || target.includes('glutes') || target.includes('calves') || name.includes('squat') || name.includes('lunge')) {
    aliases += ' leg legs quad quads glute glutes hamstring hamstrings calf calves squat lunge legpress';
  }
  if (bodyPart.includes('waist') || target.includes('abs') || target.includes('abdominals') || name.includes('crunch') || name.includes('plank')) {
    aliases += ' abs ab core stomach waist crunch plank';
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

    // Target muscle or body part match bonus
    if (tokens.some(t => target.includes(t) || bodyPart.includes(t))) score += 50;

    scored.push({ ex, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(x => x.ex);
};

export const getExerciseImage = (item) => {
  if (!item) return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80';

  if (item.gif_url && typeof item.gif_url === 'string' && item.gif_url.trim().length > 0) return item.gif_url;
  if (item.image && typeof item.image === 'string' && item.image.trim().length > 0) return item.image;

  if (item.id) {
    const cleanId = String(item.id).padStart(4, '0');
    return `https://v2.exercisedb.io/image/${cleanId}`;
  }

  const name = (item.name || item.alt || '').toLowerCase();
  const target = (item.target || item.body_part || item.muscleGroup || '').toLowerCase();

  if (name.includes('incline') && name.includes('barbell'))
    return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80';
  if (name.includes('incline') && name.includes('dumbbell'))
    return 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80';
  if (name.includes('fly') || name.includes('pec'))
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80';
  if (name.includes('close grip') || name.includes('dip'))
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80';
  if (name.includes('reverse'))
    return 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400&auto=format&fit=crop&q=80';
  if (name.includes('squat'))
    return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80';
  if (name.includes('deadlift'))
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80';
  if (name.includes('pull') || name.includes('row') || name.includes('lat'))
    return 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=80';
  if (name.includes('curl') || name.includes('bicep'))
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80';
  if (name.includes('shoulder') || name.includes('press') || name.includes('delt'))
    return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80';

  if (target.includes('chest') || target.includes('pec')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80';
  if (target.includes('back') || target.includes('lat')) return 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=80';
  if (target.includes('leg') || target.includes('quad') || target.includes('glute')) return 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=400&auto=format&fit=crop&q=80';
  if (target.includes('arm') || target.includes('bicep') || target.includes('tricep')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80';
  if (target.includes('shoulder') || target.includes('delt')) return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80';

  return getDistinctFallback(name || target || 'exercise');
};

export const getDistinctFallback = (nameStr) => {
  const photos = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&auto=format&fit=crop&q=80'
  ];
  let hash = 0;
  for (let i = 0; i < (nameStr || '').length; i++) {
    hash = (nameStr.charCodeAt(i) + (hash << 5) - hash);
  }
  const idx = Math.abs(hash) % photos.length;
  return photos[idx];
};
