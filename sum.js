(function (_undef) {
    "use strict";

    /**
     * Function wraps the library code to allow passing in the
     * dependencies easily.
     * @param {Object} _ - Reference to underscore.js
     * @param {Object} stemmer - Porter stemmer implementation in js.
     * @return {Function} Sumarization function.
     */
    var wrapper = function (_, stemmer) {

        // Params default values.
        var defaults = {
            nSentences: 1,
            exclude: [],
            emphasise: []
        };

        // regexes
        var sentenceDelimiter = /[.!?;]/;
        var nGramDelimiter = /[.,!?;]/;
        var wordDelimiter = /\s/mg;
        var matchJunk = /["#$%&'()*+,\-\/:<=>@\[\\\]\^_`{|}]/mg ;

        // List of words which are ignored when computing top relevant sentences.
        var stopWords = ["", "a", "about", "above", "above", "across", "after",
            "afterwards", "again", "against", "all", "almost", "alone", "along",
            "already", "also","although","always","am","among", "amongst",
            "amoungst", "amount",  "an", "and", "another", "any","anyhow",
            "anyone","anything","anyway", "anywhere", "are", "around", "as",
            "at", "back","be","became", "because","become","becomes",
            "becoming", "been", "before", "beforehand", "behind", "being",
            "below", "beside", "besides", "between", "beyond", "bill", "both",
            "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con",
            "could", "couldnt", "cry", "de", "describe", "detail", "do", "done",
            "down", "due", "during", "each", "eg", "eight", "either", "eleven",
            "else", "elsewhere", "empty", "enough", "etc", "even", "ever",
            "every", "everyone", "everything", "everywhere", "except", "few",
            "fifteen", "fify", "fill", "find", "fire", "first", "five", "for",
            "former", "formerly", "forty", "found", "four", "from", "front",
            "full", "further", "get", "give", "go", "had", "has", "hasnt",
            "have", "he", "hence", "her", "here", "hereafter", "hereby",
            "herein", "hereupon", "hers", "herself", "him", "himself", "his",
            "how", "however", "hundred", "ie", "if", "in", "inc", "indeed",
            "interest", "into", "is", "it", "its", "itself", "keep", "last",
            "latter", "latterly", "least", "less", "ltd", "made", "many", "may",
            "me", "meanwhile", "might", "mill", "mine", "more", "moreover",
            "most", "mostly", "move", "much", "must", "my", "myself", "name",
            "namely", "neither", "never", "nevertheless", "next", "nine", "no",
            "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere",
            "of", "off", "often", "on", "once", "one", "only", "onto", "or",
            "other", "others", "otherwise", "our", "ours", "ourselves", "out",
            "over", "own","part", "per", "perhaps", "please", "put", "rather",
            "re", "same", "see", "seem", "seemed", "seeming", "seems",
            "serious", "several", "she", "should", "show", "side", "since",
            "sincere", "six", "sixty", "so", "some", "somehow", "someone",
            "something", "sometime", "sometimes", "somewhere", "still", "such",
            "system", "take", "ten", "than", "that", "the", "their", "them",
            "themselves", "then", "thence", "there", "thereafter", "thereby",
            "therefore", "therein", "thereupon", "these", "they", "thickv",
            "thin", "third", "this", "those", "though", "three", "through",
            "throughout", "thru", "thus", "to", "together", "too", "top",
            "toward", "towards", "twelve", "twenty", "two", "un", "under",
            "until", "up", "upon", "us", "very", "via", "was", "we", "well",
            "were", "what", "whatever", "when", "whence", "whenever", "where",
            "whereafter", "whereas", "whereby", "wherein", "whereupon",
            "wherever", "whether", "which", "while", "whither", "who",
            "whoever", "whole", "whom", "whose", "why", "will", "with",
            "within", "without", "would", "yet", "you", "your", "yours",
            "yourself", "yourselves", "the"];

        /**
         * Function used to clean sentences before splitting into words
         * @param {String} str
         * @return {String}
         */
        var clean = function (str) {
            return _(str).chain()
                .unescapeHTML()
                .stripTags()
                .clean()
                .value()
                .replace( matchJunk, '' )
                .toLowerCase();
        };

        /**
         * Sentence Module. Creates object with format:
         *  {orig:String, words:Array<String>, remove:Function}
         */
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

        /**
         * Text summarization function.
         * @param {Object} opts
         * @param {String} opts.corpus - String to summarize.
         * @param {String} opts.nWords - Number of words the summary should have.
         * @param {String} opts.nSentences - Number of sentences the summary should have.
         * @return {Object} output
         * @return {Array<String>} output.sentences - The summary sentences in
         *                                  order of relevance to the input text.
         * @return {String} output.summary - the concatenation of the summary
         *                                  sentences for convenience.
         */
        var sum = function (opts){
            // Handle options.
            opts = _.extend( {}, defaults, opts );
            opts.corpus = opts.corpus || _undef;
            if (opts.corpus === _undef) {
                throw Error( 'No input corpus' );
            }
            if (opts.nWords !== _undef && !_.isNumber(opts.nWords)) {
                throw Error('Bad value for nWords');
            }

            // Clean corpus.
            var s = opts.corpus.split(sentenceDelimiter);
            var sentences = _(s).map( function (s) {
                return new Sentence(s);
            });

            // Splits the sentences into nGrams then applies the same algorithm.
            if (opts.nWords) {

                // `opts.nSentences` is ignored, output size is determined by lexem size.
                opts.nSentences = 1;

                var nGrams = _(sentences).reduce( function (collect, s) {
                    var orig = s.orig;
                    var partials = _(s.words).reduce( function (memo, freq, w) {
                        var pos = orig.indexOf(' ');
                        if (pos === -1) {
                            pos = orig.length;
                        }
                        var partial = orig.substr(0, pos);
                        orig = orig.substr(pos + 1);
                        if (partial !== '') {
                            memo.push(partial);
                        }
                        return memo;
                    }, []);
                    if (partials.length <= opts.nWords) {
                        var newSentence = new Sentence( partials.join(' '));
                        collect.push( newSentence );
                        return collect;
                    }
                    var i = 0,
                        j = 0,
                        n = partials.length - opts.nWords,
                        m = partials.length,
                        tmp;
                    for (i = 0; i < n; i ++) {
                        var tmp = ''
                        for (j = i; j < i+opts.nWords; j ++) {
                            tmp += partials[j] + ' ';
                        }
                        var newSentence = new Sentence(tmp);
                        collect.push(newSentence);
                    }
                    return collect;
                }, []);
                sentences = nGrams;
            }


            /**
             * Return all sentences that contain a givven word.
             * @param {String} w - word
             * @return {Array<Object>}
             */
            var containing = function (w) {
                return _(sentences).filter( function (s) {
                    return (s.words[w] !== undefined) ;
                });
            };

            // If summary must exclude words in opts.exclude remove sentences
            // that contain those words.
            if ( _.isArray(opts.exclude) && opts.exclude.length !== 0) {
                var excludes = _(opts.exclude).map( function (w) {
                    return stemmer(clean(w));
                });
                sentences = _(sentences).filter( function (s) {
                    var words = _(s.words).keys();
                    return (_.intersection( words, excludes ).length === 0);
                });
            }

            var summary = [];
            var counter = 0;

            // Extract sentences in order of their relevance.
            while (true) {
                var N = sentences.length;

                // Builds a hash of all words with global frequencies.
                var words = _(sentences).reduce( function (collect,s) {
                    _(s.words).each( function (count, w) {
                        collect[w] = collect[w] ? collect[w] + count : count ;
                    });
                    return collect;
                }, {});

                // If summary must have the words in opts.emphasise.
                var emphasise = [];
                if ( _.isArray(opts.emphasise) && opts.emphasise.length !== 0) {
                    emphasise = _(opts.emphasise).map( function (w) {
                        return stemmer(clean(w));
                    });
                }

                // Calculate relevance for each sentence.
                _(sentences).each( function (s) {
                    var relevance = _(s.words).reduce( function (memo, freq, w) {
                        var local = Math.log(1 + freq);
                        var global = Math.log(N / containing(w).length);
                        return memo = memo + (local * global);
                    }, 0);

                    // If current sentence containes emphasised words,
                    // bumb up the relevance.
                    var bump = _.intersection(emphasise, _(s.words).keys()).length;
                    relevance += bump * 1000;

                    s.relevance = relevance;
                })

                // Highest relevance sentence.
                var highest = _(sentences).max( function (s) {
                    return s.relevance;
                });

                // Remove words from the remaining sentences to reduce redundancy.
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
            }

            return {
                'summary': summary.join('.'),
                'sentences': summary
            };
        };

        return sum;
    };


    // exports the `sum` function in node.js
    if (typeof exports !== 'undefined'
        && typeof module !== 'undefined'
        && module.exports
        && typeof require !== 'undefined') {
        var stemmer = require( 'porter-stemmer' ).stemmer;
        var _ = require( 'underscore' );
        _.str = require( 'underscore.string' );
        _.mixin( _.str.exports() );
        module.exports = wrapper(_, stemmer);
    }
    // exports `sum` to AMD module, defining dependencies
    else if (typeof define === 'function' && define.amd) {
        define('sum', [
            'underscore',
            'underscore.string',
            'porter-stemmer'
        ], function(_, str, stemmer) {
            return wrapper(_, stemmer);
        });
    }
    // export in browser
    else if (typeof this !== 'undefined'
             && this._ && this.stemmer) {
        this._.mixin( this._.str.exports() );
        this.sum = wrapper(this._, this.stemmer);
    }
    else {
        throw Error( 'Unsupported js environment detected' );
    }

}).call(this);
