// ==UserScript==
// @name         CLI Tahvel
// @namespace    http://tampermonkey.net/
// @version      2024-03-04
// @description  CLI for Tahvel
// @author       Sven Laht
// @match        https://tahvel.edu.ee/
// @icon         https://tahvel.edu.ee/favicon.ico
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* global $ */

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

    function removeElements() {
        var head = document.head;
        var body = document.body;

        // Remove all elements in head
        while (head.firstChild) {
            head.removeChild(head.firstChild);
        }

        // Remove all elements in body except html, head, and body
        var allElements = body.children;
        for (var i = allElements.length - 1; i >= 0; i--) {
            var tagName = allElements[i].tagName.toLowerCase();
            if (tagName !== "html" && tagName !== "head" && tagName !== "body") {
                body.removeChild(allElements[i]);
            } else {
                allElements[i].innerHTML = ''; // Empty the content of html, head, and body tags
            }
        }
    }

    function loadDependencies(callback) {
        var jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.onload = function() {
            var terminalScript = document.createElement('script');
            terminalScript.src = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/js/jquery.terminal.min.js';
            terminalScript.onload = function() {
                // Now that jQuery and jQuery Terminal are loaded,
                // let's load the CSS file for jQuery Terminal.
                var terminalCSS = document.createElement('link');
                terminalCSS.rel = 'stylesheet';
                terminalCSS.href = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/css/jquery.terminal.min.css';
                terminalCSS.onload = callback; // Call the callback once CSS is loaded
                document.head.appendChild(terminalCSS);
            };
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

    removeElements();

    loadDependencies(initTerminal);
    GM_addStyle(CSS);
})();