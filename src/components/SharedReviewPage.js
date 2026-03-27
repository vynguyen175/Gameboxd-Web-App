import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Star, Gamepad2, Share2, Copy, ExternalLink } from 'lucide-react';
import { getShareData } from '../services/api';

const Container = styled.div`
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  animation: slideInUp 0.4s ease-out;
`;

const ReviewCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const GameImage = styled.div`
  width: 100%;
  height: 250px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple) 0%, var(--neon-cyan) 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 80px; height: 80px; color: white; opacity: 0.5; }
`;

const Content = styled.div`
  padding: 32px;
`;

const GameTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--neon-purple);
  margin-bottom: 16px;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  padding: 8px;
  margin: -8px -8px 12px;
  border-radius: 12px;
  transition: background 0.2s ease;

  &:hover { background: var(--section-bg); }
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  text-transform: uppercase;
`;

const UserInfo = styled.div``;

const Username = styled.div`
  font-weight: 700;
  color: var(--text-primary);
`;

const Timestamp = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const StarIcon = styled(Star)`
  width: 22px;
  height: 22px;
  color: ${props => props.$filled ? '#FBBF24' : 'var(--text-secondary)'};
  fill: ${props => props.$filled ? '#FBBF24' : 'none'};
`;

const RatingNumber = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-primary);
`;

const ReviewText = styled.p`
  color: var(--text-primary);
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 28px;
`;

const ShareRow = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--divider);
`;

const ShareBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--tag-bg);
  border: 2px solid var(--tag-border);
  color: var(--text-secondary);

  svg { width: 16px; height: 16px; }

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

const CopiedToast = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
`;

const BrandFooter = styled.div`
  text-align: center;
  padding: 24px 0;
  margin-top: 16px;
`;

const BrandLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;

  svg { width: 16px; height: 16px; }

  &:hover { color: var(--neon-purple); }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--neon-purple);
  font-size: 1.2rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #FCA5A5;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
`;

function SharedReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await getShareData(id);
        setReview(data);
      } catch (err) {
        setError('Review not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${review.gameTitle} - Review by ${review.username}`,
        text: review.reviewText?.slice(0, 100) + '...',
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <Container><LoadingState>Loading review...</LoadingState></Container>;
  if (error) return <Container><ErrorState>{error}</ErrorState></Container>;
  if (!review) return <Container><ErrorState>Review not found</ErrorState></Container>;

  return (
    <Container>
      <ReviewCard>
        <GameImage $image={review.gameImageUrl}>
          {!review.gameImageUrl && <Gamepad2 />}
        </GameImage>

        <Content>
          <GameTitle>{review.gameTitle}</GameTitle>

          <UserRow onClick={() => navigate(`/profile/${review.username}`)}>
            <Avatar>{review.username?.charAt(0)}</Avatar>
            <UserInfo>
              <Username>{review.username}</Username>
              <Timestamp>{formatTime(review.timestamp || review.createdAt)}</Timestamp>
            </UserInfo>
          </UserRow>

          <RatingRow>
            <Stars>
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon key={i} $filled={i <= Math.round(review.rating)} />
              ))}
            </Stars>
            <RatingNumber>{review.rating?.toFixed(1)}</RatingNumber>
          </RatingRow>

          <ReviewText>{review.reviewText}</ReviewText>

          <ShareRow>
            <ShareBtn onClick={handleCopyLink}>
              <Copy /> Copy Link
            </ShareBtn>
            <ShareBtn onClick={handleShare}>
              <Share2 /> Share
            </ShareBtn>
          </ShareRow>
        </Content>
      </ReviewCard>

      <BrandFooter>
        <BrandLink href="/">
          <Gamepad2 /> View on Gameboxd <ExternalLink />
        </BrandLink>
      </BrandFooter>

      {copied && <CopiedToast>Link copied to clipboard!</CopiedToast>}
    </Container>
  );
}

export default SharedReviewPage;
