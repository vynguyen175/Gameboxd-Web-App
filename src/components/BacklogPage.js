import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Gamepad2, X, ChevronDown } from 'lucide-react';
import { getUserGameStatuses, setGameStatus, removeGameStatus } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 1100px;
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

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: var(--card-bg);
  padding: 6px;
  border-radius: 12px;
  border: 2px solid var(--card-border);
  width: fit-content;
  flex-wrap: wrap;
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

  &:hover {
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  }
`;

const CountBadge = styled.span`
  background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : 'var(--tag-bg)'};
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
`;

const GameCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--neon-purple);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const GameCover = styled.div`
  width: 100%;
  height: 240px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 40px; height: 40px; color: white; opacity: 0.5; }
`;

const GameInfo = styled.div`
  padding: 14px;
`;

const GameName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatusDropdown = styled.div`
  position: relative;
`;

const StatusSelect = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--section-bg);
  border: 1px solid var(--card-border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  svg { width: 14px; height: 14px; }
`;

const StatusMenu = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: ${props => props.$show ? 'block' : 'none'};
`;

const StatusOption = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover { background: var(--tag-bg); }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #FCA5A5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  svg { width: 14px; height: 14px; }
  ${GameCard}:hover & { opacity: 1; }
  &:hover { background: #EF4444; color: white; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const STATUSES = [
  { key: 'want_to_play', label: 'Want to Play' },
  { key: 'playing', label: 'Playing' },
  { key: 'completed', label: 'Completed' },
  { key: 'dropped', label: 'Dropped' },
];

function BacklogPage({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('want_to_play');
  const [games, setGames] = useState({});
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = {};
        await Promise.all(
          STATUSES.map(async (s) => {
            const data = await getUserGameStatuses(user.username, s.key);
            results[s.key] = data || [];
          })
        );
        setGames(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user.username]);

  const handleStatusChange = async (game, newStatus) => {
    setOpenMenu(null);
    try {
      await setGameStatus({
        igdbGameId: game.igdbGameId,
        status: newStatus,
        gameTitle: game.gameTitle,
        coverUrl: game.coverUrl,
      });
      // Move game between tabs
      setGames(prev => {
        const updated = { ...prev };
        // Remove from current
        for (const key of Object.keys(updated)) {
          updated[key] = updated[key].filter(g => g.igdbGameId !== game.igdbGameId);
        }
        // Add to new status
        updated[newStatus] = [...(updated[newStatus] || []), { ...game, status: newStatus }];
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (game) => {
    try {
      await removeGameStatus(game.igdbGameId);
      setGames(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(g => g.igdbGameId !== game.igdbGameId),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const currentGames = games[activeTab] || [];

  if (loading) return <Container><LoadingSpinner text="Loading backlog" /></Container>;

  return (
    <Container>
      <Title>My Backlog</Title>

      <Tabs>
        {STATUSES.map(s => (
          <Tab key={s.key} $active={activeTab === s.key} onClick={() => setActiveTab(s.key)}>
            {s.label}
            <CountBadge $active={activeTab === s.key}>{(games[s.key] || []).length}</CountBadge>
          </Tab>
        ))}
      </Tabs>

      {currentGames.length === 0 ? (
        <EmptyState>
          No games in this category yet.
        </EmptyState>
      ) : (
        <GamesGrid>
          {currentGames.map(game => (
            <GameCard key={game.igdbGameId}>
              <GameCover
                $image={game.coverUrl}
                onClick={() => navigate(`/game/${game.igdbGameId}`)}
              >
                {!game.coverUrl && <Gamepad2 />}
              </GameCover>
              <GameInfo>
                <GameName>{game.gameTitle}</GameName>
                <StatusDropdown>
                  <StatusSelect onClick={() => setOpenMenu(openMenu === game.igdbGameId ? null : game.igdbGameId)}>
                    {STATUSES.find(s => s.key === activeTab)?.label}
                    <ChevronDown />
                  </StatusSelect>
                  <StatusMenu $show={openMenu === game.igdbGameId}>
                    {STATUSES.filter(s => s.key !== activeTab).map(s => (
                      <StatusOption key={s.key} onClick={() => handleStatusChange(game, s.key)}>
                        {s.label}
                      </StatusOption>
                    ))}
                  </StatusMenu>
                </StatusDropdown>
              </GameInfo>
              <RemoveBtn onClick={() => handleRemove(game)}>
                <X />
              </RemoveBtn>
            </GameCard>
          ))}
        </GamesGrid>
      )}
    </Container>
  );
}

export default BacklogPage;
