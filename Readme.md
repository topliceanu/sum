  _____                       _      
 / ____|                     (_)     
| (___   _   _  _ __ ___      _  ___ 
 \___ \ | | | || '_ ` _ \    | |/ __|
 ____) || |_| || | | | | | _ | |\__ \
|_____/  \__,_||_| |_| |_|(_)| ||___/
                            _/ |     
                           |__/      

Summarize.js
============

A simple function for summarizing text e.g. for automatically determining the sentences that are most relevant to the context of the corpus.
This library depends on the [underscore](http://documentcloud.github.com/underscore/) and [underscore.string](http://epeli.github.com/underscore.string/) for the moment

Install in node.js
==================
	sudo npm install -g sum

Install in browser
==================
	<script src="/js/underscore.js"></script>	
	<script src="/js/underscore.string.js"></script>	
	<script src="/js/sum.js"></script>
	

Quick Start
===========
	
	var sum = require( 'sum' );
	var bigString = "....";
	var abstract = sum({ 'corpus': bigString });

Further Options
===============

	var sum = require( 'sum' );
	var anotherBigString = "...";
	var abstract = sum({
		'corpus': anotherBigString, // `corpus` is the string you want to summarize
		'nSentences': 3, // `nSentences` controls the number of sentences from the original from the original text included in the abstact
		'exclude': ['polar', 'bear'], // sum.js allows you to exclude sentences that contain any of the words in the `exclude` array param
		'emphasise': ['magic'] // forces sum.js to include in the summary the centences that contain the words specified by `emphasise` param.
	});

Running tests
=============
Run /tests/specrunner.html in your favourite browser.
Run node.js test with the command
	
TODO
====
1. add tests to verify the correctness of the actual output
2. currenty the output does not preserve the ending chars of the original sentences
3. make the lib more plugable: 
- allow plugin of custom algorithms
- better control for the length of the summary, by words, by letters
4. make it work in the browser! Tests are already in the 

Licence
=======

(The MIT License)

Copyright (c) 2009-2011 Alex Topliceanu <alext@vibetrace.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
