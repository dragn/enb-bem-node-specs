var path = require('path'),

    deps = require('enb-bem-techs/techs/deps'),
    mergeBemdecl = require('enb-bem-techs/techs/merge-bemdecl'),
    files = require('enb-bem-techs/techs/files'),
    mergeFiles = require('enb/techs/file-merge'),
    modules = require('enb-modules/techs/prepend-modules'),
    borschik = require('enb-borschik/techs/borschik'),
    provide = require('enb/techs/file-provider'),
    depsByTechToBemdecl = require('enb-bem-techs/techs/deps-by-tech-to-bemdecl'),
    levels = require('enb-bem-techs/techs/levels');

var js = require('enb/lib/build-flow').create()
    .name('js')
    .target('target', '?.js')
    .useFileList('js')
    .builder(function (files) {
        var node = this.node;
        return files.map(function (file) {
            return '/*borschik:include:' + node.relativePath(file.fullname) + '*/';
        }).join('\n');
    })
    .createTech();

/**
 * @exports
 */
exports.configure = function(config, options) {
    // TODO

    var pattern = path.join(options.destPath, '*'),
        sourceLevels = options.sourceLevels || [];

    config.nodes(pattern, function(nodeConfig) {

        nodeConfig.addTechs([
            // Base techs
            [levels, { levels : sourceLevels }],

            // Deps
            [provide, { target : '?.base.bemdecl.js' }],
            [depsByTechToBemdecl, {
                target : '?.spec-nodejs.bemdecl.js',
                filesTarget : '?.base.files',
                sourceTech : 'spec.js',
                destTech : 'node.js'
            }],
            [mergeBemdecl, {
                target: '?.bemdecl.js',
                sources : ['?.base.bemdecl.js', '?.spec-nodejs.bemdecl.js']
            }],
            [deps],

            // Files
            [files, {
                depsFile : '?.base.bemdecl.js',
                depsFormat : 'bemdecl.js',
                filesTarget : '?.base.files',
                dirsTarget : '?.base.dirs'
            }],
            [files],

            // JS
            [js, {
                sourceSuffixes : options.jsSuffixes,
                target : '?.source.node.js'
            }],
            [modules, {
                target : '?.node.js',
                source : '?.source.node.js',
            }],
            [js, {
                target : '?.pure.spec.js',
                sourceSuffixes : options.specSuffixes,
                filesTarget : '?.base.files'
            }],
            [mergeFiles, {
                target: '?.pre.spec.js',
                sources : ['?.node.js', '?.pure.spec.js']
            }],

            // Borschik
            [borschik, {
                source : '?.pre.spec.js',
                target : '?.spec.js',
                freeze : true,
                minify : false
            }],
        ]);

        nodeConfig.addTargets([
            '?.spec.js'
        ])
    });
};
