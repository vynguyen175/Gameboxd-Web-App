import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getTrendingGames, getUserReviews } from '../services/api';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const ProfileCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const ProfileLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
  box-shadow: 0 0 20px var(--glow-purple);
  flex-shrink: 0;
`;

const ProfileInfo = styled.div``;

const ProfileName = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const ProfileMeta = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const AdminBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #FACC15, #F59E0B);
  color: #000;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin-left: 8px;
`;

const StatusButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const StatusBtn = styled.button`
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid ${props => props.$active ? 'var(--neon-purple)' : 'var(--card-border)'};
  background: ${props => props.$active ? 'linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end))' : 'var(--tag-bg)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  box-shadow: ${props => props.$active ? '0 0 16px var(--glow-purple)' : 'none'};
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--text-primary);
    transform: scale(1.04);
  }
`;

const Section = styled.div`
  margin-bottom: 28px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

const SectionCount = styled.span`
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  color: var(--neon-purple);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: 700;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
`;

const GameCard = styled.div`
  background: var(--stat-card-bg);
  border: 2px solid var(--card-border);
  border-radius: 14px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--glow-purple);
  }
`;

const GameCoverImg = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  display: block;
`;

const GameIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`;

const GameName = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const GameDesc = styled.div`
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.4;
`;

const GameRating = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--neon-gold);
`;

const LibraryItem = styled.div`
  background: var(--stat-card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    transform: translateX(4px);
  }
`;

const LibraryGameName = styled.span`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
`;

const LibraryRating = styled.span`
  color: var(--neon-gold);
  font-weight: 700;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--text-tertiary);
  font-size: 0.95rem;
`;

const LoadingText = styled.div`
  color: var(--text-tertiary);
  font-size: 0.9rem;
  padding: 16px 0;
  text-align: center;
`;


function HomePage({ user }) {
  const [trendingGames, setTrendingGames] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [activeStatus, setActiveStatus] = useState('played');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [games, reviews] = await Promise.all([
          getTrendingGames(),
          getUserReviews(user.username),
        ]);
        setTrendingGames(games);
        setMyReviews(reviews);
      } catch (err) {
        console.error('HomePage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.username]);

  const uniqueGames = [...new Map(myReviews.map(r => [r.gameTitle, r])).values()];

  return (
    <Container>
      {/* Profile Card */}
      <ProfileCard>
        <ProfileLeft>
          <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
          <ProfileInfo>
            <ProfileName>
              {user.username}
              {user.role === 'admin' && <AdminBadge>ADMIN</AdminBadge>}
            </ProfileName>
            <ProfileMeta>
              {myReviews.length} review{myReviews.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              {uniqueGames.length} game{uniqueGames.length !== 1 ? 's' : ''} in library
            </ProfileMeta>
          </ProfileInfo>
        </ProfileLeft>
        <StatusButtons>
          <StatusBtn $active={activeStatus === 'played'} onClick={() => setActiveStatus('played')}>
            ✅ Played
          </StatusBtn>
          <StatusBtn $active={activeStatus === 'playing'} onClick={() => setActiveStatus('playing')}>
            🎮 Playing
          </StatusBtn>
          <StatusBtn $active={activeStatus === 'backlog'} onClick={() => setActiveStatus('backlog')}>
            📋 Backlog
          </StatusBtn>
        </StatusButtons>
      </ProfileCard>

      {/* Trending Games */}
      <Section>
        <SectionHeader>
          <SectionTitle>🔥 Trending Games</SectionTitle>
          <SectionCount>{trendingGames.length}</SectionCount>
        </SectionHeader>
        {loading ? (
          <LoadingText>Loading trending games...</LoadingText>
        ) : (
          <GamesGrid>
            {trendingGames.map((game, i) => (
              <GameCard key={game.id || i}>
                {game.coverUrl
                  ? <GameCoverImg src={game.coverUrl} alt={game.title} loading="lazy" />
                  : <GameIcon>🎮</GameIcon>
                }
                <GameName>{game.title}</GameName>
                <GameDesc>{game.description}</GameDesc>
                <GameRating>⭐ {typeof game.rating === 'number' ? game.rating.toFixed(1) : game.rating}</GameRating>
              </GameCard>
            ))}
          </GamesGrid>
        )}
      </Section>

      {/* My Game Library */}
      <Section>
        <SectionHeader>
          <SectionTitle>📚 My Game Library</SectionTitle>
          <SectionCount>{uniqueGames.length}</SectionCount>
        </SectionHeader>
        {loading ? (
          <LoadingText>Loading library...</LoadingText>
        ) : uniqueGames.length === 0 ? (
          <EmptyState>
            No games yet. Head to the ✍️ Review tab to add your first game!
          </EmptyState>
        ) : (
          uniqueGames.map((review, i) => (
            <LibraryItem key={i}>
              <LibraryGameName>🎮 {review.gameTitle}</LibraryGameName>
              <LibraryRating>⭐ {review.rating.toFixed(1)}</LibraryRating>
            </LibraryItem>
          ))
        )}
      </Section>
    </Container>
  );
}

export default HomePage;
