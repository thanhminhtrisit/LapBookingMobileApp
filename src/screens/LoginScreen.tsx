import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Dimensions, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const { loginWithEmail, loginAsMember, loginAsAdmin, isLoading, authError } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    loginWithEmail(username, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Orange header area */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orangeSection}
      >
        {/* Decorative blobs */}
        <View style={[styles.blob, { width: 100, height: 100, top: 20, left: -20, opacity: 0.2 }]} />
        <View style={[styles.blob, { width: 60, height: 60, top: 60, right: 30, opacity: 0.15 }]} />

        {/* Decorative bar chart illustration */}
        <View style={styles.barsContainer}>
          {[40, 70, 55, 85, 45, 65].map((h, i) => (
            <View
              key={i}
              style={[styles.bar, { height: h, marginHorizontal: 5, opacity: 0.35 }]}
            />
          ))}
        </View>

        {/* Graduation cap icon at bottom center */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconBox}>
            <GraduationCap size={32} color="#F97316" />
          </View>
        </View>
      </LinearGradient>

      {/* White bottom area */}
      <View style={styles.whiteSection}>
        <Text style={styles.welcomeText}>
          Welcome to <Text style={styles.brandText}>UniLab</Text>
        </Text>
        <Text style={styles.subtitleText}>University Lab Reservation System</Text>
        <Text style={styles.bodyText}>
          Reserve labs, track your bookings, and manage your university resources seamlessly.
        </Text>

        {/* Username and password inputs */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>

        {authError ? (
          <Text style={styles.errorText}>{authError}</Text>
        ) : null}

        {/* Demo mode */}
        <Text style={styles.demoLabel}>demo mode</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoOutlineBtn}
            activeOpacity={0.8}
            onPress={loginAsMember}
            disabled={isLoading}
          >
            <Text style={styles.demoOutlineText}>Demo as{'\n'}Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoSolidBtn}
            activeOpacity={0.8}
            onPress={loginAsAdmin}
            disabled={isLoading}
          >
            <Text style={styles.demoSolidText}>Demo as{'\n'}Admin / Lecturer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F97316' },
  orangeSection: {
    height: height * 0.44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#FFFFFF' },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 60,
    left: 0, right: 0,
    justifyContent: 'center',
  },
  bar: { width: 22, borderRadius: 6, backgroundColor: '#FFFFFF' },
  iconWrapper: { position: 'absolute', bottom: -24, zIndex: 10 },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  brandText: { color: '#F97316' },
  subtitleText: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  bodyText: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, marginBottom: 20 },
  errorText: { fontSize: 12, color: '#EF4444', textAlign: 'center', marginBottom: 8 },
  demoLabel: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 10 },
  demoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  demoOutlineBtn: {
    flex: 1, borderWidth: 2, borderColor: '#F97316', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  demoOutlineText: { fontSize: 13, color: '#F97316', fontWeight: '600', textAlign: 'center' },
  demoSolidBtn: {
    flex: 1, backgroundColor: '#F97316', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  demoSolidText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  footerText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
