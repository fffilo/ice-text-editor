/**
 * Ice Editor Floatbar
 *
 * Simple floating toolbar for editor.
 *
 * dependencied:
 *     - ice-core.js
 *     - ice-editor.js
 */
;(function() {

    // strict mode
    "use strict";

    /**
     * ice.Floatbar constructor
     *
     * @param  {Object} editor
     * @param  {Object} options
     * @return {Void}
     */
    ice.Floatbar = function ice_Floatbar(editor, options) {
        if (!(this instanceof ice_Floatbar))
            throw "ice.Floatbar: ice.Floatbar is a constructor";

        this._editor = editor;
        this._options = options;

        this._init();
    }

    /**
     * ice.Floatbar prototype
     *
     * @type {Object}
     */
    ice.Floatbar.prototype = {

        /**
         * Element class attribute
         *
         * @type {String}
         */
        _className: "ice-floatbar",

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            template: ''
                + '<div>'
                + '<ul>'
                + '<li><a class="format-block" href="#" title="Format Block" data-ice-method="formatBlock" data-ice-status=""><span>&#x03C0;</span></a></li>'
                + '<li class="separator">|</li>'
                + '<li><a class="font-name" href="#" title="Font Name" data-ice-method="fontName" data-ice-status=""><span>T</span></a></li>'
                + '<li><a class="font-size" href="#" title="Font Size" data-ice-method="fontSize" data-ice-status=""><span>&#x1f5db;</span></a></li>'
                + '<li class="separator">|</li>'
                + '<li><a class="text-align-left" href="#" title="Text Align Left" data-ice-method="align" data-ice-status=""><span>&#x2190;</span></a></li>'
                + '<li><a class="text-align-center" href="#" title="Text Align Center" data-ice-method="align" data-ice-status=""><span>&#x2194;</span></a></li>'
                + '<li><a class="text-align-right" href="#" title="Text Align Right" data-ice-method="align" data-ice-status=""><span>&#x2192;</span></a></li>'
                + '<li><a class="text-align-justify" href="#" title="Text Align Justify" data-ice-method="align" data-ice-status=""><span>&#x27F7;</span></a></li>'
                + '<li class="separator">|</li>'
                + '<li><a class="fore-color" href="#" title="Foreground Color" data-ice-method="foreColor" data-ice-status=""><span data-ice-status-type="css" data-ice-status-key="background-color">&nbsp;</span></a></li>'
                + '<li><a class="back-color" href="#" title="Background Color" data-ice-method="backColor" data-ice-status=""><span data-ice-status-type="css" data-ice-status-key="background-color">&nbsp;</span></a></li>'
                + '<li class="separator">|</li>'
                + '<li><a class="bold" href="#" title="Bold" data-ice-method="bold" data-ice-status=""><b>B</b></a></li>'
                + '<li><a class="italic" href="#" title="Italic" data-ice-method="italic" data-ice-status=""><i>I</i></a></li>'
                + '<li><a class="underline" href="#" title="Underline" data-ice-method="underline" data-ice-status=""><u>U</u></a></li>'
                + '<li><a class="strike-through" href="#" title="Strikethrough" data-ice-method="strikeThrough" data-ice-status=""><s>S</s></a></li>'
                //+ '<li class="separator">|</li>'
                //+ '<li><a class="link" href="#" title="Link" data-ice-method="link" data-ice-status=""><span>&#128279;</span></a></li>'
                + '<li class="separator">|</li>'
                + '<li><a class="remove-format" href="#" title="Remove Format" data-ice-method="removeFormat" data-ice-status=""><b>&times;</b></a></li>'
                + '</ul>'
                + '</div>'
        },

        /**
         * Initialize
         *
         * @return {Void}
         */
        _init: function() {
            if (!(this.editor instanceof window.ice.Editor))
                throw "ice.Floatbar: Constructor editor argument must be of ice.Editor instance";
            if (this.editor.floatbar)
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

            // create
            var div = this.editor.document.createElement("div");
            div.innerHTML = this.options("template");
            this._element = div.childNodes[0];
            this._element.addEventListener("click", this._handleClick);
            this._element.classList.add(this._className);
            this._element.ice = this;
            this.editor.document.body.appendChild(this._element);

            // define ui
            this._ui = {};
            var node = this.element.querySelectorAll("[data-ice-method]");
            for (var i = 0; i < node.length; i++) {
                this._ui[node[i].getAttribute("data-ice-method")] = node[i];
            }
        },

        /**
         * Destructor
         *
         * @return {Void}
         */
        destroy: function() {
            delete this._element.ice;
            this._element.removeEventListener("click", this._handleClick);
            this._element.parentElement.removeChild(this._element);
            this._element = null;
        },

        /**
         * Get this.editor object
         *
         * @return {Object}
         */
        get editor() {
            return this._editor;
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
         * Show floatbar
         *
         * @return {Void}
         */
        show: function() {
            this.element.classList.add(this._className + "-show");
        },

        /**
         * Hide floatbar
         *
         * @return {Void}
         */
        hide: function() {
            this.element.classList.remove(this._className + "-show");
        },

        /**
         * Refresh floatbar
         *
         * @return {Void}
         */
        refresh: function() {
            this._reposition();
            this._setDecorations();
        },

        /**
         * Reposition floatbar element
         *
         * @param  {Object} rect
         * @return {Void}
         */
        _reposition: function(rect) {
            if (!rect) {
                var selection = this.editor.window.getSelection();
                if (!selection.rangeCount)
                    return;
                var range = selection.getRangeAt(0);

                rect = range.getBoundingClientRect();
            }

            var position = {
                left: rect.left + rect.width / 2 - this.element.offsetWidth / 2,
                top: rect.top - this.element.offsetHeight,
                className: "top"
            }

            var body = this.editor.document.body;
            var doc = this.editor.document.documentElement;
            var scrollTop = this.editor.pageYOffset || doc.scrollTop || body.scrollTop;
            var scrollLeft = this.editor.pageXOffset || doc.scrollLeft || body.scrollLeft;
            var clientTop = doc.clientTop || body.clientTop || 0;
            var clientLeft = doc.clientLeft || body.clientLeft || 0;

            position.left += scrollLeft - clientLeft;
            position.top += scrollTop - clientTop;

            if (position.top < 0) {
                position.top = rect.top + rect.height;
                position.className = "bottom";
            }

            this.element.style.left = Math.round(position.left) + "px";
            this.element.style.top = Math.round(position.top) + "px";
            this.element.classList.remove(this._className + "-position-top");
            this.element.classList.remove(this._className + "-position-bottom");
            this.element.classList.add(this._className + "-position-" + position.className);
        },

        /**
         * Set decorations
         *
         * @param  {Object} decorations
         * @return {Void}
         */
        _setDecorations: function(decorations) {
            if (!decorations)
                decorations = this.editor.decorations();

            for (var prop in this._ui) {
                this._ui[prop].setAttribute("data-ice-status", decorations ? decorations[prop] : null);

                var stat = this._ui[prop].querySelectorAll("[data-ice-status-type]");
                for (var i = 0; i < stat.length; i++) {
                    var type = stat[i].getAttribute("data-ice-status-type");
                    var key = stat[i].getAttribute("data-ice-status-key");

                    if (type === "content")
                        stat[i].innerHTML = decorations[prop] || "";
                    else if (type === "attr")
                        stat[i].setAttribute(key, decorations[prop]);
                    else if (type === "css")
                        stat[i].style[key] = decorations[prop];
                }
            }
        },

        /**
         * Floatbar click event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleClick: function(e) {
            var node = ice.Util.closest(e.target, "[data-ice-method]");
            if (!node)
                return;

            var editor = this.ice.editor;
            var floatbar = editor._floatbar;
            var method = node.getAttribute("data-ice-method");

            if (typeof floatbar["_handleMethod_" + method] === "function")
                floatbar["_handleMethod_" + method].apply(floatbar, [node]);

            e.preventDefault();
        },

        /**
         * Floatbar click event handler for
         * button align
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_align: function(node) {
            var className = node.getAttribute("class");
            if (!className)
                return;

            var aligns = [ "left", "center", "right", "justify" ];
            for (var i = 0; i < aligns.length; i++) {
                if (className.indexOf(aligns[i]) !== -1) {
                    this.editor.align(aligns[i]);
                    break;
                }
            }
        },

        /**
         * Floatbar click event handler for
         * button backColor
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_backColor: function(node) {
            var value = prompt("Background Color", this.editor.decorations().backColor);
            if (value === null)
                return;

            this.editor.backColor(value);
        },

        /**
         * Floatbar click event handler for
         * button bold
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_bold: function(node) {
            this.editor.bold();
        },

        /**
         * Floatbar click event handler for
         * button fontName
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_fontName: function(node) {
            var value = prompt("Font Name", this.editor.decorations().fontName);
            if (value === null)
                return;

            this.editor.fontName(value);
        },

        /**
         * Floatbar click event handler for
         * button fontSize
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_fontSize: function(node) {
            var value = prompt("Font Size", this.editor.decorations().fontSize);
            if (value === null)
                return;

            this.editor.fontSize(value);
        },

        /**
         * Floatbar click event handler for
         * button foreColor
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_foreColor: function(node) {
            var value = prompt("Foreground Color", this.editor.decorations().foreColor);
            if (value === null)
                return;

            this.editor.foreColor(value);
        },

        /**
         * Floatbar click event handler for
         * button formatBlock
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_formatBlock: function(node) {
            var value = prompt("Format Block", "");
            if (value === null)
                return;

            this.editor.formatBlock(value);
        },

        /**
         * Floatbar click event handler for
         * button hiliteColor
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_hiliteColor: function(node) {
            this._handleMethod_backColor();
        },

        /**
         * Floatbar click event handler for
         * button italic
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_italic: function(node) {
            this.editor.italic();
        },

        /**
         * Floatbar click event handler for
         * button removeFormat
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_removeFormat: function(node) {
            this.editor.removeFormat();
        },

        /**
         * Floatbar click event handler for
         * button strikeThrough
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_strikeThrough: function(node) {
            this.editor.strikeThrough();
        },

        /**
         * Floatbar click event handler for
         * button subscript
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_subscript: function(node) {
            this.editor.subscript();
        },

        /**
         * Floatbar click event handler for
         * button superscript
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_superscript: function(node) {
            this.editor.superscript();
        },

        /**
         * Floatbar click event handler for
         * button underline
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_underline: function(node) {
            this.editor.underline();
        },

        /**
         * Floatbar click event handler for
         * button strikethrough
         *
         * @param  {Object} node
         * @return {Void}
         */
        _handleMethod_strikeThrough: function(node) {
            this.editor.strikeThrough();
        }

    }

    /**
     * Add floatbar option to editor
     *
     * @type {Boolean}
     */
    ice.Editor.prototype._defaults.floatbar = true;

    /**
     * Init floatbar on editor prototype
     *
     * @return {Void}
     */
    ice.Editor.prototype._initFloatbar = function() {
        this._floatbar = new ice.Floatbar(this);
    }

    /**
     * Destroy floatbar on editor prototype
     *
     * @return {Void}
     */
    ice.Editor.prototype._destroyFloatbar = function() {
        this._floatbar.destroy();
        this._floatbar = null;
    }

    /**
     * Editor input event handler:
     * refresh floatbar decorations
     *
     * @param  {Object} e
     * @return {Void}
     */
    ice.Editor.prototype._handleInputFloatbar = function(e) {
        this.ice.floatbar.refresh();
    }

    // define floatbar getter on editor prototype
    Object.defineProperty(ice.Editor.prototype, "floatbar", {
        get: function() {
            return this._floatbar;
        }
    });

    // document unselect event
    document.addEventListener("iceunselect", function(e) {
        if (e.detail.editor.floatbar)
            e.detail.editor.floatbar.hide();
    });

    // document select event
    document.addEventListener("iceselect", function(e) {
        if (e.detail.editor.floatbar && (e.detail.collapsed || !e.detail.editor.floatbar.editor.options("floatbar")))
            return e.detail.editor.floatbar.hide();

        e.detail.editor.floatbar._reposition(e.detail.rect);
        e.detail.editor.floatbar._setDecorations(e.detail.decorations);
        e.detail.editor.floatbar.show();
    });

    // window select event
    window.addEventListener("resize", function(e) {
        var ice = window.ice.Util.getActiveEditor();
        if (!ice || !ice.floatbar || !ice.options("floatbar"))
            return;

        ice.floatbar.refresh()
    });

})();
