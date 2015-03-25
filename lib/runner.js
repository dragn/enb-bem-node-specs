var vow = require('vow'),
    path = require('path'),
    chai = require('chai'),
    Mocha = require('mocha'),
    async = require('async'),
    fs = require('fs'),
    istanbul = require('istanbul'),
    collector = new istanbul.Collector(),
    report = istanbul.Report.create('text-summary'),
    logger = new (require('enb/lib/logger'))();

/**
 * @exports
 */
exports.run = function(targets, root, coverageFile) {

    var defer = vow.defer(),
        withCoverage = !!coverageFile,
        coverageVar = '__coverage__';

    // Setup global context for tests
    global.chai = chai;
    global.expect = chai.expect;
    global.assert = chai.assert;
    chai.should();

    if (withCoverage) {
        global[coverageVar] = {};

        if (fs.existsSync(coverageFile)) {
            collector.add(JSON.parse(fs.readFileSync(coverageFile, 'utf-8')));
        }
    }

    // For every test
    async.mapSeries(Object.keys(targets), function(spec, next) {
        var basename = path.basename(spec),
            target   = path.join(spec, basename + '.spec.js'), // path to bundled spec.js
            mocha    = new Mocha({ ui : 'bdd' }),              // new Mocha context
            suite    = mocha.suite,
            source   = path.relative(root, targets[spec]),     // path to original source
            self     = this;

        global.modules = require('ym').create();

        suite.emit('pre-require', global, target, mocha);

        try {
            require(path.join(root, target));
        } catch (e) {
            console.error(e);
        }

        modules.require('spec', function() {
            mocha.run(function(failures) {
                if (failures) {
                    logger.logErrorAction('spec', target);
                    defer.reject();
                } else {
                    logger.logAction('spec', target);
                    defer.resolve();
                }
                suite.emit('post-require', global, target, mocha);

                withCoverage && collector.add(global[coverageVar]);

                next();
            });
        });
    },
    function(){
        if (withCoverage) {
            fs.writeFileSync(
                coverageFile,
                JSON.stringify(collector.getFinalCoverage()),
                'utf-8'
            );
        }
    });

};
