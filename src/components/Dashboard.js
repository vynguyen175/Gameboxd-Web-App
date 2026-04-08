import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { getAllReviews, getTrendingGames, getFollowers } from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import ReviewFilters from './ReviewFilters';
import useAgeRestriction from '../hooks/useAgeRestriction';
import { Star, ChevronRight, ChevronLeft, Gamepad2, ArrowRight } from 'lucide-react';
import AdBanner from './AdBanner';

/* ═══════════════════════════════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════════════════════════════ */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* breathe animation available via CSS class if needed */

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON LOADER — always shows content structure, never black gaps
   ═══════════════════════════════════════════════════════════════════════════ */

const SkeletonBase = css`
  background: linear-gradient(90deg,
    var(--glass-bg) 0%,
    var(--glass-border) 50%,
    var(--glass-bg) 100%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.8s ease-in-out infinite;
  border-radius: 12px;
`;

const SkeletonCard = styled.div`
  ${SkeletonBase}
  width: 100%;
  aspect-ratio: ${p => p.$ratio || '3/4'};
  min-height: ${p => p.$minH || '200px'};
`;

const SkeletonText = styled.div`
  ${SkeletonBase}
  height: ${p => p.$h || '16px'};
  width: ${p => p.$w || '100%'};
  margin-top: ${p => p.$mt || '0'};
`;

/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */

const Page = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 80px;
`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURED HERO — Big cinematic spotlight on a game
   ═══════════════════════════════════════════════════════════════════════════ */

const HeroSection = styled.section`
  position: relative;
  width: calc(100% + 48px);
  margin: 0 -24px 48px;
  height: 420px;
  overflow: hidden;
  cursor: pointer;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  background: ${p => p.$img
    ? `url(${p.$img}) center/cover no-repeat`
    : 'linear-gradient(135deg, #1a0a2e 0%, #0a1628 50%, #0f0a1a 100%)'};
  filter: blur(0px) brightness(0.5);
  transform: scale(1.05);
  transition: transform 8s ease, filter 0.4s ease;

  ${HeroSection}:hover & {
    transform: scale(1.1);
    filter: blur(2px) brightness(0.4);
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(5, 5, 16, 0.95) 0%,
    rgba(5, 5, 16, 0.7) 40%,
    rgba(5, 5, 16, 0.3) 70%,
    rgba(5, 5, 16, 0.1) 100%
  );

  @media (max-width: 768px) {
    background: linear-gradient(to top, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.3) 100%);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 56px;
  max-width: 600px;

  @media (max-width: 768px) {
    padding: 24px 28px;
  }
`;

const HeroTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #c084fc;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  width: fit-content;
  animation: ${fadeIn} 0.6s ease both;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  animation: ${fadeIn} 0.6s ease 0.1s both;
`;

const HeroDesc = styled.p`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease 0.2s both;
`;

const HeroBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #0a0a14;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.6s ease 0.3s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,255,255,0.15);
  }

  svg { width: 16px; height: 16px; }
`;

const HeroDots = styled.div`
  position: absolute;
  bottom: 20px;
  right: 56px;
  z-index: 3;
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    right: 28px;
    bottom: 16px;
  }
`;

const HeroDot = styled.button`
  width: ${p => p.$active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  border: none;
  background: ${p => p.$active ? '#fff' : 'rgba(255,255,255,0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: ${p => p.$active ? '#fff' : 'rgba(255,255,255,0.5)'};
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════════════ */

const SectionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
`;

const SeeAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;

  &:hover { color: var(--neon-purple); }
  svg { width: 16px; height: 16px; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   GAME CAROUSEL — horizontal scroll with peek
   ═══════════════════════════════════════════════════════════════════════════ */

const CarouselWrap = styled.div`
  position: relative;
  margin-bottom: 48px;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 4px 0 16px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const CarouselArrow = styled.button`
  position: absolute;
  top: 50%;
  ${p => p.$dir === 'left' ? 'left: -12px' : 'right: -12px'};
  transform: translateY(-50%);
  z-index: 5;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;

  ${CarouselWrap}:hover & { opacity: 1; }
  &:hover {
    background: var(--neon-purple);
    border-color: var(--neon-purple);
    transform: translateY(-50%) scale(1.1);
  }

  svg { width: 18px; height: 18px; }
`;

const GameCard = styled.div`
  flex-shrink: 0;
  width: 180px;
  scroll-snap-align: start;
  cursor: pointer;
  animation: ${slideIn} 0.4s ease ${p => p.$delay || '0s'} both;

  &:hover img, &:hover .cover {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(168, 85, 247, 0.3);
  }

  @media (max-width: 768px) {
    width: 140px;
  }
`;

const GameCover = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
  background: var(--glass-bg);
`;

const GameCoverImg = styled.div`
  width: 100%;
  height: 100%;
  background: ${p => p.$img
    ? `url(${p.$img}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,240,255,0.1))'};
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 40px; height: 40px; color: rgba(255,255,255,0.15); }
`;

const GameRatingBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  color: #FBBF24;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 3px;

  svg { width: 10px; height: 10px; fill: #FBBF24; }
`;

const GameName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
`;

/* ═══════════════════════════════════════════════════════════════════════════
   STATS BAR — compact, inline
   ═══════════════════════════════════════════════════════════════════════════ */

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
  animation: ${fadeIn} 0.5s ease 0.2s both;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  flex: 1;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--card-border-hover);
    transform: translateY(-2px);
  }
`;

const StatNum = styled.div`
  font-size: 1.8rem;
  font-weight: 900;
  color: ${p => p.$color || 'var(--text-primary)'};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const StatMeta = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEWS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadMore = styled.button`
  display: block;
  margin: 32px auto 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 12px 40px;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const ErrorBanner = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 12px;
  padding: 16px 20px;
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  font-size: 0.95rem;
  font-weight: 500;
`;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function Dashboard({ user }) {
  const navigate = useNavigate();
  const { filterMatureContent } = useAgeRestriction(user);

  const [reviews, setReviews] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [, setTrendingLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({});
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const trendingTrackRef = useRef(null);
  const topRatedTrackRef = useRef(null);

  // Load ads from localStorage (set by admin)
  const activeAds = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem('gameboxd_ads') || '[]');
      return all.filter(ad => ad.active);
    } catch { return []; }
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    if (trendingGames.length < 2) return;
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % Math.min(trendingGames.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [trendingGames.length]);

  // Fetch reviews
  const fetchReviews = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const params = { ...filters, limit: 12 };
      if (!reset && cursor) params.cursor = cursor;
      const data = await getAllReviews(params);
      const items = data.reviews || data || [];
      if (reset) setReviews(Array.isArray(items) ? items : []);
      else setReviews(prev => [...prev, ...(Array.isArray(items) ? items : [])]);
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, cursor]);

  useEffect(() => {
    setCursor(null);
    fetchReviews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fetch trending
  useEffect(() => {
    getTrendingGames()
      .then(data => {
        const games = Array.isArray(data) ? data : (data.games || []);
        setTrendingGames(games.filter(g => g.imageUrl));
      })
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  // Fetch followers
  useEffect(() => {
    if (user?.username) {
      getFollowers(user.username)
        .then(data => setFollowerCount(Array.isArray(data) ? data.length : 0))
        .catch(() => {});
    }
  }, [user]);

  const filteredReviews = useMemo(
    () => filterMatureContent(reviews),
    [reviews, filterMatureContent]
  );

  const topRated = useMemo(
    () => [...trendingGames].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 15),
    [trendingGames]
  );

  const heroGame = trendingGames.length > 0 ? trendingGames[heroIndex % trendingGames.length] : null;
  const totalReviews = filteredReviews.length;
  const uniqueGames = new Set(filteredReviews.map(r => r.gameTitle)).size;

  const scrollCarousel = (ref, dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 400, behavior: 'smooth' });
    }
  };

  return (
    <Page>
      {/* ═══ HERO ═══ */}
      {heroGame ? (
        <HeroSection onClick={() => navigate(`/game/${heroGame.id}`)}>
          <HeroBg $img={heroGame.imageUrl} key={heroIndex} />
          <HeroOverlay />
          <HeroContent>
            <HeroTag><Star style={{ width: 10, height: 10 }} /> Featured</HeroTag>
            <HeroTitle>{heroGame.title}</HeroTitle>
            <HeroDesc>{heroGame.description}</HeroDesc>
            <HeroBtn>
              View Game <ArrowRight />
            </HeroBtn>
          </HeroContent>
          <HeroDots>
            {trendingGames.slice(0, 5).map((_, i) => (
              <HeroDot key={i} $active={i === heroIndex} onClick={e => { e.stopPropagation(); setHeroIndex(i); }} />
            ))}
          </HeroDots>
        </HeroSection>
      ) : (
        <HeroSection>
          <HeroBg />
          <HeroOverlay />
          <HeroContent>
            <SkeletonText $w="80px" $h="24px" />
            <SkeletonText $w="320px" $h="36px" $mt="16px" />
            <SkeletonText $w="240px" $h="16px" $mt="12px" />
            <SkeletonText $w="120px" $h="44px" $mt="24px" style={{ borderRadius: 8 }} />
          </HeroContent>
        </HeroSection>
      )}

      {/* ═══ STATS ═══ */}
      <StatsBar>
        <StatItem>
          <StatNum $color="var(--neon-cyan)">{totalReviews}</StatNum>
          <StatMeta>Reviews</StatMeta>
        </StatItem>
        <StatItem>
          <StatNum $color="var(--neon-purple)">{uniqueGames}</StatNum>
          <StatMeta>Games Reviewed</StatMeta>
        </StatItem>
        <StatItem>
          <StatNum $color="var(--neon-gold)">{followerCount}</StatNum>
          <StatMeta>Followers</StatMeta>
        </StatItem>
      </StatsBar>

      {/* ═══ TRENDING GAMES ═══ */}
      {(trendingGames.length > 0 || true) && (
        <CarouselWrap>
          <SectionRow>
            <SectionTitle>Trending Now</SectionTitle>
            <SeeAll to="/search">Browse All <ChevronRight /></SeeAll>
          </SectionRow>
          {trendingGames.length > 0 ? (
            <>
              <CarouselArrow $dir="left" onClick={() => scrollCarousel(trendingTrackRef, -1)}>
                <ChevronLeft />
              </CarouselArrow>
              <CarouselTrack ref={trendingTrackRef}>
                {trendingGames.map((game, i) => (
                  <GameCard key={game.id || i} $delay={`${i * 0.04}s`} onClick={() => navigate(`/game/${game.id}`)}>
                    <GameCover>
                      <GameCoverImg className="cover" $img={game.imageUrl}>
                        {!game.imageUrl && <Gamepad2 />}
                      </GameCoverImg>
                      {game.rating > 0 && (
                        <GameRatingBadge><Star />{game.rating.toFixed(1)}</GameRatingBadge>
                      )}
                    </GameCover>
                    <GameName>{game.title}</GameName>
                  </GameCard>
                ))}
              </CarouselTrack>
              <CarouselArrow $dir="right" onClick={() => scrollCarousel(trendingTrackRef, 1)}>
                <ChevronRight />
              </CarouselArrow>
            </>
          ) : (
            <CarouselTrack>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: 180 }}>
                  <SkeletonCard $ratio="3/4" $minH="240px" />
                  <SkeletonText $w="80%" $mt="10px" />
                </div>
              ))}
            </CarouselTrack>
          )}
        </CarouselWrap>
      )}

      {/* ═══ AD BANNER ═══ */}
      <AdBanner ads={activeAds} placement="dashboard-top" size="medium" />

      {/* ═══ TOP RATED ═══ */}
      {topRated.length > 0 && (
        <CarouselWrap>
          <SectionRow>
            <SectionTitle>Top Rated</SectionTitle>
          </SectionRow>
          <CarouselArrow $dir="left" onClick={() => scrollCarousel(topRatedTrackRef, -1)}>
            <ChevronLeft />
          </CarouselArrow>
          <CarouselTrack ref={topRatedTrackRef}>
            {topRated.map((game, i) => (
              <GameCard key={game.id || i} $delay={`${i * 0.04}s`} onClick={() => navigate(`/game/${game.id}`)}>
                <GameCover>
                  <GameCoverImg className="cover" $img={game.imageUrl}>
                    {!game.imageUrl && <Gamepad2 />}
                  </GameCoverImg>
                  {game.rating > 0 && (
                    <GameRatingBadge><Star />{game.rating.toFixed(1)}</GameRatingBadge>
                  )}
                </GameCover>
                <GameName>{game.title}</GameName>
              </GameCard>
            ))}
          </CarouselTrack>
          <CarouselArrow $dir="right" onClick={() => scrollCarousel(topRatedTrackRef, 1)}>
            <ChevronRight />
          </CarouselArrow>
        </CarouselWrap>
      )}

      {/* ═══ LATEST REVIEWS ═══ */}
      <section style={{ marginTop: 16 }}>
        <SectionRow>
          <SectionTitle>Latest Reviews</SectionTitle>
          <SeeAll to="/feed">See All <ChevronRight /></SeeAll>
        </SectionRow>

        <ReviewFilters onChange={useCallback(f => setFilters(f), [])} />

        {loading ? (
          <ReviewsGrid>
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} $ratio="auto" $minH="280px" />
            ))}
          </ReviewsGrid>
        ) : error ? (
          <ErrorBanner>{error}</ErrorBanner>
        ) : filteredReviews.length === 0 ? (
          <EmptyState>No reviews yet. Be the first to share your thoughts.</EmptyState>
        ) : (
          <ReviewsGrid>
            {filteredReviews.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                onClick={() => setSelectedReview(review)}
              />
            ))}
          </ReviewsGrid>
        )}

        {hasMore && !loading && (
          <LoadMore onClick={() => fetchReviews(false)} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More'}
          </LoadMore>
        )}
      </section>

      {/* ═══ REVIEW MODAL ═══ */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
          onVoteUpdate={(id, up, down) => {
            setReviews(reviews.map(r =>
              r._id === id ? { ...r, upvoteCount: up, downvoteCount: down } : r
            ));
          }}
        />
      )}
    </Page>
  );
}

export default Dashboard;
