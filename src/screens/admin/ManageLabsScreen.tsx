import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FlaskConical,
  Cpu,
  Atom,
  Network,
  Microscope,
  ChevronRight,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Lab, LabStatus } from '../../data/mockData';

const labIconMap: Record<number, React.ReactNode> = {
  1: <Cpu size={18} color="#3B82F6" />,
  2: <FlaskConical size={18} color="#A855F7" />,
  3: <Atom size={18} color="#22C55E" />,
  4: <Network size={18} color="#F97316" />,
  5: <Microscope size={18} color="#EC4899" />,
};

const statusConfig: Record<LabStatus, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Available', color: '#22C55E', bg: '#F0FDF4' },
  MAINTENANCE: { label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  CLOSED: { label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
};

export default function ManageLabsScreen() {
  const navigation = useNavigation<any>();
  const { labs, deleteLab } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = labs.filter(
    (lab) =>
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteLab(id);
    setDeleteConfirm(null);
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
            placeholder="Search labs..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { s: 'ACTIVE' as LabStatus, label: 'Available', color: '#22C55E', bg: '#F0FDF4' },
          { s: 'MAINTENANCE' as LabStatus, label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
          { s: 'CLOSED' as LabStatus, label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
        ].map(({ s, label, color, bg }) => {
          const count = labs.filter((l) => l.status === s).length;
          return (
            <View key={s} style={[styles.statCard, { backgroundColor: bg }]}>
              <Text style={[styles.statValue, { color }]}>{count}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          );
        })}
      </View>

      {/* Labs List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <FlaskConical size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No labs found</Text>
          </View>
        ) : (
          filtered.map((lab: Lab) => {
            const isOccupied = lab.isOccupied === true;
            const status = isOccupied
              ? { label: 'Occupied', color: '#EF4444', bg: '#FEF2F2' }
              : statusConfig[lab.status];
            return (
              <View key={lab.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.labIconBox}>
                    {labIconMap[parseInt(lab.id.split('-')[1])] ?? <FlaskConical size={18} color="#9CA3AF" />}
                  </View>
                  <View style={styles.labInfo}>
                    <Text style={styles.labName} numberOfLines={1}>{lab.name}</Text>
                    <Text style={styles.labMeta} numberOfLines={1}>
                      {lab.building} · {lab.faculty}
                    </Text>
                    <View style={styles.labFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                      <Text style={styles.capacityText}>
                        {lab.capacity} seats · {lab.equipment.length} equipment
                      </Text>
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
                    onPress={() => navigation.navigate('LabForm', { id: lab.id })}
                  >
                    <ChevronRight size={13} color="#60A5FA" />
                    <Text style={[styles.actionBtnText, { color: '#60A5FA' }]}>Equipment</Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={() => setDeleteConfirm(lab.id)}
                  >
                    <Trash2 size={13} color="#EF4444" />
                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Delete Confirm Modal */}
      <Modal
        visible={Boolean(deleteConfirm)}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteConfirm(null)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />
            <View style={styles.trashIcon}>
              <Trash2 size={22} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Lab?</Text>
            <Text style={styles.modalSub}>
              This action cannot be undone. All associated bookings will remain.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteConfirm(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                activeOpacity={0.8}
                onPress={() => deleteConfirm && handleDelete(deleteConfirm)}
              >
                <Text style={styles.deleteBtnText}>Delete Lab</Text>
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
  capacityText: { fontSize: 11, color: '#9CA3AF' },
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
  // Modal
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
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  trashIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, color: '#111827', fontWeight: '600', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});
