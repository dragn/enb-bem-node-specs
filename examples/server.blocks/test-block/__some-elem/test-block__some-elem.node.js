modules.define('test-block__some-elem', function(provide) {
    provide({
        someFunction : function() {
            return 'some text';
        }
    });
});
