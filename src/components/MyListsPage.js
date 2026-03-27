import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, List, Gamepad2, Lock, Unlock } from 'lucide-react';
import { getUserLists, createList } from '../services/api';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CreateBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 18px; height: 18px; }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }
`;

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const ListCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--neon-purple);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const ListPreview = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  height: 120px;
  overflow: hidden;
`;

const PreviewThumb = styled.div`
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 240, 255, 0.2))'};
`;

const ListInfo = styled.div`
  padding: 18px;
`;

const ListName = styled.div`
  font-weight: 800;
  color: var(--text-primary);
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

const ListMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;

  svg { width: 14px; height: 14px; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  color: var(--text-tertiary);
  svg { width: 48px; height: 48px; }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--neon-purple);
  font-size: 1.1rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
`;

const ModalTitle = styled.h3`
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
  min-height: 80px;
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

  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

function MyListsPage({ user }) {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await getUserLists(user.username);
        setLists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [user.username]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const newList = await createList(form);
      setLists(prev => [newList, ...prev]);
      setShowCreate(false);
      setForm({ title: '', description: '', isPublic: true });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Container><LoadingState>Loading lists...</LoadingState></Container>;

  return (
    <Container>
      <Header>
        <Title>My Lists</Title>
        <CreateBtn onClick={() => setShowCreate(true)}>
          <Plus /> New List
        </CreateBtn>
      </Header>

      {lists.length === 0 ? (
        <EmptyState>
          <EmptyIcon><List /></EmptyIcon>
          <p>You haven't created any lists yet.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Create lists to organize your favorite games!</p>
        </EmptyState>
      ) : (
        <ListsGrid>
          {lists.map(list => (
            <ListCard key={list._id} onClick={() => navigate(`/lists/${list._id}`)}>
              <ListPreview>
                {(list.games || []).slice(0, 3).map((game, i) => (
                  <PreviewThumb key={i} $image={game.coverUrl} />
                ))}
                {Array.from({ length: Math.max(0, 3 - (list.games || []).length) }).map((_, i) => (
                  <PreviewThumb key={`empty-${i}`} />
                ))}
              </ListPreview>
              <ListInfo>
                <ListName>{list.title}</ListName>
                <ListMeta>
                  <span><Gamepad2 /> {(list.games || []).length} games</span>
                  {list.isPublic !== false ? <><Unlock /> Public</> : <><Lock /> Private</>}
                </ListMeta>
              </ListInfo>
            </ListCard>
          ))}
        </ListsGrid>
      )}

      {showCreate && (
        <Modal onClick={() => setShowCreate(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Create New List</ModalTitle>
            <FormGroup>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My awesome list"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's this list about?"
              />
            </FormGroup>
            <ModalButtons>
              <ModalBtn onClick={() => setShowCreate(false)}>Cancel</ModalBtn>
              <ModalBtn $primary onClick={handleCreate} disabled={creating || !form.title.trim()}>
                {creating ? 'Creating...' : 'Create List'}
              </ModalBtn>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default MyListsPage;
