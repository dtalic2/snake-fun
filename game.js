// Game State
const gameState = {
    screen: 'menu',
    coins: 0,
    playerSnakes: [{ level: 1, skin: 'default' }],
    currentSnakeIndex: 0,
    selectedSkin: 'default',
    ownedSkins: ['default'],
    multiplayerMode: false
};

// Skins available in shop
const skins = [
    { id: 'default', name: 'Classic Green', color: '#27ae60', secondColor: '#1e8449', pattern: 'scales', price: 0 },
    { id: 'viper', name: 'Viper', color: '#2c3e50', secondColor: '#1a252f', pattern: 'diamond', price: 100 },
    { id: 'coral', name: 'Coral Snake', color: '#e74c3c', secondColor: '#c0392b', pattern: 'bands', price: 100 },
    { id: 'python', name: 'Python', color: '#8b6914', secondColor: '#654321', pattern: 'spots', price: 150 },
    { id: 'ocean', name: 'Ocean Blue', color: '#3498db', secondColor: '#2980b9', pattern: 'gradient', price: 150 },
    { id: 'emerald', name: 'Emerald', color: '#16a085', secondColor: '#138d75', pattern: 'scales', price: 200 },
    { id: 'tiger', name: 'Tiger Snake', color: '#f39c12', secondColor: '#d68910', pattern: 'stripes', price: 250 },
    { id: 'albino', name: 'Albino', color: '#ecf0f1', secondColor: '#d5dbdb', pattern: 'scales', price: 300 },
    { id: 'venom', name: 'Venom', color: '#8e44ad', secondColor: '#6c3483', pattern: 'hex', price: 350 },
    { id: 'lava', name: 'Lava', color: '#c0392b', secondColor: '#943126', pattern: 'cracks', price: 400 },
    { id: 'galaxy', name: 'Galaxy', color: '#2c3e50', secondColor: '#1c2833', pattern: 'stars', price: 500 },
    { id: 'rainbow', name: 'Rainbow', color: 'rainbow', secondColor: 'rainbow', pattern: 'rainbow', price: 600 },
    { id: 'blackmamba', name: 'Black Mamba', color: '#1a1a1a', secondColor: '#0a0a0a', pattern: 'smooth', price: 700 },
    { id: 'kingcobra', name: 'King Cobra', color: '#d4af37', secondColor: '#b8941e', pattern: 'cobra', price: 750 },
    { id: 'rattlesnake', name: 'Rattlesnake', color: '#8b7355', secondColor: '#6b5638', pattern: 'rattle', price: 800 },
    { id: 'anaconda', name: 'Anaconda', color: '#4a5d23', secondColor: '#3a4a1a', pattern: 'anaconda', price: 850 },
    { id: 'copperhead', name: 'Copperhead', color: '#b87333', secondColor: '#9b5c28', pattern: 'copper', price: 900 },
    { id: 'neon', name: 'Neon Glow', color: '#00ff00', secondColor: '#00cc00', pattern: 'glow', price: 950 },
    { id: 'toxic', name: 'Toxic Waste', color: '#39ff14', secondColor: '#2ecc11', pattern: 'toxic', price: 1000 },
    { id: 'ice', name: 'Ice Dragon', color: '#a0d8f1', secondColor: '#7fb3d5', pattern: 'ice', price: 1100 },
    { id: 'fire', name: 'Fire Drake', color: '#ff4500', secondColor: '#ff6347', pattern: 'flames', price: 1100 },
    { id: 'electric', name: 'Electric Eel', color: '#ffff00', secondColor: '#ffd700', pattern: 'lightning', price: 1200 },
    { id: 'shadow', name: 'Shadow Serpent', color: '#2f2f2f', secondColor: '#1f1f1f', pattern: 'shadow', price: 1300 },
    { id: 'crystal', name: 'Crystal Snake', color: '#e8f4f8', secondColor: '#b8d4e0', pattern: 'crystal', price: 1400 },
    { id: 'magma', name: 'Magma Core', color: '#ff4000', secondColor: '#cc3300', pattern: 'magma', price: 1500 }
];

// Game Canvas
let canvas, ctx;
let gameWidth, gameHeight;

// Player Snake
let player = {
    segments: [],
    level: 1,
    length: 10,
    targetX: 0,
    targetY: 0,
    angle: 0, // Current direction in radians
    speed: 3,
    skin: 'default'
};

// Game entities
let otherSnakes = [];
let pellets = [];
let coins = [];
let particles = [];

// Input
let joystickActive = false;
let joystickOrigin = { x: 0, y: 0 };
let joystickCurrent = { x: 0, y: 0 };

// Camera
let camera = { x: 0, y: 0, zoom: 1 };

// World bounds
const WORLD_SIZE = 4000;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupCanvas();
    setupEventListeners();
    updateUI();
    initializePlayer();
    spawnInitialEntities();
}

function setupCanvas() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameWidth = canvas.width;
    gameHeight = canvas.height;
}

function setupEventListeners() {
    // Menu buttons
    document.getElementById('play-btn').addEventListener('click', startGame);
    document.getElementById('shop-btn').addEventListener('click', openShop);
    document.getElementById('merge-btn').addEventListener('click', openMerge);
    document.getElementById('menu-btn').addEventListener('click', returnToMenu);
    document.getElementById('explore-btn').addEventListener('click', toggleExplore);

    // Shop
    document.getElementById('shop-close-btn').addEventListener('click', closeShop);
    renderShop();

    // Merge
    document.getElementById('merge-close-btn').addEventListener('click', closeMerge);
    document.getElementById('merge-confirm-btn').addEventListener('click', confirmMerge);

    // Joystick
    setupJoystick();

    // Mouse control for desktop
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
}

function setupJoystick() {
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('joystick-stick');

    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = joystick.getBoundingClientRect();
        joystickActive = true;
        joystickOrigin = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    });

    joystick.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();

        const touch = e.touches[0];
        const dx = touch.clientX - joystickOrigin.x;
        const dy = touch.clientY - joystickOrigin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 35;

        if (distance > maxDistance) {
            const angle = Math.atan2(dy, dx);
            joystickCurrent.x = Math.cos(angle) * maxDistance;
            joystickCurrent.y = Math.sin(angle) * maxDistance;
        } else {
            joystickCurrent.x = dx;
            joystickCurrent.y = dy;
        }

        stick.style.transform = `translate(calc(-50% + ${joystickCurrent.x}px), calc(-50% + ${joystickCurrent.y}px))`;

        // Update player target
        if (player.segments.length > 0) {
            const head = player.segments[0];
            player.targetX = head.x + dx * 10;
            player.targetY = head.y + dy * 10;
        }
    });

    joystick.addEventListener('touchend', () => {
        joystickActive = false;
        joystickCurrent = { x: 0, y: 0 };
        stick.style.transform = 'translate(-50%, -50%)';

        // Keep moving in current direction when joystick is released
        if (player.segments.length > 0) {
            const head = player.segments[0];
            player.targetX = head.x + Math.cos(player.angle) * 1000;
            player.targetY = head.y + Math.sin(player.angle) * 1000;
        }
    });
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    player.targetX = camera.x + mouseX / camera.zoom;
    player.targetY = camera.y + mouseY / camera.zoom;
}

function handleTouchMove(e) {
    if (e.target === canvas) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        player.targetX = camera.x + touchX / camera.zoom;
        player.targetY = camera.y + touchY / camera.zoom;
    }
}

function initializePlayer() {
    const startX = WORLD_SIZE / 2;
    const startY = WORLD_SIZE / 2;

    // Set level first
    player.level = gameState.playerSnakes[gameState.currentSnakeIndex].level;

    const baseRadius = 8;

    player.segments = [];
    for (let i = 0; i < player.length; i++) {
        player.segments.push({
            x: startX - i * 10,
            y: startY,
            radius: baseRadius
        });
    }
    // Initialize with angle pointing right
    player.angle = 0;
    player.targetX = startX + 100;
    player.targetY = startY;
    player.skin = gameState.selectedSkin;
}

function spawnInitialEntities() {
    // Spawn pellets
    pellets = [];
    for (let i = 0; i < 200; i++) {
        spawnPellet();
    }

    // Spawn coins
    coins = [];
    for (let i = 0; i < 50; i++) {
        spawnCoin();
    }

    // Spawn other snakes (bots) - always spawn some
    otherSnakes = [];
    for (let i = 0; i < 60; i++) {
        spawnBotSnake();
    }
}

function spawnPellet() {
    pellets.push({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: 8 + Math.random() * 6,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        xpValue: 1
    });
}

function spawnCoin() {
    coins.push({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: 8,
        rotation: 0,
        value: 1
    });
}

function spawnBotSnake() {
    const level = Math.floor(Math.random() * 8) + 1; // Levels 1-8
    const length = 15 + level * 6; // Longer snakes
    const segments = [];
    const startX = Math.random() * WORLD_SIZE;
    const startY = Math.random() * WORLD_SIZE;

    for (let i = 0; i < length; i++) {
        segments.push({
            x: startX - i * 10,
            y: startY,
            radius: 8
        });
    }

    otherSnakes.push({
        segments,
        level,
        angle: Math.random() * Math.PI * 2, // Random starting angle
        targetX: startX + (Math.random() - 0.5) * 500,
        targetY: startY + (Math.random() - 0.5) * 500,
        speed: 2 + Math.random() * 1.5, // Varied speeds
        skin: skins[Math.floor(Math.random() * skins.length)].id,
        isBot: true,
        changeTargetTimer: 0
    });
}

function startGame() {
    switchScreen('game');
    initializePlayer();
    gameLoop();
}

function toggleExplore() {
    gameState.multiplayerMode = !gameState.multiplayerMode;

    if (gameState.multiplayerMode) {
        document.getElementById('explore-btn').textContent = '🌍 Exploring...';
        document.getElementById('explore-btn').style.background = '#e67e22';

        // Spawn many bot snakes to simulate multiplayer
        for (let i = 0; i < 50; i++) {
            spawnBotSnake();
        }
    } else {
        document.getElementById('explore-btn').textContent = '🌍 Explore';
        document.getElementById('explore-btn').style.background = '#27ae60';
        // Remove snakes that are far away, keep nearby ones
        otherSnakes = otherSnakes.filter(snake => {
            if (snake.segments.length === 0) return false;
            const head = snake.segments[0];
            const playerHead = player.segments[0];
            if (!playerHead) return false;
            const dx = head.x - playerHead.x;
            const dy = head.y - playerHead.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 1000; // Keep snakes within 1000 units
        });
    }
}

function openShop() {
    switchScreen('shop');
    renderShop();
}

function closeShop() {
    switchScreen('menu');
}

function renderShop() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';

    skins.forEach(skin => {
        const item = document.createElement('div');
        item.className = 'shop-item';

        if (gameState.ownedSkins.includes(skin.id)) {
            item.classList.add('owned');
        }
        if (gameState.selectedSkin === skin.id) {
            item.classList.add('selected');
        }

        const color = skin.color === 'linear'
            ? 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
            : skin.color;

        item.innerHTML = `
            <div class="skin-preview">
                <div class="skin-color" style="background: ${color}"></div>
            </div>
            <div class="skin-name">${skin.name}</div>
            <div class="skin-price">${gameState.ownedSkins.includes(skin.id) ? 'Owned' : `${skin.price} coins`}</div>
        `;

        item.addEventListener('click', () => {
            if (gameState.ownedSkins.includes(skin.id)) {
                gameState.selectedSkin = skin.id;
                player.skin = skin.id;
                renderShop();
            } else if (gameState.coins >= skin.price) {
                gameState.coins -= skin.price;
                gameState.ownedSkins.push(skin.id);
                gameState.selectedSkin = skin.id;
                player.skin = skin.id;
                updateUI();
                renderShop();
            } else {
                alert('Not enough coins!');
            }
        });

        shopItems.appendChild(item);
    });

    document.getElementById('shop-coins-display').textContent = gameState.coins;
}

function openMerge() {
    switchScreen('merge');
    renderMergeScreen();
}

function closeMerge() {
    switchScreen('menu');
}

let mergeSlots = [null, null];

function renderMergeScreen() {
    const container = document.getElementById('merge-slots');
    container.innerHTML = '';

    mergeSlots = [null, null];

    for (let i = 0; i < 2; i++) {
        const slot = document.createElement('div');
        slot.className = 'merge-slot';
        slot.innerHTML = `
            <div class="merge-slot-label">Slot ${i + 1}</div>
            <div class="snake-icon">🐍</div>
        `;

        slot.addEventListener('click', () => selectSnakeForMerge(i));
        container.appendChild(slot);
    }

    document.getElementById('merge-confirm-btn').disabled = true;
}

function selectSnakeForMerge(slotIndex) {
    if (gameState.playerSnakes.length < 2) {
        alert('You need at least 2 snakes to merge!');
        return;
    }

    // Simple selection: pick available snakes
    const availableSnakes = gameState.playerSnakes.filter((_, idx) =>
        !mergeSlots.includes(idx)
    );

    if (availableSnakes.length === 0) return;

    const snakeIdx = gameState.playerSnakes.indexOf(availableSnakes[0]);
    mergeSlots[slotIndex] = snakeIdx;

    const slots = document.querySelectorAll('.merge-slot');
    slots[slotIndex].classList.add('filled');
    slots[slotIndex].innerHTML = `
        <div class="merge-slot-label">Slot ${slotIndex + 1}</div>
        <div class="snake-icon">🐍</div>
        <div class="snake-level">Level ${gameState.playerSnakes[snakeIdx].level}</div>
    `;

    // Check if can merge
    if (mergeSlots[0] !== null && mergeSlots[1] !== null) {
        const snake1 = gameState.playerSnakes[mergeSlots[0]];
        const snake2 = gameState.playerSnakes[mergeSlots[1]];

        if (snake1.level === snake2.level) {
            document.getElementById('merge-confirm-btn').disabled = false;
        } else {
            document.getElementById('merge-confirm-btn').disabled = true;
            alert('Snakes must be the same level to merge!');
        }
    }
}

function confirmMerge() {
    if (mergeSlots[0] === null || mergeSlots[1] === null) return;

    const snake1 = gameState.playerSnakes[mergeSlots[0]];
    const snake2 = gameState.playerSnakes[mergeSlots[1]];

    if (snake1.level !== snake2.level) {
        alert('Snakes must be the same level!');
        return;
    }

    // Create new merged snake
    const newSnake = {
        level: snake1.level + 1,
        skin: snake1.skin
    };

    // Remove old snakes
    const indices = [mergeSlots[0], mergeSlots[1]].sort((a, b) => b - a);
    indices.forEach(idx => gameState.playerSnakes.splice(idx, 1));

    // Add new snake
    gameState.playerSnakes.push(newSnake);

    alert(`Merged! Created Level ${newSnake.level} snake!`);
    updateUI();
    closeMerge();
}

function returnToMenu() {
    // Save current progress
    gameState.playerSnakes[gameState.currentSnakeIndex].level = player.level;
    switchScreen('menu');
    updateUI();
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screenName}-screen`).classList.add('active');
    gameState.screen = screenName;
}

function updateUI() {
    document.getElementById('coins-display').textContent = gameState.coins;
    document.getElementById('game-coins').textContent = gameState.coins;
    document.getElementById('snakes-count').textContent = gameState.playerSnakes.length;
    document.getElementById('player-level').textContent = player.level;
    document.getElementById('player-length').textContent = player.segments.length;
}

// Game Loop
let lastTime = 0;
function gameLoop(timestamp = 0) {
    if (gameState.screen !== 'game') return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    updatePlayer(dt);
    updateOtherSnakes(dt);
    updateCoins(dt);
    updatePellets(dt);
    updateCamera();
    checkCollisions();

    // Spawn more entities if needed
    while (pellets.length < 200) spawnPellet();
    while (coins.length < 50) spawnCoin();

    // Maintain snake population
    const targetSnakeCount = gameState.multiplayerMode ? 150 : 80;
    while (otherSnakes.length < targetSnakeCount) {
        spawnBotSnake();
    }
}

function updatePlayer(dt) {
    if (player.segments.length === 0) return;

    const head = player.segments[0];

    // Calculate desired angle based on target position
    const dx = player.targetX - head.x;
    const dy = player.targetY - head.y;
    const targetAngle = Math.atan2(dy, dx);

    // Smoothly rotate towards target angle
    const turnSpeed = 0.08; // How fast the snake can turn
    let angleDiff = targetAngle - player.angle;

    // Normalize angle difference to -PI to PI range
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Apply turning
    player.angle += angleDiff * turnSpeed;

    // Move continuously in current direction
    const moveX = Math.cos(player.angle) * player.speed;
    const moveY = Math.sin(player.angle) * player.speed;

    // Move head
    const newHead = {
        x: head.x + moveX,
        y: head.y + moveY,
        radius: head.radius
    };

    // Keep within world bounds
    newHead.x = Math.max(0, Math.min(WORLD_SIZE, newHead.x));
    newHead.y = Math.max(0, Math.min(WORLD_SIZE, newHead.y));

    player.segments.unshift(newHead);

    // Keep segments at correct length
    if (player.segments.length > player.length) {
        player.segments.pop();
    }

    // Update segments to follow
    for (let i = 1; i < player.segments.length; i++) {
        const prev = player.segments[i - 1];
        const current = player.segments[i];
        const segDx = prev.x - current.x;
        const segDy = prev.y - current.y;
        const segDist = Math.sqrt(segDx * segDx + segDy * segDy);

        const targetDist = 8;
        if (segDist > targetDist) {
            const ratio = (segDist - targetDist) / segDist;
            current.x += segDx * ratio * 0.5;
            current.y += segDy * ratio * 0.5;
        }
    }
}

function updateOtherSnakes(dt) {
    otherSnakes.forEach(snake => {
        if (snake.segments.length === 0) return;

        // Bot AI: change target periodically
        snake.changeTargetTimer -= dt;
        if (snake.changeTargetTimer <= 0) {
            snake.targetX = snake.segments[0].x + (Math.random() - 0.5) * 600;
            snake.targetY = snake.segments[0].y + (Math.random() - 0.5) * 600;
            snake.targetX = Math.max(0, Math.min(WORLD_SIZE, snake.targetX));
            snake.targetY = Math.max(0, Math.min(WORLD_SIZE, snake.targetY));
            snake.changeTargetTimer = 1500 + Math.random() * 2500;
        }

        const head = snake.segments[0];

        // Use angle-based movement like player
        const dx = snake.targetX - head.x;
        const dy = snake.targetY - head.y;
        const targetAngle = Math.atan2(dy, dx);

        // Smooth turning
        const turnSpeed = 0.06 + Math.random() * 0.03; // Slightly varied turn speed
        let angleDiff = targetAngle - snake.angle;

        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        snake.angle += angleDiff * turnSpeed;

        // Move continuously
        const moveX = Math.cos(snake.angle) * snake.speed;
        const moveY = Math.sin(snake.angle) * snake.speed;

        const newHead = {
            x: head.x + moveX,
            y: head.y + moveY,
            radius: head.radius
        };

        newHead.x = Math.max(0, Math.min(WORLD_SIZE, newHead.x));
        newHead.y = Math.max(0, Math.min(WORLD_SIZE, newHead.y));

        snake.segments.unshift(newHead);

        if (snake.segments.length > 15 + snake.level * 6) {
            snake.segments.pop();
        }

        // Smooth follow logic
        for (let i = 1; i < snake.segments.length; i++) {
            const prev = snake.segments[i - 1];
            const current = snake.segments[i];
            const segDx = prev.x - current.x;
            const segDy = prev.y - current.y;
            const segDist = Math.sqrt(segDx * segDx + segDy * segDy);

            const targetDist = 7;
            if (segDist > targetDist) {
                const ratio = (segDist - targetDist) / segDist;
                current.x += segDx * ratio * 0.5;
                current.y += segDy * ratio * 0.5;
            }
        }
    });
}

function updateCoins(dt) {
    coins.forEach(coin => {
        coin.rotation += 0.05;
    });
}

function updatePellets(dt) {
    if (player.segments.length === 0) return;
    const head = player.segments[0];
    const MAGNETIC_RADIUS = 150;
    const MAGNETIC_SPEED = 4;

    pellets.forEach(pellet => {
        const dx = head.x - pellet.x;
        const dy = head.y - pellet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAGNETIC_RADIUS && distance > 0) {
            // Pull strength increases as pellet gets closer
            const strength = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_SPEED;
            pellet.x += (dx / distance) * strength;
            pellet.y += (dy / distance) * strength;
        }
    });
}

function updateCamera() {
    if (player.segments.length > 0) {
        const head = player.segments[0];

        // Zoom out as snake gets longer
        const targetZoom = Math.max(0.45, 1.0 - (player.segments.length - 10) * 0.004);
        camera.zoom += (targetZoom - camera.zoom) * 0.05; // Smooth lerp

        // Center camera on head, accounting for zoom
        camera.x = head.x - (gameWidth / 2) / camera.zoom;
        camera.y = head.y - (gameHeight / 2) / camera.zoom;
    }
}

function checkCollisions() {
    if (player.segments.length === 0) return;

    const head = player.segments[0];

    // Check pellet collisions
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        const dx = head.x - pellet.x;
        const dy = head.y - pellet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < head.radius + pellet.radius) {
            pellets.splice(i, 1);

            // Increase length
            player.length += 1;

            // Level up with EVERY pellet and increase size
            player.level++;

            updateUI();
        }
    }

    // Check coin collisions
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const dx = head.x - coin.x;
        const dy = head.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < head.radius + coin.radius) {
            coins.splice(i, 1);
            gameState.coins += coin.value;
            updateUI();
        }
    }

    // Check snake eating (player eating others)
    for (let i = otherSnakes.length - 1; i >= 0; i--) {
        const otherSnake = otherSnakes[i];
        if (otherSnake.segments.length === 0) continue;

        // Check collision against every segment of the other snake
        let hit = false;
        for (let j = 0; j < otherSnake.segments.length; j++) {
            const seg = otherSnake.segments[j];
            const dx = head.x - seg.x;
            const dy = head.y - seg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < head.radius + seg.radius) {
                hit = true;
                break;
            }
        }

        if (hit) {
            // Can only eat snakes of lower level
            if (player.level > otherSnake.level) {
                otherSnakes.splice(i, 1);

                // Rewards scale with eaten snake's level
                const lengthGain = 10 + otherSnake.level * 3;
                const coinGain = 10 + otherSnake.level * 5;
                const levelGain = Math.floor(otherSnake.level / 2);

                player.length += lengthGain;
                gameState.coins += coinGain;

                // Gain levels based on eaten snake's level
                if (levelGain > 0) {
                    player.level += levelGain;
                }

                updateUI();
            } else if (player.level < otherSnake.level) {
                // Player got eaten - respawn
                alert('You were eaten! Respawning...');
                initializePlayer();
                return;
            }
        }
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Apply camera zoom and offset
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    const cullMargin = 50 / camera.zoom;
    const viewLeft = camera.x - cullMargin;
    const viewRight = camera.x + gameWidth / camera.zoom + cullMargin;
    const viewTop = camera.y - cullMargin;
    const viewBottom = camera.y + gameHeight / camera.zoom + cullMargin;

    // Draw grid
    drawGrid();

    // Draw pellets
    pellets.forEach(pellet => {
        if (pellet.x > viewLeft && pellet.x < viewRight && pellet.y > viewTop && pellet.y < viewBottom) {
            ctx.fillStyle = pellet.color;
            ctx.beginPath();
            ctx.arc(pellet.x, pellet.y, pellet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw coins
    coins.forEach(coin => {
        if (coin.x > viewLeft && coin.x < viewRight && coin.y > viewTop && coin.y < viewBottom) {
            ctx.save();
            ctx.translate(coin.x, coin.y);
            ctx.rotate(coin.rotation);

            ctx.fillStyle = '#f39c12';
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);

            ctx.restore();
        }
    });

    // Draw other snakes
    otherSnakes.forEach(snake => {
        drawSnake(snake, false);
    });

    // Draw player snake
    drawSnake(player, true);

    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    const viewW = gameWidth / camera.zoom;
    const viewH = gameHeight / camera.zoom;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;

    for (let x = startX; x < camera.x + viewW; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, camera.y);
        ctx.lineTo(x, camera.y + viewH);
        ctx.stroke();
    }

    for (let y = startY; y < camera.y + viewH; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(camera.x, y);
        ctx.lineTo(camera.x + viewW, y);
        ctx.stroke();
    }
}

function buildSnakePath(segments) {
    // Build a smooth path through segment centers using quadratic bezier curves
    if (segments.length < 2) return null;
    const path = new Path2D();
    path.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length - 1; i++) {
        const midX = (segments[i].x + segments[i + 1].x) / 2;
        const midY = (segments[i].y + segments[i + 1].y) / 2;
        path.quadraticCurveTo(segments[i].x, segments[i].y, midX, midY);
    }
    const last = segments[segments.length - 1];
    path.lineTo(last.x, last.y);
    return path;
}

function drawSnake(snake, isPlayer) {
    if (snake.segments.length === 0) return;
    const skin = skins.find(s => s.id === snake.skin) || skins[0];

    let baseColor = skin.color;
    let secondColor = skin.secondColor || skin.color;
    if (skin.color === 'rainbow') {
        const hue = Date.now() / 50 % 360;
        baseColor = `hsl(${hue}, 70%, 50%)`;
        secondColor = `hsl(${(hue + 30) % 360}, 70%, 45%)`;
    }

    const bodyWidth = snake.segments[0].radius * 2;

    // Draw smooth continuous body as layered strokes
    if (snake.segments.length >= 2) {
        const path = buildSnakePath(snake.segments);

        // Layer 1: Drop shadow
        ctx.save();
        ctx.translate(3, 3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = bodyWidth + 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.stroke(path);
        ctx.restore();

        // Layer 2: Dark outline/edge
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = bodyWidth + 4;
        ctx.strokeStyle = secondColor;
        ctx.stroke(path);

        // Layer 3: Main body color
        ctx.lineWidth = bodyWidth;
        ctx.strokeStyle = baseColor;
        ctx.stroke(path);

        // Layer 4: Specular highlight (thinner, offset upward)
        ctx.save();
        ctx.translate(0, -bodyWidth * 0.15);
        ctx.lineWidth = bodyWidth * 0.45;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke(path);
        ctx.restore();

        // Layer 5: Top shine (very thin bright line)
        ctx.save();
        ctx.translate(0, -bodyWidth * 0.25);
        ctx.lineWidth = bodyWidth * 0.15;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke(path);
        ctx.restore();

        // Belly stripe: lighter ventral underside (realistic snake belly)
        ctx.save();
        ctx.translate(0, bodyWidth * 0.18);
        ctx.lineWidth = bodyWidth * 0.38;
        ctx.strokeStyle = 'rgba(255, 245, 210, 0.22)';
        ctx.stroke(path);
        ctx.restore();

        // Tail taper: gradually narrow to a pointed tip
        const taperCount = Math.min(Math.floor(snake.segments.length * 0.25) + 3, 22);
        for (let i = 0; i < taperCount; i++) {
            const seg = snake.segments[snake.segments.length - 1 - i];
            const t = i / Math.max(1, taperCount - 1); // 0 at tip, 1 at body junction
            const r = (bodyWidth / 2) * Math.pow(t, 0.55);
            if (r < 0.5) continue;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, r + 1.5, 0, Math.PI * 2);
            ctx.fillStyle = secondColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, r, 0, Math.PI * 2);
            ctx.fillStyle = baseColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(seg.x - r * 0.1, seg.y - r * 0.25, r * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fill();
        }

        // Draw pattern overlay on body segments
        if (skin.pattern !== 'smooth' && skin.pattern !== 'rainbow') {
            const radius = bodyWidth / 2;
            for (let i = 1; i < snake.segments.length; i++) {
                const seg = snake.segments[i];
                let segAngle = 0;
                if (i > 0) {
                    const prev = snake.segments[i - 1];
                    segAngle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
                }
                drawSnakePattern(skin.pattern, seg.x, seg.y, radius, baseColor, secondColor, i, segAngle);
            }
        }
    }

    // Draw head
    const head = snake.segments[0];
    const angle = snake.angle !== undefined ? snake.angle : Math.atan2(snake.targetY - head.y, snake.targetX - head.x);

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);

    const headLength = head.radius * 1.55;
    const headWidth = head.radius * 1.15;

    // Helper: trace a pointed/triangular snake head shape (snout toward +X)
    const traceHead = (dx, dy) => {
        const hl = headLength, hw = headWidth;
        ctx.beginPath();
        ctx.moveTo(dx + hl, dy); // snout tip
        // Upper jaw: curves wide then back
        ctx.bezierCurveTo(dx + hl * 0.3, dy - hw * 1.05, dx - hl * 0.2, dy - hw * 1.15, dx - hl * 0.5, dy - hw * 0.88);
        // Back of head (rounded)
        ctx.bezierCurveTo(dx - hl * 0.72, dy - hw * 0.32, dx - hl * 0.72, dy + hw * 0.32, dx - hl * 0.5, dy + hw * 0.88);
        // Lower jaw: back to snout
        ctx.bezierCurveTo(dx - hl * 0.2, dy + hw * 1.15, dx + hl * 0.3, dy + hw * 1.05, dx + hl, dy);
        ctx.closePath();
    };

    // Head shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    traceHead(3, 3);
    ctx.fill();

    // Head body with gradient
    const headGradient = ctx.createLinearGradient(0, -headWidth * 1.2, 0, headWidth * 1.2);
    headGradient.addColorStop(0, secondColor);
    headGradient.addColorStop(0.3, baseColor);
    headGradient.addColorStop(0.7, baseColor);
    headGradient.addColorStop(1, secondColor);
    ctx.fillStyle = headGradient;
    traceHead(0, 0);
    ctx.fill();

    // Head highlight
    const headHighlight = ctx.createRadialGradient(headLength * 0.1, -headWidth * 0.4, 0, 0, 0, headWidth * 1.3);
    headHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    headHighlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    headHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = headHighlight;
    traceHead(0, 0);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    traceHead(0, 0);
    ctx.stroke();

    // Eyes - positioned on the sides of the triangular head
    const eyeOffsetX = headLength * 0.12;
    const eyeOffsetY = headWidth * 0.72;
    const eyeRadius = 4.0;

    // Left eye white
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left pupil - vertical slit (realistic snake eye)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX + 0.8, -eyeOffsetY, 1.3, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left eye glint
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeOffsetX + 2.0, -eyeOffsetY - 1.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Right eye white
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right pupil - vertical slit
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX + 0.8, eyeOffsetY, 1.3, 2.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye glint
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eyeOffsetX + 2.0, eyeOffsetY - 1.5, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils - small pits near the snout tip
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(headLength * 0.72, -headWidth * 0.3, 1.5, 1.0, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headLength * 0.72, headWidth * 0.3, 1.5, 1.0, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Forked tongue
    const tongueLength = 12;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headLength - 2, 0);
    ctx.lineTo(headLength + tongueLength, 0);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headLength + tongueLength, 0);
    ctx.lineTo(headLength + tongueLength + 4, -3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headLength + tongueLength, 0);
    ctx.lineTo(headLength + tongueLength + 4, 3);
    ctx.stroke();

    ctx.restore();

    // Draw level indicator
    if (isPlayer) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(`Lv.${snake.level}`, head.x, head.y - head.radius - 18);
        ctx.fillText(`Lv.${snake.level}`, head.x, head.y - head.radius - 18);
    } else {
        ctx.fillStyle = snake.level > player.level ? '#e74c3c' : '#95a5a6';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${snake.level}`, head.x, head.y - head.radius - 14);
    }
}

function drawSnakePattern(pattern, x, y, radius, baseColor, secondColor, segmentIndex, angle) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);

    const r = radius;

    switch (pattern) {
        case 'scales': {
            if (segmentIndex % 2 === 0) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, -r * 0.2, r * 0.35, 0.2, Math.PI - 0.2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, r * 0.2, r * 0.35, -Math.PI + 0.2, -0.2);
                ctx.stroke();
            }
            break;
        }

        case 'diamond': {
            if (segmentIndex % 3 === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.moveTo(-r * 0.6, 0);
                ctx.lineTo(0, -r * 0.5);
                ctx.lineTo(r * 0.6, 0);
                ctx.lineTo(0, r * 0.5);
                ctx.closePath();
                ctx.fill();
            }
            break;
        }

        case 'bands': {
            if (segmentIndex % 4 < 2) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
                ctx.fill();
            }
            if (segmentIndex % 8 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 200, 0.25)';
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }

        case 'spots': {
            if (segmentIndex % 3 === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.beginPath();
                ctx.ellipse(0, -r * 0.15, r * 0.35, r * 0.28, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
            if (segmentIndex % 3 === 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.beginPath();
                ctx.arc(r * 0.15, r * 0.2, r * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }

        case 'gradient': {
            const shimmer = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
            shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
            shimmer.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
            ctx.fillStyle = shimmer;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        case 'stripes': {
            if (segmentIndex % 2 === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fillRect(-r * 0.15, -r, r * 0.3, r * 2);
            }
            break;
        }

        case 'hex': {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const nx = Math.cos(a) * r * 0.55;
                const ny = Math.sin(a) * r * 0.55;
                if (i === 0) ctx.moveTo(nx, ny);
                else ctx.lineTo(nx, ny);
            }
            ctx.closePath();
            ctx.stroke();
            break;
        }

        case 'cracks': {
            if (segmentIndex % 2 === 0) {
                ctx.strokeStyle = 'rgba(255, 160, 0, 0.9)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.7, -r * 0.3);
                ctx.lineTo(0, r * 0.1);
                ctx.lineTo(r * 0.5, -r * 0.4);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 220, 50, 0.6)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-r * 0.3, r * 0.4);
                ctx.lineTo(r * 0.2, 0);
                ctx.lineTo(r * 0.7, r * 0.3);
                ctx.stroke();
            }
            break;
        }

        case 'stars': {
            const seed = segmentIndex * 137;
            for (let i = 0; i < 4; i++) {
                const hash = (seed + i * 53) % 100;
                const sx = (((hash * 7) % 100) / 100 - 0.5) * r * 1.2;
                const sy = (((hash * 13) % 100) / 100 - 0.5) * r * 1.2;
                const brightness = 0.4 + ((hash * 3) % 60) / 100;
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.8 + (hash % 3) * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }

        case 'cobra': {
            if (segmentIndex % 3 === 0) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.5, -r * 0.4);
                ctx.lineTo(0, r * 0.3);
                ctx.lineTo(r * 0.5, -r * 0.4);
                ctx.stroke();
            }
            break;
        }

        case 'rattle': {
            if (segmentIndex % 2 === 0) {
                ctx.fillStyle = 'rgba(100, 60, 20, 0.4)';
                ctx.beginPath();
                ctx.moveTo(-r * 0.5, 0);
                ctx.lineTo(0, -r * 0.55);
                ctx.lineTo(r * 0.5, 0);
                ctx.lineTo(0, r * 0.55);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(200, 170, 100, 0.3)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
            break;
        }

        case 'anaconda': {
            if (segmentIndex % 4 === 0) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fill();
            }
            if (segmentIndex % 4 === 2) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(0, r * 0.15, r * 0.18, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }

        case 'copper': {
            if (segmentIndex % 3 === 0) {
                ctx.fillStyle = 'rgba(100, 50, 10, 0.4)';
                ctx.beginPath();
                ctx.moveTo(-r * 0.7, -r * 0.6);
                ctx.lineTo(0, -r * 0.1);
                ctx.lineTo(r * 0.7, -r * 0.6);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-r * 0.7, r * 0.6);
                ctx.lineTo(0, r * 0.1);
                ctx.lineTo(r * 0.7, r * 0.6);
                ctx.fill();
            }
            break;
        }

        case 'glow': {
            const pulse = 0.3 + Math.sin(Date.now() / 300 + segmentIndex * 0.5) * 0.15;
            const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.4);
            glow.addColorStop(0, `rgba(0, 255, 0, ${pulse})`);
            glow.addColorStop(0.6, `rgba(0, 255, 0, ${pulse * 0.3})`);
            glow.addColorStop(1, 'rgba(0, 255, 0, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        case 'toxic': {
            if (segmentIndex % 2 === 0) {
                const bubbleAlpha = 0.4 + Math.sin(Date.now() / 400 + segmentIndex) * 0.2;
                ctx.fillStyle = `rgba(50, 220, 20, ${bubbleAlpha})`;
                ctx.beginPath();
                ctx.arc(-r * 0.25, -r * 0.3, r * 0.18, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(r * 0.2, r * 0.2, r * 0.14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(150, 255, 50, 0.3)';
                ctx.beginPath();
                ctx.arc(r * 0.1, -r * 0.1, r * 0.08, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }

        case 'ice': {
            if (segmentIndex % 2 === 0) {
                ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    const a = (i / 3) * Math.PI + segmentIndex * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15);
                    ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
                    ctx.stroke();
                    const bx = Math.cos(a) * r * 0.45;
                    const by = Math.sin(a) * r * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(a + 0.8) * r * 0.15, by + Math.sin(a + 0.8) * r * 0.15);
                    ctx.stroke();
                }
            }
            break;
        }

        case 'flames': {
            if (segmentIndex % 2 === 0) {
                const flicker = Math.sin(Date.now() / 200 + segmentIndex * 2) * 0.15;
                ctx.fillStyle = `rgba(255, 120, 0, ${0.4 + flicker})`;
                ctx.beginPath();
                ctx.moveTo(-r * 0.3, r * 0.3);
                ctx.quadraticCurveTo(-r * 0.1, -r * 0.5, r * 0.1, r * 0.1);
                ctx.quadraticCurveTo(r * 0.3, -r * 0.6, r * 0.4, r * 0.3);
                ctx.fill();
                ctx.fillStyle = `rgba(255, 200, 50, ${0.3 + flicker})`;
                ctx.beginPath();
                ctx.moveTo(0, r * 0.2);
                ctx.quadraticCurveTo(r * 0.05, -r * 0.3, r * 0.2, r * 0.1);
                ctx.fill();
            }
            break;
        }

        case 'lightning': {
            if (segmentIndex % 3 === 0) {
                ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.6, -r * 0.2);
                ctx.lineTo(-r * 0.15, r * 0.1);
                ctx.lineTo(0, -r * 0.15);
                ctx.lineTo(r * 0.3, r * 0.3);
                ctx.lineTo(r * 0.6, -r * 0.1);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 255, 200, 0.2)';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            break;
        }

        case 'shadow': {
            if (segmentIndex % 3 === 0) {
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(-r * 0.2, -r * 0.1, r * 0.4, r * 0.25, 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(r * 0.15, r * 0.15, r * 0.3, r * 0.2, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            break;
        }

        case 'crystal': {
            if (segmentIndex % 2 === 0) {
                ctx.strokeStyle = 'rgba(180, 220, 240, 0.5)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + segmentIndex * 0.2;
                    const fx = Math.cos(a) * r * 0.5;
                    const fy = Math.sin(a) * r * 0.5;
                    if (i === 0) ctx.moveTo(fx, fy);
                    else ctx.lineTo(fx, fy);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(-r * 0.3, -r * 0.15);
                ctx.lineTo(r * 0.3, r * 0.15);
                ctx.stroke();
            }
            break;
        }

        case 'magma': {
            if (segmentIndex % 2 === 0) {
                ctx.strokeStyle = 'rgba(255, 80, 0, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-r * 0.6, -r * 0.2);
                ctx.quadraticCurveTo(-r * 0.1, r * 0.3, r * 0.5, -r * 0.1);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255, 200, 50, 0.5)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-r * 0.3, r * 0.3);
                ctx.quadraticCurveTo(r * 0.1, -r * 0.2, r * 0.6, r * 0.2);
                ctx.stroke();
            }
            break;
        }
    }

    ctx.restore();
}

// Save game state
window.addEventListener('beforeunload', () => {
    localStorage.setItem('snakeFunSave', JSON.stringify(gameState));
});

// Load game state
const savedState = localStorage.getItem('snakeFunSave');
if (savedState) {
    try {
        const loaded = JSON.parse(savedState);
        Object.assign(gameState, loaded);
        updateUI();
    } catch (e) {
        console.error('Failed to load save:', e);
    }
}
