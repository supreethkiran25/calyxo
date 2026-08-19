import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { dbMobileService } from '../services/dbMobileService';
import { useMobileStore } from '../store/useMobileStore';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useMobileStore((state) => state.setUser);
  const setProfile = useMobileStore((state) => state.setProfile);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await dbMobileService.login(email, password);
        if (data?.user) {
          setUser(data.user);
          setProfile({ email: data.user.email });
        }
      } else {
        const data = await dbMobileService.signUp(email, password, fullName);
        Alert.alert('Account Created', 'Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setUser({ id: 'guest-123', email: 'guest@calyxo.app' });
    setProfile({ full_name: 'Guest Athlete', email: 'guest@calyxo.app' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandSubtitle}>INTELLIGENT FITNESS</Text>
          <Text style={styles.brandTitle}>CALYXO</Text>
          <Text style={styles.brandDesc}>
            AI-powered workouts, diet tracking & personal coaching
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, isLogin && styles.activeTab]} 
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, !isLogin && styles.activeTab]} 
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#607085"
              value={fullName}
              onChangeText={setFullName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#607085"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#607085"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#090d16" />
            ) : (
              <Text style={styles.submitBtnText}>{isLogin ? 'Sign In to Calyxo' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={handleGuestMode}>
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 3,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandDesc: {
    fontSize: 14,
    color: '#8A99AD',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#121826',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#00F0FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A99AD',
  },
  activeTabText: {
    color: '#090d16',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#182032',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  submitBtn: {
    backgroundColor: '#00F0FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#090d16',
    fontSize: 16,
    fontWeight: '800',
  },
  guestBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestBtnText: {
    color: '#8A99AD',
    fontSize: 14,
    fontWeight: '600',
  },
});
