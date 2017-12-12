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
        _className: "ice-editor",

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            defaultTag: "p",
            allowLineBreak: true,
            allowHorizontalRule: true,
            allowSplit: true,
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

            return this._execCommandStyleWithoutCSS("bold");
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

            // fix this, browser uses 1-7 units
            if (result) {
                var node = ice.Util.getSelectedTextNodes();
                for (var i = 0; i < node.length; i++) {
                    if (node[i].parentElement.style.fontSize)
                        node[i].parentElement.style.fontSize = value;
                }
            }

            delete this._skipDispatch;
            this._triggerChange();

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

            return this._execCommandStyleWithoutCSS("italic");
        },

        /**
         * Set text decoration strikethrough on selection
         *
         * @return {Boolean}
         */
        strikeThrough: function() {
            if (!this.active)
                return false;

            return this._execCommandStyleWithoutCSS("strikeThrough");
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

            return this._execCommandStyleWithoutCSS("underline");
        },

        /**
         * Set link on selection
         *
         * @param  {String}  value  url
         * @param  {String}  target (optional)
         * @return {Boolean}
         */
        createLink: function(value, target) {
            if (!this.active)
                return false;

            this._skipDispatch = true;
            var result = this._execCommand("createLink", value);

            // add target attribute to a tag
            if (result && target) {
                var node = ice.Util.getSelectedTextNodes();
                for (var i = 0; i < node.length; i++) {
                    if (node[i].parentElement.tagName === "A")
                        node[i].parentElement.setAttribute("target", target);
                }
            }

            delete this._skipDispatch;
            this._triggerChange();

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

            this._skipDispatch = true;

            if (!this.window.getSelection().isCollapsed)
                this._execCommand("delete");

            var result = this._execCommand("insertParagraph");
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
         * Format block: wrap tag around the
         * line containing the current selection
         *
         * @param  {String}  value
         * @return {Boolean}
         */
        formatBlock: function(value) {
            if (!this.active || !value || this.options("allowedBlocks").indexOf(value) === -1)
                return false;

            if (value === "ol")
                return this._execCommand("insertOrderedList")
            else if (value === "ul")
                return this._execCommand("insertUnorderedList")
            else
                return this._execCommand("formatBlock", "<" + value + ">");
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
            if (!this.active)
                return null;

            var doc = this.document;
            var result = {
                //backColor: doc.queryCommandValue("backColor"),
                bold: doc.queryCommandState("bold"),
                //fontName: doc.queryCommandValue("fontName"),
                //fontSize: doc.queryCommandValue("fontSize"),
                //foreColor: doc.queryCommandValue("foreColor"),
                //hiliteColor: doc.queryCommandValue("backColor"),
                italic: doc.queryCommandState("italic"),
                linkURL: undefined,
                linkTarget: undefined,
                strikeThrough: doc.queryCommandState("strikeThrough"),
                subscript: doc.queryCommandState("subscript"),
                superscript: doc.queryCommandState("superscript"),
                underline: doc.queryCommandState("underline")
            }

            // get states from css
            var node = ice.Util.getSelectedTextNodes();
            var style = ice.Util.nodeStyle;
            for (var i = 0; i < node.length; i++) {
                var el = node[i].parentElement;
                var css = style(el, "background-color");
                if (!("backColor" in result))
                    result.backColor = css;
                else if (result.backColor !== css)
                    result.backColor = null;

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

                result.hiliteColor = result.backColor;

                // @todo
                //      - linkURL
                //      - linkTarget
            }

            return result;
        },

        /**
         * Find closest block node
         *
         * @param  {Object} node
         * @return {Object}
         */
        _closestBlock: function(node) {
            while (node && (!node.tagName || node.tagName && this.options("allowedBlocks").indexOf(node.tagName.toLowerCase()) === -1)) {
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
            var re2 = new RegExp("\\s+(<(" + this.options("allowedBlocks").join("|") + "|hr)>)", "g");

            this.element.innerHTML = this.element.innerHTML
                .replace(re1, "")
                .replace(re2, "$1")
                .trim();
        },

        /**
         * Trigger event
         *
         * @param  {String} eventName
         * @param  {Object} details   (optional)
         * @return {Object}
         */
        _trigger: function(eventName, details) {
            if (this._skipDispatch === true || this._skipDispatch === eventName)
                return null;

            // @todo - in IE CustomEvent is not constructor
            var event = new CustomEvent("ice" + eventName, { detail: details || {} });
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
         * @param  {String}  value (optional)
         * @return {Boolean}
         */
        _execCommand: function(key, value) {
            return this.document.execCommand(key, false, value);
        },

        /**
         * Due to firefox unwanted behaviour while
         * (for example) unbolding headline (which
         * has bold font weight property set in css)
         * we're gonna try to exec command with and
         * without css as well
         *
         * @param  {String}  key
         * @param  {String}  value (optional)
         * @return {Boolean}
         */
        _execCommandStyleWithCSS: function(key, value) {
            var innerHTML = this.element.innerHTML;
            var result = false;

            if (!result) {
                this._execCommand("styleWithCSS", true);
                this._execCommand(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            if (!result) {
                this._execCommand("styleWithCSS", false);
                this._execCommand(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            return result;
        },

        /**
         * See _execCommandStyleWithCSS
         *
         * @param  {String}  key
         * @param  {String}  value (optional)
         * @return {Boolean}
         */
        _execCommandStyleWithoutCSS: function(key, value) {
            var innerHTML = this.element.innerHTML;
            var result = false;

            if (!result) {
                this._execCommand("styleWithCSS", false);
                this._execCommand(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            if (!result) {
                this._execCommand("styleWithCSS", true);
                this._execCommand(key, value);
                result = this.element.innerHTML !== innerHTML;
            }

            return result;
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
                that._execCommand("insertHTML", "<" + tag + "><br /></" + tag + ">");
            else if (!that.element.childNodes.length)
                that._execCommand("insertHTML", "<br />");
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].tagName === "BR")
                that._execCommand("insertHTML", "<" + tag + "><br /></" + tag + ">");
            else if (tag && that.element.childNodes.length === 1 && that.element.childNodes[0].nodeType === Node.TEXT_NODE)
                that._execCommand("formatBlock", "<" + tag + ">");
            else if (tag && sel.focusNode && sel.focusNode.nodeType === Node.TEXT_NODE && !that._closestBlock(sel.focusNode))
                that._execCommand("formatBlock", "<" + tag + ">");

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
            that._execCommand("insertHTML", data);
        }

    }

    /**
     * Get document active editor
     * ice.Editor instance
     *
     * @return {Object} [description]
     */
    ice.Util.getActiveEditor = function() {
        var selection = (this instanceof ice.Editor ? this.window : window).getSelection();
        var node = selection.focusNode;

        while (node && (node.nodeType !== Node.ELEMENT_NODE || !(node.ice instanceof ice.Editor))) {
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
            _editor = ice;

            // @todo - in IE CustomEvent is not constructor
            var detail = {
                editor: _editor,
                collapsed: range.collapsed,
                rect: range.getBoundingClientRect(),
                decorations: _editor.decorations()
            };
            var event = new CustomEvent("iceselect", { detail: detail });
            this.dispatchEvent(event);
        }
    });

})();
