var path = require('path'),

    techs = require('enb-bem-techs'),
    mergeFiles = require('enb/techs/file-merge'),
    modules = require('enb-modules/techs/prepend-modules'),
    borschik = require('enb-borschik/techs/borschik'),
    provide = require('enb/techs/file-provider');

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

    var pattern = path.join(options.destPath, '*'),
        sourceLevels = options.sourceLevels || [];

    config.nodes(pattern, function(nodeConfig) {

        nodeConfig.addTechs([
            // Base techs
            [techs.levels, { levels : sourceLevels }],

            // Deps
            [provide, { target : '?.base.bemdecl.js' }],
            [techs.depsByTechToBemdecl, {
                target : '?.spec-nodejs.bemdecl.js',
                filesTarget : '?.base.files',
                sourceTech : 'spec.js',
                destTech : 'node.js'
            }],
            [techs.depsByTechToBemdecl, {
                target : '?.spec-js.bemdecl.js',
                filesTarget : '?.base.files',
                sourceTech : 'spec.js',
                destTech : 'js'
            }],
            [techs.mergeBemdecl, {
                target: '?.bemdecl.js',
                sources : ['?.base.bemdecl.js', '?.spec-nodejs.bemdecl.js', '?.spec-js.bemdecl.js']
            }],
            [techs.deps],

            // Files
            [techs.files, {
                depsFile : '?.base.bemdecl.js',
                depsFormat : 'bemdecl.js',
                filesTarget : '?.base.files',
                dirsTarget : '?.base.dirs'
            }],
            [techs.files],

            // JS
            [js, {
                sourceSuffixes : options.jsSuffixes,
                target : '?.node.js'
            }],
            [provide, { target : '?.pure.spec.js' }],
            [mergeFiles, {
                target: '?.pre.spec.js',
                sources : ['?.node.js', '?.pure.spec.js']
            }],
        ]);

        if (options.coverageFile) {
            // borschik with istanbul
            nodeConfig.addTechs([
                [borschik, {
                    source: '?.pre.spec.js',
                    target: '?.spec.js',
                    tech: require.resolve('borschik-tech-istanbul'),
                    techOptions: {
                        instrumentPaths: options.levels.map(function (level) {
                            return typeof level === 'string' ? level : level.path;
                        })
                    },
                    levels: options.levels,
                    freeze: true,
                    minify: false
                }]
            ]);
        } else {
            nodeConfig.addTechs([
                // Borschik
                [borschik, {
                    source : '?.pre.spec.js',
                    target : '?.spec.js',
                    freeze : true,
                    minify : false
                }],
            ]);
        }

        nodeConfig.addTargets([
            '?.spec.js'
        ])
    });
};
