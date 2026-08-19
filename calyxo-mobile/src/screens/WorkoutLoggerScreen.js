import React, { useState, useEffect } from 'react';
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

export default function WorkoutLoggerScreen({ navigation }) {
  const workouts = useMobileStore((state) => state.workouts);
  const addWorkout = useMobileStore((state) => state.addWorkout);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Strength');
  const [duration, setDuration] = useState('45');
  const [calories, setCalories] = useState('350');
  
  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0 && timerActive) {
      setTimerActive(false);
      Alert.alert('Rest Time Over', 'Time to start your next set!');
    }
    return () => clearInterval(interval);
  }, [timerActive, restSeconds]);

  const handleStartRestTimer = (seconds) => {
    setRestSeconds(seconds);
    setTimerActive(true);
  };

  const handleLogWorkout = () => {
    if (!title) {
      Alert.alert('Incomplete Fields', 'Please enter a workout title (e.g., Push Day / Core Circuit).');
      return;
    }

    addWorkout({
      title,
      category,
      duration_minutes: parseInt(duration, 10) || 30,
      calories_burned: parseInt(calories, 10) || 200,
    });

    setTitle('');
    Alert.alert('Workout Saved', `${title} has been logged to your daily progress!`);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Workout Logger" subtitle="Strength, Cardio & Rest Timer" onProfilePress={() => navigation.navigate('Profile')} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Rest Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerTitle}>⏱️ Rest Interval Timer</Text>
          <Text style={styles.timerDisplay}>
            {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
          </Text>
          <View style={styles.timerBtnRow}>
            <TouchableOpacity style={styles.timerPresetBtn} onPress={() => handleStartRestTimer(30)}>
              <Text style={styles.timerPresetText}>30s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerPresetBtn} onPress={() => handleStartRestTimer(60)}>
              <Text style={styles.timerPresetText}>60s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerPresetBtn} onPress={() => handleStartRestTimer(90)}>
              <Text style={styles.timerPresetText}>90s</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timerPresetBtn, { backgroundColor: timerActive ? '#FF0055' : '#3B82F6' }]} 
              onPress={() => setTimerActive(!timerActive)}
            >
              <Text style={styles.timerPresetText}>{timerActive ? 'Pause' : 'Start'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Workout Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record Workout Session</Text>

          <TextInput
            style={styles.input}
            placeholder="Workout Title (e.g. Chest & Triceps)"
            placeholderTextColor="#607085"
            value={title}
            onChangeText={setTitle}
          />

          {/* Category Selection */}
          <View style={styles.categoryRow}>
            {['Strength', 'Cardio', 'HIIT', 'Yoga'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.activeCatBtn]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catBtnText, category === cat && styles.activeCatBtnText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputsRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Duration (mins)</Text>
              <TextInput
                style={styles.input}
                placeholder="45"
                placeholderTextColor="#607085"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Est. Calories Burned</Text>
              <TextInput
                style={styles.input}
                placeholder="350"
                placeholderTextColor="#607085"
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logBtn} onPress={handleLogWorkout}>
            <Text style={styles.logBtnText}>+ Save Workout Session</Text>
          </TouchableOpacity>
        </View>

        {/* Completed Workouts */}
        <Text style={styles.sectionTitle}>Completed Today</Text>
        {workouts.map((w) => (
          <View key={w.id} style={styles.workoutItem}>
            <View>
              <Text style={styles.workoutBadge}>{w.category}</Text>
              <Text style={styles.workoutTitle}>{w.title}</Text>
              <Text style={styles.workoutSub}>{w.duration_minutes} mins | {w.time || 'Logged'}</Text>
            </View>
            <Text style={styles.workoutCal}>-{w.calories_burned} kcal</Text>
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
  timerCard: {
    backgroundColor: '#182032',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00F0FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  timerBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  timerPresetBtn: {
    backgroundColor: '#121826',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  timerPresetText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#182032',
    marginHorizontal: 2,
  },
  activeCatBtn: {
    backgroundColor: '#00F0FF',
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A99AD',
  },
  activeCatBtnText: {
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
  },
  logBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  logBtnText: {
    color: '#090d16',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 12,
    letterSpacing: 0.5,
  },
  workoutItem: {
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
  workoutBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  workoutSub: {
    fontSize: 11,
    color: '#8A99AD',
  },
  workoutCal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF0055',
  },
});
