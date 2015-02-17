describe( 'test sum\' params', function () {
    it( 'should return one sentence', function () {
        var corpus = corpora[1];
        var actual = sum({ 'corpus': corpus.text, 'nSentences': 1 });
        var expected = 1;
        expect(actual.sentences.length).toEqual( expected );
    });
    it( 'should return two sentences', function () {
        var corpus = corpora[1];
        var actual = sum({ 'corpus': corpus.text, 'nSentences': 3 });
        var expected = 3;
        expect(actual.sentences.length).toEqual( expected );
    });
    it( 'should ignore sentences that have the word `bladder` in them', function () {
        var corpus = corpora[1];
        var sum1 = sum({ 'corpus': corpus.text, 'nSentences': 1, 'exclude': ['bladder', 'Chubb'] });
        var sum2 = sum({ 'corpus': corpus.text, 'nSentences': 1 });
        expect( sum1.summary ).not.toEqual( sum2.summary );
    });
    it( 'should have the emphasisted word `drug` in the abstract', function () {
        var corpus = corpora[1];
        var sum1 = sum({ 'corpus': corpus.text, 'nSentences': 1, 'emphasise': ['Drug'] });
        var actual = _.str.include( sum1.summary, 'Drug' );
        expect( actual ).toBe( true );
    });
});
describe( 'summarize.js basic output test', function () {
    corpora.forEach( function (corpus) {
        it( 'should calculate the summary', function () {
            var actual = sum({ 'corpus': corpus.text, 'nSentences': 3 });
            var expected = 3;
            expect(actual.sentences.length).toEqual( expected );
        });
    });
});
describe( 'test nWords params in action', function () {
    corpora.forEach( function (corpus) {
        it( 'should calculate the summary', function () {
            var actual = sum({ 'corpus': corpus.text, 'nWords': 5 });
            expect(actual.sentences.length).not.toEqual('');
        });
    });
});
