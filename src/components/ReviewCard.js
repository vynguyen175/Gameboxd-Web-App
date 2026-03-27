import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Gamepad2, ThumbsUp, ThumbsDown, MessageCircle, Star, Image } from 'lucide-react';

const Card = styled.div`
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    box-shadow:
      0 0 30px var(--glow-purple),
      0 12px 40px rgba(0, 0, 0, 0.4);
    border-color: var(--neon-purple);
  }
`;

const GameImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 240, 255, 0.3))'};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlaceholderIcon = styled.div`
  opacity: 0.5;
  color: var(--text-secondary);

  svg {
    width: 64px;
    height: 64px;
  }
`;

const CardContent = styled.div`
  padding: 18px;
`;

const GameTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--neon-gold);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: white;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  color: var(--neon-purple);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--neon-cyan);
    text-decoration: underline;
  }
`;

const Timestamp = styled.span`
  color: var(--text-tertiary);
  font-size: 0.8rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StarIcon = styled(Star)`
  color: ${props => props.$filled ? '#FBBF24' : 'var(--text-secondary)'};
  fill: ${props => props.$filled ? '#FBBF24' : 'none'};
`;

const RatingValue = styled.span`
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1rem;
  margin-left: 4px;
`;

const ReviewText = styled.p`
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border-top: 1px solid var(--divider);
  background: var(--section-bg);
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ClickHint = styled.div`
  margin-left: auto;
  color: var(--text-tertiary);
  font-size: 0.75rem;
`;

const GenreTag = styled.span`
  display: inline-block;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 6px;
  padding: 2px 8px;
  color: #C084FC;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 8px;
`;

const TagRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ImageBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--neon-cyan);
  font-size: 0.75rem;
  font-weight: 700;

  svg { width: 12px; height: 12px; }
`;

const TopReactions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const ReactionPill = styled.span`
  background: var(--tag-bg);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
`;

function ReviewCard({ review, onClick }) {
  const navigate = useNavigate();

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${review.username}`);
  };

  const handleGameTitleClick = (e) => {
    if (review.igdbGameId) {
      e.stopPropagation();
      navigate(`/game/${review.igdbGameId}`);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const reviewDate = new Date(timestamp);
    const diffMs = now - reviewDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon key={i} $filled={i <= Math.round(rating)} />
      );
    }
    return stars;
  };

  return (
    <Card onClick={onClick}>
      <GameImage $image={review.gameImageUrl}>
        {!review.gameImageUrl && (
          <PlaceholderIcon>
            <Gamepad2 />
          </PlaceholderIcon>
        )}
      </GameImage>

      <CardContent>
        <GameTitle
          onClick={handleGameTitleClick}
          style={review.igdbGameId ? { cursor: 'pointer' } : {}}
        >
          {review.gameTitle}
        </GameTitle>

        <UserInfo>
          <Avatar>{review.username.charAt(0).toUpperCase()}</Avatar>
          <UserDetails>
            <Username onClick={handleUsernameClick}>{review.username}</Username>
            <Timestamp>{getTimeAgo(review.timestamp)}</Timestamp>
          </UserDetails>
        </UserInfo>

        <Rating>
          <Stars>{renderStars(review.rating)}</Stars>
          <RatingValue>{review.rating.toFixed(1)}</RatingValue>
        </Rating>

        <ReviewText>{review.reviewText}</ReviewText>
        <TagRow>
          {review.genre && <GenreTag>{review.genre}</GenreTag>}
          {review.images && review.images.length > 0 && (
            <ImageBadge><Image /> {review.images.length}</ImageBadge>
          )}
        </TagRow>
        {review.topReactions && Object.keys(review.topReactions).length > 0 && (
          <TopReactions>
            {Object.entries(review.topReactions).slice(0, 3).map(([emoji, count]) => (
              <ReactionPill key={emoji}>{emoji} {count}</ReactionPill>
            ))}
          </TopReactions>
        )}
      </CardContent>

      <CardFooter>
        <Stat>
          <ThumbsUp />
          <span>{review.upvoteCount || 0}</span>
        </Stat>
        <Stat>
          <ThumbsDown />
          <span>{review.downvoteCount || 0}</span>
        </Stat>
        <Stat>
          <MessageCircle />
          <span>{review.commentCount || 0}</span>
        </Stat>
        <ClickHint>Click to view</ClickHint>
      </CardFooter>
    </Card>
  );
}

export default ReviewCard;
