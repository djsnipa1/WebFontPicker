(function(window, document, $, _, Backbone, undefined) {


var WFP = window.WFP = window.WFP || {};

WFP.VERSION = "0.2.0";

if (WFP.bookmarklet && WFP.bookmarklet < 1) {
    console.log("Please update your bookmarklet.");
}

// Easing borrowed from jQuery UI
// http://api.jqueryui.com/easings/
$.easing.easeOutCubic = function(x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
};

// Creates a *single* element from an HTML string.
function elementFromHTML(html) {
    var temp = document.createElement("div");
    if (!html) return temp;
    temp.innerHTML = html;
    return temp.firstElementChild;
}

// Loads a stylesheet with the given the URL.
function loadStylesheet(href) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// Given an element, it returns its tag name
function tagName(element) {
    return element && element.nodeName && element.nodeName.toLowerCase();
}

// Given two arrays, it checks whether all the values in the second
// array are identical to the values in the beginning of the first array.
// 
//     startsWith([1,2,3,4,5], [1,2])
//     => true
//        
//     startsWith([1,2,3,4,5], [1,2,4])
//     => false
//   
function startsWith(a, b) {
    if (!_.isArray(a) || !_.isArray(b)) throw new Error("Value is not an array");
    if (a.length < b.length) {
        return false;
    }
    var i = Math.min(a.length, b.length);
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Given a variants array, it detects whether it contains at least one 
// italic variant. 
// 
// Variants arrays are used by the Google Font Developer API
// See: https://developers.google.com/fonts/docs/developer_api#Example
//
//     hasItalic(['300', '300italic', '700'])
//     => true
//        
function hasItalic(variants) {
    return _.some(variants, function(weight) {
        return weight.indexOf("italic") !== -1;
    });
}

// Given a variants array, it returns an array of weights available.
//   
//     getWeights(['300', '300italic', '700'])
//     => ['300', '700']
//       
function getWeights(variants) {
    var weights = [];
    if (!variants) return weights;
    _.forEach(variants, function(weight) {
        if (weight === "regular" || weight === "italic") {
            weight = "400";
        }
        // all valid weights are three-digit
        weight = weight.slice(0, 3);
        // check for duplicates
        if (weights.indexOf(weight) === -1) {
            weights.push(weight);
        }
    });
    return weights;
}

// Given an element and [parent] (optional), it climbs up the DOM tree
// and returns dataset.fontFamily if specified on the element or on 
// any of its parents up until [parent].
function getFamily(element, parent) {
    if (!element) return null;
    parent = parent || document.body;
    while (parent.contains(element)) {
        if (element && element.dataset && element.dataset.fontFamily !== undefined) return element.dataset.fontFamily;
        element = element.parentNode;
    }
    return null;
}

// Adds quotes to the passed string if it contains any whitespace characters.
function quotes(family) {
    var whitespace = /^[^'"].*\s+.*[^'"]$/;
    return family.search(whitespace) > -1 ? "'" + family + "'" : family;
}

this["WFP"] = this["WFP"] || {};

this["WFP"]["Templates"] = this["WFP"]["Templates"] || {};

this["WFP"]["Templates"]["Font"] = function(obj) {
    var __t, __p = "", __e = _.escape, __j = Array.prototype.join;
    function print() {
        __p += __j.call(arguments, "");
    }
    __p += '<div class="font" data-font-family="' + ((__t = obj.family) == null ? "" : __t) + '">\n    <div class="weights">\n        ';
    if (hasItalic(obj.variants)) {
        __p += "<i>I</i>";
    }
    __p += "\n        ";
    _.forEach(getWeights(obj.variants), function(weight) {
        __p += '<b data-weight="' + ((__t = weight) == null ? "" : __t) + '">' + ((__t = weight.charAt(0)) == null ? "" : __t) + "</b>";
    });
    __p += '00\n    </div>\n    <div class="font-family">' + ((__t = obj.family) == null ? "" : __t) + '</div>\n    <div class="arrow"></div>\n    <div class="preview" style="font-family:\'' + ((__t = obj.family) == null ? "" : __t) + "', serif !important\">AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz</div>\n</div>";
    return __p;
};

this["WFP"]["Templates"]["Picker"] = function(obj) {
    var __t, __p = "", __e = _.escape;
    __p += '<div id="font-picker">\n    <div id="font-picker-header">\n        <button class="add-style"></button>\n        <div class="font-picker-heading">Web Font Picker</div>\n    </div>\n    <div id="font-picker-list">\n        <div class="overlay"></div>\n    </div>\n</div>';
    return __p;
};

this["WFP"]["Templates"]["Style"] = function(obj) {
    var __t, __p = "", __e = _.escape, __j = Array.prototype.join;
    function print() {
        __p += __j.call(arguments, "");
    }
    __p += '<div class="style';
    if (obj.selected) {
        __p += " selected";
    }
    __p += '">\n\n    <!-- Selector -->\n    <div class="selector-wrapper child always-visible">\n        <label class="toggle-wrapper">\n            <input type="checkbox" class="toggle-active" ';
    if (obj.active) {
        __p += " checked ";
    }
    __p += '>\n            <span class="toggle"></span>\n        </label>\n        <button class="destroy">Delete</button>\n        <input type="text" class="selector" placeholder="CSS selector (e.g. body, h1, p)" value="' + ((__t = obj.selector) == null ? "" : __t) + '">\n    </div>\n\n    <!-- Font Menu -->\n    <div class="font-menu child">\n        <div class="search-wrapper">\n            <input type="search" class="search" placeholder="Search for a family">\n        </div>\n        <div class="current-wrapper">\n            <div class="font none" data-font-family="">\n                <div class="arrow"></div>\n                <span>Select a font</span>\n            </div>\n        </div>\n        <div class="font-list-wrapper">\n            <div class="font-list"></div>\n            <button class="load-more">Load more</button>\n        </div>\n        <div class="nothing">\n            <p>No fonts found.</p>\n        </div>\n    </div>\n\n    <!-- Weight -->\n    <div class="weight child">\n        <label>\n            <input type="checkbox" class="toggle-weight"';
    if (obj.weightEnabled) {
        __p += " checked ";
    }
    __p += '>\n            <span class="section-label">Weight</span>\n        </label>\n        <span class="select-weight"></span>\n    </div>\n\n    <!-- Combo -->\n    <div class="combo child clearfix">\n        <div class="font-size">\n            <label>\n                <input type="checkbox" class="toggle-font-size"';
    if (obj.fontSizeEnabled) {
        __p += " checked ";
    }
    __p += '>\n                <span>Font size</span>\n            </label>\n            <div>\n                <span class="adjustable change-font-size">16px</span>\n            </div>\n        </div>\n        <div class="line-height">\n            <label>\n                <input type="checkbox" id="line-height" class="toggle-line-height"';
    if (obj.lineHeightEnabled) {
        __p += " checked ";
    }
    __p += '>\n                <span>Line height</span>\n            </label>\n            <div>\n                <span class="adjustable change-line-height">1.5</span>\n            </div>\n        </div>\n        <div class="color">\n            <label>\n                <input type="checkbox" class="toggle-color"';
    if (obj.colorEnabled) {
        __p += " checked ";
    }
    __p += '>\n                <span>Color</span>\n            </label>\n            <input type="color" class="change-color" spellcheck="false" value="#5bbf45">\n        </div>\n    </div>\n    \n</div>';
    return __p;
};

this["WFP"]["Templates"]["Weights"] = function(obj) {
    var __t, __p = "", __e = _.escape, __j = Array.prototype.join;
    function print() {
        __p += __j.call(arguments, "");
    }
    _.forEach(obj.weights, function(weight) {
        __p += '<!--\n--><label><input data-weight="' + ((__t = weight) == null ? "" : __t) + '" class="change-weight" type="radio" name="weight"';
        if (weight == obj.selected) {
            __p += " checked";
        }
        __p += '><!--\n--><span data-weight="' + ((__t = weight) == null ? "" : __t) + '" class="preview-weight" style="font-weight: ' + ((__t = weight) == null ? "" : __t) + '">' + ((__t = weight) == null ? "" : __t) + "</span></label><!--\n-->";
    });
    return __p;
};

var Fonts = function() {
    var deferred = $.Deferred(), // Resolved once the list of fonts is received from the Google Fonts API.
    protocol = window.location.protocol === "https:" ? "https:" : "http:", apiKey = "AIzaSyBHkzKgKakKAAa-uGi0IPlA9tIy-lVyaqA", listAPI = "https://www.googleapis.com/webfonts/v1/webfonts", fontsAPI = protocol + "//fonts.googleapis.com/css?family=", letter = /[a-zA-Z]/, list = {}, // Object of <family name>:<fontObj> available.
    families = [], // Family names available.
    loaded = [], // Family names loaded.
    onload = deferred.done;
    $.ajax({
        url: listAPI,
        data: {
            sort: "popularity",
            key: apiKey
        },
        dataType: "jsonp",
        success: populate,
        error: function(jqxhr, status, error) {
            console.log("Could not load font list:", jqxhr, status, error);
        }
    });
    function populate(json) {
        _.forEach(json.items, function(obj) {
            families.push(obj.family);
            list[obj.family] = obj;
        });
        deferred.resolve(list);
    }
    function generateFragment(fontObj) {
        return fontObj.family.replace(/\s+/g, "+") + ":" + fontObj.variants.join(",");
    }
    function generateURL(families) {
        var fragments = _.map(families, function(family) {
            return generateFragment(list[family]);
        });
        var url = fontsAPI + fragments.join("|");
        return url;
    }
    function load(families) {
        if (typeof families === "string") families = [ families ];
        families = _.difference(families, loaded);
        if (!families.length) return;
        loaded = loaded.concat(families);
        loadStylesheet(generateURL(families));
    }
    function search(query) {
        if (!query || typeof query !== "string") return [];
        query = query.toLowerCase();
        // if query is a single letter, search for fonts starting with letter
        if (query.length === 1 && letter.test(query)) {
            return _.filter(families, function(family) {
                return family.slice(0, 1).toLowerCase() === query;
            });
        }
        return _.pluck(_.filter(list, function(fontObj) {
            return fontObj.family.toLowerCase().indexOf(query) > -1 || fontObj.variants.join(" ").indexOf(query) > -1 || fontObj.subsets.join(" ").indexOf(query) > -1;
        }), "family");
    }
    return {
        list: list,
        families: families,
        loaded: loaded,
        onload: onload,
        generateURL: generateURL,
        load: function(families) {
            onload(function() {
                load(families);
            });
        },
        search: function(query) {
            var deferred = $.Deferred();
            onload(function() {
                var results = search(query);
                deferred.resolve(results);
            });
            return deferred;
        }
    };
}();

function Stylesheet() {
    var element = this.element = document.createElement("style");
    document.head.appendChild(element);
    this.newRule = function(css) {
        var currentCSS = css = css || " ";
        var node = document.createTextNode(css);
        element.appendChild(node);
        function set(css) {
            if (css !== currentCSS) {
                node.nodeValue = currentCSS = css;
            }
        }
        function get() {
            return currentCSS;
        }
        function destroy() {
            element.removeChild(node);
        }
        return {
            set: set,
            get: get,
            destroy: destroy
        };
    };
}

var Style = Backbone.Model.extend({
    defaults: {
        // Style selected (expanded).
        selected: false,
        // Apply CSS rule.
        active: true,
        // Selector used in CSS rule.
        selector: "",
        // Properties below control the CSS output.
        // If a property is enabled, the value is applied to the CSS rule.
        family: "",
        weight: "",
        fontSize: "16px",
        fontStyle: "",
        color: "#00f",
        lineHeight: "1.5",
        textAlign: "left",
        textTransform: "",
        letterSpacing: "0"
    },
    css: {
        family: "font-family: %value%",
        weight: "font-weight: %value%",
        fontSize: "font-size: %value%",
        fontStyle: "font-style: %value%",
        color: "color: %value%",
        lineHeight: "line-height: %value%",
        textAlign: "text-align: %value%",
        textTransform: "text-transform: %value%",
        letterSpacing: "letter-spacing: %value%",
        highlight: "text-shadow: 0 0 5px rgba(255, 255, 255, 0.85), 0 0 10px rgba(0, 125, 255, 0.85), 0 0 20px #0CF, 0 0 30px #FFF"
    },
    initialize: function() {
        this.rule = stylesheet.newRule();
        // Enabled properties.
        this.enabled = {
            family: true,
            weight: false,
            fontSize: false,
            fontStyle: false,
            color: false,
            lineHeight: false,
            textAlign: false,
            textTransform: false,
            letterSpacing: false,
            highlight: false
        }, // Temporary properties are saved here.
        // They override any properties and are applied even if the property is disabled.
        this.temp = {};
        this.on("change toggle temporary", this.updateCSS);
        // Fires `select` and `deselect` events when a style is selected/deselected.
        this.on("change:selected", function(model, value) {
            var evt = value ? "select" : "deselect";
            this.trigger(evt);
        });
        this.on("destroy", function() {
            this.rule.destroy();
        });
    },
    getState: function() {
        return _.clone(this.attributes);
    },
    isActive: function() {
        return !!(this.get("active") && this.get("selector"));
    },
    isEnabled: function(prop) {
        return this.enabled[prop];
    },
    // Used for enabling/disabling properties, fires all the necessary events and stuff.
    // Use the `enable`, `disable` and `toggle` methods to enable/disable properties.
    _setToggle: function(prop, value) {
        var changes = {};
        if (this.enabled[prop] !== value) {
            changes[prop] = this.enabled[prop] = value;
            this.trigger("toggle:" + prop, value);
            this.trigger("toggle", changes);
        }
    },
    enable: function(prop) {
        this._setToggle(prop, true);
        return this;
    },
    disable: function(prop) {
        this._setToggle(prop, false);
        return this;
    },
    toggle: function(prop) {
        this.enabled[prop] ? this.disable(prop) : this.enable(prop);
        return this;
    },
    setTemp: function(object) {
        if (!object) return this;
        var changed = false;
        var changes = {};
        for (var prop in object) {
            if (this.temp[prop] !== object[prop]) {
                changes[prop] = this.temp[prop] = object[prop];
                this.trigger("temporary:" + prop, object[prop]);
                changed = true;
            }
        }
        if (changed) {
            this.trigger("temporary", changes);
        }
        return this;
    },
    unsetTemp: function(prop) {
        if (this.temp[prop] !== undefined) {
            delete this.temp[prop];
            this.trigger("temporary:" + prop);
            this.trigger("temporary");
        }
        return this;
    },
    // Generates the CSS rule as a string. The optional `beautify` parameter
    // is used for exporting nicely-formatted CSS.
    generateCSS: function(beautify) {
        var style = this;
        var state = this.getState();
        var temporary = this.temp;
        if (!state.selector) return;
        var prefix = "    ";
        var suffix = beautify ? ";" : " !important;";
        var props = [];
        props.push(state.selector + " {");
        _.forEach(this.css, function(css, prop) {
            if (style.enabled[prop] && state[prop] !== "" || temporary[prop]) {
                var value = temporary[prop] || state[prop];
                if (prop === "family") {
                    value = quotes(value);
                }
                var property = css.split("%value%").join(value);
                props.push(prefix + property + suffix);
            }
        });
        props.push("}");
        var rule = props.join("\n");
        if (!state.active) {
            rule = "/*" + rule + "*/";
        }
        return rule;
    },
    updateCSS: function() {
        if (this.isActive()) {
            this.rule.set(this.generateCSS());
        } else {
            this.rule.set(" ");
        }
        return this;
    }
});

var StyleList = Backbone.Collection.extend({
    model: Style,
    initialize: function() {
        _.bindAll(this, "addNew");
        this.on("remove", this.addIfEmpty);
        this.addIfEmpty();
    },
    // Adds a new blank model to the collection (and selects it).
    addNew: function() {
        var model = new this.model();
        this.add(model).select(model);
    },
    // Adds a new model if the collection is empty.
    addIfEmpty: function() {
        if (this.length === 0) {
            this.addNew();
        }
    },
    // Selects a model.
    select: function(model) {
        if (model.get("selected")) return;
        var selected = this.findWhere({
            selected: true
        });
        if (selected) selected.set("selected", false);
        model.set("selected", true);
    }
});

var PickerView = Backbone.View.extend({
    template: WFP.Templates.Picker,
    initialize: function() {
        var picker = this;
        // Options
        this.hideable = true;
        // Whether the picker is hideable.
        this.hideAfter = 1500;
        // How long to wait (in milliseconds) before the picker is hidden.
        this.stickOut = 18;
        // How much (in px) of the element is visible when hidden to the side.
        this.mouseOver = false;
        // Whether the cursor is over the picker.
        // Constructing an element from the template
        var element = elementFromHTML(this.template());
        this.setElement(element);
        // Caching selectors
        this.$list = this.$("#font-picker-list");
        this.$add = this.$(".add-style");
        // Attaching events
        this.listenTo(Styles, "add", this.add);
        this.listenTo(Styles, "remove", this._onModelRemove);
        this.attachDOMEvents();
        this.populate();
        // Slides the picker out (it is hidden by default in CSS).
        // Deferred so that the element is first appended to the body.
        _.defer(function() {
            picker.show();
        });
    },
    attachDOMEvents: function() {
        var picker = this;
        this.$el.on({
            mouseenter: function() {
                picker.mouseOver = true;
                picker.show();
            },
            mouseleave: function() {
                picker.mouseOver = false;
                if (!document.activeElement || !$.contains(picker.el, document.activeElement)) {
                    picker.hide();
                }
            },
            focusin: function() {
                picker.show();
            },
            focusout: function() {
                if (!picker.mouseOver) picker.hide();
            }
        });
        this.$add.on("click", Styles.addNew);
    },
    // Populates the list of styles.
    populate: function() {
        var picker = this;
        Styles.forEach(function(model) {
            picker.add(model);
        });
    },
    // Creates a new view with the model passed and appends it to the list.
    add: function(model) {
        var view = new StyleView({
            model: model
        });
        this.$list.append(view.el);
        _.defer(function() {
            view.$selector.focus();
        });
    },
    // Slides the picker out horizontally. 
    // `px` is the distance (in pixels) from the left edge of the element to the right edge of the window.
    slideOut: function(px) {
        var x = !isNaN(px) ? this.el.offsetWidth - px : 0;
        this.$el.css("transform", "translate3d(" + x + "px, 0, 0)");
    },
    // Hides the picker after the specified waiting time in the `hideAfter` property.
    hide: function() {
        var picker = this;
        if (this.hideable && !this.hideTimeout) {
            this.hideTimeout = setTimeout(function() {
                picker.slideOut(picker.stickOut);
            }, this.hideAfter);
        }
    },
    // Shows the picker instantly.
    show: function() {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
        this.slideOut();
    },
    // Returns all the rules as a string. Used for exporting the CSS.
    // Non-active rules will be included but /* commented out */.
    getCSS: function() {
        var rules = Styles.map(function(model) {
            return model.generateCSS(true);
        });
        rules = _.compact(rules);
        // remove falsy values
        return rules.join("\n\n");
    }
});

var StyleView = Backbone.View.extend({
    template: WFP.Templates.Style,
    initialize: function() {
        var view = this;
        // Constructing an element from the template
        var element = elementFromHTML(this.template(this.model.getState()));
        this.setElement(element);
        // Caching selectors
        this.$selectorWrapper = this.$(".selector-wrapper");
        this.$selector = this.$(".selector");
        this.$weights = this.$(".select-weight");
        this.$destroy = this.$(".destroy");
        // Font menu has a separate view.
        this.fontMenu = new FontMenu({
            model: this.model,
            parent: this,
            element: this.$(".font-menu")[0]
        });
        // Attaching events
        this.listenTo(this.model, {
            "change:family": this.renderWeights,
            "change:selector change:active": this._setActive,
            destroy: function() {
                view.$el.animate({
                    height: 0,
                    opacity: 0
                }, {
                    duration: 180,
                    easing: "easeOutCubic",
                    complete: function() {
                        view.remove();
                    }
                });
            },
            select: function() {
                var $el = view.$el;
                var initialHeight = $el.outerHeight();
                var finalHeight = $el.addClass("selected").outerHeight();
                $el.css("height", initialHeight);
                $el.animate({
                    height: finalHeight
                }, {
                    duration: 180,
                    easing: "easeOutCubic",
                    complete: function() {
                        $(this).css("height", "");
                    }
                });
            },
            deselect: function() {
                var $el = view.$el;
                var initialHeight = $el.outerHeight();
                var finalHeight = view.$selectorWrapper.outerHeight();
                $el.animate({
                    height: finalHeight,
                    backgroundColor: "rgba(255,255,255,0)"
                }, {
                    duration: 180,
                    easing: "easeOutCubic",
                    complete: function() {
                        $(this).removeClass("selected").css("height", "").css("backgroundColor", "");
                    }
                });
                view.$selector.blur();
            }
        });
        this.attachDOMEvents();
        // If this is the only style in the list, hide the Delete button.
        if (Styles.length === 1) {
            _.defer(function() {
                view.$destroy.addClass("disabled");
                view.listenToOnce(view.model, "change", function() {
                    view.$destroy.removeClass("disabled");
                });
            });
        }
        this.checkbox("active", this.$(".toggle-active")[0]).checkbox("weight", this.$(".toggle-weight")[0]).checkbox("color", this.$(".toggle-color")[0]).checkbox("fontSize", this.$(".toggle-font-size")[0]).checkbox("lineHeight", this.$(".toggle-line-height")[0]);
        this._setActive();
    },
    attachDOMEvents: function() {
        var view = this;
        this.$selector.on({
            click: function() {
                Styles.select(view.model);
            },
            mousedown: function(event) {
                if (!view.model.get("selected")) {
                    // Prevent focusing on selector input when style is not selected.
                    event.preventDefault();
                }
            },
            mouseover: function() {
                view.model.enable("highlight");
            },
            mouseout: function() {
                view.model.disable("highlight");
            },
            input: function(event) {
                view.model.set({
                    selector: event.target.value.trim()
                });
            }
        });
        this.$weights.on({
            change: function(event) {
                view.model.set({
                    weight: event.target.dataset.weight
                });
                view.model.enable("weight");
            },
            mouseover: function(event) {
                if (event.target.dataset.weight) {
                    view.model.setTemp({
                        weight: event.target.dataset.weight
                    });
                }
            },
            mouseout: function(event) {
                if (event.target.dataset.weight) {
                    view.model.unsetTemp("weight");
                }
            }
        });
        this.$destroy.on("click", function() {
            view.model.destroy();
        });
        this.$(".change-color").on("input", function(event) {
            view.model.set({
                color: event.target.value.toString()
            });
            view.model.enable("color");
        });
        Adjustable(this.$(".change-font-size")[0], {
            min: 0,
            step: 1,
            shiftStep: 10,
            altStep: .1
        }).on("change", function(value, formatted) {
            view.model.set({
                fontSize: formatted
            });
            view.model.enable("fontSize");
        }).on("start", function() {
            Picker.hideable = false;
        }).on("end", function() {
            Picker.hideable = true;
        });
        Adjustable(this.$(".change-line-height")[0], {
            min: 0,
            step: .1,
            shiftStep: 1,
            altStep: .01,
            formatter: function(value) {
                return value.toFixed(2);
            }
        }).on("change", function(value, formatted) {
            view.model.set({
                lineHeight: formatted
            });
            view.model.enable("lineHeight");
        }).on("start", function() {
            Picker.hideable = false;
        }).on("end", function() {
            Picker.hideable = true;
        });
    },
    // Given a model property and a DOM element, it attaches both a listener on the element 
    // and the property, so that when one changes the other is updated accordingly.
    checkbox: function(prop, element) {
        if (element && element.checked === undefined) throw new Error("Passed element is not a checkbox");
        var model = this.model;
        var enabled = model.enabled[prop];
        var attr = model.get(prop);
        if (typeof enabled === "boolean") {
            model.on("toggle:" + prop, function(checked) {
                element.checked = checked;
            });
            $(element).on("change", function() {
                model.toggle(prop);
            });
        } else if (typeof attr === "boolean") {
            model.on("change:" + prop, function(model, checked) {
                element.checked = checked;
            });
            $(element).on("change", function() {
                attr = !attr;
                model.set(prop, attr);
            });
        }
        return this;
    },
    // Updates the list of available weights. Hopefully will move it in a separate view one day.
    renderWeights: function() {
        var family = this.model.get("family");
        var variants = Fonts.list[family].variants;
        var weights = getWeights(variants);
        var template = WFP.Templates.Weights;
        this.$weights.html(template({
            weights: weights,
            selected: this.model.get("weight")
        }));
        return this;
    },
    // Simply adds a class to the parent element if the style is not active.
    // A bit overcomplicated for optimisation purposes.
    _setActive: function() {
        var active = this.model.isActive();
        if (active === !!this._hasInactiveClass) {
            this.el.classList.toggle("inactive");
            this._hasInactiveClass = !this._hasInactiveClass;
        }
    }
});

var FontMenu = Backbone.View.extend({
    initialize: function(options) {
        // The element is already created in the StyleView. Just needs to be set.
        this.parent = options.parent;
        this.setElement(options.element);
        this.isOpen = false;
        // Whether the menu is open.
        this.fontLimit = 15;
        // Number of fonts shown when initially opened. Also number of additionaly loaded fonts by each "Load more".
        this.list = [];
        // All the family names in the list.
        this.rendered = [];
        // Family names that are *rendered* in the DOM element. The rest can be shown by Load More.
        this.query = "";
        // Font search query. Do not modify, use the `search` method to search.
        // Caching selectors
        this.$listWrapper = this.$(".font-list-wrapper");
        this.$list = this.$(".font-list");
        this.$search = this.$(".search");
        this.$loadMore = this.$(".load-more");
        this.$currentWrapper = this.$(".current-wrapper");
        _.bindAll(this, "_onload", "close", "maxHeight", "_searchDone");
        Fonts.onload(this._onload);
    },
    // Only executed once the Fonts module is ready.
    _onload: function() {
        this.listenTo(this.model, "change:family", this.updateCurrent);
        this.updateList();
        this.attachDOMEvents();
    },
    attachDOMEvents: function() {
        var menu = this;
        this.$el.on("click", function(event) {
            if (!menu.isOpen) {
                menu.open();
                menu.$search.focus();
                event.stopPropagation();
            } else if (tagName(event.target) === "input") {
                event.stopPropagation();
            } else {
                var family = getFamily(event.target, menu.el);
                if (family !== undefined) {
                    menu.model.set({
                        family: family
                    });
                }
                if (tagName(event.target) === "b") {
                    menu.model.set({
                        weight: event.target.dataset.weight
                    });
                }
            }
        });
        this.$search.on("input", function(event) {
            menu.search(event.target.value);
        });
        this.$loadMore.on("click", function(event) {
            menu.updateList(true);
            event.stopPropagation();
        });
        this.$list.on({
            mouseover: function(event) {
                if (menu.isOpen && tagName(event.target) === "b") {
                    menu.model.setTemp({
                        weight: event.target.dataset.weight
                    });
                }
                var family = getFamily(event.target, menu.el);
                menu.model.setTemp({
                    family: family
                });
            },
            mouseout: function(event) {
                if (tagName(event.target) === "b") {
                    menu.model.unsetTemp("weight");
                }
            },
            mouseleave: function(event) {
                menu.model.unsetTemp("family");
            }
        });
    },
    // Opens the menu.
    open: function() {
        this.isOpen = true;
        Picker.$list.addClass("font-menu-open");
        this.$el.addClass("open-this");
        this.maxHeight();
        this.updateList();
        $(document.body).on("click", this.close);
        $(window).on("resize", this.maxHeight);
    },
    // Closes the menu.
    close: function() {
        if (!this.isOpen) return;
        this.isOpen = false;
        Picker.$list.removeClass("font-menu-open");
        this.$el.removeClass("open-this");
        $(document.body).off("click", this.close);
        $(window).off("resize", this.maxHeight);
    },
    // Highlights the current font, if it exists in the rendered list.
    highlightCurrent: function() {
        var family = this.model.get("family");
        var nth = this.rendered.indexOf(family);
        var current = nth > -1 ? this.$list[0].children[nth] : undefined;
        var prev = this.$highlighted && this.$highlighted[0];
        if (prev !== current) {
            prev && $(prev).removeClass("current");
            this.$highlighted = current && $(current).addClass("current");
        }
    },
    // Builds an element for the current font that serves as a placeholder to open the menu.
    updateCurrent: function() {
        var family = this.model.get("family");
        var element = this.build([ family ]);
        this.$currentWrapper.empty().append(element);
    },
    // Given an array of families, it builds their DOM elements and returns them in a fragment.
    build: function(families) {
        Fonts.load(families);
        var fragment = document.createDocumentFragment();
        _.forEach(families, function(family) {
            fragment.appendChild(elementFromHTML(WFP.Templates.Font(Fonts.list[family])));
        });
        return fragment;
    },
    // Renders the list of fonts, taking care of necessary destruction and reconstruction
    updateList: function(loadMore) {
        var toRender = [];
        // If the list is empty, populate it with the default family names.
        if (!this.query && this.list.length === 0) {
            this.list = _.clone(Fonts.families);
        }
        // If what is rendered does not match the beginning of the list, the rendered list is emptied.
        if (!startsWith(this.list, this.rendered)) {
            this.$list.empty();
            this.rendered = [];
        }
        // If the font limit is not reached, render more fonts!
        if (this.rendered.length < this.fontLimit) {
            toRender = _.difference(this.list.slice(0, this.fontLimit), this.rendered);
        }
        // If loadMore, then load more.
        if (loadMore) {
            toRender = _.difference(this.list, this.rendered).slice(0, this.fontLimit);
        }
        // If toRender is not empty, build the list elements and append them to the current list.
        if (toRender.length) {
            var fragment = this.build(toRender);
            this.$list.append(fragment);
            this.rendered = this.rendered.concat(toRender);
        }
        // If both lists are the same length, all the fonts must be loaded.
        if (this.rendered.length >= this.list.length) {
            this.$el.addClass("all-loaded");
        } else {
            this.$el.removeClass("all-loaded");
        }
        this.highlightCurrent();
    },
    // Searches all available fonts.
    search: function(query) {
        this.query = query;
        this.$listWrapper[0].scrollTop = 0;
        if (!query) {
            this.$el.removeClass("no-results");
            this.list = [];
            this.updateList();
            return;
        }
        Fonts.search(query).done(this._searchDone);
    },
    _searchDone: function(results) {
        if (results.length === 0) {
            this.$el.addClass("no-results");
        } else {
            this.$el.removeClass("no-results");
            this.list = results;
            this.updateList();
        }
    },
    // Sets the CSS `max-height` property of the list. 
    maxHeight: function() {
        var w = window;
        var p = Picker.el;
        var calc = w.innerHeight - 2 * p.offsetTop - (p.offsetHeight - this.$listWrapper.outerHeight()) + "px";
        this.$listWrapper.css("max-height", calc);
    }
});

var stylesheet, Fonts, Styles, Picker;

$(function() {
    WFP.Stylesheet = stylesheet = new Stylesheet();
    WFP.Fonts = Fonts;
    WFP.Styles = Styles = new StyleList();
    WFP.Picker = Picker = new PickerView();
    Fonts.load("Open Sans");
    // The font used by the picker.
    document.body.appendChild(Picker.el);
});
//# sourceMappingURL=WFP.map
})(window, document, jQuery.noConflict(true), _.noConflict(), Backbone.noConflict());