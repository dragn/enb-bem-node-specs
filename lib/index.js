var plugin = require('./plugin');

function Module(config) {
    this._config = config;
    config.includeConfig(require.resolve('enb-magic-factory'));
}

Module.prototype.createConfigurator = function(task) {
    var magic = this._config.module('enb-magic-factory');
    return plugin(magic.createHelper(task));
};

module.exports = function(config) {
    config.registerModule('enb-bem-node-specs', new Module(config));
};
