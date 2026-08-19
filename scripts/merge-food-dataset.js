import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BASE_DIR = path.join(__dirname, '..');
const JSON_FILE_PATH = path.join(BASE_DIR, 'src', 'lib', 'calyxo10kFoods.json');
const CALYXO_DB_PATH = path.join(BASE_DIR, 'src', 'lib', 'calyxoFoodDatabase.js');
const BACKUP_DIR = path.join(BASE_DIR, 'src', 'lib', 'backups');
const NEW_CSV_PATH = 'C:/Users/ASUS/Downloads/dataset2/indian_food_nutrition_calories - Sheet1.csv';

function runMerge() {
  console.log('====================================================');
  console.log('   CALYXO FOOD DATABASE MERGE & VALIDATION SCRIPT  ');
  console.log('====================================================\n');

  // STEP 1: Backup Existing Datasets
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonBackupPath = path.join(BACKUP_DIR, `calyxo10kFoods.backup.${timestamp}.json`);
  const jsonBackupLatest = path.join(BACKUP_DIR, `calyxo10kFoods.backup.json`);
  const dbBackupPath = path.join(BACKUP_DIR, `calyxoFoodDatabase.backup.${timestamp}.js`);
  const dbBackupLatest = path.join(BACKUP_DIR, `calyxoFoodDatabase.backup.js`);

  fs.copyFileSync(JSON_FILE_PATH, jsonBackupPath);
  fs.copyFileSync(JSON_FILE_PATH, jsonBackupLatest);
  fs.copyFileSync(CALYXO_DB_PATH, dbBackupPath);
  fs.copyFileSync(CALYXO_DB_PATH, dbBackupLatest);

  console.log(`[✓] STEP 1: Backups created successfully in:`);
  console.log(`    - ${jsonBackupLatest}`);
  console.log(`    - ${dbBackupLatest}\n`);

  // STEP 2: Read & Parse Existing Datasets
  const existing10k = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));

  const calyxoDbCode = fs.readFileSync(CALYXO_DB_PATH, 'utf8');
  
  // Extract HAND_CURATED_FOODS using regex parse
  const handCuratedMatch = calyxoDbCode.match(/export const HAND_CURATED_FOODS = (\[[\s\S]*?\]);/);
  let handCurated = [];
  if (handCuratedMatch) {
    try {
      // Parse using Function constructor safely
      handCurated = new Function(`return ${handCuratedMatch[1]}`)();
    } catch (e) {
      console.error('Error evaluating HAND_CURATED_FOODS', e);
    }
  }

  const totalBeforeMerge = handCurated.length + existing10k.length;
  console.log(`[✓] STEP 2: Loaded existing datasets:`);
  console.log(`    - Hand-curated foods: ${handCurated.length}`);
  console.log(`    - 10k dataset foods:  ${existing10k.length}`);
  console.log(`    - Total records before merge: ${totalBeforeMerge}\n`);

  // STEP 3: Parse New CSV Dataset
  const csvContent = fs.readFileSync(NEW_CSV_PATH, 'utf8');
  const csvLines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);

  function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  let malformedCsvRecords = 0;
  const newCsvRecords = [];
  for (let i = 1; i < csvLines.length; i++) {
    const parts = parseCsvLine(csvLines[i]);
    if (parts.length >= 16) {
      newCsvRecords.push({
        foodItem: parts[0],
        category: parts[1],
        caloriesPer100g: Number(parts[2]),
        proteinG: Number(parts[3]),
        fatG: Number(parts[4]),
        carbsG: Number(parts[5]),
        fiberG: Number(parts[6]),
        sugarG: Number(parts[7]),
        sodiumMg: Number(parts[8]),
        potassiumMg: Number(parts[9]),
        vitaminCMg: Number(parts[10]),
        calciumMg: Number(parts[11]),
        ironMg: Number(parts[12]),
        spiceLevel: parts[13],
        cookingMethod: parts[14],
        region: parts[15]
      });
    } else {
      malformedCsvRecords++;
    }
  }

  console.log(`[✓] STEP 3: Loaded new CSV dataset:`);
  console.log(`    - Parsed records: ${newCsvRecords.length}`);
  console.log(`    - Malformed records in CSV: ${malformedCsvRecords}\n`);

  // STEP 4: Normalization & Canonical Mapping
  function normalize(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/é/g, 'e')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  const ALIAS_CANONICAL_MAP = {
    'chapathi': 'chapati',
    'chappati': 'chapati',
    'phulka': 'roti',
    'fulka': 'roti',
    'rotli': 'roti',
    'dosai': 'dosa',
    'idly': 'idli',
    'nan': 'naan',
    'chow mein': 'chowmein',
    'schezwan fried rice': 'schezwan rice',
    'momo': 'momos'
  };

  function getCanonicalName(rawName) {
    let norm = normalize(rawName);
    if (ALIAS_CANONICAL_MAP[norm]) {
      norm = ALIAS_CANONICAL_MAP[norm];
    }
    return norm;
  }

  function normalizeMethod(method) {
    let m = normalize(method);
    if (!m) return '';
    const map = {
      'grill': 'grilled',
      'steam': 'steamed',
      'boil': 'boiled',
      'roast': 'roasted',
      'saute': 'sauteed',
      'sauteed': 'sauteed',
      'deep fry': 'deepfried',
      'deepfried': 'deepfried',
      'pan fry': 'panfried',
      'panfried': 'panfried',
      'pan cook': 'pancooked',
      'pancooked': 'pancooked',
      'pressure cook': 'pressurecooked',
      'pressurecooked': 'pressurecooked',
      'slow cook': 'slowcooked',
      'slowcooked': 'slowcooked',
      'simmer': 'simmered',
      'chill': 'chilled',
      'mix': 'mixed',
      'wrap': 'wrapped',
      'ferment': 'fermented',
      'bake': 'baked',
      'shallow fry': 'shallowfried',
      'shallowfried': 'shallowfried',
      'tandoor': 'tandoori'
    };
    return map[m] || m;
  }

  // Index existing records
  const nameAndMethodIndex = new Map();
  const nameOnlyIndex = new Map();

  existing10k.forEach(item => {
    const canonName = getCanonicalName(item.name);
    const normMethod = normalizeMethod(item.cookingMethod);
    if (normMethod) {
      const keyNM = `${canonName}|${normMethod}`;
      if (!nameAndMethodIndex.has(keyNM)) nameAndMethodIndex.set(keyNM, []);
      nameAndMethodIndex.get(keyNM).push(item);
    }
    if (!nameOnlyIndex.has(canonName)) nameOnlyIndex.set(canonName, []);
    nameOnlyIndex.get(canonName).push(item);
  });

  handCurated.forEach(item => {
    const canonName = getCanonicalName(item.name);
    if (!nameOnlyIndex.has(canonName)) nameOnlyIndex.set(canonName, []);
    nameOnlyIndex.get(canonName).push(item);

    if (item.aliases && Array.isArray(item.aliases)) {
      item.aliases.forEach(alias => {
        const canonAlias = getCanonicalName(alias);
        if (!nameOnlyIndex.has(canonAlias)) nameOnlyIndex.set(canonAlias, []);
        nameOnlyIndex.get(canonAlias).push(item);
      });
    }
  });

  // STEP 5: Merge Overlaps & Collect Genuinely New Foods
  let duplicatesDetected = 0;
  let duplicatesRemoved = 0;
  let recordsAdded = 0;
  const newRecordsToAdd = [];

  let maxId = existing10k.reduce((max, item) => (item.id > max ? item.id : max), 0);
  if (maxId < 10000) maxId = 10000;

  newCsvRecords.forEach(csvRec => {
    const canonName = getCanonicalName(csvRec.foodItem);
    const normMethod = normalizeMethod(csvRec.cookingMethod);
    const keyNM = normMethod ? `${canonName}|${normMethod}` : canonName;

    let match = nameAndMethodIndex.has(keyNM) ? nameAndMethodIndex.get(keyNM)[0] : null;
    if (!match && nameOnlyIndex.has(canonName)) {
      match = nameOnlyIndex.get(canonName)[0];
    }

    if (match) {
      duplicatesDetected++;
      duplicatesRemoved++; // We avoid creating duplicate record

      // Enrich matching existing record with rich micronutrient data if missing/incomplete
      if (csvRec.potassiumMg !== undefined) match.potassiumMg = csvRec.potassiumMg;
      if (csvRec.vitaminCMg !== undefined) match.vitaminCMg = csvRec.vitaminCMg;
      if (csvRec.calciumMg !== undefined) match.calciumMg = csvRec.calciumMg;
      if (csvRec.ironMg !== undefined) match.ironMg = csvRec.ironMg;
      if (csvRec.spiceLevel) match.spiceLevel = csvRec.spiceLevel;
      if (!match.region && csvRec.region) match.region = csvRec.region;

      if (!match.aliases) match.aliases = [];
      const newAlias = csvRec.foodItem.toLowerCase();
      if (!match.aliases.includes(newAlias)) {
        match.aliases.push(newAlias);
      }
    } else {
      maxId++;
      recordsAdded++;

      let dietTag = 'Balanced';
      if (csvRec.category === 'Veg' || csvRec.category === 'Lentils' || csvRec.category === 'Bread') {
        dietTag = csvRec.proteinG >= 10 ? 'High-Protein Veg' : 'Vegetarian';
      } else if (csvRec.category === 'Non-Veg') {
        dietTag = 'High-Protein Non-Veg';
      } else if (csvRec.category === 'Snacks') {
        dietTag = 'Snack';
      } else if (csvRec.category === 'Dessert') {
        dietTag = 'Dessert';
      }

      let mealType = 'Lunch/Dinner';
      if (csvRec.category === 'Breakfast' || csvRec.foodItem.toLowerCase().includes('poha') || csvRec.foodItem.toLowerCase().includes('upma')) {
        mealType = 'Breakfast';
      } else if (csvRec.category === 'Snacks' || csvRec.category === 'Bread') {
        mealType = 'Snack';
      } else if (csvRec.category === 'Dessert') {
        mealType = 'Dessert';
      }

      const servingGrams = 100;
      const cals100 = csvRec.caloriesPer100g;

      const newFoodItem = {
        id: maxId,
        name: csvRec.foodItem,
        displayName: `${csvRec.foodItem} (${csvRec.cookingMethod})`,
        category: `${csvRec.region} ${csvRec.category}`,
        region: csvRec.region,
        cookingMethod: csvRec.cookingMethod,
        mealType: mealType,
        servingSize: `100g (1 serving)`,
        pieceWeight: servingGrams,
        calories: cals100,
        protein: csvRec.proteinG,
        carbs: csvRec.carbsG,
        fat: csvRec.fatG,
        fiber: csvRec.fiberG,
        sugar: csvRec.sugarG,
        sodium: csvRec.sodiumMg,
        calsPer100g: cals100,
        protPer100g: csvRec.proteinG,
        carbsPer100g: csvRec.carbsG,
        fatPer100g: csvRec.fatG,
        potassiumMg: csvRec.potassiumMg,
        vitaminCMg: csvRec.vitaminCMg,
        calciumMg: csvRec.calciumMg,
        ironMg: csvRec.ironMg,
        spiceLevel: csvRec.spiceLevel,
        dietTag: dietTag,
        aliases: [
          csvRec.foodItem.toLowerCase(),
          `${csvRec.foodItem.toLowerCase()} ${csvRec.cookingMethod.toLowerCase()}`,
          `${csvRec.region.toLowerCase()} ${csvRec.foodItem.toLowerCase()}`
        ]
      };

      newRecordsToAdd.push(newFoodItem);
    }
  });

  const updated10kDataset = [...existing10k, ...newRecordsToAdd];
  const finalRecordCount = handCurated.length + updated10kDataset.length;

  console.log(`[✓] STEP 5: Merged datasets:`);
  console.log(`    - Duplicates detected: ${duplicatesDetected}`);
  console.log(`    - Duplicate records prevented: ${duplicatesRemoved}`);
  console.log(`    - Genuinely new foods added: ${recordsAdded}`);
  console.log(`    - Final combined record count: ${finalRecordCount}\n`);

  // STEP 6: Write Updated JSON File
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(updated10kDataset, null, 2), 'utf8');
  console.log(`[✓] STEP 6: Saved updated dataset to ${JSON_FILE_PATH}\n`);

  // STEP 7: Validation Checks
  console.log('====================================================');
  console.log('                 VALIDATION REPORT                  ');
  console.log('====================================================');

  let missingMacrosCount = 0;
  let malformedCount = 0;

  const normalizedNameSet = new Set();
  let normalizedDuplicatesCount = 0;

  [...handCurated, ...updated10kDataset].forEach(item => {
    if (!item.name || isNaN(item.calories) || isNaN(item.protein) || isNaN(item.carbs) || isNaN(item.fat)) {
      missingMacrosCount++;
    }
    if (!item.name || !item.category || typeof item.calories !== 'number') {
      malformedCount++;
    }

    const normKey = `${getCanonicalName(item.name)}|${normalizeMethod(item.cookingMethod)}`;
    if (normalizedNameSet.has(normKey)) {
      normalizedDuplicatesCount++;
    } else {
      normalizedNameSet.add(normKey);
    }
  });

  console.log(`- Total records before merge:    ${totalBeforeMerge}`);
  console.log(`- Records added:                 ${recordsAdded}`);
  console.log(`- Duplicates detected:           ${duplicatesDetected}`);
  console.log(`- Duplicates removed/prevented:  ${duplicatesRemoved}`);
  console.log(`- Final record count:            ${finalRecordCount}`);
  console.log(`- Records missing calories/macros: ${missingMacrosCount}`);
  console.log(`- Malformed records:             ${malformedCount}`);
  console.log('====================================================\n');

  console.log('[✓] MERGE & VALIDATION COMPLETED SUCCESSFULLY!');
}

runMerge();
