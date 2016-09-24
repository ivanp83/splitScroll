
(function(name, definition) {
    if (typeof define === 'function') {
        // define for AMD:
        define(definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        // exports for Node.js
        module.exports = definition();
    } else {
        // using the module in the browser:
        var curModule = definition(),
        global = this,
        originalModule = global[name];
        curModule.noConflict = function() {
            global[name] = originalModule;
            return curModule;
        };
        global[name] = curModule;
    }
} ('splitScroll', function() {

    // collect splitscroll events
    window.splitScrollEvents = window.splitScrollEvents || [];

    // scroll the window somehow smoother:
    var tick =  false;
    var rAF  =  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (cb) {
                    setTimeout(cb, 1000 / 60);
                };
    var SE   =  window.CustomEvent ||
                function (type) {
                    var e = document.createEvent('Event');
                    e.initEvent(type, true, true);
                    return e;
                };

    var scroll = function scroll() {
        window.dispatchEvent(new SE('scroll:smoother'));
        tick = !tick;
    }

    var lessGreedyScroll = function lessGreedyScroll() {
        if (!tick) {
            tick = !tick;
            rAF(scroll);
        }
    };

    // overall default properties:
    var defaults = {
        className: 'splitscroll'
    };
    var props = {};


    // callback for scroll event:
    var scrollCallback = function() {};

    var removeEvents = function removeEvents() {
        splitScrollEvents.forEach( function( evt ) {
            window.removeEventListener( evt.name, evt.listener );
        } );
    }

    function getContainer(child) {

        var node = child.parentNode;
        if (!node.className) {
            return child;
        }
        if ( child.className.indexOf(props.className + '__item') > -1 ) {
            return child;
        } else if ( node.className.indexOf(props.className + '__item') > -1 ) {
            return node;
        }

        while ( node.className && node.className.indexOf(props.className + '__item') < 0 ) {
            if ( node.className.indexOf(props.className + '__item') > -1 ) {
                return node;
            }
            node = node.parentNode;
        }
        return child;
    }

    var addEvents = function addEvents() {
        var viewport = {};
        var scrollFunc = function scrollFunc() {
            scrollCallback(
                getContainer( document.elementFromPoint(viewport.w25, 1) ),
                getContainer( document.elementFromPoint(viewport.w75, 1) ),
                viewport
            );
        };
        var viewportFunc = function viewportFunc() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            viewport = {
                width: width, height: height,
                w25: width * 0.25,
                w75: width * 0.75
            }
        };
        viewportFunc(); // run initially;

        window.addEventListener( 'scroll', lessGreedyScroll );
        window.addEventListener( 'scroll:smoother', scrollFunc, true );
        window.addEventListener( 'resize', viewportFunc, true );

        splitScrollEvents = splitScrollEvents.concat( [
            { name: 'scroll', listener: lessGreedyScroll },
            { name: 'scroll:smoother', listener: scrollFunc },
            { name: 'resize', listener: viewportFunc }
        ] );
    }

    var runOnScroll = function runOnScroll( listener ) {
        scrollCallback = listener;
    }

    var move = function move( container, mover ) {
        var containerBounding = container.getBoundingClientRect();
        var moverBounding = mover.getBoundingClientRect();

        var height = containerBounding.height - moverBounding.height;
        var treshold = containerBounding.top + height;

        if (treshold > 0) {
            mover.classList.add( props.className + '__mover--fixed' );
            mover.classList.remove( props.className + '__mover--absolute' );
        } else if (treshold < 0) {
            mover.classList.add( props.className + '__mover--absolute' );
            mover.classList.remove( props.className + '__mover--fixed' );
        }
        if (containerBounding.top > 0) {
            mover.classList.remove( props.className + '__mover--absolute' );
            mover.classList.remove( props.className + '__mover--fixed' );
        }
    }

    var checkMover = function checkMover( element ) {

        if ( element && element.className.indexOf( 'spread' ) >= 0 ) {

            move(
                element,
                element.querySelector( '.' + props.className + '__mover' )
            );

        }

    };

    return function splitScroll( params ) {

        // setup properties:
        props = Object.assign( defaults, params || {} );

        // remove events if they are used already:
        removeEvents();

        // define scroll handling:
        runOnScroll(function( leftCol, rightCol, viewport ) {
            checkMover( leftCol );
            checkMover( rightCol );
        });

        // add scroll event:
        addEvents();

        return {
            props: props
        };
    };
}));

var start = function start() {
    splitScroll({});
}
document.addEventListener( "DOMContentLoaded", start );
