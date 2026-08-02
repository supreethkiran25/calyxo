import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useMobileStore } from '../store/useMobileStore';
import { dbMobileService } from '../services/dbMobileService';

export default function ProfileScreen({ navigation }) {
  const profile = useMobileStore((state) => state.profile);
  const setProfile = useMobileStore((state) => state.setProfile);
  const resetState = useMobileStore((state) => state.resetState);

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [targetCalories, setTargetCalories] = useState(profile.target_calories.toString());
  const [targetWater, setTargetWater] = useState(profile.target_water_ml.toString());
  const [currentWeight, setCurrentWeight] = useState(profile.current_weight_kg.toString());
  const [goalWeight, setGoalWeight] = useState(profile.goal_weight_kg.toString());
  const [fitnessGoal, setFitnessGoal] = useState(profile.fitness_goal || 'weight_loss');

  const handleSaveProfile = () => {
    setProfile({
      full_name: fullName,
      target_calories: parseInt(targetCalories, 10) || 2000,
      target_water_ml: parseInt(targetWater, 10) || 3000,
      current_weight_kg: parseFloat(currentWeight) || 70,
      goal_weight_kg: parseFloat(goalWeight) || 65,
      fitness_goal: fitnessGoal,
    });

    Alert.alert('Profile Updated', 'Your targets and preferences have been updated!');
  };

  const handleSignOut = async () => {
    try {
      await dbMobileService.signOut();
      resetState();
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Profile & Goals" subtitle="Manage targets & preferences" onProfilePress={() => {}} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{fullName.slice(0, 2).toUpperCase() || 'CX'}</Text>
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{profile.email || 'guest@calyxo.app'}</Text>
        </View>

        {/* Goal Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Primary Fitness Goal</Text>
          <View style={styles.goalRow}>
            {[
              { id: 'weight_loss', label: 'Weight Loss' },
              { id: 'muscle_gain', label: 'Muscle Gain' },
              { id: 'maintenance', label: 'Maintenance' },
            ].map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalBtn, fitnessGoal === g.id && styles.activeGoalBtn]}
                onPress={() => setFitnessGoal(g.id)}
              >
                <Text style={[styles.goalBtnText, fitnessGoal === g.id && styles.activeGoalBtnText]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weight & Body Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body Measurements</Text>
          <View style={styles.inputsRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={currentWeight}
                onChangeText={setCurrentWeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Goal Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={goalWeight}
                onChangeText={setGoalWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Target Daily Goals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Target Goals</Text>
          
          <Text style={styles.inputLabel}>Target Daily Calories (kcal)</Text>
          <TextInput
            style={styles.input}
            value={targetCalories}
            onChangeText={setTargetCalories}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Target Daily Hydration (ml)</Text>
          <TextInput
            style={styles.input}
            value={targetWater}
            onChangeText={setTargetWater}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
            <Text style={styles.saveBtnText}>Save Profile Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutBtnText}>Sign Out of Calyxo</Text>
        </TouchableOpacity>
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
  userCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigAvatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#090d16',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 13,
    color: '#8A99AD',
    marginTop: 2,
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
  goalRow: {
    flexDirection: 'row',
  },
  goalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#182032',
    marginHorizontal: 2,
  },
  activeGoalBtn: {
    backgroundColor: '#00F0FF',
  },
  goalBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A99AD',
  },
  activeGoalBtnText: {
    color: '#090d16',
    fontWeight: '800',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#8A99AD',
    marginBottom: 4,
    marginTop: 4,
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
  saveBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#090d16',
    fontSize: 15,
    fontWeight: '800',
  },
  signOutBtn: {
    backgroundColor: 'rgba(255, 0, 85, 0.12)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
    marginTop: 8,
  },
  signOutBtnText: {
    color: '#FF0055',
    fontSize: 15,
    fontWeight: '800',
  },
});
