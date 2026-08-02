import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ title, value, target, unit, accentColor = '#00F0FF', progress = 0 }) {
  const cappedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.badge, { color: accentColor }]}>{Math.round(cappedProgress)}%</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.target}> / {target} {unit}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${cappedProgress}%`, backgroundColor: accentColor }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121826',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A99AD',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  target: {
    fontSize: 14,
    color: '#607085',
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
