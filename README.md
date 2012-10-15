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
    initial: "",                //This is the initial value for this property, if one isn't found in the model
    read: function () {},       //This is a function that will run to parse the model into useful data
                                //  to be used by the views. If a string is specified instead, the view model
                                //  will look for the specified string as a value in the model using model.get().
                                //  If nothing is specified, the view model will try to find this property in the
                                //  model.
    write: function () {},      //This is a function that will run when you do a set() on the view model. It is
                                //  up to the implementor to set the appropriate attributes on the model using this
                                //  function if data is to be saved back to the model. If a string is specified,
                                //  then it will set the specified string as an attribute on the model.
    validate: function () {},   //Any validation needing to be run when setting a view model's attribute will be
                                //  done here. Works similarly to Model.validate(). Return a string if a validation
                                //  error occurs, otherwise return undefined or null. The View Model's "error" event
                                //  will trigger when validation fails.
    change: []                  //A string or an array of strings. If the string matches an attribute on the model,
                                //  and a change event for that attribute is fired on the model, this property will
                                //  also trigger changes
}
```