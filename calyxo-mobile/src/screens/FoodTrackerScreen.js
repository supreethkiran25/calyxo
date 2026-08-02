import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  FlatList 
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useMobileStore } from '../store/useMobileStore';

const POPULAR_FOODS = [
  { name: 'Oatmeal & Protein Powder', calories: 450, protein: 35, carbs: 55, fat: 8, meal_type: 'Breakfast' },
  { name: 'Roti (2) with Dal Makhani', calories: 420, protein: 16, carbs: 62, fat: 12, meal_type: 'Lunch' },
  { name: 'Grilled Chicken Breast & Rice', calories: 580, protein: 52, carbs: 65, fat: 10, meal_type: 'Lunch' },
  { name: 'Paneer Butter Masala & Brown Rice', calories: 540, protein: 22, carbs: 58, fat: 24, meal_type: 'Dinner' },
  { name: 'Greek Yogurt with Honey & Berries', calories: 240, protein: 18, carbs: 32, fat: 4, meal_type: 'Snack' },
  { name: 'Whey Protein Shake (1 Scoop)', calories: 130, protein: 25, carbs: 3, fat: 2, meal_type: 'Snack' },
];

export default function FoodTrackerScreen({ navigation }) {
  const meals = useMobileStore((state) => state.meals);
  const addMeal = useMobileStore((state) => state.addMeal);

  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddMeal = () => {
    if (!mealName || !calories) {
      Alert.alert('Incomplete Fields', 'Please enter at least a meal name and calorie amount.');
      return;
    }

    addMeal({
      name: mealName,
      meal_type: mealType,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
    });

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    Alert.alert('Meal Logged', `${mealName} added to your ${mealType} log!`);
  };

  const handleSelectPreset = (preset) => {
    setMealName(preset.name);
    setMealType(preset.meal_type);
    setCalories(preset.calories.toString());
    setProtein(preset.protein.toString());
    setCarbs(preset.carbs.toString());
    setFat(preset.fat.toString());
  };

  const filteredPresets = POPULAR_FOODS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <HeaderBar title="Food Tracker" subtitle="Calorie & Macro Logging" onProfilePress={() => navigation.navigate('Profile')} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Custom Meal Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log a Custom Meal</Text>

          <TextInput
            style={styles.input}
            placeholder="Meal Name (e.g., Chicken Curry & Naan)"
            placeholderTextColor="#607085"
            value={mealName}
            onChangeText={setMealName}
          />

          {/* Meal Type Selection */}
          <View style={styles.mealTypeRow}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.mealTypeBtn, mealType === type && styles.activeMealTypeBtn]}
                onPress={() => setMealType(type)}
              >
                <Text style={[styles.mealTypeBtnText, mealType === type && styles.activeMealTypeBtnText]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nutrients Input Grid */}
          <View style={styles.inputsRow}>
            <TextInput
              style={[styles.input, styles.shortInput]}
              placeholder="Cal (kcal)"
              placeholderTextColor="#607085"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
            <TextInput
              style={[styles.input, styles.shortInput]}
              placeholder="Prot (g)"
              placeholderTextColor="#607085"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
            <TextInput
              style={[styles.input, styles.shortInput]}
              placeholder="Carb (g)"
              placeholderTextColor="#607085"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              style={[styles.input, styles.shortInput]}
              placeholder="Fat (g)"
              placeholderTextColor="#607085"
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddMeal}>
            <Text style={styles.addBtnText}>+ Log Meal to Today</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Food Presets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Add Presets</Text>
          <TextInput
            style={styles.input}
            placeholder="Search healthy & Indian food items..."
            placeholderTextColor="#607085"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredPresets.map((item, index) => (
            <TouchableOpacity key={index} style={styles.presetItem} onPress={() => handleSelectPreset(item)}>
              <View>
                <Text style={styles.presetName}>{item.name}</Text>
                <Text style={styles.presetDetail}>P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</Text>
              </View>
              <Text style={styles.presetCalories}>{item.calories} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Logged Meals */}
        <Text style={styles.sectionTitle}>Today's Logged Meals</Text>
        {meals.map((item) => (
          <View key={item.id} style={styles.loggedItem}>
            <View style={styles.loggedLeft}>
              <Text style={styles.loggedType}>{item.meal_type}</Text>
              <Text style={styles.loggedName}>{item.name}</Text>
              <Text style={styles.loggedMacro}>P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</Text>
            </View>
            <Text style={styles.loggedCalories}>{item.calories} kcal</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#121826',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#182032',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  mealTypeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#182032',
    marginHorizontal: 2,
  },
  activeMealTypeBtn: {
    backgroundColor: '#00F0FF',
  },
  mealTypeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A99AD',
  },
  activeMealTypeBtnText: {
    color: '#090d16',
    fontWeight: '800',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortInput: {
    flex: 1,
    marginHorizontal: 2,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#090d16',
    fontSize: 14,
    fontWeight: '800',
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#182032',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  presetDetail: {
    fontSize: 11,
    color: '#8A99AD',
    marginTop: 2,
  },
  presetCalories: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00F0FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 12,
    letterSpacing: 0.5,
  },
  loggedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121826',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  loggedLeft: {
    flex: 1,
  },
  loggedType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loggedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  loggedMacro: {
    fontSize: 11,
    color: '#8A99AD',
  },
  loggedCalories: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
