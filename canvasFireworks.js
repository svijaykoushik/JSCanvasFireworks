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
             * @property {float}
             */
            this.distaceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTravelled = 0;

            /**
             * Track the past coordinates to create a trailing effect.
             * @property {Array}
             */
            this.coordinates = [];
            this.coordinateCount = 3;
        };
    }
})();