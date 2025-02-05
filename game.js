const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let nb_elem = 20;
let unite = Math.min(canvas.width,canvas.height) / nb_elem
let squareSize = 2*unite-5;
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let originalSquare = { x: centerX-squareSize/2, y: centerY-squareSize/2, size: squareSize };
let squares = [originalSquare];
let isDivided = false;
let objects = [];
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let offset = 2.5*Math.min(canvas.width,canvas.height) / nb_elem;

let bord_x_min;
let bord_y_min;
let bord_x_max;
let bord_y_max;


if (canvas.width<canvas.height){
	bord_x_min = 0;
	bord_y_min = canvas.height/2 - canvas.width/2;
	bord_x_max = canvas.width;
	bord_y_max = canvas.height/2 + canvas.width/2;
}
else{
	bord_x_min = canvas.width/2 - canvas.height/2;
	bord_y_min = 0;
	bord_x_max = canvas.width/2 + canvas.height/2;;
	bord_y_max = canvas.height;
}

// Handle Press (Mouse Down or Touch Start)
canvas.addEventListener("mousedown", splitSquares);
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    splitSquares();
});

// Handle Release (Mouse Up or Touch End)
canvas.addEventListener("mouseup", mergeSquares);
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    mergeSquares();
});

// Function to split the square into 4
function splitSquares() {
    if (!isDivided) {
        let newSize = squareSize / 2;
        squares = [
            { x: centerX - offset - newSize/2, y: centerY - offset - newSize/2, size: newSize },
            { x: centerX + offset - newSize/2, y: centerY - offset - newSize/2, size: newSize },
            { x: centerX - offset - newSize/2, y: centerY + offset - newSize/2, size: newSize },
            { x: centerX + offset - newSize/2, y: centerY + offset - newSize/2, size: newSize }
        ];
        isDivided = true;
    }
}

// Function to merge the squares back to one
function mergeSquares() {
    if (isDivided) {
        squares = [originalSquare];
        isDivided = false;
    }
}

// Function to spawn objects from screen edges
function spawnObject() {
    if (gameOver) return;

    let side = Math.floor(Math.random() * 4);
    let size = unite;
    let speed = 3+1*score/1000;

    let obj = {
        size: size,
        speed: speed
    };

    switch (side) {
        case 0: // Top
            obj.x = bord_x_min+Math.floor(Math.random() * (nb_elem-1))*unite;
            obj.y = bord_y_min-size;
            obj.vx = 0;
            obj.vy = speed;
            break;
        case 1: // Bottom
            obj.x = bord_x_min+Math.floor(Math.random() * (nb_elem-1))*unite;
            obj.y = bord_y_max + size;
            obj.vx = 0;
            obj.vy = -speed;
            break;
        case 2: // Left
            obj.x = bord_x_min-size;
            obj.y = bord_y_min+Math.floor(Math.random() * (nb_elem-1))*unite;
            obj.vx = speed;
            obj.vy = 0;
            break;
        case 3: // Right
            obj.x = bord_x_max + size;
            obj.y = bord_y_min+Math.floor(Math.random() * (nb_elem-1))*unite;
            obj.vx = -speed;
            obj.vy = 0;
            break;
    }
    objects.push(obj);
}

// Collision Detection
function checkCollision(square, obj) {
    return (
        obj.x < square.x + square.size &&
        obj.x + obj.size > square.x &&
        obj.y < square.y + square.size &&
        obj.y + obj.size > square.y
    );
}

// Update the Game
function update() {
    if (gameOver) return;

    // Move Objects
    objects.forEach((obj) => {
        obj.x += obj.vx;
        obj.y += obj.vy;
    });

    // Check for collisions
    objects.forEach((obj) => {
        squares.forEach((square) => {
            if (checkCollision(square, obj)) {
                endGame();
            }
        });
    });

    // Remove objects that move off-screen
    objects = objects.filter(
        (obj) =>
            obj.x > -obj.size &&
            obj.x < canvas.width + obj.size &&
            obj.y > -obj.size &&
            obj.y < canvas.height + obj.size
    );

    // Increase score over time
    score++;
}

// Draw the Game
function draw() {
    

	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	

    // Draw Squares
    ctx.fillStyle = "white";
    squares.forEach((square) => {
        ctx.fillRect(square.x, square.y, square.size, square.size);
    });

    // Draw Objects
    ctx.fillStyle = "red";
    objects.forEach((obj) => {
        ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
    });
	ctx.clearRect(0, 0, bord_x_min, canvas.height);
	ctx.clearRect(bord_x_max, 0, canvas.width, canvas.height);
	ctx.clearRect(0, 0, canvas.width, bord_y_min);
	ctx.clearRect(0, bord_y_max, canvas.width, canvas.height);
	//Draw lines
	for (let ix = 0; ix < nb_elem+1; ix++) {
		ctx.strokeStyle = 'rgba(255,255,255,0.3)';
		ctx.beginPath(); // Start a new path
		ctx.moveTo(bord_x_min+ix*unite, bord_y_min); // Move the pen to (30, 50)
		ctx.lineTo(bord_x_min+ix*unite, bord_y_max);
		ctx.stroke(); // Render the path
	}
	for (let iy = 0; iy < nb_elem+1; iy++) {
		ctx.strokeStyle = 'rgba(255,255,255,0.3)';
		ctx.beginPath(); // Start a new path
		ctx.moveTo(bord_x_min, bord_y_min+iy*unite); // Move the pen to (30, 50)
		ctx.lineTo(bord_x_max, bord_y_min+iy*unite);
		ctx.stroke(); // Render the path
	}
    // Draw Score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, 10, 60);
	
	
	
    if (gameOver) {
        drawGameOverScreen();
    }
}

// Game Over Function
function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
}

// Draw Game Over Screen
function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2 - 50);

    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2 - 50, canvas.height / 2);
    ctx.fillText("High Score: " + highScore, canvas.width / 2 - 80, canvas.height / 2 + 40);

    // Draw Restart Button
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 80, 150, 50);

    ctx.fillStyle = "white";
    ctx.font = "25px Arial";
    ctx.fillText("Replay", canvas.width / 2 - 35, canvas.height / 2 + 115);

    // Add event listener for replay button
    canvas.addEventListener("click", restartGame);
	canvas.addEventListener("touchstart", restartGame);
}

// Restart Game
function restartGame(event) {
    let clickX, clickY;

    // Handle touch events
    if (event.touches) {
        clickX = event.touches[0].clientX;
        clickY = event.touches[0].clientY;
    } else { // Handle mouse events
        clickX = event.clientX;
        clickY = event.clientY;
    }
    let btnX = canvas.width / 2 - 75;
    let btnY = canvas.height / 2 + 80;
    let btnWidth = 150;
    let btnHeight = 50;

    // Check if the click was inside the replay button
    if (
        clickX >= btnX &&
        clickX <= btnX + btnWidth &&
        clickY >= btnY &&
        clickY <= btnY + btnHeight
    ) {
        // Reset the game
        gameOver = false;
        score = 0;
        objects = [];
        squares = [originalSquare];
        isDivided = false;

        // Remove event listener to avoid multiple clicks
        canvas.removeEventListener("click", restartGame);
		canvas.removeEventListener("touchstart", restartGame);
        // Restart game loop
        gameLoop();
    }
	

}

// Game Loop
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Spawn objects every second
setInterval(spawnObject, 1000);

// Start the Game
gameLoop();