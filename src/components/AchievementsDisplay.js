import React from 'react';
import styled from 'styled-components';
import { Trophy, Star, MessageCircle, ThumbsUp, Users, Award, Zap, Crown, Heart } from 'lucide-react';

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const BadgeCard = styled.div`
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: 2px solid ${props => props.$unlocked ? 'var(--neon-purple)' : 'var(--card-border)'};
  border-radius: 16px;
  padding: 20px 14px;
  text-align: center;
  opacity: ${props => props.$unlocked ? 1 : 0.45};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.$unlocked && `
    box-shadow: 0 0 20px var(--glow-purple), 0 0 40px rgba(168, 85, 247, 0.15);
  `}

  &:hover {
    transform: translateY(-3px);
    ${props => props.$unlocked && `
      box-shadow: 0 0 30px var(--glow-purple), 0 0 60px rgba(168, 85, 247, 0.2);
    `}
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  background: ${props => props.$unlocked
    ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
    : 'var(--card-border)'};
  color: ${props => props.$unlocked ? 'white' : 'var(--text-tertiary)'};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const BadgeName = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const BadgeDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const UnlockedLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 10px;
  color: ${props => props.$unlocked ? 'var(--neon-cyan)' : 'var(--text-tertiary)'};
`;

const ICON_MAP = {
  'pencil': Zap,
  'star': Star,
  'award': Award,
  'thumbs-up': ThumbsUp,
  'heart': Heart,
  'users': Users,
  'user-plus': Crown,
  'globe': Users,
  'message-circle': MessageCircle,
};

function getIconComponent(iconName) {
  return ICON_MAP[iconName] || Trophy;
}

function AchievementsDisplay({ achievements }) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <AchievementsGrid>
      {achievements.map((ach, index) => {
        const IconComp = getIconComponent(ach.icon);
        const isUnlocked = ach.unlocked !== false;

        return (
          <BadgeCard key={ach._id || ach.key || index} $unlocked={isUnlocked}>
            <IconWrapper $unlocked={isUnlocked}>
              <IconComp />
            </IconWrapper>
            <BadgeName>{ach.name || ach.title}</BadgeName>
            <BadgeDescription>{ach.description || ''}</BadgeDescription>
            <UnlockedLabel $unlocked={isUnlocked}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </UnlockedLabel>
          </BadgeCard>
        );
      })}
    </AchievementsGrid>
  );
}

export default AchievementsDisplay;
