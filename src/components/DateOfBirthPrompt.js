import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar } from 'lucide-react';
import { updateUserProfile } from '../services/api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Card = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-depth-3), 0 0 60px var(--glow-purple);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
`;

const IconWrap = styled.div`
  margin-bottom: 16px;
  color: var(--neon-purple);
  animation: float 3s ease-in-out infinite;

  svg {
    width: 48px;
    height: 48px;
    filter: drop-shadow(0 0 16px var(--glow-purple));
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: rgba(10, 10, 15, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 16px;
  color-scheme: dark;

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end));
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  box-shadow: 0 0 24px var(--glow-purple);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover:not(:disabled) {
    box-shadow: 0 0 36px var(--glow-purple);
    transform: translateY(-2px) scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  padding: 10px 14px;
  color: #FCA5A5;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 16px;
`;

function DateOfBirthPrompt({ user, onComplete }) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updated = await updateUserProfile({ username: user.username, dateOfBirth });
      onComplete(updated || user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <Card>
        <IconWrap><Calendar /></IconWrap>
        <Title>One More Step</Title>
        <Subtitle>
          We need your date of birth to ensure age-appropriate content.
          This is required for all users.
        </Subtitle>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Input
            type="date"
            value={dateOfBirth}
            onChange={e => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'CONTINUE'}
          </Button>
        </form>
      </Card>
    </Overlay>
  );
}

export default DateOfBirthPrompt;
