# 🐍 Snake Fun

A mobile-friendly multiplayer snake game inspired by slither.io with unique merging mechanics, collectibles, and customization options.

## 🎮 Game Features

### Core Gameplay
- **Slither.io-style Controls**: Smooth movement with joystick (mobile) or mouse (desktop)
- **Level System**: Collect pellets to grow and level up your snake
- **Snake Merging**: Merge two snakes of the same level to create a more powerful snake
- **Multiplayer Exploration**: Click "Explore" to play against other snakes from around the world (with AI bot simulation when no players are online)

### Collectibles
- **Pellets**: Collect colorful pellets to increase your snake's length and level up
- **Coins**: Gather coins scattered across the board to spend in the shop

### Progression
- **Eating Mechanics**: Eat snakes that are lower level than you to gain length and coins
- **Risk vs Reward**: Higher level snakes can eat you if you're not careful!
- **Shop System**: Use collected coins to purchase unique skins for your snakes

### Customization
- **Skin Shop**: Multiple snake skins available
  - Classic Green (Free)
  - Ocean Blue (100 coins)
  - Fire Red (100 coins)
  - Royal Purple (150 coins)
  - Golden (200 coins)
  - Rainbow (500 coins)

## 🎯 How to Play

1. **Movement**
   - Mobile: Use the on-screen joystick (bottom left)
   - Desktop: Move your mouse to guide your snake

2. **Grow Your Snake**
   - Collect colorful pellets to increase length
   - Every 20 pellets = Level up!

3. **Collect Coins**
   - Grab golden coins scattered across the map
   - Use coins to buy new skins in the shop

4. **Explore Mode**
   - Click the "🌍 Explore" button to enter multiplayer mode
   - Compete against other snakes (or AI bots when servers are quiet)

5. **Eating Mechanics**
   - You can eat snakes that are LOWER level than you
   - Avoid snakes with HIGHER levels - they can eat you!
   - Eating another snake gives you +10 length and +10 coins

6. **Merge Snakes**
   - Collect multiple snakes through gameplay
   - Merge two snakes of the same level to create a higher level snake
   - Access the merge system from the main menu

## 🚀 Getting Started

### Play Online
Simply open `index.html` in any modern web browser. The game is fully HTML5-based and works on:
- Mobile browsers (iOS Safari, Chrome, Firefox)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

### Local Setup
1. Clone this repository
```bash
git clone https://github.com/YOUR_USERNAME/snake-fun.git
cd snake-fun
```

2. Open the game
   - Double-click `index.html`, or
   - Run a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

### Deploy to GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Set source to "main" branch
4. Your game will be live at `https://YOUR_USERNAME.github.io/snake-fun/`

## 🛠️ Technology Stack

- **Pure HTML5/CSS3/JavaScript** - No frameworks required
- **Canvas API** - For smooth 2D graphics
- **Touch Events** - Native mobile support
- **LocalStorage** - Save game progress automatically

## 📱 Mobile Optimized

- Responsive design that works on all screen sizes
- Touch-optimized controls with virtual joystick
- No app installation required - just open in browser
- Can be added to home screen for app-like experience

## 🎨 Game Architecture

- `index.html` - Game structure and UI layout
- `styles.css` - All styling including responsive mobile design
- `game.js` - Complete game logic including:
  - Snake physics and movement
  - Collision detection
  - AI bot behavior
  - Shop and merge systems
  - Save/load functionality

## 🎯 Future Enhancements

- Real multiplayer with WebSocket server
- More power-ups and special abilities
- Leaderboards
- Daily challenges
- More skin varieties
- Sound effects and background music
- Achievement system

## 🤝 Contributing

Feel free to fork this project and submit pull requests! Some ideas:
- Add new skins
- Improve AI behavior
- Add new game modes
- Enhance visual effects
- Add sound effects

## 📄 License

MIT License - Feel free to use this project for learning or building your own games!

## 🎮 Controls Reference

### Mobile
- **Joystick** (bottom left): Move your snake
- **Explore Button**: Toggle multiplayer mode
- **Menu Button**: Return to main menu

### Desktop
- **Mouse Movement**: Guide your snake
- **Click Buttons**: Navigate menus and shop

---

Made with ❤️ for snake game enthusiasts worldwide!
