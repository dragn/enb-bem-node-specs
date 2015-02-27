modules.define('spec', ['test-block'], function(provide, testBlock) {

    describe('test-block block', function() {

        it('should return current working directory', function() {
            assert.isDefined(testBlock);
            expect(testBlock).to.be.defined;
            testBlock.getCurrentPath().should.equal(process.cwd());
        });

    });

    provide();
});
