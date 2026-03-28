import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Trash2, Edit3, Lock, Unlock, Gamepad2 } from 'lucide-react';
import { getList, updateList, removeGameFromList, deleteList } from '../services/api';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
  svg { width: 18px; height: 18px; }
  &:hover { color: var(--neon-purple); }
`;

const ListHeader = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ListTitle = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
`;

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid var(--card-border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 18px; height: 18px; }

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }

  ${props => props.$danger && `
    &:hover {
      border-color: #EF4444;
      color: #EF4444;
      background: rgba(239, 68, 68, 0.1);
    }
  `}
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 12px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  font-weight: 600;

  svg { width: 16px; height: 16px; }
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const GameCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--neon-purple);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const GameCover = styled.div`
  width: 100%;
  height: 260px;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 40px; height: 40px; color: white; opacity: 0.5; }
`;

const GameCardInfo = styled.div`
  padding: 14px;
`;

const GameName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #FCA5A5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  svg { width: 16px; height: 16px; }

  ${GameCard}:hover & { opacity: 1; }

  &:hover {
    background: #EF4444;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--neon-purple);
  font-size: 1.1rem;
`;

const EditModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const EditCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
`;

const EditTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 1rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--neon-purple); }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--neon-purple); }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
    border: none;
    color: white;
    &:hover { transform: translateY(-2px); }
  ` : `
    background: transparent;
    border: 2px solid var(--card-border);
    color: var(--text-secondary);
    &:hover { border-color: var(--text-primary); color: var(--text-primary); }
  `}
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.15)'};
  border: 2px solid ${props => props.$active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.3)'};
  border-radius: 8px;
  padding: 8px 16px;
  color: ${props => props.$active ? '#4ADE80' : '#FCA5A5'};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 16px; height: 16px; }
`;

function GameListPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', isPublic: true });

  const isOwner = list && user && list.username === user.username;

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const data = await getList(id);
        setList(data && typeof data === 'object' ? data : null);
        if (data) setEditForm({ title: data.title, description: data.description || '', isPublic: data.isPublic !== false });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [id]);

  const handleRemoveGame = async (igdbGameId) => {
    try {
      await removeGameFromList(id, igdbGameId);
      setList(prev => ({
        ...prev,
        games: prev.games.filter(g => g.igdbGameId !== igdbGameId),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await updateList(id, editForm);
      setList(prev => ({ ...prev, ...updated }));
      setShowEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await deleteList(id);
      navigate('/my-lists');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Container><LoadingState>Loading list...</LoadingState></Container>;
  if (!list) return <Container><BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton><EmptyState>List not found</EmptyState></Container>;

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}><ArrowLeft /> Go Back</BackButton>

      <ListHeader>
        <HeaderTop>
          <ListTitle>{list.title}</ListTitle>
          {isOwner && (
            <HeaderActions>
              <IconBtn onClick={() => setShowEdit(true)}><Edit3 /></IconBtn>
              <IconBtn $danger onClick={handleDeleteList}><Trash2 /></IconBtn>
            </HeaderActions>
          )}
        </HeaderTop>
        {list.description && <Description>{list.description}</Description>}
        <MetaRow>
          {list.isPublic !== false ? <><Unlock /> Public</> : <><Lock /> Private</>}
          <span>{(list.games || []).length} game{(list.games || []).length !== 1 ? 's' : ''}</span>
          <span>by {list.username}</span>
        </MetaRow>
      </ListHeader>

      {(list.games || []).length === 0 ? (
        <EmptyState>This list has no games yet.</EmptyState>
      ) : (
        <GamesGrid>
          {list.games.map(game => (
            <GameCard key={game.igdbGameId} onClick={() => navigate(`/game/${game.igdbGameId}`)}>
              <GameCover $image={game.coverUrl}>
                {!game.coverUrl && <Gamepad2 />}
              </GameCover>
              <GameCardInfo>
                <GameName>{game.gameTitle || game.title}</GameName>
              </GameCardInfo>
              {isOwner && (
                <RemoveBtn onClick={e => { e.stopPropagation(); handleRemoveGame(game.igdbGameId); }}>
                  <Trash2 />
                </RemoveBtn>
              )}
            </GameCard>
          ))}
        </GamesGrid>
      )}

      {showEdit && (
        <EditModal onClick={() => setShowEdit(false)}>
          <EditCard onClick={e => e.stopPropagation()}>
            <EditTitle>Edit List</EditTitle>
            <FormGroup>
              <Label>Title</Label>
              <Input value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <ToggleRow>
                <Label style={{ marginBottom: 0 }}>Visibility</Label>
                <ToggleBtn $active={editForm.isPublic} onClick={() => setEditForm(prev => ({ ...prev, isPublic: !prev.isPublic }))}>
                  {editForm.isPublic ? <><Unlock /> Public</> : <><Lock /> Private</>}
                </ToggleBtn>
              </ToggleRow>
            </FormGroup>
            <ModalButtons>
              <ModalBtn onClick={() => setShowEdit(false)}>Cancel</ModalBtn>
              <ModalBtn $primary onClick={handleSaveEdit}>Save</ModalBtn>
            </ModalButtons>
          </EditCard>
        </EditModal>
      )}
    </Container>
  );
}

export default GameListPage;
