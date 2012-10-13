/*global _:false, jQuery:false, Backbone:false, Bootstrap:false */
var App = window.App || {};

App.start = function () {
    "use strict";
    
    var TweetModel = Backbone.Model.extend({
    });
    
    var TweetCollection = Backbone.Collection.extend({  
        model: TweetModel,
        url: "http://search.twitter.com/search.json?q=from:iqmetrix&rpp=10",
        parse: function (response) {
            return response.results;
        },
        sync: function (method, model, options) {
            options.timeout = 10000;
            options.dataType = "jsonp";
            return Backbone.sync(method, model, options);
        }
    });
    
    var TweetViewModel = Backbone.ViewModel.extend({
        properties: {
            "Name": {
                parse: function () {
                    return this.model.get("from_user");
                }
            },
            "Post": {
                parse: function () {;
                    return this.model.get("text").toUpperCase();
                }
            },
            "PostDate": {
                parse: function () {;
                    var created = new Date(this.model.get("created_at"));
                    return created.toLocaleDateString();
                }
            }
        }
    });
    
    var PageView = Backbone.View.extend({
        el: "#tweet-content",
        initialize: function () {
            this.collection = new TweetCollection();
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderChild, this);
            this.collection.fetch();
        },
        render: function () {
            var self = this;
            this.$el.empty();
            this.collection.each(function (model) {
                self.renderChild(model);
            });
        },
        renderChild: function (child) {
            var view = new TweetView({ viewModel: new TweetViewModel(child) });
            this.$el.append(view.render().el);
        }
    });
    
    var TweetView = Backbone.View.extend({
        template: Handlebars.compile($("#tweet-template").html()),
        tagName: "tr",
        render: function () {
            this.$el.html(this.template(this.viewModel.toJSON()));
            return this;
        }
    });
    
    var pageView = new PageView();
};

Bootstrap.wait(App.start);