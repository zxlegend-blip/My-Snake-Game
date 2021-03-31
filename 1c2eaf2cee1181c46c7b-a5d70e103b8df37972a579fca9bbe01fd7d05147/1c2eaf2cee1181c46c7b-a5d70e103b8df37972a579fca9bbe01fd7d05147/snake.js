var elementSize = config.ELEMENT_SIZE;

var Snake = function (x, y, initialSize) {
  this.points = [];
  for (var i = 0; i < initialSize; i++) {
    this.points.push({
      x: x - elementSize * i,
      y: y
    });
  }

  this.currentDirection = 'right';
};

Snake.prototype.feed = function (n) {
  this.grow(n);
};

Snake.prototype.grow = function (n) {
  var tail = this.points[this.points.length - 1];
  var penultimate = this.points[this.points.length - 2];
  var xDelta = tail.x - penultimate.x;
  var yDelta = tail.y - penultimate.y;

  for (var i = 0; i < n; i++) {
    this.points.push({
      x: tail.x + xDelta * i,
      y: tail.y + yDelta * i
    })
  }
};

var MOVES = {
  "left": {
    x: -elementSize,
    y: 0
  },
  "up": {
    x: 0,
    y: -elementSize
  },
  "right": {
    x: elementSize,
    y: 0
  },
  "down": {
    x: 0,
    y: elementSize
  }
};


var movePoint = function (point, vector) {
  var translated = {
    x: (point.x + vector.x) % width,
    y: (point.y + vector.y) % height
  };

  if (translated.x < 0) {
    translated = movePoint(translated, {x: width, y: 0});
  }
  if (translated.y < 0) {
    translated = movePoint(translated, {x: 0, y: height});
  }
  return translated;
};


Snake.prototype.render = function () {
  var self = this;

  ctx.fillStyle = 'green';
  for (var i = 0; i < self.points.length; i++) {
    var element = self.points[i];
    ctx.fillRect(element.x, element.y, elementSize, elementSize);
  }
};


Snake.prototype.directionIsAllowed = function (direction) {
  switch (this.currentDirection) {
    case 'right':
      return (direction === 'up') || (direction === 'down');
      break;
    case 'left':
      return (direction === 'up') || (direction === 'down');
      break;
    case 'up':
      return (direction === 'right') || (direction === 'left');
      break;
    case 'down':
      return (direction === 'right') || (direction === 'left');
      break;
  }
};

Snake.prototype.move = function (key) {
  var head = this.points[0];
  this.points.splice(0, 0, movePoint(head, MOVES[key]));
  this.points.pop();
};


Snake.prototype.update = function (dt) {
  var self = this;
  this.move(self.currentDirection);
};


Snake.prototype.isEatingHimself = function () {
  var self = this;
  var head = self.points[0];
  var tol = 0.5;

  var selfCollision = false;
  game.mySnake.points.slice(1).forEach(function (point) {
    if ((head.x < point.x + tol) && (head.x > point.x - tol) &&
      (head.y < point.y + tol) && (head.y > point.y - tol)) {
      selfCollision = true;
    }
  });
  return selfCollision;
};

var Food = function (x, y, value) {
  this.x = x;
  this.y = y;
  this.size = config.FOOD_SIZE;
  this.value = value;
};

Food.prototype.render = function () {
  var self = this;
  ctx.fillStyle = config.FOOD_FILL_COLOR;
  ctx.fillRect(self.x, self.y, self.size, self.size);
};

Food.prototype.update = function (dt) {
};

var Bonus = function(x, y, baseValue) {
  this.baseValue = baseValue;
  Food.call(this, x, y, baseValue);
  this.size = config.BONUS_SIZE;
  this.decayTime = config.BONUS_DECAY_TIME;
  this.isBonus = true;
};

Bonus.prototype = Object.create(Food.prototype);

Bonus.prototype.update = function (dt) {
  this.value = Math.max(0, this.value - (dt / this.decayTime) * this.baseValue);
};

Bonus.prototype.render = function () {
  var self = this;
  ctx.fillStyle = config.BONUS_FILL_COLOR;
  ctx.globalAlpha = this.value / this.baseValue;
  ctx.fillRect(self.x, self.y, self.size, self.size);
  ctx.globalAlpha = 1;
};
