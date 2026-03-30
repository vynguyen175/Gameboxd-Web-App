import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { getAllReviews } from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import ReviewFilters from './ReviewFilters';
import LoadingSpinner from './LoadingSpinner';
import useAgeRestriction from '../hooks/useAgeRestriction';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 8px rgba(168, 85, 247, 0.3));
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  box-shadow: var(--shadow-depth-1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:nth-child(1) { animation-delay: 0.05s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.15s; }

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: var(--shadow-depth-3), 0 0 40px var(--glow-cyan), 0 0 80px rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.3);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--neon-cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 20px var(--glow-cyan);
  font-variant-numeric: tabular-nums;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: var(--neon-purple);
  padding: 60px 20px;
  animation: pulse 2s infinite;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
  border-radius: 16px;
  padding: 24px;
  color: #FCA5A5;
  text-align: center;
  font-weight: 600;
  margin: 40px 0;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 32px auto 0;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  border: none;
  border-radius: 14px;
  padding: 14px 40px;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover:not(:disabled) {
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.7);
    transform: translateY(-2px) scale(1.02);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

function Dashboard({ user }) {
  const { filterMatureContent } = useAgeRestriction(user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({});
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    try {
      const params = {
        ...filters,
        limit: 12,
      };
      if (!reset && cursor) {
        params.cursor = cursor;
      }
      const data = await getAllReviews(params);
      const items = data.reviews || data || [];
      if (reset) {
        setReviews(Array.isArray(items) ? items : []);
      } else {
        setReviews(prev => [...prev, ...(Array.isArray(items) ? items : [])]);
      }
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, cursor]);

  useEffect(() => {
    setCursor(null);
    fetchReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleVoteUpdate = (reviewId, upvotes, downvotes) => {
    setReviews(reviews.map(r =>
      r._id === reviewId
        ? { ...r, upvoteCount: upvotes, downvoteCount: downvotes }
        : r
    ));
  };

  const filteredReviews = useMemo(() => filterMatureContent(reviews), [reviews, filterMatureContent]);

  // Calculate stats
  const totalReviews = filteredReviews.length;
  const uniqueGames = new Set(filteredReviews.map(r => r.gameTitle)).size;
  const totalVotes = filteredReviews.reduce((sum, r) => sum + (r.upvoteCount || 0) + (r.downvoteCount || 0), 0);

  return (
    <DashboardContainer className="animate-slide-in">
      <Header>
        <Title>TRENDING GAMES</Title>
        <Subtitle>Latest reviews from the gaming community</Subtitle>
      </Header>

      <Stats>
        <StatCard>
          <StatValue>{totalReviews}</StatValue>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{uniqueGames}</StatValue>
          <StatLabel>Games Reviewed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalVotes}</StatValue>
          <StatLabel>Community Votes</StatLabel>
        </StatCard>
      </Stats>

      <ReviewFilters onChange={handleFilterChange} />

      {loading && <LoadingSpinner text="Loading reviews" />}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && filteredReviews.length === 0 && (
        <LoadingMessage>No reviews yet. Be the first to add one!</LoadingMessage>
      )}

      <ReviewsGrid>
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onClick={() => setSelectedReview(review)}
          />
        ))}
      </ReviewsGrid>

      {hasMore && !loading && (
        <LoadMoreButton onClick={() => fetchReviews(false)} disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load More'}
        </LoadMoreButton>
      )}

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
          onVoteUpdate={handleVoteUpdate}
        />
      )}
    </DashboardContainer>
  );
}

export default Dashboard;
