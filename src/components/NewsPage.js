import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { fetchGamingNews, fetchGamingVideos } from '../services/newsService';
import LoadingSpinner from './LoadingSpinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div``;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 4px;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6), rgba(168,85,247,0.4), rgba(0,240,255,0.5));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  body.light-mode & {
    background: linear-gradient(135deg, rgba(26,26,46,0.95), rgba(26,26,46,0.7), rgba(124,58,237,0.6), rgba(8,145,178,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const PageSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const RefreshButton = styled.button`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$active ? 'var(--neon-purple)' : 'var(--glass-border)'};
  background: ${props => props.$active ? 'rgba(168, 85, 247, 0.15)' : 'var(--glass-bg)'};
  color: ${props => props.$active ? 'var(--neon-purple)' : 'var(--text-secondary)'};

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

const ArticleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ArticleCard = styled.a`
  display: flex;
  gap: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.4s ease;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    border-color: var(--neon-purple);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ArticleImage = styled.div`
  width: 180px;
  min-height: 120px;
  border-radius: 12px;
  background: ${props => props.$src
    ? `url(${props.$src}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    height: 180px;
  }
`;

const ArticleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
`;

const ArticleTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleSummary = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const SourceBadge = styled.span`
  background: ${props => props.$bg || 'rgba(168, 85, 247, 0.15)'};
  color: ${props => props.$color || 'var(--neon-purple)'};
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
`;

const SOURCE_COLORS = {
  IGN: { bg: 'rgba(191, 0, 0, 0.15)', text: '#FF4444' },
  GameSpot: { bg: 'rgba(255, 170, 0, 0.15)', text: '#FFAA00' },
  'PC Gamer': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' },
  Kotaku: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7' },
};

const CHANNEL_COLORS = {
  IGN: { bg: 'rgba(191, 0, 0, 0.15)', text: '#FF4444' },
  GameSpot: { bg: 'rgba(255, 170, 0, 0.15)', text: '#FFAA00' },
  gameranx: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' },
  'Skill Up': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA' },
  'Kinda Funny Games': { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7' },
};

/* ── Video Grid ── */

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const VideoCard = styled.a`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.4s ease;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    border-color: var(--neon-purple);
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15);
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${props => props.$src
    ? `url(${props.$src}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  position: relative;
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s ease;

  ${VideoCard}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    clip-path: polygon(35% 20%, 35% 80%, 80% 50%);
  }
`;

const VideoInfo = styled.div`
  padding: 14px 16px;
`;

const VideoTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: var(--text-secondary);
`;

const EmptyTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const ErrorMessage = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.3);
  color: #FCA5A5;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 24px;
`;

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function NewsPage() {
  const [tab, setTab] = useState('news');
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsData, videosData] = await Promise.allSettled([
        fetchGamingNews(),
        fetchGamingVideos(),
      ]);
      if (newsData.status === 'fulfilled') setArticles(newsData.value);
      if (videosData.status === 'fulfilled') setVideos(videosData.value);
      if (newsData.status === 'rejected' && videosData.status === 'rejected') {
        setError('Failed to load content. Please try again later.');
      }
    } catch {
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer>
      <HeaderRow>
        <HeaderLeft>
          <PageTitle>Gaming News</PageTitle>
          <PageSubtitle>Latest news and videos from the gaming world</PageSubtitle>
        </HeaderLeft>
        <RefreshButton onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </RefreshButton>
      </HeaderRow>

      <TabRow>
        <Tab $active={tab === 'news'} onClick={() => setTab('news')}>
          News ({articles.length})
        </Tab>
        <Tab $active={tab === 'videos'} onClick={() => setTab('videos')}>
          Videos ({videos.length})
        </Tab>
      </TabRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner text={tab === 'news' ? 'Loading news' : 'Loading videos'} />
      ) : tab === 'news' ? (
        articles.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No news articles yet</EmptyTitle>
            <p>Check back later for the latest gaming news.</p>
          </EmptyState>
        ) : (
          <ArticleGrid>
            {articles.map((article, i) => {
              const colors = SOURCE_COLORS[article.source] || {};
              return (
                <ArticleCard
                  key={article.url + i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  $delay={`${i * 0.04}s`}
                >
                  <ArticleImage $src={article.imageUrl} />
                  <ArticleContent>
                    <div>
                      <ArticleTitle>{article.title}</ArticleTitle>
                      <ArticleSummary>{article.summary}</ArticleSummary>
                    </div>
                    <ArticleMeta>
                      <SourceBadge $bg={colors.bg} $color={colors.text}>
                        {article.source}
                      </SourceBadge>
                      <span>{timeAgo(article.publishedAt)}</span>
                    </ArticleMeta>
                  </ArticleContent>
                </ArticleCard>
              );
            })}
          </ArticleGrid>
        )
      ) : (
        videos.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No videos yet</EmptyTitle>
            <p>Check back later for the latest gaming videos.</p>
          </EmptyState>
        ) : (
          <VideoGrid>
            {videos.map((video, i) => {
              const colors = CHANNEL_COLORS[video.channel] || {};
              return (
                <VideoCard
                  key={video.url + i}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  $delay={`${i * 0.04}s`}
                >
                  <VideoThumbnail $src={video.thumbnail}>
                    <PlayOverlay />
                  </VideoThumbnail>
                  <VideoInfo>
                    <VideoTitle>{video.title}</VideoTitle>
                    <ArticleMeta>
                      <SourceBadge $bg={colors.bg} $color={colors.text}>
                        {video.channel}
                      </SourceBadge>
                      <span>{timeAgo(video.publishedAt)}</span>
                    </ArticleMeta>
                  </VideoInfo>
                </VideoCard>
              );
            })}
          </VideoGrid>
        )
      )}
    </PageContainer>
  );
}

export default NewsPage;
