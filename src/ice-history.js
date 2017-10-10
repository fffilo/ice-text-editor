/**
 * Ice Text Editor History
 *
 * Since we're parsing element's data ourselves
 * history can be corrupted. Implementing new
 * history functionality for editor element.
 */
;(function() {

    // strict mode
    "use strict";

    /**
     * Initialize
     *
     * @return {Void}
     */
    ice.Editor.prototype._initHistory = function() {
        // @todo
    }

    /**
     * Destructor
     *
     * @return {Void}
     */
    ice.Editor.prototype._destroyHistory = function() {
        // @todo
    }

    /**
     * Undo
     *
     * @return {Boolean}
     */
    ice.Editor.prototype.undo = function() {
        if (!this.active)
            return false;

        // @todo
        return false;
    }

    /**
     * Redo
     *
     * @return {Boolean}
     */
    ice.Editor.prototype.redo = function() {
        if (!this.active)
            return false;

        // @todo
        return false;
    }

})();
