import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SlidersHorizontal, Star } from 'lucide-react';
import { getGenres } from '../services/api';

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;

  svg {
    width: 18px;
    height: 18px;
    color: var(--neon-purple);
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select`
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 10px 32px 10px 14px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 160px;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  option {
    background: var(--card-bg);
    color: var(--text-primary);
  }
`;

const RatingSelect = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const RatingBtn = styled.button`
  background: ${props => props.$active ? 'rgba(251, 191, 36, 0.2)' : 'transparent'};
  border: ${props => props.$active ? '2px solid rgba(251, 191, 36, 0.5)' : '2px solid transparent'};
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(251, 191, 36, 0.15);
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$active ? '#FBBF24' : 'var(--text-secondary)'};
    fill: ${props => props.$active ? '#FBBF24' : 'none'};
  }
`;

const ClearBtn = styled.button`
  background: transparent;
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

function ReviewFilters({ onChange }) {
  const [sort, setSort] = useState('newest');
  const [genre, setGenre] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres || []);
      } catch {
        setGenres(['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle', 'Platformer', 'Fighting', 'Shooter', 'Open World', 'Indie', 'MMO', 'Casual', 'Horror', 'Survival', 'Visual Novel']);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const sortMap = {
      newest: { sort: 'timestamp', order: 'desc' },
      highest: { sort: 'rating', order: 'desc' },
      upvoted: { sort: 'upvoteCount', order: 'desc' },
    };
    const { sort: sortField, order } = sortMap[sort] || sortMap.newest;
    onChange({ sort: sortField, order, genre: genre || undefined, minRating: minRating || undefined });
  }, [sort, genre, minRating, onChange]);

  const handleClear = () => {
    setSort('newest');
    setGenre('');
    setMinRating(0);
  };

  return (
    <FilterBar>
      <FilterLabel>
        <SlidersHorizontal />
        Filters
      </FilterLabel>

      <SelectWrapper>
        <Select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="upvoted">Most Upvoted</option>
        </Select>
      </SelectWrapper>

      <SelectWrapper>
        <Select value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Select>
      </SelectWrapper>

      <RatingSelect>
        {[1, 2, 3, 4, 5].map(n => (
          <RatingBtn
            key={n}
            $active={minRating >= n}
            onClick={() => setMinRating(minRating === n ? 0 : n)}
            title={`Min ${n} star${n > 1 ? 's' : ''}`}
          >
            <Star />
          </RatingBtn>
        ))}
      </RatingSelect>

      <ClearBtn onClick={handleClear}>Clear</ClearBtn>
    </FilterBar>
  );
}

export default ReviewFilters;
