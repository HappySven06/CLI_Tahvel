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

    // Select all elements on the page
    var allElements = document.getElementsByTagName("*");

    // Loop through each element and remove it
    for(var i = 0; i < allElements.length; i++) {
        allElements[i].remove();
    }
})();