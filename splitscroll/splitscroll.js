/**
 *  Split Scroll
 *
 *  Version: 1.0
 *  Licence: MIT
 *  Author : Leif Marcus
 */
( function( name, definition )
{

    if ( typeof define === 'function' )
    {

        // define for AMD:
        define( definition );

    }
    else if ( typeof module !== 'undefined' && module.exports )
    {
        // exports for Node.js
        module.exports = definition();
    }
    else
    {
        // using the module in the browser:
        var curModule = definition();
        var self    = this;

        var originalModule = self[ name ];

        curModule.noConflict = function()
        {
            self[ name ] = originalModule;

            return curModule;
        };
        self[ name ] = curModule;
    }

}( 'splitScroll', function()
{

    // collect splitscroll events
    window.splitScrollEvents = window.splitScrollEvents || [];

    // detect devices:
    var isiPad   = navigator.userAgent.match( /iPad/i )   != null;
    var isiPhone = navigator.userAgent.match( /iPhone/i ) != null;

    // global variables:
    var tick =  false;
    var rAF  =  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function( cb )
                {
                    setTimeout( cb, 1000 / 60 );
                };

    var SE   =  window.CustomEvent ||
                function( type )
                {
                    var e = document.createEvent( 'Event' );
                    e.initEvent( type, true, true );

                    return e;
                };

    /**
     *  @class Scroller
     *  handles the scrolling
     */
    function Scroller()
    {

        // default scroll callback:
        this.scrollCallback = function() {}; // eslint-disable-line

        // initial viewport:
        this.viewport = {};

        // remove events already set:
        this.destroy();

        // initialize the scroller:
        this._init();

        return this;
    }

    Scroller.prototype = {

        /**
         *  onScroll
         *  Handles the scroll callback
         *  that is fired on each scroll event
         *
         *  @param {Function} callback - scroll callback
         */
        onScroll : function( callback )
        {
            this.scrollCallback = callback;
        },

        /**
         *  _scroll
         *  callback for window.onscroll
         */
        _scroll : function _scroll()
        {
            window.dispatchEvent( new SE( 'scroll:splitScroll' ) );
            tick = !tick;
        },

        /**
         *  _scrollHandler
         *  callback function for the custom scroll event
         *  triggers the scroll fuction on request animation frame
         *  @param {object} obj - this object of scroller
         *  @return {function} - callback function for scroll event
         */
        _scrollHandler : function _scrollHandler( obj )
        {
            return function()
            {
                if ( !tick )
                {
                    tick = !tick;
                    rAF( obj._scroll );
                }
            };
        },

        /**
         *  _scrollFunc
         *  triggers the scroll callback meghod
         *  which is set at the onScroll method.
         */
        _scrollFunc : function( obj )
        {
            return function()
            {
                obj.scrollCallback(
                    document.elementFromPoint( obj.viewport.w25, 1 ),
                    document.elementFromPoint( obj.viewport.w75, 1 )
                );
            };
        },

        /**
         *  _viewportFunc
         *  sets the width and height on resize
         *  and the points where to get the element.
         */
        _viewportFunc : function _viewportFunc( obj )
        {

            return function()
            {
                var width = window.innerWidth;
                var height = window.innerHeight;
                obj.viewport = {
                    width  : width,
                    height : height,
                    w25    : width * 0.25,
                    w75    : width * 0.75
                };
            };

        },

        _init : function _init()
        {

            var viewPortFunc  = this._viewportFunc( this );
            var scrollFunc    = this._scrollFunc( this );
            var scrollHandler = this._scrollHandler( this );

            viewPortFunc(); // run initially

            // save global events:
            // eslint-disable-next-line
            splitScrollEvents = splitScrollEvents.concat( [
                {
                    name     : 'scroll',
                    listener : scrollHandler
                },
                {
                    name     : 'scroll:splitScroll',
                    listener : scrollFunc
                },
                {
                    name     : 'resize',
                    listener : viewPortFunc
                }
            ] );

            if ( isiPad || isiPhone )
            {
                window.addEventListener( 'touchmove', scrollHandler, false );
            }

            window.addEventListener( 'scroll', scrollHandler, false );
            window.addEventListener( 'scroll:splitScroll', scrollFunc, false );
            window.addEventListener( 'resize', viewPortFunc, false );

        },

        destroy : function destroy()
        {
            // eslint-disable-next-line
            splitScrollEvents.forEach( function( evt ) {
                window.removeEventListener( evt.name, evt.listener );
            } );

        }
    };

    /**
     *  @class Split Scroll
     *  Main handling for fixing elements
     *  inside the containers.
     */
    function SplitScroll( props )
    {

        this._init( props || {} );

        return this;
    }

    SplitScroll.prototype = {

        _init : function _init( props )
        {

            var self = this;
            self.props = props;

            self.scroller = new Scroller();

            // run the scroller loop:
            self.scroller.onScroll( function( leftCol, rightCol )
            {

                self._checkMover( self._getContainer( leftCol ) );
                self._checkMover( self._getContainer( rightCol ) );
            } );
        },

        _hasClass : function( el, className )
        {
            return el && el.className &&
                el.className.indexOf( this.props.name + '__' + className ) > -1;
        },

        /**
         *  get container
         *  gets the parent item
         *  @param {HTMLElement} child
         *  @return {HTMLElement}
         */
        _getContainer : function _getContainer( child )
        {

            if ( this._hasClass( child, this.props.scrollItem ) )
            {
                return child;
            }

            var node = child.parentNode;

            if ( this._hasClass( node, this.props.scrollItem ) )
            {
                return node;
            }

            while ( node && !this._hasClass( node, this.props.scrollItem ) )
            {

                if ( this._hasClass( node, this.props.scrollItem ) )
                {
                    return node;
                }

                node = node.parentNode;
            }

            return child;
        },
        /**
         *  set mover class
         *  sets the mover css class name to fixed or absolute
         *  @param {HTMLElement} el   - html element to apply the class to
         *  @param {string} method    - method add or remove
         *  @param {string} className - fixed or absolute as string
         */
        _setMoverClass : function _setClass( el, method, className )
        {

            el.classList[ method ](
                this.props.name +
                '__' + this.props.mover + '--' + className
            );

        },
        /**
         *  Move inside container
         *  @param {Node} container - element of the container
         *  @param {Node} mover - the element that moves inside
         */
        _moverPosition : function move( container, mover )
        {
            var containerBounding = container.getBoundingClientRect();
            var moverBounding = mover.getBoundingClientRect();

            var height = containerBounding.height - moverBounding.height;
            var treshold = containerBounding.top + height;

            if ( treshold > 0 )
            {
                this._setMoverClass( mover, 'add',    'fixed' );
                this._setMoverClass( mover, 'remove', 'absolute' );
            }
            else if ( treshold < 0 )
            {
                this._setMoverClass( mover, 'add',    'absolute' );
                this._setMoverClass( mover, 'remove', 'fixed' );
            }
            if ( containerBounding.top > 0 )
            {
                this._setMoverClass( mover, 'remove', 'absolute' );
                this._setMoverClass( mover, 'remove', 'fixed' );
            }
        },

        _checkMover : function _checkMover( element )
        {

            if ( this._hasClass( element, 'spread' ) )
            {
                this._moverPosition(
                    element,
                    element.querySelector(
                        '.' + this.props.name + '__' + this.props.mover
                    )
                );
            }
        },

        destroy : function destroy()
        {
            var moverClass    = this.props.name +
                                '__' + this.props.mover + '--fixed';
            var moverSelector = '.' + moverClass;

            var elements = document.querySelectorAll( moverSelector );

            for ( var i = 0, len = elements.length; i < len; i++ )
            {
                var el = elements[ i ];
                el.classList.remove( moverClass );
            }
            // remove elements:
            this.scroller.destroy();
        }
    };

    /**
     *  @module SplitScroll
     *  the main module export
     *  @param {object} params - settings for split scroll
     */
    return function splitScroll( params )
    {

        // overall default properties:
        var defaults = {
            name       : 'splitscroll',
            scrollItem : 'item',
            mover      : 'mover'
        };

        // setup properties:
        var props = Object.assign( defaults, params || {} );

        var splitScroll = new SplitScroll( props );

        return splitScroll;
    };
} ) );
