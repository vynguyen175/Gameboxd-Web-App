import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, MessageCircle, User } from 'lucide-react';
import {
  getConversations, getMessages,
  sendMessage, markConversationRead
} from '../services/api';

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #A855F7, #00F0FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
`;

const MessagesLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  height: calc(100vh - 250px);
  min-height: 500px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const ConversationList = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  overflow-y: auto;
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
  padding: 16px 20px;
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

const UnreadBadge = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--neon-purple);
  flex-shrink: 0;
`;

const ChatArea = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 18px 24px;
  border-bottom: 1px solid var(--divider);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 16px;
  font-size: 0.93rem;
  line-height: 1.5;
  word-break: break-word;

  ${props => props.$own ? `
    align-self: flex-end;
    background: linear-gradient(135deg, var(--neon-purple), #7C3AED);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: var(--section-bg);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  color: ${props => props.$own ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)'};
  margin-top: 4px;
  text-align: ${props => props.$own ? 'right' : 'left'};
`;

const InputArea = styled.form`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--divider);
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
  }

  &::placeholder { color: var(--text-secondary); }
`;

const SendBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg { width: 20px; height: 20px; }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
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

const MutualNote = styled.div`
  text-align: center;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--section-bg);
  border-radius: 10px;
  margin: 8px 24px;
`;

function MessagesPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      try {
        const data = await getMessages(activeConv._id);
        setMessages(data.messages || data || []);
        await markConversationRead(activeConv._id);
        setConversations(prev =>
          prev.map(c => c._id === activeConv._id ? { ...c, unread: false, unreadCount: 0 } : c)
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeConv) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeConv._id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      // Update conversation preview
      setConversations(prev =>
        prev.map(c => c._id === activeConv._id ? { ...c, lastMessage: msg } : c)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getOtherUser = (conv) => {
    if (!conv.participants) return { username: 'Unknown' };
    return conv.participants.find(p => (p.username || p) !== user.username) || conv.participants[0] || { username: 'Unknown' };
  };

  return (
    <Container>
      <Title>Messages</Title>

      <MessagesLayout>
        <ConversationList>
          <ConvHeader>Conversations</ConvHeader>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No conversations yet. Start one from a user's profile!
            </div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              const otherUsername = otherUser.username || otherUser;
              return (
                <ConvItem
                  key={conv._id}
                  $active={activeConv?._id === conv._id}
                  onClick={() => setActiveConv(conv)}
                >
                  <ConvAvatar $image={otherUser.profilePicture}>
                    {!otherUser.profilePicture && (otherUsername?.charAt(0) || '?')}
                  </ConvAvatar>
                  <ConvInfo>
                    <ConvName>{otherUsername}</ConvName>
                    <ConvPreview>
                      {conv.lastMessage?.text || 'Start chatting...'}
                    </ConvPreview>
                  </ConvInfo>
                  {(conv.unread || conv.unreadCount > 0) && <UnreadBadge />}
                </ConvItem>
              );
            })
          )}
        </ConversationList>

        <ChatArea>
          {!activeConv ? (
            <EmptyChat>
              <MessageCircle />
              <p>Select a conversation to start chatting</p>
            </EmptyChat>
          ) : (
            <>
              <ChatHeader>
                <User style={{ width: 20, height: 20, color: 'var(--neon-purple)' }} />
                {(() => {
                  const other = getOtherUser(activeConv);
                  return other.username || other;
                })()}
              </ChatHeader>

              {activeConv.mutualFollowRequired && (
                <MutualNote>
                  You can only message users who follow you back.
                </MutualNote>
              )}

              <MessagesArea>
                {messages.map((msg, i) => {
                  const isOwn = (msg.sender || msg.username) === user.username;
                  return (
                    <div key={msg._id || i}>
                      <MessageBubble $own={isOwn}>
                        {msg.text}
                      </MessageBubble>
                      <MessageTime $own={isOwn}>
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </MessageTime>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </MessagesArea>

              <InputArea onSubmit={handleSend}>
                <MessageInput
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  maxLength={1000}
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
