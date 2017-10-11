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
                + '<li><a class="bold" href="#" title="Bold" data-ice-method="bold"><b>B</b></a></li>'
                + '<li><a class="italic" href="#" title="Italic" data-ice-method="italic"><i>I</i></a></li>'
                + '<li><a class="underline" href="#" title="Underline" data-ice-method="underline"><u>U</u></a></li>'
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
            var div = document.createElement("div");
            div.innerHTML = this.options("template");
            this._element = div.childNodes[0];
            this._element.addEventListener("click", this._handleClick);
            this._element.classList.add(this._className);
            this._element.ice = this;
            document.body.appendChild(this._element);
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
         * Reposition floatbar element
         *
         * @param  {Object} rect
         * @return {Void}
         */
        _reposition: function(rect) {
            this.element.style.left = rect.left + rect.width / 2 - this.element.offsetWidth / 2 + "px";
            this.element.style.top = rect.top - this.element.offsetHeight + "px";
        },

        /**
         * Floatbar click event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleClick: function(e) {
            var node = e.target;
            while (node && !node.getAttribute("data-ice-method")) {
                node = node.parentElement;
            }

            if (!node)
                return;

            this.ice.editor._trigger("floatbar", {
                method: node.getAttribute("data-ice-method"),
                arguments: []
            });

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
     * Editor icefloatbar event handler
     *
     * @return {Void}
     */
    ice.Editor.prototype._handleIcefloatbar = function(e) {
        var that = this.ice;
        if (typeof that[e.detail.method] === "function")
            that[e.detail.method].apply(that, e.detail.arguments);
    }

    /**
     * Editor iceselect event handler
     *
     * @return {Void}
     */
    ice.Editor.prototype._handleIceselect = function(e) {
        if (!e.detail.collapsed && this.ice.floatbar.editor.options("floatbar")) {
            this.ice.floatbar._reposition(e.detail.rect)
            this.ice.floatbar.show();

            return;
        }

        this.ice.floatbar.hide();
    }

    /**
     * Editor iceunselect event handler
     *
     * @return {Void}
     */
    ice.Editor.prototype._handleIceunselect = function(e) {
        this.ice.floatbar.hide();
    }

    // define floatbar getter on editor prototype
    Object.defineProperty(ice.Editor.prototype, "floatbar", {
        get: function() {
            return this._floatbar;
        }
    });

    /**
     * Active editor
     *
     * @type {Object}
     */
    var _editor = null;

    // document select event
    document.addEventListener("selectionchange", function(e) {
        var ice = window.ice.Util.getActiveEditor();
        if (_editor && _editor !== ice) {
            _editor._trigger("unselect");
            _editor = null;
        }

        if (ice) {
            var selection = window.getSelection();
            var range = selection.getRangeAt(0);

            _editor = ice;
            _editor._trigger("select", {
                collapsed: range.collapsed,
                rect: range.getBoundingClientRect(),
                decorations: _editor.decorations()
            });
        }
    });

})();
