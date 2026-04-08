import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ExternalLink } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BannerWrap = styled.a`
  display: block;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  margin: ${props => props.$margin || '32px 0'};
  animation: ${fadeIn} 0.4s ease;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15);
  }
`;

const BannerImage = styled.div`
  width: 100%;
  height: ${props => props.$size === 'large' ? '200px' : props.$size === 'small' ? '80px' : '120px'};
  background: ${props => props.$img
    ? `url(${props.$img}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,240,255,0.1))'};

  @media (max-width: 768px) {
    height: ${props => props.$size === 'large' ? '140px' : props.$size === 'small' ? '60px' : '90px'};
  }
`;

const BannerContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: ${props => props.$hasImage ? 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' : 'var(--glass-bg)'};
  border: ${props => props.$hasImage ? 'none' : '1px solid var(--glass-border)'};
  border-radius: 16px;
  backdrop-filter: ${props => props.$hasImage ? 'none' : 'blur(12px)'};
`;

const BannerText = styled.div`
  flex: 1;
  min-width: 0;
`;

const BannerTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${props => props.$hasImage ? '#fff' : 'var(--text-primary)'};
  margin-bottom: 4px;
  line-height: 1.3;
`;

const BannerDesc = styled.div`
  font-size: 0.85rem;
  color: ${props => props.$hasImage ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'};
  line-height: 1.4;
`;

const BannerCTA = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: white;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;

  svg { width: 14px; height: 14px; }
`;

const SponsoredTag = styled.div`
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  color: ${props => props.$hasImage ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)'};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

// Default ads to show when no custom ads are configured
const DEFAULT_ADS = [
  {
    title: 'Advertise on Gameboxd',
    description: 'Reach thousands of gamers. Place your ad here!',
    ctaText: 'Learn More',
    url: '/premium',
    imageUrl: '',
  },
];

function AdBanner({ ads, size = 'medium', margin, placement = 'default' }) {
  const [currentAd, setCurrentAd] = useState(null);
  const impressionLogged = useRef(false);

  useEffect(() => {
    const adList = (ads && ads.length > 0) ? ads : DEFAULT_ADS;
    // Pick a random ad
    const selected = adList[Math.floor(Math.random() * adList.length)];
    setCurrentAd(selected);
    impressionLogged.current = false;
  }, [ads]);

  // Log impression when ad becomes visible
  useEffect(() => {
    if (!currentAd || impressionLogged.current) return;
    impressionLogged.current = true;
    // Future: send impression analytics
  }, [currentAd]);

  if (!currentAd) return null;

  const hasImage = !!currentAd.imageUrl;
  const isExternal = currentAd.url && (currentAd.url.startsWith('http://') || currentAd.url.startsWith('https://'));

  return (
    <BannerWrap
      href={currentAd.url || '#'}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer sponsored' : undefined}
      $margin={margin}
      onClick={() => {
        // Future: send click analytics
      }}
    >
      {hasImage && <BannerImage $img={currentAd.imageUrl} $size={size} />}
      <BannerContent $hasImage={hasImage}>
        <BannerText>
          <BannerTitle $hasImage={hasImage}>{currentAd.title}</BannerTitle>
          {currentAd.description && (
            <BannerDesc $hasImage={hasImage}>{currentAd.description}</BannerDesc>
          )}
        </BannerText>
        {currentAd.ctaText && (
          <BannerCTA>
            {currentAd.ctaText}
            <ExternalLink />
          </BannerCTA>
        )}
      </BannerContent>
      <SponsoredTag $hasImage={hasImage}>Sponsored</SponsoredTag>
    </BannerWrap>
  );
}

export default AdBanner;
