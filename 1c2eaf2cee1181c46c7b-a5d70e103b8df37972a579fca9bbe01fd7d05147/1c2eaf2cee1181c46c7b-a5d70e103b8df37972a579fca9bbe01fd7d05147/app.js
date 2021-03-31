// Global variables
var canvas,
  ctx,
  width,
  height,
  game;

var utils = {};

utils.randomFood = function (isBonus) {
  var xPos = Math.random() * (width - config.ELEMENT_SIZE);
  var yPos = Math.random() * (height - config.ELEMENT_SIZE);
  if (isBonus) {
    return new Bonus(xPos, yPos, Math.ceil(Math.random() * 40));
  }
  return new Food(xPos, yPos, Math.ceil(Math.random() * 10));
};

utils.intervalsOverlap = function (a, sizeA, b, sizeB) {
  return (a >= b && a <= b + sizeB || (a <= b && b <= a + sizeA))
};

var Game = function () {
  this.mySnake = new Snake(10, 20, 5, 1);

  this.score = 0;
  this.gameOn = true;
  this.moveHappenedInTurn = false;
  this.gameOverMessage = "";

  this.edibles = [utils.randomFood(), utils.randomFood()];
};

Game.prototype.addRandomFood = function () {
  this.edibles.push(utils.randomFood());

  if (Math.random() > 0.7) {
    this.edibles.push(utils.randomFood(true))
  }
};


Game.prototype.gameOver = function (msg) {
  this.gameOn = false;
  this.gameOverMessage = msg;
};

Game.prototype.checkCollisions = function () {
  var self = this;
  var head = this.mySnake.points[0];
  var beforeHead = this.mySnake.points[1];

  if (this.mySnake.isEatingHimself()) {
    this.gameOver("You ate yourself.");
  }

  self.edibles.forEach(function (edible) {
    if (utils.intervalsOverlap(head.x, config.ELEMENT_SIZE, edible.x, edible.size) &&
      utils.intervalsOverlap(head.y, config.ELEMENT_SIZE, edible.y, edible.size)) {
      self.mySnake.feed(edible.value);
      edible.status = "eaten";
      self.score += Math.round(edible.value);
      if (!edible.isBonus) {
        // We add food only when the snake eats regular food.
        self.addRandomFood();
      }
    }
  });

  // We remove eaten food and bonuses that faded out.
  self.edibles = self.edibles.filter(function (x) {
    return x.status != "eaten" && x.value > 0;
  });

  // We check for wall collisions.
  if ((Math.abs(head.x - beforeHead.x) > config.ELEMENT_SIZE ||
    Math.abs(head.y - beforeHead.y) > config.ELEMENT_SIZE)) {
    this.gameOver("Boum.");
  }
};

Game.prototype.render = function () {
  // We clean the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  this.mySnake.render();
  this.edibles.forEach(function (edible) {
    edible.render();
  });

  if (this.gameOverMessage != "") {
    ctx.textAlign = "center";
    ctx.fillStyle = 'red';
    ctx.font = "30px";
    ctx.fillText("GAME OVER.", canvas.width / 2, canvas.height / 3);
    ctx.font = "20px";
    ctx.fillText(this.gameOverMessage, canvas.width / 2, canvas.height / 2);
  }

  window.scoreSpan.innerHTML = this.score;
};

Game.prototype.update = function (dt) {
  //console.log("in update");
  this.mySnake.update(dt);
  this.edibles.forEach(function (edible) {
    edible.update(dt);
  });
  this.checkCollisions();
  this.moveHappenedInTurn = false;
};

window.onload = function () {
  canvas = document.getElementById('game-area');
  canvas.width = document.documentElement.clientWidth * 0.29;
  canvas.height = document.documentElement.clientHeight * 0.25;
  ctx = canvas.getContext('2d');
  width = canvas.width;
  height = canvas.height;

  var buttonStart = document.getElementById("start");
  var buttonPauseContinue = document.getElementById("pause-continue");
  window.scoreSpan = document.getElementById("score");

  buttonStart.addEventListener("click", function () {
    game = new Game();
    buttonPauseContinue.innerHTML = "Pause";
  });

  buttonPauseContinue.addEventListener("click", function () {
    // Toggle the game state (on/paused)
    game.gameOn = !game.gameOn;
    if (game.gameOn) {
      buttonPauseContinue.innerHTML = "Pause";
    }
    else {
      buttonPauseContinue.innerHTML = "Continue";
    }
  });

  document.addEventListener('keydown', function (e) {
    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
    // We allow input only if game is not paused.
    if (game.gameOn) {
      var key = allowedKeys[e.keyCode];
      if (game.mySnake.directionIsAllowed(key) && !game.moveHappenedInTurn) {
        game.mySnake.currentDirection = key;
        game.moveHappenedInTurn = true;
      }
    }
  });

  var main = function () {
    var now = Date.now();
    var dt = (now - window.lastTime) / 1000;
    // We play the game only if it is not paused
    if (game.gameOn) {
      game.update(dt);
      game.render();
    }
    window.lastTime = now;
    setTimeout(main, 1000 / config.FPS);
  };

  game = new Game();
  // launch game loop
  window.lastTime = Date.now();
  main();
};
