var path = require('path'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    naming = require('bem-naming'),
    deps = require('enb-bem-techs/lib/deps/deps'),
    scanner = require('enb-bem-pseudo-levels/lib/level-scanner'),
    configurator = require('./node-configurator'),
    runner = require('./runner');

/**
 * @function isSpec
 */
function isSpec(options, file) {
    return options.specSuffixes.indexOf(file.suffix) !== -1;
}

/**
 * @function configure
 */
function configure(helper, options) {
    var root = helper.getRootPath(),
        nodes = {},
        nodesToRun = {};

    options = options || {};
    options.levels       = options.levels       || ['server'];
    options.sourceLevels = options.sourceLevels || options.levels;
    options.jsSuffixes   = options.jsSuffixes   || ['node.js', 'js'];
    options.specSuffixes = options.specSuffixes || ['spec.js'];
    options.destPath     = options.destPath     || 'server.specs';

    options.levels = options.levels.map(function(levelPath) {
        var level = (typeof levelPath === 'string') ? { path : levelPath } : levelPath;
        level.path = path.resolve(root, level.path);
        return level;
    });

    helper.prebuild(function(magic) {
        return scanner.scan(options.levels).then(function(files) {
            files.filter(isSpec.bind(this, options)).forEach(function(file) {
                var bemname = file.name.split('.')[0],
                    node = path.join(options.destPath, bemname),
                    specTarget = path.join(node, bemname + '.spec.js');

                if (magic.isRequiredNode(node)) {
                    nodes[node] = true;
                    magic.registerNode(node);
                    if (magic.isRequiredTarget(specTarget)) nodesToRun[node] = file.fullname;
                }
            });

            return vow.all(Object.keys(nodes).map(function(node) {
                var basename = path.basename(node),
                    dirname = path.join(root, options.destPath, basename),
                    bemdeclFilename = path.join(dirname, basename + '.base.bemdecl.js'),
                    specDestFilename = path.join(dirname, basename + '.pure.spec.js'),
                    notation = naming.parse(basename),
                    sourceDeps = [];
                    dep = { block : notation.block };

                if (notation.modName) {
                    dep.mod = notation.modName;
                    dep.val = notation.modVal;
                }

                if (notation.elem) {
                    dep.elem = notation.elem;
                }

                sourceDeps.push(dep);
                sourceDeps.push({ block : 'spec' });

                var bemdeclSource = 'exports.blocks = ' + JSON.stringify(deps.toBemdecl(sourceDeps)) + ';';

                return vfs.makeDir(dirname).then(function() {
                    return vow.allResolved(
                        vfs.write(bemdeclFilename, bemdeclSource, 'utf-8'),
                        vfs.copy(nodesToRun[node], specDestFilename)
                    );
                });
            }));
        });
    });

    helper.configure(function(projectConfig) {
        configurator.configure(projectConfig, options);
    });

    helper._projectConfig.task(helper.getTaskName(), function() {
        if (helper.getMode() === 'pre') return;
        return nodesToRun && runner.run(Object.keys(nodesToRun), root);
    });
}

/**
 * @exports
 */
module.exports = function(helper) {
    return { configure : configure.bind(this, helper) };
}
