import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Star, Gamepad2, Plus, ChevronDown } from 'lucide-react';
import {
  getGame, getGameReviews, getMyGameStatus, setGameStatus,
  removeGameStatus, getUserLists, addGameToList
} from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

const Container = styled.div`
  max-width: 1000px;
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

const GameHeader = styled.div`
  display: flex;
  gap: 32px;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CoverImage = styled.div`
  width: 220px;
  height: 300px;
  border-radius: 14px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  svg { width: 60px; height: 60px; color: white; opacity: 0.5; }
`;

const GameInfo = styled.div`
  flex: 1;
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const GameMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const Tag = styled.span`
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
`;

const Summary = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 20px;
  max-height: 120px;
  overflow-y: auto;
`;

const RatingOverview = styled.div`
  background: var(--section-bg);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RatingTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const BigRating = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: #FBBF24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
`;

const RatingStars = styled.div`
  display: flex;
  gap: 4px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const RatingCount = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const RatingBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RatingBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const BarBg = styled.div`
  flex: 1;
  height: 8px;
  background: var(--deep-space);
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #FBBF24, #F59E0B);
  border-radius: 4px;
  width: ${props => props.$pct}%;
  transition: width 0.3s ease;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBtn = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.$active ? 'var(--neon-purple)' : 'var(--card-border)'};
  background: ${props => props.$active ? 'rgba(168, 85, 247, 0.2)' : 'transparent'};
  color: ${props => props.$active ? 'var(--neon-purple)' : 'var(--text-secondary)'};

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

const ListDropdown = styled.div`
  position: relative;
`;

const ListBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border: 2px solid var(--card-border);
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  svg { width: 16px; height: 16px; }

  &:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 50;
  overflow: hidden;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--tag-bg);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const SortRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SortSelect = styled.select`
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 8px 14px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  option {
    background: var(--card-bg);
    color: var(--text-primary);
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const LoadMoreBtn = styled.button`
  display: block;
  margin: 32px auto 0;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WriteReviewBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px var(--glow-purple);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--neon-purple);
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const STATUSES = ['want_to_play', 'playing', 'completed', 'dropped'];
const STATUS_LABELS = {
  want_to_play: 'Want to Play',
  playing: 'Playing',
  completed: 'Completed',
  dropped: 'Dropped',
};

function GamePage({ user }) {
  const { igdbId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [lists, setLists] = useState([]);
  const [showListDropdown, setShowListDropdown] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        const [gameData, statusData] = await Promise.all([
          getGame(igdbId),
          getMyGameStatus(igdbId).catch(() => null),
        ]);
        setGame(gameData);
        setCurrentStatus(statusData?.status || null);
        if (user) {
          const listsData = await getUserLists(user.username).catch(() => []);
          setLists(listsData);
        }
      } catch (err) {
        console.error('Error loading game:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [igdbId, user]);

  const loadReviews = useCallback(async (reset = false) => {
    setReviewsLoading(true);
    const sortMap = {
      newest: { sort: 'timestamp', order: 'desc' },
      highest: { sort: 'rating', order: 'desc' },
      upvoted: { sort: 'upvoteCount', order: 'desc' },
    };
    const { sort, order } = sortMap[sortBy] || sortMap.newest;
    try {
      const data = await getGameReviews(igdbId, {
        sort, order,
        cursor: reset ? undefined : cursor,
        limit: 12,
      });
      const items = data.reviews || data || [];
      if (reset) {
        setReviews(items);
      } else {
        setReviews(prev => [...prev, ...items]);
      }
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  }, [igdbId, sortBy, cursor]);

  useEffect(() => {
    setCursor(null);
    loadReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igdbId, sortBy]);

  const handleStatusChange = async (status) => {
    try {
      if (currentStatus === status) {
        await removeGameStatus(igdbId);
        setCurrentStatus(null);
      } else {
        await setGameStatus({
          igdbGameId: Number(igdbId),
          status,
          gameTitle: game?.name || game?.title,
          coverUrl: game?.cover,
        });
        setCurrentStatus(status);
      }
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  const handleAddToList = async (listId) => {
    setShowListDropdown(false);
    try {
      await addGameToList(listId, {
        igdbGameId: Number(igdbId),
        gameTitle: game?.name || game?.title,
        coverUrl: game?.cover,
      });
    } catch (err) {
      console.error('Add to list error:', err);
    }
  };

  if (loading) {
    return <Container><LoadingState>Loading game...</LoadingState></Container>;
  }

  if (!game) {
    return (
      <Container>
        <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>
        <EmptyState>Game not found</EmptyState>
      </Container>
    );
  }

  const avgRating = game.averageRating || 0;
  const totalReviews = game.totalReviews || reviews.length;
  const distribution = game.ratingDistribution || {};

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>

      <GameHeader>
        <CoverImage $image={game.cover || game.coverUrl}>
          {!(game.cover || game.coverUrl) && <Gamepad2 />}
        </CoverImage>
        <GameInfo>
          <GameTitle>{game.name || game.title}</GameTitle>
          <GameMeta>
            {(game.genres || []).map(g => <Tag key={g}>{g}</Tag>)}
            {(game.platforms || []).slice(0, 5).map(p => <Tag key={p}>{p}</Tag>)}
          </GameMeta>
          {game.summary && <Summary>{game.summary}</Summary>}

          <RatingOverview>
            <RatingTop>
              <BigRating>{avgRating > 0 ? avgRating.toFixed(1) : '--'}</BigRating>
              <div>
                <RatingStars>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      style={{
                        color: i <= Math.round(avgRating) ? '#FBBF24' : 'var(--text-secondary)',
                        fill: i <= Math.round(avgRating) ? '#FBBF24' : 'none',
                      }}
                    />
                  ))}
                </RatingStars>
                <RatingCount>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</RatingCount>
              </div>
            </RatingTop>
            <RatingBars>
              {[5, 4, 3, 2, 1].map(n => {
                const count = distribution[n] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <RatingBarRow key={n}>
                    <span>{n}</span>
                    <BarBg><BarFill $pct={pct} /></BarBg>
                    <span style={{ width: 30, textAlign: 'right' }}>{count}</span>
                  </RatingBarRow>
                );
              })}
            </RatingBars>
          </RatingOverview>

          <ActionsRow>
            {STATUSES.map(s => (
              <StatusBtn key={s} $active={currentStatus === s} onClick={() => handleStatusChange(s)}>
                {STATUS_LABELS[s]}
              </StatusBtn>
            ))}
            <ListDropdown>
              <ListBtn onClick={() => setShowListDropdown(!showListDropdown)}>
                <Plus /> Add to List <ChevronDown />
              </ListBtn>
              <DropdownMenu $show={showListDropdown}>
                {lists.length === 0 ? (
                  <DropdownItem onClick={() => { setShowListDropdown(false); navigate('/my-lists'); }}>
                    Create a list first
                  </DropdownItem>
                ) : (
                  lists.map(list => (
                    <DropdownItem key={list._id} onClick={() => handleAddToList(list._id)}>
                      {list.title}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            </ListDropdown>
          </ActionsRow>
        </GameInfo>
      </GameHeader>

      <SortRow>
        <SectionTitle>Reviews</SectionTitle>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="upvoted">Most Upvoted</option>
          </SortSelect>
          <WriteReviewBtn onClick={() => navigate('/write-review')}>
            Write a Review
          </WriteReviewBtn>
        </div>
      </SortRow>

      {reviews.length === 0 && !reviewsLoading ? (
        <EmptyState>No reviews yet. Be the first to review this game!</EmptyState>
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

      {hasMore && (
        <LoadMoreBtn onClick={() => loadReviews(false)} disabled={reviewsLoading}>
          {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
        </LoadMoreBtn>
      )}

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </Container>
  );
}

export default GamePage;
