import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Star } from 'lucide-react';
import { getShareData } from '../services/api';

const EmbedContainer = styled.div`
  max-width: 500px;
  margin: 0;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  background: var(--deep-space);
  color: var(--text-primary);
  min-height: auto;
`;

const EmbedCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
`;

const GameTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const Username = styled.div`
  color: var(--neon-purple);
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 10px;
`;

const ReviewText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
`;

const PoweredBy = styled.a`
  display: block;
  text-align: right;
  color: var(--text-tertiary);
  font-size: 0.7rem;
  text-decoration: none;
  margin-top: 8px;

  &:hover { color: var(--neon-purple); }
`;

const LoadingText = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
`;

function EmbedReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShareData(id)
      .then(data => setReview(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <EmbedContainer>
        <EmbedCard>
          <LoadingText>Loading review...</LoadingText>
        </EmbedCard>
      </EmbedContainer>
    );
  }

  if (!review) {
    return (
      <EmbedContainer>
        <EmbedCard>
          <LoadingText>Review not found</LoadingText>
        </EmbedCard>
      </EmbedContainer>
    );
  }

  return (
    <EmbedContainer>
      <EmbedCard>
        <GameTitle>{review.gameTitle}</GameTitle>
        <Username>by {review.username}</Username>
        <StarsRow>
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              size={16}
              style={{
                color: i <= Math.round(review.rating) ? '#FBBF24' : 'var(--text-secondary)',
                fill: i <= Math.round(review.rating) ? '#FBBF24' : 'none',
              }}
            />
          ))}
        </StarsRow>
        <ReviewText>{review.reviewText}</ReviewText>
        <PoweredBy href={`${window.location.origin}/review/${id}`} target="_blank" rel="noopener noreferrer">
          View on Gameboxd
        </PoweredBy>
      </EmbedCard>
    </EmbedContainer>
  );
}

export default EmbedReviewPage;
