document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameScreen = document.getElementById('game-screen');
    const player = document.getElementById('player');
    const scoreValue = document.getElementById('score-value');
    const healthValue = document.getElementById('health-value');
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');


    // Touch controls
    const leftControl = document.querySelector('.left-control');
    const rightControl = document.querySelector('.right-control');
    const shootControl = document.querySelector('.shoot-control');

    // Game variables
    let score = 0;
    let health = 100;
    let gameRunning = true;
    let playerX = window.innerWidth / 2;
    let playerWidth = player.offsetWidth;
    let keys = {};
    let touchControls = {
        left: false,
        right: false
    };

    // Movement speed
    const MOVE_SPEED = 8;
    const BULLET_SPEED = 10;
    const TARGET_SPEED = 3;
    const TARGET_SPAWN_RATE = 1000; // ms

    // Event listeners for keyboard
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Event listeners for touch controls
    leftControl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.left = true;
    });

    leftControl.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.left = false;
    });

    rightControl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.right = true;
    });

    rightControl.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.right = false;
    });

    shootControl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shootBullet();
    });

    // Also allow click for desktop testing
    shootControl.addEventListener('click', (e) => {
        e.preventDefault();
        shootBullet();
    });

    // Mouse/touch movement for player
    gameScreen.addEventListener('mousemove', (e) => {
        if (gameRunning) {
            playerX = e.clientX;
            updatePlayerPosition();
        }
    });

    gameScreen.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
            const touch = e.touches[0];
            playerX = touch.clientX;
            updatePlayerPosition();
        }
    }, { passive: false });

    // Restart game
    restartBtn.addEventListener('click', restartGame);

    // Game loop
    function gameLoop() {
        if (gameRunning) {
            handlePlayerMovement();
            moveBullets();
            moveTargets();
            checkCollisions();
            requestAnimationFrame(gameLoop);
        }
    }

    // Handle player movement from keyboard and touch controls
    function handlePlayerMovement() {
        if (keys['ArrowLeft'] || touchControls.left) {
            playerX -= MOVE_SPEED;
        }
        if (keys['ArrowRight'] || touchControls.right) {
            playerX += MOVE_SPEED;
        }

        // Keep player within bounds
        playerX = Math.max(playerWidth / 2, Math.min(window.innerWidth - playerWidth / 2, playerX));

        updatePlayerPosition();

        // Auto-shoot when space is held (for desktop)
        if (keys[' ']) {
            shootBullet();
        }
    }

    function updatePlayerPosition() {
        player.style.left = `${playerX - playerWidth / 2}px`;
    }

    // Bullet functions
    function shootBullet() {
        if (!gameRunning) return;

        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = `${playerX - 4}px`;
        bullet.style.bottom = `${player.offsetHeight + 50}px`;
        gameScreen.appendChild(bullet);
    }

    function moveBullets() {
        const bullets = document.querySelectorAll('.bullet');
        bullets.forEach(bullet => {
            const currentBottom = parseInt(bullet.style.bottom);
            bullet.style.bottom = `${currentBottom + BULLET_SPEED}px`;

            // Remove bullet when it goes off screen
            if (currentBottom > window.innerHeight) {
                bullet.remove();
            }
        });
    }

    // Target functions
    function spawnTarget() {
        if (!gameRunning) return;

        const target = document.createElement('div');
        target.className = 'target';
        const xPos = Math.random() * (window.innerWidth - 40);
        target.style.left = `${xPos}px`;
        target.style.top = '-40px';
        gameScreen.appendChild(target);

        // Random speed for variety
        target.speed = TARGET_SPEED + Math.random() * 2;
    }

    function moveTargets() {
        const targets = document.querySelectorAll('.target');
        targets.forEach(target => {
            const currentTop = parseInt(target.style.top);
            target.style.top = `${currentTop + target.speed}px`;

            // Remove target when it goes off screen
            if (currentTop > window.innerHeight) {
                target.remove();
            }
        });
    }

    // Collision detection
    function checkCollisions() {
        const bullets = document.querySelectorAll('.bullet');
        const targets = document.querySelectorAll('.target');

        // Bullet-Target collisions
        bullets.forEach(bullet => {
            const bulletRect = bullet.getBoundingClientRect();

            targets.forEach(target => {
                const targetRect = target.getBoundingClientRect();

                if (
                    bulletRect.left < targetRect.right &&
                    bulletRect.right > targetRect.left &&
                    bulletRect.top < targetRect.bottom &&
                    bulletRect.bottom > targetRect.top
                ) {
                    // Collision detected
                    bullet.remove();
                    target.remove();
                    increaseScore();
                }
            });
        });

        // Player-Target collisions
        const playerRect = player.getBoundingClientRect();
        targets.forEach(target => {
            const targetRect = target.getBoundingClientRect();

            if (
                playerRect.left < targetRect.right &&
                playerRect.right > targetRect.left &&
                playerRect.top < targetRect.bottom &&
                playerRect.bottom > targetRect.top
            ) {
                // Collision with player
                target.remove();
                decreaseHealth();
            }
        });
    }

    function increaseScore() {
        score += 10;
        scoreValue.textContent = score;
    }

    function decreaseHealth() {
        health -= 10;
        healthValue.textContent = health;

        if (health <= 0) {
            gameOver();
        }
    }

    function gameOver() {
        gameRunning = false;
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    function restartGame() {
        // Clear all game elements
        document.querySelectorAll('.bullet, .target').forEach(el => el.remove());

        // Reset game state
        score = 0;
        health = 100;
        gameRunning = true;
        scoreValue.textContent = score;
        healthValue.textContent = health;

        // Hide game over screen
        gameOverScreen.style.display = 'none';

        // Restart game loop
        gameLoop();
    }

    // Start the game
    setInterval(spawnTarget, TARGET_SPAWN_RATE);
    gameLoop();

    // Handle window resize
    window.addEventListener('resize', () => {
        playerX = Math.max(playerWidth / 2, Math.min(window.innerWidth - playerWidth / 2, playerX));
        updatePlayerPosition();
    });
});
// Add to your game initialization
function initGame() {
    createPlayer();
    createStarfield();
    createGridOverlay();
}

function createPlayer() {
    const player = document.getElementById('player');

    // Add thruster
    const thruster = document.createElement('div');
    thruster.className = 'thruster';
    player.appendChild(thruster);

    // Add thruster particles
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'thruster-particle';
        particle.style.left = `${20 + Math.random() * 40}px`;
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        thruster.appendChild(particle);
    }
}

function createStarfield() {
    const gameScreen = document.getElementById('game-screen');

    // Create multiple star layers for parallax
    for (let i = 0; i < 3; i++) {
        const stars = document.createElement('div');
        stars.className = 'starfield';
        gameScreen.appendChild(stars);
    }
}

function createGridOverlay() {
    const gameScreen = document.getElementById('game-screen');
    const grid = document.createElement('div');
    grid.className = 'grid-overlay';
    gameScreen.appendChild(grid);
}