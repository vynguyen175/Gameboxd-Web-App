# Customer Support Ticket System — Design Spec

## Overview

A built-in support ticket system for Gameboxd where users submit categorized tickets and admins manage them with threaded replies from the existing admin panel.

## Data Models

### SupportTicket

| Field       | Type     | Notes                                                        |
|-------------|----------|--------------------------------------------------------------|
| `_id`       | ObjectId | Auto                                                         |
| `username`  | String   | Submitter's username                                         |
| `subject`   | String   | Short title, required, max 200 chars                         |
| `category`  | String   | Enum: `bug_report`, `account_issue`, `feedback`, `billing`, `content_report`, `other` |
| `status`    | String   | Enum: `open`, `in_progress`, `resolved`, `closed`. Default: `open` |
| `priority`  | String   | Enum: `low`, `medium`, `high`. Default: `low`. Admin-set only |
| `createdAt` | Date     | Auto                                                         |
| `updatedAt` | Date     | Auto, updated on any status change or new message            |

Indexes: `{ username: 1, updatedAt: -1 }`, `{ status: 1, updatedAt: -1 }`

### TicketMessage

| Field       | Type     | Notes                                      |
|-------------|----------|--------------------------------------------|
| `_id`       | ObjectId | Auto                                       |
| `ticketId`  | ObjectId | Ref to SupportTicket, required             |
| `sender`    | String   | Username of sender                         |
| `isAdmin`   | Boolean  | True if sent by admin. Default: false      |
| `text`      | String   | Message body, required, max 5000 chars     |
| `createdAt` | Date     | Auto                                       |

Index: `{ ticketId: 1, createdAt: 1 }`

The first TicketMessage is the user's initial description, created alongside the ticket. All subsequent messages form the conversation thread.

## Backend API Endpoints

### User-facing (require auth middleware)

| Method | Route                            | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/support/tickets`               | Create ticket (subject, category, message) |
| GET    | `/support/tickets`               | List current user's tickets, sorted by updatedAt desc |
| GET    | `/support/tickets/:id`           | Get ticket + all messages (only if owner) |
| POST   | `/support/tickets/:id/messages`  | Reply to own ticket (rejected if status is `closed`) |

### Admin-facing (require adminAuth middleware)

| Method | Route                                  | Description                              |
|--------|----------------------------------------|------------------------------------------|
| GET    | `/admin/support/tickets`               | List all tickets, filterable by status and category via query params |
| GET    | `/admin/support/tickets/:id`           | Get any ticket + messages                |
| POST   | `/admin/support/tickets/:id/messages`  | Admin reply (sets isAdmin: true)         |
| PUT    | `/admin/support/tickets/:id`           | Update status and/or priority            |

### Validation rules

- Subject: required, 1-200 characters
- Category: must be one of the 6 enum values
- Message text: required, 1-5000 characters
- Users can only access their own tickets
- Closed tickets reject new messages from both sides
- Status transitions: open -> in_progress -> resolved -> closed (admin can also reopen by setting back to in_progress)

## Frontend

### SupportPage.js (route: `/support`, requires login)

Two-tab layout:

**"New Ticket" tab:**
- Subject text input
- Category dropdown (Bug Report, Account Issue, Feedback, Billing, Content Report, Other)
- Message textarea
- Submit button
- Success confirmation after submission

**"My Tickets" tab:**
- List of user's tickets, each showing: subject, category badge (color-coded), status badge, time since last update
- Click opens ticket detail view
- Ticket detail: conversation thread (user messages right-aligned, admin messages left-aligned with "Admin" badge), status indicator at top, reply input at bottom (hidden if ticket is closed)

### Admin Panel — new "Support" tab

- Ticket list table with columns: subject, user, category, status, priority, last updated
- Filter dropdowns: status, category
- Open ticket count badge on the tab label
- Click opens ticket detail: full conversation thread, reply input, status dropdown, priority dropdown
- Reuses existing AdminPage styled components (Card, CardHeader, CardTitle, ActionButton, etc.)

### Navigation

- Add "Support" item to sidebar between Settings and Premium
- Icon: `LifeBuoy` from lucide-react
- Label: "Support"

## Notifications

- When admin replies to a ticket, user receives an in-app notification via existing `createNotification` utility
- Notification text: "Admin replied to your support ticket: {subject}"
- No email notifications (app notifications only)

## Out of Scope

- File/screenshot attachments
- Email notifications for ticket updates
- Canned/template admin responses
- Ticket assignment to specific admins
- SLA timers or auto-close logic
- Real-time socket updates (tickets are not time-critical; manual refresh is fine)
