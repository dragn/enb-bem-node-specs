var path = require('path');
var rootPath = path.join(__dirname, '..', '..');

module.exports = function(config) {
    config.includeConfig(rootPath);

    var specs = config.module('enb-bem-node-specs').createConfigurator('node-specs');

    specs.configure({
        destPath : 'server.specs',
        levels : ['server.blocks'],
        sourceLevels : [
            { path : 'libs/bem-pr/spec.blocks', check : false },
            { path : 'server.blocks', check : true }
        ]
    });
};
