import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = 'C:/Users/ASUS/Downloads/calyxo_food_dataset_10k.csv';
const jsonOutputPath = path.join(__dirname, 'calyxo10kFoods.json');

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim());

const dataset = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const parts = line.split(',');
  if (parts.length >= 19) {
    const id = Number(parts[0]) || i;
    const name = parts[1].trim();
    const region = parts[2].trim();
    const category = parts[3].trim();
    const cookingMethod = parts[4].trim();
    const mealType = parts[5].trim();
    const servingGrams = Number(parts[6]) || 100;
    const calories = Number(parts[7]) || 0;
    const protein = Number(parts[8]) || 0;
    const carbs = Number(parts[9]) || 0;
    const fat = Number(parts[10]) || 0;
    const fiber = Number(parts[11]) || 0;
    const sugar = Number(parts[12]) || 0;
    const sodium = Number(parts[13]) || 0;
    const calsPer100g = Number(parts[14]) || 0;
    const protPer100g = Number(parts[15]) || 0;
    const carbsPer100g = Number(parts[16]) || 0;
    const fatPer100g = Number(parts[17]) || 0;
    const dietTag = parts[18].trim();

    dataset.push({
      id: id,
      name: name,
      displayName: `${name} (${cookingMethod})`,
      category: `${region} ${category}`,
      region: region,
      cookingMethod: cookingMethod,
      mealType: mealType,
      servingSize: `${servingGrams}g (${mealType})`,
      pieceWeight: servingGrams,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fiber: fiber,
      sugar: sugar,
      sodium: sodium,
      calsPer100g: calsPer100g,
      protPer100g: protPer100g,
      carbsPer100g: carbsPer100g,
      fatPer100g: fatPer100g,
      dietTag: dietTag,
      aliases: [name.toLowerCase(), `${name.toLowerCase()} ${cookingMethod.toLowerCase()}`, `${region.toLowerCase()} ${name.toLowerCase()}`]
    });
  }
}

console.log('Successfully parsed dataset count:', dataset.length);
fs.writeFileSync(jsonOutputPath, JSON.stringify(dataset));
const sizeMb = (fs.statSync(jsonOutputPath).size / (1024 * 1024)).toFixed(2);
console.log(`Saved ${jsonOutputPath}. File size: ${sizeMb} MB`);
