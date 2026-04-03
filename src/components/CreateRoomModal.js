import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus } from 'lucide-react';
import { createChatRoom } from '../services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  max-width: 480px;
  width: 100%;
  padding: 32px;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: var(--shadow-depth-3), 0 0 60px var(--glow-purple);

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    border-color: var(--neon-purple);
  }
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  width: 100%;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }

  &::placeholder { color: var(--text-secondary); }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }

  &::placeholder { color: var(--text-secondary); }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
`;

const ToggleLabel = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const ToggleSwitch = styled.button`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${props => props.$active ? 'var(--neon-purple)' : 'var(--card-border)'};
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '24px' : '3px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #EF4444;
  font-size: 0.85rem;
  margin-top: 8px;
`;

function CreateRoomModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const room = await createChatRoom({
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || undefined,
        isPublic,
      });
      onCreated(room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Create Chat Room</Title>
          <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
        </Header>

        <form onSubmit={handleCreate}>
          <Field>
            <Label>Room Name</Label>
            <Input
              type="text"
              placeholder="e.g. RPG Fans Lounge"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </Field>

          <Field>
            <Label>Description</Label>
            <TextArea
              placeholder="What's this room about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field>
            <Label>Icon (emoji)</Label>
            <Input
              type="text"
              placeholder="e.g. gaming controller emoji"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              maxLength={4}
              style={{ width: '80px' }}
            />
          </Field>

          <Field>
            <ToggleRow>
              <ToggleLabel>{isPublic ? 'Public' : 'Private'}</ToggleLabel>
              <ToggleSwitch
                type="button"
                $active={isPublic}
                onClick={() => setIsPublic(!isPublic)}
              />
            </ToggleRow>
          </Field>

          {error && <ErrorText>{error}</ErrorText>}

          <CreateButton type="submit" disabled={creating || !name.trim()}>
            <Plus size={18} />
            {creating ? 'Creating...' : 'Create Room'}
          </CreateButton>
        </form>
      </Modal>
    </Overlay>
  );
}

export default CreateRoomModal;
