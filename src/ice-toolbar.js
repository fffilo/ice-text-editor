/**
 * Ice Text Editor Toolbar
 *
 * Create simple toolbar for editor.
 */
;(function() {

    // strict mode
    "use strict";

    /**
     * ice.Toolbar constructor
     *
     * @param  {Object} editor
     * @param  {Object} options
     * @return {Void}
     */
    ice.Toolbar = function ice_Toolbar(editor, options) {
        if (!(this instanceof ice_Toolbar))
            throw "ice.Toolbar: ice.Toolbar is a constructor";

        this._editor = editor;
        this._options = options;

        this._init();
    }

    /**
     * ice.Toolbar prototype
     *
     * @type {Object}
     */
    ice.Toolbar.prototype = {

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            template: ''
                + '<div class="ice-toolbar">'
                + '<ul>'
                + '<li><a class="bold" href="#" data-ice-method="bold"><b>B</b></a></li>'
                + '<li><a class="italic" href="#" data-ice-method="italic"><i>I</i></a></li>'
                + '<li><a class="underline" href="#" data-ice-method="underline"><u>U</u></a></li>'
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
                throw "ice.Toolbar: Constructor editor argument must be of ice.Editor instance";
            if (this.editor.toolbar)
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
         * Show toolbar
         *
         * @return {Void}
         */
        show: function() {
            this.element.classList.add("ice-toolbar-show");
        },

        /**
         * Hide toolbar
         *
         * @return {Void}
         */
        hide: function() {
            this.element.classList.remove("ice-toolbar-show");
        },

        /**
         * Toolbar click event handler
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

            var detail = {
                method: node.getAttribute("data-ice-method"),
                arguments: []
            }
            var event = new CustomEvent("icetoolbar", { detail:  detail });
            this.ice.editor.element.dispatchEvent(event);

            e.preventDefault();
        }

    }

    /**
     * Init toolbar on editor prototype
     *
     * @return {Void}
     */
    ice.Editor.prototype._initToolbar = function() {
        this._toolbar = new ice.Toolbar(this);
    }

    /**
     * Destroy toolbar on editor prototype
     *
     * @return {Void}
     */
    ice.Editor.prototype._destroyToolbar = function() {
        this._toolbar.destroy;
        this._toolbar = null;
    }

    /**
     * Editor icetoolbar event handler
     *
     * @return {Void}
     */
    ice.Editor.prototype._handleIcetoolbar = function(e) {
        var that = this.ice;
        if (typeof that[e.detail.method] === "function")
            that[e.detail.method].apply(that, e.detail.arguments);
    }

    // define toolbar getter on editor prototype
    Object.defineProperty(ice.Editor.prototype, "toolbar", {
        get: function() {
            return this._toolbar;
        }
    });

})();
