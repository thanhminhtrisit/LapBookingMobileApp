import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  ChevronDown,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { LabStatus, Equipment } from '../../data/mockData';

const faculties = [
  'Computer Science & IT',
  'Electrical Engineering',
  'Applied Sciences',
  'Life Sciences',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
];

const statusOptions: { value: LabStatus; label: string; color: string; bg: string }[] = [
  { value: 'ACTIVE', label: 'Available', color: '#22C55E', bg: '#F0FDF4' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'CLOSED', label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
];

interface EquipmentInput {
  id: string;
  name: string;
  quantity: string;
}

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric';
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#D1D5DB"
      keyboardType={keyboardType}
    />
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4 },
});

export default function LabFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { labs, addLab, updateLab } = useApp();
  const insets = useSafeAreaInsets();

  const id = route.params?.id;
  const isEdit = Boolean(id);
  const existingLab = labs.find((l) => l.id === id);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [building, setBuilding] = useState('');
  const [capacity, setCapacity] = useState('');
  const [faculty, setFaculty] = useState(faculties[0]);
  const [status, setStatus] = useState<LabStatus>('ACTIVE');
  const [description, setDescription] = useState('');
  const [equipment, setEquipment] = useState<EquipmentInput[]>([
    { id: 'eq-new-1', name: '', quantity: '1' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [facultyPickerVisible, setFacultyPickerVisible] = useState(false);

  useEffect(() => {
    if (existingLab) {
      setName(existingLab.name);
      setLocation(existingLab.location);
      setBuilding(existingLab.building);
      setCapacity(String(existingLab.capacity));
      setFaculty(existingLab.faculty);
      setStatus(existingLab.status);
      setDescription(existingLab.description);
      setEquipment(
        existingLab.equipment.map((eq) => ({
          id: eq.id,
          name: eq.name,
          quantity: String(eq.quantity),
        }))
      );
    }
  }, [id]);

  const addEquipmentRow = () => {
    setEquipment((prev) => [
      ...prev,
      { id: `eq-new-${Date.now()}`, name: '', quantity: '1' },
    ]);
  };

  const removeEquipment = (eqId: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== eqId));
  };

  const updateEquipmentField = (eqId: string, field: 'name' | 'quantity', value: string) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === eqId ? { ...e, [field]: value } : e))
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Lab name is required';
    if (!location.trim()) errs.location = 'Location is required';
    if (!building.trim()) errs.building = 'Building is required';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1)
      errs.capacity = 'Valid capacity required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const finalEquipment: Equipment[] = equipment
      .filter((e) => e.name.trim())
      .map((e) => ({ id: e.id, name: e.name.trim(), quantity: Number(e.quantity) || 1 }));

    const labData = {
      name,
      location,
      building,
      capacity: Number(capacity),
      faculty,
      status,
      description,
      equipment: finalEquipment,
    };

    if (isEdit && id) {
      updateLab(id, labData);
    } else {
      addLab(labData);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={40} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>
          {isEdit ? 'Lab Updated!' : 'Lab Created!'}
        </Text>
        <Text style={styles.successSub}>
          {name} has been {isEdit ? 'updated' : 'added'} successfully.
        </Text>
        <TouchableOpacity
          style={styles.backBtn2}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ManageLabs')}
        >
          <Text style={styles.backBtn2Text}>Back to Manage Labs</Text>
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
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Lab' : 'Add New Lab'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Basic Info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>BASIC INFORMATION</Text>
          <InputField
            label="Lab Name *"
            value={name}
            onChange={setName}
            placeholder="e.g. Computer Science Lab A"
            error={errors.name}
          />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Building *"
                value={building}
                onChange={setBuilding}
                placeholder="e.g. Block C"
                error={errors.building}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Capacity *"
                value={capacity}
                onChange={setCapacity}
                placeholder="e.g. 30"
                keyboardType="numeric"
                error={errors.capacity}
              />
            </View>
          </View>
          <InputField
            label="Full Location *"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Block C, Level 2, Room C201"
            error={errors.location}
          />
        </View>

        {/* Classification */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>CLASSIFICATION</Text>

          {/* Faculty Picker */}
          <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>Faculty</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setFacultyPickerVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerBtnText}>{faculty}</Text>
              <ChevronDown size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Status */}
          <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>Status</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((opt) => {
                const active = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusOption,
                      active && {
                        borderColor: opt.color,
                        backgroundColor: opt.bg,
                      },
                    ]}
                    onPress={() => setStatus(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: active ? opt.color : '#9CA3AF' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.formSection}>
          <Text style={fieldStyles.label}>Description *</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description ? styles.textAreaError : null,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the lab's purpose, features, and intended use..."
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={fieldStyles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Equipment */}
        <View style={styles.formSection}>
          <View style={styles.equipHeader}>
            <View style={styles.equipHeaderLeft}>
              <Package size={14} color="#374151" />
              <Text style={styles.sectionHeader}>EQUIPMENT INVENTORY</Text>
            </View>
            <TouchableOpacity onPress={addEquipmentRow} activeOpacity={0.7}>
              <Text style={styles.addItemText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {equipment.length === 0 ? (
            <TouchableOpacity style={styles.addEquipEmpty} onPress={addEquipmentRow}>
              <Plus size={20} color="#D1D5DB" />
              <Text style={styles.addEquipEmptyText}>Add Equipment</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.equipList}>
              {equipment.map((eq, idx) => (
                <View key={eq.id} style={styles.equipRow}>
                  <Text style={styles.equipIdx}>{idx + 1}</Text>
                  <TextInput
                    style={styles.equipNameInput}
                    value={eq.name}
                    onChangeText={(v) => updateEquipmentField(eq.id, 'name', v)}
                    placeholder="Equipment name"
                    placeholderTextColor="#D1D5DB"
                  />
                  <View style={styles.equipQty}>
                    <Text style={styles.equipQtyX}>×</Text>
                    <TextInput
                      style={styles.equipQtyInput}
                      value={eq.quantity}
                      onChangeText={(v) => updateEquipmentField(eq.id, 'quantity', v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.equipRemoveBtn}
                    onPress={() => removeEquipment(eq.id)}
                  >
                    <Trash2 size={13} color="#D1D5DB" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create Lab'}</Text>
        </TouchableOpacity>
      </View>

      {/* Faculty Picker Modal */}
      <Modal
        visible={facultyPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFacultyPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFacultyPickerVisible(false)}
        >
          <TouchableOpacity style={styles.pickerSheet} activeOpacity={1}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Select Faculty</Text>
            {faculties.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.pickerItem, faculty === f && styles.pickerItemActive]}
                onPress={() => {
                  setFaculty(f);
                  setFacultyPickerVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerItemText, faculty === f && styles.pickerItemTextActive]}>
                  {f}
                </Text>
                {faculty === f && <CheckCircle2 size={16} color="#F97316" />}
              </TouchableOpacity>
            ))}
            <View style={{ height: insets.bottom + 8 }} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  formSection: { marginBottom: 20 },
  sectionHeader: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  twoCol: { flexDirection: 'row', gap: 12 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerBtnText: { fontSize: 14, color: '#374151' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  statusOptionText: { fontSize: 11, fontWeight: '500' },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
  },
  textAreaError: { borderColor: '#EF4444' },
  equipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  equipHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addItemText: { fontSize: 12, color: '#F97316' },
  addEquipEmpty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  addEquipEmptyText: { fontSize: 13, color: '#D1D5DB' },
  equipList: { gap: 8 },
  equipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  equipIdx: { fontSize: 12, color: '#D1D5DB', width: 16 },
  equipNameInput: { flex: 1, fontSize: 13, color: '#374151' },
  equipQty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  equipQtyX: { fontSize: 11, color: '#9CA3AF' },
  equipQtyInput: { width: 36, fontSize: 13, color: '#374151', textAlign: 'center' },
  equipRemoveBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveBtn: {
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
  saveBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
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
  successSub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 },
  backBtn2: {
    width: '100%',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtn2Text: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  // Faculty Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: {},
  pickerItemText: { fontSize: 14, color: '#374151' },
  pickerItemTextActive: { color: '#F97316', fontWeight: '500' },
});
