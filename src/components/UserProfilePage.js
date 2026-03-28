import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar, Users, FileText, ArrowLeft, Trophy, Activity, Gamepad2, List, Mail } from 'lucide-react';
import {
  getUserProfile, getUserReviews, getFollowers, getFollowing,
  followUser, unfollowUser, getUserAchievements, getUserActivity,
  getUserGameStatuses, getUserLists, startConversation
} from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
  svg { width: 18px; height: 18px; }
  &:hover { color: var(--neon-purple); }
`;

const ProfileHeader = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const ProfileTop = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
  @media (max-width: 600px) { flex-direction: column; align-items: center; text-align: center; }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$hasImage
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  flex-shrink: 0;
  border: 4px solid var(--card-border);
  box-shadow: 0 0 30px var(--glow-purple);
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const RoleBadge = styled.span`
  display: inline-block;
  background: ${props => props.$isAdmin
    ? 'linear-gradient(135deg, #FACC15, #F59E0B)'
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  color: ${props => props.$isAdmin ? '#000' : '#fff'};
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-left: 12px;
  vertical-align: middle;
`;

const Bio = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 16px 0;
`;

const JoinedDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  svg { width: 16px; height: 16px; }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const FollowButton = styled.button`
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$following ? `
    background: transparent;
    border: 2px solid rgba(239, 68, 68, 0.4);
    color: #FCA5A5;
    &:hover { background: rgba(239, 68, 68, 0.2); border-color: #EF4444; color: #EF4444; }
  ` : `
    background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
    border: none;
    color: white;
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 24px var(--glow-purple); }
  `}

  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const MessageBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--card-border);
  color: var(--text-secondary);
  transition: all 0.2s ease;

  svg { width: 18px; height: 18px; }

  &:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--divider);
  @media (max-width: 600px) { justify-content: center; }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  svg { width: 18px; height: 18px; color: var(--neon-purple); }
`;

const StatValue = styled.span`
  font-weight: 800;
  color: var(--text-primary);
`;

// Tabs
const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: var(--card-bg);
  padding: 6px;
  border-radius: 12px;
  border: 2px solid var(--card-border);
  width: fit-content;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  svg { width: 16px; height: 16px; }
  &:hover { color: ${props => props.$active ? 'white' : 'var(--text-primary)'}; }
`;

// Game Collection Stats
const CollectionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CollectionCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const CollectionValue = styled.div`
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--neon-cyan);
  text-shadow: 0 0 15px var(--glow-cyan);
`;

const CollectionLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
`;

// Achievements
const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const AchievementCard = styled.div`
  background: var(--card-bg);
  border: 2px solid ${props => props.$unlocked ? 'var(--neon-purple)' : 'var(--card-border)'};
  border-radius: 14px;
  padding: 18px;
  text-align: center;
  opacity: ${props => props.$unlocked ? 1 : 0.5};
  transition: all 0.2s ease;
  ${props => props.$unlocked && `box-shadow: 0 0 10px var(--glow-purple);`}
`;

const AchievementIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`;

const AchievementName = styled.div`
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-primary);
`;

// Activity
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
`;

const ActivityDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--neon-purple);
  margin-top: 6px;
  flex-shrink: 0;
`;

const ActivityText = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  margin-top: 4px;
`;

// Lists
const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ListCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { border-color: var(--neon-purple); transform: translateY(-2px); }
`;

const ListName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const ListMeta = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  svg { width: 22px; height: 22px; color: var(--neon-purple); }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 12px;
  color: var(--text-tertiary);
  svg { width: 48px; height: 48px; }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--neon-purple);
  font-size: 1.1rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #FCA5A5;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
`;

function UserProfilePage({ user }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followPending, setFollowPending] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [achievements, setAchievements] = useState([]);
  const [activity, setActivity] = useState([]);
  const [gameStats, setGameStats] = useState({ want_to_play: 0, playing: 0, completed: 0, dropped: 0 });
  const [userLists, setUserLists] = useState([]);
  const [isMutualFollow, setIsMutualFollow] = useState(false);

  const isOwnProfile = user.username === username;

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, reviewsData, followersData, followingData, myFollowingData] = await Promise.all([
        getUserProfile(username),
        getUserReviews(username),
        getFollowers(username),
        getFollowing(username),
        getFollowing(user.username),
      ]);

      setProfile(profileData);
      setReviews(reviewsData);
      setFollowers(followersData);
      setFollowing(followingData);
      setIsFollowing(myFollowingData.includes(username));

      // Check mutual follow
      const iFollowThem = myFollowingData.includes(username);
      // Mutual: they follow me AND I follow them
      const targetFollowersOfMe = await getFollowers(user.username).catch(() => []);
      setIsMutualFollow(iFollowThem && targetFollowersOfMe.includes(username));

      // Load additional data
      const [achievementsData, listsData] = await Promise.all([
        getUserAchievements(username).catch(() => []),
        getUserLists(username).catch(() => []),
      ]);
      setAchievements(achievementsData || []);
      setUserLists(listsData || []);

      // Load game stats
      const statResults = {};
      await Promise.all(
        ['want_to_play', 'playing', 'completed', 'dropped'].map(async (s) => {
          const data = await getUserGameStatuses(username, s).catch(() => []);
          statResults[s] = (data || []).length;
        })
      );
      setGameStats(statResults);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const data = await getUserActivity(username);
      setActivity(data.items || data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity' && activity.length === 0) {
      loadActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleFollow = async () => {
    if (followPending) return;
    setFollowPending(true);

    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
        setFollowers(followers.filter(f => f !== user.username));
      } else {
        await followUser(username);
        setIsFollowing(true);
        setFollowers([...followers, user.username]);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowPending(false);
    }
  };

  const handleMessage = async () => {
    try {
      await startConversation(username);
      navigate('/messages');
    } catch (err) {
      console.error('Start conversation error:', err);
    }
  };

  const handleVoteUpdate = (reviewId, upvotes, downvotes) => {
    setReviews(reviews.map(r =>
      r._id === reviewId
        ? { ...r, upvoteCount: upvotes, downvoteCount: downvotes }
        : r
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return <PageContainer><LoadingState>Loading profile...</LoadingState></PageContainer>;
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>
        <ErrorState>{error || 'User not found'}</ErrorState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>

      <ProfileHeader>
        <ProfileTop>
          <Avatar $hasImage={!!profile.profilePicture} $image={profile.profilePicture}>
            {!profile.profilePicture && profile.username.charAt(0)}
          </Avatar>
          <ProfileInfo>
            <Username>
              {profile.username}
              <RoleBadge $isAdmin={profile.role === 'admin'}>
                {profile.role || 'user'}
              </RoleBadge>
            </Username>
            {profile.fullName && (
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {profile.fullName}
              </div>
            )}
            {profile.bio && <Bio>{profile.bio}</Bio>}
            <JoinedDate>
              <Calendar />
              Joined {formatDate(profile.createdAt)}
            </JoinedDate>
            {!isOwnProfile && (
              <ButtonsRow>
                <FollowButton
                  $following={isFollowing}
                  onClick={handleFollow}
                  disabled={followPending}
                >
                  {followPending ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                </FollowButton>
                {isMutualFollow && (
                  <MessageBtn onClick={handleMessage}>
                    <Mail /> Message
                  </MessageBtn>
                )}
              </ButtonsRow>
            )}
            {isOwnProfile && (
              <ButtonsRow>
                <FollowButton
                  onClick={() => navigate('/settings')}
                  style={{ background: 'var(--tag-bg)', border: '2px solid var(--tag-border)', color: 'var(--text-primary)' }}
                >
                  Edit Profile
                </FollowButton>
              </ButtonsRow>
            )}
          </ProfileInfo>
        </ProfileTop>

        <StatsRow>
          <StatItem><Users /><StatValue>{followers.length}</StatValue> followers</StatItem>
          <StatItem><Users /><StatValue>{following.length}</StatValue> following</StatItem>
          <StatItem><FileText /><StatValue>{reviews.length}</StatValue> reviews</StatItem>
        </StatsRow>
      </ProfileHeader>

      {/* Game Collection Stats */}
      <CollectionStats>
        <CollectionCard>
          <CollectionValue>{gameStats.want_to_play || 0}</CollectionValue>
          <CollectionLabel>Want to Play</CollectionLabel>
        </CollectionCard>
        <CollectionCard>
          <CollectionValue>{gameStats.playing || 0}</CollectionValue>
          <CollectionLabel>Playing</CollectionLabel>
        </CollectionCard>
        <CollectionCard>
          <CollectionValue>{gameStats.completed || 0}</CollectionValue>
          <CollectionLabel>Completed</CollectionLabel>
        </CollectionCard>
        <CollectionCard>
          <CollectionValue>{gameStats.dropped || 0}</CollectionValue>
          <CollectionLabel>Dropped</CollectionLabel>
        </CollectionCard>
      </CollectionStats>

      {/* Tab Navigation */}
      <TabsContainer>
        <Tab $active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
          <FileText /> Reviews
        </Tab>
        <Tab $active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')}>
          <Trophy /> Achievements
        </Tab>
        <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
          <Activity /> Activity
        </Tab>
        <Tab $active={activeTab === 'lists'} onClick={() => setActiveTab('lists')}>
          <List /> Lists
        </Tab>
      </TabsContainer>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <>
          <SectionTitle><FileText /> Reviews by {profile.username}</SectionTitle>
          {reviews.length === 0 ? (
            <EmptyState>
              <EmptyIcon><FileText /></EmptyIcon>
              <p>{isOwnProfile ? "You haven't written any reviews yet." : "This user hasn't written any reviews yet."}</p>
            </EmptyState>
          ) : (
            <ReviewsGrid>
              {reviews.map(review => (
                <ReviewCard key={review._id} review={review} onClick={() => setSelectedReview(review)} />
              ))}
            </ReviewsGrid>
          )}
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <>
          <SectionTitle><Trophy /> Achievements</SectionTitle>
          {achievements.length === 0 ? (
            <EmptyState>
              <EmptyIcon><Trophy /></EmptyIcon>
              <p>No achievements yet.</p>
            </EmptyState>
          ) : (
            <AchievementsGrid>
              {achievements.map((ach, i) => (
                <AchievementCard key={ach._id || i} $unlocked={ach.unlocked !== false}>
                  <AchievementIcon>{ach.icon || '🏆'}</AchievementIcon>
                  <AchievementName>{ach.name || ach.title}</AchievementName>
                </AchievementCard>
              ))}
            </AchievementsGrid>
          )}
        </>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <>
          <SectionTitle><Activity /> Activity</SectionTitle>
          {activity.length === 0 ? (
            <EmptyState>
              <EmptyIcon><Activity /></EmptyIcon>
              <p>No recent activity.</p>
            </EmptyState>
          ) : (
            <ActivityList>
              {activity.map((item, i) => (
                <ActivityItem key={item._id || i}>
                  <ActivityDot />
                  <div>
                    <ActivityText>{item.text || item.message || item.description}</ActivityText>
                    <ActivityTime>{formatTime(item.createdAt || item.timestamp)}</ActivityTime>
                  </div>
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </>
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && (
        <>
          <SectionTitle><List /> Public Lists</SectionTitle>
          {userLists.filter(l => l.isPublic !== false).length === 0 ? (
            <EmptyState>
              <EmptyIcon><List /></EmptyIcon>
              <p>No public lists.</p>
            </EmptyState>
          ) : (
            <ListsGrid>
              {userLists.filter(l => l.isPublic !== false).map(list => (
                <ListCard key={list._id} onClick={() => navigate(`/lists/${list._id}`)}>
                  <ListName>{list.title}</ListName>
                  <ListMeta>
                    <Gamepad2 style={{ width: 14, height: 14, verticalAlign: 'middle' }} /> {(list.games || []).length} games
                  </ListMeta>
                </ListCard>
              ))}
            </ListsGrid>
          )}
        </>
      )}

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
          onVoteUpdate={handleVoteUpdate}
        />
      )}
    </PageContainer>
  );
}

export default UserProfilePage;
