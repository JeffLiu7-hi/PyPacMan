const CANVAS_SIZE = 606;
const BG_COLOR = '#000000';
const WALL_COLOR = 'rgb(0,191,255)';
const GATE_COLOR = '#ffffff';
const FOOD_COLOR = '#ffff00';
const SCORE_COLOR = '#ff0000';
const HUD_FONT = "18px 'Algerian', sans-serif";
const MESSAGE_FONT = "24px 'Algerian', sans-serif";
const FRAME_INTERVAL = 100; // 10 FPS like pygame version

const ASSET_PATHS = {
    hero: '../resources/images/pacman.png',
    ghosts: {
        Blinky: '../resources/images/Blinky.png',
        Clyde: '../resources/images/Clyde.png',
        Inky: '../resources/images/Inky.png',
        Pinky: '../resources/images/Pinky.png',
    },
    audio: '../resources/sounds/bg.mp3',
};

function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image at ${path}`));
        img.src = path;
    });
}

function loadAssets() {
    const ghostPromises = Object.entries(ASSET_PATHS.ghosts).map(([name, path]) =>
        loadImage(path).then((img) => [name, img])
    );
    return Promise.all([loadImage(ASSET_PATHS.hero), Promise.all(ghostPromises)]).then(
        ([heroImage, ghostEntries]) => {
            const ghostImages = ghostEntries.reduce((acc, [name, img]) => {
                acc[name] = img;
                return acc;
            }, {});
            return { heroImage, ghostImages };
        }
    );
}

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

class Wall {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Food {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    getRect() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
}

class Player {
    constructor(x, y, image, { autoMove = false } = {}) {
        this.x = x;
        this.y = y;
        this.baseImage = image;
        this.width = image.width;
        this.height = image.height;
        this.speed = { x: 0, y: 0 };
        this.baseSpeed = { x: 30, y: 30 };
        this.isMoving = autoMove;
        this.orientation = 'right';
        this.tracks = [];
        this.trackIndex = 0;
        this.trackStep = 0;
        this.role = '';
    }
    changeSpeed(direction) {
        const [dx, dy] = direction;
        if (dx < 0) {
            this.orientation = 'left';
        } else if (dx > 0) {
            this.orientation = 'right';
        } else if (dy < 0) {
            this.orientation = 'up';
        } else if (dy > 0) {
            this.orientation = 'down';
        }
        this.speed.x = dx * this.baseSpeed.x;
        this.speed.y = dy * this.baseSpeed.y;
        if (dx !== 0 || dy !== 0) {
            this.isMoving = true;
        }
        return this.speed;
    }
    stop() {
        this.speed.x = 0;
        this.speed.y = 0;
        this.isMoving = false;
    }
    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    update(walls, gates) {
        if (!this.isMoving) {
            return false;
        }
        const prevX = this.x;
        const prevY = this.y;
        this.x += this.speed.x;
        this.y += this.speed.y;
        const collidedWall = walls.some((wall) => rectsOverlap(this.getRect(), wall.getRect()));
        let collided = collidedWall;
        if (!collided && gates && gates.length) {
            collided = gates.some((gate) => rectsOverlap(this.getRect(), gate.getRect()));
        }
        if (collided) {
            this.x = prevX;
            this.y = prevY;
            return false;
        }
        return true;
    }
    draw(ctx) {
        const rect = this.getRect();
        ctx.save();
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        switch (this.orientation) {
            case 'left':
                ctx.scale(-1, 1);
                break;
            case 'up':
                ctx.rotate(-Math.PI / 2);
                break;
            case 'down':
                ctx.rotate(Math.PI / 2);
                break;
            default:
                break;
        }
        ctx.drawImage(this.baseImage, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
        ctx.restore();
    }
}

const LEVEL1 = Object.freeze({
    walls: [
        [0, 0, 6, 600],
        [0, 0, 600, 6],
        [0, 600, 606, 6],
        [600, 0, 6, 606],
        [300, 0, 6, 66],
        [60, 60, 186, 6],
        [360, 60, 186, 6],
        [60, 120, 66, 6],
        [60, 120, 6, 126],
        [180, 120, 246, 6],
        [300, 120, 6, 66],
        [480, 120, 66, 6],
        [540, 120, 6, 126],
        [120, 180, 126, 6],
        [120, 180, 6, 126],
        [360, 180, 126, 6],
        [480, 180, 6, 126],
        [180, 240, 6, 126],
        [180, 360, 246, 6],
        [420, 240, 6, 126],
        [240, 240, 42, 6],
        [324, 240, 42, 6],
        [240, 240, 6, 66],
        [240, 300, 126, 6],
        [360, 240, 6, 66],
        [0, 300, 66, 6],
        [540, 300, 66, 6],
        [60, 360, 66, 6],
        [60, 360, 6, 186],
        [480, 360, 66, 6],
        [540, 360, 6, 186],
        [120, 420, 366, 6],
        [120, 420, 6, 66],
        [480, 420, 6, 66],
        [180, 480, 246, 6],
        [300, 480, 6, 66],
        [120, 540, 126, 6],
        [360, 540, 126, 6],
    ],
    gate: [282, 242, 42, 2],
    heroStart: [287, 439],
    ghosts: [
        {
            name: 'Blinky',
            start: [287, 199],
            tracks: [
                [0, -0.5, 4],
                [0.5, 0, 9],
                [0, 0.5, 11],
                [0.5, 0, 3],
                [0, 0.5, 7],
                [-0.5, 0, 11],
                [0, 0.5, 3],
                [0.5, 0, 15],
                [0, -0.5, 15],
                [0.5, 0, 3],
                [0, -0.5, 11],
                [-0.5, 0, 3],
                [0, -0.5, 11],
                [-0.5, 0, 3],
                [0, -0.5, 3],
                [-0.5, 0, 7],
                [0, -0.5, 3],
                [0.5, 0, 15],
                [0, 0.5, 15],
                [-0.5, 0, 3],
                [0, 0.5, 3],
                [-0.5, 0, 3],
                [0, -0.5, 7],
                [-0.5, 0, 3],
                [0, 0.5, 7],
                [-0.5, 0, 11],
                [0, -0.5, 7],
                [0.5, 0, 5],
            ],
        },
        {
            name: 'Clyde',
            start: [319, 259],
            tracks: [
                [-1, 0, 2],
                [0, -0.5, 4],
                [0.5, 0, 5],
                [0, 0.5, 7],
                [-0.5, 0, 11],
                [0, -0.5, 7],
                [-0.5, 0, 3],
                [0, 0.5, 7],
                [-0.5, 0, 7],
                [0, 0.5, 15],
                [0.5, 0, 15],
                [0, -0.5, 3],
                [-0.5, 0, 11],
                [0, -0.5, 7],
                [0.5, 0, 3],
                [0, -0.5, 11],
                [0.5, 0, 9],
            ],
        },
        {
            name: 'Inky',
            start: [255, 259],
            tracks: [
                [1, 0, 2],
                [0, -0.5, 4],
                [0.5, 0, 10],
                [0, 0.5, 7],
                [0.5, 0, 3],
                [0, -0.5, 3],
                [0.5, 0, 3],
                [0, -0.5, 15],
                [-0.5, 0, 15],
                [0, 0.5, 3],
                [0.5, 0, 15],
                [0, 0.5, 11],
                [-0.5, 0, 3],
                [0, -0.5, 7],
                [-0.5, 0, 11],
                [0, 0.5, 3],
                [-0.5, 0, 11],
                [0, 0.5, 7],
                [-0.5, 0, 3],
                [0, -0.5, 3],
                [-0.5, 0, 3],
                [0, -0.5, 15],
                [0.5, 0, 15],
                [0, 0.5, 3],
                [-0.5, 0, 15],
                [0, 0.5, 11],
                [0.5, 0, 3],
                [0, -0.5, 11],
                [0.5, 0, 11],
                [0, 0.5, 3],
                [0.5, 0, 1],
            ],
        },
        {
            name: 'Pinky',
            start: [287, 259],
            tracks: [
                [0, -1, 4],
                [0.5, 0, 9],
                [0, 0.5, 11],
                [-0.5, 0, 23],
                [0, 0.5, 7],
                [0.5, 0, 3],
                [0, -0.5, 3],
                [0.5, 0, 19],
                [0, 0.5, 3],
                [0.5, 0, 3],
                [0, 0.5, 3],
                [0.5, 0, 3],
                [0, -0.5, 15],
                [-0.5, 0, 7],
                [0, 0.5, 3],
                [-0.5, 0, 19],
                [0, -0.5, 11],
                [0.5, 0, 9],
            ],
        },
    ],
});

class Game {
    constructor(canvas, ctx, assets) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.heroImage = assets.heroImage;
        this.ghostImages = assets.ghostImages;
        this.bgAudio = new Audio(ASSET_PATHS.audio);
        this.bgAudio.loop = true;
        this.bgAudioReady = false;
        this.state = 'playing';
        this.score = 0;
        this.deltaBuffer = 0;
        this.lastTimestamp = 0;
        this.overlay = document.getElementById('messageOverlay');
        this.messageText = document.getElementById('messageText');
        this.level = LEVEL1;
        this.setupLevel();
        this.bindHandlers();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }
    setupLevel() {
        this.score = 0;
        this.state = 'playing';
        this.overlay.classList.add('hidden');
        this.walls = this.level.walls.map((spec) => new Wall(...spec, WALL_COLOR));
        this.gates = [new Wall(...this.level.gate, GATE_COLOR)];
        this.hero = new Player(this.level.heroStart[0], this.level.heroStart[1], this.heroImage);
        this.hero.width = this.heroImage.width;
        this.hero.height = this.heroImage.height;
        this.hero.stop();
        this.ghosts = this.level.ghosts.map((ghostSpec) => {
            const player = new Player(ghostSpec.start[0], ghostSpec.start[1], this.ghostImages[ghostSpec.name], {
                autoMove: true,
            });
            player.role = ghostSpec.name;
            player.tracks = ghostSpec.tracks;
            player.trackIndex = 0;
            player.trackStep = 0;
            player.changeSpeed(player.tracks[player.trackIndex]);
            return player;
        });
        this.food = this.generateFood();
    }
    generateFood() {
        const pellets = [];
        for (let row = 0; row < 19; row += 1) {
            for (let col = 0; col < 19; col += 1) {
                const disableCentral = (row === 7 || row === 8) && (col === 8 || col === 9 || col === 10);
                if (disableCentral) {
                    continue;
                }
                const x = 30 * col + 32;
                const y = 30 * row + 32;
                const pellet = new Food(x, y, 4, FOOD_COLOR);
                const isWallOverlap = this.walls.some((wall) => rectsOverlap(pellet.getRect(), wall.getRect()));
                if (isWallOverlap) {
                    continue;
                }
                const heroRect = this.hero.getRect();
                if (rectsOverlap(pellet.getRect(), heroRect)) {
                    continue;
                }
                pellets.push(pellet);
            }
        }
        return pellets;
    }
    bindHandlers() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
        this.canvas.addEventListener('click', () => this.canvas.focus());
    }
    handleKeyDown(event) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            if (!this.bgAudioReady) {
                this.bgAudio.play().catch(() => {});
                this.bgAudioReady = true;
            }
            if (this.state !== 'playing') {
                return;
            }
            const directionMap = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
            };
            this.hero.changeSpeed(directionMap[event.key]);
            this.hero.isMoving = true;
        } else if (event.key === 'Enter') {
            if (this.state === 'paused') {
                this.setupLevel();
            }
        } else if (event.key === 'Escape') {
            if (this.state === 'paused') {
                this.overlay.classList.remove('hidden');
                this.messageText.textContent = 'Thanks for playing! Refresh to restart.';
            } else {
                this.state = 'paused';
                this.messageText.textContent = 'Game closed. Refresh to play again.';
                this.overlay.classList.remove('hidden');
            }
        }
    }
    handleKeyUp(event) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            this.hero.stop();
        }
    }
    loop(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        const delta = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        this.deltaBuffer += delta;
        while (this.deltaBuffer >= FRAME_INTERVAL) {
            this.update();
            this.deltaBuffer -= FRAME_INTERVAL;
        }
        this.render();
        requestAnimationFrame(this.loop);
    }
    update() {
        if (this.state !== 'playing') {
            return;
        }
        this.hero.update(this.walls, this.gates);
        this.updateFoodCollisions();
        this.updateGhosts();
        this.checkEndConditions();
    }
    updateFoodCollisions() {
        const heroRect = this.hero.getRect();
        this.food = this.food.filter((pellet) => {
            const overlap = rectsOverlap(heroRect, pellet.getRect());
            if (overlap) {
                this.score += 1;
                return false;
            }
            return true;
        });
    }
    updateGhosts() {
        this.ghosts.forEach((ghost) => {
            this.advanceGhostTracks(ghost);
            ghost.update(this.walls, null);
        });
    }
    advanceGhostTracks(ghost) {
        const currentTrack = ghost.tracks[ghost.trackIndex];
        if (ghost.trackStep < currentTrack[2]) {
            ghost.changeSpeed(currentTrack);
            ghost.trackStep += 1;
        } else {
            ghost.trackIndex = this.nextTrackIndex(ghost);
            ghost.changeSpeed(ghost.tracks[ghost.trackIndex]);
            ghost.trackStep = 0;
        }
        const trackAfter = ghost.trackStep < ghost.tracks[ghost.trackIndex][2]
            ? ghost.tracks[ghost.trackIndex]
            : ghost.tracks[this.nextTrackIndex(ghost)];
        ghost.changeSpeed(trackAfter);
    }
    nextTrackIndex(ghost) {
        if (ghost.trackIndex < ghost.tracks.length - 1) {
            return ghost.trackIndex + 1;
        }
        return ghost.role === 'Clyde' ? 2 : 0;
    }
    checkEndConditions() {
        if (this.food.length === 0) {
            this.finishLevel(true);
            return;
        }
        const heroRect = this.hero.getRect();
        const isCaught = this.ghosts.some((ghost) => rectsOverlap(heroRect, ghost.getRect()));
        if (isCaught) {
            this.finishLevel(false);
        }
    }
    finishLevel(isWin) {
        this.state = 'paused';
        this.messageText.textContent = isWin ? 'Congratulations, you won!' : 'Game Over!';
        this.overlay.classList.remove('hidden');
    }
    render() {
        this.ctx.fillStyle = BG_COLOR;
        this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        this.food.forEach((pellet) => pellet.draw(this.ctx));
        this.walls.forEach((wall) => wall.draw(this.ctx));
        this.gates.forEach((gate) => gate.draw(this.ctx));
        this.hero.draw(this.ctx);
        this.ghosts.forEach((ghost) => ghost.draw(this.ctx));
        this.drawScore();
    }
    drawScore() {
        this.ctx.font = HUD_FONT;
        this.ctx.fillStyle = SCORE_COLOR;
        const text = `Score: ${this.score}`;
        const width = this.ctx.measureText(text).width;
        this.ctx.fillText(text, CANVAS_SIZE - width - 10, 24);
    }
}

function start() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    loadAssets()
        .then((assets) => {
            canvas.focus();
            new Game(canvas, ctx, assets);
        })
        .catch((error) => {
            console.error('Failed to load assets', error);
        });
}

document.addEventListener('DOMContentLoaded', start);
