import React from 'react';
import styled from 'styled-components';

const ShimmerBase = styled.div`
  background: rgba(255, 255, 255, 0.03);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;

  body.light-mode & {
    background: rgba(0, 0, 0, 0.04);
    background-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04) 0%,
      rgba(0, 0, 0, 0.08) 50%,
      rgba(0, 0, 0, 0.04) 100%
    );
    background-size: 200% 100%;
  }
`;

const CardWrapper = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardImage = styled(ShimmerBase)`
  width: 100%;
  height: 180px;
  border-radius: 12px;
`;

const CardTextLine = styled(ShimmerBase)`
  height: 14px;
  width: ${props => props.$width || '100%'};
  border-radius: 6px;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const AvatarSmall = styled(ShimmerBase)`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const TextLine = styled(ShimmerBase)`
  height: ${props => props.$height || '14px'};
  width: ${props => props.$width || '100%'};
  border-radius: 6px;
`;

const AvatarCircle = styled(ShimmerBase)`
  width: ${props => props.$size || '48px'};
  height: ${props => props.$size || '48px'};
  border-radius: 50%;
`;

const BannerBlock = styled(ShimmerBase)`
  width: 100%;
  height: 200px;
  border-radius: 20px;
`;

const ListItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
`;

const ListItemTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

function SkeletonLoader({ type = 'card', width, height, size, count = 1 }) {
  const items = Array.from({ length: count });

  const renderSkeleton = (key) => {
    switch (type) {
      case 'card':
        return (
          <CardWrapper key={key}>
            <CardImage />
            <CardTextLine $width="85%" />
            <CardTextLine $width="60%" />
            <CardTextLine $width="40%" />
            <CardFooter>
              <AvatarSmall />
              <CardTextLine $width="100px" />
            </CardFooter>
          </CardWrapper>
        );

      case 'text':
        return <TextLine key={key} $width={width} $height={height} />;

      case 'avatar':
        return <AvatarCircle key={key} $size={size} />;

      case 'banner':
        return <BannerBlock key={key} />;

      case 'list-item':
        return (
          <ListItemWrapper key={key}>
            <AvatarCircle $size="44px" />
            <ListItemTextGroup>
              <TextLine $width="60%" $height="14px" />
              <TextLine $width="90%" $height="12px" />
            </ListItemTextGroup>
          </ListItemWrapper>
        );

      default:
        return <TextLine key={key} $width={width} $height={height} />;
    }
  };

  if (count === 1) {
    return renderSkeleton(0);
  }

  return <>{items.map((_, i) => renderSkeleton(i))}</>;
}

export default SkeletonLoader;
