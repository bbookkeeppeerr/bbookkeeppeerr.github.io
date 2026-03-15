
// Canvas upper left is 0,0
// Canvas size is 1200x800

/**
 * @typedef {Object} Vector
 * @property {number} x - x axis.
 * @property {number} y - y axis.
 */

/**
 * @typedef {Object} FireworkArg 
 */

/**
 * gravity expresed as a 2d vector
 * @type {Vector}
 */
const gravity = {x: 0, y: 9.8}

/**
 * rate that time is adjusted
 * @type number
 */
const scale = 1000000


class FireworkProgram {
    /**
    * An array of Firework objects, can add more fireworks as time goes on
    * @type {Firework[]}
    */
    fireworks = [];
    start;
    fireworkStart = {x:600, y:800}
    fireworkVector = {x: -7, y:-3}
    gravity = {x: 0, y:9.8}
    ctx;
    canvas;
    
    // 
    animationFrameId;

    // TODO: constructor should take in config for fireworks
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d")
        this.animationFrameId = window.requestAnimationFrame((timestamp) => this.renderLoop(timestamp))

        // firework will start 6 seconds into the run
        // 'fire' for 3 seconds
        // fuel cuts out
        // 'explosion' happens 3 seconds after fuel runs out (6 seconds total)
        this.fireworks.push(new Firework({
            startPosition: {x: 600, y:800},
            startTime: 6000,
            acceleration: {x: 2, y: -2800},
            fuelTime: 3000,
            explosionStartTime: 6000,
            explosionLengthTime: 3000,
            color: 'red'
        }))
    }

    renderLoop(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log(timestamp)
        if (!this.start) {
            this.start = timestamp
        }
        console.log(this.start)
        this.start += timestamp;

        this.fireworks.forEach((firework) => {
            firework.move(timestamp)
        })

        this.fireworks.forEach((firework) => {
            firework.render(this.ctx);
        })

        //const newPosition = this.move(this.fireworkStart, this.fireworkVector, this.start)
        //this.fireworkStart = newPosition;
        //this.renderFirework(newPosition)

        this.animationFrameId = window.requestAnimationFrame((timestamp) => this.renderLoop(timestamp))
        /*if (this.fireworkStart.x < 0 || this.fireworkStart.y < 0) {
            window.cancelAnimationFrame(this.animationFrameId);
        } else {
            this.animationFrameId = window.requestAnimationFrame((timestamp) => this.renderLoop(timestamp))
        }*/
    }

    renderFirework(position) {
        this.ctx.beginPath();
        this.ctx.fillStyle = 'blue'; // Set fill color
        this.ctx.lineWidth = 3; // Set stroke thickness
        this.ctx.strokeStyle = 'black'; // Set stroke color
        this.ctx.arc(position.x, position.y, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        console.log(JSON.stringify(position))
    }

    move(start, velocity, deltaTime) {
        this.fireworks.forEach((firework) => {
            firework.move(deltaTime)
        })

        const returnedX = start.x + ((velocity.x * deltaTime) / 1000000)
        const returnedY = start.y + ((velocity.y * deltaTime) / 1000000)
        return { x: returnedX, y: returnedY}
    }
}


// Firework should keep track of current position
// should decrease fuel time by delta
// should keep track of velocity + acceleration
// do need to use currentTime to decide when it is active though, perhaps a setInterval that will add it to fireworks array when it is to become active?
/**
 * Firework class keeps track of information for movement and rendering of a firework object
 * @class
 * @constructor
 * @public
 */
class Firework {
    /**
     * @type {Vector} position of firework
     */
    position;
    startTime;
    directionVector;
    acceleration;
    fuelTime;
    explosionStartTime;
    explosionLengthTime;
    color;
    velocity = {x:0, y:0};


    // TODO: functions to add even more 
    movementPattern;
    smokePattern;
    explosionPattern;

    constructor(args = {startPosition, acceleration, fuelTime, explosionStartTime, color, startTime, explosionLengthTime}) {
        this.position = args.startPosition;
        this.acceleration = args.acceleration;
        this.fuelTime = args.fuelTime;
        this.explosionStartTime = args.explosionStartTime;
        this.color = args.color;
        this.startTime = args.startTime;
        this.explosionLengthTime = args.explosionLengthTime;
    }

    /**
     * moves firework 
     * 
     * deltaTime is the timestamp value from window.requestAnimationFrame
     * @param {number} deltaTime 
     * @returns void
     */
    move(deltaTime) {
        
        this.startTime = Math.max(this.startTime - deltaTime, 0);
        console.log(`this.startTime: ${this.startTime}`);

        // only start moving after we are set to begin
        if (this.startTime > 0) return;
        
        // always apply gravity. If we are exploding then gravity is half the strength
        // TODO: should get explosion movement for the different particles, currently just one
        // rocket no longer lit, but still travelling
        if (this.explosionStartTime > 0) {
            this.velocity.x = this.velocity.x + ((gravity.x * deltaTime) / scale)
            this.velocity.y = this.velocity.y + ((gravity.y * deltaTime) / scale)
        } else if (this.explosionStartTime === 0) {
            this.velocity.x = this.velocity.x + ((gravity.x * deltaTime) / scale * 2)
            this.velocity.y = this.velocity.y + ((gravity.y * deltaTime) / scale * 2)
        }

        console.log(`this.fuelTime: ${this.fuelTime}`)
        // if the rocket is still lit, continue acceleration
        if (this.fuelTime > 0) {
            this.fuelTime = Math.max(this.fuelTime - deltaTime, 0);

            // accelerate
            this.velocity.x = this.velocity.x + ((this.acceleration.x * deltaTime) / scale)
            this.velocity.y = this.velocity.y + ((this.acceleration.y * deltaTime) / scale)
        }

        // explosion length will be managed in render, but should add to this area instead
        this.explosionStartTime = Math.max(this.explosionStartTime - deltaTime, 0);


        let canvasElement = document.querySelector("canvas");

        this.position.x = this.position.x + this.velocity.x;
        this.position.y = Math.min(this.position.y + this.velocity.y, 800);
    }

    render(ctx) {
        // if before start time, no render
        // if during fuel time, render red
        // if during explosion, big circle, render yellow
        if (this.startTime > 0) return;
        console.log(`this.position ${JSON.stringify(this.position)}`)
        
        let radius = 7; // default while firework is moving

        ctx.beginPath();
        //ctx.fillStyle = 'blue'; // Set fill color
        //ctx.strokeStyle = 'black'; // Set stroke color

        if (this.explosionStartTime > 0) {
            ctx.fillStyle = this.color;
            ctx.lineWidth = 3; // Set stroke thickness
            radius = 14;
        }

        if (this.fuelTime > 0) {
            ctx.fillStyle = 'red'
            ctx.lineWidth = 0;
            radius = 7;
        }

        ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}



new FireworkProgram();


// how to get a timing loop? (Game loop, 60fps)
//
// world needs
// * gravity
// * wind vector + velocity
// firework object needs
// * starting point
// * direction vector
// * acceleration
// * time to live (fuel)
// * time for explosion
// 
// at the end of firework time to live an explosion will occur, these need
// explosion
// * start point
// * direction vector
// * time to live
// * color fade rate
// * pattern type (start with just sphere)


