/*globals require: false, console: false, describe: false, it: false, expect: false */

require('../toFunction.js');

describe('Basic tests', function () {
    it('creates a key function from a string', function () {
        var key = 'length',
            fn = Object.toFunction(key),
            ls = ['poo', 'farts', 'donkey'];

        expect(ls.map(fn)).toEqual([3, 5, 6]);
    });

    it('creates a key function from a number', function () {
        var key = 1,
            fn = Object.toFunction(key),
            ls = ['poo', 'farts', 'donkey'];

        expect(ls.map(fn)).toEqual(['o', 'a', 'o']);
    });

    it('creates a matcher from a regexp', function () {
        var fn, pattern, ls;

        ls = ['cats', 'dogs', 'elephant'];

        pattern = /[a-z]*s$/;

        fn = Object.toFunction(pattern);

        expect(ls.filter(fn)).toEqual(['cats', 'dogs']);
    });

    it('creates a lookup function from an object', function () {
        var fn, dict, ls;

        ls = ['cats', 'dogs', 'elephant'];

        dict = {
            cats: 'meow',
            dogs: 'woof',
            elephant: 'snuffle'
        };

        fn = Object.toFunction(dict);

        expect(ls.map(fn)).toEqual(['meow', 'woof', 'snuffle']);
    });

    it('creates a method caller from an array', function () {
        var fn, obj;

        obj = [1, 2, 3];
        fn = Object.toFunction(['sort', function (a, b) {
            return b - a; 
        }]); 

        fn(obj); // does a reverse sort
        expect(obj).toEqual([3, 2, 1]);
    });

    it('it creates a null returner from null', function () {
        var fn = Object.toFunction(null);

        expect(fn()).toEqual(null);
    });
});
