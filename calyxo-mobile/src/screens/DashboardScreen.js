import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import StatCard from '../components/StatCard';
import { useMobileStore } from '../store/useMobileStore';

export default function DashboardScreen({ navigation }) {
  const profile = useMobileStore((state) => state.profile);
  const todayMetrics = useMobileStore((state) => state.todayMetrics);
  const addWater = useMobileStore((state) => state.addWater);

  const calProgress = (todayMetrics.calories_consumed / profile.target_calories) * 100;
  const waterProgress = (todayMetrics.water_ml / profile.target_water_ml) * 100;

  const handleQuickAddWater = (ml) => {
    addWater(ml);
    Alert.alert('Hydration Logged', `Added +${ml}ml of water to your daily intake.`);
  };

  const greetingTime = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={styles.container}>
      <HeaderBar 
        title={`${greetingTime}, ${profile.full_name.split(' ')[0]}`}
        subtitle="Today's Overview & AI Sync"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Quick Summary Row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>
          <Text style={styles.dateLabel}>Today</Text>
        </View>

        <StatCard 
          title="Calories Consumed" 
          value={todayMetrics.calories_consumed} 
          target={profile.target_calories} 
          unit="kcal" 
          accentColor="#00F0FF" 
          progress={calProgress}
        />

        <StatCard 
          title="Hydration" 
          value={todayMetrics.water_ml} 
          target={profile.target_water_ml} 
          unit="ml" 
          accentColor="#3B82F6" 
          progress={waterProgress}
        />

        {/* Quick Hydration Buttons */}
        <View style={styles.quickWaterContainer}>
          <Text style={styles.subText}>Quick Hydrate:</Text>
          <View style={styles.waterBtnRow}>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleQuickAddWater(250)}>
              <Text style={styles.waterBtnText}>+250 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleQuickAddWater(500)}>
              <Text style={styles.waterBtnText}>+500 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleQuickAddWater(750)}>
              <Text style={styles.waterBtnText}>+750 ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity & Macros */}
        <View style={styles.statsGrid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Active Time</Text>
            <Text style={styles.gridValue}>{todayMetrics.active_minutes} <Text style={styles.unit}>mins</Text></Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Burned</Text>
            <Text style={[styles.gridValue, { color: '#FF0055' }]}>{todayMetrics.calories_burned} <Text style={styles.unit}>kcal</Text></Text>
          </View>
        </View>

        {/* Macro Nutrients breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macronutrients</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroCol}>
              <Text style={[styles.macroDot, { color: '#00F0FF' }]}>● Protein</Text>
              <Text style={styles.macroVal}>{todayMetrics.protein_g}g</Text>
            </View>

            <View style={styles.macroCol}>
              <Text style={[styles.macroDot, { color: '#EAB308' }]}>● Carbs</Text>
              <Text style={styles.macroVal}>{todayMetrics.carbs_g}g</Text>
            </View>

            <View style={styles.macroCol}>
              <Text style={[styles.macroDot, { color: '#EC4899' }]}>● Fats</Text>
              <Text style={styles.macroVal}>{todayMetrics.fats_g}g</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Navigation */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Food')}>
            <Text style={styles.actionIcon}>🥗</Text>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Workouts')}>
            <Text style={styles.actionIcon}>🏋️‍♂️</Text>
            <Text style={styles.actionText}>Log Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AICoach')}>
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={styles.actionText}>Ask AI Coach</Text>
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#00F0FF',
    fontWeight: '600',
  },
  quickWaterContainer: {
    backgroundColor: '#121826',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subText: {
    fontSize: 12,
    color: '#8A99AD',
    marginBottom: 8,
    fontWeight: '600',
  },
  waterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  waterBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#121826',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gridLabel: {
    fontSize: 12,
    color: '#8A99AD',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00F0FF',
  },
  unit: {
    fontSize: 12,
    color: '#8A99AD',
    fontWeight: '500',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroCol: {
    alignItems: 'center',
  },
  macroDot: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  macroVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#182032',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
