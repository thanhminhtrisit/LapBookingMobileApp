import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  FlaskConical,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { BookingResponse } from '../../services/api';

// Helper functions for date/time extraction from ISO string
const formatDateFromISO = (iso: string) => {
  if (!iso) return '';
  const [datePart] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

const formatTimeRange = (startTime: string, endTime: string) => {
  const start = startTime.split('T')[1]?.slice(0, 5) ?? '';
  const end   = endTime.split('T')[1]?.slice(0, 5)   ?? '';
  return `${start} – ${end}`;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  APPROVED: { label: 'Approved', color: '#22C55E', bg: '#F0FDF4' },
  REJECTED: { label: 'Rejected', color: '#EF4444', bg: '#FEF2F2' },
  PENDING:  { label: 'Pending Review', color: '#F59E0B', bg: '#FFFBEB' },
  CANCELLED: { label: 'Cancelled', color: '#9CA3AF', bg: '#F3F4F6' },
};

const avatarColors = [
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#F3E8FF', text: '#7C3AED' },
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#E0E7FF', text: '#4338CA' },
];

const getAvatarColor = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
const filterTabs: { id: FilterType; label: string }[] = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'ALL', label: 'All' },
];

export default function ApprovalsScreen() {
  const { pendingBookings, bookingsLoading, fetchPendingBookings, approveBooking, rejectBooking } = useApp();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
  const [rejectModal, setRejectModal] = useState<{ bookingId: number } | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchPendingBookings();
    }, [fetchPendingBookings])
  );

  const pendingCount = pendingBookings.filter((b) => b.status === 'PENDING').length;
  const approvedCount = pendingBookings.filter((b) => b.status === 'APPROVED').length;
  const rejectedCount = pendingBookings.filter((b) => b.status === 'REJECTED').length;

  const filtered = [...pendingBookings]
    .filter((b) => (activeFilter === 'ALL' ? true : b.status === activeFilter))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApprove = async (id: number) => {
    await approveBooking(id);
    fetchPendingBookings();
  };

  const handleReject = async (id: number) => {
    await rejectBooking(id, rejectNote || 'Request not approved by admin.');
    setRejectModal(null);
    setRejectNote('');
    fetchPendingBookings();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Orange Header */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Lab Approvals</Text>
        <Text style={styles.headerSub}>Manage student reservation requests</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Pending', value: pendingCount, color: '#FDE68A' },
            { label: 'Approved', value: approvedCount, color: '#BBF7D0' },
            { label: 'Rejected', value: rejectedCount, color: '#FECACA' },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.filterTab, activeFilter === tab.id && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, activeFilter === tab.id && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Requests List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {bookingsLoading && filtered.length === 0 ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        ) : (
          filtered.map((booking: BookingResponse) => {
            const sc = statusConfig[booking.status] || statusConfig.PENDING;
            const av = getAvatarColor(booking.userName);
            return (
              <View key={booking.id} style={styles.card}>
                {/* Student Row */}
                <View style={styles.studentRow}>
                  <View style={[styles.studentAvatar, { backgroundColor: av.bg }]}>
                    <Text style={[styles.studentAvatarText, { color: av.text }]}>
                      {getInitials(booking.userName)}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{booking.userName}</Text>
                    <Text style={styles.studentFaculty}>Member Request</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>

                {/* Lab Info */}
                <View style={styles.labInfo}>
                  <FlaskConical size={14} color="#F97316" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labName} numberOfLines={1}>{booking.labName}</Text>
                    <Text style={styles.labLocation}>{booking.labLocation}</Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <CalendarDays size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{formatDateFromISO(booking.startTime)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={[styles.purposeText, { fontWeight: '600', color: '#111827' }]}>{booking.title}</Text>
                {booking.note && booking.status !== 'REJECTED' && (
                  <Text style={styles.purposeText} numberOfLines={2}>{booking.note}</Text>
                )}

                {/* Action Buttons */}
                {booking.status === 'PENDING' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      activeOpacity={0.8}
                      onPress={() => handleApprove(booking.id)}
                    >
                      <CheckCircle size={15} color="#22C55E" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      activeOpacity={0.8}
                      onPress={() => setRejectModal({ bookingId: booking.id })}
                    >
                      <XCircle size={15} color="#EF4444" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Rejection Note */}
                {booking.status === 'REJECTED' && booking.note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>Reason: {booking.note}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={Boolean(rejectModal)}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRejectModal(null)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reject Booking</Text>
            <Text style={styles.modalSub}>Provide a reason for rejection (optional)</Text>
            <TextInput
              style={styles.rejectNoteInput}
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder="e.g. Time slot unavailable, lab maintenance..."
              placeholderTextColor="#D1D5DB"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                activeOpacity={0.8}
                onPress={() => rejectModal && handleReject(rejectModal.bookingId)}
              >
                <Text style={styles.modalConfirmText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 },
  headerTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '600' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  filterRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: '#F97316' },
  filterTabText: { fontSize: 11, color: '#6B7280' },
  filterTabTextActive: { color: '#FFFFFF', fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
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
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: { fontSize: 12, fontWeight: '600' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 13, color: '#111827', fontWeight: '500' },
  studentFaculty: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '500' },
  labInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  labName: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  labLocation: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#6B7280' },
  purposeText: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
  },
  approveBtnText: { fontSize: 13, color: '#22C55E', fontWeight: '500' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
  },
  rejectBtnText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  noteBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  noteText: { fontSize: 11, color: '#EF4444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, color: '#111827', fontWeight: '600', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  rejectNoteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    color: '#374151',
    minHeight: 80,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
