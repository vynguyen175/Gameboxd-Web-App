import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Lock, CheckCircle } from 'lucide-react';
import { resetPassword } from '../services/api';

const Container = styled.div`
  max-width: 480px;
  margin: 80px auto;
  padding: 0 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;

  svg { width: 28px; height: 28px; color: white; }
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
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
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const Message = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 0.9rem;

  ${props => props.$type === 'success' && `
    background: rgba(34, 197, 94, 0.15);
    border: 2px solid rgba(34, 197, 94, 0.3);
    color: #4ADE80;
  `}

  ${props => props.$type === 'error' && `
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
  `}
`;

const SuccessCard = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const SuccessIcon = styled.div`
  margin-bottom: 16px;
  svg { width: 56px; height: 56px; color: #4ADE80; }
`;

const LoginLink = styled.button`
  background: transparent;
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 32px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid or missing reset token.' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to reset password. Token may have expired.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconCircle><Lock /></IconCircle>

        {success ? (
          <SuccessCard>
            <SuccessIcon><CheckCircle /></SuccessIcon>
            <Title>Password Reset!</Title>
            <Subtitle>Your password has been changed successfully. Redirecting to login...</Subtitle>
            <LoginLink onClick={() => navigate('/login')}>Go to Login</LoginLink>
          </SuccessCard>
        ) : (
          <>
            <Title>Reset Password</Title>
            <Subtitle>Enter your new password below.</Subtitle>

            {message && <Message $type={message.type}>{message.text}</Message>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </FormGroup>

              <SubmitBtn type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </SubmitBtn>
            </form>
          </>
        )}
      </Card>
    </Container>
  );
}

export default ResetPasswordPage;
