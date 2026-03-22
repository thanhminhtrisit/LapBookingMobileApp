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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

const statusOptions: { value: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'; label: string; color: string; bg: string }[] = [
  { value: 'ACTIVE', label: 'Active', color: '#22C55E', bg: '#F0FDF4' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'CLOSED', label: 'Closed', color: '#EF4444', bg: '#FEF2F2' },
];

const faculties = ['CS & IT', 'Engineering', 'Sciences', 'Business', 'Arts'];

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
  wrapper: { marginBottom: 16 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4 },
});

export default function LabFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { labs, createLab, updateLab, updateLabStatus } = useApp();
  const insets = useSafeAreaInsets();

  const id = route.params?.id;
  const isEdit = Boolean(id);
  const existingLab = labs.find((l) => l.id === id);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [building, setBuilding] = useState('');
  const [location, setLocation] = useState('');
  const [faculty, setFaculty] = useState(faculties[0]);
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'CLOSED'>('ACTIVE');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingLab) {
      setName(existingLab.name);
      setCode(existingLab.code || '');
      setBuilding(existingLab.building || '');
      setLocation(existingLab.location);
      setFaculty(existingLab.faculty || faculties[0]);
      setCapacity(String(existingLab.capacity));
      setStatus(existingLab.status as any);
      setDescription(existingLab.description);
      setImageURL(existingLab.imageURL || '');
    }
  }, [id, existingLab]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Lab name is required';
    if (!code.trim()) errs.code = 'Lab code is required';
    if (!building.trim()) errs.building = 'Building is required';
    if (!location.trim()) errs.location = 'Location is required';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1)
      errs.capacity = 'Valid capacity required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    const labData: any = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      building: building.trim(),
      faculty: faculty,
      location: location.trim(),
      capacity: Number(capacity),
      status,
      description: description.trim(),
      imageURL: imageURL.trim() || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800',
      equipment: existingLab?.equipment || "[]",
    };

    try {
      if (isEdit && id) {
        await updateLab(id, labData);
        // Explicitly update status if it changed, as PUT might ignore it
        if (existingLab && existingLab.status !== status) {
          await updateLabStatus(id, status);
        }
      } else {
        // Backend requires createdAt for insert but isn't auto-generating it correctly
        labData.createdAt = new Date().toISOString();
        await createLab(labData);
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to save lab:', error);
      setErrors({ submit: 'Failed to save lab. Please try again.' });
    } finally {
      setLoading(false);
    }
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
        {errors.submit ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.submit}</Text>
          </View>
        ) : null}

        {/* Basic Info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>LAB DETAILS</Text>
          <InputField
            label="Lab Name *"
            value={name}
            onChange={setName}
            placeholder="e.g. Computer Science Lab A"
            error={errors.name}
          />
          <InputField
            label="Lab Code *"
            value={code}
            onChange={setCode}
            placeholder="e.g. LAB-101"
            error={errors.code}
          />
          <InputField
            label="Building *"
            value={building}
            onChange={setBuilding}
            placeholder="e.g. Building C"
            error={errors.building}
          />
          <InputField
            label="Location/Room *"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Room 201"
            error={errors.location}
          />

          <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>Faculty</Text>
            <View style={styles.facultyRow}>
              {faculties.map((f) => {
                const active = faculty === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.facultyChip, active && styles.facultyChipActive]}
                    onPress={() => setFaculty(f)}
                  >
                    <Text style={[styles.facultyChipText, active && styles.facultyChipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <InputField
            label="Capacity *"
            value={capacity}
            onChange={setCapacity}
            placeholder="e.g. 30"
            keyboardType="numeric"
            error={errors.capacity}
          />
          
          {/* Status Select */}
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

          <InputField
            label="Image URL"
            value={imageURL}
            onChange={setImageURL}
            placeholder="https://example.com/image.jpg"
          />
          
          <Text style={fieldStyles.label}>Description *</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description ? styles.textAreaError : null,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Lab purpose and features..."
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={fieldStyles.errorText}>{errors.description}</Text>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          activeOpacity={0.8} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create Lab'}</Text>
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
  headerTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  formSection: { marginBottom: 20 },
  sectionHeader: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  statusOptionText: { fontSize: 11, fontWeight: '500' },
  facultyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  facultyChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  facultyChipActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  facultyChipText: { fontSize: 12, color: '#6B7280' },
  facultyChipTextActive: { color: '#F97316', fontWeight: '600' },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  textAreaError: { borderColor: '#EF4444' },
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
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorBannerText: { fontSize: 13, color: '#EF4444', textAlign: 'center' },
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
});
