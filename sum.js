(function summarization(win,doc,undef){
	
	"use strict" ;
	
	var sum = function( corpus , params ) { // params.size - nr of sentences
		
		var newWord = function( word ) {
			return {
				'word' : word ,
				'gwf' : 1 
			} ;
		} ;
		
		var newSentence = function( sentence, cleanSentences ) {
			return {
				sentence : sentence ,
				cleanSentence : cleanSentence ,
				wordHash : {} ,
				lwf : {}
			} ;
		}
		
		var wordHash = {} ; // global word hash
		var sentenceHash = {} ;
		
		// clean version of the corpus
		var cleanCorpus = corpus
				.replace( /[]/, ' ' )	// word splitters, remove newline
				.replace( /[]/, ''  ) ;	// word connectors
		
		var sentences = corpus.split( /[]/ ) ; // split by dots .
		var N = sentences.length ;
		var cleanSentences = cleanCorpus.split( /[]/ ) ; // split by dots
		
		for( var i = 0, len = sentences.length ; i < len ; i ++ ) {
			var s = sentences[ i ] ;
			var cs = cleanSentences[ i ] ;
			var sent = sentenceHash[ s ] = newSentence( s, cs ) ;
			var cleanWords = cs.split( /[]/ ) ; // split by space character
			for ( w in cleanWords ) {
				if( wordHash[ w ] === undef ) {
					wordHash[ w ] = newWord( w ) ;
				} 
				else {
					wordHash[ w ].gwf ++ ; // increase global word frequency
				}
				if( sent.wordHash[ w ] === undef ) {
					sent.wordHash[ w ] = wordHash[ w ] ;
					sent.lwf[ w ] = 1 ;
				}
				else {
					sent.lwf[ w ] ++ ;
				}
			}
		}
		
		var removeSentence = function( sentenceObj ) { // param: the sentence object
			for( w in sentenceObj.wordHash ) {
				wordHash[w] = undef ; // removes from all sentences and global word hash
			}
			sentenceHash[ sentenceObj.cleanSentence ] = undef ;
			N = N - 1 ;
		} ;
		
		var localWeight = function( wordObj ,sentenceObj ) {
			//return Math.log( 1 + sentenceObj.lwf[ wordObj.word ] ) ;
			var maxFreq = 0 ;
			for( var w in  sentenceObj.wordHash ) {
				if( maxFreq < lwf.wordHash[w] ){
					maxFreq = lwf.wordHash[w] ;
				}
			}
			return (1+lwf/maxFreq)/2 ;
		} ;
		
		var globalWeight = function( wordObj ){
			var ni = 0 ;
			for( var i in sentenceHash ) {
				var s = sentenceHash[i] ;
				if( s.wordHash[ wordObj.word ] !== undef ){
					ni ++ ;
				}
			}
			Math.log( N / ni ) ;
		} ;
		
		var relevanceScore = function( sentenceObj ) {
			var score = 0 ;
			for( var i in senteceObj.wordHash ) {
				var w = sentenceObj.wordHash[i] ;
				score += localWeight( w , sentenceObj ) * globalWeight( w ) ;
			}
		} ;
		
		var summary = '' ;
		
		for( var i = 1 ; i <= params.size ) {
			// 1. sort descending sententece by relevance score
			sentences.sort( function( s1, s2 ){
				rs1 = relevanceScore( s1 ) ;
				rs2 = relevanceScore( s2 ) ;
				if( rs1 < rs2 ) return -1 ;
				else if( rs1 > rs2 ) return 1 ;
				else return 0 ;
			}) ;
			
			// 2. remove sentence
			var topScoringSentence = sentences.splice(0,1) ;
			removeSentence( topScoringSentence ) ;
			
			// 3. add to summary 
			summary += topScoringSentence ;
		}
		
		return summary ;
	} ;
	
	win.sum = sum ;
	
})(window,document) ;
