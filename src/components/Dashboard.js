import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAllReviews } from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

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
  background: var(--stat-card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--neon-cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 20px var(--glow-cyan);
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

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 24px;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);

  &:hover {
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.7);
  }
`;

function Dashboard({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleVoteUpdate = (reviewId, upvotes, downvotes) => {
    setReviews(reviews.map(r =>
      r._id === reviewId
        ? { ...r, upvoteCount: upvotes, downvoteCount: downvotes }
        : r
    ));
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const uniqueGames = new Set(reviews.map(r => r.gameTitle)).size;
  const totalVotes = reviews.reduce((sum, r) => sum + (r.upvoteCount || 0) + (r.downvoteCount || 0), 0);

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

      <RefreshButton onClick={fetchReviews}>
        Refresh Feed
      </RefreshButton>

      {loading && <LoadingMessage>Loading reviews...</LoadingMessage>}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!loading && !error && reviews.length === 0 && (
        <LoadingMessage>No reviews yet. Be the first to add one!</LoadingMessage>
      )}

      <ReviewsGrid>
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onClick={() => setSelectedReview(review)}
          />
        ))}
      </ReviewsGrid>

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
