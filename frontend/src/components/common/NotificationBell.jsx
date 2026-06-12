import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';

const TYPE_ICON = {
  booking_request: '🔔',
  booking_accepted: '✅',
  booking_rejected: '❌',
  booking_cancelled: '❌',
  chat: '💬',
  admin: '📢',
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000); // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = ({ userId }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const panelRef = useRef(null);
  const prevUnread = useRef(0);

  const { notifications, unreadCount, hasFetched, fetchNotifications, markAllRead, markOneRead } =
    useNotificationStore();

  // Fetch once on mount (if not already done)
  useEffect(() => {
    if (!hasFetched && userId) {
      fetchNotifications();
    }
  }, [userId, hasFetched]);

  // Trigger bell animation when unreadCount increases
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      markAllRead();
    }
  };

  const handleItemClick = (n) => {
    if (!n.isRead) markOneRead(n._id);
    setOpen(false);
    if (n.type === 'chat') navigate('/chat');
    else if (n.type === 'booking_request') navigate('/pandit-dashboard');
    else navigate('/devotee-dashboard');
  };

  return (
    <div className="notification-bell-wrapper" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className={`notification-bell-btn ${animate ? 'bell-shake' : ''}`}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        title="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className={`bell-badge ${animate ? 'badge-pop' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {notifications.length > 0 && (
              <button
                className="notif-mark-all"
                onClick={() => markAllRead()}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: 32 }}>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n._id}
                  className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <span className="notif-item-icon">{TYPE_ICON[n.type] || '🔔'}</span>
                  <div className="notif-item-body">
                    <p className="notif-item-title">{n.title}</p>
                    <p className="notif-item-msg">{n.message}</p>
                    <p className="notif-item-time">{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="notif-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-bell-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .notification-bell-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1.5px solid #e8dfd5;
          border-radius: 12px;
          color: #7c3d1e;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .notification-bell-btn:hover {
          background: #faf3eb;
          border-color: #d97706;
          color: #d97706;
        }

        /* Bell shake animation */
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-18deg); }
          30% { transform: rotate(18deg); }
          45% { transform: rotate(-12deg); }
          60% { transform: rotate(12deg); }
          75% { transform: rotate(-6deg); }
          90% { transform: rotate(6deg); }
        }
        .bell-shake {
          animation: bellShake 0.8s ease-in-out;
        }

        /* Badge */
        .bell-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          background: #dc2626;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(220,38,38,0.35);
        }
        @keyframes badgePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .badge-pop {
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 330px;
          max-width: calc(100vw - 16px);
          background: #fff;
          border: 1.5px solid #e8dfd5;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.13);
          z-index: 9999;
          overflow: hidden;
          animation: panelFadeIn 0.18s ease;
        }
        @keyframes panelFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .notif-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px 10px;
          border-bottom: 1px solid #f0e8df;
          background: #faf7f2;
        }
        .notif-panel-title {
          font-size: 13px;
          font-weight: 700;
          color: #7c3d1e;
          letter-spacing: 0.01em;
        }
        .notif-mark-all {
          font-size: 11px;
          font-weight: 600;
          color: #d97706;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background 0.14s;
        }
        .notif-mark-all:hover {
          background: #fef3c7;
        }

        .notif-list {
          max-height: 340px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e8dfd5 transparent;
        }

        .notif-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 28px 16px;
          color: #a78a7a;
          font-size: 13px;
        }

        .notif-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border: none;
          border-bottom: 1px solid #f5ede6;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.13s;
          position: relative;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #faf3eb; }
        .notif-item--unread { background: #fff8f0; }
        .notif-item--unread:hover { background: #fef3e2; }

        .notif-item-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .notif-item-body {
          flex: 1;
          min-width: 0;
        }
        .notif-item-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #3b1f0e;
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item-msg {
          font-size: 11.5px;
          color: #7c5742;
          margin: 0 0 3px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .notif-item-time {
          font-size: 10.5px;
          color: #b09080;
          margin: 0;
        }

        .notif-dot {
          width: 7px;
          height: 7px;
          background: #d97706;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
