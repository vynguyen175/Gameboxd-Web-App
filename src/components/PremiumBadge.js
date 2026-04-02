import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const rainbowShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  vertical-align: middle;
  margin-left: 6px;
  line-height: 1.4;

  ${props => props.$tier === 'pro' && `
    background: linear-gradient(90deg, #FACC15, #F59E0B, #FACC15);
    background-size: 200% auto;
    animation: ${shimmer} 3s linear infinite;
    color: #000;
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.3);
  `}

  ${props => props.$tier === 'ultimate' && `
    background: linear-gradient(90deg, #A855F7, #EC4899, #3B82F6, #06B6D4, #A855F7);
    background-size: 300% auto;
    animation: ${rainbowShift} 4s ease infinite;
    color: white;
    box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
  `}
`;

const DiamondIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 1 }}>
    <path d="M3.5 1L0 5.5L8 15L16 5.5L12.5 1H3.5ZM4.2 2H11.8L14.3 5.5L8 13L1.7 5.5L4.2 2Z" />
    <path d="M4.5 5.5L8 12L11.5 5.5H4.5Z" />
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 1 }}>
    <path d="M8 0L10 5.5H16L11 9L13 15L8 11.5L3 15L5 9L0 5.5H6L8 0Z" />
  </svg>
);

function PremiumBadge({ tier, isPremium }) {
  if (!isPremium || !tier || tier === 'free') return null;

  if (tier === 'pro') {
    return (
      <Badge $tier="pro">
        <StarIcon />
        PRO
      </Badge>
    );
  }

  if (tier === 'ultimate') {
    return (
      <Badge $tier="ultimate">
        <DiamondIcon />
        ULTIMATE
      </Badge>
    );
  }

  return null;
}

export default PremiumBadge;
