const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 800;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  health: 10,
};

const bullets = [];
const enemies = [];

let spawnInterval = 30000; // 3 minutes in milliseconds
let lastEnemySpawn = Date.now() - spawnInterval;
let enemySpeed = 100; // px per second
let round = 1;

function drawPlayer() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3);
  });
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach((enemy) => {
    ctx.fillRect(enemy.x - 5, enemy.y - 5, 10, 10);
  });
}

function updateBullets(deltaTime) {
  bullets.forEach((bullet, index) => {
    bullet.x += bullet.vx * deltaTime;
    bullet.y += bullet.vy * deltaTime;

    // Remove bullets that go outside the circle
    if (
      Math.hypot(bullet.x - player.x, bullet.y - player.y) >
      canvas.width / 2
    ) {
      bullets.splice(index, 1);
    }
  });
}

function updateEnemies(deltaTime) {
  enemies.forEach((enemy, index) => {
    if (enemy.chasing) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.vx = Math.cos(angle) * enemySpeed;
      enemy.vy = Math.sin(angle) * enemySpeed;
    } else {
      enemy.timer -= deltaTime;
      // if (index == 0) {
      //   console.log(enemy.timer);
      // }
      if (enemy.timer <= 0) {
        console.log('charsing');
        enemy.chasing = true;
      }
    }

    enemy.x += enemy.vx * deltaTime;
    enemy.y += enemy.vy * deltaTime;

    // Check collision with player
    if (
      Math.hypot(enemy.x - player.x, enemy.y - player.y) <
      player.size / 2 + 2.5
    ) {
      player.health -= 10;
      enemies.splice(index, 1);
      console.log(1);
    }

    // Check bullet collision
    bullets.forEach((bullet, bIndex) => {
      if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < 3.5) {
        createExplosion(enemy.x, enemy.y);
        enemies.splice(index, 1);
        console.log(2);
        bullets.splice(bIndex, 1);
      }
    });
  });
}

function spawnEnemies() {
  if (!lastEnemySpawn || Date.now() - lastEnemySpawn > spawnInterval) {
    lastEnemySpawn = Date.now();
    const numberOfEnemies = round * 3;
    for (let i = 0; i < numberOfEnemies; i++) {
      const angle = Math.random() * Math.PI * 2;
      const x = player.x + Math.cos(angle) * (canvas.width / 2);
      const y = player.y + Math.sin(angle) * (canvas.height / 2);

      const timer = Math.round(Math.random() * 10);
      enemies.push({
        x,
        y,
        vx: Math.cos(angle) * enemySpeed,
        vy: Math.sin(angle) * enemySpeed,
        timer: timer, // 3 seconds
        chasing: false,
      });
    }
    round++;
    console.log('spam', enemies.length);
  }
}

function createExplosion(x, y) {
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  console.log('boom');
}
let lastCurrentDate = Date.now();

function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();

  const deltaTime = 1 / 60;

  updateBullets(deltaTime);
  updateEnemies(deltaTime);
  spawnEnemies();

  if (player.health > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    alert('Game Over');
  }
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * 150,
    vy: Math.sin(angle) * 150,
  });
});

requestAnimationFrame(gameLoop);
