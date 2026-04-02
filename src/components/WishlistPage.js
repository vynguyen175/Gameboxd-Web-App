import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Bell, BellOff, DollarSign, Gamepad2, Trash2 } from 'lucide-react';
import { getWishlist, createPriceAlert, getPriceAlerts, deletePriceAlert } from '../services/api';

const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #F472B6, #A855F7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #F472B6;
    -webkit-text-fill-color: initial;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const GameCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    border-color: rgba(168, 85, 247, 0.5);
    box-shadow: 0 20px 60px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.1);
  }
`;

const CoverImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(244, 114, 182, 0.3))'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  }
`;

const PlaceholderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  svg { width: 48px; height: 48px; }
`;

const CardBody = styled.div`
  padding: 18px;
`;

const GameTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 12px;
  margin-bottom: 14px;
  color: var(--text-secondary);
  font-size: 0.85rem;

  svg {
    width: 16px;
    height: 16px;
    color: var(--neon-purple);
    flex-shrink: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #A855F7, #F472B6)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active
    ? 'transparent'
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};

  svg { width: 16px; height: 16px; }

  &:hover {
    transform: scale(1.03);
    ${props => !props.$active && `
      border-color: rgba(168, 85, 247, 0.4);
      color: var(--neon-purple);
    `}
  }
`;

const RemoveAlertButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #FCA5A5;
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 16px; height: 16px; }

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #EF4444;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 20px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  color: var(--text-tertiary);
  svg { width: 56px; height: 56px; }
`;

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const AlertModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const ModalSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--card-border);
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--neon-purple);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #A855F7, #F472B6);
    color: white;
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(168, 85, 247, 0.3); }
  ` : `
    background: var(--tag-bg);
    color: var(--text-secondary);
    border: 1px solid var(--tag-border);
    &:hover { color: var(--text-primary); }
  `}
`;

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px 24px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--neon-purple);
  text-shadow: 0 0 15px var(--glow-purple);
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
`;

function WishlistPage({ user }) {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [wishlistData, alertsData] = await Promise.all([
        getWishlist(user.username),
        getPriceAlerts(user.username),
      ]);
      setGames(wishlistData || []);
      setAlerts(alertsData || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const alertMap = {};
  alerts.forEach(a => { alertMap[a.igdbGameId] = a; });

  const handleSetAlert = (game) => {
    const existing = alertMap[game.igdbGameId];
    if (existing) {
      // Remove existing alert
      handleRemoveAlert(existing._id);
    } else {
      setAlertModal(game);
      setTargetPrice('');
    }
  };

  const handleCreateAlert = async () => {
    if (!alertModal || !targetPrice) return;
    try {
      const newAlert = await createPriceAlert({
        igdbGameId: alertModal.igdbGameId,
        gameTitle: alertModal.gameTitle,
        targetPrice: parseFloat(targetPrice),
      });
      setAlerts([newAlert, ...alerts]);
      setAlertModal(null);
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  const handleRemoveAlert = async (alertId) => {
    try {
      await deletePriceAlert(alertId);
      setAlerts(alerts.filter(a => a._id !== alertId));
    } catch (err) {
      console.error('Error removing alert:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <Title><Heart size={28} /> Wishlist</Title>
        </PageHeader>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px' }}>
          Loading wishlist...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title><Heart size={28} /> Wishlist</Title>
        <Subtitle>Games you want to play, with price tracking</Subtitle>
      </PageHeader>

      <StatsBar>
        <StatCard>
          <StatValue>{games.length}</StatValue>
          <StatLabel>Games</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{alerts.length}</StatValue>
          <StatLabel>Price Alerts</StatLabel>
        </StatCard>
      </StatsBar>

      {games.length === 0 ? (
        <EmptyState>
          <EmptyIcon><Heart /></EmptyIcon>
          <EmptyTitle>Your wishlist is empty</EmptyTitle>
          <p>Mark games as "Want to Play" to add them here.</p>
        </EmptyState>
      ) : (
        <GamesGrid>
          {games.map(game => {
            const hasAlert = !!alertMap[game.igdbGameId];
            return (
              <GameCard key={game._id}>
                <CoverImage
                  $image={game.coverUrl}
                  onClick={() => navigate(`/game/${game.igdbGameId}`)}
                >
                  {!game.coverUrl && (
                    <PlaceholderIcon><Gamepad2 /></PlaceholderIcon>
                  )}
                </CoverImage>
                <CardBody>
                  <GameTitle onClick={() => navigate(`/game/${game.igdbGameId}`)}>
                    {game.gameTitle}
                  </GameTitle>
                  <PriceSection>
                    <DollarSign />
                    <span>Price info coming soon</span>
                  </PriceSection>
                  <ButtonRow>
                    <AlertButton
                      $active={hasAlert}
                      onClick={() => handleSetAlert(game)}
                    >
                      {hasAlert ? <BellOff /> : <Bell />}
                      {hasAlert ? 'Alert Active' : 'Set Alert'}
                    </AlertButton>
                    {hasAlert && (
                      <RemoveAlertButton
                        onClick={() => handleRemoveAlert(alertMap[game.igdbGameId]._id)}
                        title="Remove alert"
                      >
                        <Trash2 />
                      </RemoveAlertButton>
                    )}
                  </ButtonRow>
                </CardBody>
              </GameCard>
            );
          })}
        </GamesGrid>
      )}

      {alertModal && (
        <AlertModal onClick={() => setAlertModal(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Set Price Alert</ModalTitle>
            <ModalSubtitle>
              Get notified when <strong>{alertModal.gameTitle}</strong> drops below your target price.
            </ModalSubtitle>
            <PriceInput
              type="number"
              placeholder="Target price (e.g., 29.99)"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              min="0"
              step="0.01"
              autoFocus
            />
            <ModalButtons>
              <ModalBtn onClick={() => setAlertModal(null)}>Cancel</ModalBtn>
              <ModalBtn $primary onClick={handleCreateAlert}>
                Create Alert
              </ModalBtn>
            </ModalButtons>
          </ModalContent>
        </AlertModal>
      )}
    </PageContainer>
  );
}

export default WishlistPage;
