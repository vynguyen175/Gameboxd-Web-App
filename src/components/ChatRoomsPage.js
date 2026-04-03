import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Hash, Send, Plus, Users, ArrowLeft, UserPlus, LogOut as LeaveIcon } from 'lucide-react';
import {
  getChatRooms, getChatRoom, joinChatRoom, leaveChatRoom,
  getChatMessages, getChatRoomMembers, markChatRoomRead, getChatUnreadCounts
} from '../services/api';
import { getSocket } from '../services/socket';
import CreateRoomModal from './CreateRoomModal';

/* ─── Animations ────────────────────────────────────────────────────────── */

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`;

/* ─── Layout ────────────────────────────────────────────────────────────── */

const PageWrapper = styled.div`
  display: flex;
  height: calc(100vh - 110px);
  overflow: hidden;

  @media (max-width: 768px) {
    height: calc(100vh - 100px);
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur, 20px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 20px));
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.$visible ? 'flex' : 'none'};
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--deep-space);

  @media (max-width: 768px) {
    display: ${props => props.$visible ? 'flex' : 'none'};
  }
`;

const MemberPanel = styled.div`
  width: 220px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur, 20px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 20px));
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;

  @media (max-width: 1024px) {
    display: none;
  }
`;

/* ─── Sidebar Components ────────────────────────────────────────────────── */

const SidebarHeader = styled.div`
  padding: 18px 16px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CreateBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
    box-shadow: 0 0 12px var(--glow-purple);
  }
`;

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${props => props.$active ? 'rgba(168, 85, 247, 0.15)' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? 'var(--neon-purple)' : 'transparent'};

  &:hover {
    background: rgba(168, 85, 247, 0.1);
  }
`;

const RoomIcon = styled.span`
  font-size: 1.3rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--section-bg);
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoomPreview = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const UnreadBadge = styled.span`
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  background: var(--neon-purple);
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  flex-shrink: 0;
`;

/* ─── Chat Area Components ──────────────────────────────────────────────── */

const ChatHeader = styled.div`
  padding: 14px 20px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur, 20px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 20px));
`;

const BackButton = styled.button`
  display: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const ChatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
`;

const ChatDescription = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 400;
  margin-left: 4px;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 12px;
  padding: 4px 0;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }
`;

const MsgAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: white;
  text-transform: uppercase;
  flex-shrink: 0;
  margin-top: 2px;
`;

const MsgContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MsgHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
`;

const MsgUsername = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--neon-purple);
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

const MsgTime = styled.span`
  font-size: 0.7rem;
  color: var(--text-tertiary);
`;

const MsgText = styled.div`
  color: var(--text-primary);
  font-size: 0.93rem;
  line-height: 1.45;
  word-break: break-word;
`;

const TypingIndicator = styled.div`
  padding: 4px 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  min-height: 24px;

  span {
    animation: ${dotPulse} 1.4s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

const InputArea = styled.form`
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur, 20px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 20px));
`;

const MessageInput = styled.input`
  flex: 1;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px var(--glow-purple);
  }

  &::placeholder { color: var(--text-secondary); }
`;

const SendBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg { width: 18px; height: 18px; }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ─── Member Panel Components ───────────────────────────────────────────── */

const MemberHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: rgba(255,255,255,0.03); }
`;

const MemberAvatar = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.7rem;
  color: white;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const OnlineDot = styled.span`
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22C55E;
  border: 2px solid var(--glass-bg);
`;

const MemberName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ─── Empty / Placeholder States ────────────────────────────────────────── */

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 16px;
  padding: 40px;
  text-align: center;

  svg { width: 48px; height: 48px; color: var(--text-tertiary); }
  p { font-size: 0.95rem; max-width: 300px; }
`;

const InviteArea = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--glass-border);
`;

const InviteForm = styled.form`
  display: flex;
  gap: 6px;
`;

const InviteInput = styled.input`
  flex: 1;
  background: var(--deep-space);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  &::placeholder { color: var(--text-secondary); }
`;

const InviteBtn = styled.button`
  background: var(--neon-purple);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:disabled { opacity: 0.5; }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--neon-purple);
    color: var(--neon-purple);
  }
`;

/* ─── Component ─────────────────────────────────────────────────────────── */

function ChatRoomsPage({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [mobileView, setMobileView] = useState('sidebar'); // sidebar | chat
  const [inviteUsername, setInviteUsername] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const activeRoomRef = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getChatRooms();
        setRooms(data || []);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getChatUnreadCounts();
        const counts = {};
        if (Array.isArray(data)) {
          data.forEach(item => { counts[item.roomId || item._id] = item.count; });
        } else if (data && typeof data === 'object') {
          Object.assign(counts, data);
        }
        setUnreadCounts(counts);
      } catch (err) {
        // silently fail
      }
    };
    fetchUnread();
  }, []);

  // Handle room from URL
  useEffect(() => {
    if (roomId && rooms.length > 0) {
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        selectRoom(room);
      } else {
        // Room not in list, try to fetch it
        const fetchRoom = async () => {
          try {
            const roomData = await getChatRoom(roomId);
            if (roomData) {
              setRooms(prev => [roomData, ...prev.filter(r => r._id !== roomData._id)]);
              selectRoom(roomData);
            }
          } catch (err) {
            console.error('Room not found:', err);
          }
        };
        fetchRoom();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, rooms.length]);

  // Socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const currentRoom = activeRoomRef.current;
      if (msg.roomId === currentRoom?._id) {
        setMessages(prev => [...prev, msg]);
      } else {
        // Increment unread for other rooms
        setUnreadCounts(prev => ({
          ...prev,
          [msg.roomId]: (prev[msg.roomId] || 0) + 1,
        }));
      }
      // Update room preview
      setRooms(prev => prev.map(r =>
        r._id === msg.roomId ? { ...r, lastMessage: msg } : r
      ));
    };

    const handleTyping = ({ username: typingUser, roomId: typingRoomId }) => {
      const currentRoom = activeRoomRef.current;
      if (typingRoomId === currentRoom?._id && typingUser !== user.username) {
        setTypingUsers(prev => {
          if (prev.includes(typingUser)) return prev;
          return [...prev, typingUser];
        });
        // Auto-remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== typingUser));
        }, 3000);
      }
    };

    const handleStopTyping = ({ username: typingUser, roomId: typingRoomId }) => {
      const currentRoom = activeRoomRef.current;
      if (typingRoomId === currentRoom?._id) {
        setTypingUsers(prev => prev.filter(u => u !== typingUser));
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleUserJoined = ({ username: joinedUser, roomId: joinedRoomId }) => {
      const currentRoom = activeRoomRef.current;
      if (joinedRoomId === currentRoom?._id) {
        // Refresh members
        fetchMembers(joinedRoomId);
      }
    };

    const handleUserLeft = ({ username: leftUser, roomId: leftRoomId }) => {
      const currentRoom = activeRoomRef.current;
      if (leftRoomId === currentRoom?._id) {
        setMembers(prev => prev.filter(m => (m.username || m) !== leftUser));
      }
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stopTyping', handleStopTyping);
    socket.on('chat:onlineUsers', handleOnlineUsers);
    socket.on('chat:userJoined', handleUserJoined);
    socket.on('chat:userLeft', handleUserLeft);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stopTyping', handleStopTyping);
      socket.off('chat:onlineUsers', handleOnlineUsers);
      socket.off('chat:userJoined', handleUserJoined);
      socket.off('chat:userLeft', handleUserLeft);
    };
  }, [user.username]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMembers = async (id) => {
    try {
      const data = await getChatRoomMembers(id);
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const selectRoom = useCallback(async (room) => {
    const socket = getSocket();

    // Leave previous room socket
    if (activeRoomRef.current && socket) {
      socket.emit('chat:leaveRoom', activeRoomRef.current._id);
    }

    setActiveRoom(room);
    setMessages([]);
    setTypingUsers([]);
    setMobileView('chat');
    setLoadingMessages(true);

    // Update URL
    navigate(`/chat/${room._id}`, { replace: true });

    // Join room via REST + socket
    try {
      await joinChatRoom(room._id);
    } catch (err) {
      // might already be a member
    }

    if (socket) {
      socket.emit('chat:joinRoom', room._id);
    }

    // Fetch messages
    try {
      const data = await getChatMessages(room._id);
      const msgs = data.messages || data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }

    // Fetch members
    fetchMembers(room._id);

    // Mark as read
    try {
      await markChatRoomRead(room._id);
      setUnreadCounts(prev => ({ ...prev, [room._id]: 0 }));
    } catch (err) {
      // silently fail
    }
  }, [navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    const socket = getSocket();
    const text = newMessage.trim();
    setNewMessage('');

    if (socket) {
      socket.emit('chat:sendMessage', {
        roomId: activeRoom._id,
        text,
      });
      socket.emit('chat:stopTyping', { roomId: activeRoom._id });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!socket || !activeRoom) return;

    socket.emit('chat:typing', { roomId: activeRoom._id });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('chat:stopTyping', { roomId: activeRoom._id });
    }, 2000);
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    const socket = getSocket();
    try {
      await leaveChatRoom(activeRoom._id);
      if (socket) socket.emit('chat:leaveRoom', activeRoom._id);
      setRooms(prev => prev.filter(r => r._id !== activeRoom._id));
      setActiveRoom(null);
      setMobileView('sidebar');
      navigate('/chat', { replace: true });
    } catch (err) {
      console.error('Failed to leave room:', err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !activeRoom) return;
    const { inviteToChatRoom } = await import('../services/api');
    try {
      await inviteToChatRoom(activeRoom._id, inviteUsername.trim());
      setInviteUsername('');
    } catch (err) {
      console.error('Failed to invite:', err);
    }
  };

  const handleRoomCreated = (room) => {
    setRooms(prev => [room, ...prev]);
    selectRoom(room);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' }) + ' ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group consecutive messages by same user within 5 min
  const groupedMessages = messages.reduce((groups, msg, i) => {
    const prev = messages[i - 1];
    const sameUser = prev && (prev.username || prev.sender) === (msg.username || msg.sender);
    const closeTime = prev && (new Date(msg.createdAt || msg.timestamp) - new Date(prev.createdAt || prev.timestamp)) < 300000;
    if (sameUser && closeTime) {
      groups[groups.length - 1].push(msg);
    } else {
      groups.push([msg]);
    }
    return groups;
  }, []);

  const isOnline = (username) => onlineUsers.includes(username);

  return (
    <PageWrapper>
      {/* ─── Sidebar ─── */}
      <Sidebar $visible={mobileView === 'sidebar'}>
        <SidebarHeader>
          <SidebarTitle>Chat Rooms</SidebarTitle>
          <div style={{ display: 'flex', gap: 6 }}>
            <CreateBtn onClick={() => {
              const code = prompt('Enter invite code to join a private room:');
              if (code && code.trim()) {
                import('../services/api').then(({ joinChatRoomByCode }) => {
                  joinChatRoomByCode(code.trim()).then(room => {
                    window.location.reload();
                    alert(`Joined "${room.name}"!`);
                  }).catch(err => {
                    alert(err.response?.data?.error || 'Invalid invite code');
                  });
                });
              }
            }} title="Join by Code" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
              🔑
            </CreateBtn>
            <CreateBtn onClick={() => setShowCreate(true)} title="Create Room">
              <Plus size={16} />
            </CreateBtn>
          </div>
        </SidebarHeader>

        <RoomList>
          {rooms.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No rooms yet. Create one!
            </div>
          ) : (
            rooms.map(room => (
              <RoomItem
                key={room._id}
                $active={activeRoom?._id === room._id}
                onClick={() => selectRoom(room)}
              >
                <RoomIcon>{room.icon || <Hash size={16} />}</RoomIcon>
                <RoomInfo>
                  <RoomName>{room.name}</RoomName>
                  <RoomPreview>
                    {room.lastMessage?.text || room.description || 'No messages yet'}
                  </RoomPreview>
                </RoomInfo>
                {unreadCounts[room._id] > 0 && (
                  <UnreadBadge>{unreadCounts[room._id]}</UnreadBadge>
                )}
              </RoomItem>
            ))
          )}
        </RoomList>
      </Sidebar>

      {/* ─── Chat Area ─── */}
      <ChatArea $visible={mobileView === 'chat'}>
        {!activeRoom ? (
          <EmptyState>
            <Hash />
            <p>Select a chat room or create a new one to start chatting</p>
          </EmptyState>
        ) : (
          <>
            <ChatHeader>
              <BackButton onClick={() => setMobileView('sidebar')}>
                <ArrowLeft size={16} />
              </BackButton>
              <Hash size={20} style={{ color: 'var(--neon-purple)' }} />
              <ChatTitle>
                {activeRoom.name}
                {activeRoom.type === 'private' && (
                  <span style={{
                    fontSize: '0.7rem',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    color: 'var(--neon-purple)',
                    fontWeight: 700,
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                    onClick={() => {
                      if (activeRoom.inviteCode) {
                        navigator.clipboard.writeText(activeRoom.inviteCode);
                        alert('Invite code copied: ' + activeRoom.inviteCode);
                      }
                    }}
                    title={activeRoom.inviteCode ? `Code: ${activeRoom.inviteCode} (click to copy)` : 'Private room'}
                  >
                    {activeRoom.inviteCode ? `Code: ${activeRoom.inviteCode}` : 'Private'}
                  </span>
                )}
                {activeRoom.description && (
                  <ChatDescription>- {activeRoom.description}</ChatDescription>
                )}
              </ChatTitle>
              <ActionButton onClick={handleLeaveRoom}>
                <LeaveIcon size={14} /> Leave
              </ActionButton>
            </ChatHeader>

            <MessagesArea>
              {loadingMessages ? (
                <EmptyState>
                  <p>Loading messages...</p>
                </EmptyState>
              ) : messages.length === 0 ? (
                <EmptyState>
                  <Hash />
                  <p>No messages yet. Say hi!</p>
                </EmptyState>
              ) : (
                groupedMessages.map((group, gi) => {
                  const first = group[0];
                  const username = first.username || first.sender || 'Unknown';
                  const profilePic = first.profilePicture || first.senderProfilePicture;
                  return (
                    <MessageGroup key={first._id || gi}>
                      <MsgAvatar $image={profilePic}>
                        {!profilePic && (username.charAt(0) || '?')}
                      </MsgAvatar>
                      <MsgContent>
                        <MsgHeader>
                          <MsgUsername onClick={() => navigate(`/profile/${username}`)}>
                            {username}
                          </MsgUsername>
                          <MsgTime>{formatTime(first.createdAt || first.timestamp)}</MsgTime>
                        </MsgHeader>
                        {group.map((msg, mi) => (
                          <MsgText key={msg._id || mi}>{msg.text}</MsgText>
                        ))}
                      </MsgContent>
                    </MessageGroup>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </MessagesArea>

            <TypingIndicator>
              {typingUsers.length > 0 && (
                <>
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                  <span>.</span><span>.</span><span>.</span>
                </>
              )}
            </TypingIndicator>

            <InputArea onSubmit={handleSend}>
              <MessageInput
                type="text"
                placeholder={`Message #${activeRoom.name}`}
                value={newMessage}
                onChange={handleInputChange}
                maxLength={2000}
              />
              <SendBtn type="submit" disabled={!newMessage.trim()}>
                <Send />
              </SendBtn>
            </InputArea>
          </>
        )}
      </ChatArea>

      {/* ─── Member Panel ─── */}
      {activeRoom && (
        <MemberPanel>
          <MemberHeader>
            <Users size={14} />
            Members ({members.length})
          </MemberHeader>

          {members.map((member, i) => {
            const username = member.username || member;
            const profilePic = member.profilePicture;
            return (
              <MemberItem
                key={username + i}
                onClick={() => navigate(`/profile/${username}`)}
              >
                <MemberAvatar $image={profilePic}>
                  {!profilePic && (username.charAt(0) || '?')}
                  {isOnline(username) && <OnlineDot />}
                </MemberAvatar>
                <MemberName>{username}</MemberName>
              </MemberItem>
            );
          })}

          <InviteArea>
            <InviteForm onSubmit={handleInvite}>
              <InviteInput
                type="text"
                placeholder="Invite user..."
                value={inviteUsername}
                onChange={e => setInviteUsername(e.target.value)}
              />
              <InviteBtn type="submit" disabled={!inviteUsername.trim()}>
                <UserPlus size={14} />
              </InviteBtn>
            </InviteForm>
          </InviteArea>
        </MemberPanel>
      )}

      {/* ─── Create Room Modal ─── */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </PageWrapper>
  );
}

export default ChatRoomsPage;
