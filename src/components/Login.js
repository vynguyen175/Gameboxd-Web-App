import React, { useState } from 'react';
import styled from 'styled-components';
import { Gamepad2 } from 'lucide-react';
import { login, register } from '../services/api';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 0 40px var(--glow-purple), 0 16px 48px rgba(0, 0, 0, 0.4);
  animation: slideInUp 0.5s ease-out;
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const IconWrapper = styled.div`
  text-align: center;
  margin-bottom: 16px;
  animation: pulse 3s infinite;
  color: var(--neon-purple);

  svg {
    width: 64px;
    height: 64px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 32px;
`;

const TabRow = styled.div`
  display: flex;
  background: var(--section-bg);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid var(--divider);
`;

const ModeTab = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  border: none;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 0 16px var(--glow-purple)' : 'none'};

  &:hover {
    transform: none;
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.12);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  color: #FCA5A5;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.12);
  border: 2px solid rgba(34, 197, 94, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  color: #86EFAC;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end));
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  box-shadow: 0 0 24px var(--glow-purple);
  transition: all 0.3s ease;
  margin-top: 4px;

  &:hover:not(:disabled) {
    box-shadow: 0 0 36px var(--glow-purple);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const userData = await login(username, password);
        onLogin(userData);
      } else {
        await register(username, password, email, fullName);
        setSuccess('Account created! You can now log in.');
        setMode('login');
        setPassword('');
        setEmail('');
        setFullName('');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <IconWrapper><Gamepad2 /></IconWrapper>
        <Title>GAMEBOXD</Title>
        <Subtitle>Your Gaming Social Platform</Subtitle>

        <TabRow>
          <ModeTab $active={mode === 'login'} onClick={() => switchMode('login')} type="button">
            Login
          </ModeTab>
          <ModeTab $active={mode === 'register'} onClick={() => switchMode('register')} type="button">
            Register
          </ModeTab>
        </TabRow>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </>
          )}

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'ENTER GAMEBOXD'
              : 'CREATE ACCOUNT'}
          </Button>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
}

export default Login;
