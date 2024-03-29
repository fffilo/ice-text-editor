/**
 * Ice Editor
 *
 * Inline contenteditable text editor
 *
 * dependencied:
 *     - ice-core.js
 */
;(function() {

    // strict mode
    "use strict";

    /**
     * ice_Editor constructor
     *
     * @param {Node}   element
     * @param {Object} options
     */
    var ice_Editor = function(element, options) {
        if (!(this instanceof ice_Editor))
            throw "ice.Editor: ice.Editor is a constructor";

        this._element = element;
        this._options = options;

        this._init();
    }

    /**
     * ice_Editor prototype
     *
     * @type {Object}
     */
    ice_Editor.prototype = {

        /**
         * Element class attribute
         *
         * @type {String}
         */
        _className: "ice-editor",

        /**
         * List of inline elements
         *
         * @type {Array}
         */
        _inlineElements: [ "a", "abbr", "acronym", "b", "bdo", "big", "br", "button", "cite", "code", "dfn", "em", "i", "img", "input", "kbd", "label", "map", "object", "q", "samp", "script", "select", "small", "span", "strong", "sub", "sup", "textarea", "time", "tt", "var" ],

        /**
         * List of block elements
         *
         * @type {Array}
         */
        _blockElements: [ "address", "article", "aside", "blockquote", "canvas", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "noscript", "ol", "output", "p", "pre", "section", "table", "tfoot", "ul", "video" ],

        _noElements: [ "meta", "img", ],

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            defaultTag: "p",
            allowLineBreak: true,
            allowHorizontalRule: false,
            allowSplit: true,
            allowRichtextPaste: true,
            autoSelectLink: false,
            autoSelectAll: false,
            allowedBlocks: [
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "p",
                "pre",
                "blockquote",
                "ul",
                "ol"
            ]
        },

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
        _shortcuts: {
            "13,0,0,0": [ "split" ],                    // Enter
            "13,0,0,1": [ "insertLineBreak" ],          // Shift+Enter
            "13,0,1,0": [ "insertHorizontalRule" ],     // Ctrl+Enter
            "90,0,1,0": [ "undo" ],                     // Ctrl+Z
            "89,0,1,0": [ "redo" ],                     // Ctrl+Y
            "66,0,1,0": [ "bold" ],                     // Ctrl+B
            "73,0,1,0": [ "italic" ],                   // Ctrl+I
            "85,0,1,0": [ "underline" ]                 // Ctrl+U
        },

        /**
         * Initialize
         *
         * @return {Void}
         */
        _init: function() {
            if (typeof this.element !== "object" || this.element.nodeType !== Node.ELEMENT_NODE)
                throw "ice.Editor: Constructor element argument must be Node.ELEMENT_NODE";
            if (this.element.ice)
                return;

            // options
            this._options = typeof this._options === "object" ? this._options : {};
            for (var i in this._defaults) {
                if (!(i in this._options))
                    this._options[i] = this._defaults[i];
            }
            for (var i in this._options) {
                if (!(i in this._defaults))
                    delete this._options[i];
            }

            // prepare editor
            this.element.classList.add(this._className);
            this.element.setAttribute("contenteditable", "true");
            this.element.ice = this;

            // call method that starts with _init
            for (var method in this) {
                if (method !== "_init" && method.substr(0, 5) === "_init")
                    this[method]();
            }

            // bind element events to method that starts with _handle
            for (var method in this) {
                if (method.substr(0, 7) === "_handle") {
                    var arr = method.replace(/([A-Z])/g, "_$1").toLowerCase().split("_");
                    var event = arr[2];
                    //var desc = arr[3];

                    this.element.addEventListener(event, this[method]);
                }
            }

            // remove empty span elements
            this.element.querySelectorAll("span:empty").forEach(function(node) {
                node.parentElement.removeChild(node);
            });

            this._strip();
            this._fixBlocks();
            this._triggerChange();
        },

        /**
         * Destructor:
         * remove contentaditable attribute on
         * this.element and revert attributes
         * as before initialization
         *
         * @return {Void}
         */
        destroy: function() {
            this.element.removeAttribute("contenteditable");
            this.element.classList.remove(this._className);

            for (var method in this) {
                // unbind events
                if (/^_handle/.test(method)) {
                    var arr = method.replace(/([A-Z])/g, "_$1").toLowerCase().split("_");
                    var event = arr[2];
                    //var desc = arr[3];

                    this.element.removeEventListener(event, this[method]);
                }

                // call method that starts with _destroy
                if (/^_destroy/.test(method))
                    this[method]();
            }

            // clear
            delete this.element.ice;
            this._element = null;
            this._options = null;
        },

        /**
         * Get this.element object
         *
         * @return {Object}
         */
        get element() {
            return this._element;
        },

        /**
         * Get this.element document object
         *
         * @return {Object}
         */
        get document() {
            return this.element.ownerDocument;
        },

        /**
         * Get this.element window object
         *
         * @return {Object}
         */
        get window() {
            return this.document.defaultView;
        },

        /**
         * Is this.element active element
         *
         * @return {Boolean}
         */
        get active() {
            return this === ice.Util.getActiveEditor();
        },

        /**
         * Get element.innerHTML
         * prettified
         *
         * @return {String}
         */
        get prettyHTML() {
            var tag = this.options("allowedBlocks").join("|") + "|hr"
            var re1 = new RegExp("(<\/(" + tag + ")>)(<(" + tag + ")>)", "g");

            var tag = "hr";
            var re2 = new RegExp("(\\s+)?(<(" + tag + ")(\\s*\\/)?>)(\\s+)?", "g");

            return this.element.innerHTML
                .replace(re1, "$1\n$3")
                .replace(re2, "\n$2\n")
                .trim();
        },

        /**
         * Get/set option(s)
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {Mixed}
         */
        options: function(key, value) {
            if (typeof key === "undefined")
                return this._options;
            else if (typeof value === "undefined")
                return this._options[key];
            else if (!(key in this._defaults))
                return;

            this._options[key] = value;
        },

        /**
         * Set background color on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        backColor: function(value) {
            if (!this.active)
                return false;

            return this._execCommandStyleWithCSS("backColor", value);
        },

        /**
         * Set font weight bold on selection
         *
         * @return {Boolean}
         */
        bold: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutOrWithCSS("bold");
        },

        /**
         * Set font name on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        fontName: function(value) {
            if (!this.active)
                return false;

            return this._execCommandStyleWithCSS("fontName", value);
        },

        /**
         * Set font size on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        fontSize: function(value) {
            if (!this.active)
                return false;

            this._skipDispatch = true;
            var result = this._execCommandStyleWithCSS("fontSize", value);

            // set real units (browser uses 1-7)
            if (result && isNaN(value*1))
                ice.Util.getSelectedNodes("." + this._className + " [style*=font-size]").forEach(function(node) {
                    node.style.fontSize = value;
                });

            delete this._skipDispatch;
            this._handleInput();

            return result;
        },

        /**
         * Set color on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        foreColor: function(value) {
            if (!this.active)
                return false;

            return this._execCommandStyleWithCSS("foreColor", value);
        },

        /**
         * Set background color on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        hiliteColor: function(value) {
            if (!this.active)
                return false;

            return this._execCommandStyleWithCSS("hiliteColor", value);
        },

        /**
         * Set font style italic on selection
         *
         * @return {Boolean}
         */
        italic: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutOrWithCSS("italic");
        },

        /**
         * Set text decoration strikethrough on selection
         *
         * @return {Boolean}
         */
        strikeThrough: function() {
            if (!this.active)
                return false;

            this._skipDispatch = true;
            var result = this._execCommandStyleWithoutOrWithCSS("strikeThrough");

            // replace depricated strike tag with s tag
            if (result) {
                ice.Util.saveSelectionRange();

                ice.Util.getSelectedNodes("strike").forEach(function(node) {
                    ice.Util.replaceTag(node, "s");
                });

                ice.Util.restoreSelectionRange();
            }

            delete this._skipDispatch;
            this._handleInput();

            return result;
        },

        /**
         * Set subscript on selection
         *
         * @return {Boolean}
         */
        subscript: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutCSS("subscript");
        },

        /**
         * Set superscript on selection
         *
         * @return {Boolean}
         */
        superscript: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutCSS("superscript");
        },

        /**
         * Set text decoration underline on selection
         *
         * @return {Boolean}
         */
        underline: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutOrWithCSS("underline");
        },

        /**
         * Set text align on selection
         *
         * @param  {String}  value left|right|center|justify
         * @return {Boolean}
         */
        align: function(value) {
            if (!this.active)
                return false;

            var method;
            value = value.toLowerCase();
            if (value === "center")
                value = "justifyCenter";
            if (value === "justify")
                value = "justifyFull";
            if (value === "left")
                value = "justifyLeft";
            if (value === "right")
                value = "justifyRight";
            if (!value)
                return false;

            return this._execCommandStyleWithCSS(value);
        },

        /**
         * Set link on selection
         *
         * @param  {String}  value  url
         * @param  {String}  target (optional)
         * @param  {String}  rel    (optional)
         * @return {Boolean}
         */
        createLink: function(value, target, rel) {
            if (!this.active)
                return false;

            // use value from decorations
            var decoration = this.decorations();
            if (value === null)
                value = decoration.linkURL;
            if (value === null)
                return false;

            // replace null target/rel with current one
            if (target === null)
                target = decoration.linkTarget;
            if (rel === null)
                rel = decoration.linkRel;

            this._skipDispatch = true;
            var result = this._execCommand("createLink", value);
            var link = ice.Util.getSelectedNodes("." + this._className + " a");

            // set target/rel attributes
            link.forEach(function(node) {
                node.removeAttribute("target");
                node.removeAttribute("rel");
                node.removeAttribute("_moz_dirty");

                if (target)
                    node.setAttribute("target", target);
                if (rel)
                    node.setAttribute("rel", rel);
            });

            delete this._skipDispatch;
            if (result || target !== decoration.target || rel !== decoration.rel) {
                var event = new Event("input", { bubbles: true });
                this.element.dispatchEvent(event);
            }
            else
                // this._execCommand already triggered input
                // event, doing normalization only
                this._handleInput();

            return result;
        },

        /**
         * Unlink selection
         *
         * @return {Boolean}
         */
        unlink: function() {
            if (!this.active)
                return false;

            return this._execCommand("unlink");
        },

        /**
         * Edit link rel attribute
         *
         * @param  {String}  relation nofollow or noopener or noreferrer...
         * @param  {Boolean} value    add or remove relation
         * @return {Boolean}
         */
        linkRel: function(relation, value) {
            var result = false;
            if (!this.active)
                return result;

            var decoration = this.decorations();
            if (!decoration.linkCount)
                return result;

            this._skipDispatch = true;

            ice.Util.getSelectedNodes("." + this._className + " a").forEach(function(node) {
                var attr = node.getAttribute("rel"),
                    arr = attr ? attr.replace(/^\s+|\s+$/g, "").split(/\s+/) : [],
                    index = arr.indexOf(relation);
                if ((value && index !== -1) || (!value && index === -1))
                    return;

                if (value)
                    arr.push(relation);
                else
                    arr.splice(index, 1);

                if (arr.length)
                    node.setAttribute("rel", arr.join(" "));
                else
                    node.removeAttribute("rel");

                result = true;
            });

            delete this._skipDispatch;

            if (result) {
                var event = new Event("input", { bubbles: true });
                this.element.dispatchEvent(event);
            }

            return result;
        },

        /**
         * Remove format on selection
         *
         * @return {Boolean}
         */
        removeFormat: function() {
            if (!this.active)
                return false;

            return this._execCommand("removeFormat");
        },

        /**
         * Split current block element
         *
         * @return {Boolean}
         */
        split: function() {
            if (!this.active)
                return false;
            else if (!this.options("defaultTag") || !this.options("allowSplit"))
                return this.insertLineBreak();

            var tag = this.options("defaultTag");
            var result = this._execCommand("insertParagraph");
            var select = window.getSelection();
            var range = select.getRangeAt(0);
            var block = this._closestBlock(range.startContainer, true);
            var trigger = false;

            // on split empty <li> tag editor inserts
            // <div> instead <p>
            if (tag !== "div") {
                if (block && block.tagName === "DIV") {
                    block = ice.Util.replaceTag(block, tag);
                    block.innerHTML = "<br />";

                    range = document.createRange();
                    range.setStart(block, 0);
                    range.setEnd(block, 0);
                    select.removeAllRanges();
                    select.addRange(range);

                    trigger = true;
                }
            }

            // firefox creates new empty <ul> on
            // <ul> split
            if (block && block.nextElementSibling && block.nextElementSibling.tagName === "UL" && !block.nextElementSibling.childElementCount) {
                block.nextElementSibling.parentNode.removeChild(block.nextElementSibling);
                trigger = true;
            }

            if (trigger)
                this._triggerChange();

            return result;
        },

        /**
         * Insert line break tag (br)
         *
         * @return {Boolean}
         */
        insertLineBreak: function() {
            if (!this.active)
                return false;
            else if (!this.options("allowLineBreak"))
                return false;

            //return this._execCommand("insertHTML", "<br />");
            return this._execCommand("insertLineBreak");
        },

        /**
         * Insert horizontal rule tag (hr)
         *
         * @return {Boolean}
         */
        insertHorizontalRule: function() {
            if (!this.active || !this.options("defaultTag") || !this.options("allowHorizontalRule"))
                return false;

            // @todo
            //return this._execCommand("insertHTML", "<hr />");
            return false;
        },

        /**
         * Format block: wrap block tag around the
         * line containing the current selection
         *
         * @param  {String}  value see options.allowedBlocks
         * @return {Boolean}
         */
        formatBlock: function(value) {
            value = value.toLowerCase();
            if (!this.active || !value || this.options("allowedBlocks").indexOf(value) === -1)
                return false;

            var decor = this.decorations();
            if (decor.formatBlock === value)
                return false;

            this._skipDispatch = true;
            var result;

            // toggle list elements
            while (ice.Util.getSelectedNodes("." + this._className + " ol").length) {
                this._execCommand("insertOrderedList");
            }
            while (ice.Util.getSelectedNodes("." + this._className + " ul").length) {
                this._execCommand("insertUnorderedList");
            }

            // reset block to paragraph
            this._execCommand("formatBlock", "<h6>");
            this._execCommand("formatBlock", "<p>");

            // format block
            if (value === "ol")
                result = this._execCommand("insertOrderedList");
            else if (value === "ul")
                result = this._execCommand("insertUnorderedList");
            else if (value !== "p")
                result = this._execCommand("formatBlock", "<" + value + ">");

            // @todo - while converting list to block
            // every li element shoud be separate block
            // (chrome separate it with <br>)

            // some browsers (chrome) inserts ol/ul inside
            // block elements (paragraph), and since we
            // want list element to act as block we're
            // gonna unwrap it
            if (result && ["ol", "ul"].indexOf(value) !== -1) {
                ice.Util.getSelectedNodes("." + this._className + " p > ol, ." + this._className + " p > ul").forEach(function(node) {
                    ice.Util.saveSelectionRange();
                    ice.Util.unwrapNode(node);
                    ice.Util.restoreSelectionRange();
                });
            }

            delete this._skipDispatch;
            this._handleInput();

            return result;
        },

        /**
         * Undo
         *
         * Since we're parsing element's data ourselves
         * history can be corrupted, so disabling this
         * option
         *
         * @return {Boolean}
         */
        undo: function() {
            if (!this.active)
                return false;

            return false;
        },

        /**
         * Redo
         *
         * Since we're parsing element's data ourselves
         * history can be corrupted, so disabling this
         * option
         *
         * @return {Boolean}
         */
        redo: function() {
            if (!this.active)
                return false;

            return false
        },

        /**
         * Filter selection
         *
         * @param  {String} selector
         * @return {Void}
         */
        filterSelection: function(selector) {
            if (!this.active)
                return;

            var node = ice.Util.getSelectedNodes(selector);
            if (!node || !node.length)
                return;

            var text = ice.Util.getTextNodes(node[0]);
            if (!text)
                return;

            var select = window.getSelection();
            var range = select.getRangeAt(0);
            var start = text[0];
            var end = text[text.length - 1]

            // selection not changed
            if (range.startContainer === start && range.startOffset === 0 && range.endContainer === end && range.endOffset === end.length)
                return;

            range = document.createRange();
            range.setStart(start, 0);
            range.setEnd(end, end.length);
            select.removeAllRanges();
            select.addRange(range);
        },

        /**
         * Get selection decorations
         *
         * @return {Object}
         */
        decorations: function() {
            if (!this.active)
                return null;

            var node = ice.Util.getSelectedTextNodes();
            var doc = this.document;
            var result = {
                //formatBlock: null,
                tagList: [],
                //align: null,
                //backColor: doc.queryCommandValue("backColor"),
                bold: doc.queryCommandState("bold"),
                //fontName: doc.queryCommandValue("fontName"),
                //fontSize: doc.queryCommandValue("fontSize"),
                //foreColor: doc.queryCommandValue("foreColor"),
                //hiliteColor: doc.queryCommandValue("backColor"),
                italic: doc.queryCommandState("italic"),
                //linkURL: null,
                //linkTarget: null,
                //linkRel: null,
                linkCount: 0,
                strikeThrough: doc.queryCommandState("strikeThrough"),
                subscript: doc.queryCommandState("subscript"),
                superscript: doc.queryCommandState("superscript"),
                underline: doc.queryCommandState("underline")
            }

            // block tags
            for (var i = 0; i < node.length; i++) {
                var block = this._closestBlock(node[i]);
                if (!block)
                    continue;

                var tag = block.tagName.toLowerCase();
                if (!("formatBlock" in result))
                    result.formatBlock = tag;
                else if (result.formatBlock !== tag) {
                    result.formatBlock = null;
                    break;
                }
            }

            // get states from css
            var style = ice.Util.nodeStyle;
            for (var i = 0; i < node.length; i++) {
                var el = node[i].parentElement;
                var css = style(el, "text-align");
                if (!("align" in result))
                    result.align = css;
                else if (result.align !== css)
                    result.align = null;
                if (result.align === "justify-all")
                    result.align = "justify";
                else if (result.align === "start" && style(el, "direction") === "rtl")
                    result.align = "right";
                else if (result.align === "start")
                    result.align = "left";
                else if (result.align === "end" && style(el, "direction") === "rtl")
                    result.align = "left";
                else if (result.align === "end")
                    result.align = "right";

                var css = style(el, "background-color");
                if (css.replace(/\s+/g, "") !== "rgba(0,0,0,0)") {
                    if (!("backColor" in result))
                        result.backColor = css;
                    else if (result.backColor !== css)
                        result.backColor = null;
                }

                var css = style(el, "font-family");
                if (!("fontName" in result))
                    result.fontName = css;
                else if (result.fontName !== css)
                    result.fontName = null;

                var css = style(el, "font-size");
                if (!("fontSize" in result))
                    result.fontSize = css;
                else if (result.fontSize !== css)
                    result.fontSize = null;

                var css = style(el, "color");
                if (!("foreColor" in result))
                    result.foreColor = css;
                else if (result.foreColor !== css)
                    result.foreColor = null;

                var link = ice.Util.closest(node[i], "a");
                if (link) {
                    var href = link.getAttribute("href");
                    var target = link.target || null;
                    var rel = link.rel || null;
                    result.linkCount += 1;

                    if (!("linkURL" in result))
                        result.linkURL = href;
                    else if (result.linkURL !== href)
                        result.linkURL = null;

                    if (!("linkTarget" in result))
                        result.linkTarget = target;
                    else if (result.linkTarget !== target)
                        result.linkTarget = null;

                    if (!("linkRel" in result))
                        result.linkRel = rel;
                    else if (result.linkRel !== rel)
                        result.linkRel = null;
                }
                else {
                    result.linkURL = null;
                    result.linkTarget = null;
                    result.linkRel = null;
                }
            }

            // 'till now we ignored transparent backgrounds,
            // so set it if not already done so...
            if (!("backColor" in result))
                result.backColor = style(this.element, "background-color");
            result.hiliteColor = result.backColor;

            return result;
        },

        /**
         * Find closest block node
         *
         * @param  {Object}  node
         * @param  {Boolean} allBlocks (optional)
         * @return {Object}
         */
        _closestBlock: function(node, allBlocks) {
            var blocks = allBlocks ? this._blockElements : this.options("allowedBlocks");
            while (node && (!node.tagName || node.tagName && blocks.indexOf(node.tagName.toLowerCase()) === -1)) {
                node = node.parentNode;

                if (node === this.element)
                    return null;
            }

            return node;
        },

        /**
         * Remove comments and whitespaces between block
         * elements
         *
         * @return {Void}
         */
        _strip: function() {
            this._innerHTML = this.element.innerHTML;

            //ice.Util.getTextNodes(this.element).forEach(function(node) {
            //    if (/^\s+$/.test(node.nodeValue))
            //        node.parentElement.removeChild(node);
            //});

            var re1 = new RegExp("<!--[\\s\\S]*?-->", "g");
            var re2 = new RegExp("\\s+(<(" + this.options("allowedBlocks").join("|") + "|hr)>)", "g");
            var innerHTML = this.element.innerHTML
                .replace(re1, "")
                .replace(re2, "$1")
                .trim();

            if (innerHTML !== this.element.innerHTML)
                this.element.innerHTML = innerHTML;
        },

        /**
         * Fix blocks: join/strip block elements
         * and br tags
         *
         * @param  {Object} node (optional)
         * @return {Void}
         */
        _fixBlocks: function(node) {
            if (!node)
                node = this.element;

            var blocks = this.options("allowedBlocks");
            var split = this.options("allowSplit");
            var lnbr = this.options("allowLineBreak");
            var tag = this.options("defaultTag");

            // allow list elements
            if (blocks.indexOf("ul") !== -1 || blocks.indexOf("ol") !== -1) {
                blocks = blocks.slice(0);
                blocks.push("li");
            }

            // difference between block elements
            // and allowed blocks
            var diff = this._blockElements.filter(function(item) {
                return blocks.indexOf(item) < 0;
            });

            // replace not alowed block elements
            // whit default one
            var children = node.querySelectorAll(diff.join(","));
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                ice.Util.replaceTag(child, tag);
            }

            // remove meta
            var children = node.querySelectorAll(this._noElements.join(","));
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                child.parentElement.removeChild(child);
            }

            // do not allow a tag inside a tag
            var children = node.querySelectorAll("a");
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                if (ice.Util.is(child, "a a")) {
                    child = ice.Util.replaceTag(child, "span");
                    [ "download", "href", "hreflang", "media", "rel", "target", "type" ].forEach(function(item) {
                        child.removeAttribute(item);
                    });
                }
            }

            // pasting h1 tag with font-size style in it
            // will preserve font-size while changing it
            // to h2, so remove style/class attributes
            // for all block elements
            // addition: we need to preserve textAlign
            // inline style
            var children = node.querySelectorAll(blocks.join(","));
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                var preserveClass = [];
                var preserveProp = {};
                [ "textAlign" ].forEach(function(item) {
                    if (child.style[item])
                        preserveProp[item] = child.style[item];
                });

                // remove class/style
                [ "class", "style" ].forEach(function(item) {
                    child.removeAttribute(item);
                });

                // set preserved class/style
                preserveClass.forEach(function(item) {
                    child.classList.add(item);
                });
                for (var key in preserveProp) {
                    child.style[key] = preserveProp[key];
                }
            }

            // replace <font> with <span>
            this._fixFontTag(node);

            // wrap non block elements
            var children = Array.prototype.slice.call(node.childNodes).filter(function(item) {
                return item.nodeType !== Node.ELEMENT_NODE || blocks.indexOf(item.tagName.toLowerCase()) === -1;
            });
            var wrapper = [];
            while (children.length) {
                var child = children.shift();
                if (!wrapper.length) {
                    wrapper.push([ child ]);
                    continue;
                }

                var group = wrapper[wrapper.length - 1];
                var last = group[group.length - 1];
                if (last === child.previousElementSibling) {
                    group.push(child);
                    continue;
                }

                wrapper.push([ child ]);
            }
            while (wrapper.length) {
                var group = wrapper.shift();
                ice.Util.wrapNodeList(group, tag);
            }

            // block split not allowed, append all content
            // to first block element with line breaks
            if (!split) {
                var children = node.childNodes;
                children = Array.prototype.slice.call(children);
                var target = children.shift();

                while (children.length) {
                    var child = children.shift();

                    child.childNodes.forEach(function(item) {
                        target.appendChild(item);
                    });

                    var br = this.document.createElement("br");
                    target.appendChild(br);

                    child.parentNode.removeChild(child);
                }
            }

            // line break not allowed, replace br tag with
            // text node with space in it
            if (!lnbr) {
                var children = node.querySelectorAll("br");
                children = Array.prototype.slice.call(children);
                while (children.length) {
                    var child = children.shift();

                    var br = this.document.createTextNode(" ");
                    child.parentNode.insertBefore(br, child);
                    child.parentNode.removeChild(child);
                }
            }

            // block inside block
            var selector = blocks
                .filter(function(item) {
                    return item !== "li";
                })
                .map(function(item) {
                    return ".ice-editor " + tag + " " + item;
                })
                .join(", ");
            var children = node.querySelectorAll(selector);
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                var br = this.document.createElement("br");
                child.parentNode.insertBefore(br, child);

                child.childNodes.forEach(function(item) {
                    child.parentElement.insertBefore(item, child);
                });

                child.parentElement.removeChild(child);
            }

            // remove empty blocks
            var children = node.querySelectorAll(tag + ":empty");
            children = Array.prototype.slice.call(children);
            while (children.length) {
                var child = children.shift();
                child.parentElement.removeChild(child);
            }

            // no default tag on element, wrap it
            //if (node === this.element && !node.querySelectorAll(tag).length) {
            //    var html = node.innerHTML;
            //    html = "<" + tag + ">" + html + "</" + tag + ">";
            //    node.innerHTML = html;
            //}

            node.normalize();
        },

        /**
         * Fix paste: remove/replace/fix element
         * child nodes
         *
         * @param  {Object} node
         * @return {Void}
         */
        _fixPaste: function(node) {
            var doc = this.document;
            var blockElements = this._blockElements;
            var validTags = [ "h1", "h2", "h3", "h4", "h5", "h6", "p", "pre", "blockquote", "ul", "ol", "li", "a", "b", "br", "hr", "i", "s", "span", "sub", "sup" ];
            var replaceTags = { font: "span", strong: "b", em: "i", strike: "s", del: "s" };
            var attrToStyle = { color: "color", face: "font-family", size: "font-size" };
            var resetStyleForTags = { b: "font-weight", i: "font-style", s: "text-decoration" };
            var innerWrapStyle = { "font-weight: bold": "b", "font-style: italic": "i", "font-style: oblique": "i", "text-decoration: line-through": "s", "text-decoration: underline": "u", "text-decoration-line: underline": "u" };
            var validStylesInline = [ "background-color", "color", "font-family", "font-size", "font-style", "font-weight", "text-decoration", "text-decoration-line" ];
            var validStylesBlock = [ "text-align" ];
            var validAttributes = [ "style", "href", "target", "rel" ];

            // list all element children (in reverse order)
            var childSelector = "*:not(.ice-preserve):not(.ice-preserve *)";
            var children = node.querySelectorAll(childSelector);
            children = Array.prototype.slice.call(children);
            children.reverse();

            // iterate children and fix them
            children.forEach(function(child) {
                var newChild = child;
                var tag = child.tagName.toLowerCase();
                var newTag = tag;
                if (validTags.indexOf(newTag) === -1)
                    newTag = "span";
                if (newTag in replaceTags)
                    newTag = replaceTags[newTag];

                // fix style attribute (remove duplicates,
                // alphabetize)
                child.setAttribute("style", child.style.cssText);

                // convert attributes to css styles (eq.
                // replace color attribute with color css)
                for (var attr in attrToStyle) {
                    var value = child.getAttribute(attr);
                    var css = child.style[attr];
                    if (!value || css)
                        continue;

                    child.removeAttribute(attr);
                    child.style[attrToStyle[attr]] = value;
                }

                // remove unnecessary attributes
                Array.prototype.slice.call(child.attributes).forEach(function(item) {
                    if (validAttributes.indexOf(item.name) === -1)
                        child.removeAttribute(item.name);
                });

                // remove some child styles (no need for
                // eq. box-sizing)
                Array.prototype.slice.call(child.style).forEach(function(item) {
                    if ((validStylesBlock.indexOf(newTag) !== -1 ? validStylesBlock : validStylesInline).indexOf(item) === -1)
                        child.style[item] = null;
                });

                // reset some styles (no need for eq.
                // font-weight:bold on <b>)
                if (newTag in resetStyleForTags)
                    child.style[resetStyleForTags[newTag]] = null;

                // inner wrap child for with styles (eq.
                // <span style="font-weight:bold"/> to
                // <span><b/></span>)
                Array.prototype.slice.call(child.style).forEach(function(item) {
                    if ((item + ": " + child.style[item]) in innerWrapStyle) {
                        var temp = doc.createElement(innerWrapStyle[item + ": " + child.style[item]]);
                        Array.prototype.slice.call(child.childNodes).forEach(function(item) {
                            temp.appendChild(item);
                        });

                        child.appendChild(temp);
                        child.style[item] = null;
                    }
                });

                // tag is valid, do nothing
                if (tag === newTag)
                    return;

                // child has children
                if (child.childNodes.length) {
                    // create new element
                    newChild = doc.createElement(newTag);
                    Array.prototype.slice.call(child.childNodes).forEach(function(item) {
                        newChild.appendChild(item);
                    });

                    // replace it with old one
                    child.parentElement.insertBefore(newChild, child);

                    // ...and apply styles
                    Array.prototype.slice.call(child.style).forEach(function(item) {
                        newChild.style[item] = child.style[item];
                    });

                    // remove span with empty stylesheet (unwrap)
                    if (newTag === "span" && !newChild.style.cssText) {
                        var temp = newChild.childNodes[0];
                        Array.prototype.slice.call(newChild.childNodes).forEach(function(item) {
                            newChild.parentElement.insertBefore(item, newChild);
                        });

                        newChild.parentElement.removeChild(newChild);
                        newChild = temp || null;
                    }

                    // apply span's stylesheet to it's only-child and remove span (unwrap)
                    else if (newTag === "span" && newChild.childNodes.length === 1 && newChild.childNodes[0].nodeType !== Node.TEXT_NODE ) {
                        Array.prototype.slice.call(newChild.style).forEach(function(item) {
                            if (newChild.childNodes[0].style[item])
                                return;
                            if (item === resetStyleForTags[newChild.childNodes[0].tagName.toLowerCase()])
                                return;

                            newChild.childNodes[0].style[item] = newChild.style[item];
                        });

                        var temp = newChild.childNodes[0];
                        Array.prototype.slice.call(newChild.childNodes).forEach(function(item) {
                            newChild.parentElement.insertBefore(item, newChild);
                        });

                        newChild.parentElement.removeChild(newChild);
                        newChild = temp || null;
                    }

                    // add linebreak before newChild if original node is
                    // block type or previous node is block type (no need
                    // to check next node be cause we're itarating in
                    // reverse order and that node has already beed
                    // altered)
                    if (newChild && newChild.previousElementSibling && ((blockElements.indexOf(tag) !== -1) || (blockElements.indexOf(newChild.previousElementSibling.tagName.toLowerCase()) !== -1))) {
                        var temp = doc.createElement("br");
                        newChild.parentElement.insertBefore(temp, newChild);
                    }
                }

                // remove original element
                child.parentElement.removeChild(child);
            });
        },

        /**
         * Replace depricated <font> with <span>
         *
         * @param  {Object} node
         * @return {Void}
         */
        _fixFontTag: function(node) {
            var children = Array.prototype.slice.call(node.querySelectorAll("font"));
            while (children.length) {
                ice.Util.saveSelectionRange();

                var font = children.shift();
                var span;

                if (font.childNodes.length === 1 && font.childNodes[0].nodeType === Node.ELEMENT_NODE && font.childNodes[0].tagName === "SPAN")
                    span = font.childNodes[0];
                else {
                    span = this.document.createElement("span");
                    while (font.childNodes.length) {
                        span.appendChild(font.childNodes[0]);
                    }
                }

                span.style.color = span.style.color || font.getAttribute("color") || "";
                span.style.fontFamily = span.style.fontFamily || font.getAttribute("face") || "";

                font.parentNode.insertBefore(span, font);
                font.parentNode.removeChild(font);

                ice.Util.restoreSelectionRange();
            }
        },

        /**
         * Trigger event
         *
         * @param  {String} eventName
         * @param  {Object} options   (optional)
         * @return {Object}
         */
        _trigger: function(eventName, options) {
            if (this._skipDispatch === true || this._skipDispatch === eventName)
                return null;

            // @todo - in IE CustomEvent is not constructor
            var event = new CustomEvent("ice" + eventName, options || {});
            this.element.dispatchEvent(event);

            return event;
        },

        /**
         * Triggers icechange event on element node
         *
         * @return {Void}
         */
        _triggerChange: function() {
            this.element.normalize();

            if (this._innerHTML !== this.element.innerHTML && this._trigger("change", { bubbles: true, cancelable: false }))
                this._innerHTML = this.element.innerHTML;
        },

        /**
         * Document exeCommand proxy
         *
         * @param  {String}  key
         * @param  {Mixed}   value (optional)
         * @return {Boolean}
         */
        _execCommand: function(key, value) {
            return this.document.execCommand(key, false, value);
        },

        /**
         * Document execCommand with styleWithCSS
         *
         * @param  {String}  key
         * @param  {Mixed}   value (optional)
         * @return {Boolean}
         */
        _execCommandStyleWithCSS: function(key, value) {
            this._execCommand("styleWithCSS", true);
            return this._execCommand(key, value);
        },

        /**
         * Document execCommand without styleWithCSS
         *
         * @param  {String}  key
         * @param  {Mixed}   value (optional)
         * @return {Boolean}
         */
        _execCommandStyleWithoutCSS: function(key, value) {
            this._execCommand("styleWithCSS", false);
            return this._execCommand(key, value);
        },

        /**
         * Due to firefox unwanted behaviour while
         * (for example) unbolding headline (which
         * has bold font weight property set in css)
         * we're gonna try to exec command with and
         * without css as well
         *
         * @param  {String}  key
         * @param  {Mixed}   value (optional)
         * @return {Boolean}
         */
        _execCommandStyleWithoutOrWithCSS: function(key, value) {
            var innerHTML = this.element.innerHTML;
            var result = false;

            if (!result) {
                this._execCommandStyleWithoutCSS(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            if (!result) {
                this._execCommandStyleWithCSS(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            return result;
        },

        /**
         * Element click event handler:
         * select entire anchor tag on click
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleMouseup: function(e) {
            if (e.which !== 1)
                return;

            var that = this;
            if (!(that instanceof ice.Editor))
                that = that.ice;
            if (that._skipDispatch)
                return;
            if (!that.options("autoSelectLink"))
                return;
            if (!that.options("autoSelectAll") && !that.window.getSelection().isCollapsed)
                return;

            var link = ice.Util.closest(e.target, "." + that._className + " a");
            if (!link)
                return;

            that.filterSelection("a");
        },

        /**
         * Element keydown event handler:
         * prevent backspace (chrome only)
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleKeydown: function(e) {
            var that = this;
            if (!(that instanceof ice.Editor))
                that = that.ice;
            if (that._skipDispatch)
                return;
            if (e.which != 8)
                return;

            var blocks = that.options("allowedBlocks").join("|");
            var html = that.element.innerHTML;
            var re;

            // only one empty block element (only <br> inside)
            re = new RegExp("^<(" + blocks + ")><br\\s*\\/?></(" + blocks + ")>$", "i");
            if (html.match(re))
                return e.preventDefault();

            // only one empty ul/ol block element (only one <li> with <br> inside)
            re = new RegExp("^<(ul|ol)><li><br\\s*\\/?></li></(ul|ol)>$", "i");
            if (html.match(re)) {
                var tag = that.options("defaultTag");
                if (tag)
                    that.formatBlock(tag);

                return e.preventDefault();
            }

            // first empty block element
            var select = window.getSelection();
            var range = select.getRangeAt(0);
            if (range.collapsed && range.startContainer) {
                var block = range.startContainer;
                var empty = (!block.childElementCount) || (block.childElementCount === 1 && block.children[0].tagName === "BR");
                var first = block.parentNode.children[0] === block;
                if (block.tagName === "LI" && empty && first) {
                    block = ice.Util.replaceTag(block, that.options("defaultTag"));
                    block.parentNode.parentNode.insertBefore(block, block.parentNode);
                    if (!block.parentNode.childElementCount)
                        block.parentNode.parentNode.removeChild(block.parentNode);

                    range = document.createRange();
                    range.setStart(block, 0);
                    range.setEnd(block, 0);
                    select.removeAllRanges();
                    select.addRange(range);

                    that._triggerChange();

                    return e.preventDefault();
                }
                else if (block.tagName !== "LI" && empty && first)
                    return e.preventDefault();
            }
        },

        /**
         * Element input event handler:
         * fallback for _handleKeydown,
         * parse, clear, fix...
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleInput: function(e) {
            var that = this;
            if (!(that instanceof ice.Editor))
                that = that.ice;
            if (that._skipDispatch)
                return;

            that._fixFontTag(that.element);
            that.element.normalize();

            var select = window.getSelection();
            var block = select.focusNode ? that._closestBlock(select.focusNode) : null;
            var tag = that.options("defaultTag");

            // empty editor, add <br> wrapped with default tag
            if (tag && !that.element.childNodes.length)
                that._execCommand("insertHTML", "<" + tag + "><br /></" + tag + ">");

            // empty editor, add <br> (no wrap, default tag not defined)
            else if (!that.element.childNodes.length)
                that._execCommand("insertHTML", "<br />");

            // only one <br> tag, wrap it with default tag
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].tagName === "BR")
                that._execCommand("insertHTML", "<" + tag + "><br /></" + tag + ">");

            // only one textNode, wrap it with default tag
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].nodeType === Node.TEXT_NODE)
                that._execCommand("formatBlock", "<" + tag + ">");

            // only one <span>, wrap it with default tag
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].nodeType === Node.ELEMENT_NODE && that.element.childNodes[0].tagName === "SPAN")
                that._execCommand("formatBlock", "<" + tag + ">");

            // non wrapped inline element or not allowed block
            else if (tag && select.focusNode === that.element && select.focusNode.childNodes[select.focusOffset] && !that._closestBlock(select.focusNode.childNodes[select.focusOffset]))
                that._execCommand("formatBlock", "<" + tag + ">");

            // on del click before <ul> element firefox selects
            // text element inside <ul> (should select <li>)
            else if (select.anchorNode && select.anchorNode.nodeType === Node.TEXT_NODE && select.anchorNode.parentElement.tagName === "UL") {
                var block = select.anchorNode.parentElement.children[0];
                var range = document.createRange();
                range.setStart(block, 0);
                range.setEnd(block, 0);
                select.removeAllRanges();
                select.addRange(range);
            }

            that._triggerChange();
        },

        /**
         * Element blur event handler:
         * parse, clear, fix...
         *
         * @param  {Object} e
         * @return {Void}
         * /
        _handleBlur: function(e) {
            var that = this.ice;

            // @todo

            that._triggerChange();
        },

        /**
         * Element paste event handler:
         * paste plain text
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handlePaste: function(e) {
            var that = this.ice;

            // options
            var rich = that.options("allowRichtextPaste");
            var split = that.options("allowSplit");
            var lnbr = that.options("allowLineBreak");
            var tag = that.options("defaultTag");
            if (rich && !tag)
                rich = false;

            // data to paste
            var data = e.clipboardData.getData(rich ? "text/html" : "text/plain");
            if (!data)
                return;

            // handle plain data
            if (!rich) {
                // options allowSplit/allowLineBreak
                if (!tag || !split)
                    data = data.replace(/\n\n/g, "\n");
                if (!lnbr)
                    data = data.replace(/\n/g, " ");

                // convert data to html
                if (tag) {
                    data = data
                        .trim()
                        .replace(/\n\n/g, "</" + tag + "><" + tag + ">")
                        .replace(/\n/g, "<br />");
                    data = data || "<br />";
                    data = "<" + tag + ">" + data + "</" + tag + ">";
                }
            }

            // handle rich text data
            else {
                var div = that.document.createElement("div");
                div.innerHTML = data;

                that._fixPaste(div);
                //that._fixBlocks(div);

                data = div.innerHTML;
            }

            // simulate paste
            e.preventDefault();
            that._execCommand("insertHTML", data);
            that._fixBlocks();
        },

        /**
         * Element focus event handler:
         * autoselect all
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleFocus: function(e) {
            var that = this.ice;
            if (!that.options("autoSelectAll"))
                return;

            var selection = that.window.getSelection();
            var range = that.document.createRange();
            range.selectNodeContents(that.element);
            selection.removeAllRanges();
            selection.addRange(range);
        }

    }

    // Reassign constructor
    ice_Editor.prototype.constructor = ice_Editor;

    // Globalize
    ice.Editor = ice_Editor;

    /**
     * Get document active editor
     * ice.Editor instance
     *
     * @return {Object}
     */
    ice.Util.getActiveEditor = function() {
        var win = this instanceof ice.Editor ? this.window : window;
        var selection = win.getSelection();
        var node = selection ? selection.focusNode : null;

        while (node && !(node.ice instanceof ice.Editor)) {
            node = node.parentNode;
        }

        return node ? node.ice : null;
    }

    // Trap browser shortcut events
    document.addEventListener("keydown", function(e) {
        var ice = window.ice.Util.getActiveEditor();
        if (!ice)
            return;

        var key = e.keyCode
            + "," + e.altKey*1
            + "," + e[window.ice.Util.isMac ? "metaKey" : "ctrlKey"]*1
            + "," + e.shiftKey*1;
        var shortcut = ice._shortcuts[key];

        if (!shortcut)
            return;

        var args = shortcut.slice();
        var method = args.shift();

        if (typeof ice[method] !== "function")
            return;

        ice[method].apply(ice, args);

        e.preventDefault();
    });

    // Disable browser history
    document.addEventListener("keydown", function(e) {
        if ((e.keyCode === 89 || e.keyCode === 90) && e[window.ice.Util.isMac ? "metaKey" : "ctrlKey"])
            e.preventDefault();
    });

    // Focus contenteditable
    document.addEventListener("click", function(e) {
        var element = ice.Util.closest(e.target, ".ice-editor, .ice-focus");
        if (!element || !ice.Util.is(element,".ice-focus"))
            return;

        var editor = element.querySelector(".ice-editor");
        if (editor && editor !== document.activeElement)
            editor.focus();
    });

    /**
     * Active editor
     *
     * @type {Object}
     */
    var _editor = null;

    // Select event handler
    document.addEventListener("selectionchange", function(e) {
        var ice = window.ice.Util.getActiveEditor();
        if (_editor && _editor !== ice) {
            // @todo - in IE CustomEvent is not constructor
            var detail = { editor: _editor };
            var event = new CustomEvent("iceunselect", { detail: detail });
            this.dispatchEvent(event);
            _editor = null;
        }

        if (ice) {
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return null;
            var range = selection.getRangeAt(0);
            var rect = range.getBoundingClientRect();
            _editor = ice;

            // @todo - in IE CustomEvent is not constructor
            var detail = {
                editor: _editor,
                range: {
                    collapsed: range.collapsed,
                    commonAncestorContainer: range.commonAncestorContainer,
                    endContainer: range.endContainer,
                    endOffset: range.endOffset,
                    startContainer: range.startContainer,
                    startOffset: range.startOffset
                },
                hasSelection: !range.collapsed && !!(rect.top || rect.right || rect.bottom || rect.left),
                selectionString: range.toString(),
                rect: rect,
                decorations: _editor.decorations()
            };
            var event = new CustomEvent("iceselect", { detail: detail });
            this.dispatchEvent(event);
        }
    });

})();
