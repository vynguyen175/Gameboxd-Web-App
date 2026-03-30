import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Gamepad2 } from 'lucide-react';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
`;

const orbit = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$compact ? '24px 0' : '60px 0'};
  gap: 20px;
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: ${props => props.$compact ? '48px' : '64px'};
  height: ${props => props.$compact ? '48px' : '64px'};
`;

const Ring = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: ${orbit} ${props => props.$speed || '1.2s'} linear infinite;
  animation-direction: ${props => props.$reverse ? 'reverse' : 'normal'};
`;

const Ring1 = styled(Ring)`
  border-top-color: var(--neon-purple);
  filter: drop-shadow(0 0 6px var(--glow-purple));
`;

const Ring2 = styled(Ring)`
  top: 6px; left: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  border-top-color: var(--neon-cyan);
  filter: drop-shadow(0 0 6px var(--glow-cyan));
`;

const Ring3 = styled(Ring)`
  top: 12px; left: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  border-top-color: #FF10F0;
  filter: drop-shadow(0 0 6px rgba(255, 16, 240, 0.4));
`;

const IconCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--neon-purple);
  animation: ${pulse} 2s ease-in-out infinite;

  svg {
    width: ${props => props.$compact ? '18px' : '24px'};
    height: ${props => props.$compact ? '18px' : '24px'};
  }
`;

const TextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Label = styled.span`
  font-size: ${props => props.$compact ? '0.85rem' : '0.95rem'};
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
`;

const Dot = styled.span`
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--neon-purple);
  animation: ${dotBounce} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
  margin-left: 1px;
`;

function LoadingSpinner({ text = 'Loading', compact = false }) {
  return (
    <Wrapper $compact={compact}>
      <SpinnerContainer $compact={compact}>
        <Ring1 $speed="1s" />
        <Ring2 $speed="1.5s" $reverse />
        <Ring3 $speed="2s" />
        <IconCenter $compact={compact}><Gamepad2 /></IconCenter>
      </SpinnerContainer>
      <TextRow>
        <Label $compact={compact}>{text}</Label>
        <Dot $delay="0s" />
        <Dot $delay="0.2s" />
        <Dot $delay="0.4s" />
      </TextRow>
    </Wrapper>
  );
}

export default LoadingSpinner;
