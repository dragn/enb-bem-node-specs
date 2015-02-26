var vow = require('vow'),
    path = require('path'),
    mocha = new (require('mocha'))({ ui : 'bdd' }),
    logger = new (require('enb/lib/logger'))();

/**
 * @exports
 */
exports.run = function(targets, root) {

    var defer = vow.defer();

    targets.forEach(function(nodePath) {
        var basename = path.basename(nodePath),
            target = path.join(nodePath, basename + '.spec.js');
        logger.logAction('spec', target);
        mocha.addFile(path.join(root, target));
    });

    mocha.run(function(failures) {
        failures ? defer.reject() : defer.resolve();
    });
};
