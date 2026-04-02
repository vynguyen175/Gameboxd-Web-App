import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getNews } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 32px;
`;

const ArticleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ArticleCard = styled.a`
  display: flex;
  gap: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
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
  font-size: 1.1rem;
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
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
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
  background: rgba(168, 85, 247, 0.15);
  color: var(--neon-purple);
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await getNews();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <PageContainer>
      <PageTitle>Gaming News</PageTitle>
      <PageSubtitle>Latest news from the gaming world</PageSubtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner text="Loading news" />
      ) : articles.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No news articles yet</EmptyTitle>
          <p>Check back later for the latest gaming news.</p>
        </EmptyState>
      ) : (
        <ArticleGrid>
          {articles.map((article, i) => (
            <ArticleCard
              key={article._id || article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              $delay={`${i * 0.05}s`}
            >
              <ArticleImage $src={article.imageUrl} />
              <ArticleContent>
                <div>
                  <ArticleTitle>{article.title}</ArticleTitle>
                  <ArticleSummary>{article.summary}</ArticleSummary>
                </div>
                <ArticleMeta>
                  <SourceBadge>{article.source}</SourceBadge>
                  <span>{timeAgo(article.publishedAt)}</span>
                </ArticleMeta>
              </ArticleContent>
            </ArticleCard>
          ))}
        </ArticleGrid>
      )}
    </PageContainer>
  );
}

export default NewsPage;
