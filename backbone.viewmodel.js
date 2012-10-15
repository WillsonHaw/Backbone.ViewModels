/*global _:false, jQuery:false, Backbone:false */
(function ($, _, Backbone) {
    "use strict";

    var oldConfigure = Backbone.View.prototype._configure;

    var View = Backbone.View.extend({
        //Extend view to allow passing in "viewModel" as an option, and automatically
        //  set the viewModel property
        _configure: function (options) {
            oldConfigure.call(this, options);
            if (options && options.viewModel) {
                this.viewModel = options.viewModel;
            }
        }
    });

    var ViewModel = Backbone.Model.extend({
        model: null,
        isNew: function () {
            return this.model.isNew();
        },
        properties: {},
        _setAttribute: Backbone.Model.prototype.set,
        _doGet: function (attr) {
            var property = this.properties[attr];
            
            if (property.get) {
                if (_.isFunction(property.get)) {
                    var val = property.get.call(this, attr);
                    this._setAttribute(attr, val, { silent: true });
                } else {
                    this._setAttribute(attr, this.model.get(property.get), { silent: true });
                }
            } else {
                this._setAttribute(attr, this.model.get(attr), { silent: true });
            }
        },
        _doSet: function (attr, value) {
            var property = this.properties[attr];
            
            if (property.set) {
                if (_.isFunction(property.set)) {
                    return property.set.call(this, value, { silent: true });
                } else {
                    return this.model.set(property.set, value, { silent: true });
                }
            } else {
                return this.model.set(attr, value, { silent: true });
            }
        },
        constructor: function (model) {
            var attrs = {};
            var self = this;

            this.model = model;
            _.each(this.properties, function (property, attr) {
                attrs[attr] =
                    (_.isFunction(property.get) && property.get.call(self)) ||
                    model.attributes[attr] ||
                    property.initial;

                var changeCallback = function () {
                    this._doGet(attr);
                };

                //Automatically bind to model change events
                if (_.isArray(property.change)) {
                    _.each(property.change, function (prop) {
                        self.model.on("change:" + prop, changeCallback, self);
                    });
                } else if (property.change) {
                    self.model.on("change:" + property.change, changeCallback, self);
                } else {
                    self.model.on("change:" + attr, changeCallback, self);
                }
            });

            //our doGet triggers sets silently, so this triggers a change on the VM
            this.model.on("change", function () {
                this.trigger("change");
            }, this);
            
            //raising errors in the model should also raise the same error in the VM
            this.model.on("error", function (model, err, obj) {
                this.trigger("error", model, err, obj);
            }, this);

            this.attributes = {};
            this._escapedAttributes = {};
            this.cid = _.uniqueId('c');
            this.changed = {};
            this._silent = {};
            this._pending = {};
            this._setAttribute(attrs, { silent: true });
            // Reset change tracking.
            this.changed = {};
            this._silent = {};
            this._pending = {};
            this._previousAttributes = _.clone(this.attributes);
            this.initialize.apply(this, arguments);
        },
        set: function (key, value, options) {
            options = options || {};

            if (!key || !this.properties[key]) {
                return false;
            }

            var property = this.properties[key];

            //Run validation
            if (property.validate && _.isFunction(property.validate)) {
                var error = property.validate(value);
                if (error) {
                    if (options.error) {
                        options.error(this, error, options);
                    } else {
                        this.trigger('error', this, error, options);
                    }
                    return false;
                }
            }

            //Run set function
            return this._doSet(key, value);
        },
        get: function (attr) {
            return this.attributes[attr];
        }
    });

    Backbone.View = View;
    Backbone.ViewModel = ViewModel;
})(jQuery, _, Backbone);