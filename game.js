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
    { id: 'default', name: 'Classic Green', color: '#27ae60', pattern: 'scales', price: 0 },
    { id: 'viper', name: 'Viper', color: '#2c3e50', pattern: 'diamond', price: 100 },
    { id: 'coral', name: 'Coral Snake', color: '#e74c3c', pattern: 'bands', price: 100 },
    { id: 'python', name: 'Python', color: '#8b6914', pattern: 'spots', price: 150 },
    { id: 'ocean', name: 'Ocean Blue', color: '#3498db', pattern: 'gradient', price: 150 },
    { id: 'emerald', name: 'Emerald', color: '#16a085', pattern: 'scales', price: 200 },
    { id: 'tiger', name: 'Tiger Snake', color: '#f39c12', pattern: 'stripes', price: 250 },
    { id: 'albino', name: 'Albino', color: '#ecf0f1', pattern: 'scales', price: 300 },
    { id: 'venom', name: 'Venom', color: '#8e44ad', pattern: 'hex', price: 350 },
    { id: 'lava', name: 'Lava', color: '#c0392b', pattern: 'cracks', price: 400 },
    { id: 'galaxy', name: 'Galaxy', color: '#2c3e50', pattern: 'stars', price: 500 },
    { id: 'rainbow', name: 'Rainbow', color: 'rainbow', pattern: 'rainbow', price: 600 }
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
let camera = { x: 0, y: 0 };

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
    });
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    player.targetX = camera.x + mouseX;
    player.targetY = camera.y + mouseY;
}

function handleTouchMove(e) {
    if (e.target === canvas) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        player.targetX = camera.x + touchX;
        player.targetY = camera.y + touchY;
    }
}

function initializePlayer() {
    const startX = WORLD_SIZE / 2;
    const startY = WORLD_SIZE / 2;

    player.segments = [];
    for (let i = 0; i < player.length; i++) {
        player.segments.push({
            x: startX - i * 10,
            y: startY,
            radius: 8 + i * 0.2
        });
    }
    player.targetX = startX;
    player.targetY = startY;
    player.level = gameState.playerSnakes[gameState.currentSnakeIndex].level;
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

    // Spawn other snakes (bots)
    otherSnakes = [];
}

function spawnPellet() {
    pellets.push({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: 5,
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
    const level = Math.floor(Math.random() * 5) + 1;
    const length = 10 + level * 5;
    const segments = [];
    const startX = Math.random() * WORLD_SIZE;
    const startY = Math.random() * WORLD_SIZE;

    for (let i = 0; i < length; i++) {
        segments.push({
            x: startX - i * 10,
            y: startY,
            radius: 8 + i * 0.2
        });
    }

    otherSnakes.push({
        segments,
        level,
        targetX: startX + (Math.random() - 0.5) * 500,
        targetY: startY + (Math.random() - 0.5) * 500,
        speed: 2 + Math.random(),
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

        // Spawn bot snakes to simulate multiplayer
        for (let i = 0; i < 10; i++) {
            spawnBotSnake();
        }
    } else {
        document.getElementById('explore-btn').textContent = '🌍 Explore';
        document.getElementById('explore-btn').style.background = '#27ae60';
        otherSnakes = [];
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
    updateCamera();
    checkCollisions();

    // Spawn more entities if needed
    while (pellets.length < 200) spawnPellet();
    while (coins.length < 50) spawnCoin();
}

function updatePlayer(dt) {
    if (player.segments.length === 0) return;

    const head = player.segments[0];
    const dx = player.targetX - head.x;
    const dy = player.targetY - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
        const moveX = (dx / distance) * player.speed;
        const moveY = (dy / distance) * player.speed;

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
}

function updateOtherSnakes(dt) {
    otherSnakes.forEach(snake => {
        if (snake.segments.length === 0) return;

        // Bot AI: change target periodically
        snake.changeTargetTimer -= dt;
        if (snake.changeTargetTimer <= 0) {
            snake.targetX = snake.segments[0].x + (Math.random() - 0.5) * 500;
            snake.targetY = snake.segments[0].y + (Math.random() - 0.5) * 500;
            snake.targetX = Math.max(0, Math.min(WORLD_SIZE, snake.targetX));
            snake.targetY = Math.max(0, Math.min(WORLD_SIZE, snake.targetY));
            snake.changeTargetTimer = 2000 + Math.random() * 3000;
        }

        const head = snake.segments[0];
        const dx = snake.targetX - head.x;
        const dy = snake.targetY - head.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            const moveX = (dx / distance) * snake.speed;
            const moveY = (dy / distance) * snake.speed;

            const newHead = {
                x: head.x + moveX,
                y: head.y + moveY,
                radius: head.radius
            };

            newHead.x = Math.max(0, Math.min(WORLD_SIZE, newHead.x));
            newHead.y = Math.max(0, Math.min(WORLD_SIZE, newHead.y));

            snake.segments.unshift(newHead);

            if (snake.segments.length > 10 + snake.level * 5) {
                snake.segments.pop();
            }

            // Simple follow logic
            for (let i = 1; i < snake.segments.length; i++) {
                const prev = snake.segments[i - 1];
                const current = snake.segments[i];
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
    });
}

function updateCoins(dt) {
    coins.forEach(coin => {
        coin.rotation += 0.05;
    });
}

function updateCamera() {
    if (player.segments.length > 0) {
        const head = player.segments[0];
        camera.x = head.x - gameWidth / 2;
        camera.y = head.y - gameHeight / 2;
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
            player.length += 1;

            // Each pellet gives XP and levels up every 10 pellets
            if (player.length % 10 === 0) {
                player.level++;
            }
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

        const otherHead = otherSnake.segments[0];
        const dx = head.x - otherHead.x;
        const dy = head.y - otherHead.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < head.radius + otherHead.radius) {
            // Can only eat snakes of lower level
            if (player.level > otherSnake.level) {
                otherSnakes.splice(i, 1);
                player.length += 10;
                gameState.coins += 10;
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

    // Draw grid
    drawGrid();

    // Draw pellets
    pellets.forEach(pellet => {
        const screenX = pellet.x - camera.x;
        const screenY = pellet.y - camera.y;

        if (screenX > -50 && screenX < gameWidth + 50 && screenY > -50 && screenY < gameHeight + 50) {
            ctx.fillStyle = pellet.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, pellet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw coins
    coins.forEach(coin => {
        const screenX = coin.x - camera.x;
        const screenY = coin.y - camera.y;

        if (screenX > -50 && screenX < gameWidth + 50 && screenY > -50 && screenY < gameHeight + 50) {
            ctx.save();
            ctx.translate(screenX, screenY);
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
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;

    for (let x = startX; x < camera.x + gameWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - camera.x, 0);
        ctx.lineTo(x - camera.x, gameHeight);
        ctx.stroke();
    }

    for (let y = startY; y < camera.y + gameHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y - camera.y);
        ctx.lineTo(gameWidth, y - camera.y);
        ctx.stroke();
    }
}

function drawSnake(snake, isPlayer) {
    const skin = skins.find(s => s.id === snake.skin) || skins[0];

    // Draw body with patterns
    for (let i = snake.segments.length - 1; i >= 0; i--) {
        const segment = snake.segments[i];
        const screenX = segment.x - camera.x;
        const screenY = segment.y - camera.y;

        if (screenX > -50 && screenX < gameWidth + 50 && screenY > -50 && screenY < gameHeight + 50) {
            // Get base color
            let baseColor = skin.color;
            if (skin.color === 'rainbow') {
                const hue = (i * 30) % 360;
                baseColor = `hsl(${hue}, 70%, 50%)`;
            }

            // Draw main body
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(screenX, screenY, segment.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw pattern overlay
            drawSnakePattern(skin.pattern, screenX, screenY, segment.radius, baseColor, i);

            // Draw belly (lighter underside)
            const bellyGradient = ctx.createRadialGradient(screenX, screenY + 2, 0, screenX, screenY, segment.radius);
            bellyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            bellyGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
            bellyGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = bellyGradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, segment.radius, 0, Math.PI * 2);
            ctx.fill();

            // Outline for definition
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(screenX, screenY, segment.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Draw head with eyes and details
    if (snake.segments.length > 0) {
        const head = snake.segments[0];
        const screenX = head.x - camera.x;
        const screenY = head.y - camera.y;

        // Draw tongue
        const angle = Math.atan2(snake.targetY - head.y, snake.targetX - head.x);
        const tongueLength = 12;
        const tongueX = screenX + Math.cos(angle) * head.radius;
        const tongueY = screenY + Math.sin(angle) * head.radius;

        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tongueX, tongueY);
        const forkOffset = 3;
        ctx.lineTo(tongueX + Math.cos(angle) * tongueLength, tongueY + Math.sin(angle) * tongueLength);
        ctx.stroke();

        // Fork of tongue
        ctx.lineWidth = 1.5;
        const forkAngle1 = angle - 0.3;
        const forkAngle2 = angle + 0.3;
        const forkX = tongueX + Math.cos(angle) * tongueLength;
        const forkY = tongueY + Math.sin(angle) * tongueLength;

        ctx.beginPath();
        ctx.moveTo(forkX, forkY);
        ctx.lineTo(forkX + Math.cos(forkAngle1) * forkOffset, forkY + Math.sin(forkAngle1) * forkOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(forkX, forkY);
        ctx.lineTo(forkX + Math.cos(forkAngle2) * forkOffset, forkY + Math.sin(forkAngle2) * forkOffset);
        ctx.stroke();

        // Eyes with slit pupils (snake-like)
        const eyeAngle = angle + Math.PI / 2;
        const eyeDistance = 4;
        const eye1X = screenX + Math.cos(eyeAngle) * eyeDistance;
        const eye1Y = screenY + Math.sin(eyeAngle) * eyeDistance;
        const eye2X = screenX - Math.cos(eyeAngle) * eyeDistance;
        const eye2Y = screenY - Math.sin(eyeAngle) * eyeDistance;

        // Eye whites
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Slit pupils
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eye1X, eye1Y - 3);
        ctx.lineTo(eye1X, eye1Y + 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eye2X, eye2Y - 3);
        ctx.lineTo(eye2X, eye2Y + 3);
        ctx.stroke();

        // Eye outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 4, 0, Math.PI * 2);
        ctx.stroke();

        // Draw level indicator
        if (isPlayer) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.strokeText(`Lv.${snake.level}`, screenX, screenY - head.radius - 15);
            ctx.fillText(`Lv.${snake.level}`, screenX, screenY - head.radius - 15);
        } else {
            ctx.fillStyle = snake.level > player.level ? '#e74c3c' : '#95a5a6';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Lv.${snake.level}`, screenX, screenY - head.radius - 12);
        }
    }
}

function drawSnakePattern(pattern, x, y, radius, baseColor, segmentIndex) {
    ctx.save();

    switch (pattern) {
        case 'scales':
            // Hexagonal scales
            for (let row = -1; row <= 1; row++) {
                for (let col = -1; col <= 1; col++) {
                    const scaleX = x + col * 6;
                    const scaleY = y + row * 6 + (col % 2) * 3;
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.arc(scaleX, scaleY, 3, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            break;

        case 'diamond':
            // Diamond pattern
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            if (segmentIndex % 3 === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y - radius * 0.6);
                ctx.lineTo(x + radius * 0.4, y);
                ctx.lineTo(x, y + radius * 0.6);
                ctx.lineTo(x - radius * 0.4, y);
                ctx.closePath();
                ctx.fill();
            }
            break;

        case 'bands':
            // Horizontal bands
            if (segmentIndex % 4 === 0 || segmentIndex % 4 === 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            if (segmentIndex % 12 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'spots':
            // Spotted pattern
            if (segmentIndex % 2 === 0) {
                const spots = 3;
                for (let i = 0; i < spots; i++) {
                    const angle = (i / spots) * Math.PI * 2;
                    const spotX = x + Math.cos(angle) * radius * 0.5;
                    const spotY = y + Math.sin(angle) * radius * 0.5;
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.beginPath();
                    ctx.arc(spotX, spotY, radius * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            break;

        case 'gradient':
            // Gradient overlay
            const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'stripes':
            // Tiger stripes
            if (segmentIndex % 2 === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(x - radius, y - radius * 0.3, radius * 2, radius * 0.2);
                ctx.fillRect(x - radius, y + radius * 0.3, radius * 2, radius * 0.2);
            }
            break;

        case 'hex':
            // Hexagonal pattern
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const hx = x + Math.cos(angle) * radius * 0.6;
                const hy = y + Math.sin(angle) * radius * 0.6;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(hx, hy, 2, 0, Math.PI * 2);
                ctx.stroke();
            }
            break;

        case 'cracks':
            // Lava cracks
            ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
            ctx.lineWidth = 1.5;
            if (segmentIndex % 3 === 0) {
                ctx.beginPath();
                ctx.moveTo(x - radius, y);
                ctx.lineTo(x + radius, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x, y + radius);
                ctx.stroke();
            }
            break;

        case 'stars':
            // Galaxy stars
            if (segmentIndex % 4 === 0) {
                for (let i = 0; i < 3; i++) {
                    const sx = x + (Math.random() - 0.5) * radius;
                    const sy = y + (Math.random() - 0.5) * radius;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            break;

        case 'rainbow':
            // Rainbow already handled in main color
            break;
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
