# Contributing to Verse Wars

Thank you for your interest in contributing! This document provides guidelines for participating in this project.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to make a great game.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/verse-wars.git
   cd verse-wars
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/my-amazing-feature
   ```

## Development Workflow

### Making Changes

1. Make your changes in a feature branch
2. Test thoroughly in the browser
3. Commit with clear, descriptive messages:
   ```bash
   git commit -m "feat: Add new card type XYZ"
   ```

### Commit Message Format

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting, etc)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Tests
- `chore:` Build, dependencies, etc

Example:
```bash
git commit -m "feat: Add three new crew cards for expansion"
```

### Pull Request Process

1. Push to your fork
2. Create Pull Request with:
   - Clear title describing change
   - Description of what changed and why
   - Screenshots for UI changes
   - Reference to any related issues

3. Wait for review and respond to feedback
4. Once approved, your PR will be merged

## Areas for Contribution

### Cards & Content
- New crew, vessels, locations, events, artifacts
- Balance adjustments to existing cards
- Story references and lore improvements

### Gameplay & Features
- New game modes
- Difficulty adjustments
- New mechanics or abilities
- UI/UX improvements

### Code Quality
- Performance optimizations
- Bug fixes
- Refactoring
- Testing

### Documentation
- README improvements
- Code comments
- Developer guides
- API documentation

## Adding New Cards

1. Edit `src/utils/cardDatabase.js`
2. Add card to appropriate array (crew, vessels, etc.)
3. Include all required fields:
   - `id`: unique identifier (lowercase, underscores)
   - `name`: display name
   - `image`: emoji
   - `faction`: browncoat, alliance, independent, or threat
   - `ability`/`effect`: what it does
   - `rarity`: common to mythic
   - `storyRef`: Firefly reference
   - `description`: flavor text

4. Test in game:
   ```bash
   npm run dev
   ```

5. Commit and create PR

## Adding New Missions

1. Edit `src/utils/missionDatabase.js`
2. Add mission object with:
   - `id`: unique identifier
   - `name`: mission name
   - `objective`: what players must do
   - `requiredCards`: what cards are needed
   - `difficulty`: 1-4
   - `lore`: story context

3. Update victory logic in `VerseWars.jsx`
4. Test objective checking
5. Submit PR

## Adding New Character Classes

1. Update `andyCharacters` in `VerseWars.jsx`
2. Add:
   - Class name and image
   - Unique ability and description
   - Passive bonus
   - Color scheme
   - Inside jokes (3-5)

3. Update AI logic to handle new class
4. Test against AI opponents
5. Submit PR

## Testing Checklist

Before submitting PR, ensure:

- [ ] No console errors or warnings
- [ ] Game starts and plays normally
- [ ] Cards work as described
- [ ] AI makes reasonable plays
- [ ] Victory conditions trigger correctly
- [ ] UI looks good on desktop
- [ ] UI looks good on mobile (if UI change)
- [ ] Stats save/load correctly
- [ ] No memory leaks on long sessions

## Code Style

We follow standard React/JavaScript practices:

- Use functional components and hooks
- Clear variable names
- Comments for complex logic
- Consistent indentation (2 spaces)
- No unused imports

## Questions?

- Open an issue with your question
- Check existing issues/PRs for similar questions
- Join our community discussions

## Reward System

Contributions are rewarded with:
- Visible credit in README
- Contributor badge on GitHub
- Recognition in release notes
- Early access to new features

**Thank you for making Verse Wars better!**
