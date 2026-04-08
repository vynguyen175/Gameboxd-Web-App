import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getConversations, getMessages,
  sendMessage as sendMessageApi, markConversationRead
} from '../services/api';
import { getSocket } from '../services/socket';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  letter-spacing: -0.025em;
`;

const MessagesLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  height: calc(100vh - 220px);
  min-height: 500px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: calc(100vh - 180px);
  }
`;

const ConversationList = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow-y: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    display: ${props => props.$hidden ? 'none' : 'block'};
  }
`;

const ConvHeader = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid var(--divider);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
`;

const ConvItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.$active ? 'var(--neon-purple)' : 'transparent'};
  background: ${props => props.$active ? 'var(--section-bg)' : 'transparent'};

  &:hover {
    background: var(--section-bg);
  }
`;

const ConvAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const ConvInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConvName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  margin-bottom: 2px;
`;

const ConvPreview = styled.div`
  color: var(--text-secondary);
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConvTime = styled.div`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  white-space: nowrap;
`;

const UnreadBadge = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--neon-purple);
  flex-shrink: 0;
`;

const ChatArea = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    display: ${props => props.$hidden ? 'none' : 'flex'};
  }
`;

const ChatHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid var(--divider);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;

  &:hover { color: var(--neon-purple); }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const ChatHeaderAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: ${props => props.$own ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 0.93rem;
  line-height: 1.5;
  word-break: break-word;

  ${props => props.$own ? `
    background: linear-gradient(135deg, var(--neon-purple), #7C3AED);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    background: var(--section-bg);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.68rem;
  color: var(--text-tertiary);
  margin-top: 2px;
  padding: 0 4px;
`;

const TypingIndicator = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: 4px 0;
`;

const InputArea = styled.form`
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--divider);
`;

const MessageInput = styled.input`
  flex: 1;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 24px;
  padding: 12px 20px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  &::placeholder { color: var(--text-secondary); }
`;

const SendBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 12px;

  svg { width: 48px; height: 48px; color: var(--text-tertiary); }
`;

function MessagesPage({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConvRef = useRef(null);

  // Keep ref in sync for socket callbacks
  activeConvRef.current = activeConv;

  // Load conversations and auto-open from URL
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getConversations();
        const convs = data || [];
        setConversations(convs);

        // Auto-open conversation from URL param
        const convId = searchParams.get('conv');
        if (convId) {
          const found = convs.find(c => c._id === convId);
          if (found) {
            setActiveConv(found);
          } else {
            // Conversation was just created, re-fetch
            const fresh = await getConversations();
            setConversations(fresh || []);
            const freshFound = (fresh || []).find(c => c._id === convId);
            if (freshFound) setActiveConv(freshFound);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      try {
        const data = await getMessages(activeConv._id);
        const msgs = data.messages || data || [];
        // API returns newest-first, reverse for chat display
        setMessages(msgs.reverse());
        await markConversationRead(activeConv._id);
        setConversations(prev =>
          prev.map(c => c._id === activeConv._id ? { ...c, unread: false, unreadCount: 0 } : c)
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();

    // Join socket room for this conversation
    const socket = getSocket();
    if (socket) {
      socket.emit('dm:joinConversation', { conversationId: activeConv._id });
    }

    return () => {
      if (socket) {
        socket.emit('dm:leaveConversation', { conversationId: activeConv._id });
      }
    };
  }, [activeConv]);

  // Socket listeners for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (activeConvRef.current?._id === conversationId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        // Mark as read since we're viewing it
        markConversationRead(conversationId).catch(() => {});
      }
      // Update conversation preview
      setConversations(prev =>
        prev.map(c => c._id === conversationId
          ? { ...c, lastMessage: { text: message.text, sender: message.sender, timestamp: message.createdAt } }
          : c
        )
      );
    };

    const handleNotification = ({ conversationId, message }) => {
      // New message in a conversation we're not viewing
      if (activeConvRef.current?._id !== conversationId) {
        setConversations(prev =>
          prev.map(c => c._id === conversationId
            ? { ...c, unread: true, lastMessage: { text: message.text, sender: message.sender, timestamp: message.createdAt } }
            : c
          )
        );
      }
    };

    const handleTyping = ({ conversationId, username: typingUsername }) => {
      if (activeConvRef.current?._id === conversationId && typingUsername !== user.username) {
        setTypingUser(typingUsername);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (activeConvRef.current?._id === conversationId) {
        setTypingUser(null);
      }
    };

    socket.on('dm:newMessage', handleNewMessage);
    socket.on('dm:notification', handleNotification);
    socket.on('dm:typing', handleTyping);
    socket.on('dm:stopTyping', handleStopTyping);

    return () => {
      socket.off('dm:newMessage', handleNewMessage);
      socket.off('dm:notification', handleNotification);
      socket.off('dm:typing', handleTyping);
      socket.off('dm:stopTyping', handleStopTyping);
    };
  }, [user.username]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeConv) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Emit via socket for real-time
    const socket = getSocket();
    if (socket) {
      socket.emit('dm:sendMessage', { conversationId: activeConv._id, text });
      socket.emit('dm:stopTyping', { conversationId: activeConv._id });
      setSending(false);
    } else {
      // Fallback to HTTP
      try {
        const msg = await sendMessageApi(activeConv._id, text);
        setMessages(prev => [...prev, msg]);
        setConversations(prev =>
          prev.map(c => c._id === activeConv._id
            ? { ...c, lastMessage: { text: msg.text, sender: msg.sender, timestamp: msg.createdAt } }
            : c
          )
        );
      } catch (err) {
        console.error(err);
        setNewMessage(text); // Restore on failure
      } finally {
        setSending(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeConv) {
      socket.emit('dm:typing', { conversationId: activeConv._id });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getOtherUser = useCallback((conv) => {
    if (!conv?.participants) return { username: 'Unknown' };
    return conv.participants.find(p => (p.username || p) !== user.username) || conv.participants[0] || { username: 'Unknown' };
  }, [user.username]);

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setTypingUser(null);
  };

  return (
    <Container>
      <Title>Messages</Title>

      <MessagesLayout>
        <ConversationList $hidden={!!activeConv}>
          <ConvHeader>Conversations</ConvHeader>
          {loading ? (
            <LoadingSpinner text="Loading" compact />
          ) : conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No conversations yet. Visit a user's profile and click Message to start chatting!
            </div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              const otherUsername = otherUser.username || otherUser;
              return (
                <ConvItem
                  key={conv._id}
                  $active={activeConv?._id === conv._id}
                  onClick={() => selectConversation(conv)}
                >
                  <ConvAvatar $image={otherUser.profilePicture}>
                    {!otherUser.profilePicture && (otherUsername?.charAt(0) || '?')}
                  </ConvAvatar>
                  <ConvInfo>
                    <ConvName>{otherUsername}</ConvName>
                    <ConvPreview>
                      {conv.lastMessage?.sender === user.username ? 'You: ' : ''}
                      {conv.lastMessage?.text || 'Start chatting...'}
                    </ConvPreview>
                  </ConvInfo>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {conv.lastMessage?.timestamp && (
                      <ConvTime>{formatTime(conv.lastMessage.timestamp)}</ConvTime>
                    )}
                    {(conv.unread || conv.unreadCount > 0) && <UnreadBadge />}
                  </div>
                </ConvItem>
              );
            })
          )}
        </ConversationList>

        <ChatArea $hidden={!activeConv}>
          {!activeConv ? (
            <EmptyChat>
              <MessageCircle />
              <p>Select a conversation to start chatting</p>
            </EmptyChat>
          ) : (
            <>
              <ChatHeader>
                <BackBtn onClick={() => setActiveConv(null)}>
                  <ArrowLeft size={20} />
                </BackBtn>
                {(() => {
                  const other = getOtherUser(activeConv);
                  const name = other.username || other;
                  return (
                    <>
                      <ChatHeaderAvatar
                        $image={other.profilePicture}
                        onClick={() => navigate(`/profile/${name}`)}
                      >
                        {!other.profilePicture && (name?.charAt(0) || '?')}
                      </ChatHeaderAvatar>
                      <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${name}`)}>
                        {name}
                      </span>
                    </>
                  );
                })()}
              </ChatHeader>

              <MessagesArea>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0', fontSize: '0.9rem' }}>
                    Send a message to start the conversation
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isOwn = (msg.sender || msg.username) === user.username;
                  const showTime = i === messages.length - 1 ||
                    (messages[i + 1] && (messages[i + 1].sender !== msg.sender));
                  return (
                    <MessageGroup key={msg._id || i} $own={isOwn}>
                      <MessageBubble $own={isOwn}>
                        {msg.text}
                      </MessageBubble>
                      {showTime && (
                        <MessageTime>
                          {formatTime(msg.createdAt || msg.timestamp)}
                        </MessageTime>
                      )}
                    </MessageGroup>
                  );
                })}
                {typingUser && (
                  <TypingIndicator>{typingUser} is typing...</TypingIndicator>
                )}
                <div ref={messagesEndRef} />
              </MessagesArea>

              <InputArea onSubmit={handleSend}>
                <MessageInput
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleInputChange}
                  maxLength={2000}
                  autoFocus
                />
                <SendBtn type="submit" disabled={sending || !newMessage.trim()}>
                  <Send />
                </SendBtn>
              </InputArea>
            </>
          )}
        </ChatArea>
      </MessagesLayout>
    </Container>
  );
}

export default MessagesPage;
