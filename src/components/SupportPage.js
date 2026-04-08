import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { LifeBuoy, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import {
  createSupportTicket, getMySupportTickets,
  getSupportTicket, replySupportTicket
} from '../services/api';
import LoadingSpinner from './LoadingSpinner';

/* ─── Styled Components ──────────────────────────────────────────────────── */

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
  animation: slideInUp 0.4s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
`;

const IconWrap = styled.div`
  color: var(--neon-purple);
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.$active ? 'var(--neon-purple)' : 'var(--glass-border)'};
  background: ${props => props.$active ? 'var(--neon-purple)' : 'var(--glass-bg)'};
  color: ${props => props.$active ? '#fff' : 'var(--text-secondary)'};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &:hover {
    border-color: var(--neon-purple);
    color: ${props => props.$active ? '#fff' : 'var(--text-primary)'};
  }
`;

const Card = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 24px;
`;

/* ─── New Ticket Form ────────────────────────────────────────────────────── */

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 140px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const SubmitButton = styled.button`
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

/* ─── Ticket List ────────────────────────────────────────────────────────── */

const TicketItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
  cursor: pointer;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--section-bg);
  }
`;

const TicketInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketSubject = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TicketMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${props => {
    switch (props.$type) {
      case 'open': return 'rgba(34, 197, 94, 0.15)';
      case 'in_progress': return 'rgba(234, 179, 8, 0.15)';
      case 'resolved': return 'rgba(59, 130, 246, 0.15)';
      case 'closed': return 'rgba(148, 163, 184, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'open': return '#22c55e';
      case 'in_progress': return '#eab308';
      case 'resolved': return '#3b82f6';
      case 'closed': return '#94a3b8';
      default: return '#94a3b8';
    }
  }};
`;

const CategoryBadge = styled.span`
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(168, 85, 247, 0.15);
  color: var(--neon-purple);
`;

const TimeAgo = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: var(--text-tertiary);
  font-size: 0.95rem;
`;

/* ─── Ticket Detail ──────────────────────────────────────────────────────── */

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`;

const DetailHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
`;

const DetailSubject = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
`;

const DetailBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessagesContainer = styled.div`
  height: calc(100vh - 440px);
  min-height: 300px;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  align-self: ${props => props.$own ? 'flex-end' : 'flex-start'};
  background: ${props => props.$own
    ? 'linear-gradient(135deg, var(--neon-purple), rgba(168, 85, 247, 0.7))'
    : 'var(--section-bg)'};
  color: ${props => props.$own ? '#fff' : 'var(--text-primary)'};
  border: ${props => props.$own ? 'none' : '1px solid var(--glass-border)'};
`;

const SenderLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${props => props.$admin ? 'var(--neon-gold)' : 'rgba(255,255,255,0.7)'};
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  margin-top: 6px;
  opacity: 0.6;
`;

const ReplyBar = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: 'Plus Jakarta Sans', sans-serif;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ClosedNotice = styled.div`
  text-align: center;
  padding: 14px;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  border-top: 1px solid var(--glass-border);
  margin-top: 16px;
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTimeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const secs = Math.floor((now - d) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

function formatStatus(s) {
  if (s === 'in_progress') return 'In Progress';
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const CATEGORIES = [
  'Bug Report', 'Account Issue', 'Feedback',
  'Billing', 'Content Report', 'Other'
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function SupportPage({ user }) {
  const [tab, setTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Bug Report');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reply
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const messagesEndRef = useRef(null);

  /* ── Fetch tickets ──────────────────────────────────────────────────── */

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const data = await getMySupportTickets();
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch {
      // silent
    }
    setTicketsLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  /* ── Fetch ticket detail ────────────────────────────────────────────── */

  const openTicket = async (ticketId) => {
    setSelectedTicket(ticketId);
    setDetailLoading(true);
    try {
      const data = await getSupportTicket(ticketId);
      setDetailData(data);
    } catch {
      // silent
    }
    setDetailLoading(false);
  };

  useEffect(() => {
    if (detailData) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [detailData]);

  /* ── Submit new ticket ──────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await createSupportTicket(subject.trim(), category, message.trim());
      setSubmitSuccess(true);
      setSubject('');
      setCategory('Bug Report');
      setMessage('');
      loadTickets();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  /* ── Reply ──────────────────────────────────────────────────────────── */

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await replySupportTicket(selectedTicket, replyText.trim());
      setReplyText('');
      const data = await getSupportTicket(selectedTicket);
      setDetailData(data);
    } catch {
      // silent
    }
    setReplying(false);
  };

  /* ── Back from detail ───────────────────────────────────────────────── */

  const goBack = () => {
    setSelectedTicket(null);
    setDetailData(null);
    loadTickets();
  };

  /* ── Render detail view ─────────────────────────────────────────────── */

  if (selectedTicket) {
    const ticket = detailData?.ticket;
    const messages = detailData?.messages || [];
    const isClosed = ticket?.status === 'closed';

    return (
      <Container>
        <BackButton onClick={goBack}>
          <ArrowLeft size={18} /> Back to tickets
        </BackButton>

        <Card>
          {detailLoading ? (
            <LoadingSpinner />
          ) : ticket ? (
            <>
              <DetailHeader>
                <DetailSubject>{ticket.subject}</DetailSubject>
                <DetailBadges>
                  <StatusBadge $type={ticket.status}>{formatStatus(ticket.status)}</StatusBadge>
                  <CategoryBadge>{ticket.category}</CategoryBadge>
                </DetailBadges>
              </DetailHeader>

              <MessagesContainer>
                {messages.map((msg) => {
                  const isOwn = msg.sender === 'user' || msg.userId === user._id;
                  return (
                    <MessageBubble key={msg._id || msg.id} $own={isOwn}>
                      <SenderLabel $admin={!isOwn}>
                        {isOwn ? 'You' : 'Admin'}
                      </SenderLabel>
                      {msg.text}
                      <MessageTime>{formatTimeAgo(msg.createdAt)}</MessageTime>
                    </MessageBubble>
                  );
                })}
                <div ref={messagesEndRef} />
              </MessagesContainer>

              {isClosed ? (
                <ClosedNotice>This ticket has been closed.</ClosedNotice>
              ) : (
                <ReplyBar onSubmit={handleReply}>
                  <ReplyInput
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <SendButton type="submit" disabled={replying || !replyText.trim()}>
                    <Send size={18} />
                  </SendButton>
                </ReplyBar>
              )}
            </>
          ) : (
            <EmptyState>Ticket not found.</EmptyState>
          )}
        </Card>
      </Container>
    );
  }

  /* ── Main view ──────────────────────────────────────────────────────── */

  return (
    <Container>
      <Header>
        <IconWrap><LifeBuoy size={28} /></IconWrap>
        <Title>Support</Title>
      </Header>

      <Tabs>
        <Tab $active={tab === 'tickets'} onClick={() => setTab('tickets')}>
          My Tickets ({tickets.length})
        </Tab>
        <Tab $active={tab === 'new'} onClick={() => setTab('new')}>
          + New Ticket
        </Tab>
      </Tabs>

      {/* ── New Ticket Tab ──────────────────────────────────────────── */}
      {tab === 'new' && (
        <Card>
          {submitSuccess && (
            <SuccessMessage>
              <CheckCircle size={18} />
              Ticket submitted successfully! We'll get back to you soon.
            </SuccessMessage>
          )}
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                required
              />
            </FormGroup>
            <SubmitButton type="submit" disabled={submitting || !subject.trim() || !message.trim()}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </SubmitButton>
          </form>
        </Card>
      )}

      {/* ── My Tickets Tab ──────────────────────────────────────────── */}
      {tab === 'tickets' && (
        <Card style={{ padding: 0 }}>
          {ticketsLoading ? (
            <div style={{ padding: 32 }}><LoadingSpinner /></div>
          ) : tickets.length === 0 ? (
            <EmptyState>No tickets yet. Create one if you need help!</EmptyState>
          ) : (
            tickets.map(t => (
              <TicketItem key={t._id || t.id} onClick={() => openTicket(t._id || t.id)}>
                <TicketInfo>
                  <TicketSubject>{t.subject}</TicketSubject>
                  <TicketMeta>
                    <StatusBadge $type={t.status}>{formatStatus(t.status)}</StatusBadge>
                    <CategoryBadge>{t.category}</CategoryBadge>
                  </TicketMeta>
                </TicketInfo>
                <TimeAgo>{formatTimeAgo(t.createdAt || t.updatedAt)}</TimeAgo>
              </TicketItem>
            ))
          )}
        </Card>
      )}
    </Container>
  );
}
