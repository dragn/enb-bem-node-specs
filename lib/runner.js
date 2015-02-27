var vow = require('vow'),
    path = require('path'),
    chai = require('chai'),
    should = require('should'),
    Mocha = require('mocha'),
    ym = require('ym'),
    async = require('async'),
    logger = new (require('enb/lib/logger'))();

/**
 * @exports
 */
exports.run = function(targets, root) {

    var defer = vow.defer();

    global.chai = chai;

    async.mapSeries(targets, function(nodePath, next) {
        var basename = path.basename(nodePath),
            target = path.join(nodePath, basename + '.spec.js'),
            mocha = new Mocha({ ui : 'bdd' }),
            suite = mocha.suite,
            self = this;

        global.modules = require('ym').create();

        suite.emit('pre-require', global, target, self);
        suite.emit('require', require(path.join(root, target)), target, self);

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
                next();
            });
        });
    });

};
