import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  MapPin,
  Users,
  FlaskConical,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Package,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { LabResponse } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const labIconMap: Record<string, React.ReactNode> = {
  'AVAILABLE': <Cpu size={28} color="#3B82F6" />,
  'OCCUPIED': <FlaskConical size={28} color="#EF4444" />,
  'MAINTENANCE': <Wrench size={28} color="#F59E0B" />,
};

const statusConfig = {
  AVAILABLE: {
    icon: <CheckCircle2 size={14} color="#22C55E" />,
    text: 'Available',
    color: '#22C55E',
    bg: '#F0FDF4',
  },
  OCCUPIED: {
    icon: <AlertCircle size={14} color="#EF4444" />,
    text: 'Currently Occupied',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  MAINTENANCE: {
    icon: <Wrench size={14} color="#F59E0B" />,
    text: 'Under Maintenance',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
};

export default function LabDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { labs } = useApp();
  const insets = useSafeAreaInsets();

  const lab: LabResponse | undefined = labs.find((l) => l.id === route.params?.id);

  if (!lab) {
    return (
      <View style={[styles.container, styles.center]}>
        <FlaskConical size={40} color="#D1D5DB" strokeWidth={1} />
        <Text style={styles.notFoundText}>Lab not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn2}>
          <Text style={styles.backBtn2Text}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Derive display status
  let displayStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' = 'AVAILABLE';
  if (lab.status === 'MAINTENANCE' || lab.status === 'CLOSED') {
    displayStatus = 'MAINTENANCE';
  } else if (lab.isOccupied) {
    displayStatus = 'OCCUPIED';
  }

  const statusInfo = statusConfig[displayStatus];

  const btnLabel =
    displayStatus === 'AVAILABLE'
      ? 'Book This Lab'
      : displayStatus === 'OCCUPIED'
        ? 'Currently Occupied'
        : 'Under Maintenance';

  const canBook = displayStatus === 'AVAILABLE';

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
        {/* Lab Image/Header */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: lab.imageURL || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800' }}
            style={styles.labImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Lab Info Card */}
        <View style={styles.labCard}>
          <View style={styles.labCardHeader}>
            <View style={styles.labIconBox}>
              {labIconMap[displayStatus] ?? <FlaskConical size={28} color="#9CA3AF" />}
            </View>
            <View style={styles.labCardInfo}>
              <Text style={styles.labName}>{lab.name}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
                {statusInfo.icon}
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoPills}>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#F97316" />
              <Text style={styles.infoText}>{lab.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Users size={16} color="#F97316" />
              <Text style={styles.infoText}>{lab.capacity} seats available</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Lab</Text>
          <Text style={styles.description}>{lab.description}</Text>
        </View>

        {/* Lab Features */}
        <View style={[styles.section, { paddingBottom: 120 }]}>
          <View style={styles.equipmentHeader}>
            <Package size={15} color="#374151" />
            <Text style={styles.sectionTitle}>Lab Features</Text>
          </View>
          <View style={styles.featuresList}>
            {['High-speed Internet', 'Multimedia Projector', 'Air Conditioned', 'Modern Workstations'].map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <CheckCircle2 size={14} color="#22C55E" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            !canBook && styles.bookBtnDisabled,
          ]}
          activeOpacity={canBook ? 0.8 : 1}
          onPress={() => {
            if (canBook) {
              navigation.navigate('Booking', { id: lab.id });
            }
          }}
          disabled={!canBook}
        >
          <Text
            style={[
              styles.bookBtnText,
              !canBook && styles.bookBtnTextDisabled,
            ]}
          >
            {btnLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
  backBtn2: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F97316', borderRadius: 8, marginTop: 10 },
  backBtn2Text: { color: '#FFFFFF', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
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
  imageSection: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  labImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  labCard: {
    margin: 16,
    marginTop: -40,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  labCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  labIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  labCardInfo: { flex: 1 },
  labName: { fontSize: 18, color: '#111827', fontWeight: '700' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  infoPills: { gap: 12 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: { fontSize: 13, color: '#4B5563' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 15, color: '#111827', fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  featuresList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureText: { fontSize: 12, color: '#4B5563' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 15,
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
  bookBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  bookBtnTextDisabled: { color: '#9CA3AF' },
});
borderColor: '#F3F4F6',
  },
featureText: { fontSize: 12, color: '#4B5563' },
footer: {
  paddingHorizontal: 20,
    paddingTop: 12,
      backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
            position: 'absolute',
              bottom: 0,
                left: 0,
                  right: 0,
  },
bookBtn: {
  backgroundColor: '#F97316',
    borderRadius: 12,
      paddingVertical: 15,
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
bookBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
bookBtnTextDisabled: { color: '#9CA3AF' },
});
