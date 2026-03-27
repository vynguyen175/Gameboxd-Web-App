import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { createReview, getUserReviews, deleteReview, getTrendingGames, uploadImage, getGenres, searchGames } from '../services/api';
import { X, Search, Image } from 'lucide-react';

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

const GameSearchWrapper = styled.div`
  position: relative;
`;

const GameInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 42px;
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

  &::placeholder { color: var(--text-tertiary); font-weight: 400; }
  &:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 3px var(--glow-purple); }
`;

const SearchInputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  svg { width: 18px; height: 18px; }
`;

const AutocompleteList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: ${props => props.$show ? 'block' : 'none'};
`;

const AutocompleteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: var(--section-bg); }
`;

const AutocompleteCover = styled.div`
  width: 40px;
  height: 50px;
  border-radius: 6px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  flex-shrink: 0;
`;

const AutocompleteName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const SelectedGame = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(168, 85, 247, 0.1);
  border: 2px solid var(--neon-purple);
  border-radius: 10px;
  margin-top: 10px;
`;

const SelectedGameName = styled.span`
  font-weight: 700;
  color: var(--neon-purple);
  flex: 1;
`;

const ClearGameBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  &:hover { color: #EF4444; }
  svg { width: 16px; height: 16px; }
`;

// Multi-image upload
const MultiImageArea = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ImageUploadSlot = styled.div`
  width: 100px;
  height: 100px;
  border: 2px dashed var(--input-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--input-bg);
  position: relative;
  overflow: hidden;

  &:hover { border-color: var(--neon-purple); background: var(--tag-bg); }

  svg { width: 24px; height: 24px; color: var(--text-tertiary); }
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImgBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 12px; height: 12px; }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed var(--input-border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--input-bg);
  &:hover { border-color: var(--neon-purple); background: var(--tag-bg); }
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
  &:hover { background: #EF4444; color: white; }
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
  &:hover { transform: scale(1.25); }
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

  &::placeholder { color: var(--text-tertiary); }
  &:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 3px var(--glow-purple); }
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

  &:hover:not(:disabled) { box-shadow: 0 0 32px var(--glow-purple); transform: translateY(-2px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
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
  &:hover { background: #EF4444; border-color: #EF4444; color: white; }
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
  &:hover { border-color: var(--neon-purple); }
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
  &:hover { background: #EF4444; border-color: #EF4444; color: white; }
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

const GenreSelect = styled.select`
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
  appearance: none;

  &:focus { border-color: var(--input-border-focus); box-shadow: 0 0 0 3px var(--glow-purple); }
  option { background: var(--card-bg); color: var(--text-primary); }
`;

const MatureBadge = styled.span`
  display: inline-block;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  padding: 2px 8px;
  color: #FCA5A5;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  vertical-align: middle;
`;

const GenreBadge = styled.span`
  display: inline-block;
  background: var(--tag-bg, rgba(168, 85, 247, 0.15));
  border: 1px solid var(--neon-purple);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--neon-purple);
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  vertical-align: middle;
`;

const MAX_SCREENSHOTS = 5;

function ReviewPage({ user }) {
  const [games, setGames] = useState(FALLBACK_GAMES);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedIgdbGame, setSelectedIgdbGame] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genreList, setGenreList] = useState([]);
  const [matureGenres, setMatureGenres] = useState([]);
  const [screenshots, setScreenshots] = useState([]); // { file, preview }
  const [searchResults, setSearchResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchingGames, setSearchingGames] = useState(false);
  const searchTimeout = useRef(null);
  const fileInputRef = useRef(null);
  const screenshotInputRef = useRef(null);

  const isMinor = (() => {
    if (!user.dateOfBirth) return false;
    const dob = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 18;
  })();

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
      } catch { /* keep FALLBACK_GAMES */ }
    };
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        const mature = data.matureGenres || [];
        setMatureGenres(mature);
        if (isMinor) {
          setGenreList(data.genres.filter(g => !mature.includes(g)));
        } else {
          setGenreList(data.genres);
        }
      } catch {
        setGenreList(['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle', 'Platformer', 'Fighting', 'Shooter', 'Open World', 'Indie', 'MMO', 'Casual', 'Horror', 'Survival', 'Visual Novel']);
      }
    };
    fetchGames();
    fetchGenres();
    loadMyReviews();
  }, [loadMyReviews, isMinor]);

  const handleGameSearch = (value) => {
    setSelectedGame(value);
    setSelectedIgdbGame(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowAutocomplete(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchingGames(true);
      try {
        const results = await searchGames(value.trim());
        setSearchResults(results || []);
        setShowAutocomplete(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchingGames(false);
      }
    }, 300);
  };

  const handleSelectIgdbGame = (game) => {
    setSelectedGame(game.name || game.title);
    setSelectedIgdbGame(game);
    setShowAutocomplete(false);
    setSearchResults([]);
  };

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

  const handleScreenshotAdd = (e) => {
    const files = Array.from(e.target.files);
    if (screenshots.length + files.length > MAX_SCREENSHOTS) {
      showToast(`Max ${MAX_SCREENSHOTS} screenshots allowed.`, true);
      return;
    }
    const newScreenshots = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setScreenshots(prev => [...prev, ...newScreenshots]);
    if (screenshotInputRef.current) screenshotInputRef.current.value = '';
  };

  const handleRemoveScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
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

      // Upload screenshots
      const uploadedImages = [];
      for (const ss of screenshots) {
        const url = await uploadImage(ss.file);
        uploadedImages.push(url);
      }

      await createReview(
        selectedGame.trim(),
        reviewText.trim(),
        rating,
        gameImageUrl,
        selectedGenre,
        selectedIgdbGame?.id || selectedIgdbGame?.igdbId || null,
        uploadedImages
      );
      showToast('Review submitted!');
      setReviewText('');
      setRating(0);
      setSelectedGame('');
      setSelectedGenre('');
      setSelectedIgdbGame(null);
      setScreenshots([]);
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
      await deleteReview(reviewId);
      showToast('Review deleted.');
      await loadMyReviews();
    } catch (err) {
      showToast('Failed to delete review.', true);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(`Delete all ${myReviews.length} of your reviews? This cannot be undone.`)) return;
    try {
      await Promise.all(myReviews.map(r => deleteReview(r._id)));
      showToast('All reviews cleared.');
      await loadMyReviews();
    } catch (err) {
      showToast('Failed to clear reviews.', true);
    }
  };

  return (
    <Container>
      <FormCard>
        <FormTitle>Write a Review</FormTitle>
        <FormSubtitle>Share your gaming experience with the community</FormSubtitle>

        {toast && <Toast $error={toast.error}>{toast.error ? '' : ''} {toast.msg}</Toast>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Game Title</Label>
            <GameSearchWrapper>
              <SearchInputIcon><Search /></SearchInputIcon>
              <GameInput
                value={selectedGame}
                onChange={e => handleGameSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                placeholder="Search for a game..."
                autoComplete="off"
              />
              <AutocompleteList $show={showAutocomplete && searchResults.length > 0}>
                {searchResults.map((game, i) => (
                  <AutocompleteItem key={game.id || game.igdbId || i} onMouseDown={() => handleSelectIgdbGame(game)}>
                    <AutocompleteCover $image={game.cover} />
                    <AutocompleteName>{game.name || game.title}</AutocompleteName>
                  </AutocompleteItem>
                ))}
              </AutocompleteList>
            </GameSearchWrapper>
            {selectedIgdbGame && (
              <SelectedGame>
                <SelectedGameName>{selectedIgdbGame.name || selectedIgdbGame.title}</SelectedGameName>
                <ClearGameBtn onClick={() => { setSelectedIgdbGame(null); setSelectedGame(''); }}>
                  <X />
                </ClearGameBtn>
              </SelectedGame>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Game Cover Image (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {!imagePreview ? (
              <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
                <UploadLabel>Click to upload a cover image</UploadLabel>
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
            <Label>Screenshots (up to {MAX_SCREENSHOTS})</Label>
            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleScreenshotAdd}
            />
            <MultiImageArea>
              {screenshots.map((ss, i) => (
                <ImageUploadSlot key={i}>
                  <PreviewImg src={ss.preview} alt={`Screenshot ${i + 1}`} />
                  <RemoveImgBtn type="button" onClick={() => handleRemoveScreenshot(i)}>
                    <X />
                  </RemoveImgBtn>
                </ImageUploadSlot>
              ))}
              {screenshots.length < MAX_SCREENSHOTS && (
                <ImageUploadSlot onClick={() => screenshotInputRef.current?.click()}>
                  <Image />
                </ImageUploadSlot>
              )}
            </MultiImageArea>
          </FormGroup>

          <FormGroup>
            <Label>Game Genre</Label>
            <GenreSelect
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="">Select a genre...</option>
              {genreList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </GenreSelect>
            {selectedGenre && matureGenres.includes(selectedGenre) && (
              <MatureBadge style={{ marginTop: 6, display: 'inline-block' }}>18+ Mature Content</MatureBadge>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Your Rating</Label>
            <StarRow>
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  type="button"
                  $lit={n <= rating}
                  onClick={() => setRating(n)}
                  title={`${n} star${n !== 1 ? 's' : ''}`}
                >
                  &#11088;
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
            {submitting ? 'Submitting...' : 'SUBMIT REVIEW'}
          </SubmitBtn>
        </form>
      </FormCard>

      <Section>
        <SectionHeader>
          <SectionTitle>My Recent Reviews ({myReviews.length})</SectionTitle>
          {myReviews.length > 0 && (
            <ClearBtn onClick={handleClearAll}>Clear All</ClearBtn>
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
                <ReviewGameTitle>
                  {review.gameTitle}
                  {review.genre && <GenreBadge>{review.genre}</GenreBadge>}
                  {review.genre && matureGenres.includes(review.genre) && <MatureBadge>18+</MatureBadge>}
                  {review.images && review.images.length > 0 && (
                    <span style={{ marginLeft: 6, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      <Image style={{ width: 14, height: 14, verticalAlign: 'middle' }} /> {review.images.length}
                    </span>
                  )}
                </ReviewGameTitle>
                <ReviewRating>{'⭐'.repeat(Math.round(review.rating))} {review.rating.toFixed(1)}</ReviewRating>
                <ReviewText>{review.reviewText}</ReviewText>
              </ReviewInfo>
              <DeleteBtn onClick={() => handleDelete(review._id)}>Delete</DeleteBtn>
            </MyReviewCard>
          ))
        )}
      </Section>
    </Container>
  );
}

export default ReviewPage;
