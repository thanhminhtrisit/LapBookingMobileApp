import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, FlaskConical, Building2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Simple colored G icon to represent Google
const GoogleIcon = () => (
  <View style={styles.googleIconOuter}>
    <View style={[styles.googleSlice, { backgroundColor: '#4285F4' }]} />
    <Text style={styles.googleGText}>G</Text>
  </View>
);

export default function LoginScreen() {
  const { login } = useApp();

  // Navigation is handled automatically by RootNavigator watching currentUser
  const handleDemoLogin = (role: 'student' | 'admin') => {
    login(role);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Gradient Header Section */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative circles */}
        <View style={[styles.decorCircle, { width: 192, height: 192, top: -48, right: -48 }]} />
        <View style={[styles.decorCircle, { width: 128, height: 128, top: 32, left: -32 }]} />
        <View style={[styles.decorCircle, { width: 64, height: 64, bottom: 64, right: 32, opacity: 0.1 }]} />

        {/* Building silhouettes */}
        <View style={styles.buildingRow}>
          <View style={[styles.building, { width: 32, height: 64, opacity: 0.2 }]} />
          <View style={[styles.building, { width: 48, height: 96, opacity: 0.25 }]} />
          <View style={[styles.building, { width: 64, height: 128, opacity: 0.3 }]} />
          <View style={[styles.building, { width: 48, height: 80, opacity: 0.25 }]} />
          <View style={[styles.building, { width: 32, height: 56, opacity: 0.2 }]} />
        </View>

        {/* App Icon */}
        <View style={styles.appIconContainer}>
          <GraduationCap size={32} color="#F97316" />
        </View>

        {/* Floating icon hints */}
        <View style={[styles.floatIcon, { top: 24, right: 40 }]}>
          <FlaskConical size={16} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={[styles.floatIcon, { top: 48, left: 20 }]}>
          <Building2 size={14} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      {/* Content Section */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.titleOrange}>UniLab</Text>
          </Text>
          <Text style={styles.subtitle}>University Lab Reservation System</Text>
          <Text style={styles.description}>
            Reserve labs, track your bookings, and manage your university resources seamlessly.
          </Text>
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          activeOpacity={0.8}
          onPress={() => handleDemoLogin('student')}
        >
          <GoogleIcon />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>demo mode</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo Buttons */}
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoStudentBtn}
            activeOpacity={0.8}
            onPress={() => handleDemoLogin('student')}
          >
            <Text style={styles.demoStudentSmall}>Demo as</Text>
            <Text style={styles.demoStudentLabel}>Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoAdminBtn}
            activeOpacity={0.8}
            onPress={() => handleDemoLogin('admin')}
          >
            <Text style={styles.demoAdminSmall}>Demo as</Text>
            <Text style={styles.demoAdminLabel}>Admin / Lecturer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms &amp; Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: SCREEN_HEIGHT * 0.42,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    opacity: 0.05,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  building: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  floatIcon: {
    position: 'absolute',
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    color: '#111827',
    marginBottom: 4,
    fontWeight: '600',
  },
  titleOrange: {
    color: '#F97316',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    lineHeight: 21,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  googleSlice: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    top: 0,
    backgroundColor: '#4285F4',
  },
  googleGText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    zIndex: 1,
  },
  googleBtnText: {
    fontSize: 15,
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoStudentBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  demoStudentSmall: {
    fontSize: 11,
    color: '#F97316',
  },
  demoStudentLabel: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '600',
  },
  demoAdminBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  demoAdminSmall: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  demoAdminLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 24,
  },
});
