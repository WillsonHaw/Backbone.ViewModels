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
        testModel.set("ParseName", "initial model");
        
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "MatchedName": {
                    initial: "blahblahblah"
                },
                "UnmatchedName": {
                    initial: "initial value"
                },
                "ParseName": {
                    initial: "poo",
                    parse: function () {
                        return this.model.get("ParseName").toUpperCase();
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
        
        it("should run the parse function if property matches and a parse function is defined", function () {
            expect(testVM.get("ParseName")).toEqual("INITIAL MODEL");
        });
    });
    
    describe("Event tests", function () {
        var testModel = new TestModel();
        var TestViewModel = Backbone.ViewModel.extend({
            properties: {
                "SingleChange": {
                    parse: function () {
                        return this.model.get("FirstName");
                    },
                    change: "FirstName"
                },
                "MultiChange": {
                    parse: function () {
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
})(window.Tests, Backbone, _, jQuery, jasmine);

Bootstrap.wait(Tests.run);