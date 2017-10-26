/**
 * @classdesc
 * Creates fireworks effects on a canvas.
 * Fireworks are  targetted either randomly or by mouse co-ordinates.
 * @param {object} canvas - the canvas object where the fireworks need to be rendered.
 * @param {object} options - Object containing the options that can be manipulated to change the fireworks.
 * @class
 */
var CanvasFireworks = (function(){
    return function(canvas,options){
        if(typeof(canvas) != "object" || !!canvas === false) throw ('The parameter canvas is either missing or invalid');
        /**
         * Contains the user defined settings.
         * @type {Object} settings
         * @default
         */
        var settings = options || {};
        /**
         * Throws an error message.
         * @function _throw
         * @memberOf CanvasFireworks#
         * @param {string} m - error message to be thrown
         */
        var _throw = function(m){
            throw m
        };
        /**
         * The 2d context of the canvas.
         * @type {Object}
         * @default
         */
        var ctx = ('getContext' in canvas) ? canvas.getContext("2d") : _throw ('The parameter canvas doesnot contain property \"getContext\"');
        /**
         * The width of the canvas.
         * @type {number}
         * @default
         */
        var cw = ('width' in canvas) ? canvas.width : _throw ('The parameter canvas doesnot contain property \"width\"');
        /**
         * @type {object} ch - The height of the canvas
         * @default
         */
        var ch = ('getContext' in canvas) ? canvas.height : _throw ('The parameter canvas doesnot contain property \"height\"');
        /**
         * Fireworks collection.
         * @type {Array}
         * @default
         */
        var fireworks = [];
        /**
         * Particles collection.
         * @type {Array}
         * @default
         */
        var particles = [];
        /**
         * initial value of hue for hue saturaion and luminosity with alpha (hsla) color scheme.
         * @type {number}
         * @default
         */
        var hue = settings.hue || 120;
        /**
         * The limiter limits the total number of fireworks fired.
         * When launching fireworks with a click the limiter prevents too many fireworks from firing in a single loop.
         * Limits the launching to one per every specified number of animation cycles.
         * @type {number} limiterTotal
         * 
         * @default
         */
        var limiterTotal = settings.fireworksLimiter || 5;
        /**
         * Counts the number of animation cycles to decide the next launch.
         * @type {number} limiterTick
         * @default
         */
        var limiterTick = 0;
        /**
         * The timer times the autolaunch of the fireworks when there is no mouse clicks.
         * Limits the launching to one per every specified number of animation cycles.
         * @type {number}
         * @default
         */
        var timerTotal = settings.autolauchTimer || 80;
        /**
         * Counts to time the number of animation cycles to decide the next launch.
         * @type {number}
         * @default
         */
        var timerTick = 0;

        //Member functions

        /**
         * Returns a random number within the range specified.
         * @function random
         * @param {number} min - minimum value of a range.
         * @param {number} max - maximum value of a range.
         */
        var random = function (min, max){
            return Math.random() * (max - min) + min;
        };

        /**
         * Returns the distance between two points.
         * @function calculateDistance
         * @param {number} x1 - x co-ordinate of point 1.
         * @param {number} y1 - y co-ordinate of point 1.
         * @param {number} x2 - x co-ordinate of point 2.
         * @param {number} y2 - y co-ordinate of point 2.
         */
        var calculateDistance = function(x1, y1, x2, y2){
            var distX =  x2 - x1,
            distY = y2-y1;
            return Math.sqrt(Math.pow(distX , 2) + Math.pow(distY, 2));
        };

        /**
         * @classdesc
         * Creates a particle on explosion of firework.
         * @class
         * @param {number} x - X coordinate
         * @param {number} y - Y coordinate
         */
        var Particle = function(x, y){
            //current coordinates
            /**
             * Current X coordinate
             * @prop {number}
             */
            this.x = x;
            /**
             * Current Y coordinate
             * @prop {number}
             */
            this.y = y;

            /**
             * Collection of past coordinates that the particle travelled
             * @prop {Array}
             */
            this.coordinates = [];

            /**
             * Total coordinates to be tracked.
             * The trailing is more prominent if the value is higher
             */
            this.coordinateCount = settings.particleTrail || 5;
            if(this.coordinateCount < 1) this.coordinateCount = 5;
            
            //track the past coordinates to create a trailing effect.
            while(this.coordinateCount--){
                this.coordinates.push([this.x, this.y]);
            }

            /**
             * A random angle in all possible directions
             * Angle is in radians
             * @prop {number}
             */
            this.angle = random(0, Math.PI *2);

            /**
             * Speed of the moving particle
             * A random speed from 1 to 10
             * @prop {number}
             */
            this.speed = random(1, 10);
            
            /**
             * Friction slows down moving particle
             * @prop {number}
             */
            this.friction = 0.95;
            
            /**
             * Gravity pulls the particle down.
             * @prop {number}
             */
            this.gravity = 1;
            
            /**
             * Hue of the particle +- 50 of initial {@link CanvasFireworks#hue}
             * @prop {number}
             */
            this.hue = random(hue - 50, hue + 50);
            
            /**
             * Random brightness for particle
             * @prop {number}
             */
            this.brightness = random(50, 80);
            
            /**
             * Transparency of particle
             * @prop {number}
             */
            this.alpha = 1;

            /**
             * The speed at which the particle fades out
             * @prop {number}
             */
            this.decay = random(0.015, 0.03);

            /**
             * Draw the particle on the canvas
             * @function draw
             * @memberOf Particle#
             */
            this.draw = function(){
                ctx.beginPath();

                //Move to last tracked coordinate in the set, then draw a line to current x and y coordinates.
                ctx.moveTo(this.coordinates[this.coordinates.length -1 ][0], this.coordinates[this.coordinates.length -1 ][1]);
                ctx.lineTo(this.x, this.y);
                //Stroke the line in hsla color scheme.
                ctx.strokeStyle = 'hsla(' + this.hue + ', 100%,' + this.brightness + '100%,' + this.alpha + ')';
                ctx.stroke();
            };

            /**
             * Update the particle on each animation cycle.
             * @function update
             * @memberOf Particle#
             * @param {number} index - Index of the particle in particle collection to be updated
             */
            this.update = function( index ){
                //remove the last item in coordinates array
                this.coordinates.pop();

                //add current coordinates to the begining of coordinates array
                this.coordinates.unshift([this.x, this.y]);

                //slow down the particles
                this.speed *= this.friction;

                //apply velocity
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                //fadeout the particle
                this.alpha -= this.decay;

                //remove the particle if transparency is low enough based on the index parameter  passed.
                if(this.alpha <= this.decay){
                    particles.splice(index, 1);
                }
            };
        };

        /**
         * Create a particle group for explosion
         * @function createParticles
         * @param {number} x - initial X coordinate of particle
         * @param {number} y - initial Y coordinate of particle
         */
        var createParticles = function( x, y ){
            /**
             * Maximum number of particles in the group
             * @type {number}
             */
            var particleCount = 30;
            while(particleCount--){
                particles.push(new Particle(x, y));
            }
        };

        /**
         * @classdesc
         * Creates a firework at the specified point and launches it to the target point.
         * @class FireWork
         * @param {number} sx - x co-ordinate of starting point
         * @param {number} sy - y co-ordinate of starting point
         * @param {number} tx - x co-ordinate of target point
         * @param {number} ty - y co-ordinate of target point
         */
        var Firework = function(sx, sy, tx, ty){
            /**
             * Actual co-ordinates.
             */
            this.x = sx;
            this.y = sy;

            /**
             * Starting co-ordinates.
             */
            this.sx = sx;
            this.sy = sy;

            /**
             * Target co-ordinates.
             */
            this.tx = tx;
            this.ty = ty;
            /**
             * The distance between the starting point and target point.
             * @prop {number}
             */
            this.distaceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTravelled = 0;

            /**
             * Track the past coordinates to create a trailing effect.
             * @prop {Array}
             */
            this.coordinates = [];
            this.coordinateCount = 3;

            //populate initial coordinate collection with current coordinates
            while(this.coordinateCount--){
                this.coordinates.push([this.x, this.y]);
            }

            /**
             * The angle between the X - axis and the line joining the starting point and target point.
             * @prop {number}
             */
            this.angle = Math.atan2(ty - sy, tx - sx);

            /**
             * The speed at which the fireworks travel.
             * This propety can be configured via options parameter of CanvasFireworks
             * @prop {number}
             */
            this.speed = settings.speed || 2;

            /**
             * The acceleration of the firework from start to target.
             * This propety can be configured via options parameter of CanvasFireworks
             * @prop {number}
             */
            this.acceleration = settings.acceleration || 1.05;

            /**
             * Brightness value for the fireworks.
             * A random value between a specified range.
             * @prop {number}
             */
            this.brightness = random(60, 70);

            /**
             * The radius of the target circle.
             * A pulsing target circle is drawn at the target point
             * @prop {number}
             */
            this.targetRadius = 1;

            /**
             * Draw fireworks on canvas.
             * @function draw
             * @memberOf Firework#
             */
            this.draw = function(){
                ctx.beginPath();

                //move to last tracked coordinates in the set and draw a line to current x and y
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length -1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = 'hsl(' + hue + ', 100%, ', this.brightness + '%)';
                ctx.stroke();

                ctx.beginPath();
                // draw target circle at target
                ctx.arc(tx, ty, this.targetRadius,0, Math.PI * 2, false);
                ctx.stroke();
            };

            /**
             * Update the fireworks animation with every animation cycle.
             * @function update
             * @memberOf Firework#
             * @param {number} index - the index of the firework to be updated in the {@link CanvasFireworks#fireworks} collection
             */
            this.update = function (index){
                //remove last item from coordinates array
                this.coordinates.pop();

                // add current coordinae to the beggining of coordinates array.
                this.coordinates.unshift([this.x, this.y]);

                //pulse the circle target indicator
                //pulsing done by cycling the target circle's radius
                if(this.targetRadius < 8){
                    //increment radius by 0.3 every cycle until the radius value is 7
                    this.targetRadius += 0.3;
                }
                else{
                    //reset the radius back to 1 if it reaches the maximum limit.
                    this.targetRadius = 1;
                }

                //speed up the firework.
                //makes it appear to accelerate in mid travel
                this.speed *= this.acceleration;

                //find out the velocity of the firework based on angle and speed
                /**
                 * the x-coordinate velocity
                 * @type {number}
                 */
                var vx = Math.cos(this.angle) * this.speed;
                /**
                 * the y-coordinate velocity.
                 * @type {number}
                 */
                var vy = Math.sin(this.angle) * this.speed;

                //calculate the distance travelled by firework after velocity is applied
                this.distanceTravelled = calculateDistance(sx, sy, this.x + vx, this.y + vy);

                //if the distace travelled is greater than the initial distance to target then target has been reached.
                if(this.distanceTravelled >= this.distaceToTarget){
                    // create an explosion
                    createParticles (this.tx, this.ty);

                    //remove the exploded firework
                    fireworks.splice(index, 1);
                }
                else{
                    //target not reached. keep travelling
                    //travel with calculated velocity
                    this.x += vx;
                    this.y += vy;
                }
            };
        };

        /**
         * Update the canvas with fireworks for each animation cycle.
         * @function update
         * @memberOf CanvasFireworks
         */
        this.update = function(){
            //create  random color
            hue = random(0, 360);

            //Usually clearRect() would be used to clear the canvas
            //In order to create a trailing effect instead of clearing the canvas immediately
            //Setting the globalComposite operation to destination-out will allow us to clear the canvas at specific opacity, rather than wiping it entirely
            ctx.globalCompositeOperation = 'destination-out';

            //reduce the alpha property to create more prominent trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, cw, ch);

            //change the composite operation to our main mode
            //changing it to lighter makes more prominent trails
            ctx.globalCompositeOperation = 'lighter';

            //Loop over each firework, draw it and update it
            var i = fireworks.length;
            while(i--){
                fireworks[i].draw();
                fireworks[i].update(i);
            }
            
            //Loop over each firework, draw it and update it
            i = particles.length;
            while(i--){
                particles[i].draw();
                particles[i].update(i);
            }

            //auto launch fireworks if the wiat timer has exceeded waiting time
            if(timerTick >= timerTotal){
                //Start from the bottom middle to random target locations
                fireworks.push(new Firework(cw/2, ch, random(0, cw), random(0,ch/2)));
                timerTick = 0;
            }
            else{
                //increment the timer
                timerTick++;
            }
        };
    }
})();