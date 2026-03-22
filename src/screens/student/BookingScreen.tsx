import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '08:00 – 12:00', start: '08:00:00', end: '12:00:00', color: '#F59E0B' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00 – 17:00', start: '13:00:00', end: '17:00:00', color: '#F97316' },
  { id: 'evening', label: 'Evening', time: '18:00 – 22:00', start: '18:00:00', end: '22:00:00', color: '#6366F1' },
];

const TimeSlotIcon = ({ id, size = 18 }: { id: string; size?: number }) => {
  if (id === 'morning') return <Sun size={size} color="#F59E0B" />;
  if (id === 'afternoon') return <Sunset size={size} color="#F97316" />;
  return <Moon size={size} color="#6366F1" />;
};

const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

const formatDate = (d: Date) => {
  const dd = d.getDate();
  const mm = MONTHS[d.getMonth()].slice(0, 3);
  const yy = d.getFullYear();
  return `${dd} ${mm} ${yy}`;
};

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { labs, createBooking } = useApp();
  const insets = useSafeAreaInsets();

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lab = labs.find((l) => l.id.toString() === route.params?.id.toString());
  if (!lab) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (d: number) =>
    year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  const isPast = (d: number) => new Date(year, month, d) < today;
  const isSelected = (d: number) =>
    selectedDate?.getFullYear() === year &&
    selectedDate?.getMonth() === month &&
    selectedDate?.getDate() === d;

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlotId || !title.trim()) return;
    
    setLoading(true);
    const slot = timeSlots.find(s => s.id === selectedSlotId)!;
    
    // Format: YYYY-MM-DDTHH:mm:ss
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const startTime = `${dateStr}T${slot.start}`;
    const endTime = `${dateStr}T${slot.end}`;

    try {
      await createBooking({
        labId: lab.id,
        title: title.trim(),
        startTime,
        endTime,
        note: note.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to create booking:', error);
      Alert.alert('Error', 'Failed to submit booking. This slot might be taken or the server is busy.');
    } finally {
      setLoading(false);
    }
  };

  const canConfirm = Boolean(selectedDate && selectedSlotId && title.trim()) && !loading;

  if (submitted) {
    const slot = timeSlots.find(s => s.id === selectedSlotId);
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={40} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Booking Submitted!</Text>
        <Text style={styles.successLab}>{lab.name}</Text>
        <Text style={styles.successDate}>{selectedDate ? formatDate(selectedDate) : ''}</Text>
        <Text style={styles.successSlot}>
          {slot?.time}
        </Text>

        <View style={styles.pendingNote}>
          <Text style={styles.pendingNoteText}>
            Your request is pending admin approval. You'll be notified once it's reviewed.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewBookingsBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.viewBookingsBtnText}>View My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('HomeTabs')} style={{ marginTop: 12 }}>
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reserve Lab</Text>
          <Text style={styles.headerSub}>{lab.name}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Calendar */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <View style={styles.calendar}>
            {/* Month Nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setViewDate(new Date(year, month - 1, 1))}
              >
                <ChevronLeft size={16} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS[month]} {year}
              </Text>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => setViewDate(new Date(year, month + 1, 1))}
              >
                <ChevronRight size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.daysRow}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Date Grid */}
            <View style={styles.datesGrid}>
              {calendarCells.map((d, i) => {
                if (d === null) return <View key={`e-${i}`} style={styles.dateCell} />;
                const past = isPast(d);
                const today_ = isToday(d);
                const sel = isSelected(d);
                return (
                  <TouchableOpacity
                    key={d}
                    style={styles.dateCell}
                    disabled={past}
                    onPress={() => setSelectedDate(new Date(year, month, d))}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.dateDot,
                        sel && styles.dateDotSelected,
                        today_ && !sel && styles.dateDotToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          sel && styles.dateTextSelected,
                          today_ && !sel && styles.dateTextToday,
                          past && styles.dateTextPast,
                        ]}
                      >
                        {d}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate && (
            <Text style={styles.selectedDateText}>Selected: {formatDate(selectedDate)}</Text>
          )}
        </View>

        {/* Time Slots */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Select Time Slot</Text>
          <View style={styles.slots}>
            {timeSlots.map((slot) => {
              const active = selectedSlotId === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotCard, active && styles.slotCardActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSlotId(slot.id)}
                >
                  <View style={[styles.slotIconBox, active && styles.slotIconBoxActive]}>
                    <TimeSlotIcon id={slot.id} />
                  </View>
                  <View style={styles.slotInfo}>
                    <Text style={[styles.slotLabel, active && styles.slotLabelActive]}>
                      {slot.label}
                    </Text>
                    <Text style={styles.slotTime}>{slot.time}</Text>
                  </View>
                  {active && (
                    <View style={styles.slotCheck}>
                      <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Title */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Purpose Title *</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Practicing Mobile App Development"
            placeholderTextColor="#D1D5DB"
          />
        </View>

        {/* Purpose */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Detailed Note (Optional)</Text>
          <TextInput
            style={styles.purposeInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add any additional details for the admin..."
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          activeOpacity={canConfirm ? 0.8 : 1}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.confirmBtnText, !canConfirm && styles.confirmBtnTextDisabled]}>
              Confirm Reservation
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  sectionBlock: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: '#111827', fontWeight: '500', marginBottom: 12 },

  // Calendar
  calendar: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontSize: 14, color: '#111827', fontWeight: '500' },
  daysRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: '#9CA3AF' },
  datesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  dateDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDotSelected: { backgroundColor: '#F97316' },
  dateDotToday: { borderWidth: 2, borderColor: '#F97316' },
  dateText: { fontSize: 13, color: '#374151' },
  dateTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  dateTextToday: { color: '#F97316', fontWeight: '600' },
  dateTextPast: { color: '#D1D5DB' },
  selectedDateText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#F97316',
    marginTop: 8,
  },

  // Time slots
  slots: { gap: 8 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slotCardActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  slotIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconBoxActive: { backgroundColor: '#FFFFFF' },
  slotInfo: { flex: 1 },
  slotLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  slotLabelActive: { color: '#F97316' },
  slotTime: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  slotCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inputs
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  purposeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  confirmBtnTextDisabled: { color: '#9CA3AF' },

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: { fontSize: 20, color: '#111827', fontWeight: '600', marginBottom: 8 },
  successLab: { fontSize: 14, color: '#6B7280' },
  successDate: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  successSlot: { fontSize: 13, color: '#9CA3AF', marginTop: 2, marginBottom: 16 },
  pendingNote: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    width: '100%',
  },
  pendingNoteText: { fontSize: 13, color: '#F59E0B', textAlign: 'center', lineHeight: 20 },
  viewBookingsBtn: {
    width: '100%',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewBookingsBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  backHomeText: { fontSize: 14, color: '#9CA3AF' },
});
