import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HeaderBar({ title, subtitle, onProfilePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.appName}>CALYXO</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress}>
        <View style={styles.avatarInner}>
          <Text style={styles.avatarText}>CX</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  titleContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#8A99AD',
    marginTop: 2,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
    backgroundColor: '#00F0FF',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#121826',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '800',
  },
});
