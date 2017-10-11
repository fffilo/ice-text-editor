/**
 * Ice Core
 *
 * Inline contenteditable
 *
 * dependencied:
 *     (none)
 *
 * platforms:
 *     - IE10
 *     - Edge
 *     - Opera
 *     - Safari
 *     - Firefox
 *     - Chrome
 */
;(function() {

    // strict mode
    "use strict";

    // globalize
    window.ice = {};

    /**
     * Util
     *
     * @type {Object}
     */
    window.ice.Util = {

        /**
         * Get the first element that matches
         * the selector by testing the node
         * itself and traversing up through
         * its ancestors in the DOM tree
         *
         * @param  {Node}  node
         * @param  {Node}  selector
         * @return {Mixed}
         */
        closest: function(node, selector) {
            while (node && node !== selector) {
                node = node.parentElement;
            }

            return node;
        },

        /**
         * Get next node while searching
         * through children and parent
         * elements
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        nextNode: function(node) {
            if (node.firstChild)
                return node.firstChild;

            while (node) {
                if (node.nextSibling)
                    return node.nextSibling;

                node = node.parentNode;
            }

            return node;
        },

        /**
         * Get/set node css
         *
         * @param  {Node}   node
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {Mixed}
         */
        nodeStyle: function(node, key, value) {
            if (typeof value === "undefined") {
                var css = node.ownerDocument.defaultView.getComputedStyle(node, null);
                return css ? css[key] : "";
            }

            node.style[key] = value;
        },

        /**
         * Get all text nodes in selected range
         * https://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript#answer-28150191
         *
         * @return {Mixed}
         */
        getSelectedTextNodes: function() {
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return null;

            var result = [];
            var range = selection.getRangeAt(0);
            var startContainer = range.startContainer.childNodes[range.startOffset] || range.startContainer;
            var endContainer = range.endContainer.childNodes[range.endOffset] || range.endContainer;
            var commonAncestor = range.commonAncestorContainer;
            var node;

            // walk parent nodes from startContainer to commonAncestor
            for (node = startContainer; node; node = node.parentNode) {
                result.unshift(node);

                if (node == commonAncestor)
                    break;
            }

            // walk children and siblings from startContainer until endContainer is found
            for (node = startContainer; node; node = ice.Util.nextNode(node)) {
                if (!ice.Util.closest(node.parentNode, commonAncestor))
                    break;

                result.push(node);
                if (node == endContainer)
                    break;
            }

            // filter text nodes only
            return result.filter(function(e) {
                return e.nodeType === Node.TEXT_NODE;
            });
        },

        /**
         * Is Mac platform
         *
         * @type {Boolean}
         */
        isMac: [ "Mac68K", "MacPPC", "MacIntel" ].indexOf(window.navigator.platform) > -1

    }

})();
