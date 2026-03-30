import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Gamepad2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { login, register, googleLogin } from '../services/api';

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.4)); }
  50% { filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 80px rgba(0, 240, 255, 0.3)); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatIcon = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  75% { transform: translateY(-4px) rotate(-1deg); }
`;

// ─── Styled Components ──────────────────────────────────────────────────────

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoBg = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.5;
`;

const AnimatedGradientBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(
    -45deg,
    #0a0a0f,
    #1a0530,
    #0a1628,
    #0f0a1a,
    #001a1a,
    #1a0030
  );
  background-size: 400% 400%;
  animation: ${gradientMove} 15s ease infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(255, 16, 240, 0.08) 0%, transparent 40%);
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(circle at 30% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 30%),
      radial-gradient(circle at 70% 60%, rgba(0, 240, 255, 0.04) 0%, transparent 30%);
    animation: ${gradientMove} 20s ease-in-out infinite reverse;
  }
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(10, 5, 20, 0.6) 40%,
    rgba(10, 5, 20, 0.8) 100%
  );
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
  padding: 20px;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled.div`
  margin-bottom: 20px;
  color: var(--neon-purple);
  animation: ${floatIcon} 4s ease-in-out infinite, ${fadeUp} 0.8s ease-out both;

  svg {
    width: 72px;
    height: 72px;
    animation: ${glowPulse} 3s ease-in-out infinite;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: 0.12em;
  background: linear-gradient(135deg, #fff 0%, var(--neon-purple) 40%, var(--neon-cyan) 80%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${fadeUp} 0.8s ease-out 0.15s both, ${gradientMove} 5s ease infinite;
  line-height: 1.1;
  margin-bottom: 12px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  animation: ${fadeUp} 0.8s ease-out 0.3s both;
`;

const LoginCard = styled.div`
  width: 100%;
  background: rgba(12, 12, 18, 0.45);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
  padding: 40px 36px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(168, 85, 247, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: ${fadeUp} 0.8s ease-out 0.45s both;

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 28px;
  }
`;

const TabRow = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const ModeTab = styled.button`
  flex: 1;
  padding: 11px;
  border-radius: 13px;
  font-size: 0.9rem;
  font-weight: 700;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.45)'};
  border: none;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${props => props.$active ? '0 4px 20px rgba(168, 85, 247, 0.35)' : 'none'};
  transform: ${props => props.$active ? 'scale(1.02)' : 'scale(1)'};

  &:hover {
    transform: ${props => props.$active ? 'scale(1.02)' : 'scale(1.01)'};
    color: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.7)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15), 0 0 20px rgba(168, 85, 247, 0.1);
    transform: scale(1.01);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 14px;
  padding: 12px 16px;
  color: #FCA5A5;
  font-weight: 600;
  font-size: 0.88rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 14px;
  padding: 12px 16px;
  color: #86EFAC;
  font-weight: 600;
  font-size: 0.88rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--button-primary-start), var(--button-primary-end));
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 24px rgba(168, 85, 247, 0.35);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 4px;

  &:hover:not(:disabled) {
    box-shadow: 0 8px 40px rgba(168, 85, 247, 0.5);
    transform: translateY(-3px) scale(1.02);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 6px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  span {
    color: rgba(255, 255, 255, 0.25);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
`;

const GoogleButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  > div {
    width: 100% !important;
  }
`;

const FooterText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.75rem;
  margin-top: 24px;
  animation: ${fadeUp} 0.8s ease-out 0.6s both;
  letter-spacing: 0.05em;
`;

// ─── Video URL (free Pixabay gaming/neon video) ─────────────────────────────
const VIDEO_URL = 'https://cdn.pixabay.com/video/2020/11/03/54794-478008325_large.mp4';

// ─── Component ──────────────────────────────────────────────────────────────

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const userData = await googleLogin(credentialResponse.credential);
      onLogin(userData);
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        if (!dateOfBirth) {
          setError('Date of birth is required.');
          setLoading(false);
          return;
        }
        await register(username, password, email, fullName, dateOfBirth);
        setSuccess('Account created! You can now log in.');
        setMode('login');
        setPassword('');
        setEmail('');
        setFullName('');
        setDateOfBirth('');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      {/* Animated gradient background (always visible, acts as fallback) */}
      <AnimatedGradientBg />

      {/* Video background */}
      <VideoBg
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        style={{ opacity: videoLoaded ? 0.35 : 0 }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </VideoBg>

      {/* Dark gradient overlay for readability */}
      <VideoOverlay />

      {/* Content */}
      <ContentWrapper>
        <HeroSection>
          <IconWrapper><Gamepad2 /></IconWrapper>
          <HeroTitle>GAMEBOXD</HeroTitle>
          <HeroSubtitle>Your Gaming Social Platform</HeroSubtitle>
        </HeroSection>

        <LoginCard>
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
                <div>
                  <Input
                    type="date"
                    placeholder="Date of Birth"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    style={{ colorScheme: 'dark' }}
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

            <Divider><span>or</span></Divider>

            <GoogleButtonWrapper>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed. Please try again.')}
                theme="filled_black"
                size="large"
                shape="pill"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
                width="360"
                type="standard"
                logo_alignment="center"
              />
            </GoogleButtonWrapper>
          </Form>
        </LoginCard>

        <FooterText>Level up your gaming experience</FooterText>
      </ContentWrapper>
    </PageWrapper>
  );
}

export default Login;
