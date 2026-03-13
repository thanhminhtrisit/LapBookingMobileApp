import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  BellOff,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../data/mockData';

const notifConfig = {
  success: { color: '#22C55E', bg: '#F0FDF4' },
  error: { color: '#EF4444', bg: '#FEF2F2' },
  warning: { color: '#F59E0B', bg: '#FFFBEB' },
  info: { color: '#60A5FA', bg: '#EFF6FF' },
};

const NotifIcon = ({ type, size = 18 }: { type: AppNotification['type']; size?: number }) => {
  const { color } = notifConfig[type];
  if (type === 'success') return <CheckCircle2 size={size} color={color} />;
  if (type === 'error') return <XCircle size={size} color={color} />;
  if (type === 'warning') return <AlertTriangle size={size} color={color} />;
  return <Info size={size} color={color} />;
};

const timeAgo = (iso: string) => {
  const now = new Date('2026-03-12T12:00:00Z');
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function AdminNotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const insets = useSafeAreaInsets();
  const unread = notifications.filter((n) => !n.read).length;

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && (
            <Text style={styles.headerSub}>
              {unread} unread alert{unread > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff size={44} color="#E5E7EB" strokeWidth={1} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          sorted.map((notif, idx) => {
            const { bg } = notifConfig[notif.type];
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifItem,
                  !notif.read && styles.notifItemUnread,
                  idx < sorted.length - 1 && styles.notifItemBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => markNotificationRead(notif.id)}
              >
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <NotifIcon type={notif.type} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text
                      style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <View style={styles.notifMeta}>
                      <Text style={styles.timeText}>{timeAgo(notif.timestamp)}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
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
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 12 },
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
