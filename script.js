const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 5 filas, 8 columnas
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 25;
const brickPadding = 12;
const brickOffsetTop = 50;
const brickOffsetLeft = 45;

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 60;

// Velocidad inicial más baja
let speedMultiplier = 1;
let dx = 3 * speedMultiplier;
let dy = -3 * speedMultiplier;

const maxSpeed = 6;

const paddleHeight = 12;
const paddleWidth = 120;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// Nuevos colores 
const brickColors = [
  ['#FF69B4', '#FFC0CB'], // rosa fuerte y rosa claro
  ['#87CEFA', '#ADD8E6'], // celeste claro y azul suave
  ['#9370DB', '#B19CD9'], // morado medio y morado claro
  ['#F8F8FF', '#E8E8E8'], // blanco fantasma y gris muy claro
  ['#20B2AA', '#40E0D0'], // azul verdoso y turquesa claro
];

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      popAnimation: 0,
    };
  }
}

let score = 0;
let gameOver = false;
let gameWon = false;

// Eventos teclado
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && (gameOver || gameWon)) {
    initGame();
  }
});

function keyDownHandler(e) {
  if (["ArrowRight", "Right", "d", "D"].includes(e.key)) {
    rightPressed = true;
  } else if (["ArrowLeft", "Left", "a", "A"].includes(e.key)) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (["ArrowRight", "Right", "d", "D"].includes(e.key)) {
    rightPressed = false;
  } else if (["ArrowLeft", "Left", "a", "A"].includes(e.key)) {
    leftPressed = false;
  }
}

// Función alerta cuando termina juego
function showAlert(message) {
  alert(message + "\nPresiona ENTER para reiniciar el juego");
}

// Reinicia juego
function initGame() {
  console.clear();
  console.log("🔄 Juego reiniciado");

  // Efecto visual rápido en el canvas al reiniciar
  const canvasEl = document.getElementById("gameCanvas");
  canvasEl.style.transition = "transform 0.2s ease";
  canvasEl.style.transform = "scale(0.97)";
  setTimeout(() => {
    canvasEl.style.transform = "scale(1)";
  }, 100);

  x = canvas.width / 2;
  y = canvas.height - 60;
  speedMultiplier = 1;
  dx = 3 * speedMultiplier;
  dy = -3 * speedMultiplier;
  paddleX = (canvas.width - paddleWidth) / 2;
  score = 0;
  gameOver = false;
  gameWon = false;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
      bricks[c][r].popAnimation = 0;
    }
  }

  draw();
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#FF69B4'; // rosa fuerte
  ctx.shadowColor = '#FF69B4';
  ctx.shadowBlur = 15;
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  let gradient = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight, paddleX + paddleWidth, canvas.height);
  gradient.addColorStop(0, '#9370DB'); // morado medio
  gradient.addColorStop(1, '#FF69B4'); // rosa fuerte
  ctx.fillStyle = gradient;
  ctx.shadowColor = '#FF69B4';
  ctx.shadowBlur = 10;
  ctx.roundRect(paddleX, canvas.height - paddleHeight - 2, paddleWidth, paddleHeight, 5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1 || b.popAnimation > 0) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;

        ctx.save();

        if (b.popAnimation > 0) {
          let scale = 1 + b.popAnimation * 0.6;
          let alpha = 1 - b.popAnimation;
          ctx.globalAlpha = alpha;
          ctx.translate(brickX + brickWidth / 2, brickY + brickHeight / 2);
          ctx.scale(scale, scale);
          ctx.translate(-(brickX + brickWidth / 2), -(brickY + brickHeight / 2));
        }

        let grad = ctx.createRadialGradient(
          brickX + brickWidth / 2,
          brickY + brickHeight / 2,
          5,
          brickX + brickWidth / 2,
          brickY + brickHeight / 2,
          brickWidth
        );
        let colors = brickColors[r % brickColors.length];
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[1]);

        ctx.fillStyle = grad;
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 10;
        ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
        ctx.shadowBlur = 0;

        ctx.restore();

        if (b.popAnimation > 0) {
          b.popAnimation += 0.07;
          if (b.popAnimation >= 1) b.popAnimation = 0;
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "20px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.fillStyle = "#FF69B4"; // rosa fuerte
  ctx.shadowColor = '#FF69B4';
  ctx.shadowBlur = 8;
  ctx.fillText("Puntaje: " + score, 20, 30);
  ctx.shadowBlur = 0;
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          b.popAnimation = 0.01;
          score++;

          // Incrementa la velocidad poco a poco hasta maxSpeed
          let currentSpeed = Math.sqrt(dx*dx + dy*dy);
          let acceleration = (score % 2 === 0) ? 0.2 : 0.1;
          let newSpeed = Math.min(currentSpeed + acceleration, maxSpeed);

          // Mantiene la dirección
          let angle = Math.atan2(dy, dx);
          dx = newSpeed * Math.cos(angle);
          dy = newSpeed * Math.sin(angle);

          if (score === brickRowCount * brickColumnCount) {
            gameWon = true;
            gameOver = true;
            showAlert("🎉 ¡Ganastee!");
          }
        }
      }
    }
  }
}

function update() {
  if (gameOver) {
    draw();
    return;
  }

  x += dx;
  y += dy;

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius - paddleHeight) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      let collidePoint = x - (paddleX + paddleWidth / 2);
      let normalizedPoint = collidePoint / (paddleWidth / 2);
      let angle = normalizedPoint * (Math.PI / 3);
      let speed = Math.sqrt(dx*dx + dy*dy);
      dx = speed * Math.sin(angle);
      dy = -speed * Math.cos(angle);
    } else {
      gameOver = true;
      showAlert("💥 ¡Perdiste!");
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 10;
  if (leftPressed && paddleX > 0) paddleX -= 10;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();

  if (gameOver) return;

  collisionDetection();
  update();

  requestAnimationFrame(draw);
}

// Polyfill para rectángulo redondeado
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

initGame();
