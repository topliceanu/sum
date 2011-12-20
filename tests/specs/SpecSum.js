describe( 'summarize.js tests', function(){
	corpora.forEach( function (corpus) {
		it( 'should calculate the summary', function () {
			var actual = sum( corpus.text );
			var expected = corpus.expected;
			expect(actual).toEqual(	expected );
		});
	});
}) ;
