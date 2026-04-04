import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Gamepad2, Home, Search, Newspaper, Users, MessageSquare, Mail,
  PenSquare, List, Clock, Heart, Settings, Shield, Crown, LogOut,
  Sun, Moon, User, X, Menu
} from 'lucide-react';
import { getUnreadNotificationCount } from '../services/api';

/* ───────── Animations ───────── */

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const pulseBadge = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.18); }
`;

const bounceClick = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(0.85); }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ───────── Sidebar (Desktop) ───────── */

const COLLAPSED = 64;
const EXPANDED = 240;

const SidebarWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${p => (p.$expanded ? EXPANDED : COLLAPSED)}px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border-right: 1px solid var(--glass-border);
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.35), 0 0 60px rgba(168, 85, 247, 0.04);
  transition: width 0.35s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
  user-select: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 14px;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 56px;

  svg {
    min-width: 28px;
    color: var(--neon-purple);
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(-8deg) scale(1.1);
  }
`;

const LogoText = styled.span`
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  opacity: ${p => (p.$show ? 1 : 0)};
  transition: opacity 0.25s ease;
`;

const SectionLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--text-secondary);
  padding: 16px 20px 6px;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: ${p => (p.$show ? 0.55 : 0)};
  transition: opacity 0.2s ease;
`;

const NavItems = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 8px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.25); border-radius: 4px; }
`;

const navItemStagger = css`
  animation: ${slideIn} 0.35s ease both;
  animation-delay: ${p => (p.$i || 0) * 0.03}s;
`;

const NavItemLink = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  ${navItemStagger}

  svg {
    min-width: 20px;
    width: 20px;
    height: 20px;
    transition: color 0.2s ease;
  }

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: var(--text-primary);
    transform: scale(1.02);
  }

  &:active svg {
    animation: ${bounceClick} 0.35s ease;
  }

  &.active {
    background: rgba(168, 85, 247, 0.15);
    color: var(--neon-purple);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--neon-purple);
      box-shadow: 0 0 10px var(--neon-purple), 0 0 24px rgba(168, 85, 247, 0.3);
    }

    svg { color: var(--neon-purple); }
  }
`;

const NavItemButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  ${navItemStagger}

  svg {
    min-width: 20px;
    width: 20px;
    height: 20px;
    transition: color 0.2s ease;
  }

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: var(--text-primary);
    transform: scale(1.02);
  }

  &:active svg {
    animation: ${bounceClick} 0.35s ease;
  }
`;

const LogoutButton = styled(NavItemButton)`
  color: #FCA5A5;
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
  }
  &:hover svg { color: #EF4444; }
`;

const Badge = styled.span`
  position: absolute;
  top: 4px;
  left: 26px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #EF4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: ${pulseBadge} 2s ease-in-out infinite;
`;

const LabelSpan = styled.span`
  opacity: ${p => (p.$show ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

/* bottom section inside sidebar */
const BottomSection = styled.div`
  flex-shrink: 0;
  border-top: 1px solid var(--divider);
  padding: 8px;
`;

const UserInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover { background: rgba(168, 85, 247, 0.1); }
`;

const UserAvatar = styled.div`
  min-width: 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${p => p.$hasImage
    ? `url(${p.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: white;
  text-transform: uppercase;
`;

const UserName = styled.span`
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${p => (p.$show ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const ThemeToggleBtn = styled(NavItemButton)`
  svg { color: var(--text-secondary); }
`;

/* ───────── Mobile Bottom Tab Bar ───────── */

const MobileBar = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 200;
    background: var(--glass-bg);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border-top: 1px solid var(--glass-border);
    padding: 6px 0 env(safe-area-inset-bottom, 6px);
    justify-content: space-around;
    animation: ${fadeUp} 0.3s ease;
  }
`;

const MobileTab = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.62rem;
  font-weight: 700;
  transition: color 0.2s ease;
  position: relative;

  svg { width: 22px; height: 22px; }

  &.active {
    color: var(--neon-purple);
  }
`;

const MobileBadge = styled.span`
  position: absolute;
  top: 0;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #EF4444;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulseBadge} 2s ease-in-out infinite;
`;

/* Mobile full nav drawer */
const DrawerOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${p => (p.$open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }
`;

const DrawerPanel = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 301;
    max-height: 85vh;
    background: var(--glass-bg);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border-top: 1px solid var(--glass-border);
    border-radius: 20px 20px 0 0;
    overflow-y: auto;
    padding: 12px 16px 24px;
    transform: translateY(${p => (p.$open ? '0' : '100%')});
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const DrawerHandle = styled.div`
  width: 40px;
  height: 4px;
  background: var(--text-secondary);
  border-radius: 2px;
  margin: 0 auto 12px;
  opacity: 0.4;
`;

const DrawerNavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition: background 0.2s, color 0.2s;

  svg { width: 20px; height: 20px; }

  &:hover, &.active {
    background: rgba(168, 85, 247, 0.15);
    color: var(--neon-purple);
  }
`;

const DrawerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  svg { width: 20px; height: 20px; }

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: var(--text-primary);
  }
`;

const DrawerLogout = styled(DrawerButton)`
  color: #FCA5A5;
  &:hover { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
`;

const DrawerSectionLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
  opacity: 0.5;
  padding: 14px 14px 4px;
`;

const DrawerCloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-bottom: 4px;
`;

/* ───────── Component ───────── */

function Navigation({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Poll unread notification count every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count || 0);
      } catch {
        // silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = useCallback(() => {
    setDrawerOpen(false);
    onLogout();
  }, [onLogout]);

  const isAdmin = user.role === 'admin';
  const showLabel = expanded;

  /* Helper to render sidebar nav items */
  const renderItem = (to, Icon, label, idx, badge) => (
    <NavItemLink to={to} $i={idx} key={to}>
      <Icon />
      {badge > 0 && <Badge>{badge > 99 ? '99+' : badge}</Badge>}
      <LabelSpan $show={showLabel}>{label}</LabelSpan>
    </NavItemLink>
  );

  return (
    <>
      {/* ──── Desktop sidebar ──── */}
      <SidebarWrapper
        ref={sidebarRef}
        $expanded={expanded}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <LogoArea onClick={() => navigate('/home')}>
          <Gamepad2 size={28} />
          <LogoText $show={showLabel}>GAMEBOXD</LogoText>
        </LogoArea>

        <NavItems>
          <SectionLabel $show={showLabel}>Discover</SectionLabel>
          {renderItem('/home', Home, 'Home', 0)}
          {renderItem('/search', Search, 'Search', 1)}
          {renderItem('/news', Newspaper, 'News', 2)}

          <SectionLabel $show={showLabel}>Social</SectionLabel>
          {renderItem('/feed', Users, 'Feed', 3)}
          {renderItem('/chat', MessageSquare, 'Chat', 4)}
          {renderItem('/messages', Mail, 'Messages', 5)}
          {renderItem('/notifications', () => <Mail />, 'Notifications', 6, unreadCount)}

          <SectionLabel $show={showLabel}>My Stuff</SectionLabel>
          {renderItem('/write-review', PenSquare, 'Review', 7)}
          {renderItem('/my-lists', List, 'My Lists', 8)}
          {renderItem('/backlog', Clock, 'Backlog', 9)}
          {renderItem('/wishlist', Heart, 'Wishlist', 10)}
        </NavItems>

        <BottomSection>
          {renderItem('/settings', Settings, 'Settings', 11)}
          {isAdmin && renderItem('/admin', Shield, 'Admin', 12)}
          {renderItem('/premium', Crown, 'Premium', 13)}

          <ThemeToggleBtn onClick={toggleTheme} $i={14}>
            {isDark ? <Moon /> : <Sun />}
            <LabelSpan $show={showLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</LabelSpan>
          </ThemeToggleBtn>

          <UserInfoRow onClick={() => navigate(`/profile/${user.username}`)}>
            <UserAvatar $hasImage={!!user.profilePicture} $image={user.profilePicture}>
              {!user.profilePicture && (user.username?.charAt(0) || 'U')}
            </UserAvatar>
            <UserName $show={showLabel}>{user.username}</UserName>
          </UserInfoRow>

          <LogoutButton onClick={handleLogout} $i={15}>
            <LogOut />
            <LabelSpan $show={showLabel}>Logout</LabelSpan>
          </LogoutButton>
        </BottomSection>
      </SidebarWrapper>

      {/* ──── Mobile bottom tab bar ──── */}
      <MobileBar>
        <MobileTab to="/home"><Home /><span>Home</span></MobileTab>
        <MobileTab to="/search"><Search /><span>Search</span></MobileTab>
        <MobileTab to="/feed"><Users /><span>Feed</span></MobileTab>
        <MobileTab to="/chat">
          <MessageSquare />
          {unreadCount > 0 && <MobileBadge>{unreadCount > 99 ? '99+' : unreadCount}</MobileBadge>}
          <span>Chat</span>
        </MobileTab>
        <MobileTab as="button" onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu />
          <span>More</span>
        </MobileTab>
      </MobileBar>

      {/* ──── Mobile full nav drawer ──── */}
      <DrawerOverlay $open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <DrawerPanel $open={drawerOpen}>
        <DrawerHandle />
        <DrawerCloseRow>
          <DrawerButton onClick={() => setDrawerOpen(false)} style={{ width: 'auto', padding: '6px' }}>
            <X />
          </DrawerButton>
        </DrawerCloseRow>

        <DrawerSectionLabel>Discover</DrawerSectionLabel>
        <DrawerNavItem to="/home"><Home />Home</DrawerNavItem>
        <DrawerNavItem to="/search"><Search />Search</DrawerNavItem>
        <DrawerNavItem to="/news"><Newspaper />News</DrawerNavItem>

        <DrawerSectionLabel>Social</DrawerSectionLabel>
        <DrawerNavItem to="/feed"><Users />Feed</DrawerNavItem>
        <DrawerNavItem to="/chat"><MessageSquare />Chat</DrawerNavItem>
        <DrawerNavItem to="/messages"><Mail />Messages</DrawerNavItem>
        <DrawerNavItem to="/notifications">
          <Mail />Notifications
        </DrawerNavItem>

        <DrawerSectionLabel>My Stuff</DrawerSectionLabel>
        <DrawerNavItem to="/write-review"><PenSquare />Review</DrawerNavItem>
        <DrawerNavItem to="/my-lists"><List />My Lists</DrawerNavItem>
        <DrawerNavItem to="/backlog"><Clock />Backlog</DrawerNavItem>
        <DrawerNavItem to="/wishlist"><Heart />Wishlist</DrawerNavItem>

        <DrawerSectionLabel>Account</DrawerSectionLabel>
        <DrawerNavItem to={`/profile/${user.username}`}><User />My Profile</DrawerNavItem>
        <DrawerNavItem to="/settings"><Settings />Settings</DrawerNavItem>
        {isAdmin && <DrawerNavItem to="/admin"><Shield />Admin</DrawerNavItem>}
        <DrawerNavItem to="/premium"><Crown />Premium</DrawerNavItem>
        <DrawerButton onClick={toggleTheme}>
          {isDark ? <Moon /> : <Sun />}
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </DrawerButton>
        <DrawerLogout onClick={handleLogout}>
          <LogOut />Logout
        </DrawerLogout>
      </DrawerPanel>
    </>
  );
}

export default Navigation;
