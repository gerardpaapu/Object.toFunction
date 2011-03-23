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
        type,    

        // wrapper(fn) -> Function:
        // wraps higher order function
        // so that they can take arbitrary types
        wrapper; 

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

    wrapper = function (fn) {
        // Wrapper(fn) returns a function that replaces its
        // first argument's value with toFunction(value), and 
        // calls fn with these modified arguments.
        //
        // It's specifially to wrap the builtin higher order
        // functions that each take a callback as their 
        // first argument.
        return function () {
            var args = [].slice.call(arguments);
            args[0] = toFunction(args[0]);
            return fn.apply(this, args);
        };
    };    

    toFunction.monkeyPatch = function (prefix) {
        // Don't run this code... it's an abomination
        // It modifies a bunch of the higher order functions
        // on the Array.prototype so you can do silly shit like.
        // 
        //     ['poo', 'fart'].$map(['toUpperCase']) -> ['POO', 'FART']
        //     ['poo', 'fart'].$map('length')        -> [3, 4]
        //     ['poo', 'fart'].$map(0)               -> ['p', 'f']
        //     ['poo', 'fart'].$filter(/^p/)         -> ['poo']
        //
        var proto   = Array.prototype,
            methods = ['filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'],
            i, len, name;

        prefix = (prefix != null) ? prefix : '$';


        for (i = 0, len = methods.length; i < len; i++) {
            name = methods[i];
            if (type(proto[name]) === 'function') {
                proto[prefix + name] = wrapper(proto[name]);
            }
        }
    };

    return toFunction;
}());
