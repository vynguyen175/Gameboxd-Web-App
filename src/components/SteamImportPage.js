import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Download, Search, CheckSquare, Square, Gamepad2 } from 'lucide-react';
import { getSteamLibrary, importSteamGames } from '../services/api';

const Container = styled.div`
  max-width: 900px;
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

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 24px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 10px;
  padding: 14px 24px;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg { width: 18px; height: 18px; }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HelperText = styled.p`
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
`;

const GamesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 4px; }
`;

const GameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--section-bg);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.1);
  }
`;

const CheckIcon = styled.div`
  color: ${props => props.$checked ? 'var(--neon-purple)' : 'var(--text-secondary)'};
  flex-shrink: 0;
  svg { width: 20px; height: 20px; }
`;

const GameCover = styled.div`
  width: 40px;
  height: 52px;
  border-radius: 6px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 16px; height: 16px; color: white; opacity: 0.5; }
`;

const GameName = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const StatusSelect = styled.select`
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 0.8rem;
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

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SelectAllBtn = styled.button`
  background: transparent;
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

const CountLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
`;

const ResultCard = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #4ADE80;
  font-weight: 700;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 14px 18px;
  color: #FCA5A5;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 16px;
`;

function SteamImportPage({ user }) {
  const navigate = useNavigate();
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [statuses, setStatuses] = useState({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!steamId.trim()) return;
    setLoading(true);
    setError('');
    setGames([]);
    setSelected(new Set());
    setResult(null);

    try {
      const data = await getSteamLibrary(steamId.trim());
      const gamesList = Array.isArray(data) ? data : data.games || [];
      setGames(gamesList);
      // Select all by default
      const allIds = new Set(gamesList.map((g, i) => i));
      setSelected(allIds);
      // Default status for all
      const defaultStatuses = {};
      gamesList.forEach((g, i) => { defaultStatuses[i] = 'completed'; });
      setStatuses(defaultStatuses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch Steam library. Make sure your Steam profile and game details are set to public.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === games.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(games.map((_, i) => i)));
    }
  };

  const handleStatusChange = (index, status) => {
    setStatuses(prev => ({ ...prev, [index]: status }));
  };

  const handleImport = async () => {
    const gamesToImport = games
      .filter((_, i) => selected.has(i))
      .map((game, i) => ({
        ...game,
        status: statuses[games.indexOf(game)] || 'completed',
      }));

    if (gamesToImport.length === 0) return;

    setImporting(true);
    setError('');

    try {
      const data = await importSteamGames(gamesToImport);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import games. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>

      <Title>Steam Import</Title>
      <Subtitle>Import your Steam library into Gameboxd</Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Card>
        <InputRow>
          <Input
            type="text"
            placeholder="Enter your Steam ID (17-digit number)"
            value={steamId}
            onChange={e => setSteamId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
          />
          <PrimaryButton onClick={handleFetch} disabled={loading || !steamId.trim()}>
            <Search />
            {loading ? 'Fetching...' : 'Fetch Library'}
          </PrimaryButton>
        </InputRow>
        <HelperText>
          Your Steam ID is the 17-digit number found in your Steam profile URL (e.g., steamcommunity.com/profiles/76561198XXXXXXXXX).
          Make sure your Steam profile and game details are set to public.
        </HelperText>
      </Card>

      {games.length > 0 && !result && (
        <Card>
          <ToolbarRow>
            <CountLabel>{selected.size} of {games.length} games selected</CountLabel>
            <div style={{ display: 'flex', gap: 12 }}>
              <SelectAllBtn onClick={selectAll}>
                {selected.size === games.length ? 'Deselect All' : 'Select All'}
              </SelectAllBtn>
              <PrimaryButton onClick={handleImport} disabled={importing || selected.size === 0}>
                <Download />
                {importing ? 'Importing...' : `Import ${selected.size} Games`}
              </PrimaryButton>
            </div>
          </ToolbarRow>

          <GamesList>
            {games.map((game, i) => (
              <GameRow key={i} onClick={() => toggleSelect(i)}>
                <CheckIcon $checked={selected.has(i)}>
                  {selected.has(i) ? <CheckSquare /> : <Square />}
                </CheckIcon>
                <GameCover $image={game.coverUrl || game.imageUrl}>
                  {!(game.coverUrl || game.imageUrl) && <Gamepad2 />}
                </GameCover>
                <GameName>{game.name || game.title}</GameName>
                <StatusSelect
                  value={statuses[i] || 'completed'}
                  onChange={e => { e.stopPropagation(); handleStatusChange(i, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="completed">Completed</option>
                  <option value="playing">Playing</option>
                  <option value="want_to_play">Want to Play</option>
                  <option value="dropped">Dropped</option>
                </StatusSelect>
              </GameRow>
            ))}
          </GamesList>
        </Card>
      )}

      {result && (
        <ResultCard>
          Successfully imported {result.imported || result.count || selected.size} games into your library!
        </ResultCard>
      )}
    </Container>
  );
}

export default SteamImportPage;
