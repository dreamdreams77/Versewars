# ⚔️ VERSE WARS

A strategic, narrative-driven card game inspired by Firefly universe lore and game mechanics like Fluxx. Built with React for modern browser gameplay with deep customization and AI opponents.

## 🎮 Overview

**Verse Wars** is an advanced deck-building strategy game where players compete to control the Cortex through crew recruitment, vessel acquisition, location control, and artifact collection. The game integrates Firefly canon deeply—every card references show lore, characters have canonical abilities, and missions mirror the show's central conflicts.

### Core Features

- **4 Playable Character Classes** with unique abilities and playstyles
- **Dynamic Mission System** - 5 story-driven objectives pulled from Firefly canon
- **AI Opponents** with 3 difficulty levels (Easy, Normal, Hard)
- **Single-player & Multiplayer** modes (2-4 players)
- **Persistent Statistics** - Browser-based save system
- **Narrative Integration** - Story log tracks game events as Firefly lore
- **Developer-Friendly Customization** - Modular card system, easy to extend
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
git clone https://github.com/yourusername/verse-wars.git
cd verse-wars
npm install
npm start
```

The game opens at `http://localhost:3000`

## 📋 Game Rules

### Objective
Control the Cortex by recruiting crew, acquiring vessels, claiming locations, and collecting artifacts. Complete your assigned mission before opponents complete theirs.

### Setup
1. **Choose Game Mode**: Single-player vs AI or Multiplayer
2. **Select Character Class** (if single-player):
   - Captain: Strategic control and card manipulation
   - Engineer: Repair and sabotage abilities
   - Outlaw: Theft and evasion specialist
   - Smuggler: Resource generation and deals
3. **Draw Mission**: Random mission assigned (Rescue the Tams, Uncover Miranda, etc.)
4. **Deal Starting Hand**: 5 cards to each player

### Turn Structure
1. **Draw Phase**: Draw cards based on current rules
2. **Play Phase**: Play cards to your battlefield
3. **Ability Phase**: Optionally activate class ability (if available)
4. **End Phase**: Pass turn to next player

### Card Types

**Crew** (⚔️)
- Characters from Firefly universe
- Each has unique ability and faction alignment
- Deployed to your crew zone
- Multiple copies available

**Vessels** (🚀)
- Ships with health and armor stats
- Only one per player at a time
- Provide faction bonuses and special effects

**Locations** (🗺️)
- Territorial control mechanic
- Some offer instant win conditions (Miranda)
- Generate resources or modify rules

**Events** (⚡)
- One-time effects affecting all players
- Can be blocked by opponents
- Reference canonical Firefly moments

**Artifacts** (✨)
- Powerful persistent effects
- Hidden information mechanic
- Limited quantity in deck

### Victory Conditions

**Primary**: Complete your assigned mission
- Gather required crew/vessels/artifacts
- Control specified locations
- Achieve mission objective

**Instant Win**: Control Miranda location (draws 5 cards, triggers victory)

**Alternative**: Last player with cards remaining (if deck exhausted)

## 🎯 Character Classes

### Captain 🎖️
**Ability**: Strategic Command  
Redirect any action or swap two cards between players once per turn

**Passive**: +1 card draw per turn  
**Playstyle**: Control-focused, manipulative  
**Best Against**: Aggressive strategies

### Engineer 🔧
**Ability**: Brilliant Fix  
Repair any vessel or permanently sabotage an opponent's card

**Passive**: Vessels cost 1 less; repairs heal 20% extra  
**Playstyle**: Resource management, defensive  
**Best Against**: Damage-heavy opponents

### Outlaw 🚁
**Ability**: Smooth Escape  
Steal any card from the table or evade all attacks this turn

**Passive**: First attack evaded; immune to rule changes  
**Playstyle**: Disruptive, theft-based  
**Best Against**: Card-heavy opponents

### Smuggler 💼
**Ability**: Black Market Deal  
Draw 2 extra cards + play 1 free, or force entire hand swap

**Passive**: Hidden resource (secret card draw each turn)  
**Playstyle**: Economy-focused, negotiation  
**Best Against**: Balanced strategies

## 🎲 Game Modes

### Single Player vs AI
- Fight up to 3 AI opponents
- Three difficulty levels adjust AI strategy
- Win counter and streak tracking
- Solo mode for learning and practice

### Multiplayer (2-4 Players)
- Pass-and-play on single device
- Network play not implemented (future feature)
- Designed for local play sessions

## 📊 Statistics & Progression

Stats saved to browser localStorage:
- Total wins/losses
- Current win streak
- Games played
- Missions completed
- Class-specific stats (future)

Access via `localStorage.getItem('verseWarsStats')`

## 🛠️ Architecture

### Project Structure
```
verse-wars/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx          # Main game UI
│   │   ├── ClassSelector.jsx      # Character selection
│   │   ├── CardDisplay.jsx        # Card rendering
│   │   └── StoryLog.jsx           # Narrative display
│   ├── hooks/
│   │   ├── useGameState.js        # Central game logic
│   │   ├── useAIPlayer.js         # AI decision engine
│   │   └── useCardDatabase.js     # Card data management
│   ├── utils/
│   │   ├── cardDatabase.js        # Card definitions
│   │   ├── missionDatabase.js     # Mission data
│   │   └── gameRules.js           # Rule engine
│   ├── App.jsx
│   └── index.css
├── public/
│   └── index.html
├── package.json
├── .env.example
└── README.md
```

### Key Components

**GameBoard.jsx**  
Main React component managing:
- Game state (setup, playing, won)
- Player turns and phase management
- Card rendering and interactions
- UI layout and styling

**useGameState Hook**  
Centralized state management for:
- Players and their properties
- Deck and hand management
- Battlefield/table state
- Mission tracking
- Galactic state variables

**useAIPlayer Hook**  
AI logic implementing:
- Card evaluation function
- Strategy pattern selection
- Difficulty-based decision making
- Turn execution and timing

**cardDatabase.js**  
Complete card definitions organized by type:
- 10 Crew members with abilities
- 4 Vessels with stats
- 5 Locations with effects
- 6 Events with mechanics
- 5 Artifacts with special powers

## 🔧 Development Guide

### Adding New Cards

1. Open `src/utils/cardDatabase.js`
2. Add to appropriate category:

```javascript
{
  id: 'unique_id',
  name: 'Card Name',
  image: '🎭',
  faction: 'browncoat',  // or 'alliance', 'independent', 'threat'
  ability: 'Ability Name',
  effect: 'Effect description',
  rarity: 'epic',  // common, uncommon, rare, epic, legendary, mythic
  storyRef: 'Quote from show'
}
```

3. Import in component and test

### Adding New Missions

1. Open `src/utils/missionDatabase.js`
2. Create mission object:

```javascript
{
  id: 'mission_id',
  name: 'Mission Name',
  image: '🎯',
  objective: 'What players must accomplish',
  reward: 100,  // XP/points
  turns: 10,    // suggested turn limit
  lore: 'Story context from show'
}
```

3. Add logic to endTurn() for victory detection

### Adding New Character Classes

1. Open `src/components/ClassSelector.jsx`
2. Add to `andyCharacters` object:

```javascript
newclass: {
  name: 'Name',
  image: '🔑',
  class: 'newclass',
  ability: 'Ability Name',
  description: 'What it does',
  passive: 'Passive bonus',
  color: 'from-color-600 to-color-700',
  textColor: 'color',
  lore: 'Character flavor text',
  jokes: ['joke1', 'joke2', 'joke3']
}
```

3. Update AI decision logic in `useAIPlayer.js`

### Extending AI Difficulty

Edit `useAIPlayer.js`:

```javascript
const getAIMove = (playerHand, isHardMode) => {
  if (isHardMode) {
    // Hard: prioritize mission completion
    // Block opponent strategies
    // Manage resources aggressively
  } else if (isNormalMode) {
    // Normal: balanced approach
    // Some blocking, some offense
  } else {
    // Easy: mostly random
    // Occasional good plays
  }
}
```

## 🎨 Customization

### Theme Colors
Edit `src/index.css` for Tailwind customization:

```css
/* Change primary colors */
@layer theme {
  :root {
    --color-primary: #06b6d4;  /* cyan */
    --color-accent: #a855f7;   /* purple */
  }
}
```

### Card Styling
Modify component classes in `GameBoard.jsx`:
```jsx
<div className="bg-gradient-to-br from-cyan-500 to-cyan-600">
  {/* Card content */}
</div>
```

### Game Balance
Adjust in `src/utils/gameRules.js`:
- Starting hand size
- Cards per turn
- Mission difficulty
- AI decision weights

## 🐛 Known Issues & Limitations

- Network multiplayer not implemented (local play only)
- No undo/replay system
- Mobile UI could be more optimized for small screens
- AI doesn't use some advanced strategies
- Card animations limited to hover effects

## 🚀 Roadmap

**Phase 2 (v1.1)**
- [ ] Undo/redo system
- [ ] Replay viewer
- [ ] Advanced AI strategies
- [ ] Card animations and sounds
- [ ] Mobile UI optimization

**Phase 3 (v1.2)**
- [ ] Network multiplayer (WebSocket)
- [ ] User accounts and rankings
- [ ] Deck building mode
- [ ] Campaign/progression system
- [ ] Custom rule sets

**Phase 4 (v2.0)**
- [ ] Real-time multiplayer
- [ ] Tournament system
- [ ] Streaming integration
- [ ] Mobile app (React Native)
- [ ] Full Firefly universe expansion

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Android Chrome)

## 🎓 Learning Resources

### For Players
- Read tooltips on cards for ability descriptions
- Check story log for game events
- Experiment with different class builds
- Study opponent strategies in AI matches

### For Developers
- Components use React Hooks (useState, useEffect, useCallback)
- CSS via Tailwind (no build step needed)
- Game logic separated into custom hooks
- Card data structure designed for extensibility
- localStorage for persistence

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎬 Inspiration & Credits

- **Firefly**: Created by Joss Whedon
- **Fluxx**: Card game mechanics by Andrew Looney
- **React**: JavaScript UI library by Facebook
- **Tailwind CSS**: Utility-first CSS framework

## 📧 Support & Feedback

Found a bug? Have a suggestion?  
Open an issue on GitHub or reach out to the development team.

---

**Built with ❤️ for Firefly fans and strategic card game enthusiasts**

*May the odds be ever in your favor... or may they just roll the dice.*
