import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Hash,
  LogOut,
  Shield,
  HelpCircle,
  ChevronRight,
  Bell,
  Mail,
  User,
  BookOpen,
  Building2,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { currentUser, logout, bookings } = useApp();
  const insets = useSafeAreaInsets();

  if (!currentUser) return null;

  const initials = currentUser.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = currentUser.role === 'MEMBER' ? 'Student'
                : currentUser.role === 'STAFF' ? 'Staff'
                : 'Admin';

  const myBookings = bookings.filter(b => b.userId === currentUser.id);
  const total    = myBookings.length;
  const approved = myBookings.filter(b => b.status === 'APPROVED').length;
  const pending  = myBookings.filter(b => b.status === 'PENDING').length;

  const infoRows = [
    { icon: <Hash size={15} color="#F97316" />, label: 'Student ID', value: currentUser.studentCode },
    { icon: <BookOpen size={15} color="#F97316" />, label: 'Department',  value: currentUser.department },
    { icon: <Building2 size={15} color="#F97316" />, label: 'Faculty',   value: currentUser.faculty },
  ];

  const settingsRows = [
    { icon: <Bell size={15} color="#6B7280" />, label: 'Notification Preferences' },
    { icon: <Shield size={15} color="#6B7280" />, label: 'Privacy & Security' },
    { icon: <HelpCircle size={15} color="#6B7280" />, label: 'Help & Support' },
  ];

  const handleLogoutPress = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => logout(), style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{currentUser.fullName}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          
          <View style={styles.roleContainer}>
            <View style={styles.rolePill}>
              <GraduationCap size={13} color="#F97316" />
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BOOKING STATISTICS</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>STUDENT INFORMATION</Text>
          <View style={styles.infoList}>
            {infoRows.map(({ icon, label, value }) => (
              <View key={label} style={styles.infoRow}>
                <View style={styles.infoIconBox}>{icon}</View>
                <View>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value ?? '—'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SETTINGS</Text>
          <View style={styles.infoList}>
            {settingsRows.map(({ icon, label }) => (
              <TouchableOpacity key={label} style={styles.settingsRow} activeOpacity={0.7}>
                <View style={styles.settingsLeft}>
                  <View style={styles.settingsIconBox}>{icon}</View>
                  <Text style={styles.settingsLabel}>{label}</Text>
                </View>
                <ChevronRight size={15} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.8} 
            onPress={handleLogoutPress}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>UniLab v3.0.0 · Google Auth Integrated</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, color: '#111827', fontWeight: '600' },
  scroll: { flex: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: { fontSize: 28, color: '#FFFFFF', fontWeight: '700' },
  userName: { fontSize: 18, color: '#111827', fontWeight: '600' },
  userEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleText: { fontSize: 12, color: '#F97316', fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  infoList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIconBox: {
    width: 28,
    height: 28,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: '#9CA3AF' },
  infoValue: { fontSize: 13, color: '#1F2937', fontWeight: '500', marginTop: 1 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconBox: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: { fontSize: 14, color: '#374151' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  logoutText: { fontSize: 15, color: '#EF4444', fontWeight: '500' },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#D1D5DB',
  },
});
