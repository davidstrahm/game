//document.write("Hello");

var canvas = document.getElementById("gameField");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.png";

// hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/hero.png";

// monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/fly.png";

var keysDown = {};

document.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
});

document.addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
});


var Player = (function () {
    function Player() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 265;

        Player.prototype.reset = Player.prototype.reset.bind(this);
    }

    Player.prototype.reset = function () {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
    }


    return Player;
})();

var Monster = (function () {

    Monster.prototype.reset = function () {
        this.x = 32 + Math.random() * (canvas.width - 96);
        this.y = 32 + Math.random() * (canvas.height - 96);
    }

    function Monster() {
        this.x = 0;
        this.y = 0;
        this.speed = 200;

        Monster.prototype.reset = Monster.prototype.reset.bind(this);
    }

    return Monster;
})();


var Game = (function () {
    function Game() {
        this.monster = new Monster();
        this.monster.reset();
        this.player = new Player();
        this.player.reset();
        this.last = new Date();
        this.monstersCaught = 0;

        Game.prototype.start = Game.prototype.start.bind(this);
        Game.prototype.update = Game.prototype.update.bind(this);
        Game.prototype.updateMonster = Game.prototype.updateMonster.bind(this);
        Game.prototype.render = Game.prototype.render.bind(this);
    }

    Game.prototype.update = function (modifier) {
        var moveUp = 0;
        var moveDown = 0;
        var moveLeft = 0;
        var moveRight = 0;

        if (38 in keysDown) { // Player holding up
            moveUp = modifier;
            var move = this.player.y - this.player.speed * modifier;
            if (move > 32)
                this.player.y = move;
            else
                this.player.y = 32;
        }
        if (40 in keysDown) { // Player holding down
            moveDown = modifier;
            var move = this.player.y + this.player.speed * modifier;
            if (move < (canvas.height - 64))
                this.player.y = move;
            else
                this.player.y = (canvas.height - 64);
        }
        if (37 in keysDown) { // Player holding left
            moveLeft = modifier;
            var move = this.player.x - this.player.speed * modifier;
            if (move > 32)
                this.player.x = move;
            else
                this.player.x = 32;
        }
        if (39 in keysDown) { // Player holding right
            moveRight = modifier;
            var move = this.player.x + this.player.speed * modifier;
            if (move < (canvas.height - 32))
                this.player.x = move;
            else
                this.player.x = (canvas.height - 32);
        }

        // check if on monster
        if (-32 < (this.player.x - this.monster.x) &&
            (this.player.x - this.monster.x) < 32 &&
            -32 < (this.player.y - this.monster.y) &&
            (this.player.y - this.monster.y) < 32) {
            this.monstersCaught++;
            this.monster.reset();
            this.player.reset();
        }

        this.updateMonster(moveUp, moveDown, moveLeft, moveRight, modifier);
    }

    Game.prototype.updateMonster = function (moveUp, moveDown, moveLeft, moveRight, modifier) {
        if (moveUp > 0 && this.monster.y < this.player.y) {
            this.monster.y = this.monster.y - this.monster.speed * moveUp;
        }

        if (moveDown > 0 && this.monster.y > this.player.y) {
            this.monster.y = this.monster.y + this.monster.speed * moveDown;
        }

        if (moveLeft > 0 && this.monster.x < this.player.x) {
            this.monster.x = this.monster.x - this.monster.speed * moveLeft;
        }

        if (moveRight > 0 && this.monster.x > this.player.x) {
            this.monster.x = this.monster.x + this.monster.speed * moveRight;
        }

        // randomness
        if (moveUp > 0 || moveDown > 0 || moveLeft > 0 || moveRight > 0) {
            var xMove = this.monster.speed * Math.random() * modifier * 10;
            xMove = Math.random() < 0.5 ? -xMove : xMove;
            this.monster.x = this.monster.x + xMove;

            var yMove = this.monster.speed * Math.random() * modifier * 10;
            yMove = Math.random() < 0.5 ? -yMove : yMove;
            this.monster.y = this.monster.y + yMove;
        }

        if (this.monster.y < 32)
            this.monster.y = 32;

        if (this.monster.y > (canvas.height - 64))
            this.monster.y = (canvas.height - 64);

        if (this.monster.x < 32)
            this.monster.x = 32;

        if (this.monster.x > (canvas.width - 64))
            this.monster.x = (canvas.width - 64);

    }

    Game.prototype.render = function () {
        if (bgReady) {
            ctx.drawImage(bgImage, 0, 0);
        }

        if (heroReady) {
            ctx.drawImage(heroImage, this.player.x, this.player.y);
        }

        if (monsterReady) {
            ctx.drawImage(monsterImage, this.monster.x, this.monster.y);
        }

        // Score
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Monsterrs caught: " + this.monstersCaught, 32, 32);
    }

    Game.prototype.start = function () {

        var now = Date.now();
        var delta = now - this.last;

        this.update(delta / 1000);
        this.render();

        this.last = now;

        this.render();
        requestAnimationFrame(this.start);

    }

    return Game;
})();


var game = new Game();
game.start();