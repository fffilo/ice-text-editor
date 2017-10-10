/**
 * Ice Text Editor
 *
 * ...work in progress
 */
;(function() {

    // strict mode
    "use strict";

    // globalize
    window.ice = {};

    /**
     * ice.Editor constructor
     *
     * @param {Node}   element
     * @param {Object} options
     */
    ice.Editor = function ice_Editor(element, options) {
        if (!(this instanceof ice_Editor))
            throw "ice.Editor: ice.Editor is a constructor";

        this._element = element;
        this._options = options;

        this._init();
    }

    /**
     * ice.Editor prototype
     *
     * @type {Object}
     */
    ice.Editor.prototype = {

        /**
         * Element class attribute
         *
         * @type {String}
         */
        _className: "ice-text-editor",

        /**
         * Allowed block elements tags
         *
         * @type {Array}
         */
        _allowedBlocks: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "pre",
            "blockquote"
        ],

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            defaultTag: "p",
            allowLineBreak: true,
            allowHorizontalRule: true,
            allowSplit: true
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
            "13,0,0,0": [ "split" ],                // ENTER
            "13,0,0,1": [ "insertLineBreak" ],      // Shift+ENTER
            "90,0,1,0": [ "undo" ],                 // Ctrl+Z
            "89,0,1,0": [ "redo" ],                 // Ctrl+Y
            "66,0,1,0": [ "bold" ],                 // Ctrl+B
            "73,0,1,0": [ "italic" ],               // Ctrl+I
            "85,0,1,0": [ "underline" ]             // Ctrl+U
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

            this._strip();
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

            // unbind events
            for (var method in this) {
                if (method.substr(0, 7) === "_handle") {
                    var arr = method.replace(/([A-Z])/g, "_$1").toLowerCase().split("_");
                    var obj = arr[2];
                    var event = arr[3];
                    var desc = arr[4];

                    this.element.removeEventListener(event, this[method]);
                }
            }

            // call method that starts with _destroy
            for (var method in this) {
                if (method.substr(0, 8) === "_destroy")
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
            //return this.document.activeElement === this.element;
            return this === this.getActiveEditor();
        },

        /**
         * Get element.innerHTML
         * prettified
         *
         * @return {String}
         */
        get prettyHTML() {
            var tag = this._allowedBlocks.join("|") + "|hr"
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

            this.document.execCommand("styleWithCSS", false, true);
            return this.document.execCommand("backColor", false, value);
        },

        /**
         * Set font weight bold on selection
         *
         * @return {Boolean}
         */
        bold: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("bold");
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

            this.document.execCommand("styleWithCSS", false, true);
            return this.document.execCommand("fontName", false, value);
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

            this.document.execCommand("styleWithCSS", false, true);
            return this.document.execCommand("fontSize", false, value);
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

            this.document.execCommand("styleWithCSS", false, true);
            return this.document.execCommand("foreColor", false, value);
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

            this.document.execCommand("styleWithCSS", false, true);
            return this.document.execCommand("hiliteColor", false, value);
        },

        /**
         * Set font style italic on selection
         *
         * @return {Boolean}
         */
        italic: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("italic");
        },

        /**
         * Set text decoration strikethrough on selection
         *
         * @return {Boolean}
         */
        strikeThrough: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("strikeThrough");
        },

        /**
         * Set subscript on selection
         *
         * @return {Boolean}
         */
        subscript: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("subscript");
        },

        /**
         * Set superscript on selection
         *
         * @return {Boolean}
         */
        superscript: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("superscript");
        },

        /**
         * Set text decoration underline on selection
         *
         * @return {Boolean}
         */
        underline: function() {
            if (!this.active)
                return false;

            this.document.execCommand("styleWithCSS", false, false);
            return this.document.execCommand("underline");
        },

        /**
         * Set link on selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        createLink: function(value) {
            if (!this.active)
                return false;

            return this.document.execCommand("createLink", false, value);
            // @todo -> target?
        },

        /**
         * Unlink selection
         *
         * @return {Boolean}
         */
        unlink: function() {
            if (!this.active)
                return false;

            return this.document.execCommand("unlink");
        },

        /**
         * Remove format on selection
         *
         * @return {Boolean}
         */
        removeFormat: function() {
            if (!this.active)
                return false;

            return this.document.execCommand("removeFormat");
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

            this._skipDispatch = true;

            if (!window.getSelection().isCollapsed)
                this.document.execCommand("delete");

            var result = this.document.execCommand("insertParagraph");
            var tag = this.options("defaultTag");
            if (tag)
                this.formatBlock(tag);

            delete this._skipDispatch;
            if (result)
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

            //return this.document.execCommand("insertHTML", false, "<br />");
            return this.document.execCommand("insertLineBreak");
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
            //return this.document.execCommand("insertHTML", false, "<hr />");
            return false;
        },

        /**
         * Format block: wrap tag around the
         * line containing the current selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        formatBlock: function(value) {
            if (!this.active || !value || this._allowedBlocks.indexOf(value) === -1 || !this.options("defaultTag") || !this.options("allowSplit"))
                return false;

            return this.document.execCommand("formatBlock", false, "<" + value + ">");
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
         * Get selection decorations
         *
         * @todo
         * @return {Object}
         */
        decorations: function() {
            return {
                backColor: null,
                bold: null,
                fontName: null,
                fontSize: null,
                foreColor: null,
                hiliteColor: null,
                italic: null,
                strikeThrough: null,
                subscript: null,
                superscript: null,
                underline: null
            }
        },

        /**
         * Get document active editor
         * ice.Editor instance
         *
         * @return {Object} [description]
         */
        getActiveEditor: function() {
            var selection = (this instanceof ice.Editor ? this.window : window).getSelection();
            var node = selection.focusNode;

            while (node && (node.nodeType !== Node.ELEMENT_NODE || !node.ice)) {
                node = node.parentNode;
            }

            return node ? node.ice : null;
        },

        /**
         * Find closest block node
         *
         * @param  {Object} node
         * @return {Object}
         */
        _closestBlock: function(node) {
            while (node && (!node.tagName || node.tagName && this._allowedBlocks.indexOf(node.tagName.toLowerCase()) === -1)) {
                node = node.parentNode;
            }

            return node;
        },

        /**
         * Remove whitespaces between block elements
         *
         * @return {Void}
         */
        _strip: function() {
            this._innerHTML = this.element.innerHTML;

            var re1 = new RegExp("<!--[\\s\\S]*?-->", "g");
            var re2 = new RegExp("\\s+(<(" + this._allowedBlocks.join("|") + "|hr)>)", "g");

            this.element.innerHTML = this.element.innerHTML
                .replace(re1, "")
                .replace(re2, "$1")
                .trim();
        },

        /**
         * Trigger event
         *
         * @param  {String} eventName
         * @return {Object}
         */
        _trigger: function(eventName) {
            if (this._skipDispatch === true || this._skipDispatch === eventName)
                return null;

            var event = new Event("ice" + eventName, { bubbles: true, cancelable: false });
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

            if (this._innerHTML !== this.element.innerHTML && this._trigger("change"))
                this._innerHTML = this.element.innerHTML;
        },

        /**
         * Element input event handler:
         * parse, clear, fix...
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleInput: function(e) {
            var that = this.ice;
            that.element.normalize();

            var sel = window.getSelection();
            var tag = that.options("defaultTag");

            if (tag && !that.element.childNodes.length)
                that.document.execCommand("insertHTML", false, "<" + tag + "><br /></" + tag + ">");
            else if (!that.element.childNodes.length)
                that.document.execCommand("insertHTML", false, "<br />");
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].tagName === "BR")
                that.document.execCommand("insertHTML", false, "<" + tag + "><br /></" + tag + ">");
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].nodeType === Node.TEXT_NODE)
                that.document.execCommand("formatBlock", false, "<" + tag + ">");
            else if (tag && sel.focusNode && sel.focusNode.nodeType === Node.TEXT_NODE && !that._closestBlock(sel.focusNode))
                that.document.execCommand("formatBlock", false, "<" + tag + ">");

            that._triggerChange();
        },

        /**
         * Element blur event handler:
         * parse, clear, fix...
         *
         * @param  {Object} e
         * @return {Void}
         */
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
            // do not allow paste richtext, there is too
            // much unwanted data which makes it unpossible
            // to handle correctly
            e.preventDefault();

            // no plain text data to paste?
            var that = this.ice;
            var data = e.clipboardData.getData("text/plain");
            var tag = that.options("defaultTag");
            if (!data)
                return;

            // options allowSplit/allowLineBreak
            if (!tag || !that.options("allowSplit"))
                data = data.replace(/\n\n/g, "\n");
            if (!that.options("allowLineBreak"))
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

            // paste
            that.document.execCommand("insertHTML", false, data);
        }

    }

    /**
     * Is Mac platform
     *
     * @type {Boolean}
     */
    var isMac = [ "Mac68K", "MacPPC", "MacIntel" ].indexOf(window.navigator.platform) > -1;

    // Trap browser shortcut events
    document.addEventListener("keydown", function(e) {
        var ice = window.ice.Editor.prototype.getActiveEditor();
        if (!ice)
            return;

        var key = e.keyCode
            + "," + e.altKey*1
            + "," + e[isMac ? "metaKey" : "ctrlKey"]*1
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

    // Disable history
    document.addEventListener("keydown", function(e) {
        if (e.keyCode === 89 || e.keyCode === 90 && e[isMac ? "metaKey" : "ctrlKey"])
            e.preventDefault();
    });

})();
