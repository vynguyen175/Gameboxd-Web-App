import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Star, ThumbsUp, Gamepad2, Calendar, ArrowLeft } from 'lucide-react';
import { getUserStats } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
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

const Hero = styled.div`
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08), transparent 50%);
    pointer-events: none;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan), var(--neon-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  letter-spacing: 0.05em;

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--neon-purple);
    box-shadow: 0 8px 32px var(--glow-purple);
    transform: translateY(-4px);
  }
`;

const StatIcon = styled.div`
  margin-bottom: 12px;
  color: ${props => props.$color || 'var(--neon-purple)'};
  svg { width: 32px; height: 32px; }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const GenreBarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GenreBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const GenreLabel = styled.span`
  width: 120px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
`;

const GenreBarBg = styled.div`
  flex: 1;
  height: 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
`;

const GenreBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-cyan));
  border-radius: 12px;
  width: ${props => props.$pct}%;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: ${props => props.$pct > 0 ? '32px' : '0'};
`;

const GenreCount = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
`;

const RatingDistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RatingBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RatingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 60px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #FBBF24;
  justify-content: flex-end;
  flex-shrink: 0;

  svg { width: 16px; height: 16px; fill: #FBBF24; color: #FBBF24; }
`;

const RatingBarBg = styled.div`
  flex: 1;
  height: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  overflow: hidden;
`;

const RatingBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #FBBF24, #F59E0B);
  border-radius: 10px;
  width: ${props => props.$pct}%;
  transition: width 0.5s ease;
`;

const RatingBarCount = styled.span`
  width: 40px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
`;

const GameCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const GameHighlight = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--neon-purple);
    box-shadow: 0 8px 32px var(--glow-purple);
  }
`;

const HighlightCover = styled.div`
  width: 80px;
  height: 100px;
  border-radius: 12px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 32px; height: 32px; color: white; opacity: 0.5; }
`;

const HighlightInfo = styled.div`
  flex: 1;
`;

const HighlightLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.$color || 'var(--neon-purple)'};
  margin-bottom: 4px;
`;

const HighlightTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const HighlightRating = styled.div`
  font-size: 0.9rem;
  color: #FBBF24;
  font-weight: 700;
`;

const MonthCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--neon-cyan);
    box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);
  }
`;

const MonthName = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
`;

const MonthDetail = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
`;

const StatusCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
`;

const StatusValue = styled.div`
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-primary);
`;

const StatusLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
`;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function YearInReviewPage({ user }) {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const year = searchParams.get('year') || new Date().getFullYear();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserStats(username, year);
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Could not load stats for this user.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [username, year]);

  if (loading) return <Container><LoadingSpinner text="Loading your year in gaming" /></Container>;

  if (error || !stats) {
    return (
      <Container>
        <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>
        <EmptyState>{error || 'No stats available.'}</EmptyState>
      </Container>
    );
  }

  const gamesReviewed = stats.gamesReviewed || 0;
  const averageRating = stats.averageRating || 0;
  const totalUpvotes = stats.totalUpvotes || 0;
  const topGenres = stats.topGenres || [];
  const ratingDistribution = stats.ratingDistribution || {};
  const highestRated = stats.highestRated || null;
  const lowestRated = stats.lowestRated || null;
  const mostActiveMonth = stats.mostActiveMonth;
  const mostActiveMonthCount = stats.mostActiveMonthCount || 0;
  const statusBreakdown = stats.statusBreakdown || {};

  const maxGenreCount = topGenres.length > 0 ? Math.max(...topGenres.map(g => g.count || 0), 1) : 1;
  const maxRatingCount = Math.max(...Object.values(ratingDistribution).map(Number), 1);

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>

      <Hero>
        <HeroTitle>YOUR {year} IN GAMING</HeroTitle>
        <HeroSubtitle>@{username}'s year at a glance</HeroSubtitle>
      </Hero>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="var(--neon-purple)"><Gamepad2 /></StatIcon>
          <StatValue>{gamesReviewed}</StatValue>
          <StatLabel>Games Reviewed</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon $color="#FBBF24"><Star /></StatIcon>
          <StatValue>{averageRating > 0 ? averageRating.toFixed(1) : '--'}</StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon $color="var(--neon-cyan)"><ThumbsUp /></StatIcon>
          <StatValue>{totalUpvotes}</StatValue>
          <StatLabel>Total Upvotes</StatLabel>
        </StatCard>
      </StatsGrid>

      {topGenres.length > 0 && (
        <Section>
          <SectionTitle>Top Genres</SectionTitle>
          <GenreBarsContainer>
            {topGenres.slice(0, 8).map(genre => (
              <GenreBarRow key={genre.name || genre.genre}>
                <GenreLabel>{genre.name || genre.genre}</GenreLabel>
                <GenreBarBg>
                  <GenreBarFill $pct={(genre.count / maxGenreCount) * 100}>
                    <GenreCount>{genre.count}</GenreCount>
                  </GenreBarFill>
                </GenreBarBg>
              </GenreBarRow>
            ))}
          </GenreBarsContainer>
        </Section>
      )}

      <Section>
        <SectionTitle>Rating Distribution</SectionTitle>
        <RatingDistContainer>
          {[5, 4, 3, 2, 1].map(n => {
            const count = ratingDistribution[n] || 0;
            return (
              <RatingBarRow key={n}>
                <RatingLabel><span>{n}</span> <Star /></RatingLabel>
                <RatingBarBg>
                  <RatingBarFill $pct={(count / maxRatingCount) * 100} />
                </RatingBarBg>
                <RatingBarCount>{count}</RatingBarCount>
              </RatingBarRow>
            );
          })}
        </RatingDistContainer>
      </Section>

      {(highestRated || lowestRated) && (
        <Section>
          <SectionTitle>Highlights</SectionTitle>
          <GameCardRow>
            {highestRated && (
              <GameHighlight>
                <HighlightCover $image={highestRated.gameImageUrl || highestRated.coverUrl}>
                  {!(highestRated.gameImageUrl || highestRated.coverUrl) && <Gamepad2 />}
                </HighlightCover>
                <HighlightInfo>
                  <HighlightLabel $color="#22C55E">Highest Rated</HighlightLabel>
                  <HighlightTitle>{highestRated.gameTitle}</HighlightTitle>
                  <HighlightRating>{'⭐'.repeat(Math.round(highestRated.rating))} {highestRated.rating?.toFixed(1)}</HighlightRating>
                </HighlightInfo>
              </GameHighlight>
            )}
            {lowestRated && (
              <GameHighlight>
                <HighlightCover $image={lowestRated.gameImageUrl || lowestRated.coverUrl}>
                  {!(lowestRated.gameImageUrl || lowestRated.coverUrl) && <Gamepad2 />}
                </HighlightCover>
                <HighlightInfo>
                  <HighlightLabel $color="#EF4444">Lowest Rated</HighlightLabel>
                  <HighlightTitle>{lowestRated.gameTitle}</HighlightTitle>
                  <HighlightRating>{'⭐'.repeat(Math.round(lowestRated.rating))} {lowestRated.rating?.toFixed(1)}</HighlightRating>
                </HighlightInfo>
              </GameHighlight>
            )}
          </GameCardRow>
        </Section>
      )}

      {mostActiveMonth != null && (
        <Section>
          <SectionTitle>Most Active Month</SectionTitle>
          <MonthCard>
            <Calendar style={{ width: 32, height: 32, color: 'var(--neon-cyan)', marginBottom: 12 }} />
            <MonthName>{MONTH_NAMES[mostActiveMonth] || `Month ${mostActiveMonth}`}</MonthName>
            <MonthDetail>{mostActiveMonthCount} review{mostActiveMonthCount !== 1 ? 's' : ''} submitted</MonthDetail>
          </MonthCard>
        </Section>
      )}

      {Object.keys(statusBreakdown).length > 0 && (
        <Section>
          <SectionTitle>Game Status Breakdown</SectionTitle>
          <StatusGrid>
            <StatusCard>
              <StatusValue>{statusBreakdown.want_to_play || 0}</StatusValue>
              <StatusLabel>Want to Play</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{statusBreakdown.playing || 0}</StatusValue>
              <StatusLabel>Playing</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{statusBreakdown.completed || 0}</StatusValue>
              <StatusLabel>Completed</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{statusBreakdown.dropped || 0}</StatusValue>
              <StatusLabel>Dropped</StatusLabel>
            </StatusCard>
          </StatusGrid>
        </Section>
      )}
    </Container>
  );
}

export default YearInReviewPage;
