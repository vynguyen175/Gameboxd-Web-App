import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { getAllReviews, getTrendingGames, getFollowers } from '../services/api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import ReviewFilters from './ReviewFilters';
import LoadingSpinner from './LoadingSpinner';
import useAgeRestriction from '../hooks/useAgeRestriction';
import { Flame, Star, ChevronRight, Gamepad2, Users, FileText, TrendingUp, Trophy, Eye } from 'lucide-react';

/* ─── Keyframes ──────────────────────────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
`;

const gridMove = keyframes`
  0%   { transform: translate(0, 0); }
  100% { transform: translate(40px, 40px); }
`;

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50%      { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;


/* ─── Layout ─────────────────────────────────────────────────────────────── */

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 60px;
`;

/* ─── Hero Section ───────────────────────────────────────────────────────── */

const neonPulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`;

const HeroBanner = styled.div`
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 340px;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(168, 85, 247, 0.25), transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(0, 240, 255, 0.15), transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(255, 16, 240, 0.1), transparent 40%),
    linear-gradient(180deg, #0a0515 0%, #050510 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 40px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: ${gridMove} 6s linear infinite;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to top, var(--deep-space), transparent);
    pointer-events: none;
  }
`;

const HeroParticles = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled.div`
  position: absolute;
  width: ${p => p.$size || 4}px;
  height: ${p => p.$size || 4}px;
  border-radius: 50%;
  background: ${p => p.$color || 'var(--neon-purple)'};
  opacity: 0.4;
  animation: ${particleFloat} ${p => p.$duration || '4s'} ease-in-out infinite;
  animation-delay: ${p => p.$delay || '0s'};
  left: ${p => p.$left || '50%'};
  top: ${p => p.$top || '50%'};
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 20px;
`;

const HeroWelcome = styled.h1`
  font-size: 2.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF, #FACC15);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeUp} 0.8s var(--spring-bounce) both, ${shimmer} 6s linear infinite;
  filter: drop-shadow(0 2px 12px rgba(168, 85, 247, 0.4));
  margin-bottom: 8px;

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const HeroDate = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  animation: ${fadeUp} 0.8s var(--spring-bounce) 0.15s both;
  letter-spacing: 0.02em;
`;

/* ─── Quick Stats ────────────────────────────────────────────────────────── */

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: -40px auto 48px;
  max-width: 800px;
  position: relative;
  z-index: 3;
  padding: 0 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    margin-top: -20px;
  }
`;

const StatGlassCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: var(--shadow-depth-2);
  transition: all 0.4s var(--spring-bounce);
  animation: ${countUp} 0.6s var(--spring-bounce) ${p => p.$delay || '0s'} both;

  &:hover {
    transform: translateY(-6px) scale(1.04);
    box-shadow: var(--shadow-depth-3), 0 0 40px ${p => p.$glow || 'var(--glow-cyan)'};
    border-color: ${p => p.$accent || 'rgba(0, 240, 255, 0.3)'};
  }
`;

const StatIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${p => p.$bg || 'rgba(0, 240, 255, 0.12)'};
  margin-bottom: 10px;

  svg {
    width: 20px;
    height: 20px;
    color: ${p => p.$color || 'var(--neon-cyan)'};
  }
`;

const StatNumber = styled.div`
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, ${p => p.$from || '#00F0FF'}, ${p => p.$to || '#A855F7'});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

/* ─── Section Containers ─────────────────────────────────────────────────── */

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SeeAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--neon-purple);
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;

  svg { width: 16px; height: 16px; }

  &:hover {
    color: var(--neon-cyan);
  }
`;

/* ─── Trending Games Carousel ────────────────────────────────────────────── */

const CarouselWrapper = styled.div`
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-depth-1);

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 60px;
    background: linear-gradient(to left, var(--deep-space), transparent);
    border-radius: 0 24px 24px 0;
    pointer-events: none;
    z-index: 2;
  }
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 8px;

  scrollbar-width: thin;
  scrollbar-color: var(--neon-purple) transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--neon-purple);
    border-radius: 4px;
  }
`;

const TrendingCard = styled.div`
  flex: 0 0 180px;
  cursor: pointer;
  transition: all 0.35s var(--spring-bounce);
  animation: ${fadeUp} 0.5s var(--spring-bounce) ${p => p.$delay || '0s'} both;
  position: relative;

  &:hover {
    transform: scale(1.08) translateY(-4px);

    & > div:first-child {
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 8px 32px rgba(0, 0, 0, 0.5);
      border-color: rgba(168, 85, 247, 0.5);
    }
  }

  &:hover .card-overlay {
    opacity: 1;
  }
`;

const TrendingCover = styled.div`
  width: 180px;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  background: ${p => p.$image
    ? `url(${p.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 240, 255, 0.3))'};
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-depth-1);
  transition: all 0.35s var(--spring-bounce);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TrendingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
`;

const ViewButton = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: white;
  padding: 8px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;

  svg { width: 16px; height: 16px; }
`;

const TrendingTitle = styled.div`
  margin-top: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const TrendingRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--neon-gold);
  font-weight: 700;

  svg {
    width: 14px;
    height: 14px;
    fill: var(--neon-gold);
    color: var(--neon-gold);
  }
`;

const PlaceholderGameIcon = styled.div`
  color: var(--text-secondary);
  opacity: 0.4;
  svg { width: 48px; height: 48px; }
`;

/* ─── Top Rated Section ──────────────────────────────────────────────────── */

const TopRatedTrack = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-depth-1);

  scrollbar-width: thin;
  scrollbar-color: var(--neon-gold) transparent;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--neon-gold); border-radius: 4px; }
`;

const TopRatedCard = styled.div`
  flex: 0 0 140px;
  cursor: pointer;
  transition: all 0.35s var(--spring-bounce);
  animation: ${fadeUp} 0.5s var(--spring-bounce) ${p => p.$delay || '0s'} both;

  &:hover {
    transform: scale(1.06) translateY(-3px);
  }
`;

const TopRatedCover = styled.div`
  width: 140px;
  height: 186px;
  border-radius: 14px;
  overflow: hidden;
  background: ${p => p.$image
    ? `url(${p.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(250, 204, 21, 0.3), rgba(168, 85, 247, 0.2))'};
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-depth-1);
  transition: all 0.35s var(--spring-bounce);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  ${TopRatedCard}:hover & {
    box-shadow: 0 0 24px rgba(250, 204, 21, 0.4), 0 8px 28px rgba(0, 0, 0, 0.4);
    border-color: rgba(250, 204, 21, 0.4);
  }
`;

const TopRatedBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(250, 204, 21, 0.4);
  border-radius: 8px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--neon-gold);

  svg { width: 12px; height: 12px; fill: var(--neon-gold); color: var(--neon-gold); }
`;

const TopRatedTitle = styled.div`
  margin-top: 8px;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

/* ─── Reviews Grid ───────────────────────────────────────────────────────── */

const ReviewsGlass = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-depth-1);
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
  border-radius: 16px;
  padding: 24px;
  color: #FCA5A5;
  text-align: center;
  font-weight: 600;
  margin: 40px 0;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 32px auto 0;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  border: none;
  border-radius: 14px;
  padding: 14px 40px;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  transition: all 0.3s var(--spring-bounce);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover:not(:disabled) {
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.7);
    transform: translateY(-2px) scale(1.02);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  font-size: 1rem;
  font-weight: 500;
`;

/* ─── Animated Counter Hook ──────────────────────────────────────────────── */

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─── Scroll Reveal Hook ─────────────────────────────────────────────────── */

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

const RevealWrapper = styled.div`
  opacity: 1;
  animation: ${fadeUp} 0.6s ease-out both;
`;

/* ─── Auto-scroll hook ───────────────────────────────────────────────────── */

function useAutoScroll(ref, speed = 0.5) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let animId;
    let paused = false;

    const scroll = () => {
      if (!paused && el.scrollLeft < el.scrollWidth - el.clientWidth) {
        el.scrollLeft += speed;
      } else if (!paused) {
        el.scrollLeft = 0;
      }
      animId = requestAnimationFrame(scroll);
    };

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    animId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [ref, speed]);
}

/* ─── Particles data ─────────────────────────────────────────────────────── */

const particles = [
  { $size: 4, $color: 'var(--neon-purple)', $left: '10%', $top: '20%', $duration: '5s', $delay: '0s' },
  { $size: 3, $color: 'var(--neon-cyan)', $left: '25%', $top: '60%', $duration: '4s', $delay: '1s' },
  { $size: 5, $color: 'var(--neon-gold)', $left: '45%', $top: '30%', $duration: '6s', $delay: '0.5s' },
  { $size: 3, $color: 'var(--neon-purple)', $left: '65%', $top: '70%', $duration: '4.5s', $delay: '2s' },
  { $size: 4, $color: 'var(--neon-cyan)', $left: '80%', $top: '25%', $duration: '5.5s', $delay: '1.5s' },
  { $size: 6, $color: 'var(--neon-purple)', $left: '90%', $top: '55%', $duration: '7s', $delay: '0.8s' },
  { $size: 3, $color: 'var(--neon-gold)', $left: '5%', $top: '80%', $duration: '4s', $delay: '3s' },
  { $size: 4, $color: 'var(--neon-cyan)', $left: '55%', $top: '15%', $duration: '5s', $delay: '2.5s' },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

function Dashboard({ user }) {
  const navigate = useNavigate();
  const { filterMatureContent } = useAgeRestriction(user);
  const [reviews, setReviews] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({});
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const carouselRef = useRef(null);
  const topRatedRef = useRef(null);

  useAutoScroll(carouselRef, 0.4);
  useAutoScroll(topRatedRef, 0.3);

  const [trendingRef, trendingVisible] = useScrollReveal();
  const [reviewsRef, reviewsVisible] = useScrollReveal();
  const [topRatedSectionRef, topRatedVisible] = useScrollReveal();

  /* Fetch reviews */
  const fetchReviews = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    try {
      const params = {
        ...filters,
        limit: 12,
      };
      if (!reset && cursor) {
        params.cursor = cursor;
      }
      const data = await getAllReviews(params);
      const items = data.reviews || data || [];
      if (reset) {
        setReviews(Array.isArray(items) ? items : []);
      } else {
        setReviews(prev => [...prev, ...(Array.isArray(items) ? items : [])]);
      }
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error(err);
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

  /* Fetch trending games */
  useEffect(() => {
    getTrendingGames()
      .then(data => {
        const games = Array.isArray(data) ? data : (data.games || []);
        setTrendingGames(games);
        // Derive top rated: sort by rating descending
        const sorted = [...games].sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0));
        setTopRatedGames(sorted.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  /* Fetch follower count */
  useEffect(() => {
    if (user?.username) {
      getFollowers(user.username)
        .then(data => {
          const count = Array.isArray(data) ? data.length : (data.count || data.followers?.length || 0);
          setFollowerCount(count);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleVoteUpdate = (reviewId, upvotes, downvotes) => {
    setReviews(reviews.map(r =>
      r._id === reviewId
        ? { ...r, upvoteCount: upvotes, downvoteCount: downvotes }
        : r
    ));
  };

  const filteredReviews = useMemo(() => filterMatureContent(reviews), [reviews, filterMatureContent]);

  /* Stats */
  const totalReviews = filteredReviews.length;
  const uniqueGames = new Set(filteredReviews.map(r => r.gameTitle)).size;

  const animatedReviews = useCountUp(totalReviews);
  const animatedGames = useCountUp(uniqueGames);
  const animatedFollowers = useCountUp(followerCount);

  /* Date string */
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const displayName = user?.fullName || user?.username || 'Gamer';

  return (
    <>
      {/* ── Hero ── */}
      <HeroBanner>
        <HeroParticles>
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </HeroParticles>
        <HeroContent>
          <HeroWelcome>Welcome back, {displayName}</HeroWelcome>
          <HeroDate>{dateString}</HeroDate>
        </HeroContent>
      </HeroBanner>

      <DashboardContainer>
        {/* ── Quick Stats ── */}
        <StatsRow>
          <StatGlassCard $delay="0.1s" $glow="rgba(0, 240, 255, 0.3)" $accent="rgba(0, 240, 255, 0.3)">
            <StatIcon $bg="rgba(0, 240, 255, 0.12)" $color="var(--neon-cyan)">
              <FileText />
            </StatIcon>
            <StatNumber $from="#00F0FF" $to="#A855F7">{animatedReviews}</StatNumber>
            <StatLabel>Total Reviews</StatLabel>
          </StatGlassCard>
          <StatGlassCard $delay="0.2s" $glow="rgba(168, 85, 247, 0.3)" $accent="rgba(168, 85, 247, 0.3)">
            <StatIcon $bg="rgba(168, 85, 247, 0.12)" $color="var(--neon-purple)">
              <Gamepad2 />
            </StatIcon>
            <StatNumber $from="#A855F7" $to="#00F0FF">{animatedGames}</StatNumber>
            <StatLabel>Games Played</StatLabel>
          </StatGlassCard>
          <StatGlassCard $delay="0.3s" $glow="rgba(250, 204, 21, 0.3)" $accent="rgba(250, 204, 21, 0.3)">
            <StatIcon $bg="rgba(250, 204, 21, 0.12)" $color="var(--neon-gold)">
              <Users />
            </StatIcon>
            <StatNumber $from="#FACC15" $to="#A855F7">{animatedFollowers}</StatNumber>
            <StatLabel>Followers</StatLabel>
          </StatGlassCard>
        </StatsRow>

        {/* ── Trending Games ── */}
        {trendingGames.length > 0 && (
          <RevealWrapper ref={trendingRef} $visible={trendingVisible}>
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <Flame style={{ color: '#FF6B35' }} />
                  Trending Games
                </SectionTitle>
              </SectionHeader>
              <CarouselWrapper>
                <CarouselTrack ref={carouselRef}>
                  {trendingGames.map((game, i) => (
                    <TrendingCard
                      key={game._id || game.igdbGameId || i}
                      $delay={`${i * 0.07}s`}
                      onClick={() => navigate(`/game/${game.id || game.igdbGameId || game._id}`)}
                    >
                      <TrendingCover $image={game.imageUrl || game.coverUrl || game.cover || game.gameImageUrl}>
                        {!game.coverUrl && !game.cover && !game.gameImageUrl && (
                          <PlaceholderGameIcon><Gamepad2 /></PlaceholderGameIcon>
                        )}
                        <TrendingOverlay className="card-overlay">
                          <ViewButton><Eye /> View</ViewButton>
                        </TrendingOverlay>
                      </TrendingCover>
                      <TrendingTitle>{game.title || game.name}</TrendingTitle>
                      {(game.averageRating || game.rating) && (
                        <TrendingRating>
                          <Star /> {(game.averageRating || game.rating).toFixed(1)}
                        </TrendingRating>
                      )}
                    </TrendingCard>
                  ))}
                </CarouselTrack>
              </CarouselWrapper>
            </Section>
          </RevealWrapper>
        )}

        {/* ── Latest Reviews ── */}
        <RevealWrapper ref={reviewsRef} $visible={reviewsVisible}>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <TrendingUp style={{ color: 'var(--neon-cyan)' }} />
                Latest Reviews
              </SectionTitle>
              <SeeAllLink to="/feed">
                See All <ChevronRight />
              </SeeAllLink>
            </SectionHeader>

            <ReviewsGlass>
              <ReviewFilters onChange={handleFilterChange} />

              {loading && <LoadingSpinner text="Loading reviews" />}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              {!loading && !error && filteredReviews.length === 0 && (
                <EmptyState>No reviews yet. Be the first to add one!</EmptyState>
              )}

              <ReviewsGrid>
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onClick={() => setSelectedReview(review)}
                  />
                ))}
              </ReviewsGrid>

              {hasMore && !loading && (
                <LoadMoreButton onClick={() => fetchReviews(false)} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More'}
                </LoadMoreButton>
              )}
            </ReviewsGlass>
          </Section>
        </RevealWrapper>

        {/* ── Top Rated This Week ── */}
        {topRatedGames.length > 0 && (
          <RevealWrapper ref={topRatedSectionRef} $visible={topRatedVisible}>
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <Trophy style={{ color: 'var(--neon-gold)' }} />
                  Top Rated This Week
                </SectionTitle>
              </SectionHeader>
              <TopRatedTrack ref={topRatedRef}>
                {topRatedGames.map((game, i) => (
                  <TopRatedCard
                    key={game._id || game.igdbGameId || i}
                    $delay={`${i * 0.06}s`}
                    onClick={() => navigate(`/game/${game.id || game.igdbGameId || game._id}`)}
                  >
                    <TopRatedCover $image={game.imageUrl || game.coverUrl || game.cover || game.gameImageUrl}>
                      {!game.coverUrl && !game.cover && !game.gameImageUrl && (
                        <PlaceholderGameIcon><Gamepad2 /></PlaceholderGameIcon>
                      )}
                      {(game.averageRating || game.rating) && (
                        <TopRatedBadge>
                          <Star /> {(game.averageRating || game.rating).toFixed(1)}
                        </TopRatedBadge>
                      )}
                    </TopRatedCover>
                    <TopRatedTitle>{game.title || game.name}</TopRatedTitle>
                  </TopRatedCard>
                ))}
              </TopRatedTrack>
            </Section>
          </RevealWrapper>
        )}
      </DashboardContainer>

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          user={user}
          onClose={() => setSelectedReview(null)}
          onVoteUpdate={handleVoteUpdate}
        />
      )}
    </>
  );
}

export default Dashboard;
