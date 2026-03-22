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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Search,
  Pencil,
  FlaskConical,
  Cpu,
  Power,
  AlertCircle,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { LabResponse } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#22C55E', bg: '#F0FDF4' },
  OCCUPIED: { label: 'Occupied', color: '#EF4444', bg: '#FEF2F2' },
  MAINTENANCE: { label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  CLOSED: { label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
};

const labIconMap: Record<string, React.ReactNode> = {
  'AVAILABLE': <Cpu size={18} color="#22C55E" />,
  'OCCUPIED': <FlaskConical size={18} color="#EF4444" />,
  'MAINTENANCE': <AlertCircle size={18} color="#F59E0B" />,
  'CLOSED': <AlertCircle size={18} color="#EF4444" />,
};

export default function ManageLabsScreen() {
  const navigation = useNavigation<any>();
  const { labs, labsLoading, fetchLabs, updateLabStatus } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchLabs();
    }, [fetchLabs])
  );

  const filtered = labs.filter(
    (lab) =>
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.location.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayStatus = (lab: LabResponse): 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED' => {
    if (lab.status === 'MAINTENANCE') return 'MAINTENANCE';
    if (lab.status === 'CLOSED') return 'CLOSED';
    if (lab.isOccupied) return 'OCCUPIED';
    return 'AVAILABLE';
  };

  const handleToggleStatus = (lab: LabResponse) => {
    const currentDisplay = getDisplayStatus(lab);
    let nextStatus: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED' = 'ACTIVE';

    if (currentDisplay === 'AVAILABLE' || currentDisplay === 'OCCUPIED') {
      nextStatus = 'MAINTENANCE';
    } else {
      nextStatus = 'ACTIVE';
    }

    if (lab.isOccupied && nextStatus === 'MAINTENANCE') {
      Alert.alert('Lab Occupied', 'This lab is currently occupied. Setting to maintenance will not cancel current sessions but prevents new ones.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Maintenance', onPress: () => updateLabStatus(lab.id, 'MAINTENANCE') },
      ]);
      return;
    }

    updateLabStatus(lab.id, nextStatus);
  };

  const handleDeletePress = () => {
    Alert.alert('Not Supported', 'Deleting labs is not currently supported by the backend API.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manage Labs</Text>
          <Text style={styles.headerSub}>{labs.length} labs registered</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LabForm', {})}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Lab</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={15} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search labs by name or location..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => {
          const count = labs.filter((l) => getDisplayStatus(l) === s).length;
          const conf = statusConfig[s];
          return (
            <View key={s} style={[styles.statCard, { backgroundColor: conf.bg }]}>
              <Text style={[styles.statValue, { color: conf.color }]}>{count}</Text>
              <Text style={styles.statLabel}>{conf.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Labs List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {labsLoading && filtered.length === 0 ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <FlaskConical size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No labs found</Text>
          </View>
        ) : (
          filtered.map((lab: LabResponse) => {
            const displayStatus = getDisplayStatus(lab);
            const status = statusConfig[displayStatus];
            return (
              <View key={lab.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.labIconBox}>
                    {labIconMap[displayStatus] ?? <FlaskConical size={18} color="#9CA3AF" />}
                  </View>
                  <View style={styles.labInfo}>
                    <Text style={styles.labName} numberOfLines={1}>{lab.name}</Text>
                    <Text style={styles.labMeta} numberOfLines={1}>
                      {lab.location} · {lab.capacity} Seats
                    </Text>
                    <View style={styles.labFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('LabForm', { id: lab.id })}
                  >
                    <Pencil size={13} color="#F97316" />
                    <Text style={[styles.actionBtnText, { color: '#F97316' }]}>Edit</Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={() => handleToggleStatus(lab)}
                  >
                    <Power size={13} color={displayStatus === 'MAINTENANCE' ? '#22C55E' : '#F59E0B'} />
                    <Text style={[styles.actionBtnText, { color: displayStatus === 'MAINTENANCE' ? '#22C55E' : '#F59E0B' }]}>
                      {displayStatus === 'MAINTENANCE' ? 'Set Active' : 'Set Maint.'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={handleDeletePress}
                  >
                    <Text style={[styles.actionBtnText, { color: '#D1D5DB' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, color: '#111827', fontWeight: '600' },
  headerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { fontSize: 13, color: '#FFFFFF', fontWeight: '500' },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#374151' },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  statCard: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '600' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  labIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labInfo: { flex: 1 },
  labName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  labMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  labFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  actionBtnText: { fontSize: 12, fontWeight: '500' },
  actionDivider: { width: 1, backgroundColor: '#F9FAFB' },
});
