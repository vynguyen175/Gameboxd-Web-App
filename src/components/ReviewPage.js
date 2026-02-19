import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { createReview, getUserReviews, deleteReview, getTrendingGames, uploadImage } from '../services/api';

const FALLBACK_GAMES = [
  'Elden Ring', 'The Legend of Zelda: BOTW', 'Hollow Knight',
  'Stardew Valley', 'God of War', "Baldur's Gate 3",
  'The Witcher 3', 'Sekiro: Shadows Die Twice', 'Hades',
  'Celeste', 'Cyberpunk 2077', 'Red Dead Redemption 2',
  'Minecraft', 'Dark Souls 3', 'Ghost of Tsushima',
];

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const FormCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const FormTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
`;

const FormSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
`;

const GameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed var(--input-border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--input-bg);

  &:hover {
    border-color: var(--neon-purple);
    background: var(--tag-bg);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 12px;
  display: block;
`;

const UploadLabel = styled.div`
  color: var(--text-tertiary);
  font-size: 0.9rem;
`;

const UploadHint = styled.div`
  color: var(--text-tertiary);
  font-size: 0.75rem;
  margin-top: 4px;
`;

const ClearImageBtn = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 4px 10px;
  color: #FCA5A5;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 8px;
  cursor: pointer;

  &:hover {
    background: #EF4444;
    color: white;
  }
`;

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Star = styled.button`
  font-size: 2rem;
  background: none;
  border: none;
  padding: 2px;
  transition: transform 0.15s ease;
  filter: ${props => props.$lit ? 'none' : 'grayscale(1) opacity(0.4)'};
  text-shadow: ${props => props.$lit ? '0 0 10px rgba(250, 204, 21, 0.7)' : 'none'};

  &:hover {
    transform: scale(1.25);
  }
`;

const RatingLabel = styled.span`
  color: var(--neon-gold);
  font-weight: 800;
  font-size: 1.1rem;
  margin-left: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  outline: none;
  transition: border-color 0.2s ease;
  line-height: 1.6;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end));
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  box-shadow: 0 0 20px var(--glow-purple);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    box-shadow: 0 0 32px var(--glow-purple);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Toast = styled.div`
  background: ${props => props.$error ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'};
  border: 2px solid ${props => props.$error ? '#EF4444' : '#22C55E'};
  border-radius: 12px;
  padding: 12px 18px;
  color: ${props => props.$error ? '#FCA5A5' : '#86EFAC'};
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 28px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ClearBtn = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 6px 14px;
  color: #FCA5A5;
  font-size: 0.8rem;
  font-weight: 700;

  &:hover {
    background: #EF4444;
    border-color: #EF4444;
    color: white;
  }
`;

const MyReviewCard = styled.div`
  background: var(--stat-card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
  }
`;

const ReviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReviewGameTitle = styled.div`
  font-weight: 800;
  color: var(--neon-gold);
  font-size: 1rem;
  margin-bottom: 4px;
`;

const ReviewRating = styled.div`
  font-size: 0.9rem;
  color: var(--neon-gold);
  margin-bottom: 6px;
`;

const ReviewText = styled.p`
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const DeleteBtn = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  color: #FCA5A5;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;

  &:hover {
    background: #EF4444;
    border-color: #EF4444;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--text-tertiary);
  font-size: 0.95rem;
`;

const CharCount = styled.span`
  float: right;
  font-size: 0.75rem;
  color: ${props => props.$over ? '#EF4444' : 'var(--text-tertiary)'};
  font-weight: 600;
  margin-top: 4px;
`;

function ReviewPage({ user }) {
  const [games, setGames] = useState(FALLBACK_GAMES);
  const [selectedGame, setSelectedGame] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3500);
  };

  const loadMyReviews = useCallback(async () => {
    try {
      const data = await getUserReviews(user.username);
      setMyReviews(data);
    } catch (err) {
      console.error('Load reviews error:', err);
    }
  }, [user.username]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getTrendingGames();
        if (data && data.length > 0) {
          const apiGames = data.map(g => g.title);
          const merged = [...new Set([...apiGames, ...FALLBACK_GAMES])];
          setGames(merged);
        }
      } catch {
        // keep FALLBACK_GAMES
      }
    };
    fetchGames();
    loadMyReviews();
  }, [loadMyReviews]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame.trim()) return showToast('Please enter a game name!', true);
    if (rating === 0) return showToast('Please give a rating!', true);
    if (reviewText.trim().length < 10) return showToast('Review must be at least 10 characters.', true);

    setSubmitting(true);
    try {
      let gameImageUrl = '';
      if (imageFile) {
        gameImageUrl = await uploadImage(imageFile);
      }
      await createReview(selectedGame.trim(), reviewText.trim(), rating, user.username, gameImageUrl);
      showToast('Review submitted!');
      setReviewText('');
      setRating(0);
      setSelectedGame('');
      handleClearImage();
      await loadMyReviews();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit review.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId, user.username);
      showToast('Review deleted.');
      await loadMyReviews();
    } catch (err) {
      showToast('Failed to delete review.', true);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`Delete all ${myReviews.length} of your reviews? This cannot be undone.`)) return;
    try {
      await Promise.all(myReviews.map(r => deleteReview(r._id, user.username)));
      showToast('All reviews cleared.');
      await loadMyReviews();
    } catch (err) {
      showToast('Failed to clear reviews.', true);
    }
  };

  return (
    <Container>
      {/* Write Review Form */}
      <FormCard>
        <FormTitle>✍️ Write a Review</FormTitle>
        <FormSubtitle>Share your gaming experience with the community</FormSubtitle>

        {toast && <Toast $error={toast.error}>{toast.error ? '⚠️' : '✅'} {toast.msg}</Toast>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Game Title</Label>
            <GameInput
              list="games-datalist"
              value={selectedGame}
              onChange={e => setSelectedGame(e.target.value)}
              placeholder="Type a game name or pick from suggestions..."
              autoComplete="off"
            />
            <datalist id="games-datalist">
              {games.map(g => <option key={g} value={g} />)}
            </datalist>
          </FormGroup>

          <FormGroup>
            <Label>Game Image (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {!imagePreview ? (
              <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
                <UploadLabel>Click to upload an image</UploadLabel>
                <UploadHint>PNG, JPG, GIF up to 5 MB</UploadHint>
              </ImageUploadArea>
            ) : (
              <div>
                <ImagePreview src={imagePreview} alt="Preview" />
                <ClearImageBtn type="button" onClick={handleClearImage}>Remove image</ClearImageBtn>
              </div>
            )}
          </FormGroup>

          <FormGroup>
            <Label>⭐ Your Rating</Label>
            <StarRow>
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  type="button"
                  $lit={n <= rating}
                  onClick={() => setRating(n)}
                  title={`${n} star${n !== 1 ? 's' : ''}`}
                >
                  ⭐
                </Star>
              ))}
              {rating > 0 && <RatingLabel>{rating}.0 / 5.0</RatingLabel>}
            </StarRow>
          </FormGroup>

          <FormGroup>
            <Label>
              Your Review
              <CharCount $over={reviewText.length > 500}>
                {reviewText.length}/500
              </CharCount>
            </Label>
            <Textarea
              placeholder="Share your thoughts about this game..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              maxLength={500}
            />
          </FormGroup>

          <SubmitBtn type="submit" disabled={submitting}>
            {submitting ? '🎮 Submitting...' : '🚀 SUBMIT REVIEW'}
          </SubmitBtn>
        </form>
      </FormCard>

      {/* My Recent Reviews */}
      <Section>
        <SectionHeader>
          <SectionTitle>📝 My Recent Reviews ({myReviews.length})</SectionTitle>
          {myReviews.length > 0 && (
            <ClearBtn onClick={handleClearAll}>🗑️ Clear All</ClearBtn>
          )}
        </SectionHeader>

        {myReviews.length === 0 ? (
          <EmptyState>No reviews yet. Submit your first review above!</EmptyState>
        ) : (
          myReviews.map(review => (
            <MyReviewCard key={review._id}>
              {review.gameImageUrl && (
                <img
                  src={review.gameImageUrl}
                  alt={review.gameTitle}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
              )}
              <ReviewInfo>
                <ReviewGameTitle>🎮 {review.gameTitle}</ReviewGameTitle>
                <ReviewRating>{'⭐'.repeat(Math.round(review.rating))} {review.rating.toFixed(1)}★</ReviewRating>
                <ReviewText>{review.reviewText}</ReviewText>
              </ReviewInfo>
              <DeleteBtn onClick={() => handleDelete(review._id)}>🗑️</DeleteBtn>
            </MyReviewCard>
          ))
        )}
      </Section>
    </Container>
  );
}

export default ReviewPage;
