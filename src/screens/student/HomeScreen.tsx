import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Search,
  SlidersHorizontal,
  Users,
  MapPin,
  FlaskConical,
  ChevronRight,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { LabResponse } from '../../services/api';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#22C55E', bg: '#F0FDF4' },
  OCCUPIED: { label: 'Occupied', color: '#EF4444', bg: '#FEF2F2' },
  MAINTENANCE: { label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  CLOSED: { label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { labs, labsLoading, fetchLabs, currentUser, myBookings } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchLabs();
    }, [fetchLabs])
  );

  const filteredLabs = labs.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())
  );

  const availableCount = labs.filter((l) => l.status === 'ACTIVE' && !l.isOccupied).length;
  const pendingCount = myBookings.filter((b) => b.status === 'PENDING').length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F97316', '#EA580C']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>Welcome back,</Text>
            <Text style={styles.headerName}>{currentUser?.fullName || 'Student'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileText}>{(currentUser?.fullName || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search labs, buildings..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={18} color="#F97316" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Available Labs</Text>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{availableCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Pending Bookings</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingCount}</Text>
          </View>
        </View>

        {/* Labs List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Laboratories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {labsLoading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 20 }} />
        ) : filteredLabs.length === 0 ? (
          <View style={styles.emptyState}>
            <FlaskConical size={40} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No labs matching your search</Text>
          </View>
        ) : (
          filteredLabs.map((lab: LabResponse) => {
            let displayStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED' = 'AVAILABLE';
            if (lab.status === 'MAINTENANCE') {
              displayStatus = 'MAINTENANCE';
            } else if (lab.status === 'CLOSED') {
              displayStatus = 'CLOSED';
            } else if (lab.isOccupied) {
              displayStatus = 'OCCUPIED';
            }
            const sc = statusConfig[displayStatus];
            
            return (
              <TouchableOpacity
                key={lab.id}
                style={styles.labCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('LabDetail', { id: lab.id })}
              >
                <Image
                  source={{ uri: lab.imageURL || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400' }}
                  style={styles.labImage}
                />
                <View style={styles.labInfo}>
                  <View style={styles.labInfoHeader}>
                    <Text style={styles.labName} numberOfLines={1}>{lab.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                    </View>
                  </View>
                  <View style={styles.labMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.metaText} numberOfLines={1}>{lab.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={12} color="#9CA3AF" />
                      <Text style={styles.metaText}>{lab.capacity} Seats</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color="#D1D5DB" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerGreet: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', padding: 2, justifyContent: 'center', alignItems: 'center' },
  profileBadge: { width: '100%', height: '100%', borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  profileText: { fontSize: 16, fontWeight: '700', color: '#F97316' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, height: 50 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filterBtn: { width: 36, height: 36, backgroundColor: '#FFF7ED', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F97316' },
  statTitle: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  seeAllText: { fontSize: 13, color: '#F97316', fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40, opacity: 0.5 },
  emptyText: { marginTop: 8, fontSize: 14, color: '#6B7280' },
  labCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  labImage: { width: 70, height: 70, borderRadius: 14, backgroundColor: '#F3F4F6' },
  labInfo: { flex: 1, marginLeft: 16, marginRight: 8 },
  labInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  labName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, marginRight: 4 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  labMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#9CA3AF' },
});
