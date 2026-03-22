import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CalendarDays, Clock, FlaskConical, ChevronRight, Plus } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { BookingStatus, timeSlotLabels } from '../../data/mockData';

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  APPROVED: { label: 'Approved', color: '#22C55E', bg: '#F0FDF4' },
  REJECTED: { label: 'Rejected', color: '#EF4444', bg: '#FEF2F2' },
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  CANCELLED: { label: 'Cancelled', color: '#9CA3AF', bg: '#F3F4F6' },
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
};

type FilterType = BookingStatus | 'all';
const filtersList: FilterType[] = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const filterLabels: Record<FilterType, string> = {
  all: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export default function MyBookingsScreen() {
  const navigation = useNavigation<any>();
  const { myBookings: allMyBookings, fetchMyBookings } = useApp();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const displayed = [...allMyBookings]
    .filter(b => activeFilter === 'all' ? true : b.status === activeFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts: Record<FilterType, number> = {
    all: allMyBookings.length,
    PENDING: allMyBookings.filter(b => b.status === 'PENDING').length,
    APPROVED: allMyBookings.filter(b => b.status === 'APPROVED').length,
    REJECTED: allMyBookings.filter(b => b.status === 'REJECTED').length,
    CANCELLED: allMyBookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>{allMyBookings.length} total reservations</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('HomeStack')}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filtersList.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
              {filterLabels[f]}
            </Text>
            {counts[f] > 0 && activeFilter !== f && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{counts[f]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarDays size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyHint}>Tap + to make a new reservation</Text>
          </View>
        ) : (
          displayed.map((booking) => {
            const { label, color, bg } = statusConfig[booking.status];
            const timeStr = booking.startTime.split('T')[1]?.slice(0,5) + ' – ' + booking.endTime.split('T')[1]?.slice(0,5);
            return (
              <View key={booking.id} style={styles.card}>
                {/* Top Row */}
                <View style={styles.cardTop}>
                  <View style={styles.cardLabRow}>
                    <View style={styles.labIcon}>
                      <FlaskConical size={15} color="#F97316" />
                    </View>
                    <Text style={styles.labName} numberOfLines={1}>{booking.labName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color }]}>{label}</Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <CalendarDays size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{formatDate(booking.startTime.split('T')[0])}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{timeStr}</Text>
                  </View>
                </View>

                {/* Purpose */}
                <Text style={styles.purposeText} numberOfLines={2}>{booking.purpose}</Text>

                {/* Rejection Note */}
                {booking.status === 'REJECTED' && booking.note && (
                  <View style={styles.rejectNote}>
                    <Text style={styles.rejectNoteText}>Reason: {booking.note}</Text>
                  </View>
                )}

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.locationText}>{booking.labLocation}</Text>
                  <ChevronRight size={14} color="#D1D5DB" />
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
    width: 36,
    height: 36,
    backgroundColor: '#F97316',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  filterTabActive: { backgroundColor: '#F97316' },
  filterTabText: { fontSize: 12, color: '#6B7280' },
  filterTabTextActive: { color: '#FFFFFF', fontWeight: '500' },
  filterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 14, color: '#9CA3AF' },
  emptyHint: { fontSize: 12, color: '#D1D5DB' },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  labIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labName: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '500' },
  cardMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#6B7280' },
  purposeText: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, marginBottom: 4 },
  rejectNote: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  rejectNoteText: { fontSize: 11, color: '#EF4444' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  locationText: { fontSize: 11, color: '#D1D5DB' },
});
