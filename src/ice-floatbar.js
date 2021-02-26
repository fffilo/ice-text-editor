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
     * ice_Floatbar constructor
     *
     * @param  {Object} editor
     * @param  {Object} options
     * @return {Void}
     */
    var ice_Floatbar = function(options) {
        if (!(this instanceof ice_Floatbar))
            throw "ice.Floatbar: ice.Floatbar is a constructor";

        this._options = options;
        this._editor = null;
        this._selectionString = null;

        this._init();
    }

    /**
     * ice_Floatbar prototype
     *
     * @type {Object}
     */
    ice_Floatbar.prototype = {

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
            parent: window.document.body,
            template: ''
                + '<div class="ice-floatbar-wrapper">'
                + '<div class="ice-floatbar-content">'
                + '<nav class="ice-floatbar-nav">'
                + '<ul class="ice-floatbar-hlist">'
                + '<li class="ice-floatbar-list-item-format-block"><a href="#" title="Format Block" data-ice-method="toggleDropdown" data-ice-args="[&quot;format-block&quot;]"><i class="fa fa-paragraph"></i></a></li>'
                + '<li  class="ice-floatbar-list-item-bold" data-ice-decoration="bold"><a href="#" title="Bold" data-ice-method="exec" data-ice-args="[&quot;bold&quot;]"><i class="fa fa-bold"></i></a></li>'
                + '<li  class="ice-floatbar-list-item-italic" data-ice-decoration="italic"><a href="#" title="Italic" data-ice-method="exec" data-ice-args="[&quot;italic&quot;]"><i class="fa fa-italic"></i></a></li>'
                + '<li class="ice-floatbar-list-item-font"><a href="#" title="Font" data-ice-method="toggleDropdown" data-ice-args="[&quot;font&quot;]"><i class="fa fa-font"></i></a></li>'
                + '<li class="ice-floatbar-list-item-align"><a href="#" title="Text Align" data-ice-method="toggleDropdown" data-ice-args="[&quot;align&quot;]" ><i class="fa fa-align-center"></i></a></li>'
                + '<li class="ice-floatbar-list-item-link" data-ice-decoration="linkCount"><a href="#" title="Link" data-ice-method="toggleDropdown" data-ice-args="[&quot;link&quot;]" data-ice-pre-method="exec" data-ice-pre-args="[&quot;filterSelection&quot;,&quot;a&quot;]"><i class="fa fa-link"></i></a></li>'
                + '<li class="ice-floatbar-list-item-unlink" data-ice-decoration="linkCount"><a href="#" title="Unlink" data-ice-method="exec" data-ice-args="[&quot;unlink&quot;]"><i class="fa fa-chain-broken"></i></a></li>'
                + '<li class="ice-floatbar-list-item-color"><a href="#" title="Color" data-ice-method="toggleDropdown" data-ice-args="[&quot;color&quot;]" ><i class="fa fa-circle"></i></a></li>'
                + '<li class="ice-floatbar-list-item-remove-format"><a href="#" title="Remove All Formatting" data-ice-method="exec" data-ice-args="[&quot;removeFormat&quot;]" ><i class="fa fa-times"></i></a></li>'
                + '</ul>'
                + '</nav>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-format-block">'
                + '<ul class="ice-floatbar-vlist" data-ice-decoration="formatBlock">'
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
                + '<p><input type="range" title="Font Size" placeholder="Font Size" value="" min="6" max="128" data-ice-suffix="px" data-ice-method="exec" data-ice-args="[&quot;fontSize&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="fontSize" /><span class="ice-floatbar-unit" title="Font Size" data-ice-decoration="fontSize"></span></p>'
                + '<ul class="ice-floatbar-vlist">'
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
                + '<ul class="ice-floatbar-hlist" data-ice-decoration="align">'
                + '<li><a href="#" title="Text Align Left" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;left&quot;]"><i class="fa fa-align-left"></i></a></li>'
                + '<li><a href="#" title="Text Align Center" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;center&quot;]"><i class="fa fa-align-center"></i></a></li>'
                + '<li><a href="#" title="Text Align Right" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;right&quot;]"><i class="fa fa-align-right"></i></a></li>'
                + '<li><a href="#" title="Text Align Justify" data-ice-method="exec" data-ice-args="[&quot;align&quot;,&quot;justify&quot;]"><i class="fa fa-align-justify"></i></a></li>'
                + '</ul>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-link">'
                + '<p>'
                + '<input type="text" title="Link URL" placeholder="Link URL" value="" data-ice-empty-value="#" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,&quot;&dollar;value&quot;,null,null]" data-ice-decoration="linkURL" />'
                + '<a href="#" target="_parent|_blank" title="Open Link" data-ice-link-test=""><i class="fa fa-external-link"></i></a>'
                + '</p>'
                + '<p><label>Show in New Tab</label><label class="ice-floatbar-switch" title="Show in New Tab"><input type="checkbox" value="_blank" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,null,&quot;&dollar;value&quot;,null]" data-ice-decoration="linkTarget" /><span></span></label></p>'
                + '<p><label>No Follow</label><label class="ice-floatbar-switch" title="No Follow"><input type="checkbox" value="nofollow" data-ice-method="exec" data-ice-args="[&quot;createLink&quot;,null,null,&quot;&dollar;value&quot;]" data-ice-decoration="linkRel" /><span></span></label></p>'
                + '</article>'
                + '<article class="ice-floatbar-dropdown ice-floatbar-dropdown-color">'
                + '<p><input type="text" title="Foreground Color" placeholder="Foreground Color" value="" data-ice-method="exec" data-ice-args="[&quot;foreColor&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="foreColor" /></p>'
                + '<p><input type="text" title="Background Color" placeholder="Background Color" value="" data-ice-method="exec" data-ice-args="[&quot;backColor&quot;,&quot;&dollar;value&quot;]" data-ice-decoration="backColor" /></p>'
                + '</article>'
                + '</div>'
                + '</div>',
            oninit: null,
            onready: null,
            onshow: null,
            onhide: null,
            ondropdown: null,
            onexec: null
        },

        /**
         * Initialize
         *
         * @return {Void}
         */
        _init: function() {
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

            // fix parent
            if (typeof this._options.parent === "string")
                this._options.parent = document.querySelector(this._options.parent);
            if (!(this._options.parent instanceof window.Node))
                this._options.parent = this._defaults.parent;
            if (!(this._options.parent instanceof window.Node))
                this._options.parent = document.body;

            // fix events
            [ "oninit", "onready", "onshow", "onhide", "ondropdown", "onexec" ].forEach(function(item) {
                if (typeof this._options[item] !== "function")
                    this._options[item] = function(e) {};
            }.bind(this))

            // define event handlers
            this._handler = {
                load: this._handleLoad.bind(this),
                resize: this._handleResize.bind(this),
                click: this._handleClick.bind(this),
                change: this._handleChange.bind(this),
                mousedown: this._handleMousedown.bind(this),
                select: this._handleSelect.bind(this),
                unselect: this._handleUnselect.bind(this),
            }

            // create
            this._element = this.options("parent").ownerDocument.createElement("div");
            this._element.classList.add(this._className);
            this._element.ice = this;
            this.options("parent").ownerDocument.body.appendChild(this._element);

            // iframe
            this._iframe = this.options("parent").ownerDocument.createElement("iframe");
            this._iframe.classList.add(this._className + "-iframe");
            this._iframe.onload = this._handler.load;
            this._element.appendChild(this._iframe);

            // resize
            this._element.ownerDocument.defaultView.addEventListener("resize", this._handler.resize);

            // event
            var event = new CustomEvent("icefloatbarinit");
            this.options("oninit").call(this, event);
            this.element.dispatchEvent(event);
        },

        /**
         * Destructor
         *
         * @return {Void}
         */
        destroy: function() {
            // remove event listeners
            this.element.ownerDocument.defaultView.removeEventListener("resize", this._handler.resize);
            this.element.ownerDocument.removeEventListener("iceunselect", this._handler.unselect);
            this.element.ownerDocument.removeEventListener("iceselect", this._handler.select);
            this.element.ownerDocument.removeEventListener("mousedown", this._handler.mousedown);
            delete this._handler;

            // remove floatbar element
            delete this.element.ice;
            this.element.parentElement.removeChild(this.element);

            // clear all
            this._options = null;
            this._editor = null;
            this._element = null;
            this._iframe = null;
            this._wrapper = null;
            this._ui = null;
            this._selectionString = null;

        },

        /**
         * Get this.editor object:
         * active ice editor
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
         * Get window object from iframe
         *
         * @return {Object}
         */
        get window() {
            return this.document ? this.document.defaultView : null;
        },

        /**
         * Get document object from iframe
         *
         * @return {Object}
         */
        get document() {
            return this._iframe ? this._iframe.contentDocument : null;
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
         * Get selection string
         *
         * @return {Mixed}
         */
        get selectionString() {
            return this._selectionString;
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

            var event = new CustomEvent("icefloatbarshow");
            this.options("onshow").call(this, event);
            this.element.dispatchEvent(event);
            if (event.defaultPrevented)
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

            var event = new CustomEvent("icefloatbarhide");
            this.options("onhide").call(this, event);
            this.element.dispatchEvent(event);
            if (event.defaultPrevented)
                return;

            this.element.classList.remove(this._className + "-show");
            this.dropdown(null);
        },

        /**
         * Toggle show/hide
         *
         * @return {Void}
         */
        toggle: function() {
            if (this.element.classList.contains(this._className + "-show"))
                this.hide();
            else
                this.show();
        },

        /**
         * Refresh floatbar:
         * set decorators and reposition element
         *
         * @return {Void}
         */
        refresh: function() {
            this._setAttributes();
            this._setDecorations();
            this._reposition();
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

            var old = this.dropdown();
            if (value === old)
                return;

            var event = new CustomEvent("icefloatbardropdown", { detail: { from: old, to: value } });
            this.options("ondropdown").call(this, event);
            this.element.dispatchEvent(event);
            if (event.defaultPrevented)
                return;

            if (value)
                this.wrapper.setAttribute("data-" + this._className + "-dropdown", value);
            else
                this.wrapper.removeAttribute("data-" + this._className + "-dropdown");

            this._reposition();
        },

        /**
         * Toggle current dropdown
         *
         * @param  {String} value
         * @return {Void}
         */
        toggleDropdown: function(value) {
            if (this.dropdown() === value)
                this.dropdown(null);
            else
                this.dropdown(value);
        },

        /**
         * Execute ice-editor method
         * note: you can pass additional arguments
         * after method param
         *
         * @param  {String} method
         * @return {Mixed}
         */
        exec: function(method) {
            if (!this.editor || !method || typeof this.editor[method] !== "function")
                return;

            var args = Array.prototype.slice.call(arguments, 1);
            var event = new CustomEvent("icefloatbarexec", { detail: { method: method, arguments: args } });
            this.options("onexec").call(this, event);
            this.element.dispatchEvent(event);
            if (event.defaultPrevented)
                return;

            this.editor[method].apply(this.editor, args);
        },

        /**
         * Reposition floatbar element
         *
         * @param  {Object} rect
         * @return {Void}
         */
        _reposition: function(rect) {
            if (!this.element || !this.wrapper || !this.editor)
                return;

            if (!rect) {
                var selection = this.editor.window.getSelection();
                if (!selection.rangeCount)
                    return;
                var range = selection.getRangeAt(0);

                rect = range.getBoundingClientRect();
            }

            this._iframe.style.width = this.wrapper.offsetWidth + "px";
            this._iframe.style.height = this.wrapper.offsetHeight + "px";

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

            // floatbar off viewport
            if (rect.top - this.element.offsetHeight < 0) {
                position.top += rect.height + this.element.offsetHeight;
                position.className = "bottom";
            }

            // left/top position
            this.element.style.left = Math.round(position.left) + "px";
            this.element.style.top = Math.round(position.top) + "px";

            // floatbar direction
            if (this.element.classList.contains(this._className + "-position-top") && position.className !== "top")
                this.element.classList.remove(this._className + "-position-top");
            if (this.element.classList.contains(this._className + "-position-bottom") && position.className !== "bottom")
                this.element.classList.remove(this._className + "-position-bottom");
            if (this.wrapper.classList.contains(this._className + "-position-top") && position.className !== "top")
                this.wrapper.classList.remove(this._className + "-position-top");
            if (this.wrapper.classList.contains(this._className + "-position-bottom") && position.className !== "bottom")
                this.wrapper.classList.remove(this._className + "-position-bottom");
            this.element.classList.add(this._className + "-position-" + position.className);
            this.wrapper.classList.add(this._className + "-position-" + position.className);
        },

        /**
         * Set decorations
         *
         * @param  {Object} decorations
         * @return {Void}
         */
        _setDecorations: function(decorations) {
            if (!this.element || !this.wrapper || !this.editor)
                return;

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

                    var event = new Event("change");
                    node.dispatchEvent(event);
                }.bind(this));
            }
        },

        /**
         * Set html node data attributes
         *
         * @return {Void}
         */
        _setAttributes: function() {
            // get attributes as object
            var attrHtml = {},
                attrEdit = {};
            if (this.document)
                Array.prototype.slice.call(this.document.documentElement.attributes)
                    .filter(function(item) {
                        return item.name.substr(0, 5) === "data-";
                    })
                    .forEach(function(item) {
                        attrHtml[item.name] = item.value;
                    });
            if (this.editor)
                Array.prototype.slice.call(this.editor.element.attributes)
                    .filter(function(item) {
                        return item.name.substr(0, 5) === "data-";
                    })
                    .forEach(function(item) {
                        attrEdit[item.name] = item.value;
                    });

            // remove
            for (var key in attrHtml) {
                if (!(key in attrEdit))
                    this.document.documentElement.removeAttribute(key);
            }

            // add
            for (var key in attrEdit) {
                this.document.documentElement.setAttribute(key, attrEdit[key]);
            }
        },

        /**
         * Iframe load event handler:
         * add classes to dom nodes, append
         * template and add event listeners
         *
         * @return {Void}
         */
        _handleLoad: function() {
            // add ice class to html/body node
            this.document.documentElement.classList.add(this._className + "-html");
            this.document.body.classList.add(this._className + "-body");

            // add all data attributes from element to html
            for (var i = 0; i < this.element.attributes.length; i++) {
                if (this.element.attributes[i].name.substr(0, 5) === "data-")
                    this.document.documentElement.setAttribute(this.element.attributes[i].name, this.element.attributes[i].value);
            }

            // append all document sylesheets to iframe
            for (var i = 0; i < this.element.ownerDocument.styleSheets.length; i++) {
                var style = this.element.ownerDocument.styleSheets[i].ownerNode.cloneNode();
                this.document.head.appendChild(style);
            }

            // create template
            var div = this.document.createElement("div");
            div.innerHTML = this.options("template");
            this._wrapper = div.childNodes[0];
            this._wrapper.classList.add(this._className + "-wrapper");
            this._wrapper.classList.add(this._className + "-position-top");
            this._wrapper.addEventListener("click", this._handler.click);
            this._wrapper.addEventListener("change", this._handler.change);
            this.document.body.appendChild(this._wrapper);

            // define ui (decoration nodes)
            this._ui = {};
            this.wrapper.querySelectorAll("[data-ice-decoration]").forEach(function(node) {
                var attr = node.getAttribute("data-ice-decoration");
                if (!(attr in this._ui))
                    this._ui[attr] = [];
                this._ui[attr].push(node);
            }.bind(this));

            // bind ice editor selection change
            this.element.ownerDocument.addEventListener("mousedown", this._handler.mousedown);
            this.element.ownerDocument.addEventListener("iceselect", this._handler.select);
            this.element.ownerDocument.addEventListener("iceunselect", this._handler.unselect);

            // refresh
            this.refresh();

            // event
            var event = new CustomEvent("icefloatbarready");
            this.options("onready").call(this, event);
            this.element.dispatchEvent(event);
        },

        /**
         * Element's window resize event handler:
         * reposition on window stop resizing
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleResize: function(e) {
            clearInterval(this._repositionInterval);
            this._repositionInterval = setTimeout(function() {
                this._repositionInterval = null;
                this._reposition();
            }.bind(this), 250);
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
            var target = e.target;
            var link = ice.Util.closest(target, "a");

            // test link
            // @todo - refacture
            if (link && ice.Util.is(link, "[data-ice-link-test]")) {
                var a = ice.Util.getSelectedNodes("a");
                if (a && a.length && a[0].href && a[0].href !== "#")
                    link.href = a[0].href;
                else
                    e.preventDefault();

                setTimeout(function() {
                    this.href = "#";
                }.bind(link));

                return;
            }

            if (link)
                e.preventDefault();

            // this._handleChange will do the job
            if (["input", "select", "textarea"].indexOf(target.tagName.toLowerCase()) !== -1)
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
            // info: if you are using debugger here
            // note that _handleChange is also called
            // inside _handleClick method

            var node = ice.Util.closest(e.target, "[data-ice-method]");
            if (!node)
                return;

            // do not allow empty value
            if (node.value === "" && ice.Util.is(node, "[data-ice-empty-value]"))
                node.value = node.getAttribute("data-ice-empty-value");

            // get method and arguments from data attribute
            // and replace items that starts with dollar
            // sign with node property (for example:
            // $value with node.value)
            ["pre-", "", "post-"].forEach(function(prefix, index) {
                var method = node.getAttribute("data-ice-" + prefix + "method");
                var attr = node.getAttribute("data-ice-" + prefix + "args");
                if (!attr)
                    return;

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

                // dirty hack:
                // pre method filterSelection changes editor
                // selection, so we need to wait a while
                // so the selection actually changes
                if (typeof this[method] === "function")
                    setTimeout(function() {
                        this[method].apply(this, args);
                    }.bind(this), index*10);
            }.bind(this));
        },

        /**
         * Iceselect event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleSelect: function(e) {
            var dropdown = this.selectionString !== e.detail.selectionString;

            this._editor = e.detail.editor;
            this._selectionString = e.detail.selectionString;
            this._setAttributes();

            if (!e.detail.hasSelection)
                return this.hide();

            if (dropdown)
                this.dropdown(null);

            this._reposition(e.detail.rect);
            this._setDecorations(e.detail.decorations);

            return this.show();
        },

        /**
         * Iceunselect event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleUnselect: function(e) {
            this._editor = null;
            this._selectionString = null;
            this._setAttributes();
            this.hide();
        },

        /**
         * Document mousedown event handler
         *
         * Click on document hides the ice-floatbar form. If
         * there is a input element focused on that form the
         * change won't be triggered, so let's force it...
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handleMousedown: function(e) {
            this.document.activeElement.blur();
        }

    }

    // Reassign constructor
    ice_Floatbar.prototype.constructor = ice_Floatbar;

    // Globalize
    ice.Floatbar = ice_Floatbar;

})();
