import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
              style={styles.logo}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>UniLab</Text>
          <Text style={styles.subtitle}>University Lab Reservation System</Text>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={signInWithGoogle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <LogIn size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Use your university email to access the system
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#F97316',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 24,
    fontSize: 13,
    color: '#9CA3AF',
  },
});
