import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Gamepad2, Settings, Shield, Sun, Moon, LogOut, ChevronDown, Search, Bell, Mail } from 'lucide-react';
import { getUnreadNotificationCount } from '../services/api';

const Nav = styled.nav`
  background: rgba(10, 10, 15, 0.65);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(168, 85, 247, 0.05);
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.6rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
  letter-spacing: 0.05em;

  svg {
    color: var(--neon-purple);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
    transform: scale(1.08);
    box-shadow: 0 0 16px var(--glow-purple);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NotifBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #EF4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--tag-bg);
  border: 2px solid var(--tag-border);
  border-radius: 12px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    background: var(--card-border);
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$hasImage
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  text-transform: uppercase;
`;

const Username = styled.span`
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
`;

const ChevronIcon = styled.div`
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  min-width: 220px;
  box-shadow: var(--shadow-depth-3);
  overflow: hidden;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)'};
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 200;
`;

const MenuHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--divider);
`;

const MenuUserName = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const MenuRole = styled.div`
  display: inline-block;
  background: ${props => props.$isAdmin
    ? 'linear-gradient(135deg, #FACC15, #F59E0B)'
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  color: ${props => props.$isAdmin ? '#000' : '#fff'};
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const MenuItems = styled.div`
  padding: 8px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tag-bg);
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--text-secondary);
  }
`;

const ThemeToggleItem = styled(MenuItem)`
  justify-content: space-between;
`;

const ToggleSwitch = styled.div`
  width: 44px;
  height: 24px;
  background: ${props => props.$isDark ? 'var(--neon-purple)' : 'var(--text-secondary)'};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$isDark ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const ThemeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 18px;
    height: 18px;
    color: var(--text-secondary);
  }
`;

const LogoutItem = styled(MenuItem)`
  color: #FCA5A5;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
  }

  svg {
    color: #FCA5A5;
  }

  &:hover svg {
    color: #EF4444;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--divider);
  margin: 4px 8px;
`;

const TabBar = styled.div`
  display: flex;
  border-top: 1px solid var(--divider);
  padding: 0 24px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled(NavLink)`
  padding: 10px 22px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 0.04em;
  white-space: nowrap;

  &:hover {
    color: var(--neon-purple);
    border-bottom-color: var(--tag-border);
  }

  &.active {
    color: var(--neon-purple);
    border-bottom-color: var(--neon-purple);
    box-shadow: 0 2px 8px var(--glow-purple);
  }
`;

function Navigation({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <Nav>
      <TopBar>
        <Logo onClick={() => navigate('/home')}>
          <Gamepad2 size={28} />
          GAMEBOXD
        </Logo>
        <RightSection ref={menuRef}>
          <IconButton onClick={() => navigate('/search')} title="Search">
            <Search />
          </IconButton>
          <IconButton onClick={() => navigate('/notifications')} title="Notifications">
            <Bell />
            {unreadCount > 0 && <NotifBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotifBadge>}
          </IconButton>
          <IconButton onClick={() => navigate('/messages')} title="Messages">
            <Mail />
          </IconButton>

          <UserMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <UserAvatar $hasImage={!!user.profilePicture} $image={user.profilePicture}>
              {!user.profilePicture && (user.username?.charAt(0) || 'U')}
            </UserAvatar>
            <Username>{user.username}</Username>
            <ChevronIcon $isOpen={isMenuOpen}>
              <ChevronDown />
            </ChevronIcon>
          </UserMenuButton>

          <DropdownMenu $isOpen={isMenuOpen}>
            <MenuHeader>
              <MenuUserName>{user.username}</MenuUserName>
              <MenuRole $isAdmin={user.role === 'admin'}>
                {user.role || 'user'}
              </MenuRole>
            </MenuHeader>
            <MenuItems>
              <MenuItem onClick={() => { setIsMenuOpen(false); navigate(`/profile/${user.username}`); }}>
                <Search />
                <span>My Profile</span>
              </MenuItem>
              <MenuItem onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}>
                <Settings />
                <span>Settings</span>
              </MenuItem>
              {user.role === 'admin' && (
                <MenuItem onClick={() => { setIsMenuOpen(false); navigate('/admin'); }}>
                  <Shield />
                  <span>Admin Panel</span>
                </MenuItem>
              )}
              <ThemeToggleItem onClick={handleThemeToggle}>
                <ThemeLabel>
                  {isDark ? <Moon /> : <Sun />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </ThemeLabel>
                <ToggleSwitch $isDark={isDark} />
              </ThemeToggleItem>
              <Divider />
              <LogoutItem onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </LogoutItem>
            </MenuItems>
          </DropdownMenu>
        </RightSection>
      </TopBar>
      <TabBar>
        <Tab to="/home">Home</Tab>
        <Tab to="/feed">Feed</Tab>
        <Tab to="/write-review">Review</Tab>
        <Tab to="/search">Search</Tab>
        <Tab to="/my-lists">My Lists</Tab>
        <Tab to="/backlog">Backlog</Tab>
      </TabBar>
    </Nav>
  );
}

export default Navigation;
