import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Info,
  BellOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { NotificationResponse } from '../../services/api';

const notifConfig: Record<string, { color: string; bg: string; icon: any }> = {
  BOOKING_APPROVED: { color: '#22C55E', bg: '#F0FDF4', icon: CheckCircle },
  BOOKING_REJECTED: { color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  BOOKING_CANCELLED: { color: '#9CA3AF', bg: '#F3F4F6', icon: XCircle },
  LAB_MAINTENANCE: { color: '#F59E0B', bg: '#FFFBEB', icon: AlertTriangle },
  LAB_CLOSED: { color: '#EF4444', bg: '#FEF2F2', icon: AlertTriangle },
  BOOKING_IN_PROGRESS: { color: '#3B82F6', bg: '#EFF6FF', icon: Info },
  DEFAULT: { color: '#60A5FA', bg: '#EFF6FF', icon: Info },
};

const timeAgo = (iso: string) => {
  if (!iso) return '';
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function AdminNotificationsScreen() {
  const { notifications, notificationsLoading, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const insets = useSafeAreaInsets();
  
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={sorted.length === 0 ? { flex: 1 } : null}>
        {notificationsLoading && sorted.length === 0 ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          sorted.map((notif: NotificationResponse, idx) => {
            const config = notifConfig[notif.type] || notifConfig.DEFAULT;
            const IconComp = config.icon;
            
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifItem,
                  !notif.isRead && styles.notifItemUnread,
                  idx < sorted.length - 1 && styles.notifItemBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => !notif.isRead && markNotificationRead(notif.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                  <IconComp size={18} color={config.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text
                      style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <View style={styles.notifMeta}>
                      <Text style={styles.timeText}>{timeAgo(notif.createdAt)}</Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, color: '#111827', fontWeight: '600' },
  headerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  markAllText: { fontSize: 13, color: '#F97316', marginTop: 4 },
  scroll: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 100, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  notifItemUnread: { backgroundColor: 'rgba(249, 115, 22, 0.04)' },
  notifItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: { fontSize: 13, color: '#6B7280', flex: 1 },
  notifTitleUnread: { color: '#111827', fontWeight: '500' },
  notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 11, color: '#D1D5DB' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F97316' },
  notifMessage: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
});
