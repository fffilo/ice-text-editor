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
                + '<li><a href="#" title="Format Block" data-ice-method="toggle" data-ice-args="[&quot;format-block&quot;]"><i class="fa fa-code"></i></a></li>'
                + '<li data-ice-decoration="bold"><a href="#" title="Bold" data-ice-method="exec" data-ice-args="[&quot;bold&quot;]"><i class="fa fa-bold"></i></a></li>'
                + '<li data-ice-decoration="italic"><a href="#" title="Italic" data-ice-method="exec" data-ice-args="[&quot;italic&quot;]"><i class="fa fa-italic"></i></a></li>'
                + '<li><a href="#" title="Font" data-ice-method="toggle" data-ice-args="[&quot;font&quot;]"><i class="fa fa-font"></i></a></li>'
                + '<li><a href="#" title="Text Align" data-ice-method="toggle" data-ice-args="[&quot;align&quot;]" ><i class="fa fa-align-center"></i></a></li>'
                + '<li data-ice-decoration="linkCount">'
                + '<a href="#" title="Link" data-ice-method="toggle" data-ice-args="[&quot;link&quot;]"><i class="fa fa-link"></i></a>'
                + '<a href="#" title="Unlink" data-ice-method="exec" data-ice-args="[&quot;unlink&quot;]"><i class="fa fa-link"></i></a>'
                + '</li>'
                + '<li><a href="#" title="Color" data-ice-method="toggle" data-ice-args="[&quot;color&quot;]" ><i class="fa fa-circle"></i></a></li>'
                + '</ul>'
                + '</nav>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-format-block">'
                + '<ul class="ice-floatbar-list" data-ice-decoration="formatBlock">'
                + '<li><a href="#" title="Headline 1" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h1&quot;]">Headline 1</a></li>'
                + '<li><a href="#" title="Headline 2" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h2&quot;]">Headline 2</a></li>'
                + '<li><a href="#" title="Headline 3" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h3&quot;]">Headline 3</a></li>'
                + '<li><a href="#" title="Headline 4" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h4&quot;]">Headline 4</a></li>'
                + '<li><a href="#" title="Headline 5" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h5&quot;]">Headline 5</a></li>'
                + '<li><a href="#" title="Headline 6" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;h6&quot;]">Headline 6</a></li>'
                + '<li><a href="#" title="Paragraph" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;p&quot;]">Paragraph</a></li>'
                + '<li><a href="#" title="Code" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;pre&quot;]">Code</a></li>'
                + '<li><a href="#" title="Quote" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;blockquote&quot;]">Quote</a></li>'
                + '<li><a href="#" title="Ordered List" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;ol&quot;]">Ordered List</a></li>'
                + '<li><a href="#" title="Unordered List" data-ice-method="exec" data-ice-args="[&quot;formatBlock&quot;,&quot;ul&quot;]">Unordered List</a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-font">'
                + '<p><input type="range" title="Font Size" placeholder="Font Size" value="" min="6" max="128" data-ice-suffix="px" data-ice-method="exec" data-ice-args="[&quot;fontSize&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="fontSize" /><span title="Font Size" data-ice-decoration="fontSize"></span></p>'
                + '<ul class="ice-floatbar-list">'
                + '<li><a href="#" title="Arial, Helvetica, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;Arial, Helvetica, sans-serif&quot;]">Arial, Helvetica, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Arial Black&quot;, Gadget, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Arial Black&bsol;&quot;, Gadget, sans-serif&quot;]">&quot;Arial Black&quot;, Gadget, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Comic Sans MS&quot;, cursive, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Comic Sans MS&bsol;&quot;, cursive, sans-serif&quot;]">&quot;Comic Sans MS&quot;, cursive, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Courier New&quot;, Courier, monospace" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Courier New&bsol;&quot;, Courier, monospace&quot;]">&quot;Courier New&quot;, Courier, monospace</a></li>'
                + '<li><a href="#" title="Georgia, serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;Georgia, serif&quot;]">Georgia, serif</a></li>'
                + '<li><a href="#" title="Impact, Charcoal, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;Impact, Charcoal, sans-serif&quot;]">Impact, Charcoal, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Lucida Console&quot;, Monaco, monospace" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Lucida Console&bsol;&quot;, Monaco, monospace&quot;]">&quot;Lucida Console&quot;, Monaco, monospace</a></li>'
                + '<li><a href="#" title="&quot;Lucida Sans Unicode&quot;, &quot;Lucida Grande&quot;, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Lucida Sans Unicode&bsol;&quot;, &bsol;&quot;Lucida Grande&bsol;&quot;, sans-serif&quot;]">&quot;Lucida Sans Unicode&quot;, &quot;Lucida Grande&quot;, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Palatino Linotype&bsol;&quot;, &bsol;&quot;Book Antiqua&bsol;&quot;, Palatino, serif&quot;]">&quot;Palatino Linotype&quot;, &quot;Book Antiqua&quot;, Palatino, serif</a></li>'
                + '<li><a href="#" title="Tahoma, Geneva, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;Tahoma, Geneva, sans-serif&quot;]">Tahoma, Geneva, sans-serif</a></li>'
                + '<li><a href="#" title="&quot;Times New Roman&quot;, Times, serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Times New Roman&bsol;&quot;, Times, serif&quot;]">&quot;Times New Roman&quot;, Times, serif</a></li>'
                + '<li><a href="#" title="&quot;Trebuchet MS&quot;, Helvetica, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;&bsol;&quot;Trebuchet MS&bsol;&quot;, Helvetica, sans-serif&quot;]">&quot;Trebuchet MS&quot;, Helvetica, sans-serif</a></li>'
                + '<li><a href="#" title="Verdana, Geneva, sans-serif" data-ice-method="exec" data-ice-args="[&quot;fontName&quot,&quot;Verdana, Geneva, sans-serif&quot;]">Verdana, Geneva, sans-serif</a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-align">'
                + '<ul data-ice-decoration="align">'
                + '<li><a href="#" title="Text Align Left" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;left&quot;]"><i class="fa fa-align-left"></i></a></li>'
                + '<li><a href="#" title="Text Align Center" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;center&quot;]"><i class="fa fa-align-center"></i></a></li>'
                + '<li><a href="#" title="Text Align Right" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;right&quot;]"><i class="fa fa-align-right"></i></a></li>'
                + '<li><a href="#" title="Text Align Justify" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;justify&quot;]"><i class="fa fa-align-justify"></i></a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-link">'
                + '<p><input type="text" title="Link URL" placeholder="Link URL" value="" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,&quot;&dollar;value&quot;,null,null]" data-ice-decoration="linkURL" /></p>'
                + '<p><label>Show in New Tab</label><label class="ice-floatbar-switch" title="Show in New Tab"><input type="checkbox" value="_blank" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,null,&quot;&dollar;value&quot;,null]" data-ice-decoration="linkTarget" /><span></span></label></p>'
                + '<p><label>No Follow</label><label class="ice-floatbar-switch" title="No Follow"><input type="checkbox" value="nofollow" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,null,null,&quot;&dollar;value&quot;]" data-ice-decoration="linkRel" /><span></span></label></p>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-color">'
                + '<p><input type="text" title="Foreground Color" placeholder="Foreground Color" value="" data-ice-method="exec" data-ice-args="[&quot;foreColor&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="foreColor" /></p>'
                + '<p><input type="text" title="Background Color" placeholder="Background Color" value="" data-ice-method="exec" data-ice-args="[&quot;backColor&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="backColor" /></p>'
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
            this._element.classList.add(this._className);
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
            this._element.contentDocument.documentElement.classList.add(this._className + "-html");
            this._element.contentDocument.body.classList.add(this._className + "-body");

            // bind handles with this
            this._handleThisClick = this._handleClick.bind(this);
            this._handleThisChange = this._handleChange.bind(this);

            // template
            var div = this.editor.document.createElement("div");
            div.innerHTML = this.options("template");
            this._wrapper = div.childNodes[0];
            this._wrapper.classList.add(this._className + "-wrapper");
            this._wrapper.classList.add(this._className + "-position-top");
            this._wrapper.addEventListener("click", this._handleThisClick);
            this._wrapper.addEventListener("change", this._handleThisChange);
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
            if (this.element.classList.contains(this._className + "-show"))
                return;

            this.dropdown(null);
            this.element.classList.add(this._className + "-show");
        },

        /**
         * Hide floatbar
         *
         * @return {Void}
         */
        hide: function() {
            if (!this.element.classList.contains(this._className + "-show"))
                return;

            this.element.classList.remove(this._className + "-show");
            this.dropdown(null);
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
         * Get or set current dropdown
         *
         * @param  {String} value
         * @return {Mixed}
         */
        dropdown: function(value) {
            if (typeof value === "undefined")
                return this.wrapper.getAttribute("data-" + this._className + "-dropdown");

            if (value)
                this.wrapper.setAttribute("data-" + this._className + "-dropdown", value);
            else
                this.wrapper.removeAttribute("data-" + this._className + "-dropdown");
        },

        /**
         * Toggle current dropdown
         *
         * @param  {String} value
         * @return {Void}
         */
        toggle: function(value) {
            if (this.dropdown() === value)
                this.dropdown(null);
            else
                this.dropdown(value);

            this._reposition();
        },

        /**
         * Execute ice-editor method
         * note: you can pass additional arguments
         *
         * @param  {String} method
         * @return {Mixed}
         */
        exec: function(method) {
            if (typeof this.editor[method] === "function")
                this.editor[method].apply(this.editor, Array.prototype.slice.call(arguments, 1));
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

            if (!this.element || !this.wrapper)
                return;

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
                    var value = decorations ? decorations[decor] : null;
                    //var prefix = node.getAttribute("data-ice-prefix") || "";
                    //var suffix = node.getAttribute("data-ice-suffix") || "";
                    node.setAttribute("data-ice-status", value);

                    // value (input/select/textarea)
                    if (node.tagName === "INPUT" && ["checkbox", "radio"].indexOf(node.type) !== -1) {
                        node.checked = node.value == value;
                    }
                    else if (node.tagName === "INPUT" && ["number", "range"].indexOf(node.type) !== -1) {
                        var match = (value || "").match(/(\d+(\.\d+)?)(\w+)?/);
                        if (match) {
                            var number = parseFloat(match[1]);
                            var unit = match[2] || "";

                            if (unit)
                                node.setAttribute("data-ice-suffix", unit);

                            node.value = number;
                        }
                    }
                    else if (typeof node.value === "string") {
                        node.value = value;
                    }

                    var event = new Event("change", { bubbles: false });
                    node.dispatchEvent(event);
                });
            }
        },

        /**
         * Floatbar click event handler:
         * prevent default for a tags and
         * execute this._handleChange
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleClick: function(e) {
            if (ice.Util.closest(e.target, "a"))
                e.preventDefault();

            // this._handleChange will do the job
            if (["input", "select", "textarea"].indexOf(e.target.tagName.toLowerCase()) !== -1)
                return;

            this._handleChange(e);
        },

        /**
         * Floatbar change event handler:
         * execute floatbar method
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleChange: function(e) {
            var node = ice.Util.closest(e.target, "[data-ice-method]");
            if (!node)
                return;

            // get method and arguments from data attribute
            // and replace items that starts with dollar
            // sign with node property (for example:
            // $value with node.value)
            var method = node.getAttribute("data-ice-method");
            var attr = node.getAttribute("data-ice-args");
            var args = JSON.parse(attr).map(function(item) {
                var result = item;
                if (typeof result === "string" && result.substr(0,1) === "$" && result.substr(1) in node)
                    result = node[result.substr(1)];
                if (item === "$value")
                    result = ""
                        + (node.getAttribute("data-ice-prefix") || "")
                        + result
                        + (node.getAttribute("data-ice-suffix") || "");
                if (node.tagName === "INPUT" && ["checkbox", "radio"].indexOf(node.type) !== -1 && item === "$value" && !node.checked)
                    result = undefined;

                return result;
            });

            if (typeof this[method] === "function")
                this[method].apply(this, args);
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

    // document unselect event:
    // hide current editor floatbar
    document.addEventListener("iceunselect", function(e) {
        if (e.detail.editor.floatbar) {
            if (!ice.Util.closest(e.detail.editor.document.activeElement, "." + ice.Floatbar.prototype._className))
                e.detail.editor.floatbar.hide();
        }
    });

    // document select event:
    // reposition and show current editor floatbar
    document.addEventListener("iceselect", function(e) {
        if (e.detail.editor.floatbar && (e.detail.range.collapsed || !e.detail.editor.floatbar.editor.options("floatbar")))
            return e.detail.editor.floatbar.hide();

        //e.detail.editor.floatbar.dropdown(null);
        e.detail.editor.floatbar._reposition(e.detail.rect);
        e.detail.editor.floatbar._setDecorations(e.detail.decorations);
        e.detail.editor.floatbar.show();
    });

    // window select event:
    // refresh floatbar decorations
    window.addEventListener("resize", function(e) {
        var ice = window.ice.Util.getActiveEditor();
        if (!ice || !ice.floatbar || !ice.options("floatbar"))
            return;

        ice.floatbar.refresh()
    });

})();
