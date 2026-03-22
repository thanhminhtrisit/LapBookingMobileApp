import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  MapPin,
  Users,
  FlaskConical,
  Cpu,
  Atom,
  Network,
  Microscope,
  Package,
  CheckCircle2,
  AlertCircle,
  Wrench,
  XCircle,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const labIconMap: Record<number, React.ReactNode> = {
  1: <Cpu size={28} color="#3B82F6" />,
  2: <FlaskConical size={28} color="#A855F7" />,
  3: <Atom size={28} color="#22C55E" />,
  4: <Network size={28} color="#F97316" />,
  5: <Microscope size={28} color="#EC4899" />,
};

const labBgMap: Record<number, string> = {
  1: '#EFF6FF',
  2: '#FAF5FF',
  3: '#F0FDF4',
  4: '#FFF7ED',
  5: '#FDF2F8',
};

export default function LabDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { labs } = useApp();
  const insets = useSafeAreaInsets();

  const lab = labs.find((l) => l.id === route.params?.id);

  if (!lab) {
    return (
      <View style={[styles.container, styles.center]}>
        <FlaskConical size={40} color="#D1D5DB" strokeWidth={1} />
        <Text style={styles.notFoundText}>Lab not found</Text>
      </View>
    );
  }

  const statusConfig = {
    ACTIVE: {
      icon: <CheckCircle2 size={14} color="#22C55E" />,
      text: 'Available',
      color: '#22C55E',
      bg: '#F0FDF4',
    },
    MAINTENANCE: {
      icon: <Wrench size={14} color="#F59E0B" />,
      text: 'Under Maintenance',
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    CLOSED: {
      icon: <XCircle size={14} color="#EF4444" />,
      text: 'Closed',
      color: '#EF4444',
      bg: '#FEF2F2',
    },
  };

  const isOccupied = lab.isOccupied === true;
  const statusInfo = isOccupied
    ? {
        icon: <AlertCircle size={14} color="#EF4444" />,
        text: 'Currently Occupied',
        color: '#EF4444',
        bg: '#FEF2F2',
      }
    : statusConfig[lab.status];

  const canBook = lab.status === 'ACTIVE' && !lab.isOccupied;

  const btnLabel = canBook
    ? 'Book This Lab'
    : isOccupied
    ? 'Currently Occupied'
    : 'Not Available';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Details</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lab Header Card */}
        <View style={styles.labCard}>
          <View
            style={[
              styles.labIconBox,
              { backgroundColor: labBgMap[parseInt(lab.id.split('-')[1])] ?? '#F9FAFB' },
            ]}
          >
            {labIconMap[parseInt(lab.id.split('-')[1])] ?? <FlaskConical size={28} color="#9CA3AF" />}
          </View>
          <View style={styles.labCardInfo}>
            <Text style={styles.labName}>{lab.name}</Text>
            <Text style={styles.labFaculty}>{lab.faculty}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
              {statusInfo.icon}
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Pills */}
        <View style={styles.infoPills}>
          <View style={[styles.infoPill, { flex: 1 }]}>
            <MapPin size={14} color="#F97316" />
            <Text style={styles.infoText}>{lab.location}</Text>
          </View>
          <View style={styles.infoPill}>
            <Users size={14} color="#F97316" />
            <Text style={styles.infoText}>{lab.capacity} seats</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Lab</Text>
          <Text style={styles.description}>{lab.description}</Text>
        </View>

        {/* Equipment */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.equipmentHeader}>
            <Package size={15} color="#374151" />
            <Text style={styles.sectionTitle}>Available Equipment</Text>
          </View>
          <View style={styles.equipmentList}>
            {lab.equipment.map((eq) => (
              <View key={eq.id} style={styles.equipmentItem}>
                <View style={styles.equipmentLeft}>
                  <View style={styles.dot} />
                  <Text style={styles.equipmentName}>{eq.name}</Text>
                </View>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>×{eq.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
          activeOpacity={canBook ? 0.8 : 1}
          onPress={() => canBook && navigation.navigate('Booking', { id: lab.id })}
          disabled={!canBook}
        >
          <Text style={[styles.bookBtnText, !canBook && styles.bookBtnTextDisabled]}>
            {btnLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  notFoundText: { fontSize: 14, color: '#9CA3AF' },
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
  headerTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  scroll: { flex: 1 },
  labCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  labIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labCardInfo: { flex: 1 },
  labName: { fontSize: 17, color: '#111827', fontWeight: '600' },
  labFaculty: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: { fontSize: 11, fontWeight: '500' },
  infoPills: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: { fontSize: 12, color: '#4B5563', flexShrink: 1 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 14, color: '#111827', fontWeight: '500', marginBottom: 8 },
  description: { fontSize: 13, color: '#6B7280', lineHeight: 22 },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  equipmentList: { gap: 8 },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  equipmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  equipmentName: { fontSize: 13, color: '#374151' },
  qtyBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyText: { fontSize: 11, color: '#F97316' },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookBtn: {
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
  bookBtnDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  bookBtnTextDisabled: { color: '#9CA3AF' },
});
