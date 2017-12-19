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
                + '<div class="ice-floatbar-wrapper">'
                + '<div class="ice-floatbar-content">'
                + '<nav class="ice-floatbar-nav">'
                + '<ul>'
                + '<li><a class="format-block" href="#" title="Format Block" data-ice-toggle-view="format-block"><i class="fa fa-code"></i></a></li>'
                + '<li><a class="bold" href="#" title="Bold" data-ice-method="bold" data-ice-decoration="bold"><i class="fa fa-bold"></i></a></li>'
                + '<li><a class="italic" href="#" title="Italic" data-ice-method="italic" data-ice-decoration="italic"><i class="fa fa-italic"></i></a></li>'
                + '<li><a class="font" href="#" title="Font" data-ice-toggle-view="font"><i class="fa fa-font"></i></a></li>'
                + '<li><a class="align" href="#" title="Text Align" data-ice-toggle-view="align"><i class="fa fa-align-center"></i></a></li>'
                + '<li><a class="link" href="#" title="Link" data-ice-toggle-view="link"><i class="fa fa-link"></i></a></li>'
                + '<li><a class="color" href="#" title="Foreground Color" data-ice-toggle-view="color"><i class="fa fa-circle"></i></a></li>'
                + '</ul>'
                + '</nav>'
                + '<article class="ice-floatbar-dropdown format-block">'
                + '<ul class="ice-floatbar-list">'
                + '<li><a href="#" title="Headline 1" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h1">Headline 1</a></li>'
                + '<li><a href="#" title="Headline 2" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h2">Headline 2</a></li>'
                + '<li><a href="#" title="Headline 3" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h3">Headline 3</a></li>'
                + '<li><a href="#" title="Headline 4" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h4">Headline 4</a></li>'
                + '<li><a href="#" title="Headline 5" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h5">Headline 5</a></li>'
                + '<li><a href="#" title="Headline 6" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="h6">Headline 6</a></li>'
                + '<li><a href="#" title="Paragraph" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="p">Paragraph</a></li>'
                + '<li><a href="#" title="Code" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="pre">Code</a></li>'
                + '<li><a href="#" title="Quote" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="blockquote">Quote</a></li>'
                + '<li><a href="#" title="Ordered List" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="ol">Ordered List</a></li>'
                + '<li><a href="#" title="Unordered List" data-ice-method="formatBlock" data-ice-decoration="formatBlock" data-ice-argument="ul">Unordered List</a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown font">'
                + '<p><input type="text" title="Font Size" placeholder="Font Size" value="" data-ice-decoration="fontSize" /></p>'
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
                + '</ul>'
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
                + '<p><input type="text" title="Link URL" placeholder="Link URL" value="" data-ice-decoration="linkURL" /></p>'
                + '<p><label>Show in New Tab</label><label class="switch"><input type="checkbox" /><span class="slider round"></span></label></p>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown color">'
                + '<p><input type="text" title="Foreground Color" placeholder="Foreground Color" value="" data-ice-decoration="foreColor" /></p>'
                + '<p><input type="text" title="Background Color" placeholder="Background Color" value="" data-ice-decoration="backColor" /></p>'
                + '</article>'
                + '</div>'
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
            this._element = this.editor.document.createElement("iframe");
            this._element.classList.add("ice-floatbar");
            this._element.onload = this._load.bind(this);
            this.editor.document.body.appendChild(this._element);
        },

        /**
         * Destructor
         *
         * @return {Void}
         */
        destroy: function() {
            delete this._element.ice;
            this._element.parentElement.removeChild(this._element);
            this._element = null;

            delete this._handleThisClick;
            delete this._handleThisChange;
        },

        /**
         * Load iframe:
         * add classes to dom nodes, append
         * template and add event listeners
         *
         * @return {Void}
         */
        _load: function() {
            this._element.contentDocument.documentElement.classList.add("ice-floatbar-html");
            this._element.contentDocument.body.classList.add("ice-floatbar-body");

            // bind handles with this
            this._handleThisClick = this._handleClick.bind(this);
            this._handleThisChange = this._handleChange.bind(this);

            // template
            var div = this.editor.document.createElement("div");
            div.innerHTML = this.options("template");
            this._wrapper = div.childNodes[0];
            this._wrapper.classList.add("ice-floatbar-wrapper");
            this._wrapper.classList.add("ice-floatbar-position-top");
            this._wrapper.addEventListener("click", this._handleThisClick);
            this._element.contentDocument.body.appendChild(this._wrapper);

            // append all sylesheets to iframe
            for (var i = 0; i < document.styleSheets.length; i++) {
                var style = document.styleSheets[i].ownerNode.cloneNode();
                this._element.contentDocument.head.appendChild(style);
            }

            // hide not allowed format blocks
            this.wrapper.querySelectorAll('[data-ice-method="formatBlock"][data-ice-argument]').forEach(function(node) {
                if (this.editor.options("allowedBlocks").indexOf(node.getAttribute("data-ice-argument")) === -1) {
                    node.style.display = "none";
                }
            }.bind(this));

            // @todo - font family list

            // define ui (decoration nodes)
            this._ui = {};
            this.wrapper.querySelectorAll("[data-ice-decoration]").forEach(function(node) {
                var attr = node.getAttribute("data-ice-decoration");
                if (!(attr in this._ui))
                    this._ui[attr] = [];
                this._ui[attr].push(node);

                node.addEventListener("change", this._handleThisChange);
            }.bind(this));
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
         * Get this.wrapper object
         *
         * @return {Object}
         */
        get wrapper() {
            return this._wrapper;
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
            this.wrapper.removeAttribute("data-ice-floatbar-view");
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

            //this.element.style.width = this.wrapper.scrollWidth + "px";
            this.element.style.height = this.wrapper.scrollHeight + "px";

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
            this.wrapper.classList.remove(this._className + "-position-top");
            this.wrapper.classList.remove(this._className + "-position-bottom");
            this.wrapper.classList.add(this._className + "-position-" + position.className);
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

                    if (typeof node.value === "string")
                        node.value = decorations ? decorations[decor] : null;
                });
            }
        },

        /**
         * Floatbar click event handler:
         * toggle view or execute editor method
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleClick: function(e) {
            var node = ice.Util.closest(e.target, "[data-ice-toggle-view]");
            if (node) {
                var attr = node.getAttribute("data-ice-toggle-view");
                var value = this.wrapper.getAttribute("data-ice-floatbar-view");

                if (value === attr)
                    this.wrapper.removeAttribute("data-ice-floatbar-view");
                else
                    this.wrapper.setAttribute("data-ice-floatbar-view", attr);

                this._reposition();
            }

            var node = ice.Util.closest(e.target, "[data-ice-method]");
            if (node) {
                var method = node.getAttribute("data-ice-method");
                var args = node.getAttribute("data-ice-argument");

                if (typeof this.editor[method] === "function")
                    this.editor[method].apply(this.editor, args ? [ args ] : []);
            }

            // prevent default on anchor tag click
            if (ice.Util.closest(e.target, "a"))
                e.preventDefault();
        },

        /**
         * Floatbar change event handler:
         * execute editor method
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleChange: function(e) {
            var node = e.target;
            var method = node.getAttribute("data-ice-decoration");;
            var args = node.value;

            if (typeof this.editor[method] === "function")
                this.editor[method].apply(this.editor, args ? [ args ] : []);
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
        if (e.detail.editor.floatbar) {
            if (!ice.Util.closest(e.detail.editor.document.activeElement, ".ice-floatbar"))
                e.detail.editor.floatbar.hide();
        }
    });

    // document select event
    document.addEventListener("iceselect", function(e) {
        if (e.detail.editor.floatbar && (e.detail.range.collapsed || !e.detail.editor.floatbar.editor.options("floatbar")))
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
