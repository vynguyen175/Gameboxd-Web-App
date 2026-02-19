import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar, Users, FileText, ArrowLeft } from 'lucide-react';
import { getUserProfile, getUserReviews, getFollowers, getFollowing, followUser, unfollowUser } from '../services/api';
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

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: var(--neon-purple);
  }
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
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

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--divider);

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;

  svg {
    width: 18px;
    height: 18px;
    color: var(--neon-purple);
  }
`;

const StatValue = styled.span`
  font-weight: 800;
  color: var(--text-primary);
`;

const FollowButton = styled.button`
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  ${props => props.$following ? `
    background: transparent;
    border: 2px solid rgba(239, 68, 68, 0.4);
    color: #FCA5A5;

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #EF4444;
      color: #EF4444;
    }
  ` : `
    background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
    border: none;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px var(--glow-purple);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 22px;
    height: 22px;
    color: var(--neon-purple);
  }
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

  svg {
    width: 48px;
    height: 48px;
  }
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
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (followPending) return;
    setFollowPending(true);

    try {
      if (isFollowing) {
        await unfollowUser(username, user.username);
        setIsFollowing(false);
        setFollowers(followers.filter(f => f !== user.username));
      } else {
        await followUser(username, user.username);
        setIsFollowing(true);
        setFollowers([...followers, user.username]);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowPending(false);
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

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Loading profile...</LoadingState>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
          Go Back
        </BackButton>
        <ErrorState>{error || 'User not found'}</ErrorState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowLeft />
        Go Back
      </BackButton>

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
              <FollowButton
                $following={isFollowing}
                onClick={handleFollow}
                disabled={followPending}
              >
                {followPending ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </FollowButton>
            )}
            {isOwnProfile && (
              <FollowButton
                onClick={() => navigate('/settings')}
                style={{ background: 'var(--tag-bg)', border: '2px solid var(--tag-border)', color: 'var(--text-primary)' }}
              >
                Edit Profile
              </FollowButton>
            )}
          </ProfileInfo>
        </ProfileTop>

        <StatsRow>
          <StatItem>
            <Users />
            <StatValue>{followers.length}</StatValue> followers
          </StatItem>
          <StatItem>
            <Users />
            <StatValue>{following.length}</StatValue> following
          </StatItem>
          <StatItem>
            <FileText />
            <StatValue>{reviews.length}</StatValue> reviews
          </StatItem>
        </StatsRow>
      </ProfileHeader>

      <SectionTitle>
        <FileText />
        Reviews by {profile.username}
      </SectionTitle>

      {reviews.length === 0 ? (
        <EmptyState>
          <EmptyIcon><FileText /></EmptyIcon>
          <p>{isOwnProfile ? "You haven't written any reviews yet." : "This user hasn't written any reviews yet."}</p>
        </EmptyState>
      ) : (
        <ReviewsGrid>
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onClick={() => setSelectedReview(review)}
            />
          ))}
        </ReviewsGrid>
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
