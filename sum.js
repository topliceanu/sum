// TODO register cleanup function ;)
var sum = (function(win,undef){
	
	"use strict" ;
	
	var newWord = function( word ) {
		if( typeof word !== 'string' ){
			return undef ;
		}
		return {
			'word' : word ,
			'gwf' : 1 
		} ;
	} ;
		
	var newSentence = function( sentence, cleanSentence ) {
		if( typeof sentence !== 'string' && typeof cleanSentence !== 'string' ){
			return undef ;
		}
		return {
			sentence : sentence ,
			cleanSentence : cleanSentence ,
			wordHash : {} ,
			lwf : {}
		} ;
	} ;

	var matchJunk = /["#$%&'()*+,\-\/:<=>@\[\\\]\^_`{|}]/mg ;
	var matchMultipleSpaces = /\s{2,}/mg ;
	var sentenceSplitter = /[.!?;]/ ;
	var wordSplitter = /\s/mg ;

	var localWeight = function( wordObj, sentenceObj ) {
		//return Math.log( 1 + sentenceObj.lwf[ wordObj.word ] ) ;
		var maxFreq = 0 ;
		for( var w in sentenceObj.wordHash ) {
			if( maxFreq < sentenceObj.lwf[w] ){
				maxFreq = sentenceObj.lwf[w] ;
			}
		}
		return (1+sentenceObj.lwf[w]/maxFreq)/2 ;
	} ;


	var sum = function( corpus , params ) { // params.size - nr of sentences in output
		
		// defaults 
		params = params || {} ;
		params.size = params.size || 1 ;
		
		
		var wordHash = {} ; // global word hash
		var sentenceHash = {} ;
		
		// clean version of the corpus
		var cleanCorpus = corpus
				.replace( matchJunk , '' ) // leaves out .!?; and all spaces
				.replace( matchMultipleSpaces , ' ' ) ; // removes multiple spaces and keeps just one
		
		var sentences = corpus.split( sentenceSplitter ).filter( function(sentence){
			return ( sentence !== ' ' && sentence !== '' ) ; //TODO externalize
		}) ; 
		var N = sentences.length ;
		var cleanSentences = cleanCorpus.split( sentenceSplitter ).filter( function(sentence){
			return ( sentence !== ' ' && sentence !== '' ) ; //TODO externalize
		});
		//TODO check if cleanSentences.length === N. if not throw an error

		for( var i = 0, len = sentences.length ; i < len ; i ++ ) {
			var s = sentences[ i ] ;
			var cs = cleanSentences[ i ] ;
			var sent = sentenceHash[ s ] = newSentence( s, cs ) ;
			var cleanWords = cs.split( wordSplitter ).filter( function(word){ //TODO externalize word filter func
				return ( word !== ' ' && word !== '' ) ;
			}) ; 
			for( var j = 0, lenW = cleanWords.length ; j < lenW ; j ++ ) {
				var w = cleanWords[j] ;
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
				if( sentenceObj.wordHash.hasOwnProperty( w ) ){
					wordHash[w] = undef ; // removes from all sentences and global word hash
				}
			}
			sentenceHash[ sentenceObj.cleanSentence ] = undef ;
			N = N - 1 ;
		} ;
		
		
		var globalWeight = function( wordObj ){
			var ni = 0 ;
			for( var i in sentenceHash ) {
				if( sentenceHash.hasOwnProperty( i ) ){
					var s = sentenceHash[i] ;
					if( s.wordHash[ wordObj.word ] !== undef ){
						ni ++ ;
					}
				}
			}
			return Math.log( N / ni ) ;
		} ;
		
		var relevanceScore = function( sentenceObj ) { //TODO momoization wouldn't hurt
			var score = 0, w, lw, gw ;
			for( var i in sentenceObj.wordHash ) {
				if( sentenceObj.wordHash.hasOwnProperty( i ) ) {
					w = sentenceObj.wordHash[i] ;
					lw = localWeight( w , sentenceObj ) ;
					gw = globalWeight( w ) ;
					score += lw * gw ; 
				}
			}
			return score ;
		} ;
		
		var summary = '' ;
		
		for( var k = 1 ; k <= params.size ; k ++ ) {
			// 1. sort descending sententece by relevance score
			sentences.sort( function( s1, s2 ){
				var rs1 = relevanceScore( sentenceHash[ s1 ] ) ;
				var rs2 = relevanceScore( sentenceHash[ s2 ] ) ;
				if( rs1 < rs2 ) {
					return 1 ;
				}
				else {
					if( rs1 > rs2 ) {
						return -1 ;
					}
					else {
						return 0 ;
					}
				}
			}) ;
			
			// 2. remove sentence
			var topScoringSentence = sentences.splice(0,1) ;
			removeSentence( topScoringSentence ) ;
			
			// 3. add to summary 
			summary += topScoringSentence ;
		}
		
		return summary ;
	} ; //~ end sum()
	
	return sum ;	
})() ;
