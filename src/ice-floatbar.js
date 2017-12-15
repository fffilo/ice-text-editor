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
                + '<div data-ice-floatbar-view="">'
                + '<nav class="ice-floatbar-nav">'
                + '<ul>'
                + '<li><a class="bold" href="#" title="Bold" data-ice-method="bold" data-ice-decoration="bold"><i class="fa fa-bold"></i></a></li>'
                + '<li><a class="italic" href="#" title="Italic" data-ice-method="italic" data-ice-decoration="italic"><i class="fa fa-italic"></i></a></li>'
                + '<li><a class="font" href="#" title="Font" data-ice-toggle-view="font"><i class="fa fa-font"></i></a></li>'
                + '<li><a class="align" href="#" title="Text Align" data-ice-toggle-view="align" data-ice-decoration="align"><i class="fa fa-align-center"></i></a></li>'
                + '<li><a class="link" href="#" title="Link" data-ice-toggle-view="link"><i class="fa fa-link"></i></a></li>'
                + '<li><a class="color" href="#" title="Foreground Color" data-ice-toggle-view="color"><i class="fa fa-circle"></i></a></li>'
                + '</ul>'
                + '</nav>'
                + '<article class="ice-floatbar-dropdown font">'
                + '<p><b>work in progress:</b><br />font size placeholder</p>'
                + '<ul class="ice-floatbar-list">'
                + '<li><a href="#" title="Arial, Helvetica, sans-serif" data-ice-method="fontName" data-ice-argument="Arial, Helvetica, sans-serif">Arial, Helvetica, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Arial Black&quot;, Gadget, sans-serif" data-ice-method="fontName" data-ice-argument="&quot;Arial Black&quot;, Gadget, sans-serif">&quot;Arial Black&quot;, Gadget, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Comic Sans MS&quot;, cursive, sans-serif" data-ice-method="fontName" data-ice-argument="&quot;Comic Sans MS&quot;, cursive, sans-serif">&quot;Comic Sans MS&quot;, cursive, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Courier New&quot;, Courier, monospace" data-ice-method="fontName" data-ice-argument="&quot;Courier New&quot;, Courier, monospace">&quot;Courier New&quot;, Courier, monospace</a></li>'
                + '<li><a href="#" title="Georgia, serif" data-ice-method="fontName" data-ice-argument="Georgia, serif">Georgia, serif</a></li>'
                + '<li><a href="#" title="Impact, Charcoal, sans-serif" data-ice-method="fontName" data-ice-argument="Impact, Charcoal, sans-serif">Impact, Charcoal, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Lucida Console&quot;, Monaco, monospace" data-ice-method="fontName" data-ice-argument="&quot;Lucida Console&quot;, Monaco, monospace">&quot;Lucida Console&quot;, Monaco, monospace</a></li>'
                + '<li><a href="#" title="&quot;Lucida Sans Unicode&quot;, &quot;Lucida Grande&quot;, sans-serif" data-ice-method="fontName" data-ice-argument="&quot;Lucida Sans Unicode&quot;, &quot;Lucida Grande&quot;, sans-serif">&quot;Lucida Sans Unicode&quot;, &quot;Lucida Grande&quot;, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif" data-ice-method="fontName" data-ice-argument="&quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif">&quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif</a></li>'
                + '<li><a href="#" title="Tahoma, Geneva, sans-serif" data-ice-method="fontName" data-ice-argument="Tahoma, Geneva, sans-serif">Tahoma, Geneva, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Times New Roman&quot;, Times, serif" data-ice-method="fontName" data-ice-argument="&quot;Times New Roman&quot;, Times, serif">&quot;Times New Roman&quot;, Times, serif</a></li>'
                + '<li><a href="#" title="&quot;Trebuchet MS&quot;, Helvetica, sans-serif" data-ice-method="fontName" data-ice-argument="&quot;Trebuchet MS&quot;, Helvetica, sans-serif">&quot;Trebuchet MS&quot;, Helvetica, sans-serif</a></li>'
                + '<li><a href="#" title="Verdana, Geneva, sans-serif" data-ice-method="fontName" data-ice-argument="Verdana, Geneva, sans-serif">Verdana, Geneva, sans-serif</a></li>'
                + '<ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown align">'
                + '<ul>'
                + '<li><a class="align-left" href="#" title="Text Align Left" data-ice-method="align" data-ice-decoration="align" data-ice-argument="left"><i class="fa fa-align-left"></i></a></li>'
                + '<li><a class="align-center" href="#" title="Text Align Center" data-ice-method="align" data-ice-decoration="align" data-ice-argument="center"><i class="fa fa-align-center"></i></a></li>'
                + '<li><a class="align-right" href="#" title="Text Align Right" data-ice-method="align" data-ice-decoration="align" data-ice-argument="right"><i class="fa fa-align-right"></i></a></li>'
                + '<li><a class="align-justify" href="#" title="Text Align Justify" data-ice-method="align" data-ice-decoration="align" data-ice-argument="justify"><i class="fa fa-align-justify"></i></a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown link">'
                + '<p><b>work in progress:</b><br />link properties placeholder</p>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown color">'
                + '<p><b>work in progress:</b><br />color properties placeholder</p>'
                + '</article>'
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
            this._element.addEventListener("pointerdown", this._handlePointerdown);
            this._element.addEventListener("click", this._handleClick);
            this._element.classList.add(this._className);
            this._element.ice = this;
            this.editor.document.body.appendChild(this._element);

            // define ui
            this._ui = {};
            this.element.querySelectorAll("[data-ice-decoration]").forEach(function(node) {
                var attr = node.getAttribute("data-ice-decoration");
                if (!(attr in this._ui))
                    this._ui[attr] = [];
                this._ui[attr].push(node);
            }.bind(this));
        },

        /**
         * Destructor
         *
         * @return {Void}
         */
        destroy: function() {
            delete this._element.ice;
            this._element.removeEventListener("click", this._handleClick);
            this._element.removeEventListener("pointerdown", this._handlePointerdown);
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
            this.element.removeAttribute("data-ice-floatbar-view");
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

            for (var decor in this._ui) {
                this._ui[decor].forEach(function(node) {
                    node.setAttribute("data-ice-status", decorations ? decorations[decor] : null);
                });
            }
        },

        /**
         * Floatbar pointerdown event handler:
         * prevent default so editor text does
         * not get unselected
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handlePointerdown: function(e) {
            if (!ice.Util.closest(e.target, "[data-ice-method],[data-ice-toggle-view]"))
                e.preventDefault();
        },

        /**
         * Floatbar click event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleClick: function(e) {
            var node = ice.Util.closest(e.target, "[data-ice-toggle-view]");
            if (node) {
                var editor = this.ice.editor;
                var floatbar = editor._floatbar;
                var attr = node.getAttribute("data-ice-toggle-view");
                var value = floatbar.element.getAttribute("data-ice-floatbar-view");

                if (value === attr)
                    floatbar.element.removeAttribute("data-ice-floatbar-view");
                else
                    floatbar.element.setAttribute("data-ice-floatbar-view", attr);

                floatbar._reposition();
            }

            var node = ice.Util.closest(e.target, "[data-ice-method]");
            if (node) {
                var editor = this.ice.editor;
                var floatbar = editor._floatbar;
                var method = node.getAttribute("data-ice-method");
                var args = node.getAttribute("data-ice-argument");

                editor[method].apply(editor, args ? [ args ] : []);
            }

            e.preventDefault();
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
