(function () {
	"use strict";

	// make the module usable both in browsers and in node.js
	var exports, _undef, _ ;
	if ( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
		exports = module.exports;
		_ = require('underscore');
		_.str = require('underscore.string');
	}
	else {
		exports = this;
		_ = this._;
	}

	// make sure underscore.mixin is installed
	_.mixin( _.str.exports() );


	//default values
	var defaults = {
		nSentences: 1,
		exclude: [],
		emphasise: []
	};
	
	// regexes
	var sentenceDelimiter = /[.!?;]/;
	var wordDelimiter = /\s/mg;
	var matchJunk = /["#$%&'()*+,\-\/:<=>@\[\\\]\^_`{|}]/mg ;

	var stopWords = ["", "a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

	// function used to clean sentences before splitting into words 
	var clean = function (str) {
		return _(str).chain()
			.unescapeHTML()
			.stripTags()	
			.clean()
			.value()
			.replace( matchJunk, '' )
			.toLowerCase();
	};

	// Sentence Module
	var Sentence = function (s) {
		var c = clean( s );
		var all = _.words( c, wordDelimiter );
		var words = _(all).chain()
				// remove stop words
				.filter( function (w) {
					return (stopWords.indexOf( w ) === -1) ;
				})
				// apply stemmer
				.map( function (w) {
					return stemmer( w );
				})
				// collect word frequencies
				.reduce( function (collect, w) {
					collect[w] = collect[w] ? collect[w] + 1 : 1 ;
					return collect;
				}, {}).value();
		// remove a word from this sentence to reduce redundancy in results
		var remove = function (w) {
			return delete words[w];
		};
		return {
			orig: s,
			words: words,
			remove: remove
		};
	};

	var sum = function (opts){

		// handle options
		opts = _.extend( {}, defaults, opts );
		opts.corpus = opts.corpus || _undef;
		if (opts.corpus === _undef) throw Error( 'No input corpus' );

		// clean corpus
		var s = opts.corpus.split( sentenceDelimiter ); // TODO: keep the sentence ending chars
		var sentences = _(s).map( function (s) {
			return new Sentence(s);	
		});

		// return all sentences that contain a givven word
		var containing = function (w) {
			return _(sentences).filter( function (s) {
				return (s.words[w] !== undefined) ;
			});
		};
		
		// if summary must exclude words in opts.exclude remove sentences that contain those words
		if ( _.isArray(opts.exclude) && opts.exclude.length !== 0) {
			var excludes = _(opts.exclude).map( function (w) {
				return stemmer(clean(w));
			});
			sentences = _(sentences).filter( function (s) {
				var words = _(s.words).keys();
				return (_.intersection( words, excludes ).length === 0);
			});
		}

		
		var summary = [] ;
		var counter = 0;

		// extract sentences in order of their relevance
		while (true) {
			var N = sentences.length;

			// builds a hash of all words with global frequencies
			var words = _(sentences).reduce( function (collect,s) {
				_(s.words).each( function (count, w) {
					collect[w] = collect[w] ? collect[w] + count : count ;				
				});	
				return collect;	
			}, {});
			
			// if summary must have the words in opts.emphasise
			var emphasise = [];
			if ( _.isArray(opts.emphasise) && opts.emphasise.length !== 0) {
				emphasise = _(opts.emphasise).map( function (w) {
					return stemmer(clean(w));
				});
			}

			//calculate relevance for each sentence
			_(sentences).each( function (s) {
				var relevance = _(s.words).reduce( function (memo, freq, w) {
					var local = Math.log( 1 + freq );
					var global = Math.log( N / containing(w).length );
					return memo = memo + (local * global);
				}, 0);
				
				// if current sentence containes emphasised words, bumb up the relevance
				var bump = _.intersection(emphasise, _(s.words).keys()).length;
				relevance += bump * 1000; //big enough to push it in front

				s.relevance = relevance;
			})

			// highest relevance sentence
			var highest = _(sentences).max( function (s) {
				return s.relevance;
			});

			// remove words from the remaining sentences to reduce redundancy 
			sentences = _(sentences).chain()
				.without(highest)
				.map( function (s) {
					_(highest.words).each( function (w) {
						s.remove( w );
					});
					return s;
				})
				.value();

			summary.push( highest.orig ) ;
			counter += 1;

			var stop = (counter === opts.nSentences || sentences.length === 0);
			if (stop) break; 
		}//~ end while
		return {
			'summary': summary.join('.'),
			'sentences': summary
		};
	};
	
	//public api
	exports.sum = sum ;

}).call(this);
	
	
	
	
	
	
	
	
	
	
	
	/*
	
	(function () {
	if (window !== undefined) {
		window._.mixin( window._.str.exports() );
		return { // for browsers
			'exports': window, 
			_: window._
		};
	}
	if (module && module.exports) {
		var _ = require( 'underscore' );
		_.str = require( 'underscore.string' );
		_.mixin( _.str.exports() );
		return { // for nodejs
			'exports': module.exports, 
			'_': _
		};
	}
	else if (window !== undefined) {
		window._.mixin( window._.str.exports() );
		return { // for browsers
			'exports': window, 
			_: window._
		};
	}
	throw Exception( 'Unsupported Environment!' );
})());





/*
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
*/
