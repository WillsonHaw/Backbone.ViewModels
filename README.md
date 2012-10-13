# Backbone.ViewModel

Simple Backbone implementation of a View Model.

## Usage

### Setup

Extend `Backbone.ViewModel` with a "properties" hash. The hash should look like the following:

```
var NewViewModel = Backbone.ViewModel.extend({
    properties: {
        "property1": { },
        "property2": { },
        ...
    }
});
```

Each property in the hash should be a dictionary of key-value pairs, with the following optional valid keys:

```
"property": {
    initial: "",            //This is the initial value for this property, if one isn't found in the model
    parse: function () {},  //This is a function that will run that will parse the model into useful data
                            //  to be used by the views. If one isn't specified, a direct 1-to-1 mapping is done.
    change: []              //A string or an array of strings. If the string matches an attribute on the model,
                            //  and a change event for that attribute is fired on the model, this property will
                            //  also trigger changes
}
```