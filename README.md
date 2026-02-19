# 🎮 Gameboxd Web - Gaming Social Platform

## 🚀 React + Node.js Web Version

A modern, gaming-themed social platform built with **React** and **Node.js**. Connect with gamers, review games, and discover trending titles!

---

## ✨ Features

✅ **Modern Gaming UI** - Pure black theme with neon purple/cyan accents
✅ **Real-time Reviews** - Browse 81+ viral game reviews
✅ **Game Cover Images** - Beautiful IGDB cover art
✅ **Vote System** - Upvote/downvote reviews
✅ **User Authentication** - Login/logout with admin roles
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Real-time Stats** - Live counts for reviews, games, and votes
✅ **Smooth Animations** - Slide-in, pulse, and glow effects

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router, Styled Components
- **Backend:** Node.js, Express, MongoDB (shared with Android app)
- **API Communication:** Axios
- **Styling:** CSS-in-JS with gaming theme
- **Fonts:** Inter (Google Fonts)

---

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string
- Backend server running (from `vgj-backend`)

### Step 1: Install Dependencies

```bash
cd gameboxd-web
npm install
```

### Step 2: Start Backend Server

Open a **new terminal**:

```bash
cd ../vgj-backend
node server.js
```

You should see:
```
VGJ backend running on http://localhost:3000
MongoDB connected
```

### Step 3: Start React App

Back in the `gameboxd-web` terminal:

```bash
npm start
```

The app will open at **http://localhost:3001** (or 3002 if 3001 is taken)

---

## 🎯 Quick Start

### Login Credentials

**Admin Account:**
- Username: `vy_n`
- Password: `admin123`

**Gaming Community Users:**
- shadow_assassin
- neon_knight
- cyber_samurai
- thunder_strike
- pixel_overlord

(All use password: `password123`)

---

## 📁 Project Structure

```
gameboxd-web/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── Login.js        # Login page
│   │   ├── Dashboard.js    # Main feed
│   │   ├── ReviewCard.js   # Individual review cards
│   │   └── Navigation.js   # Top navigation bar
│   ├── services/
│   │   └── api.js          # API calls to backend
│   ├── styles/
│   │   └── global.css      # Gaming theme styles
│   ├── App.js              # Main app component
│   └── index.js            # React entry point
├── package.json            # Dependencies
└── README.md               # This file
```

---

## 🎨 Design System

### Colors

```css
Pure Black:     #000000
Dark Gray:      #0A0A0F
Card BG:        #141419

Neon Purple:    #A855F7
Neon Cyan:      #00F0FF
Neon Pink:      #FF10F0
Neon Gold:      #FACC15

Text Primary:   #FFFFFF
Text Secondary: #9CA3AF
```

### Typography

- **Headers:** Inter 900 (Black) with text shadows
- **Body:** Inter 500-700
- **Gaming Style:** Bold fonts with neon glow effects

---

## 🔌 API Endpoints (Backend)

All API calls go through `http://localhost:3000`:

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user

### Reviews
- `GET /reviews` - Get all reviews
- `GET /reviews/user/:username` - Get user's reviews
- `POST /reviews` - Create review
- `DELETE /reviews/:id` - Delete review

### Votes
- `POST /reviews/:id/vote` - Vote on review
- `DELETE /reviews/:id/vote` - Remove vote
- `GET /reviews/:id/vote/:username` - Get vote status

---

## 🎮 Features Breakdown

### 1. **Dashboard**
- Shows 81+ viral game reviews
- Real-time stats (reviews, games, votes)
- Grid layout with responsive design
- Refresh button to fetch latest data

### 2. **Review Cards**
- Game cover images from IGDB
- Star ratings with animated stars
- User info with avatars
- Timestamps ("Just now", "2h ago", etc.)
- Upvote/downvote buttons
- Hover effects and animations

### 3. **Authentication**
- Beautiful login page with gaming aesthetic
- Gradient backgrounds with animated glows
- Error handling
- Auto-login with localStorage
- Admin badge for admin users

### 4. **Navigation**
- Sticky navigation bar
- User profile display
- Admin/Pro badges
- Logout functionality

---

## 🔥 What You'll See

When you open the web app, you'll immediately see:

```
Dashboard:
├─ 81 viral game reviews
├─ Game covers from IGDB
├─ Real-time timestamps
├─ Upvote/downvote counts
├─ Gaming community usernames
└─ Responsive grid layout

Stats:
├─ Total Reviews: 81
├─ Games Reviewed: 30
└─ Community Votes: 5000+

Trending Games:
1. Elden Ring - 8 reviews
2. Zelda TOTK - 7 reviews
3. Death Stranding - 6 reviews
4. GTA V - 6 reviews
5. Dark Souls 3 - 4 reviews
```

---

## 🐛 Troubleshooting

### Backend Not Connecting?

**Error:** "Failed to load reviews"

**Fix:**
1. Make sure backend is running: `cd ../vgj-backend && node server.js`
2. Check if MongoDB is connected
3. Verify backend shows: `VGJ backend running on http://localhost:3000`

### Reviews Not Showing?

**Fix:**
1. Click the "🔄 Refresh Feed" button
2. Check browser console for errors (F12)
3. Verify backend has reviews: `curl http://localhost:3000/reviews`

### Port Already in Use?

**Error:** "Port 3001 is already in use"

**Fix:**
React will automatically use port 3002. Just click "Y" when prompted.

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Run `npm run build`
2. Drag `build/` folder to https://app.netlify.com/drop

**Note:** Update API base URL for production in `src/services/api.js`

---

## 📊 Database

Uses the same MongoDB database as the Android app!

**Current Data:**
- 81 reviews with images
- 30 viral games
- 27 users (15 gaming community members)
- Real-time timestamps
- Vote counts pre-populated

**Re-seed Data:**

```bash
cd ../vgj-backend
node seed-viral-games.js
```

---

## 🎯 Next Steps

### Add More Features:

1. **User Profiles** - View user's review history
2. **Create Review** - Add new reviews from web
3. **Search** - Search games and reviews
4. **Filters** - Filter by rating, date, game
5. **Dark/Light Theme Toggle** - Switch between themes
6. **Notifications** - Real-time vote notifications
7. **Comments** - Add comments to reviews
8. **Social Sharing** - Share reviews on social media

---

## 🤝 Contributing

This is your personal gaming platform! Feel free to customize:

- Change colors in `src/styles/global.css`
- Add new components in `src/components/`
- Modify gaming theme in styled-components
- Add new API endpoints in `src/services/api.js`

---

## 📝 License

MIT License - Free to use and modify!

---

## 🎮 Enjoy Your Gaming Platform!

Built with ❤️ for the gaming community

**Questions?** Check the code comments or backend docs in `../vgj-backend/`

**Happy Gaming! 🚀**
