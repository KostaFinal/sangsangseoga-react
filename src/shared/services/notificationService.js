/**
 * Notification Service Layer (알림 API 연동 서비스)
 */
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from '../../api/notificationApi';

const unwrap = (res) => {
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청 처리 중 문제가 발생했습니다.');
  }
  return body.data;
};

// 알림 발생 시각을 "방금 전 / n분 전 / n시간 전 / n일 전" 형태로 변환
const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
};

const mapNotification = (n) => ({
  id: n.id,
  text: n.text,
  time: formatRelativeTime(n.createdAt),
  read: n.read,
});

export const notificationService = {
  /** 내 알림 목록 조회 (최신순) */
  getNotifications: async (page = 0, size = 20) => {
    const data = unwrap(await getNotifications(page, size));
    return {
      items: (data.items || []).map(mapNotification),
      totalCount: data.totalCount || 0,
      hasNext: !!data.hasNext,
    };
  },

  /** 알림 하나 읽음 처리 */
  markAsRead: async (id) => {
    await markNotificationAsRead(id);
  },

  /** 전체 읽음 처리 */
  markAllAsRead: async () => {
    await markAllNotificationsAsRead();
  },

  /** 전체 삭제 */
  clearAll: async () => {
    await deleteAllNotifications();
  },
};
