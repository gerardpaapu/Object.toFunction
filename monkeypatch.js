(function () {
    var toFunction = Object.toFunction,
        type, wrapper, monkeyPatch;

    type = function (obj) {
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
}.call(this));
