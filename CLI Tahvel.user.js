// ==UserScript==
// @name         CLI Tahvel
// @namespace    http://tampermonkey.net/
// @version      2024-03-04
// @description  CLI for Tahvel
// @author       Sven Laht
// @match        https://tahvel.edu.ee/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edu.ee
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var CSS = `
        :root {
            --color: #aaa;
            --background: #000;
            --size: 1;
            /* --glow: 1 */
            --animation: terminal-blink;
        }
    `;

    removeElements();
    GM_addStyle(CSS);

    /*addElements();
    createCLI();*/

    function removeElements(){
        var allElements = document.getElementsByTagName("*");

        for(var i = 0; i < allElements.length; i++) {
            allElements[i].remove();
        }
    }

    /*function addElements(){
        var scriptElement = document.createElement('script');
        scriptElement.src = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/js/jquery.terminal.min.js';

        var linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/css/jquery.terminal.min.css';

        document.head.appendChild(scriptElement);
        document.head.appendChild(linkElement);
    }

    function createCLI(){
        $('body').terminal({
            hello: function(what) {
                this.echo('Hello, ' + what + '. Wellcome to this terminal.');
                // this string can be written with ES6 - uncomment to test
                // this.echo(`Hello, ${what}. Wellcome to this terminal.`);
            }
        }, {
            greetings: 'My First Web Terminal'
        });
        
        github('jcubic/jquery.terminal');
    }*/

    function loadDependencies(callback) {
        var jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.onload = function() {
            var terminalScript = document.createElement('script');
            terminalScript.src = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/js/jquery.terminal.min.js';
            terminalScript.onload = callback;
            document.head.appendChild(terminalScript);
        };
        document.head.appendChild(jqueryScript);
    }

    function initTerminal() {
        $('body').terminal({
            hello: function(what) {
                this.echo('Hello, ' + what + '. Welcome to this terminal.');
            }
        }, {
            greetings: 'My First Web Terminal'
        });
    }

    loadDependencies(initTerminal);
})();