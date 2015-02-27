var plugin = require('./plugin');

module.exports = function(config) {
    config.includeConfig(require.resolve('enb-magic-factory'));
    config.registerModule('enb-bem-node-specs', {
        createConfigurator: function(task) {
            var magic = config.module('enb-magic-factory');
            return plugin(magic.createHelper(task));
        }
    });
};
