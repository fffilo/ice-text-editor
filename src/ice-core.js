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
     * Selection object:
     * see saveSelection and restoreSelection
     * methods
     *
     * @type {Object}
     */
    var _selectionRange = null;

    /**
     * Util
     *
     * @type {Object}
     */
    window.ice.Util = {

        /**
         * Would node be selected by
         * specified selector string
         *
         * @param  {Node}    node
         * @param  {Mixed}   selector
         * @return {Boolean}
         */
        matches: function(node, selector) {
            var func = false
                || node.matches
                || node.matchesSelector
                || node.mozMatchesSelector
                || node.msMatchesSelector
                || node.oMatchesSelector
                || node.webkitMatchesSelector;

            if (func)
                return func.call(node, selector);

            return false;
        },

        /**
         * Check if node matched selector
         *
         * @param  {Mixed}   selector
         * @return {Boolean}
         */
        is: function(node, selector) {
            if (typeof selector === "string")
                return ice.Util.matches(node, selector);
            else if (selector instanceof Node)
                return node === selector;

            return false;
        },

        /**
         * Get the first element that matches
         * the selector by testing the node
         * itself and traversing up through
         * its ancestors in the DOM tree
         *
         * @param  {Node}  node
         * @param  {Mixed}  selector
         * @return {Mixed}
         */
        closest: function(node, selector) {
            while (node && !ice.Util.is(node, selector)) {
                node = node.parentElement;
            }

            return node;
        },

        /**
         * Wrap node
         *
         * @param  {Node}   node
         * @param  {String} tag
         * @return {Node}
         */
        wrapNode: function(node, tag) {
            if (!(node instanceof Node))
                return;

            var el = document.createElement(tag);
            node.parentElement.insertBefore(el, node);
            el.appendChild(node);

            return el;
        },

        /**
         * Wrap nodeList
         *
         * @param  {NodeList} node
         * @param  {String}   tag
         * @return {Node}
         */
        wrapNodeList: function(node, tag) {
            try {
                node = Array.prototype.slice.call(node);
            }
            catch (e) {
                return;
            }

            if (!node.length)
                return;

            var el = document.createElement(tag);
            node[0].parentElement.insertBefore(el, node[0]);

            node.forEach(function(item) {
                el.appendChild(item);
            });

            return el;
        },

        /**
         * Unwrap node
         *
         * @param  {Node} node
         * @return {Node}
         */
        unwrapNode: function(node) {
            if (!(node instanceof Node))
                return;

            var el = node.parentElement;
            el.parentElement.insertBefore(node, el);

            el.normalize();
            if (!el.childNodes.length)
                el.parentElement.removeChild(el);

            return node;
        },

        /**
         * Replace tagName in node
         *
         * @param  {Mixed}  node
         * @param  {String} tagName
         * @return {Mixed}
         */
        replaceTag: function(node, tagName) {
            if (!(node instanceof Node))
                return;

            var el = document.createElement(tagName);
            while (node.childNodes.length) {
                el.appendChild(node.childNodes[0]);
            }

            for (var i = 0; i < node.attributes.length; i++) {
                el.setAttribute(node.attributes[i].name, node.attributes[i].value);
            }

            node.parentElement.insertBefore(el, node);
            node.parentElement.removeChild(node);

            return el;
        },

        /**
         * Get previous node
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        previousNode: function(node) {
            if (node.previousSibling)
                return node.previousSibling;
            else if (node.parentElement)
                return ice.Util.previousNode(node.parentElement);

            return null;
        },

        /**
         * Get previous element node
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        previousElementNode: function(node) {
            let result = null,
                show = NodeFilter.SHOW_ELEMENT,
                accept = NodeFilter.FILTER_ACCEPT,
                reject = NodeFilter.FILTER_REJECT,
                filter = {
                    acceptNode: function(node) {
                        return node.nodeType === Node.ELEMENT_NODE ? accept : reject;
                    },
                },
                prev = node;
            while (prev && !result) {
                prev = ice.Util.previousNode(prev);

                if (prev.nodeType === Node.ELEMENT_NODE)
                    result = prev.ownerDocument.createTreeWalker(prev, show, filter).lastChild() || prev;
            }

            return result && result.nodeType === Node.ELEMENT_NODE ? result : null;
        },

        /**
         * Get previous text node
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        previousTextNode: function(node) {
            var result = null,
                show = NodeFilter.SHOW_TEXT,
                accept = NodeFilter.FILTER_ACCEPT,
                reject = NodeFilter.FILTER_REJECT,
                filter = {
                    acceptNode: function(node) {
                        return node.nodeType === Node.TEXT_NODE ? accept : reject;
                    },
                },
                prev = node;
            while (prev && !result) {
                prev = ice.Util.previousNode(prev);

                if (prev.nodeType === Node.ELEMENT_NODE)
                    result = prev.ownerDocument.createTreeWalker(prev, show, filter).lastChild();
                else if (prev.nodeType === Node.TEXT_NODE)
                    result = prev;
            }

            return result && result.nodeType === Node.TEXT_NODE ? result : null;
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
         * Get next element node
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        nextElementNode: function(node) {
            node = ice.Util.nextNode(node);
            while (node && node.nodeType !== Node.ELEMENT_NODE) {
                node = ice.Util.nextNode(node);
            }

            return node;
        },

        /**
         * Get next text node
         *
         * @param  {Node}  node
         * @return {Mixed}
         */
        nextTextNode: function(node) {
            node = ice.Util.nextNode(node);
            while (node && node.nodeType !== Node.TEXT_NODE) {
                node = ice.Util.nextNode(node);
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
         * Get all nodes in selected range
         * https://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript#answer-28150191
         *
         * @param  {String} selector (optional)
         * @return {Array}
         */
        getSelectedNodes: function(selector) {
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return null;

            var result = [];
            var range = selection.getRangeAt(0);
            var startContainer = range.startContainer;
            var startOffset = range.startOffset;
            var endContainer = range.endContainer;
            var endOffset = range.endOffset;
            var commonAncestor = range.commonAncestorContainer;
            var node;

            // use only text nodes in start container/offset
            if (startContainer.nodeType !== Node.TEXT_NODE) {
                var texts = ice.Util.getTextNodes(startContainer);
                if (texts.length) {
                    startContainer = texts[0];
                    startOffset = 0;
                }
            }

            while (startContainer.nodeType === Node.TEXT_NODE && startOffset === startContainer.length) {
                var next = ice.Util.nextTextNode(startContainer);
                if (next) {
                    startContainer = next;
                    startOffset = 0;
                }
                else
                    break;
            }

            // use only text nodes in end container/offset
            if (endContainer.nodeType !== Node.TEXT_NODE) {
                var texts = ice.Util.getTextNodes(endContainer);
                if (texts.length) {
                    endContainer = texts[texts.length - 1];
                    endOffset = endContainer.length;
                }
            }

            while (endContainer.nodeType === Node.TEXT_NODE && !endOffset) {
                var prev = ice.Util.previousTextNode(endContainer);
                if (prev) {
                    endContainer = prev;
                    endOffset = endContainer.length;
                }
                else
                    break;
            }

            // fix common ancestor
            if (startContainer !== range.startContainer || startOffset !== range.startOffset || endContainer !== range.endContainer || endOffset !== range.endOffset) {
                range = document.createRange();
                range.setStart(startContainer, startOffset);
                range.setEnd(endContainer, endOffset);

                commonAncestor = range.commonAncestorContainer;
            }

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
                if (result.indexOf(node) === -1)
                    result.push(node);
                if (node == endContainer)
                    break;
            }

            // select parent elements
            var parents = [];
            for (var i = 0; i < result.length; i++) {
                node = result[i].parentElement;
                while (node) {
                    if (result.indexOf(node) !== -1)
                        break;
                    else if (parents.indexOf(node) === -1)
                        parents.push(node);
                    else
                        node = node.parentElement;
                }
            }

            // filter selector
            return result.concat(parents).filter(function(node) {
                if (selector)
                    return ice.Util.is(node, selector);
                else
                    return true;
            });
        },

        /**
         * Get all text nodes under node
         *
         * @param  {Node}  node
         * @return {Array}
         */
        getTextNodes: function(node) {
            var walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
            var result = [];

            var child;
            while(child = walk.nextNode())
                result.push(child);

            return result;
        },

        /**
         * Get all text nodes in selected range
         *
         * @return {Array}
         */
        getSelectedTextNodes: function() {
            return ice.Util.getSelectedNodes().filter(function(node) {
                return node.nodeType === Node.TEXT_NODE;
            });
        },

        /**
         * Remember window selection
         *
         * @return {Void}
         */
        saveSelectionRange: function() {
            var selection = window.getSelection();
            _selectionRange = null;
            if (!selection.rangeCount)
                return;

            var range = selection.getRangeAt(0);
            _selectionRange = {
                startContainer: range.startContainer,
                startOffset: range.startOffset,
                endContainer: range.endContainer,
                endOffset: range.endOffset
            }
        },

        /**
         * Restore last saved window selection
         *
         * @return {Void}
         */
        restoreSelectionRange: function() {
            if (!_selectionRange)
                return;

            var range = document.createRange();
            range.setStart(_selectionRange.startContainer, _selectionRange.startOffset);
            range.setEnd(_selectionRange.endContainer, _selectionRange.endOffset);
            _selectionRange = null;

            // set selection
            var select = window.getSelection();
            select.removeAllRanges();
            select.addRange(range);
        },

        /**
         * Is Mac platform
         *
         * @type {Boolean}
         */
        isMac: [ "Mac68K", "MacPPC", "MacIntel" ].indexOf(window.navigator.platform) > -1

    }

})();
