window.Tests = window.Tests || {};

(function (Tests, Backbone, _, $, jasmine) {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 250;

    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);
    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    Tests.run = function () {
        jasmineEnv.execute();
    };
    
    var TestModel = Backbone.Model.extend({
    });
    
    var TestView = Backbone.View.extend({
    });
    
    describe("Initialization Tests", function () {
        var testModel = new TestModel();
        testModel.set("MatchedName", "initial model");
        testModel.set("GetName", "initial model");
        
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "MatchedName": {
                    initial: "blahblahblah"
                },
                "UnmatchedName": {
                    initial: "initial value"
                },
                "GetName": {
                    initial: "poo",
                    read: function () {
                        return this.model.get("GetName").toUpperCase();
                    }
                }
            }
        })

        var testVM = new TestViewModel(testModel);
        
        it("should use the model's value if property matches", function () {
            expect(testVM.get("MatchedName")).toEqual("initial model");
        });
        
        it("should use the view model's initial value if property doesn't match", function () {
            expect(testVM.get("UnmatchedName")).toEqual("initial value");
        });
        
        it("should run the get function if property matches and a get function is defined", function () {
            expect(testVM.get("GetName")).toEqual("INITIAL MODEL");
        });
    });
    
    describe("Event tests", function () {
        var testModel = new TestModel();
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "SingleChange": {
                    read: function () {
                        return this.model.get("FirstName");
                    },
                    change: "FirstName"
                },
                "MultiChange": {
                    read: function () {
                        return this.model.get("Either") + this.model.get("Or");
                    },
                    change: ["Either", "Or"]
                },
                "AutoMatch": {}
            }
        });
        
        var testVM = new TestViewModel(testModel);
        
        it("should trigger a change if the change property matches", function () {
            testModel.set("FirstName", "boop boop");
            expect(testVM.get("SingleChange")).toEqual("boop boop");
        });

        it("should trigger a change if the change property array matches", function () {
            testModel.set({
                "Either": "Super",
                "Or": "Man"
            });
            expect(testVM.get("MultiChange")).toEqual("SuperMan");
        });

        it("should trigger a change if the model property matches the specified property", function () {
            testModel.set("AutoMatch", "Automagic");
            expect(testVM.get("AutoMatch")).toEqual("Automagic");
        });
    });
    
    describe("Get tests", function () {
        var testModel = new TestModel();
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "GetFunction": {
                    read: function () {
                        var name = this.model.get("FirstName");
                        return name 
                            ? name.toUpperCase()
                            : "";
                    },
                    change: "FirstName"
                },
                "GetString": {
                    read: "String",
                    change: "Blah"
                }
            }
        });
        
        var testVM = new TestViewModel(testModel);
        
        it("should run the get function on FirstName change", function () {
            testModel.set("FirstName", "boop boop");
            expect(testVM.get("GetFunction")).toEqual("BOOP BOOP");
        });
        
        it("should get the model property of the string if a string is specified for get", function () {
            testModel.set({
                "Blah": "This triggers the change",
                "String": "this is the value"
            });
            expect(testVM.get("GetString")).toEqual("this is the value");
        });
    });
    
    describe("Write tests", function () {
        var TestModel = Backbone.Model.extend({
            validate: function (attrs) {
                if (attrs.Date - new Date() < 0)
                    return "Date must not be in the past";
                return undefined;
            }
        });
        
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "WithValidate": {
                    validate: function (value) {
                        if (value - new Date() > 0)
                            return "Date must not be in the future";
                        else
                            return undefined;
                    },
                    write: function (value) {
                        return this.model.set("Date", value);
                    },
                    change: "Date"
                },
                "SetByName": {
                    write: "Name"
                }
            }
        });
        
        var testModel = new TestModel();
        var testVM = new TestViewModel(testModel);
        var lastError = "";
        testVM.on("error", function (model, err) { lastError = err; });
        
        it("should fail view model validation when setting the date in the future", function () {
            var result = testVM.set("WithValidate", new Date(2013, 1, 1));
            expect(lastError).toEqual("Date must not be in the future");
            expect(result).toEqual(false);
            expect(testModel.get("Date")).toEqual(undefined);
        });
        
        it("should fail model validation when setting the date in the past", function () {
            var result = testVM.set("WithValidate", new Date(2011, 1, 1));
            expect(lastError).toEqual("Date must not be in the past");
            expect(result).toEqual(false);
            expect(testModel.get("Date")).toEqual(undefined);
        });
        
        it("should set the model's attribute if the view model property's set is a string", function () {
            var result = testVM.set("SetByName", "some string");
            expect(result).toNotEqual(false);
            expect(testModel.get("Name")).toEqual("some string");
        });
    });
})(window.Tests, Backbone, _, jQuery, jasmine);

Bootstrap.wait(Tests.run);