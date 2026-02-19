import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { voteOnReview, removeVote, getVoteStatus, getComments, addComment, deleteComment } from '../services/api';
import { X, Gamepad2, ThumbsUp, ThumbsDown, Star, Trash2, Send } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: var(--deep-space);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--card-border);
    border-radius: 4px;
  }
`;

const GameImage = styled.div`
  width: 100%;
  height: 250px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple) 0%, var(--neon-cyan) 100%)'};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderIcon = styled.div`
  opacity: 0.5;
  color: white;

  svg {
    width: 80px;
    height: 80px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const GameTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
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
  margin: -8px;
  margin-bottom: 12px;
  border-radius: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--section-bg);
  }
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
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 24px;
`;

const VoteSection = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
  margin-bottom: 24px;
`;

const VoteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  svg {
    width: 20px;
    height: 20px;
  }

  ${props => props.$type === 'up' && `
    background: ${props.$active ? 'rgba(34, 197, 94, 0.2)' : 'var(--tag-bg)'};
    color: ${props.$active ? '#4ADE80' : 'var(--text-secondary)'};
    border-color: ${props.$active ? 'rgba(34, 197, 94, 0.4)' : 'var(--tag-border)'};

    &:hover {
      background: rgba(34, 197, 94, 0.2);
      color: #4ADE80;
      border-color: rgba(34, 197, 94, 0.4);
    }
  `}

  ${props => props.$type === 'down' && `
    background: ${props.$active ? 'rgba(239, 68, 68, 0.2)' : 'var(--tag-bg)'};
    color: ${props.$active ? '#FCA5A5' : 'var(--text-secondary)'};
    border-color: ${props.$active ? 'rgba(239, 68, 68, 0.4)' : 'var(--tag-border)'};

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #FCA5A5;
      border-color: rgba(239, 68, 68, 0.4);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentsSection = styled.div``;

const CommentsHeader = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const CommentInput = styled.input`
  flex: 1;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CommentButton = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const CommentItem = styled.div`
  background: var(--section-bg);
  border-radius: 10px;
  padding: 14px;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentUser = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CommentAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
  text-transform: uppercase;
`;

const CommentUsername = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--neon-purple);
  }
`;

const CommentTime = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const CommentText = styled.p`
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const NoComments = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
  font-size: 0.9rem;
`;

const OwnReviewNote = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 10px;
  background: var(--section-bg);
  border-radius: 8px;
`;

function ReviewModal({ review, user, onClose, onVoteUpdate }) {
  const navigate = useNavigate();
  const [voteStatus, setVoteStatus] = useState({ hasVoted: false, voteType: null });
  const [upvotes, setUpvotes] = useState(review.upvoteCount || 0);
  const [downvotes, setDownvotes] = useState(review.downvoteCount || 0);
  const [voting, setVoting] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  const isOwnReview = review.username === user.username;

  const goToProfile = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    fetchData();
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [voteData, commentsData] = await Promise.all([
        !isOwnReview ? getVoteStatus(review._id, user.username) : Promise.resolve({ hasVoted: false, voteType: null }),
        getComments(review._id),
      ]);
      setVoteStatus(voteData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVote = async (voteType) => {
    if (voting || isOwnReview) return;
    setVoting(true);

    try {
      if (voteStatus.hasVoted && voteStatus.voteType === voteType) {
        // Remove vote
        const result = await removeVote(review._id, user.username);
        setVoteStatus({ hasVoted: false, voteType: null });
        setUpvotes(result.upvoteCount);
        setDownvotes(result.downvoteCount);
      } else {
        // Add or change vote
        const result = await voteOnReview(review._id, user.username, voteType);
        setVoteStatus({ hasVoted: true, voteType });
        setUpvotes(result.upvoteCount);
        setDownvotes(result.downvoteCount);
      }
      if (onVoteUpdate) {
        onVoteUpdate(review._id, upvotes, downvotes);
      }
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await addComment(review._id, user.username, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(review._id, commentId, user.username);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Delete comment error:', err);
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
    return `${days}d ago`;
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
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <GameImage $image={review.gameImageUrl}>
          {!review.gameImageUrl && (
            <PlaceholderIcon>
              <Gamepad2 />
            </PlaceholderIcon>
          )}
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </GameImage>

        <Content>
          <GameTitle>{review.gameTitle}</GameTitle>

          <UserRow onClick={() => goToProfile(review.username)}>
            <Avatar>{review.username.charAt(0)}</Avatar>
            <UserInfo>
              <Username>{review.username}</Username>
              <Timestamp>{formatTime(review.timestamp)}</Timestamp>
            </UserInfo>
          </UserRow>

          <RatingRow>
            <Stars>{renderStars(review.rating)}</Stars>
            <RatingNumber>{review.rating.toFixed(1)}</RatingNumber>
          </RatingRow>

          <ReviewText>{review.reviewText}</ReviewText>

          <VoteSection>
            {isOwnReview ? (
              <OwnReviewNote>You can't vote on your own review</OwnReviewNote>
            ) : (
              <>
                <VoteButton
                  $type="up"
                  $active={voteStatus.voteType === 'upvote'}
                  onClick={() => handleVote('upvote')}
                  disabled={voting}
                >
                  <ThumbsUp />
                  <span>{upvotes}</span>
                </VoteButton>
                <VoteButton
                  $type="down"
                  $active={voteStatus.voteType === 'downvote'}
                  onClick={() => handleVote('downvote')}
                  disabled={voting}
                >
                  <ThumbsDown />
                  <span>{downvotes}</span>
                </VoteButton>
              </>
            )}
          </VoteSection>

          <CommentsSection>
            <CommentsHeader>Comments ({comments.length})</CommentsHeader>

            <CommentForm onSubmit={handleSubmitComment}>
              <CommentInput
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                maxLength={500}
              />
              <CommentButton type="submit" disabled={submitting || !newComment.trim()}>
                <Send />
                <span>Post</span>
              </CommentButton>
            </CommentForm>

            <CommentsList>
              {loadingComments ? (
                <NoComments>Loading comments...</NoComments>
              ) : comments.length === 0 ? (
                <NoComments>No comments yet. Be the first to comment!</NoComments>
              ) : (
                comments.map(comment => (
                  <CommentItem key={comment._id}>
                    <CommentHeader>
                      <CommentUser>
                        <CommentAvatar>{comment.username.charAt(0)}</CommentAvatar>
                        <CommentUsername onClick={() => goToProfile(comment.username)}>{comment.username}</CommentUsername>
                        <CommentTime>{formatTime(comment.timestamp)}</CommentTime>
                      </CommentUser>
                      {comment.username === user.username && (
                        <DeleteButton onClick={() => handleDeleteComment(comment._id)}>
                          <Trash2 />
                        </DeleteButton>
                      )}
                    </CommentHeader>
                    <CommentText>{comment.text}</CommentText>
                  </CommentItem>
                ))
              )}
            </CommentsList>
          </CommentsSection>
        </Content>
      </Modal>
    </Overlay>
  );
}

export default ReviewModal;
