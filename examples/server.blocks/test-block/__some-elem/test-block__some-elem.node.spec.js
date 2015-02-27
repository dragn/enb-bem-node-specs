modules.define('spec', ['test-block__some-elem'], function(provide, elem) {

    describe('test-block__some-elem', function() {

        describe('someFunction', function() {

            it('should return some text', function() {
                elem.someFunction().should.equal('some text');
            });
        });

    });

    provide();
});
