var vow = require('vow'),
    path = require('path'),
    chai = require('chai'),
    should = require('should'),
    mocha = new (require('mocha'))({ ui : 'bdd' }),
    logger = new (require('enb/lib/logger'))();

/**
 * @exports
 */
exports.run = function(targets, root) {

    var defer = vow.defer();

    global.chai = chai;

    targets.forEach(function(nodePath) {
        var basename = path.basename(nodePath),
            target = path.join(nodePath, basename + '.spec.js');

        var suite = mocha.suite,
            file = target,
            self = this;

        suite.emit('pre-require', global, file, self);
        suite.emit('require', require(path.join(root, target)), file, self);

        modules.require('spec', function() {
            mocha.run(function(failures) {
                if (failures) {
                    logger.logErrorAction('spec', target);
                    defer.reject();
                } else {
                    logger.logAction('spec', target);
                    defer.resolve();
                }
            });
        });

        suite.emit('post-require', global, file, self);
    });

};
