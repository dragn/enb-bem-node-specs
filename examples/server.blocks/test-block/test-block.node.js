modules.define('test-block', function(provide) {

    provide({
        getCurrentPath : function() {
            return process.cwd();
        }
    });

});
