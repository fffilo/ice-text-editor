/**
 * Ice Editor Shortcuts
 *
 * Predefined additional editor shortcuts taken
 * from wordpress' wysiwyg editor.
 *
 * dependencied:
 *     - ice-core.js
 *     - ice-editor.js
 */
;(function() {

    // strict mode
    "use strict";

    /**
     * Browser shortcuts
     *
     * Each property in shortcut object is in format
     * "{keyCode},{altKey},{ctrlKey},{shiftKey}".
     * All values are numeric (boolean as 0 or 1).
     *
     * Each property value is Array object where
     * first parameter is method name (object can
     * have optional additional arguments).
     *
     * If document keydown event properties
     * (keyCode,altKey,ctrlKey,shiftKey) matches
     * key in shortcut object method will be called
     * (if method exists)
     *
     * @type {Object}
     */
    var shortcuts = {

        // Ctrl+ENTER
        "13,0,1,0": [ "insertHorizontalRule" ],

        // Alt+Shift+D
        "68,1,0,1": [ "strikeThrough" ],

        // Alt+Shift+X
        "88,1,0,1": [ "code" ],

        // Ctrl+K
        "75,1,0,1": [ "createLink" ],

        // Alt+Shift+1
        "49,1,0,1": [ "formatBlock", "h1" ],

        // Alt+Shift+2
        "50,1,0,1": [ "formatBlock", "h2" ],

        // Alt+Shift+3
        "51,1,0,1": [ "formatBlock", "h3" ],

        // Alt+Shift+4
        "52,1,0,1": [ "formatBlock", "h4" ],

        // Alt+Shift+5
        "53,1,0,1": [ "formatBlock", "h5" ],

        // Alt+Shift+6
        "54,1,0,1": [ "formatBlock", "h6" ],

        // Alt+Shift+7
        "55,1,0,1": [ "formatBlock", "p" ],

        // Alt+Shift+Q
        "81,1,0,1": [ "formatBlock", "blockquote" ],

        // Alt+Shift+U
        "85,1,0,1": [ "formatBlock", "bullets" ],

        // Alt+Shift+O
        "79,1,0,1": [ "formatBlock", "numbers" ]

    }

    // Apply shortcuts
    document.addEventListener("DOMContentLoaded", function(e) {
        if (!window.ice && !window.ice.Editor)
            return

        for(var key in shortcuts) {
            ice.Editor.prototype._shortcuts[key] = shortcuts[key];
        }
    });

})();
