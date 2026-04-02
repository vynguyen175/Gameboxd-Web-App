# Gameboxd Business Features Implementation Plan

## Tier 1: Revenue Generation

### 1. Affiliate Links on Game Pages
**What**: Every game page shows "Buy on Steam / Epic / PlayStation / Xbox" buttons with affiliate tracking links.
**Revenue**: 5-15% commission per sale depending on platform.
**Implementation**:
- Backend: Use IGDB website data (already fetched — Steam, Epic, GOG links come from `websites` field) to extract store URLs
- Backend: New utility to convert store URLs to affiliate URLs (append affiliate tags)
- Frontend: GamePage.js — add a "Where to Buy" section with store buttons
- **Affiliate Programs to Sign Up For**:
  - Steam: Use Humble Bundle Partner program or Fanatical affiliate
  - Epic Games: Epic Affiliate program (Support-A-Creator)
  - PlayStation: PlayStation affiliate via Impact.com
  - Xbox/Microsoft: Microsoft Affiliate program
  - GOG: GOG affiliate program
- **Status**: Implementation ready. User needs to register for affiliate programs and add IDs to .env

### 2. Sponsored/Featured Game Placements
**What**: A "Featured" section on Dashboard that can be manually curated or sold to publishers.
**Implementation**:
- Backend: New `FeaturedGame` model with title, igdbId, coverUrl, tagline, link, startDate, endDate
- Backend: Admin endpoint to manage featured games
- Frontend: Dashboard.js — "Featured" banner section at top
- **Status**: Implementation ready. Monetization requires outreach to indie game publishers.

---

## Tier 2: Growth / User Acquisition

### 3. Public Game Pages (SEO)
**What**: Game pages, shared reviews, and user profiles are accessible without login. Google indexes them, bringing organic traffic.
**Implementation**:
- Frontend: Remove the `<Navigate to="/login" />` guard on game pages, shared reviews, and profile pages
- Frontend: Add meta tags (Open Graph, Twitter Card) for social sharing previews
- Backend: Game detail and review endpoints already work without auth (using `optionalAuth`)
- **Goal**: When someone Googles "Elden Ring reviews", Gameboxd pages appear in results
- **Status**: Implementation ready. No external dependencies.

### 4. Embeddable Review Widgets
**What**: Users get an embed code to show their Gameboxd review/rating on external sites (blogs, Twitch panels, YouTube descriptions).
**Implementation**:
- Frontend: New `/embed/review/:id` lightweight page (minimal CSS, no nav, just the review card)
- Frontend: "Get Embed Code" button on review share modal that gives an iframe snippet
- Backend: Review share endpoint already exists
- **Status**: Implementation ready. No external dependencies.

### 5. Steam Library Import (OAuth)
**What**: Users connect their Steam account. Gameboxd imports their game library and playtime, auto-populating the backlog.
**Implementation**:
- Backend: Steam OpenID authentication flow
- Backend: Steam Web API integration to fetch owned games (`IPlayerService/GetOwnedGames`)
- Backend: Map Steam AppIDs to IGDB game IDs (IGDB has `external_games` endpoint for this)
- Backend: Bulk-create GameStatus entries for imported games
- Frontend: Settings page — "Connect Steam" button
- Frontend: Import wizard showing matched games with status picker
- **Requires**: Steam Web API Key (free, register at https://steamcommunity.com/dev/apikey)
- **Status**: Implementation ready after user registers for Steam API key.

---

## Tier 3: Retention / Engagement

### 6. Weekly Digest Email
**What**: Every Monday, users get an email: "3 friends reviewed games this week — here's what they thought"
**Implementation**:
- Backend: Scheduled job (cron) that runs weekly
- Backend: For each user, query reviews from followed users in the past 7 days
- Backend: Generate HTML email using existing mailer utility
- Backend: Track email preferences in User model (opt-out)
- **Requires**: Working SMTP config (already in .env but needs real credentials)
- **Status**: Implementation ready after SMTP is configured.

---

## What You Need To Do After Implementation

### Immediate (to go live):
1. **Register for affiliate programs** — sign up for Steam (Humble Partner), Epic (Support-A-Creator), and add your affiliate IDs to backend `.env` file
2. **Get a Steam Web API key** — https://steamcommunity.com/dev/apikey — add to `.env` as `STEAM_API_KEY`
3. **Configure SMTP for emails** — update `.env` with real Gmail app password or use a service like SendGrid/Mailgun
4. **Verify Vercel deployment** — make sure the new routes deploy correctly

### Short-term (1-2 weeks):
5. **Submit sitemap to Google Search Console** — after public pages are live, submit for indexing
6. **Add Google Analytics** — track which game pages get the most traffic
7. **Reach out to indie game devs** — offer featured placement on Dashboard

### Medium-term (1-2 months):
8. **Monitor affiliate revenue** — see which store links get clicks
9. **A/B test the "Connect Steam" flow** — measure conversion rate
10. **Build a landing page** — for non-logged-in visitors explaining what Gameboxd is
