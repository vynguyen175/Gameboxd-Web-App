import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Bell, UserPlus, MessageCircle, ThumbsUp, Trophy, Mail, CheckCheck } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MarkAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 10px 20px;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 16px; height: 16px; }

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  background: ${props => props.$unread ? 'var(--card-bg)' : 'var(--section-bg)'};
  border: 2px solid ${props => props.$unread ? 'var(--neon-purple)' : 'var(--card-border)'};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  ${props => props.$unread && `
    box-shadow: 0 0 10px var(--glow-purple);
  `}

  &:hover {
    transform: translateX(4px);
    border-color: var(--neon-purple);
  }
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => {
    switch (props.$type) {
      case 'follow': return 'rgba(168, 85, 247, 0.2)';
      case 'comment': return 'rgba(0, 240, 255, 0.15)';
      case 'upvote': return 'rgba(34, 197, 94, 0.2)';
      case 'achievement': return 'rgba(251, 191, 36, 0.2)';
      case 'message': return 'rgba(99, 102, 241, 0.2)';
      default: return 'var(--tag-bg)';
    }
  }};

  svg {
    width: 20px;
    height: 20px;
    color: ${props => {
      switch (props.$type) {
        case 'follow': return 'var(--neon-purple)';
        case 'comment': return 'var(--neon-cyan)';
        case 'upvote': return '#4ADE80';
        case 'achievement': return '#FBBF24';
        case 'message': return '#818CF8';
        default: return 'var(--text-secondary)';
      }
    }};
  }
`;

const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifText = styled.div`
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: ${props => props.$unread ? '700' : '500'};
  margin-bottom: 4px;
  line-height: 1.4;
`;

const NotifTime = styled.div`
  color: var(--text-tertiary);
  font-size: 0.8rem;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-purple);
  flex-shrink: 0;
  margin-top: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  color: var(--text-tertiary);
  svg { width: 48px; height: 48px; }
`;

const LoadMoreBtn = styled.button`
  display: block;
  margin: 24px auto 0;
  background: var(--tag-bg);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 32px;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ICON_MAP = {
  follow: UserPlus,
  comment: MessageCircle,
  upvote: ThumbsUp,
  achievement: Trophy,
  message: Mail,
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data.notifications || data || []);
        setCursor(data.nextCursor || null);
        setHasMore(data.hasMore || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const data = await getNotifications(cursor);
      setNotifications(prev => [...prev, ...(data.notifications || data || [])]);
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
        );
      } catch (err) {
        console.error(err);
      }
    }

    // Navigate based on type
    if (notif.type === 'follow' && notif.fromUsername) {
      navigate(`/profile/${notif.fromUsername}`);
    } else if (notif.type === 'comment' && notif.reviewId) {
      navigate(`/review/${notif.reviewId}`);
    } else if (notif.type === 'upvote' && notif.reviewId) {
      navigate(`/review/${notif.reviewId}`);
    } else if (notif.type === 'message') {
      navigate('/messages');
    } else if (notif.type === 'achievement') {
      navigate(`/profile/${notif.username || ''}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) return <Container><LoadingSpinner text="Loading notifications" /></Container>;

  return (
    <Container>
      <Header>
        <Title>Notifications</Title>
        {notifications.some(n => !n.read) && (
          <MarkAllBtn onClick={handleMarkAllRead}>
            <CheckCheck /> Mark all read
          </MarkAllBtn>
        )}
      </Header>

      {notifications.length === 0 ? (
        <EmptyState>
          <EmptyIcon><Bell /></EmptyIcon>
          <p>No notifications yet.</p>
        </EmptyState>
      ) : (
        <>
          <NotificationsList>
            {notifications.map(notif => {
              const IconComp = ICON_MAP[notif.type] || Bell;
              return (
                <NotificationItem
                  key={notif._id}
                  $unread={!notif.read}
                  onClick={() => handleClick(notif)}
                >
                  <IconWrapper $type={notif.type}>
                    <IconComp />
                  </IconWrapper>
                  <NotifContent>
                    <NotifText $unread={!notif.read}>{notif.message || notif.text}</NotifText>
                    <NotifTime>{formatTime(notif.createdAt || notif.timestamp)}</NotifTime>
                  </NotifContent>
                  {!notif.read && <UnreadDot />}
                </NotificationItem>
              );
            })}
          </NotificationsList>
          {hasMore && (
            <LoadMoreBtn onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More'}
            </LoadMoreBtn>
          )}
        </>
      )}
    </Container>
  );
}

export default NotificationsPage;
