# Customer Support Ticket System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a support ticket system where users submit categorized tickets and admins manage them with threaded replies from the admin panel.

**Architecture:** Two new Mongoose models (SupportTicket, TicketMessage), one new backend route file mounted at `/support` for user endpoints and extended admin routes at `/admin/support`. One new frontend page (SupportPage.js) and a new "Support" tab in the existing AdminPage. Navigation sidebar gets a Support link.

**Tech Stack:** MongoDB/Mongoose, Express, React, styled-components, lucide-react icons

---

### Task 1: Backend Models

**Files:**
- Create: `vgj-backend/models/SupportTicket.js`
- Create: `vgj-backend/models/TicketMessage.js`

- [ ] **Step 1: Create SupportTicket model**

```javascript
// vgj-backend/models/SupportTicket.js
const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
  username: { type: String, required: true },
  subject: { type: String, required: true, maxlength: 200 },
  category: {
    type: String,
    required: true,
    enum: ["bug_report", "account_issue", "feedback", "billing", "content_report", "other"],
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

supportTicketSchema.index({ username: 1, updatedAt: -1 });
supportTicketSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
```

- [ ] **Step 2: Create TicketMessage model**

```javascript
// vgj-backend/models/TicketMessage.js
const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", required: true },
  sender: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  text: { type: String, required: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now },
});

ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model("TicketMessage", ticketMessageSchema);
```

- [ ] **Step 3: Verify models load**

Run from `vgj-backend/`:
```bash
node -e "require('./models/SupportTicket'); require('./models/TicketMessage'); console.log('Models OK')"
```
Expected: `Models OK`

- [ ] **Step 4: Commit**

```bash
git add models/SupportTicket.js models/TicketMessage.js
git commit -m "Add SupportTicket and TicketMessage models"
```

---

### Task 2: Backend Support Routes (User-Facing)

**Files:**
- Create: `vgj-backend/routes/support.js`
- Modify: `vgj-backend/server.js` (add route mount)

- [ ] **Step 1: Create support routes file**

```javascript
// vgj-backend/routes/support.js
const router = require("express").Router();
const SupportTicket = require("../models/SupportTicket");
const TicketMessage = require("../models/TicketMessage");
const { auth } = require("../middleware/auth");

router.use(auth);

// POST /support/tickets — create a new ticket
router.post("/tickets", async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    const username = req.user.username;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: "Subject is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const validCategories = ["bug_report", "account_issue", "feedback", "billing", "content_report", "other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const ticket = await SupportTicket.create({
      username,
      subject: subject.trim(),
      category,
    });

    await TicketMessage.create({
      ticketId: ticket._id,
      sender: username,
      isAdmin: false,
      text: message.trim(),
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /support/tickets — list my tickets
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ username: req.user.username })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /support/tickets/:id — get ticket + messages
router.get("/tickets/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.username !== req.user.username) {
      return res.status(403).json({ error: "Not your ticket" });
    }

    const messages = await TicketMessage.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ ticket, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /support/tickets/:id/messages — reply to my ticket
router.post("/tickets/:id/messages", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.username !== req.user.username) {
      return res.status(403).json({ error: "Not your ticket" });
    }
    if (ticket.status === "closed") {
      return res.status(400).json({ error: "Ticket is closed" });
    }

    const message = await TicketMessage.create({
      ticketId: ticket._id,
      sender: req.user.username,
      isAdmin: false,
      text: text.trim(),
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount routes in server.js**

Add this line after the existing route mounts (after `app.use("/chatrooms", ...)`):

```javascript
app.use("/support", require("./routes/support"));
```

- [ ] **Step 3: Verify routes load**

```bash
node -e "require('./routes/support'); console.log('Support routes OK')"
```
Expected: `Support routes OK`

- [ ] **Step 4: Commit**

```bash
git add routes/support.js server.js
git commit -m "Add user-facing support ticket endpoints"
```

---

### Task 3: Backend Admin Support Routes

**Files:**
- Modify: `vgj-backend/routes/admin.js`

- [ ] **Step 1: Add admin support endpoints to routes/admin.js**

Add at the bottom of the file, before `module.exports = router;`:

```javascript
// ── Support Ticket Admin ──────────────────────────────────────────

const SupportTicket = require("../models/SupportTicket");
const TicketMessage = require("../models/TicketMessage");
const { createNotification } = require("../utils/notify");

// GET /admin/support/tickets — list all tickets with optional filters
router.get("/support/tickets", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const tickets = await SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/support/tickets/:id — get any ticket + messages
router.get("/support/tickets/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const messages = await TicketMessage.find({ ticketId: ticket._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ ticket, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/support/tickets/:id/messages — admin reply
router.post("/support/tickets/:id/messages", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.status === "closed") {
      return res.status(400).json({ error: "Ticket is closed" });
    }

    const message = await TicketMessage.create({
      ticketId: ticket._id,
      sender: req.user.username,
      isAdmin: true,
      text: text.trim(),
    });

    ticket.updatedAt = new Date();
    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }
    await ticket.save();

    // Notify the ticket owner
    await createNotification(
      ticket.username,
      req.user.username,
      "support",
      `Admin replied to your support ticket: ${ticket.subject}`,
      ticket._id,
      "SupportTicket"
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/support/tickets/:id — update status/priority
router.put("/support/tickets/:id", async (req, res) => {
  try {
    const { status, priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (status) {
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      ticket.status = status;
    }
    if (priority) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }
      ticket.priority = priority;
    }

    ticket.updatedAt = new Date();
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add routes/admin.js
git commit -m "Add admin support ticket management endpoints"
```

---

### Task 4: Frontend API Functions

**Files:**
- Modify: `gameboxd-web/src/services/api.js`

- [ ] **Step 1: Add support API functions**

Add at the end of the file, before the final export (or at the bottom):

```javascript
// ─── Support Tickets ─────────────────────────────────────────────────────────

export const createSupportTicket = async (subject, category, message) => {
  const response = await api.post('/support/tickets', { subject, category, message });
  return response.data;
};

export const getMySupportTickets = async () => {
  const response = await api.get('/support/tickets');
  return response.data;
};

export const getSupportTicket = async (ticketId) => {
  const response = await api.get(`/support/tickets/${ticketId}`);
  return response.data;
};

export const replySupportTicket = async (ticketId, text) => {
  const response = await api.post(`/support/tickets/${ticketId}/messages`, { text });
  return response.data;
};

// Admin support
export const getAdminSupportTickets = async (status, category) => {
  const params = {};
  if (status) params.status = status;
  if (category) params.category = category;
  const response = await api.get('/admin/support/tickets', { params, headers: getAdminHeaders() });
  return response.data;
};

export const getAdminSupportTicket = async (ticketId) => {
  const response = await api.get(`/admin/support/tickets/${ticketId}`, { headers: getAdminHeaders() });
  return response.data;
};

export const adminReplySupportTicket = async (ticketId, text) => {
  const response = await api.post(`/admin/support/tickets/${ticketId}/messages`, { text }, { headers: getAdminHeaders() });
  return response.data;
};

export const adminUpdateSupportTicket = async (ticketId, data) => {
  const response = await api.put(`/admin/support/tickets/${ticketId}`, data, { headers: getAdminHeaders() });
  return response.data;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/api.js
git commit -m "Add support ticket API functions"
```

---

### Task 5: Frontend SupportPage Component

**Files:**
- Create: `gameboxd-web/src/components/SupportPage.js`
- Modify: `gameboxd-web/src/App.js` (add route)

- [ ] **Step 1: Create SupportPage.js**

```jsx
// src/components/SupportPage.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, ArrowLeft, LifeBuoy, Plus, ChevronRight } from 'lucide-react';
import {
  createSupportTicket, getMySupportTickets,
  getSupportTicket, replySupportTicket
} from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: 12px;
  svg { color: var(--neon-purple); }
`;

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid ${p => p.$active ? 'var(--neon-purple)' : 'var(--glass-border)'};
  background: ${p => p.$active ? 'rgba(168, 85, 247, 0.15)' : 'var(--glass-bg)'};
  color: ${p => p.$active ? 'var(--neon-purple)' : 'var(--text-secondary)'};
  &:hover { border-color: var(--neon-purple); color: var(--neon-purple); }
`;

const FormCard = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(12px);
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  &:focus { outline: none; border-color: var(--neon-purple); }
  &::placeholder { color: var(--text-tertiary); }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  &:focus { outline: none; border-color: var(--neon-purple); }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  min-height: 120px;
  resize: vertical;
  &:focus { outline: none; border-color: var(--neon-purple); }
  &::placeholder { color: var(--text-tertiary); }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  color: white;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TicketItem = styled.div`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  &:hover { border-color: var(--neon-purple); transform: translateY(-1px); }
`;

const TicketInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketSubject = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const TicketMeta = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Badge = styled.span`
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => {
    if (p.$type === 'open') return 'rgba(34,197,94,0.15)';
    if (p.$type === 'in_progress') return 'rgba(250,204,21,0.15)';
    if (p.$type === 'resolved') return 'rgba(59,130,246,0.15)';
    if (p.$type === 'closed') return 'rgba(107,114,128,0.15)';
    return 'rgba(168,85,247,0.15)';
  }};
  color: ${p => {
    if (p.$type === 'open') return '#22C55E';
    if (p.$type === 'in_progress') return '#FACC15';
    if (p.$type === 'resolved') return '#3B82F6';
    if (p.$type === 'closed') return '#6B7280';
    return 'var(--neon-purple)';
  }};
`;

const CATEGORY_LABELS = {
  bug_report: 'Bug Report',
  account_issue: 'Account Issue',
  feedback: 'Feedback',
  billing: 'Billing',
  content_report: 'Content Report',
  other: 'Other',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

/* ── Ticket Detail View ── */

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  &:hover { color: var(--neon-purple); }
`;

const MessagesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  max-height: 50vh;
  overflow-y: auto;
  padding: 4px;
`;

const MsgBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.93rem;
  line-height: 1.5;
  word-break: break-word;
  ${p => p.$own ? `
    align-self: flex-end;
    background: linear-gradient(135deg, var(--neon-purple), #7C3AED);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: var(--section-bg);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    border-bottom-left-radius: 4px;
  `}
`;

const MsgSender = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => p.$admin ? 'var(--neon-gold)' : 'var(--text-tertiary)'};
  margin-bottom: 2px;
  ${p => p.$own ? 'text-align: right;' : ''}
`;

const MsgTime = styled.div`
  font-size: 0.68rem;
  color: var(--text-tertiary);
  margin-top: 2px;
  ${p => p.$own ? 'text-align: right;' : ''}
`;

const ReplyForm = styled.form`
  display: flex;
  gap: 10px;
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border-radius: 24px;
  border: 2px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  &:focus { outline: none; border-color: var(--neon-purple); }
  &::placeholder { color: var(--text-secondary); }
`;

const SendBtn = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { width: 18px; height: 18px; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SuccessMsg = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 2px solid rgba(34, 197, 94, 0.3);
  color: #22C55E;
  font-weight: 600;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function SupportPage({ user }) {
  const [tab, setTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef(null);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('bug_report');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTickets = async () => {
    try {
      const data = await getMySupportTickets();
      setTickets(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createSupportTicket(subject.trim(), category, message.trim());
      setSuccess('Ticket submitted! Our team will get back to you soon.');
      setSubject('');
      setCategory('bug_report');
      setMessage('');
      loadTickets();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    try {
      const data = await getSupportTicket(ticket._id);
      setSelectedTicket(data.ticket);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const msg = await replySupportTicket(selectedTicket._id, reply.trim());
      setMessages(prev => [...prev, msg]);
      setReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Ticket detail view
  if (selectedTicket) {
    return (
      <Container>
        <DetailHeader>
          <BackBtn onClick={() => { setSelectedTicket(null); loadTickets(); }}>
            <ArrowLeft size={20} />
          </BackBtn>
          <div style={{ flex: 1 }}>
            <TicketSubject>{selectedTicket.subject}</TicketSubject>
            <TicketMeta>
              <Badge $type={selectedTicket.status}>{STATUS_LABELS[selectedTicket.status]}</Badge>
              <Badge $type="category">{CATEGORY_LABELS[selectedTicket.category]}</Badge>
              <span>{timeAgo(selectedTicket.createdAt)}</span>
            </TicketMeta>
          </div>
        </DetailHeader>

        <FormCard>
          <MessagesArea>
            {messages.map((msg, i) => {
              const isOwn = msg.sender === user.username && !msg.isAdmin;
              return (
                <div key={msg._id || i}>
                  <MsgSender $admin={msg.isAdmin} $own={isOwn}>
                    {msg.isAdmin ? 'Admin' : msg.sender}
                  </MsgSender>
                  <MsgBubble $own={isOwn}>{msg.text}</MsgBubble>
                  <MsgTime $own={isOwn}>{timeAgo(msg.createdAt)}</MsgTime>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </MessagesArea>

          {selectedTicket.status !== 'closed' ? (
            <ReplyForm onSubmit={handleReply}>
              <ReplyInput
                type="text"
                placeholder="Type a reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                maxLength={5000}
              />
              <SendBtn type="submit" disabled={sending || !reply.trim()}>
                <Send />
              </SendBtn>
            </ReplyForm>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '12px', fontSize: '0.85rem' }}>
              This ticket is closed.
            </div>
          )}
        </FormCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title><LifeBuoy size={28} /> Support</Title>

      <TabRow>
        <Tab $active={tab === 'tickets'} onClick={() => setTab('tickets')}>
          My Tickets ({tickets.length})
        </Tab>
        <Tab $active={tab === 'new'} onClick={() => setTab('new')}>
          <Plus size={14} style={{ marginRight: 4 }} /> New Ticket
        </Tab>
      </TabRow>

      {success && <SuccessMsg>{success}</SuccessMsg>}

      {tab === 'new' ? (
        <FormCard>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Subject</Label>
              <Input
                type="text"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={200}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={5000}
                required
              />
            </FormGroup>
            <SubmitBtn type="submit" disabled={submitting || !subject.trim() || !message.trim()}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </SubmitBtn>
          </form>
        </FormCard>
      ) : loading ? (
        <LoadingSpinner text="Loading tickets" />
      ) : tickets.length === 0 ? (
        <EmptyState>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No tickets yet</p>
          <p>Need help? Create a new support ticket.</p>
        </EmptyState>
      ) : (
        <TicketList>
          {tickets.map(ticket => (
            <TicketItem key={ticket._id} onClick={() => openTicket(ticket)}>
              <TicketInfo>
                <TicketSubject>{ticket.subject}</TicketSubject>
                <TicketMeta>
                  <Badge $type={ticket.status}>{STATUS_LABELS[ticket.status]}</Badge>
                  <Badge $type="category">{CATEGORY_LABELS[ticket.category]}</Badge>
                  <span>{timeAgo(ticket.updatedAt)}</span>
                </TicketMeta>
              </TicketInfo>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </TicketItem>
          ))}
        </TicketList>
      )}
    </Container>
  );
}

export default SupportPage;
```

- [ ] **Step 2: Add route in App.js**

Add import at top with other component imports:
```javascript
import SupportPage from './components/SupportPage';
```

Add route alongside other protected routes (after the messages route):
```jsx
<Route path="/support" element={user ? <SupportPage user={user} /> : <Navigate to="/login" />} />
```

- [ ] **Step 3: Build and verify**

```bash
CI=true npx react-scripts build
```
Expected: Compiled successfully (no warnings-as-errors)

- [ ] **Step 4: Commit**

```bash
git add src/components/SupportPage.js src/App.js
git commit -m "Add SupportPage with ticket submission and thread view"
```

---

### Task 6: Admin Panel Support Tab

**Files:**
- Modify: `gameboxd-web/src/components/AdminPage.js`

- [ ] **Step 1: Add imports and state**

Add to the imports at top of AdminPage.js:
```javascript
import {
  getAdminSupportTickets, getAdminSupportTicket,
  adminReplySupportTicket, adminUpdateSupportTicket
} from '../services/api';
```

Add state variables inside AdminPage function (alongside existing state):
```javascript
const [supportTickets, setSupportTickets] = useState([]);
const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
const [supportMessages, setSupportMessages] = useState([]);
const [supportReply, setSupportReply] = useState('');
const [supportFilter, setSupportFilter] = useState({ status: '', category: '' });
```

- [ ] **Step 2: Add data loading**

Add inside the existing `useEffect` that loads data (or add a new one):
```javascript
useEffect(() => {
  if (activeTab === 'support') {
    loadSupportTickets();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, supportFilter]);

const loadSupportTickets = async () => {
  try {
    const data = await getAdminSupportTickets(supportFilter.status, supportFilter.category);
    setSupportTickets(data || []);
  } catch (err) {
    console.error(err);
  }
};

const openSupportTicket = async (ticket) => {
  try {
    const data = await getAdminSupportTicket(ticket._id);
    setSelectedSupportTicket(data.ticket);
    setSupportMessages(data.messages || []);
  } catch (err) {
    console.error(err);
  }
};

const handleSupportReply = async () => {
  if (!supportReply.trim()) return;
  try {
    const msg = await adminReplySupportTicket(selectedSupportTicket._id, supportReply.trim());
    setSupportMessages(prev => [...prev, msg]);
    setSupportReply('');
    setMessage({ type: 'success', text: 'Reply sent' });
  } catch (err) {
    setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send reply' });
  }
};

const handleUpdateTicketStatus = async (ticketId, status) => {
  try {
    const updated = await adminUpdateSupportTicket(ticketId, { status });
    setSelectedSupportTicket(updated);
    loadSupportTickets();
    setMessage({ type: 'success', text: `Ticket marked as ${status}` });
  } catch (err) {
    setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update' });
  }
};

const handleUpdateTicketPriority = async (ticketId, priority) => {
  try {
    const updated = await adminUpdateSupportTicket(ticketId, { priority });
    setSelectedSupportTicket(updated);
    loadSupportTickets();
  } catch (err) {
    setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update' });
  }
};
```

- [ ] **Step 3: Add "Support" tab button**

Add after the existing "Ads" tab in the TabsContainer:
```jsx
<Tab $active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setSearchTerm(''); }}>
  Support ({supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length})
</Tab>
```

- [ ] **Step 4: Add Support tab content**

Add after the `{activeTab === 'ads' && ...}` block:

```jsx
{activeTab === 'support' && (
  <Card>
    <CardHeader>
      <CardTitle>
        {selectedSupportTicket ? selectedSupportTicket.subject : `Support Tickets (${supportTickets.length})`}
      </CardTitle>
      {selectedSupportTicket ? (
        <ActionButton $color="var(--text-secondary)" onClick={() => setSelectedSupportTicket(null)}>
          Back to List
        </ActionButton>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={supportFilter.status}
            onChange={e => setSupportFilter(f => ({ ...f, status: e.target.value }))}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={supportFilter.category}
            onChange={e => setSupportFilter(f => ({ ...f, category: e.target.value }))}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="">All Categories</option>
            <option value="bug_report">Bug Report</option>
            <option value="account_issue">Account Issue</option>
            <option value="feedback">Feedback</option>
            <option value="billing">Billing</option>
            <option value="content_report">Content Report</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
    </CardHeader>

    <div style={{ padding: 20 }}>
      {selectedSupportTicket ? (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From: <strong>{selectedSupportTicket.username}</strong></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={selectedSupportTicket.status}
              onChange={e => handleUpdateTicketStatus(selectedSupportTicket._id, e.target.value)}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority:</span>
            <select
              value={selectedSupportTicket.priority}
              onChange={e => handleUpdateTicketPriority(selectedSupportTicket._id, e.target.value)}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '40vh', overflowY: 'auto', marginBottom: 16, padding: 4 }}>
            {supportMessages.map((msg, i) => (
              <div key={msg._id || i} style={{ alignSelf: msg.isAdmin ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: msg.isAdmin ? 'var(--neon-gold)' : 'var(--text-tertiary)', marginBottom: 2, textAlign: msg.isAdmin ? 'right' : 'left' }}>
                  {msg.isAdmin ? `${msg.sender} (Admin)` : msg.sender}
                </div>
                <div style={{
                  padding: '10px 16px', borderRadius: 16, fontSize: '0.93rem', lineHeight: 1.5, wordBreak: 'break-word',
                  ...(msg.isAdmin
                    ? { background: 'linear-gradient(135deg, var(--neon-purple), #7C3AED)', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'var(--section-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderBottomLeftRadius: 4 })
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2, textAlign: msg.isAdmin ? 'right' : 'left' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {selectedSupportTicket.status !== 'closed' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Input
                type="text"
                placeholder="Type admin reply..."
                value={supportReply}
                onChange={e => setSupportReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSupportReply(); } }}
                maxLength={5000}
              />
              <ActionButton $color="#22C55E" onClick={handleSupportReply} disabled={!supportReply.trim()}>
                Reply
              </ActionButton>
            </div>
          )}
        </>
      ) : supportTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          No support tickets found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {supportTickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => openSupportTicket(ticket)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                background: 'var(--section-bg)', borderRadius: 12, cursor: 'pointer',
                border: '1px solid var(--glass-border)', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-purple)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{ticket.subject}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>{ticket.username}</span>
                  <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: ticket.status === 'open' ? 'rgba(34,197,94,0.15)' : ticket.status === 'in_progress' ? 'rgba(250,204,21,0.15)' : 'rgba(107,114,128,0.15)', color: ticket.status === 'open' ? '#22C55E' : ticket.status === 'in_progress' ? '#FACC15' : '#6B7280' }}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 6, background: ticket.priority === 'high' ? 'rgba(239,68,68,0.15)' : ticket.priority === 'medium' ? 'rgba(250,204,21,0.15)' : 'rgba(107,114,128,0.1)', color: ticket.priority === 'high' ? '#EF4444' : ticket.priority === 'medium' ? '#FACC15' : 'var(--text-tertiary)' }}>
                {ticket.priority}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </Card>
)}
```

- [ ] **Step 5: Build and verify**

```bash
CI=true npx react-scripts build
```
Expected: Compiled successfully

- [ ] **Step 6: Commit**

```bash
git add src/components/AdminPage.js
git commit -m "Add Support tab to admin panel with ticket management"
```

---

### Task 7: Add Support to Navigation Sidebar

**Files:**
- Modify: `gameboxd-web/src/components/Navigation.js`

- [ ] **Step 1: Add LifeBuoy import**

Add `LifeBuoy` to the lucide-react import at the top of Navigation.js:

Find the line importing from `lucide-react` and add `LifeBuoy` to the list.

- [ ] **Step 2: Add Support nav item**

In the `<BottomSection>`, add before the Settings item (before line with `renderItem('/settings', ...)`):

```jsx
{renderItem('/support', LifeBuoy, 'Support', 14)}
```

Update the index numbers for Settings (15), Admin (16), Premium (17), and ThemeToggleBtn ($i={18}).

- [ ] **Step 3: Add to mobile drawer**

In the mobile drawer section, add a Support link alongside the other drawer items:

```jsx
<DrawerNavItem to="/support"><LifeBuoy />Support</DrawerNavItem>
```

- [ ] **Step 4: Build and verify**

```bash
CI=true npx react-scripts build
```
Expected: Compiled successfully

- [ ] **Step 5: Commit**

```bash
git add src/components/Navigation.js
git commit -m "Add Support link to navigation sidebar"
```

---

### Task 8: Push Backend and Frontend

**Files:** None new — pushing existing commits

- [ ] **Step 1: Push backend**

```bash
cd vgj-backend
git add -A
git commit -m "Add customer support ticket system: models, routes, admin endpoints"
git push
```

- [ ] **Step 2: Push frontend**

```bash
cd gameboxd-web
git push
```

- [ ] **Step 3: Verify Vercel deployment**

```bash
curl -sL "https://gameboxd-web-app.vercel.app" | grep -o 'main\.[a-z0-9]*\.js'
```

Compare hash with local build to confirm new code deployed.
