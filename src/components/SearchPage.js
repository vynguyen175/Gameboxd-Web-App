import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Search, Gamepad2, User, FileText, Star, TrendingUp, Flame } from 'lucide-react';
import { searchAll, getTrendingGames } from '../services/api';
import ReviewModal from './ReviewModal';
import LoadingSpinner from './LoadingSpinner';
import useAgeRestriction from '../hooks/useAgeRestriction';

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ──────────────────────────────────────────────────────

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 52px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px var(--glow-purple), 0 0 30px rgba(168, 85, 247, 0.1);
    transform: scale(1.01);
  }

  &::placeholder {
    color: var(--text-secondary);
    font-weight: 400;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);

  svg {
    width: 22px;
    height: 22px;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  width: fit-content;
`;

const Tab = styled.button`
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  box-shadow: ${props => props.$active ? '0 4px 16px var(--glow-purple)' : 'none'};

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
    transform: ${props => props.$active ? 'scale(1.02)' : 'scale(1.01)'};
  }
`;

// ─── Discovery Section (shown when no search) ──────────────────────────────

const DiscoverySection = styled.div`
  animation: ${fadeUp} 0.5s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  margin-top: ${props => props.$mt ? '32px' : '0'};

  svg {
    width: 20px;
    height: 20px;
    color: var(--neon-purple);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const GenreChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
`;

const GenreChip = styled.button`
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
    box-shadow: 0 0 16px var(--glow-purple);
    transform: translateY(-2px) scale(1.04);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const TrendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
`;

const TrendingCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${fadeUp} 0.4s ease-out both;
  animation-delay: ${props => props.$delay || '0s'};

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-depth-2), 0 0 30px var(--glow-purple);
    border-color: rgba(168, 85, 247, 0.3);
  }
`;

const TrendingImage = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 240, 255, 0.3))'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  }

  svg {
    width: 40px;
    height: 40px;
    color: white;
    opacity: 0.4;
  }
`;

const TrendingInfo = styled.div`
  padding: 12px 14px;
`;

const TrendingTitle = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  margin-bottom: 4px;
`;

const TrendingRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--neon-gold);
  font-weight: 700;

  svg {
    width: 12px;
    height: 12px;
    fill: var(--neon-gold);
    color: var(--neon-gold);
  }
`;

// ─── Results Section ────────────────────────────────────────────────────────

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateY(-2px);
    box-shadow: var(--shadow-depth-2), 0 0 20px var(--glow-purple);
  }
`;

const ResultImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: white;
    opacity: 0.7;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 4px;
`;

const ResultMeta = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
`;

// ─── Genre Data ─────────────────────────────────────────────────────────────

const GENRE_SUGGESTIONS = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Shooter',
  'Open World', 'Indie', 'Horror', 'Simulation', 'Puzzle',
  'Sports', 'Racing', 'Fighting', 'Platformer', 'MMO',
];

const QUICK_SEARCHES = [
  'Zelda', 'Mario', 'GTA', 'Elden Ring', 'Minecraft',
  'God of War', 'Cyberpunk', 'Dark Souls', 'Hades', 'Fortnite',
];

// ─── Component ──────────────────────────────────────────────────────────────

function SearchPage({ user }) {
  const navigate = useNavigate();
  const { filterMatureContent } = useAgeRestriction(user);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('games');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const debounceRef = useRef(null);

  // Fetch trending games on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingGames();
        setTrendingGames(Array.isArray(data) ? data.slice(0, 12) : []);
      } catch {
        setTrendingGames([]);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const doSearch = useCallback(async (q, type) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAll(q.trim(), type);
      setResults(data.results || data || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, activeTab);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTab, doSearch]);

  const filteredResults = activeTab === 'reviews' ? filterMatureContent(results) : results;

  const handleResultClick = (result) => {
    if (activeTab === 'games') {
      navigate(`/game/${result.igdbId || result.id}`);
    } else if (activeTab === 'users') {
      navigate(`/profile/${result.username}`);
    } else if (activeTab === 'reviews') {
      setSelectedReview(result);
    }
  };

  const handleGenreClick = (genre) => {
    setQuery(genre);
    setActiveTab('games');
  };

  const handleTrendingClick = (game) => {
    navigate(`/game/${game.igdbId || game.id}`);
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        style={{
          color: i <= Math.round(rating) ? '#FBBF24' : 'var(--text-secondary)',
          fill: i <= Math.round(rating) ? '#FBBF24' : 'none',
        }}
      />
    ));
  };

  const showDiscovery = query.trim().length < 2 && !loading;

  return (
    <Container>
      <Title>Search</Title>

      <SearchBar>
        <SearchIcon><Search /></SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search games, users, or reviews..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </SearchBar>

      <Tabs>
        <Tab $active={activeTab === 'games'} onClick={() => setActiveTab('games')}>
          <Gamepad2 /> Games
        </Tab>
        <Tab $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <User /> Users
        </Tab>
        <Tab $active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
          <FileText /> Reviews
        </Tab>
      </Tabs>

      {/* Discovery section - shown when not searching */}
      {showDiscovery && (
        <DiscoverySection>
          {/* Quick search suggestions */}
          <SectionHeader>
            <Search />
            <SectionTitle>Quick Search</SectionTitle>
          </SectionHeader>
          <GenreChips>
            {QUICK_SEARCHES.map(term => (
              <GenreChip key={term} onClick={() => handleGenreClick(term)}>
                {term}
              </GenreChip>
            ))}
          </GenreChips>

          {/* Genre chips */}
          <SectionHeader $mt>
            <Flame />
            <SectionTitle>Browse by Genre</SectionTitle>
          </SectionHeader>
          <GenreChips>
            {GENRE_SUGGESTIONS.map(genre => (
              <GenreChip key={genre} onClick={() => handleGenreClick(genre)}>
                {genre}
              </GenreChip>
            ))}
          </GenreChips>

          {/* Trending games */}
          <SectionHeader $mt>
            <TrendingUp />
            <SectionTitle>Trending Games</SectionTitle>
          </SectionHeader>
          {loadingTrending ? (
            <LoadingSpinner text="Loading trending" compact />
          ) : trendingGames.length > 0 ? (
            <TrendingGrid>
              {trendingGames.map((game, idx) => (
                <TrendingCard
                  key={game.id || idx}
                  $delay={`${idx * 0.05}s`}
                  onClick={() => handleTrendingClick(game)}
                >
                  <TrendingImage $image={game.imageUrl}>
                    {!game.imageUrl && <Gamepad2 />}
                  </TrendingImage>
                  <TrendingInfo>
                    <TrendingTitle>{game.title || game.name}</TrendingTitle>
                    {game.rating > 0 && (
                      <TrendingRating>
                        <Star /> {game.rating.toFixed(1)}
                      </TrendingRating>
                    )}
                  </TrendingInfo>
                </TrendingCard>
              ))}
            </TrendingGrid>
          ) : null}
        </DiscoverySection>
      )}

      {/* Search results */}
      {loading && <LoadingSpinner text="Searching" compact />}

      {!loading && query.trim().length >= 2 && filteredResults.length === 0 && (
        <EmptyState>No {activeTab} found for "{query}"</EmptyState>
      )}

      {!loading && query.trim().length >= 2 && (
        <ResultsList>
          {filteredResults.map((result, idx) => (
            <ResultCard key={result._id || result.id || idx} onClick={() => handleResultClick(result)}>
              <ResultImage $image={result.imageUrl || result.cover || result.gameImageUrl || result.profilePicture}>
                {!(result.imageUrl || result.cover || result.gameImageUrl || result.profilePicture) && (
                  activeTab === 'games' ? <Gamepad2 /> : activeTab === 'users' ? <User /> : <FileText />
                )}
              </ResultImage>
              <ResultInfo>
                <ResultTitle>
                  {activeTab === 'games' && (result.name || result.title)}
                  {activeTab === 'users' && (result.username)}
                  {activeTab === 'reviews' && (result.gameTitle)}
                </ResultTitle>
                <ResultMeta>
                  {activeTab === 'games' && (result.genres?.join(', ') || result.description?.slice(0, 80) || 'Game')}
                  {activeTab === 'users' && (result.bio?.slice(0, 80) || result.fullName || 'User')}
                  {activeTab === 'reviews' && (
                    <StarRow>{renderStars(result.rating)} <span style={{ marginLeft: 6 }}>by {result.username}</span></StarRow>
                  )}
                </ResultMeta>
              </ResultInfo>
            </ResultCard>
          ))}
        </ResultsList>
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

export default SearchPage;
