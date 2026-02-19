import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Gamepad2, Settings, Shield, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';

const Nav = styled.nav`
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid var(--nav-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  min-width: 220px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
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
`;

const Tab = styled(NavLink)`
  padding: 10px 22px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  letter-spacing: 0.04em;

  &:hover {
    color: var(--neon-purple);
    border-bottom-color: var(--tag-border);
  }

  &.active {
    color: var(--neon-purple);
    border-bottom-color: var(--neon-purple);
  }
`;

function Navigation({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <Tab to="/review">Review</Tab>
      </TabBar>
    </Nav>
  );
}

export default Navigation;
