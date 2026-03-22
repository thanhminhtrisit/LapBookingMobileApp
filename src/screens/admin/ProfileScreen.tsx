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
  Shield,
  Phone,
  Mail,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  BarChart3,
  CalendarDays,
  User as UserIcon,
  Hash,
  BookOpen,
  Building2,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminProfileScreen() {
  const { currentUser, logout, pendingBookings } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  if (!currentUser) return null;

  const initials = currentUser.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const total = pendingBookings.length;
  const pending = pendingBookings.filter((b) => b.status === 'PENDING').length;
  const approved = pendingBookings.filter((b) => b.status === 'APPROVED').length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const infoRows = [
    { icon: <UserIcon size={15} color="#F97316" />, label: 'Full Name', value: currentUser.fullName },
    { icon: <Hash size={15} color="#F97316" />, label: 'Staff Code', value: currentUser.staffCode || '—' },
    { icon: <Mail size={15} color="#F97316" />, label: 'Email', value: currentUser.email },
    { icon: <Building2 size={15} color="#F97316" />, label: 'Faculty', value: currentUser.faculty || '—' },
    { icon: <BookOpen size={15} color="#F97316" />, label: 'Department', value: currentUser.department || '—' },
  ];

  const settingsRows = [
    { icon: <Bell size={15} color="#6B7280" />, label: 'Notification Preferences' },
    { icon: <Shield size={15} color="#6B7280" />, label: 'Privacy & Security' },
    { icon: <HelpCircle size={15} color="#6B7280" />, label: 'Help & Support' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#F97316', '#EA580C']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{currentUser.fullName}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          <View style={styles.rolePill}>
            <Shield size={12} color="#F97316" />
            <Text style={styles.roleText}>{currentUser.role}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Reqs', value: total, color: '#111827' },
            { label: 'Pending', value: pending, color: '#F59E0B' },
            { label: 'Approved', value: approved, color: '#22C55E' },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>
          <View style={styles.infoList}>
            {infoRows.map(({ icon, label, value }) => (
              <View key={label} style={styles.infoRow}>
                <View style={styles.infoIconBox}>{icon}</View>
                <View>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.infoRow} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <View style={[styles.infoIconBox, { backgroundColor: '#F0FDF4' }]}>
                <CalendarDays size={15} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>My Reservations</Text>
                <Text style={styles.infoValue}>View and manage your bookings</Text>
              </View>
              <ChevronRight size={15} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* System Roles */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SYSTEM ACCESS</Text>
          <View style={styles.rolesCard}>
            <View style={styles.roleRow}>
              <View style={styles.roleIconOrange}>
                <Shield size={16} color="#F97316" />
              </View>
              <View>
                <Text style={styles.roleName}>Lab Administrator</Text>
                <Text style={styles.roleDesc}>Manage labs, approve/reject bookings</Text>
              </View>
            </View>
            {currentUser.role === 'ADMIN' && (
              <View style={[styles.roleRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 12 }]}>
                <View style={styles.roleIconBlue}>
                  <BarChart3 size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.roleName}>System Admin</Text>
                  <Text style={styles.roleDesc}>Full system configuration access</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP SETTINGS</Text>
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
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out from {currentUser.role}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>UniLab Mobile v2.5.0 · Backend Connected</Text>
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
  avatarText: { fontSize: 26, color: '#FFFFFF', fontWeight: '700' },
  userName: { fontSize: 18, color: '#111827', fontWeight: '600' },
  userEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleText: { fontSize: 12, color: '#F97316', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '600' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
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
  rolesCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleIconOrange: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBlue: {
    width: 32,
    height: 32,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  roleDesc: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
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
  versionText: { textAlign: 'center', fontSize: 11, color: '#D1D5DB' },
});
