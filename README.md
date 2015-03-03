# enb-bem-node-specs

Automatic spec tests for node.js BEM-blocks with [ENB](http://enb-make.info).

The test are described similar to [enb-bem-specs](https://github.com/enb-bem/enb-bem-specs).

Tests are written in [mocha](https://github.com/visionmedia/mocha) style with [chai](https://github.com/chaijs/chai) framework included.
Chai's `expect` and `assert` are also available on global scope.

Example test looks like this:
```js
modules.define('spec', ['block'], function(provde, block) {

    // .. usual mocha test description:
    describe('block', function() {
        it('should rock', function() {
            // using chai's expect
            expect(block).to.be.defined;

            // using chai's assert
            assert.isDefined(block);

            // using chai's should
            block.rocks().should.be.true;
        });
    });

    provide();
});
```

## Usage

First, install npm module:
```bash
npm install --save enb-bem-node-specs
```

Then, to add `enb-bem-node-specs` to your ENB project do something like this in `.enb/make.js`:
```js
...
module.exports = function(config) {
    ...
    config.includeConfig('enb-bem-node-spec');

    // 'specs' is the enb task name, you may change it if you like
    var nodeSpecConfig = config.module('enb-bem-node-specs').createConfigurator('specs');
    nodeSpecConfig({
        destPath: 'server.specs', // where to put specs
        levels: ['server.blocks'] // where are blocks' source codes located
    });
}
```

To run specs, execute task `specs` (or whichever task name you configured in `make.js`):
```bash
node_modules/.bin/enb make specs
```

## Coverage

`enb-bem-node-specs` supports code coverage measure with [`istanbul`](https://github.com/gotwarlost/istanbul)
To enable it, add `coverageFile` option in `make.js`:
```js
...
module.exports = function(config) {
    ...
    config.includeConfig('enb-bem-node-spec');

    // 'specs' is the enb task name, you may change it if you like
    var nodeSpecConfig = config.module('enb-bem-node-specs').createConfigurator('specs');
    nodeSpecConfig({
        destPath: 'server.specs', // where to put specs
        levels: ['server.blocks'], // where are blocks' source codes located
        coverageFile: 'coverage.json'
    });
}
```
Coverage info will be merged _into_ provided file, which helps to use `enb-bem-node-specs` with other tasks ([enb-bem-specs](https://github.com/enb-bem/enb-bem-specs), for example, also uses `coverage.json`)
