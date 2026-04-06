import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Crown, Check, X, Sparkles, Star, Gamepad2 } from 'lucide-react';

const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(90deg, #FACC15, #F59E0B, #FACC15, #F59E0B);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
`;

const CrownIcon = styled.span`
  display: inline-flex;
  svg {
    color: #FACC15;
    -webkit-text-fill-color: initial;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const gradientBorder = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const TierCardBase = styled.div`
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);

  &:hover {
    transform: translateY(-4px);
  }
`;

const TierCardPro = styled(TierCardBase)`
  border: 2px solid transparent;
  background-image: linear-gradient(var(--card-background, rgba(10, 10, 15, 0.95)), var(--card-background, rgba(10, 10, 15, 0.95))),
                    linear-gradient(135deg, #FACC15, #F59E0B, #FACC15);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  transform: scale(1.05);

  &:hover { transform: scale(1.08); }
`;

const TierCardUltimate = styled(TierCardBase)`
  border: 2px solid transparent;
  background-image: linear-gradient(var(--card-background, rgba(10, 10, 15, 0.95)), var(--card-background, rgba(10, 10, 15, 0.95))),
                    linear-gradient(135deg, #A855F7, #EC4899, #3B82F6, #06B6D4, #A855F7);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  background-size: 100% 100%, 300% 300%;
  animation: ${gradientBorder} 4s ease infinite;

  &:hover { transform: translateY(-6px); }
`;

/* Tier card components used directly: TierCardBase, TierCardPro, TierCardUltimate */

const PopularBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FACC15, #F59E0B);
  color: #000;
  padding: 4px 20px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const TierIcon = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
  }
`;

const TierName = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const TierPrice = styled.div`
  margin-bottom: 24px;
`;

const PriceAmount = styled.span`
  font-size: 2.5rem;
  font-weight: 900;
  color: ${props => {
    if (props.$tier === 'pro') return '#FACC15';
    if (props.$tier === 'ultimate') return '#C084FC';
    return 'var(--text-primary)';
  }};
`;

const PricePeriod = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: ${props => props.$included ? 'var(--text-primary)' : 'var(--text-tertiary)'};
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: ${props => props.$included ? 'none' : 'line-through'};

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: ${props => props.$included ? '#22C55E' : 'var(--text-tertiary)'};
  }
`;

const TierButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 800;
  cursor: ${props => props.$active ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  border: none;
  letter-spacing: 0.03em;

  ${props => {
    if (props.$active) return `
      background: var(--tag-bg);
      color: var(--text-secondary);
      border: 1px solid var(--tag-border);
    `;
    if (props.$tier === 'pro') return `
      background: linear-gradient(135deg, #FACC15, #F59E0B);
      color: #000;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(250, 204, 21, 0.3); }
    `;
    if (props.$tier === 'ultimate') return `
      background: linear-gradient(135deg, #A855F7, #EC4899);
      color: white;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(168, 85, 247, 0.3); }
    `;
    return `
      background: var(--tag-bg);
      color: var(--text-primary);
      border: 1px solid var(--tag-border);
    `;
  }}
`;

const ComparisonNote = styled.p`
  text-align: center;
  margin-top: 40px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  font-weight: 600;
`;

const features = {
  free: [
    { text: 'Write reviews', included: true },
    { text: 'Follow users', included: true },
    { text: 'Create up to 5 lists', included: true },
    { text: 'Game backlog tracking', included: true },
    { text: 'Custom profile badge', included: false },
    { text: 'Priority support', included: false },
    { text: 'Advanced analytics', included: false },
    { text: 'Unlimited lists', included: false },
    { text: 'Early feature access', included: false },
  ],
  pro: [
    { text: 'Everything in Free', included: true },
    { text: 'Custom profile badge', included: true },
    { text: 'Unlimited lists', included: true },
    { text: 'Advanced analytics', included: true },
    { text: 'Priority support', included: true },
    { text: 'No ads', included: true },
    { text: 'Custom themes', included: false },
    { text: 'Early feature access', included: false },
    { text: 'API access', included: false },
  ],
  ultimate: [
    { text: 'Everything in Pro', included: true },
    { text: 'Custom themes', included: true },
    { text: 'Early feature access', included: true },
    { text: 'API access', included: true },
    { text: 'Exclusive badge', included: true },
    { text: 'Profile customization', included: true },
    { text: 'Priority feature requests', included: true },
    { text: 'Founder recognition', included: true },
    { text: 'Direct developer chat', included: true },
  ],
};

function PremiumPage({ user }) {
  const currentTier = user?.premiumTier || 'free';

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <CrownIcon><Crown size={36} /></CrownIcon>
          Gameboxd Premium
        </Title>
        <Subtitle>
          Unlock the full Gameboxd experience with premium features, custom badges, and more.
        </Subtitle>
      </HeaderSection>

      <TiersGrid>
        {/* Free Tier */}
        <TierCardBase>
          <TierIcon>
            <Gamepad2 style={{ color: 'var(--text-secondary)' }} />
          </TierIcon>
          <TierName>Free</TierName>
          <TierPrice>
            <PriceAmount $tier="free">$0</PriceAmount>
            <PricePeriod> /forever</PricePeriod>
          </TierPrice>
          <FeatureList>
            {features.free.map((f, i) => (
              <FeatureItem key={i} $included={f.included}>
                {f.included ? <Check /> : <X />}
                {f.text}
              </FeatureItem>
            ))}
          </FeatureList>
          <TierButton $active={currentTier === 'free'} $tier="free">
            {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
          </TierButton>
        </TierCardBase>

        {/* Pro Tier */}
        <TierCardPro>
          <PopularBadge>Most Popular</PopularBadge>
          <TierIcon>
            <Star style={{ color: '#FACC15', fill: '#FACC15' }} />
          </TierIcon>
          <TierName>Pro</TierName>
          <TierPrice>
            <PriceAmount $tier="pro">$4.99</PriceAmount>
            <PricePeriod> /month</PricePeriod>
          </TierPrice>
          <FeatureList>
            {features.pro.map((f, i) => (
              <FeatureItem key={i} $included={f.included}>
                {f.included ? <Check /> : <X />}
                {f.text}
              </FeatureItem>
            ))}
          </FeatureList>
          <TierButton $active={currentTier === 'pro'} $tier="pro">
            {currentTier === 'pro' ? 'Current Plan' : 'Coming Soon'}
          </TierButton>
        </TierCardPro>

        {/* Ultimate Tier */}
        <TierCardUltimate>
          <TierIcon>
            <Sparkles style={{ color: '#C084FC' }} />
          </TierIcon>
          <TierName>Ultimate</TierName>
          <TierPrice>
            <PriceAmount $tier="ultimate">$9.99</PriceAmount>
            <PricePeriod> /month</PricePeriod>
          </TierPrice>
          <FeatureList>
            {features.ultimate.map((f, i) => (
              <FeatureItem key={i} $included={f.included}>
                {f.included ? <Check /> : <X />}
                {f.text}
              </FeatureItem>
            ))}
          </FeatureList>
          <TierButton $active={currentTier === 'ultimate'} $tier="ultimate">
            {currentTier === 'ultimate' ? 'Current Plan' : 'Coming Soon'}
          </TierButton>
        </TierCardUltimate>
      </TiersGrid>

      <ComparisonNote>
        Payment integration coming soon. Premium features will be activated once billing is set up.
      </ComparisonNote>
    </PageContainer>
  );
}

export default PremiumPage;
