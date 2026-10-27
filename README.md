# Losers Buy Drinks 🍹🪙

A two-player trivia party game. Both players join the same room from separate browser sessions. Wrong or unanswered guesses add coins; the player with more coins buys the drinks. Alcohol is optional.

## Live Application

The game is live on Google Cloud Run:
- **Production URL**: https://losers-buy-drinks-xfn7u5yqta-uc.a.run.app
- **GitHub Repository**: https://github.com/washingtongtobia-afk/losers-buy-drinks

## Start the game locally on your Mac

1. Open **Terminal** in the project directory:
   ```bash
   npm install
   npm start
   ```
2. Open http://localhost:3000 in your browser.
3. Open a second window (incognito or on a different browser) and join with the room code.
4. After both players join, the host chooses a category and era; the guest confirms; both click Ready.
5. In Friends Should Know, both players complete their private questionnaire before taking turns guessing facts about each other.
6. On game over, the winner selects **Choose Where We’re Going**, enters a location, and the loser accepts or requests another suggestion.

## Cloud Run & Google Cloud Deployment

The application is containerized with Docker and ready for Google Cloud Run with Google Cloud Firestore persistence.

### Architecture & Persistence
- **Google Cloud Firestore (Native Mode)**: Used automatically when deployed to Cloud Run (or when `USE_FIRESTORE=true`). Rooms, player sessions, questions, and reconnection timers persist across Cloud Run container cold starts and scale-to-zero events, preserving the 30-minute reconnect window.
- **Local Fallback**: In local development and automated testing, the server automatically uses local filesystem storage (`data/rooms.json`), allowing offline work and fast test execution.
- **Request-Based Billing & Cost Optimization**: Cloud Run is configured with zero minimum instances (`--min-instances=0`) and CPU throttling enabled. The service scales to zero when inactive, incurring $0 idle cost.
- **Zero-Secret Cloud Authentication**: Authenticates with Google Cloud Firestore using the Cloud Run Service Account (`roles/datastore.user`) and Google Application Default Credentials (ADC). No secret keys or credential files are ever committed.

### Deploying to Cloud Run
```bash
gcloud run deploy losers-buy-drinks \
  --project=losers-buy-drinks \
  --region=us-central1 \
  --source=. \
  --min-instances=0 \
  --max-instances=2 \
  --concurrency=80 \
  --cpu-throttling \
  --allow-unauthenticated
```

## Rules and features

- **Movie Moments & Music Lyrics**: Separate Mixed Generations, Classic Hits (1960s–80s), Millennial Throwbacks (1990s–2000s), and New School (2010s–2020s) pools with 40+ questions each.
- **5th Grade Challenge**: 40+ general-knowledge trivia questions.
- **Friends Should Know**: Collects ten private answers per player. Each player guesses five facts about the other in turn. Unrevealed profile choices are never exposed in ordinary game-state responses.
- **Ties & Sudden Death**: Friendship ties are paired, then draw from general knowledge if needed. Long ties generate fresh paired double-challenge clues from the same bank.
- **Location Selector**: The winner proposes a meetup spot (bar, restaurant, coffee shop); the loser accepts or requests a different suggestion.
- **Disconnection & Reconnection**: When a player disconnects, the 30-second countdown pauses and the room is preserved for 30 minutes for reconnection on the same device/browser.
- **Sound & Animation**: Includes coin-drop animations and audio chimes (can be muted anytime).

## Automated Tests

Run the complete test suite locally:
```bash
npm test
```
The automated test suite verifies:
- Category and era banks and answer integrity
- Synchronization, readiness, and confirmation
- Ten-question gameplay and duplicate submission prevention
- Real 30-second question timer expiration and coin penalty
- Friendship private profiles and turn-taking privacy
- Sudden death and long tiebreaker paired clues
- Reconnection and room recovery after server restart
- Expiry after 30 minutes
- Location proposals, accept/decline responses, and rematches
