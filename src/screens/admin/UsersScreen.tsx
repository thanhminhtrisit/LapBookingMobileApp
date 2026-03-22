import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  User,
  ShieldCheck,
  UserCog,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { UserResponseDTO } from '../../services/api';

export default function UsersScreen() {
  const { users, usersLoading, fetchUsers, updateUserRole } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (user: UserResponseDTO) => {
    const isStaff = user.role === 'STAFF';
    const nextRole = isStaff ? 'MEMBER' : 'STAFF';
    const actionText = isStaff ? 'Demote to Member' : 'Promote to Staff';

    Alert.alert(
      'Update Role',
      `Are you sure you want to change ${user.fullName}'s role to ${nextRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionText, 
          onPress: () => updateUserRole(user.id, nextRole) 
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{users.length} total users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {usersLoading && users.length === 0 ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          filtered.map((u) => (
            <View key={u.id} style={styles.userCard}>
              <View style={styles.cardInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{u.fullName}</Text>
                    <View style={[styles.roleBadge, u.role === 'ADMIN' ? styles.adminBadge : u.role === 'STAFF' ? styles.staffBadge : styles.memberBadge]}>
                      <Text style={[styles.roleText, u.role === 'ADMIN' ? styles.adminText : u.role === 'STAFF' ? styles.staffText : styles.memberText]}>
                        {u.role}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.contactRow}>
                    <Mail size={12} color="#9CA3AF" />
                    <Text style={styles.contactText}>{u.email}</Text>
                  </View>
                  {u.phone && (
                    <View style={styles.contactRow}>
                      <Phone size={12} color="#9CA3AF" />
                      <Text style={styles.contactText}>{u.phone}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action */}
              {u.role !== 'ADMIN' && (
                <TouchableOpacity 
                  style={styles.roleBtn}
                  onPress={() => handleRoleChange(u)}
                >
                  <UserCog size={18} color="#F97316" />
                  <Text style={styles.roleBtnText}>Change Role</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, color: '#111827', fontWeight: '700' },
  headerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  searchWrapper: { padding: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  cardInfo: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#F97316' },
  userDetails: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  adminBadge: { backgroundColor: '#FEE2E2' },
  staffBadge: { backgroundColor: '#E0E7FF' },
  memberBadge: { backgroundColor: '#F0FDF4' },
  roleText: { fontSize: 10, fontWeight: '700' },
  adminText: { color: '#EF4444' },
  staffText: { color: '#4F46E5' },
  memberText: { color: '#22C55E' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { fontSize: 12, color: '#6B7280' },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#F97316' },
});
