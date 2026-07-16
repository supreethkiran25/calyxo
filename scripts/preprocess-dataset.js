const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'exercises-dataset-source');
const DATA_FILE = path.join(SOURCE_DIR, 'data', 'exercises.json');

const DEST_DIR = path.join(__dirname, '..', 'public', 'exercises');
const DEST_IMAGES_DIR = path.join(DEST_DIR, 'images');
const DEST_GIFS_DIR = path.join(DEST_DIR, 'gifs');
const OUTPUT_JSON_FILE = path.join(__dirname, '..', 'src', 'lib', 'exercises.json');

function preprocess() {
  console.log("=== STARTING DATASET PREPROCESSING ===");

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Source dataset file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  // Create destination directories if they don't exist
  fs.mkdirSync(DEST_IMAGES_DIR, { recursive: true });
  fs.mkdirSync(DEST_GIFS_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT_JSON_FILE), { recursive: true });

  console.log("Reading source JSON...");
  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const sourceExercises = JSON.parse(rawData);

  console.log(`Loaded ${sourceExercises.length} exercises from source.`);
  const optimizedExercises = [];

  let copiedImages = 0;
  let copiedGifs = 0;

  for (const ex of sourceExercises) {
    const imgFilename = path.basename(ex.image);
    const gifFilename = path.basename(ex.gif_url);

    const srcImgPath = path.join(SOURCE_DIR, 'images', imgFilename);
    const destImgPath = path.join(DEST_IMAGES_DIR, imgFilename);

    const srcGifPath = path.join(SOURCE_DIR, 'videos', gifFilename);
    const destGifPath = path.join(DEST_GIFS_DIR, gifFilename);

    // Copy image if exists
    if (fs.existsSync(srcImgPath)) {
      fs.copyFileSync(srcImgPath, destImgPath);
      copiedImages++;
    } else {
      console.warn(`Warning: Image not found: ${srcImgPath}`);
    }

    // Copy GIF if exists
    if (fs.existsSync(srcGifPath)) {
      fs.copyFileSync(srcGifPath, destGifPath);
      copiedGifs++;
    } else {
      console.warn(`Warning: GIF not found: ${srcGifPath}`);
    }

    // Derive difficulty based on categories, targets, or body weight
    let difficulty = 'beginner';
    const equip = (ex.equipment || '').toLowerCase();
    const name = (ex.name || '').toLowerCase();
    if (equip.includes('barbell') || equip.includes('cable') || name.includes('weighted') || name.includes('advanced')) {
      difficulty = 'intermediate';
    }
    if (name.includes('one-arm') || name.includes('single-leg') || name.includes('handstand') || name.includes('muscle-up')) {
      difficulty = 'advanced';
    }

    // Estimate calories burned per minute (arbitrary scale for metrics page)
    let caloriesEstimate = 6; // default cardio/general
    const target = (ex.target || '').toLowerCase();
    if (target.includes('glutes') || target.includes('quads') || target.includes('hamstrings')) {
      caloriesEstimate = 8; // lower body burns more
    } else if (target.includes('cardio')) {
      caloriesEstimate = 10; // cardio burns most
    } else if (target.includes('abs') || target.includes('forearms')) {
      caloriesEstimate = 4; // isolated core/arms
    }

    // Optimize fields: keep only English instructions/steps, and reference local public folder URLs
    optimizedExercises.push({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      body_part: ex.body_part,
      equipment: ex.equipment,
      instructions: ex.instructions.en || '',
      instruction_steps: ex.instruction_steps.en || [],
      muscle_group: ex.muscle_group,
      secondary_muscles: ex.secondary_muscles,
      target: ex.target,
      difficulty,
      caloriesEstimate,
      image: `/exercises/images/${imgFilename}`,
      gif_url: `/exercises/gifs/${gifFilename}`
    });
  }

  console.log(`Copied ${copiedImages} images.`);
  console.log(`Copied ${copiedGifs} GIFs.`);

  console.log("Writing optimized JSON...");
  fs.writeFileSync(OUTPUT_JSON_FILE, JSON.stringify(optimizedExercises, null, 2), 'utf8');
  console.log(`Successfully wrote optimized dataset of ${optimizedExercises.length} records to ${OUTPUT_JSON_FILE}`);
  console.log("=== PREPROCESSING COMPLETE ===");
}

preprocess();
