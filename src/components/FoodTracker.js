"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getFoodLogs, addFoodLog, deleteFoodLog, saveEcosystemState, fetchWithRetry, saveUserProfile } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { INDIAN_FOODS } from '../lib/indianFoods';
import { Plus, Search, BookOpen, Trash2, Camera, Sparkles, Check, X, ShieldAlert, ShoppingBag, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock DB suited recipes fallback
const FOODS_CATALOG = [
  { name: "Scrambled Eggs (2 large)", calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, sugar: 0, sodium: 180 },
  { name: "Oatmeal (cooked, 1 cup)", calories: 150, protein: 6, carbs: 27, fat: 3, fiber: 4, sugar: 1, sodium: 2 },
  { name: "Grilled Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  { name: "Brown Rice (cooked, 1 cup)", calories: 215, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.5, sodium: 5 },
  { name: "Greek Yogurt (non-fat, 1 cup)", calories: 130, protein: 24, carbs: 9, fat: 0, fiber: 0, sugar: 9, sodium: 85 },
  { name: "Whey Protein Shake (1 scoop)", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, sugar: 1, sodium: 50 },
  { name: "Whole Wheat Roti (1 piece)", calories: 85, protein: 3, carbs: 18, fat: 0.5, fiber: 2, sugar: 0, sodium: 1 },
  { name: "Paneer Tikka (100g)", calories: 280, protein: 18, carbs: 4, fat: 22, fiber: 0.5, sugar: 1, sodium: 450 },
  { name: "Mixed Green Salad (no dressing)", calories: 15, protein: 1, carbs: 3, fat: 0.2, fiber: 1.2, sugar: 1.5, sodium: 10 },
  { name: "Almonds (1 oz / 28g)", calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1, sodium: 0 }
];

const INITIAL_DIET_PLANNER = [
  {
    dayName: "Monday",
    diet: [
      { category: "Breakfast", name: "Banana Protein Oats", desc: "Oats with whey protein, chia seeds, and half sliced banana", calories: 380, protein: 32, carbs: 48, fat: 6 },
      { category: "Lunch", name: "Chicken Quinoa Bowl", desc: "Grilled chicken, white quinoa, and steamed broccoli drizzled with olive oil", calories: 450, protein: 42, carbs: 36, fat: 14 },
      { category: "Dinner", name: "Baked Salmon & Greens", desc: "Salmon fillet with asparagus, spinach salad, and sweet potato", calories: 420, protein: 36, carbs: 28, fat: 18 }
    ]
  },
  {
    dayName: "Tuesday",
    diet: [
      { category: "Breakfast", name: "Egg White Veggie Omelet", desc: "Omelet made with egg whites, spinach, bell peppers, toast", calories: 290, protein: 24, carbs: 24, fat: 8 },
      { category: "Lunch", name: "Paneer Wrap", desc: "Low-fat paneer sautéed with peppers, rolled in a whole wheat wrap", calories: 410, protein: 20, carbs: 42, fat: 16 },
      { category: "Dinner", name: "Lean Turkey Stir-fry", desc: "Ground turkey cooked with green beans, mushrooms, and brown rice", calories: 460, protein: 38, carbs: 45, fat: 10 }
    ]
  },
  {
    dayName: "Wednesday",
    diet: [
      { category: "Breakfast", name: "Greek Yogurt Parfait", desc: "Plain non-fat yogurt topped with mixed berries, honey, almonds", calories: 280, protein: 26, carbs: 30, fat: 6 },
      { category: "Lunch", name: "Tuna Salad Salad", desc: "Canned tuna over mixed greens, cucumbers, tomatoes, lemon dressing", calories: 350, protein: 34, carbs: 12, fat: 16 },
      { category: "Dinner", name: "Lentil Soup & Tofu", desc: "Lentils stewed with carrots, served with baked tofu blocks", calories: 390, protein: 28, carbs: 48, fat: 8 }
    ]
  },
  {
    dayName: "Thursday",
    diet: [
      { category: "Breakfast", name: "Peanut Butter Toast", desc: "Ezekiel toast spread with organic peanut butter and hemp seeds", calories: 310, protein: 12, carbs: 28, fat: 16 },
      { category: "Lunch", name: "Chicken Salad Wrap", desc: "Shredded chicken breast mixed with light greek yogurt dressing in wrap", calories: 400, protein: 38, carbs: 32, fat: 12 },
      { category: "Dinner", name: "White Fish & Rice", desc: "Cod fish fillet baked with lemon pepper, served with jasmine rice and zucchini", calories: 360, protein: 32, carbs: 38, fat: 6 }
    ]
  },
  {
    dayName: "Friday",
    diet: [
      { category: "Breakfast", name: "Fruit & Protein Smoothie", desc: "Whey protein blended with spinach, frozen berries, almond milk", calories: 260, protein: 28, carbs: 22, fat: 4 },
      { category: "Lunch", name: "Hummus Veggie Plate", desc: "Hummus served with carrot sticks, cucumbers, falafel, whole wheat pita", calories: 430, protein: 16, carbs: 54, fat: 18 },
      { category: "Dinner", name: "Sirloin Steak & Potatoes", desc: "Lean sirloin steak with garlic mashed potatoes and sautéed mushrooms", calories: 510, protein: 44, carbs: 38, fat: 18 }
    ]
  },
  {
    dayName: "Saturday",
    diet: [
      { category: "Breakfast", name: "Protein Pancakes", desc: "Oat-based protein batter pancakes topped with fresh strawberries", calories: 340, protein: 25, carbs: 42, fat: 8 },
      { category: "Lunch", name: "Sautéed Shrimp Salad", desc: "Garlic shrimp tossed with romaine lettuce, avocados, tomatoes", calories: 380, protein: 32, carbs: 18, fat: 20 },
      { category: "Dinner", name: "Baked Chicken Meatballs", desc: "Chicken meatballs served over zucchini noodles and marinara sauce", calories: 350, protein: 36, carbs: 16, fat: 15 }
    ]
  },
  {
    dayName: "Sunday",
    diet: [
      { category: "Breakfast", name: "Avocado Egg Toast", desc: "Toast topped with mashed avocado, chili flakes, and two poached eggs", calories: 390, protein: 18, carbs: 26, fat: 22 },
      { category: "Lunch", name: "Vegetable Fried Rice", desc: "Fried brown rice with carrots, peas, egg, and firm tofu blocks", calories: 420, protein: 18, carbs: 56, fat: 12 },
      { category: "Dinner", name: "Diet Beef Burger", desc: "Lean beef patty on whole wheat bun with lettuce, tomatoes, low-fat cheese", calories: 480, protein: 38, carbs: 36, fat: 16 }
    ]
  }
];

export default function FoodTracker({ onNotification }) {
  const user = useStore(state => state.user);
  const foodLogs = useStore(state => state.foodLogs);
  const setFoodLogs = useStore(state => state.setFoodLogs);
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const deleteFoodLogStore = useStore(state => state.deleteFoodLog);
  const userProfile = useStore(state => state.userProfile);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  // Helper to check if a timestamp is today (12am to 12am)
  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todaysFoodLogs = foodLogs.filter(x => isToday(x.timestamp));

  const [activeSubTab, setActiveSubTab] = useState('diary');

  // Search & custom logging
  const [queryVal, setQueryVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Custom Food Form
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [cfName, setCfName] = useState('');
  const [cfCals, setCfCals] = useState('');
  const [cfProt, setCfProt] = useState('');
  const [cfCarb, setCfCarb] = useState('');
  const [cfFat, setCfFat] = useState('');
  const [cfFiber, setCfFiber] = useState('');
  const [cfSugar, setCfSugar] = useState('');
  const [cfSodium, setCfSodium] = useState('');

  const updateUserProfile = useStore(state => state.updateUserProfile);

  const toggleFavorite = async (e, food) => {
    e.stopPropagation();
    const favorites = Array.isArray(userProfile.favoriteFoods) ? userProfile.favoriteFoods : [];
    const isFav = favorites.some(x => x.name.toLowerCase() === food.name.toLowerCase());
    let nextFavorites = [];
    if (isFav) {
      nextFavorites = favorites.filter(x => x.name.toLowerCase() !== food.name.toLowerCase());
    } else {
      nextFavorites = [...favorites, {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0
      }];
    }
    const updated = { ...userProfile, favoriteFoods: nextFavorites };
    const prev = userProfile;
    updateUserProfile(updated);
    if (userId) {
      try {
        await saveUserProfile(userId, updated);
        if (onNotification) onNotification(isFav ? `Removed ${food.name} from favorites` : `Added ${food.name} to favorites ⭐`);
      } catch (err) {
        console.error("Toggle favorite save failed", err);
        updateUserProfile(prev); // Revert
        if (onNotification) onNotification("Failed to update favorites. Please try again.");
      }
    }
  };

  const recentFoods = useMemo(() => {
    const seen = new Set();
    const recents = [];
    for (const log of [...foodLogs]) {
      const key = log.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        recents.push(log);
        if (recents.length >= 6) break;
      }
    }
    return recents;
  }, [foodLogs]);

  // Log portion state
  const [analysedFood, setAnalysedFood] = useState(null);
  const [portion, setPortion] = useState(100);
  const [parsedPortion, setParsedPortion] = useState(null);

  // Meal Photo Scanner
  const [mealPhoto, setMealPhoto] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Weekly planner
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyPlanner, setWeeklyPlanner] = useState(INITIAL_DIET_PLANNER);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [editMealFields, setEditMealFields] = useState({ category: '', name: '', desc: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  // AI Planner subtab day
  const [activePlanDay, setActivePlanDay] = useState(0);

  // Grocery Compiler State
  const [generatingGrocery, setGeneratingGrocery] = useState(false);
  const [groceryList, setGroceryList] = useState(null);

  // Load food logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return;
      try {
        const logs = await getFoodLogs(userId);
        setFoodLogs(logs || []);
      } catch (err) {
        console.error("Fetch food logs failed", err);
        if (onNotification) onNotification("Failed to load food logs. Please reload.");
      }
    };
    fetchLogs();
  }, [userId, setFoodLogs, onNotification]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    if (val.trim().length < 2) {
      setSearchResults([]);
      setParsedPortion(null);
      return;
    }

    // 1. Portion/Weight parsing (e.g. "dosa 200g", "roti 50g")
    let parsedWeight = null;
    let cleanQuery = val;
    const weightRegex = /\b(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i;
    const match = cleanQuery.match(weightRegex);
    if (match) {
      parsedWeight = parseFloat(match[1]);
      cleanQuery = cleanQuery.replace(weightRegex, "").replace(/\s+/g, " ").trim();
    }
    setParsedPortion(parsedWeight);

    // 2. Search local Indian foods first using cleaned query
    const normalizedQuery = cleanQuery.toLowerCase();
    const indianMatches = INDIAN_FOODS.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
      const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
      const aliasMatch = item.aliases.some(alias => alias.toLowerCase().includes(normalizedQuery));
      return nameMatch || categoryMatch || aliasMatch;
    });

    // Search existing catalog
    const catalogMatches = FOODS_CATALOG.filter(x => x.name.toLowerCase().includes(normalizedQuery));
    
    // Combine and mark items from local database
    const localResults = [...indianMatches, ...catalogMatches].map(item => ({
      ...item,
      isLocal: true
    }));

    // 3. Attempt search OpenFoodFacts fallback proxy with cleaned query
    let apiResults = [];
    try {
      const response = await fetch(`/api/food?q=${encodeURIComponent(cleanQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const rawProducts = data.products || data.results || [];
        if (rawProducts.length > 0) {
          apiResults = rawProducts.map(r => ({
            name: r.product_name || r.name || r.product_name_en || "Unknown Food",
            calories: Math.round(r.calories || r.nutriments?.["energy-kcal_100g"] || r.nutriments?.energy_100g || 0),
            protein: Number(r.protein || r.nutriments?.proteins_100g || 0),
            carbs: Number(r.carbs || r.nutriments?.carbohydrates_100g || 0),
            fat: Number(r.fat || r.nutriments?.fat_100g || 0),
            fiber: Number(r.fiber || r.nutriments?.fiber_100g || 0),
            sugar: Number(r.sugar || r.nutriments?.sugars_100g || 0),
            sodium: Math.round(r.sodium || (r.nutriments?.sodium_100g * 1000) || 0)
          }));
        }
      }
    } catch (err) {
      console.warn("OpenFoodFacts search failure, defaulting to local index", err);
    }
    
    // 4. Merge results seamlessly (local first) and limit to 10
    const merged = [...localResults, ...apiResults];
    
    // Deduplicate items with identical names
    const seenNames = new Set();
    const uniqueMerged = [];
    for (const item of merged) {
      const key = item.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        uniqueMerged.push(item);
      }
    }

    setSearchResults(uniqueMerged.slice(0, 10));
    setShowDropdown(true);
  };

  // Debounce search catalog
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(queryVal);
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [queryVal]);

  const selectFood = (food) => {
    setAnalysedFood(food);
    if (parsedPortion) {
      setPortion(parsedPortion);
    } else {
      setPortion(100);
    }
    setQueryVal('');
    setShowDropdown(false);
  };

  const quickLogFood = async (e, food) => {
    e.stopPropagation();
    if (isNaN(activePortion) || activePortion <= 0 || activePortion > 5000) {
      if (onNotification) onNotification("Portion weight must be between 1 and 5000g.");
      return;
    }

    const ratio = activePortion / 100;
    const logItem = {
      name: food.name,
      calories: Math.round(food.calories * ratio),
      protein: Number((food.protein * ratio).toFixed(1)),
      carbs: Number((food.carbs * ratio).toFixed(1)),
      fat: Number((food.fat * ratio).toFixed(1)),
      fiber: Number(((food.fiber || 0) * ratio).toFixed(1)),
      sugar: Number(((food.sugar || 0) * ratio).toFixed(1)),
      portionWeight: activePortion
    };

    try {
      const saved = await addFoodLog(userId, logItem);
      addFoodLogStore(saved);
      setQueryVal('');
      setShowDropdown(false);
      if (onNotification) onNotification(`Logged ${activePortion}g ${logItem.name} 🍽️`);
    } catch (err) {
      console.error("Quick log food database write failure", err);
      if (onNotification) onNotification("Failed to save food log. Please try again.");
    }
  };

  const calculateMacrosRatings = (food) => {
    if (!food) return null;
    const calories = food.calories || 0;
    const protein = food.protein || 0;
    const carbs = food.carbs || 0;
    const fat = food.fat || 0;
    const fiber = food.fiber || 0;
    const sugar = food.sugar || 0;
    const sodium = food.sodium || 0;

    // Weight Loss Score (0 - 100)
    let wlScore = 100 - (calories / 4) + (protein * 2.5) + (fiber * 4) - (sugar * 1.5) - (fat * 1);
    wlScore = Math.max(10, Math.min(99, Math.round(wlScore)));

    // Muscle Gain Score (0 - 100)
    let mgScore = (protein * 5) + (calories / 6);
    mgScore = Math.max(10, Math.min(99, Math.round(mgScore)));

    // High Protein Rating
    let proteinRating = "Low Protein";
    if (protein >= 15) proteinRating = "High Protein";
    else if (protein >= 8) proteinRating = "Moderate Protein";

    // High Carb Rating
    let carbRating = "Low Carb";
    if (carbs >= 35) carbRating = "High Carb";
    else if (carbs >= 15) carbRating = "Moderate Carb";

    // Healthy Choice Indicator
    const isHealthyChoice = calories < 300 && sugar < 10 && sodium < 400 && (protein > 2 || fiber > 1.5);

    return {
      weightLossScore: wlScore,
      muscleGainScore: mgScore,
      proteinRating,
      carbRating,
      isHealthyChoice
    };
  };

  const logFoodItem = async () => {
    if (!analysedFood) return;
    if (isNaN(portion) || portion <= 0 || portion > 5000) {
      if (onNotification) onNotification("Portion weight must be between 1 and 5000g.");
      return;
    }
    const ratio = portion / 100;
    const logItem = {
      name: analysedFood.name,
      calories: Math.round(analysedFood.calories * ratio),
      protein: Number((analysedFood.protein * ratio).toFixed(1)),
      carbs: Number((analysedFood.carbs * ratio).toFixed(1)),
      fat: Number((analysedFood.fat * ratio).toFixed(1)),
      fiber: Number(((analysedFood.fiber || 0) * ratio).toFixed(1)),
      sugar: Number(((analysedFood.sugar || 0) * ratio).toFixed(1)),
      portionWeight: portion
    };

    try {
      const saved = await addFoodLog(userId, logItem);
      addFoodLogStore(saved);
      setAnalysedFood(null);
      if (onNotification) onNotification(`Logged ${logItem.name} to diary 🍽️`);
    } catch (err) {
      console.error("Log food item database write failure", err);
      if (onNotification) onNotification("Failed to save food log. Please try again.");
    }
  };

  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    
    // Bounds Validations
    if (!cfName.trim() || cfName.length > 50) {
      if (onNotification) onNotification("Food name must be between 1 and 50 characters.");
      return;
    }
    const cals = Number(cfCals);
    const prot = Number(cfProt);
    const carb = Number(cfCarb);
    const fat = Number(cfFat);
    const fiber = cfFiber ? Number(cfFiber) : 0;
    const sugar = cfSugar ? Number(cfSugar) : 0;
    const sodium = cfSodium ? Number(cfSodium) : 0;

    if (isNaN(cals) || cals < 1 || cals > 10000) {
      if (onNotification) onNotification("Calories must be between 1 and 10,000 kcal.");
      return;
    }
    if (isNaN(prot) || prot < 0 || prot > 500 || isNaN(carb) || carb < 0 || carb > 1000 || isNaN(fat) || fat < 0 || fat > 500) {
      if (onNotification) onNotification("Macros (Protein/Carbs/Fat) are out of valid range.");
      return;
    }
    if (isNaN(fiber) || fiber < 0 || fiber > 200 || isNaN(sugar) || sugar < 0 || sugar > 500 || isNaN(sodium) || sodium < 0 || sodium > 20000) {
      if (onNotification) onNotification("Micros (Fiber/Sugar/Sodium) are out of valid range.");
      return;
    }

    const logItem = {
      name: cfName.trim(),
      calories: cals,
      protein: prot,
      carbs: carb,
      fat: fat,
      fiber,
      sugar,
      sodium,
      portionWeight: 100
    };

    try {
      const saved = await addFoodLog(userId, logItem);
      addFoodLogStore(saved);
      
      // Clear forms
      setCfName('');
      setCfCals('');
      setCfProt('');
      setCfCarb('');
      setCfFat('');
      setCfFiber('');
      setCfSugar('');
      setCfSodium('');
      setShowCustomFood(false);
      
      if (onNotification) onNotification(`Logged custom item: ${logItem.name}`);
    } catch (err) {
      console.error("Custom food save failed", err);
      if (onNotification) onNotification("Failed to save custom food. Please try again.");
    }
  };

  const handleDeleteMeal = async (logId) => {
    try {
      await deleteFoodLog(userId, logId);
      deleteFoodLogStore(logId);
      if (onNotification) onNotification("Diary meal deleted.");
    } catch (err) {
      console.error("Delete food log failed", err);
      if (onNotification) onNotification("Failed to delete diary meal. Please try again.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMealPhoto(reader.result);
      setScanResult(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScanMeal = async () => {
    if (!mealPhoto) return;
    setScanning(true);
    setScanError(null);
    try {
      const response = await fetchWithRetry('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: mealPhoto, userGoal: userProfile?.goal })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult(data.scan || data);
      } else {
        throw new Error(`Server returned code ${response.status}`);
      }
    } catch (e) {
      console.error("Meal scan error", e);
      setScanError("Vision detection failed due to network or rate limits. Please try again or log manually.");
      if (onNotification) onNotification("API network failure. Please verify endpoints.");
    } finally {
      setScanning(false);
    }
  };

  const handleLogScanResult = async () => {
    if (!scanResult) return;
    const logItem = {
      name: scanResult.foodName,
      calories: scanResult.calories,
      protein: scanResult.protein,
      carbs: scanResult.carbs,
      fat: scanResult.fat,
      fiber: scanResult.fiber || 0,
      portionWeight: 100
    };
    try {
      const saved = await addFoodLog(userId, logItem);
      addFoodLogStore(saved);
      setMealPhoto(null);
      setScanResult(null);
      if (onNotification) onNotification(`Scanned meal logged: ${logItem.name}! 📸`);
    } catch (err) {
      console.error("Scan log save failed", err);
      if (onNotification) onNotification("Failed to log scanned meal. Please try again.");
    }
  };

  const handleLogSuggestedMeal = async (meal) => {
    const logItem = {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      portionWeight: 100
    };
    try {
      const saved = await addFoodLog(userId, logItem);
      addFoodLogStore(saved);
      if (onNotification) onNotification(`Logged suggestion: ${meal.name}`);
    } catch (err) {
      console.error("Suggested meal log save failed", err);
      if (onNotification) onNotification("Failed to log suggestion. Please try again.");
    }
  };

  const handleStartEditMeal = (idx, meal) => {
    setEditingMealIndex(idx);
    setEditMealFields({ ...meal });
  };

  const handleSaveMealEdit = (idx) => {
    const updatedPlanner = [...weeklyPlanner];
    updatedPlanner[activeDay].diet[idx] = {
      category: editMealFields.category,
      name: editMealFields.name,
      desc: editMealFields.desc,
      calories: Number(editMealFields.calories) || 0,
      protein: Number(editMealFields.protein) || 0,
      carbs: Number(editMealFields.carbs) || 0,
      fat: Number(editMealFields.fat) || 0
    };
    setWeeklyPlanner(updatedPlanner);
    setEditingMealIndex(null);
    if (onNotification) onNotification("Suggested planner item updated.");
  };

  const handleGenerateGrocery = async () => {
    if (!ecoStore.coachingPlan) return;
    setGeneratingGrocery(true);
    try {
      const res = await fetchWithRetry('/api/gemini/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program: ecoStore.coachingPlan })
      });
      if (res.ok) {
        const data = await res.json();
        setGroceryList(data.grocery);
        if (onNotification) onNotification("Smart Grocery checklist compiled! 🛒");
      } else {
        if (onNotification) onNotification("Failed to generate grocery list.");
      }
    } catch (e) {
      console.error("Grocery compile error", e);
      if (onNotification) onNotification("Failed to generate grocery list. Check network.");
    } finally {
      setGeneratingGrocery(false);
    }
  };

  const calculateCompatibility = (food) => {
    if (!food || !userProfile) return { rating: "Suitable", score: 90, reason: "Matches standard metabolic thresholds." };
    let score = 95;
    const reasons = [];
    
    if (userProfile.dietPreferences?.includes("Vegetarian")) {
      const lowercaseName = food.name.toLowerCase();
      if (lowercaseName.includes("chicken") || lowercaseName.includes("beef") || lowercaseName.includes("salmon") || lowercaseName.includes("fish") || lowercaseName.includes("meat")) {
        score -= 50;
        reasons.push("Contains animal flesh violating Vegetarian preferences");
      }
    }
    if (userProfile.dietPreferences?.includes("Vegan")) {
      const lowercaseName = food.name.toLowerCase();
      if (lowercaseName.includes("egg") || lowercaseName.includes("milk") || lowercaseName.includes("yogurt") || lowercaseName.includes("paneer") || lowercaseName.includes("dairy")) {
        score -= 40;
        reasons.push("Contains dairy/egg metrics violating Vegan bounds");
      }
    }
    if (userProfile.dietPreferences?.includes("Keto")) {
      if (food.carbs > 15) {
        score -= 30;
        reasons.push("High carbohydrate densities violate ketogenic boundaries");
      }
    }

    let rating = "Highly Suitable";
    if (score < 50) rating = "Not Suitable";
    else if (score < 80) rating = "Moderately Suitable";

    return {
      rating,
      score,
      reason: reasons.length > 0 ? reasons.join(" · ") : "Completely matches fitness somatotype, allergies, and selected kitchen bounds."
    };
  };

  const compat = calculateCompatibility(analysedFood);
  const scores = calculateMacrosRatings(analysedFood);
  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";
  const inputClass = inputStyle;

  return (
    <div className="space-y-6">
      
      {/* Sub navigation Tabs */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-3">
        {/* Title row: compact on mobile */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Nutrition Center</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Track diets, logs, scanning and grocery compilation lists</p>
          </div>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 overflow-x-auto w-full sm:w-auto sm:max-w-[65%] shrink-0 scrollbar-none">
          {[
            { id: 'diary', label: 'Food Diary' },
            { id: 'planner', label: 'Meal Planner' },
            { id: 'scanner', label: 'Meal Scanner' },
            { id: 'grocery', label: 'Grocery List' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                activeSubTab === tab.id
                  ? 'bg-acid-green text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          
          {/* FOOD DIARY SUB-TAB */}
          {activeSubTab === 'diary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Log meal search column */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6 relative">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Search Foods & Log</h2>
                  <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Select items to instantly track calorie macros</p>

                  <div ref={dropdownRef} className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-5 h-5 text-muted" />
                      <input 
                        type="text"
                        value={queryVal}
                        onChange={(e) => setQueryVal(e.target.value)}
                        placeholder="Search oats, chicken breast, paneer..."
                        className="w-full bg-[var(--input-bg)] border border-card-border focus:border-acid-green rounded-2xl pl-12 pr-5 py-3.5 text-sm text-foreground focus:outline-none shadow-inner"
                        autoComplete="off"
                      />
                    </div>

                    <AnimatePresence>
                      {showDropdown && searchResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full glass rounded-xl border border-card-border z-30 max-h-60 overflow-y-auto shadow-2xl"
                        >
                          {searchResults.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => selectFood(item)}
                              className="px-5 py-3.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green/10 transition-colors group"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                                  {item.name}
                                  {item.isLocal && (
                                    <span className="text-[8px] bg-acid-green/10 text-acid-green border border-acid-green/20 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wide">
                                      {item.category || "Local"}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-muted font-bold mt-0.5">
                                  P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g · Fi: {item.fiber || 0}g
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] opacity-75 text-acid-green font-bold whitespace-nowrap">{item.calories} kcal/100g</span>
                                
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite(e, item)}
                                  className="p-1 rounded-lg text-muted hover:text-yellow-500 cursor-pointer transition-colors"
                                  title="Toggle Favorite"
                                >
                                  <Star 
                                    className={`w-3.5 h-3.5 ${
                                      (Array.isArray(userProfile.favoriteFoods) ? userProfile.favoriteFoods : []).some(x => x.name.toLowerCase() === item.name.toLowerCase()) 
                                        ? 'text-yellow-500 fill-current' 
                                        : 'text-muted'
                                    }`} 
                                  />
                                </button>

                                <button
                                  onClick={(e) => quickLogFood(e, item)}
                                  className="bg-acid-green text-accent-foreground rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none shadow-sm hover:scale-105 active:scale-95 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                  title={`Quick log ${parsedPortion || 100}g`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{parsedPortion || 100}g</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-end mt-3">
                    <button 
                      onClick={() => setShowCustomFood(!showCustomFood)}
                      className="text-[10px] text-acid-green hover:text-foreground cursor-pointer font-extrabold uppercase tracking-wider flex items-center gap-1 bg-none border-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showCustomFood ? "Cancel Custom Food" : "Create Custom Food"}
                    </button>
                  </div>
                </section>

                {/* Favorites & Recents Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-surface/30 border border-card-border p-4 rounded-2xl space-y-2.5">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      Favorites ({(Array.isArray(userProfile.favoriteFoods) ? userProfile.favoriteFoods : []).length})
                    </span>
                    {Array.isArray(userProfile.favoriteFoods) && userProfile.favoriteFoods.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {userProfile.favoriteFoods.map((fav, i) => (
                          <button
                            key={i}
                            onClick={() => selectFood(fav)}
                            className="bg-[var(--card-bg)] border border-card-border hover:border-acid-green/45 text-foreground text-[10px] font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <span>{fav.name}</span>
                            <span className="text-[9.5px] text-acid-green font-bold">{fav.calories} kcal</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9.5px] text-muted font-semibold block italic">No favorites starred yet. Search and click Star to save!</span>
                    )}
                  </div>

                  <div className="bg-surface/30 border border-card-border p-4 rounded-2xl space-y-2.5">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">📅 Recently Logged</span>
                    {recentFoods.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {recentFoods.map((rec, i) => (
                          <button
                            key={i}
                            onClick={() => selectFood(rec)}
                            className="bg-[var(--card-bg)] border border-card-border hover:border-acid-green/45 text-foreground text-[10px] font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <span>{rec.name}</span>
                            <span className="text-[9.5px] text-acid-green font-bold">{rec.calories} kcal</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9.5px] text-muted font-semibold block italic">Log foods to populate your recently logged panel.</span>
                    )}
                  </div>
                </div>

                {/* Custom Food Form */}
                {showCustomFood && (
                  <motion.section 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-card-border border rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Custom Food Creator</h3>
                    <form onSubmit={handleCustomFoodSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Food Title</label>
                          <input type="text" value={cfName} onChange={(e) => setCfName(e.target.value)} placeholder="e.g. Grandma's Meatloaf" className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Calories (kcal/100g)</label>
                          <input type="number" value={cfCals} onChange={(e) => setCfCals(e.target.value)} placeholder="e.g. 240" className={inputClass} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein (g)</label>
                          <input type="number" step="0.1" value={cfProt} onChange={(e) => setCfProt(e.target.value)} className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Carbs (g)</label>
                          <input type="number" step="0.1" value={cfCarb} onChange={(e) => setCfCarb(e.target.value)} className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Fats (g)</label>
                          <input type="number" step="0.1" value={cfFat} onChange={(e) => setCfFat(e.target.value)} className={inputClass} required />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="submit" className="bg-acid-green text-accent-foreground font-bold text-xs py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm">Save & Log Item</button>
                      </div>
                    </form>
                  </motion.section>
                )}

                {/* Selected Food details & portions log */}
                {analysedFood && (() => {
                  const ratio = portion / 100;
                  const scaledCals = Math.round(analysedFood.calories * ratio);
                  const scaledProt = Number((analysedFood.protein * ratio).toFixed(1));
                  const scaledCarbs = Number((analysedFood.carbs * ratio).toFixed(1));
                  const scaledFat = Number((analysedFood.fat * ratio).toFixed(1));
                  const scaledFiber = Number(((analysedFood.fiber || 0) * ratio).toFixed(1));
                  const scaledSugar = Number(((analysedFood.sugar || 0) * ratio).toFixed(1));
                  const scaledSodium = Math.round((analysedFood.sodium || 0) * ratio);

                  return (
                    <motion.section 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass border-acid-green/20 border rounded-2xl p-6 space-y-5"
                    >
                      <div className="flex flex-col items-center justify-center p-4 border-b border-card-border">
                        <div className="w-20 h-20 rounded-full border-2 border-acid-green flex flex-col items-center justify-center shadow-lg">
                          <span className="text-xl font-black text-foreground">{compat.score}%</span>
                          <span className="text-[8px] text-muted font-bold uppercase tracking-wider">Score</span>
                        </div>
                        <h3 className="text-xs font-bold text-foreground mt-3 text-center">{portion}g {analysedFood.name}</h3>
                        <span className="text-[9px] font-bold text-acid-green px-2.5 py-0.5 rounded-full border border-acid-green/30 bg-acid-green/5 mt-2 uppercase tracking-wide">
                          {compat.rating}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold tracking-wider mb-2 block">Nutrition (scaled to {portion}g)</span>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-muted font-bold">Calories</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledCals} kcal</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-acid-green font-bold">Protein</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledProt}g</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-orange font-bold">Carbs</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledCarbs}g</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-red font-bold">Fats</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledFat}g</div>
                            </div>
                          </div>
                        </div>

                        {/* Extra Nutrition details: Fiber, Sugar, Sodium */}
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <div className="bg-surface border border-card-border py-1.5 rounded-lg">
                            <div className="text-[8px] text-muted font-bold">Fiber</div>
                            <div className="font-bold text-foreground mt-0.5">{scaledFiber}g</div>
                          </div>
                          <div className="bg-surface border border-card-border py-1.5 rounded-lg">
                            <div className="text-[8px] text-muted font-bold">Sugar</div>
                            <div className="font-bold text-foreground mt-0.5">{scaledSugar}g</div>
                          </div>
                          <div className="bg-surface border border-card-border py-1.5 rounded-lg">
                            <div className="text-[8px] text-muted font-bold">Sodium</div>
                            <div className="font-bold text-foreground mt-0.5">{scaledSodium}mg</div>
                          </div>
                        </div>

                        {/* Portion presets selector */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Portion Presets</span>
                          <div className="flex flex-wrap gap-1">
                            {[50, 100, 150, 200, 250].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPortion(preset)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-all cursor-pointer border ${
                                  portion === preset
                                    ? 'bg-acid-green text-accent-foreground border-acid-green shadow-sm'
                                    : 'bg-surface border-card-border text-muted hover:text-foreground'
                                }`}
                              >
                                {preset}g
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const custom = prompt("Enter custom portion weight (g):", portion);
                                if (custom) {
                                  const val = Number(custom);
                                  if (isNaN(val) || val <= 0 || val > 5000) {
                                    if (onNotification) onNotification("Portion weight must be between 1 and 5000g.");
                                  } else {
                                    setPortion(val);
                                  }
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-all cursor-pointer border ${
                                ![50, 100, 150, 200, 250].includes(portion)
                                  ? 'bg-acid-green text-accent-foreground border-acid-green shadow-sm'
                                  : 'bg-surface border-card-border text-muted hover:text-foreground'
                              }`}
                            >
                              Custom
                            </button>
                          </div>
                        </div>

                        {/* Suitability Analysis details */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-muted uppercase font-bold tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-acid-green" />
                            Calyxo Suitability Analysis
                          </span>
                          <p className="text-foreground text-xs leading-relaxed font-medium">{compat.reason}</p>
                        </div>

                        {/* Compatibility Score details badge section */}
                        {scores && (
                          <div className="border-t border-card-border pt-4 space-y-3">
                            <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Calyxo Compatibility Metrics</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-surface/50 border border-card-border p-2.5 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] text-muted font-bold">Weight Loss Score</span>
                                <span className="text-xs font-black text-acid-green">{scores.weightLossScore}/100</span>
                              </div>
                              <div className="bg-surface/50 border border-card-border p-2.5 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] text-muted font-bold">Muscle Gain Score</span>
                                <span className="text-xs font-black text-acid-green">{scores.muscleGainScore}/100</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                scores.proteinRating === "High Protein" 
                                  ? "bg-acid-green/10 text-acid-green border border-acid-green/30" 
                                  : "bg-surface text-muted border border-card-border"
                              }`}>
                                {scores.proteinRating}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                scores.carbRating === "High Carb" 
                                  ? "bg-orange/10 text-orange border border-orange/30" 
                                  : "bg-surface text-muted border border-card-border"
                              }`}>
                                {scores.carbRating}
                              </span>
                              {scores.isHealthyChoice && (
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Healthy Choice
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-3">
                          <div className="flex flex-col space-y-1 flex-1">
                            <label className="text-[9px] text-muted uppercase font-bold tracking-wider">Portion (g)</label>
                            <input type="number" value={portion} onChange={(e) => setPortion(Number(e.target.value))} className={inputClass} />
                          </div>
                          <button onClick={logFoodItem} className="bg-acid-green text-accent-foreground font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer h-10 sm:h-[36px] flex items-center justify-center border-none shadow-sm">Log Meal</button>
                        </div>
                      </div>
                    </motion.section>
                  );
                })()}
              </div>

              {/* Right Column: Logged Intake Timeline list */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Logged Intake Timeline</h2>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {todaysFoodLogs && todaysFoodLogs.length > 0 ? (
                      todaysFoodLogs.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{item.name} <span className="text-[9px] text-muted font-medium">({item.portionWeight}g)</span></span>
                            <span className="text-[9px] text-muted mt-0.5">P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-acid-green">+{item.calories} kcal</span>
                            <button onClick={() => handleDeleteMeal(item.id || item.timestamp)} className="text-muted hover:text-destructive cursor-pointer p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-muted py-12 font-medium">
                        No food logs registered today. Start logging items on the left!
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* MEAL PLANNER SUB-TAB */}
          {activeSubTab === 'planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Daily Meal Scheduler */}
              <section className="glass rounded-2xl p-6">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Weekly Diet Planner Templates</h2>
                
                <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                  {weeklyPlanner.map((day, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setActiveDay(idx);
                        setEditingMealIndex(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                        activeDay === idx 
                          ? 'bg-acid-green text-accent-foreground border-acid-green' 
                          : 'bg-surface border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      {day.dayName.substring(0, 3)}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {weeklyPlanner[activeDay].diet.map((meal, idx) => (
                    <div key={idx} className="border-b border-card-border last:border-b-0 pb-3.5 last:pb-0">
                      {editingMealIndex === idx ? (
                        <div className="space-y-3 p-3 bg-surface border border-card-border rounded-xl">
                          <input type="text" value={editMealFields.name} onChange={(e) => setEditMealFields({ ...editMealFields, name: e.target.value })} className={inputClass} />
                          <input type="text" value={editMealFields.desc} onChange={(e) => setEditMealFields({ ...editMealFields, desc: e.target.value })} className={inputClass} />
                          
                          <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-muted font-bold">
                            <div>Kcal<input type="number" value={editMealFields.calories} onChange={(e) => setEditMealFields({ ...editMealFields, calories: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>P(g)<input type="number" value={editMealFields.protein} onChange={(e) => setEditMealFields({ ...editMealFields, protein: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>C(g)<input type="number" value={editMealFields.carbs} onChange={(e) => setEditMealFields({ ...editMealFields, carbs: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>F(g)<input type="number" value={editMealFields.fat} onChange={(e) => setEditMealFields({ ...editMealFields, fat: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setEditingMealIndex(null)} className="text-[10px] text-muted py-1 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                            <button onClick={() => handleSaveMealEdit(idx)} className="text-[10px] text-accent-foreground bg-acid-green py-1 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                              <h4 onClick={() => handleStartEditMeal(idx, meal)} className="text-xs font-bold text-foreground border-b border-dashed border-muted cursor-pointer hover:text-acid-green flex items-center gap-1">
                                {meal.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-muted mt-1 leading-relaxed">{meal.desc}</p>
                            <span className="text-[9px] text-muted font-bold mt-1 block">
                              {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </span>
                          </div>
                          
                          <button onClick={() => handleLogSuggestedMeal(meal)} className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-accent-foreground flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Generated Coaching meal planner */}
              <section className="glass rounded-2xl p-6 border border-acid-green/20">
                {ecoStore.coachingPlan ? (
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-acid-green" />
                      AI Weekly Suggested planner
                    </h2>
                    
                    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                      {ecoStore.coachingPlan.mealPlan?.map((day, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActivePlanDay(idx)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                            activePlanDay === idx 
                              ? 'bg-acid-green text-accent-foreground border-acid-green' 
                              : 'bg-surface border-card-border text-muted hover:text-foreground'
                          }`}
                        >
                          {day.dayName.substring(0, 3)}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {ecoStore.coachingPlan.mealPlan?.[activePlanDay]?.meals?.map((meal, idx) => (
                        <div key={idx} className="border-b border-card-border last:border-b-0 pb-3 last:pb-0 flex justify-between items-start">
                          <div className="flex-grow pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                              <h4 className="text-xs font-bold text-foreground">{meal.name}</h4>
                            </div>
                            <span className="text-[9px] text-muted font-bold mt-1 block">
                              {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </span>
                          </div>
                          
                          <button onClick={() => handleLogSuggestedMeal(meal)} className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-accent-foreground flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs" title="Log to Diary">
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface/25 border border-dashed border-card-border rounded-2xl">
                    <Sparkles className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">No active program setup</p>
                    <p className="text-[10px] text-muted font-medium mt-1">Configure targets in the AI Coach first to output customized recommendations.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* MEAL SCANNER SUB-TAB */}
          {activeSubTab === 'scanner' && (
            <div className="max-w-xl mx-auto">
              <section className="glass rounded-2xl p-6 relative space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-acid-green" />
                  AI Meal Photo Scanner
                </h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-wider leading-relaxed">Upload or snap a photo of your food. Calyxo AI scans metrics, estimates calorie/weight proportions, and registers macronutrient data automatically.</p>

                <div className="border border-dashed border-card-border rounded-xl p-6 flex flex-col items-center justify-center bg-surface/50 h-56 relative overflow-hidden">
                  {mealPhoto ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mealPhoto} className="object-cover w-full h-full" alt="Scanned meal photo preview" />
                      <button onClick={() => { setMealPhoto(null); setScanResult(null); setScanError(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 text-[8px] font-bold uppercase tracking-wider cursor-pointer">Clear</button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-muted mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-foreground">Select Photo or Take Picture</span>
                      <span className="text-[10px] text-muted mt-1 uppercase font-bold">Supports JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {scanError && !scanResult && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-xl flex flex-col gap-2">
                    <p className="font-medium">{scanError}</p>
                    <button
                      onClick={handleScanMeal}
                      className="self-start text-[10px] uppercase font-bold tracking-wider underline cursor-pointer hover:text-foreground text-destructive"
                    >
                      Retry Scan
                    </button>
                  </div>
                )}

                {mealPhoto && !scanResult && (
                  <button
                    onClick={handleScanMeal}
                    disabled={scanning}
                    className="w-full bg-acid-green text-accent-foreground font-bold text-xs py-3 rounded-xl hover:shadow-md transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                  >
                    {scanning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                        Scanning image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Scan Meal Photo
                      </>
                    )}
                  </button>
                )}

                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-acid-green/20 rounded-xl p-4 space-y-3 shadow-inner"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Vision AI Detection</span>
                        <h4 className="text-xs font-bold text-foreground mt-0.5">{scanResult.foodName}</h4>
                      </div>
                      <span className="text-xs font-bold text-acid-green">{scanResult.calories} kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-acid-green font-bold uppercase">Protein</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.protein}g</div>
                      </div>
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-orange font-bold uppercase">Carbs</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.carbs}g</div>
                      </div>
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-red font-bold uppercase">Fats</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.fat}g</div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          setMealPhoto(null);
                          setScanResult(null);
                        }}
                        className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2 border border-card-border rounded-xl hover:bg-surface text-foreground cursor-pointer transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleLogScanResult}
                        className="flex-1 bg-acid-green text-accent-foreground font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm"
                      >
                        Log to Diary
                      </button>
                    </div>
                  </motion.div>
                )}
              </section>
            </div>
          )}

          {/* GROCERY LIST SUB-TAB */}
          {activeSubTab === 'grocery' && (
            <div className="max-w-xl mx-auto">
              <section className="glass rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-card-border">
                  <div>
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-acid-green" />
                      Smart Grocery Checklist
                    </h2>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Compile items from AI suggested planner</p>
                  </div>
                  {ecoStore.coachingPlan && (
                    <button 
                      onClick={handleGenerateGrocery}
                      disabled={generatingGrocery}
                      className="py-1.5 px-3.5 rounded-lg border border-card-border bg-surface text-[10px] font-bold text-foreground hover:border-acid-green transition-all cursor-pointer disabled:opacity-50"
                    >
                      {generatingGrocery ? "Compiling..." : "Generate List"}
                    </button>
                  )}
                </div>

                {groceryList ? (
                  <div className="space-y-4">
                    {groceryList.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="text-[10px] font-bold text-acid-green uppercase tracking-wider">{cat.name}</div>
                        <div className="bg-surface/50 border border-card-border p-3.5 rounded-xl space-y-1">
                          {cat.items?.map((item, iIdx) => (
                            <label key={iIdx} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer py-1 select-none">
                              <input type="checkbox" className="rounded border-card-border text-acid-green focus:ring-acid-green bg-transparent accent-acid-green cursor-pointer" />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface/25 border border-dashed border-card-border rounded-2xl">
                    <ShoppingBag className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">No grocery compiled</p>
                    <p className="text-[10px] text-muted font-medium mt-1">
                      {ecoStore.coachingPlan 
                        ? "Click 'Generate List' at the top to build a grocery checklist from your AI diet plan." 
                        : "Configure targets in the AI Coach first to unlock grocery compilers."}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
