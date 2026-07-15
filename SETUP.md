# Development Setup Guide

Complete guide to get Verse Wars running locally for development.

## Prerequisites

- **Node.js** 14.0.0 or higher
  - Download: https://nodejs.org/
  - Verify: `node --version` and `npm --version`

- **Git** 2.0.0 or higher
  - Download: https://git-scm.com/
  - Verify: `git --version`

- **Code Editor** (recommended)
  - VS Code: https://code.visualstudio.com/
  - WebStorm: https://www.jetbrains.com/webstorm/
  - Vim, Sublime Text, etc also work

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/verse-wars.git

# Navigate to project directory
cd verse-wars
```

## Step 2: Install Dependencies

```bash
# Install Node packages
npm install

# This installs:
# - React 18
# - React DOM
# - Vite (build tool)
# - Tailwind CSS
# - Lucide React (icons)
```

### Troubleshooting Installation

**Issue**: `npm ERR! 404 Not Found`
- Solution: Check internet connection, verify package names

**Issue**: `node_modules` permission error
- Solution: 
  ```bash
  sudo chown -R $(whoami) .npm
  rm -rf node_modules package-lock.json
  npm install
  ```

**Issue**: Different Node versions between machines
- Solution: Use nvm (Node Version Manager)
  ```bash
  nvm install 18
  nvm use 18
  npm install
  ```

## Step 3: Start Development Server

```bash
# Start Vite dev server
npm run dev

# Server opens automatically at http://localhost:3000
# Hot module replacement (HMR) enabled - changes reload instantly
```

## Step 4: Open in Browser

Navigate to `http://localhost:3000`

The game should load and be playable immediately.

## Development Workflow

### Making Code Changes

1. Edit files in `src/` directory
2. Save changes
3. Browser auto-refreshes with new changes
4. Console shows any errors/warnings

### Viewing Changes Across Devices

Access dev server from other devices on same network:

```bash
# Find your machine's IP address

# macOS/Linux:
ifconfig | grep inet

# Windows:
ipconfig

# On other device, visit:
http://YOUR_IP:3000
```

## Project Structure Explained

```
verse-wars/
├── index.html              # HTML entry point
├── package.json           # Project metadata & dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS customization
├── postcss.config.js      # PostCSS configuration
│
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Root component
│   ├── VerseWars.jsx     # Main game component
│   ├── index.css         # Global styles
│   │
│   ├── utils/
│   │   ├── cardDatabase.js      # All card definitions
│   │   └── missionDatabase.js   # All mission definitions
│   │
│   └── hooks/             # Custom React hooks (future)
│
├── public/               # Static assets (future)
└── dist/                # Production build (created by `npm run build`)
```

## Building for Production

```bash
# Create optimized production build
npm run build

# Output goes to `dist/` directory
# Ready to deploy to hosting service

# Preview production build locally
npm run preview
```

## Debugging Tips

### Browser DevTools

1. **Open DevTools**: F12 or Right-click → Inspect
2. **Check Console** for JavaScript errors
3. **Check Network** tab for failed requests
4. **React DevTools Extension** (Chrome/Firefox)
   - Install extension
   - Inspect React component tree
   - Check state and props

### Console Logging

```javascript
// In VerseWars.jsx or other components
console.log('Game state:', gameState);
console.log('Current player:', players[currentPlayerIndex]);
console.log('Deck remaining:', deck.length);
```

### React Profiler

```javascript
// Profile render performance
import { Profiler } from 'react';

<Profiler id="VerseWars" onRender={onRenderCallback}>
  <VerseWars />
</Profiler>
```

## Common Development Tasks

### Adding a New Card

1. Open `src/utils/cardDatabase.js`
2. Add to `cardDatabase.crew/vessels/locations/events/artifacts`
3. Hot reload shows it immediately
4. Test it in-game

### Testing a Mission

1. Edit `startGame()` in `VerseWars.jsx`
2. Force specific mission:
   ```javascript
   setMission(getMissionById('mission_tam_rescue'));
   ```
3. Play and verify logic

### Testing AI Difficulty

1. Start single-player game
2. Try each difficulty level
3. Check `console.log()` in `getAIMove()`
4. Adjust strategy thresholds

### Performance Testing

```javascript
// In browser console
performance.mark('game-start');
// ... play game ...
performance.mark('game-end');
performance.measure('game', 'game-start', 'game-end');
console.table(performance.getEntriesByType('measure'));
```

## Environment Variables

Create `.env` file in project root (optional):

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

Access in code:

```javascript
const debugMode = import.meta.env.VITE_DEBUG;
```

## Testing Locally on Mobile

### Using ngrok (tunnel service)

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Get public URL and visit on phone
```

### Using local network

```bash
# Start dev server
npm run dev

# On mobile, visit: http://YOUR_COMPUTER_IP:3000
```

## Useful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**: dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense**: bradlc.vscode-tailwindcss
- **Prettier**: esbenp.prettier-vscode
- **ESLint**: dbaeumer.vscode-eslint
- **Thunder Client** (API testing): rangav.vscode-thunder-client

## Git Workflow for Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: Add my feature"

# Push to fork
git push origin feature/my-feature

# Create Pull Request on GitHub
```

## Troubleshooting Common Issues

### Port 3000 Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Hot Reload Not Working

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Styles Not Applying

1. Check if Tailwind classes are correct
2. Verify no conflicting CSS
3. Clear browser cache: Ctrl+Shift+Delete
4. Restart dev server

### Build Fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Getting Help

1. **Check existing issues**: https://github.com/yourusername/verse-wars/issues
2. **Open new issue**: Describe problem and steps to reproduce
3. **Check documentation**: README.md, CONTRIBUTING.md
4. **Ask in discussions**: GitHub Discussions

## Performance Optimization Tips

- Use React DevTools Profiler to find bottlenecks
- Memoize expensive components with `React.memo()`
- Use `useCallback()` for event handlers
- Lazy load components if needed
- Monitor localStorage usage

## Next Steps

1. Familiarize yourself with the codebase
2. Read through `cardDatabase.js` to understand card structure
3. Try adding a new card
4. Try modifying an existing card's stats
5. Review the main `VerseWars.jsx` component
6. Check out open issues for contribution opportunities

Happy developing! 🚀
