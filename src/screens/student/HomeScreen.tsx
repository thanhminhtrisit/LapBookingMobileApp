import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  ChevronRight,
  FlaskConical,
  Cpu,
  Atom,
  Network,
  Microscope,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Lab, LabStatus } from '../../data/mockData';

const labIconMap: Record<string, React.ReactNode> = {
  'lab-1': <Cpu size={20} color="#3B82F6" />,
  'lab-2': <FlaskConical size={20} color="#A855F7" />,
  'lab-3': <Atom size={20} color="#22C55E" />,
  'lab-4': <Network size={20} color="#F97316" />,
  'lab-5': <Microscope size={20} color="#EC4899" />,
};

const labBgMap: Record<string, string> = {
  'lab-1': '#EFF6FF',
  'lab-2': '#FAF5FF',
  'lab-3': '#F0FDF4',
  'lab-4': '#FFF7ED',
  'lab-5': '#FDF2F8',
};

const statusConfig: Record<LabStatus, { text: string; color: string; bg: string }> = {
  available: { text: 'Available', color: '#22C55E', bg: '#F0FDF4' },
  occupied: { text: 'Occupied', color: '#EF4444', bg: '#FEF2F2' },
  maintenance: { text: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
};

const filters = ['All', 'Available', 'CS & IT', 'Engineering', 'Sciences'];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { labs, bookings, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const availableCount = labs.filter((l) => l.status === 'available').length;
  const myBookings = bookings.filter(
    (b) => b.studentId === currentUser?.id && b.status === 'pending'
  ).length;

  const filtered = labs.filter((lab) => {
    const matchSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.faculty.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'All'
        ? true
        : activeFilter === 'Available'
        ? lab.status === 'available'
        : activeFilter === 'CS & IT'
        ? lab.faculty.includes('Computer')
        : activeFilter === 'Engineering'
        ? lab.faculty.includes('Engineering')
        : activeFilter === 'Sciences'
        ? lab.faculty.includes('Science') || lab.faculty.includes('Life')
        : true;
    return matchSearch && matchFilter;
  });

  const firstName = currentUser?.name?.split(' ')[0] ?? 'Student';

  return (
    <View style={styles.container}>
      {/* Orange Header */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{currentUser?.name?.charAt(0) ?? 'A'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Labs', value: labs.length },
            { label: 'Available', value: availableCount },
            { label: 'Pending', value: myBookings },
          ].map(({ label, value }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search labs..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <SlidersHorizontal size={15} color="#9CA3AF" />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Labs List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {activeFilter === 'All' ? 'All Labs' : activeFilter} ({filtered.length})
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <FlaskConical size={36} color="#D1D5DB" strokeWidth={1} />
            <Text style={styles.emptyText}>No labs found</Text>
          </View>
        ) : (
          <View style={styles.labCards}>
            {filtered.map((lab: Lab) => {
              const status = statusConfig[lab.status];
              return (
                <TouchableOpacity
                  key={lab.id}
                  style={styles.labCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('LabDetail', { id: lab.id })}
                >
                  <View
                    style={[
                      styles.labIconBox,
                      { backgroundColor: labBgMap[lab.id] ?? '#F9FAFB' },
                    ]}
                  >
                    {labIconMap[lab.id] ?? <FlaskConical size={20} color="#9CA3AF" />}
                  </View>
                  <View style={styles.labInfo}>
                    <Text style={styles.labName} numberOfLines={1}>
                      {lab.name}
                    </Text>
                    <Text style={styles.labMeta} numberOfLines={1}>
                      {lab.building} · {lab.faculty}
                    </Text>
                    <View style={styles.labFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                      <Text style={styles.seatsText}>{lab.capacity} seats</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  name: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statValue: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  searchWrapper: { paddingHorizontal: 20, marginTop: -16 },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#374151' },
  filterChips: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  chipText: { fontSize: 12, color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '500' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 13, color: '#9CA3AF' },
  labCards: { gap: 12 },
  labCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  labIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labInfo: { flex: 1 },
  labName: { fontSize: 14, color: '#111827', fontWeight: '500' },
  labMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  labFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '500' },
  seatsText: { fontSize: 11, color: '#9CA3AF' },
});
