// Cosmic Pong - Pong (Optimized)
// © Cosmic Pong Created by NXH

// ==== DOM ELEMENTS ====
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const difficultySelect = document.getElementById('difficulty');
const pointsToWinInput = document.getElementById('pointsToWin');
const settingsDropdown = document.getElementById('settings-dropdown');
const settingsForm = document.getElementById('settingsForm');
const playerScoreSpan = document.getElementById('playerScore');
const aiScoreSpan = document.getElementById('aiScore');
const playerPointsSpan = document.getElementById('playerPoints');
const targetPointsDisplay = document.getElementById('targetPointsDisplay');
const winnerMsg = document.getElementById('winnerMsg');

// ==== GAME CONSTANTS ====
const COLORS = {
    ball: "#1e90ff",
    paddle: "#fff",
    aiPaddle: "#4a6fa5",
    table: "#20232b",
    net: "#444e5c",
    shadow: "#222",
};
const PADDLE = { width: 13, height: 95, edgeGap: 18 };
const BALL = {
    radius: 13,
    minAngle: 0.18 * Math.PI,
    maxAngle: 0.82 * Math.PI,
    maxSpeed: 16 // Added a max speed to prevent the game from getting too fast
};
const DIFFICULTY = {
    easy:   { aiSpeed: 4, ballSpeed: 6 },
    medium: { aiSpeed: 6.5, ballSpeed: 7.5 },
    hard:   { aiSpeed: 9.5, ballSpeed: 10 }
};

// ==== GAME STATE ====
let playerScore = 0, aiScore = 0, playerPoints = 0;
let leftPaddle, rightPaddle, ball;
let gameStarted = false, gameOver = false;
let difficulty = "medium", pointsToWin = 7;
let serveTo = null, serveAnnouncement = "", serveTimer = 0;

// ==== INIT FUNCTIONS ====
function initPaddles() {
    leftPaddle = {
        x: PADDLE.edgeGap,
        y: canvas.height / 2 - PADDLE.height / 2,
        width: PADDLE.width,
        height: PADDLE.height,
        color: COLORS.paddle
    };
    rightPaddle = {
        x: canvas.width - PADDLE.edgeGap - PADDLE.width,
        y: canvas.height / 2 - PADDLE.height / 2,
        width: PADDLE.width,
        height: PADDLE.height,
        color: COLORS.aiPaddle
    };
}
function initBall() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: BALL.radius,
        speed: DIFFICULTY[difficulty].ballSpeed,
        velocityX: DIFFICULTY[difficulty].ballSpeed,
        velocityY: DIFFICULTY[difficulty].ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        color: COLORS.ball
    };
}
function chooseServe() {
    serveTo = Math.random() < 0.5 ? "player" : "ai";
    serveAnnouncement = serveTo === "player" ? "You Serve!" : "AI Serves!";
    serveTimer = 60; // ~1s pause
}
function resetBall() {
    chooseServe();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = BALL.minAngle + Math.random() * (BALL.maxAngle - BALL.minAngle);
    const dir = (serveTo === "player") ? 1 : -1;
    ball.speed = DIFFICULTY[difficulty].ballSpeed;
    ball.velocityX = dir * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1) * Math.sin(angle);
}

// ==== EVENT LISTENERS ====
// Mouse paddle movement
canvas.addEventListener('mousemove', e => {
    if (!gameStarted || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    leftPaddle.y = e.clientY - rect.top - leftPaddle.height / 2;
    leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
});
// Start game from settings
settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    difficulty = difficultySelect.value;
    pointsToWin = parseInt(pointsToWinInput.value) || 7;
    playerScore = aiScore = playerPoints = 0;
    gameOver = false;
    playerScoreSpan.textContent = aiScoreSpan.textContent = "0";
    playerPointsSpan.textContent = "0";
    targetPointsDisplay.textContent = `(First to ${pointsToWin} goals wins!)`;
    winnerMsg.textContent = "";
    initPaddles();
    initBall();
    resetBall();
    settingsDropdown.classList.remove('dropdown-active');
    gameStarted = true;
});

// ==== DRAW FUNCTIONS ====
function drawNet() {
    ctx.strokeStyle = COLORS.net;
    ctx.lineWidth = 4;
    for (let i = 20; i < canvas.height - 20; i += 34) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 22);
        ctx.stroke();
    }
}
function drawPaddle(p) {
    ctx.shadowColor = COLORS.shadow;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
}
function drawBall() {
    ctx.shadowColor = COLORS.ball;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
}
function drawServeMsg() {
    if (serveTimer > 0) {
        ctx.font = "bold 2.2rem Orbitron, Arial";
        ctx.fillStyle = "#1e90ff";
        ctx.textAlign = "center";
        ctx.globalAlpha = 0.93;
        ctx.fillText(serveAnnouncement, canvas.width / 2, canvas.height / 2 - 60);
    }
}
function drawUI() {
    if (!gameStarted) {
        ctx.font = "bold 2.2rem Orbitron, Arial";
        ctx.fillStyle = "#1e90ff";
        ctx.textAlign = "center";
        ctx.globalAlpha = 0.92;
        ctx.fillText("Set your Game Settings!", canvas.width / 2, canvas.height / 2 - 24);
        ctx.font = "1.1rem Orbitron, Arial";
        ctx.fillText("Move your mouse to control the left paddle!", canvas.width / 2, canvas.height / 2 + 18);
    }
    if (gameOver) {
        ctx.font = "bold 2.8rem Orbitron, Arial";
        ctx.fillStyle = "#1e90ff";
        ctx.textAlign = "center";
        ctx.globalAlpha = 0.98;
        ctx.fillText(winnerMsg.textContent, canvas.width / 2, canvas.height / 2);
        ctx.font = "1.2rem Orbitron, Arial";
        ctx.fillText("Refresh the page to play again!", canvas.width / 2, canvas.height / 2 + 40);
    }
}

// ==== GAME LOGIC ====
function collide(paddle, ball) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
}
function aiMove() {
    const aiSpeed = DIFFICULTY[difficulty].aiSpeed;
    const targetY = ball.y - rightPaddle.height / 2;
    const diff = targetY - rightPaddle.y;
    rightPaddle.y += Math.abs(diff) > aiSpeed ? aiSpeed * Math.sign(diff) : diff;
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}
function update() {
    if (!gameStarted || gameOver) return;
    if (serveTimer > 0) { serveTimer--; return; }

    // Ball movement
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY *= -1;
    }

    // Player paddle collision
    if (collide(leftPaddle, ball)) {
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
        const collidePoint = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
        const angleRad = collidePoint * (Math.PI / 4);
        ball.speed = Math.min(BALL.maxSpeed, ball.speed * 1.04); // Apply speed cap
        ball.velocityX = ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        // No more "points on hit"
    }

    // AI paddle collision
    if (collide(rightPaddle, ball)) {
        ball.x = rightPaddle.x - ball.radius;
        const collidePoint = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
        const angleRad = collidePoint * (Math.PI / 4);
        ball.speed = Math.min(BALL.maxSpeed, ball.speed * 1.04); // Apply speed cap
        ball.velocityX = -ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        aiScore++;
        aiScoreSpan.textContent = aiScore;
        checkWinner();
        if (!gameOver) resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreSpan.textContent = playerScore;
        checkWinner();
        if (!gameOver) resetBall();
    }

    aiMove();
}
function checkWinner() {
    if (playerScore >= pointsToWin) {
        winnerMsg.textContent = "You Win! 🎉";
        gameOver = true;
    } else if (aiScore >= pointsToWin) {
        winnerMsg.textContent = "AI Wins! 🤖";
        gameOver = true;
    }
}

// ==== MAIN LOOP ====
function draw() {
    ctx.fillStyle = COLORS.table;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
    drawServeMsg();
    drawUI();
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ==== START ====
initPaddles();
initBall();
targetPointsDisplay.textContent = "";
draw();
gameLoop();