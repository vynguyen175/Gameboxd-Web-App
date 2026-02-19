import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User, Inbox } from 'lucide-react';
import { getAllUsers, getFollowing, followUser, unfollowUser, getFeed } from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--divider);
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionSub = styled.p`
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 2px;
`;

const FriendRow = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    box-shadow: 0 4px 16px var(--glow-purple);
  }
`;

const FriendInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 0 12px var(--glow-purple);
  flex-shrink: 0;
`;

const FriendName = styled.span`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--neon-purple);
  }
`;

const FriendRole = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  display: block;
`;

const FollowBtn = styled.button`
  padding: 7px 20px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid ${props => props.$following ? 'rgba(239,68,68,0.4)' : 'var(--neon-purple)'};
  background: ${props => props.$following
    ? 'rgba(239,68,68,0.1)'
    : 'linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end))'};
  color: ${props => props.$following ? '#FCA5A5' : 'white'};
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.$following
      ? '0 0 12px rgba(239,68,68,0.4)'
      : '0 0 16px var(--glow-purple)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
`;

const EmptyIcon = styled.div`
  margin-bottom: 12px;
  color: var(--text-secondary);

  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: var(--text-tertiary);
  padding: 20px;
`;

function FeedPage({ user }) {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [feed, setFeed] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [pendingFollow, setPendingFollow] = useState(new Set());
  const [selectedReview, setSelectedReview] = useState(null);

  const loadFeed = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const data = await getFeed(user.username);
      setFeed(data);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoadingFeed(false);
    }
  }, [user.username]);

  useEffect(() => {
    const init = async () => {
      try {
        const [users, followList] = await Promise.all([
          getAllUsers(),
          getFollowing(user.username),
        ]);
        setAllUsers(users.filter(u => u.username !== user.username));
        setFollowing(new Set(followList));
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    init();
    loadFeed();
  }, [user.username, loadFeed]);

  const handleFollow = async (targetUsername) => {
    setPendingFollow(prev => new Set(prev).add(targetUsername));
    try {
      if (following.has(targetUsername)) {
        await unfollowUser(targetUsername, user.username);
        setFollowing(prev => {
          const next = new Set(prev);
          next.delete(targetUsername);
          return next;
        });
      } else {
        await followUser(targetUsername, user.username);
        setFollowing(prev => new Set(prev).add(targetUsername));
      }
      await loadFeed();
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setPendingFollow(prev => {
        const next = new Set(prev);
        next.delete(targetUsername);
        return next;
      });
    }
  };

  const handleVoteUpdate = (reviewId, upvotes, downvotes) => {
    setFeed(feed.map(r =>
      r._id === reviewId
        ? { ...r, upvoteCount: upvotes, downvoteCount: downvotes }
        : r
    ));
  };

  return (
    <Container>
      {/* Suggested Friends */}
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>Suggested Friends</SectionTitle>
            <SectionSub>Follow others to see their reviews in your feed</SectionSub>
          </div>
        </SectionHeader>

        {loadingUsers ? (
          <LoadingText>Loading users...</LoadingText>
        ) : allUsers.length === 0 ? (
          <EmptyState>
            <EmptyIcon><User /></EmptyIcon>
            <EmptyText>No other users yet.</EmptyText>
          </EmptyState>
        ) : (
          allUsers.map(u => (
            <FriendRow key={u.username}>
              <FriendInfo>
                <Avatar>{u.username.charAt(0).toUpperCase()}</Avatar>
                <div>
                  <FriendName onClick={() => navigate(`/profile/${u.username}`)}>{u.username}</FriendName>
                  <FriendRole>{u.role === 'admin' ? 'Admin' : 'Gamer'}</FriendRole>
                </div>
              </FriendInfo>
              <FollowBtn
                $following={following.has(u.username)}
                onClick={() => handleFollow(u.username)}
                disabled={pendingFollow.has(u.username)}
              >
                {pendingFollow.has(u.username)
                  ? '...'
                  : following.has(u.username)
                  ? 'Unfollow'
                  : '+ Follow'}
              </FollowBtn>
            </FriendRow>
          ))
        )}
      </Section>

      {/* Activity Feed */}
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>Recent Activity</SectionTitle>
            <SectionSub>
              {following.size > 0
                ? `Reviews from ${following.size} user${following.size !== 1 ? 's' : ''} you follow`
                : 'Follow friends to see their reviews here'}
            </SectionSub>
          </div>
        </SectionHeader>

        {loadingFeed ? (
          <LoadingText>Loading feed...</LoadingText>
        ) : feed.length === 0 ? (
          <EmptyState>
            <EmptyIcon><Inbox /></EmptyIcon>
            <EmptyText>
              {following.size === 0
                ? 'Follow some friends above to see their reviews here!'
                : 'No reviews from people you follow yet.'}
            </EmptyText>
          </EmptyState>
        ) : (
          <ReviewsGrid>
            {feed.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                onClick={() => setSelectedReview(review)}
              />
            ))}
          </ReviewsGrid>
        )}
      </Section>

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
          onVoteUpdate={handleVoteUpdate}
        />
      )}
    </Container>
  );
}

export default FeedPage;
