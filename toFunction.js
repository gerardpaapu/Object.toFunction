Object.toFunction = (function () {
    // toFunction converts an arbitrary javascript object to a callable function
    // intended for use with higher order functions etc.
    // 
    // Functions are returned unmodified
    //
    // "Keys" (strings and numbers) become a function that will lookup that key 
    // in its first argument.
    //     
    //     var key = 'length',
    //         fn = Object.toFunction(key),
    //         ls = ['poo', 'farts', 'donkey'];
    //
    //     ls.map(fn); // [3, 5, 6]
    //
    // Objects become a function that will lookup its argument in that object.
    // 
    //     var fn, dict, ls;
    //
    //     ls = ['cats', 'dogs', 'elephant'];
    //
    //     dict = {
    //         cats: 'meow',
    //         dogs: 'woof',
    //         elephant: 'snuffle'
    //     };
    //
    //     fn = Object.toFunction(dict);
    //
    //     ls.map(fn); // ['meow', 'woof', 'snuffle']
    //     
    //
    // Arrays of the form [key, arg, ...] become a function that will call the 
    // method 'key' with (arg, ...) on its first argument.
    //
    //     var fn, obj;
    //
    //     obj = [1, 2, 3];
    //     fn = Object.toFunction(['sort', function (a, b) {
    //         return a - b; 
    //     }]); 
    //
    //     fn(obj); // does a reverse sort
    //
    // Every other value becomes a function that returns that value 
    //
    //    var fn = Object.toFunction(null);
    //    fn() === null; // true
    //
    /*jshint boss: true */
    var toFunction,

        // each take a javascript value of a particular type and
        // return the appropriate function.
        matcher, lookupKey, lookupIn, returner, methodCaller,

        // type(obj) -> String: sniffs for builtin types
        type;

    toFunction = function (obj) {
        if (obj != null && type(obj.toFunction) === 'function') {
            return obj.toFunction();
        }

        switch (type(obj)) {
            case 'function': return obj;

            case 'regexp': return matcher(obj);

            case 'string':
            case 'number': return lookupKey(obj);

            case 'object': return lookupIn(obj);
            
            case 'array':    
                return type(obj[0]) === 'string' ? methodCaller(obj)
                    :  returner(obj);

            default: return returner(obj);
        }
    };

    matcher = function (pattern) {
        return function (str) {
            return new RegExp(pattern).exec(str);
        };
    }; 

    lookupKey = function (key) {
        return function (dict) {
            return dict[key];
        };
    };

    lookupIn = function (dict) {
        return function (key) {
            return dict[key];
        };
    };

    returner = function (value) {
        return function (_) {
            return value;
        };
    };

    methodCaller = function (ls) {
        var name = ls[0],
            args = ls.slice(1);

        return function (obj) {
            return obj[name].apply(obj, args); 
        };
    };

    type = function (obj) {
        // type(value) returns 'null' and 'undefined' for the values
        // null and undefined, otherwise it returns value.[[Class]]
        //
        // The internal property [[Class]] of a given javascript
        // object is a reliable way to identify various builtins
        //
        // ECMA-262 8.6.2 discusses the internal properties
        // common to all Ecmascript Objects including [[Class]]
        //
        // ECMA-262 15.2.4.2 discusses the use of
        // Object.prototype.toString to observe [[Class]]
        return obj == null ? String(obj)
            :  {}.toString.call(obj).slice(8, -1).toLowerCase();
    };

    return toFunction;
}());
