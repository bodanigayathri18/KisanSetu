import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCheck, Bell, Clock, AlertCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, t } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="notification-drawer-panel"
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <h2 className="font-semibold text-stone-900 text-base">{t.common.notifications}</h2>
            {unreadCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={markAllNotificationsRead}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t.common.markAllRead}
              </button>
            )}
            <button
              id="btn-close-notifications"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">{t.common.noNotifications}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const dateStr = new Date(notif.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    notif.read
                      ? 'bg-white border-stone-200 text-stone-700'
                      : 'bg-emerald-50/70 border-emerald-300 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm leading-snug">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">{notif.message}</p>
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>
                    <span className="font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 uppercase text-[10px]">
                      {notif.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
