import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getAnalyticsGrowth, getAnalyticsEngagement, getAnalyticsTopGames } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const growUp = keyframes`
  from { height: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.4s ease;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const GlassCard = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled(GlassCard)`
  text-align: center;
  padding: 20px 16px;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const MetricLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 4px;
`;

const MetricChange = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 6px;
  color: ${props => props.$positive ? '#4ADE80' : props.$negative ? '#FCA5A5' : 'var(--text-secondary)'};
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
  padding: 16px 0 0 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--glass-border);
    border-radius: 2px;
  }
`;

const BarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 24px;
  flex: 1;
`;

const Bar = styled.div`
  width: 100%;
  max-width: 28px;
  height: ${props => props.$height}%;
  min-height: ${props => (props.$height > 0 ? '4px' : '0')};
  background: linear-gradient(180deg, var(--neon-purple), var(--neon-cyan));
  border-radius: 4px 4px 0 0;
  animation: ${growUp} 0.6s ease forwards;
  animation-delay: ${props => props.$delay || '0s'};
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:hover::after {
    content: '${props => props.$tooltip}';
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    border: 1px solid var(--glass-border);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    z-index: 10;
  }
`;

const BarLabel = styled.div`
  font-size: 0.6rem;
  color: var(--text-secondary);
  transform: rotate(-45deg);
  white-space: nowrap;
  font-weight: 600;
`;

const TopGamesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
  }
`;

const GameRank = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${props => props.$rank <= 3 ? 'var(--neon-cyan)' : 'var(--text-secondary)'};
  min-width: 28px;
`;

const GameImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$src ? `url(${props.$src}) center/cover` : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  flex-shrink: 0;
`;

const GameInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const GameTitle = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GameStats = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const GameBarOuter = styled.div`
  width: 100px;
  height: 8px;
  background: var(--glass-border);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
`;

const GameBarInner = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-cyan));
  border-radius: 4px;
  animation: ${growUp} 0.6s ease;
`;

const ActiveUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const ActiveUserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
`;

const ActiveUsername = styled.span`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const ActiveCount = styled.span`
  font-weight: 700;
  color: var(--neon-cyan);
  font-size: 0.85rem;
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ErrorText = styled.div`
  color: #FCA5A5;
  padding: 20px;
  text-align: center;
`;

function AnalyticsDashboard() {
  const [growth, setGrowth] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [growthData, engagementData, topGamesData] = await Promise.all([
          getAnalyticsGrowth().catch(() => []),
          getAnalyticsEngagement().catch(() => null),
          getAnalyticsTopGames().catch(() => []),
        ]);
        setGrowth(growthData || []);
        setEngagement(engagementData);
        setTopGames(topGamesData || []);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics" />;
  if (error) return <ErrorText>{error}</ErrorText>;

  const maxGrowth = Math.max(...growth.map(g => g.count), 1);
  const totalNewUsers = growth.reduce((sum, g) => sum + g.count, 0);

  const getChangeText = (thisWeek, lastWeek) => {
    if (lastWeek === 0) return thisWeek > 0 ? '+100%' : '0%';
    const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    return change >= 0 ? `+${change}%` : `${change}%`;
  };

  const maxReviewCount = topGames.length > 0 ? topGames[0].reviewCount : 1;

  return (
    <Container>
      {/* Engagement Metrics */}
      {engagement && (
        <MetricsGrid>
          <MetricCard>
            <MetricValue>{totalNewUsers}</MetricValue>
            <MetricLabel>New Users (30d)</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{engagement.thisWeek.reviews}</MetricValue>
            <MetricLabel>Reviews This Week</MetricLabel>
            <MetricChange
              $positive={engagement.thisWeek.reviews > engagement.lastWeek.reviews}
              $negative={engagement.thisWeek.reviews < engagement.lastWeek.reviews}
            >
              {getChangeText(engagement.thisWeek.reviews, engagement.lastWeek.reviews)} vs last week
            </MetricChange>
          </MetricCard>
          <MetricCard>
            <MetricValue>{engagement.thisWeek.comments}</MetricValue>
            <MetricLabel>Comments This Week</MetricLabel>
            <MetricChange
              $positive={engagement.thisWeek.comments > engagement.lastWeek.comments}
              $negative={engagement.thisWeek.comments < engagement.lastWeek.comments}
            >
              {getChangeText(engagement.thisWeek.comments, engagement.lastWeek.comments)} vs last week
            </MetricChange>
          </MetricCard>
          <MetricCard>
            <MetricValue>{engagement.thisWeek.votes}</MetricValue>
            <MetricLabel>Votes This Week</MetricLabel>
            <MetricChange
              $positive={engagement.thisWeek.votes > engagement.lastWeek.votes}
              $negative={engagement.thisWeek.votes < engagement.lastWeek.votes}
            >
              {getChangeText(engagement.thisWeek.votes, engagement.lastWeek.votes)} vs last week
            </MetricChange>
          </MetricCard>
        </MetricsGrid>
      )}

      {/* User Growth Chart */}
      <GlassCard>
        <SectionTitle>User Growth (Last 30 Days)</SectionTitle>
        <ChartContainer>
          {growth.map((day, i) => (
            <BarWrapper key={day.date}>
              <Bar
                $height={(day.count / maxGrowth) * 100}
                $delay={`${i * 0.02}s`}
                $tooltip={`${day.date}: ${day.count}`}
              />
              {i % 5 === 0 && (
                <BarLabel>{day.date.slice(5)}</BarLabel>
              )}
            </BarWrapper>
          ))}
        </ChartContainer>
      </GlassCard>

      <TwoColumns>
        {/* Top Games */}
        <GlassCard>
          <SectionTitle>Top 10 Most Reviewed Games</SectionTitle>
          <TopGamesGrid>
            {topGames.map((game, i) => (
              <GameRow key={game.gameTitle}>
                <GameRank $rank={i + 1}>#{i + 1}</GameRank>
                <GameImage $src={game.imageUrl} />
                <GameInfo>
                  <GameTitle>{game.gameTitle}</GameTitle>
                  <GameStats>{game.reviewCount} reviews - Avg {game.avgRating}/5</GameStats>
                </GameInfo>
                <GameBarOuter>
                  <GameBarInner $width={(game.reviewCount / maxReviewCount) * 100} />
                </GameBarOuter>
              </GameRow>
            ))}
            {topGames.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>
                No game data yet
              </div>
            )}
          </TopGamesGrid>
        </GlassCard>

        {/* Most Active Users */}
        <GlassCard>
          <SectionTitle>Most Active Users</SectionTitle>
          <ActiveUsersList>
            {engagement && engagement.mostActiveUsers.map((u, i) => (
              <ActiveUserRow key={u.username}>
                <ActiveUsername>
                  <span style={{ color: 'var(--text-secondary)', marginRight: 8 }}>#{i + 1}</span>
                  {u.username}
                </ActiveUsername>
                <ActiveCount>{u.reviewCount} reviews</ActiveCount>
              </ActiveUserRow>
            ))}
            {(!engagement || engagement.mostActiveUsers.length === 0) && (
              <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>
                No user data yet
              </div>
            )}
          </ActiveUsersList>
        </GlassCard>
      </TwoColumns>
    </Container>
  );
}

export default AnalyticsDashboard;
