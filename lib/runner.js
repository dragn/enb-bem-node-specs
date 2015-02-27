var vow = require('vow'),
    path = require('path'),
    chai = require('chai'),
    Mocha = require('mocha'),
    ym = require('ym'),
    async = require('async'),
    fs = require('fs'),
    istanbul = require('istanbul'),
    collector = new istanbul.Collector(),
    report = istanbul.Report.create('text-summary'),
    coverageVar = '$$cov_' + new Date().getTime() + '$$',
    instrumenter = new istanbul.Instrumenter({ coverageVariable : coverageVar }),
    logger = new (require('enb/lib/logger'))();

/**
 * @exports
 */
exports.run = function(targets, root) {

    var defer = vow.defer();

    global.chai = chai;
    global.expect = chai.expect;
    global.assert = chai.assert;
    chai.should();

    async.mapSeries(targets, function(nodePath, next) {
        var basename = path.basename(nodePath),
            target = path.join(nodePath, basename + '.spec.js'),
            mocha = new Mocha({ ui : 'bdd' }),
            suite = mocha.suite,
            self = this;

        global.modules = require('ym').create();

        var code = fs.readFileSync(path.join(root, target), 'utf-8');

        suite.emit('pre-require', global, target, self);
        global[coverageVar] = {};
        eval(instrumenter.instrumentSync(code));

        modules.require('spec', function() {
            mocha.run(function(failures) {
                if (failures) {
                    logger.logErrorAction('spec', target);
                    defer.reject();
                } else {
                    logger.logAction('spec', target);
                    defer.resolve();
                }
                suite.emit('post-require', global, target, self);
                collector.add(global[coverageVar]);
                next();
            });
        });
    },
    function(){
        var textReport = istanbul.Report.create('text-summary');
        textReport.writeReport(collector, true);
    });

};
