import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Gamepad2, User, FileText, Star } from 'lucide-react';
import { searchAll } from '../services/api';
import ReviewModal from './ReviewModal';
import LoadingSpinner from './LoadingSpinner';
import useAgeRestriction from '../hooks/useAgeRestriction';

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
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 600;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px var(--glow-purple);
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
  background: var(--card-bg);
  padding: 6px;
  border-radius: 12px;
  border: 2px solid var(--card-border);
  width: fit-content;
`;

const Tab = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;

  &:hover {
    border-color: var(--neon-purple);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

const ResultImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
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
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

function SearchPage({ user }) {
  const navigate = useNavigate();
  const { filterMatureContent } = useAgeRestriction(user);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('games');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const debounceRef = useRef(null);

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

      {loading && <LoadingSpinner text="Searching" compact />}

      {!loading && query.trim().length >= 2 && filteredResults.length === 0 && (
        <EmptyState>No {activeTab} found for "{query}"</EmptyState>
      )}

      {!loading && (
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
                  {activeTab === 'games' && (result.genres?.join(', ') || result.summary?.slice(0, 80) || 'Game')}
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
