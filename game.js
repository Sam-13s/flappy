const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const jumpBtn = document.getElementById('jump-btn');
const soundBtn = document.getElementById('sound-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreDisplay = document.getElementById('score-display');
const gameOverDiv = document.getElementById('game-over');
const finalScoreP = document.getElementById('final-score');
const finalHighscoreP = document.getElementById('final-highscore');
const gameUI = document.getElementById('game-ui');
const startScreen = document.getElementById('start-screen');
const startGameBtn = document.getElementById('start-game-btn');

// Set base canvas dimensions
canvas.width = 400;
canvas.height = 600;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Calculate scale factor for responsiveness
let scale = Math.min(canvas.clientWidth / WIDTH, canvas.clientHeight / HEIGHT);

function updateScale() {
    scale = Math.min(canvas.clientWidth / WIDTH, canvas.clientHeight / HEIGHT);
}

// Update scale on window resize
window.addEventListener('resize', updateScale);

// Colors
const BLUE = '#87CEEB';
const GREEN = '#00C800';
const WHITE = '#FFFFFF';
const YELLOW = '#FFFF00';

// Levels
const levels = [
    { score_threshold: 0, pipe_speed: 4, pipe_gap: 160, bg_color: BLUE },
    { score_threshold: 5, pipe_speed: 5, pipe_gap: 140, bg_color: '#ADD8E6' },
    { score_threshold: 10, pipe_speed: 6, pipe_gap: 120, bg_color: '#FFB6C1' },
    { score_threshold: 15, pipe_speed: 7, pipe_gap: 100, bg_color: '#90EE90' }
];

// Game variables
let bird_x = 80;
let bird_y = 300;
let bird_vel = 0;
let gravity = 0.5;
let jump = -8;
let bird_size = 35;

let pipes = [];
let coins = [];
let score = 0;
let current_level = 0;
let pipe_speed = 4;
let pipe_gap = 160;
let bg_color = BLUE;

let running = false;
let paused = false;
let game_over = false;
let soundMuted = false;

let high_score = 0;

// Load bird image
let birdImage = new Image();
birdImage.src = 'bird.svg';

// Load background music
let bgMusic = new Audio('game-music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5; // Adjust volume as needed

// Functions
function newPipe() {
    const h = Math.random() * 300 + 150;
    const pipe = [
        { x: WIDTH, y: h, width: 60, height: HEIGHT - h },
        { x: WIDTH, y: 0, width: 60, height: h - pipe_gap }
    ];
    // Add coin randomly
    if (Math.random() < 0.3) {
        coins.push({
            x: WIDTH + 30 - 7.5,
            y: h - pipe_gap / 2 - 7.5,
            width: 15,
            height: 15
        });
    }
    return pipe;
}

function resetGame() {
    bird_y = 300;
    bird_vel = 0;
    pipes = [newPipe()];
    coins = [];
    score = 0;
    current_level = 0;
    pipe_speed = 4;
    pipe_gap = 160;
    bg_color = BLUE;
    running = true;
    paused = false;
    game_over = false;
    gameOverDiv.style.display = 'none';
    pauseBtn.disabled = false;
    if (!soundMuted) {
        bgMusic.play();
    }
}

function updateLevel() {
    for (let i = levels.length - 1; i >= 0; i--) {
        if (score >= levels[i].score_threshold) {
            current_level = i;
            pipe_speed = levels[i].pipe_speed;
            pipe_gap = levels[i].pipe_gap;
            bg_color = levels[i].bg_color;
            break;
        }
    }
}

function draw() {
    ctx.save();
    ctx.scale(scale, scale);

    ctx.fillStyle = bg_color;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 80, 40, 0, Math.PI * 2);
    ctx.arc(160, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 120, 25, 0, Math.PI * 2);
    ctx.arc(325, 120, 35, 0, Math.PI * 2);
    ctx.arc(355, 120, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);

    // Draw grass on ground
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < WIDTH; i += 10) {
        ctx.fillRect(i, HEIGHT - 20, 5, 10);
    }

    // Draw bird
    const angle = Math.min(Math.max(bird_vel * 3, -30), 30) * Math.PI / 180;
    ctx.save();
    ctx.translate(bird_x + bird_size / 2, bird_y + bird_size / 2);
    ctx.rotate(angle);
    ctx.drawImage(birdImage, -bird_size / 2, -bird_size / 2, bird_size, bird_size);
    ctx.restore();

    // Draw pipes
    ctx.fillStyle = GREEN;
    pipes.forEach(pipe => {
        pipe.forEach(p => {
            ctx.fillRect(p.x, p.y, p.width, p.height);
        });
    });

    // Draw coins
    ctx.fillStyle = YELLOW;
    coins.forEach(coin => {
        ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
    });

    // Draw score and level
    ctx.fillStyle = WHITE;
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${current_level + 1}`, 10, 60);

    ctx.restore();
}

function update() {
    if (!running || paused || game_over) return;

    // Bird movement
    bird_vel += gravity;
    bird_y += bird_vel;

    // Pipes
    pipes.forEach(pipe => {
        pipe.forEach(p => {
            p.x -= pipe_speed;
        });
    });

    // Coins
    coins.forEach(coin => {
        coin.x -= pipe_speed;
    });

    // Remove off-screen pipes and coins
    if (pipes.length > 0 && pipes[0][0].x < -60) {
        pipes.shift();
        pipes.push(newPipe());
        score++;
        updateLevel();
    }

    coins = coins.filter(coin => coin.x > -15);

    // Collision detection
    const bird_rect = { x: bird_x, y: bird_y, width: bird_size, height: bird_size };

    // Pipe collision
    for (let pipe of pipes) {
        for (let p of pipe) {
            if (bird_rect.x < p.x + p.width &&
                bird_rect.x + bird_rect.width > p.x &&
                bird_rect.y < p.y + p.height &&
                bird_rect.y + bird_rect.height > p.y) {
                gameOver();
                return;
            }
        }
    }

    // Coin collision
    coins = coins.filter(coin => {
        if (bird_rect.x < coin.x + coin.width &&
            bird_rect.x + bird_rect.width > coin.x &&
            bird_rect.y < coin.y + coin.height &&
            bird_rect.y + bird_rect.height > coin.y) {
            score += 5;
            updateLevel();
            return false;
        }
        return true;
    });

    // Boundary collision
    if (bird_y < 0 || bird_y > HEIGHT) {
        gameOver();
        return;
    }

    updateDisplay();
}

function gameOver() {
    running = false;
    game_over = true;
    if (score > high_score) {
        high_score = score;
        localStorage.setItem('flappy_highscore', high_score);
    }
    finalScoreP.textContent = `Final Score: ${score}`;
    finalHighscoreP.textContent = `High Score: ${high_score}`;
    gameOverDiv.style.display = 'block';
    pauseBtn.disabled = true;
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score} | Level: ${current_level + 1} | High Score: ${high_score}`;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
startGameBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameUI.style.display = 'flex';
    scoreDisplay.style.display = 'block';
    resetGame();
});

pauseBtn.addEventListener('click', () => {
    paused = !paused;
    const icon = pauseBtn.querySelector('i');
    icon.className = paused ? 'fas fa-play' : 'fas fa-pause';
    if (paused || soundMuted) {
        bgMusic.pause();
    } else {
        bgMusic.play();
    }
});

playAgainBtn.addEventListener('click', resetGame);

jumpBtn.addEventListener('click', () => {
    if (running && !game_over && !paused) {
        bird_vel = jump;
    }
});

soundBtn.addEventListener('click', () => {
    soundMuted = !soundMuted;
    const icon = soundBtn.querySelector('i');
    icon.className = soundMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    if (soundMuted) {
        bgMusic.pause();
    } else if (running && !paused) {
        bgMusic.play();
    }
});

restartBtn.addEventListener('click', () => {
    // Reset to start screen
    running = false;
    paused = false;
    game_over = false;
    gameOverDiv.style.display = 'none';
    gameUI.style.display = 'none';
    scoreDisplay.style.display = 'none';
    startScreen.style.display = 'block';
    bgMusic.pause();
    bgMusic.currentTime = 0;
});

// Touch controls for mobile
document.addEventListener('touchstart', (e) => {
    if (running && !game_over && !paused) {
        e.preventDefault();
        bird_vel = jump;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!running && !game_over) {
            resetGame();
        } else if (running && !game_over) {
            bird_vel = jump;
        } else if (game_over) {
            resetGame();
        }
    }
});

// Initialize
high_score = parseInt(localStorage.getItem('flappy_highscore')) || 0;
startScreen.style.display = 'block';
gameUI.style.display = 'none';
scoreDisplay.style.display = 'none';
updateDisplay();
gameLoop();
