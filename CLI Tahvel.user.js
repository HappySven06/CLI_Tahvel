// ==UserScript==
// @name         CLI Tahvel TEST
// @namespace    http://tampermonkey.net/
// @version      2024-03-04
// @description  CLI for Tahvel
// @author       Sven Laht, Sebastian Pebsen Zachrau
// @match        https://tahvel.edu.ee/
// @icon         https://tahvel.edu.ee/favicon.ico
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/HappySven06/CLI_Tahvel/raw/main/CLI%20Tahvel.user.js
// ==/UserScript==

/* global $ */

(function () {
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

    class User {
        constructor(username, group, lastGrades) {
            this.username = username;
            this.group = group;
            this.lastGrades = lastGrades;
        }
    }

    //start up functions
    function removeElements() {
        var head = document.head;
        var currentBody = document.getElementsByTagName("body")[0];
        var newBody = document.createElement("body");

        while (head.firstChild) {
            head.removeChild(head.firstChild);
        };

        currentBody.parentNode.replaceChild(newBody, currentBody);

        localStorage.removeItem('0_commands');
    };

    function loadDependencies(callback) {
        var jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.onload = function () {
            var terminalScript = document.createElement('script');
            terminalScript.src = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/js/jquery.terminal.min.js';
            terminalScript.onload = function () {
                var terminalCSS = document.createElement('link');
                terminalCSS.rel = 'stylesheet';
                terminalCSS.href = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/css/jquery.terminal.min.css';
                terminalCSS.onload = callback;
                document.head.appendChild(terminalCSS);
            };
            document.head.appendChild(terminalScript);
        };
        document.head.appendChild(jqueryScript);
    };

    function initTerminal() {
        $('body').terminal({
            help: function () {
                //log all commands
            },
            login: function (type) {
                if (type === 'hari') {
                    window.location.href = 'https://tahvel.edu.ee/hois_back/haridLogin';
                }
                else if (type === 'smartid') {
                    window.location.href = 'https://tahvel.edu.ee/hois_back/taraLogin';
                }
                else {
                    this.echo('Login option does not exist: ' + type);
                }
            },
            grades: function (scale) {
                window.location.href = '#/students/journals'

                var grades = getGrades();

                if (scale === 'recent') {

                }
                else if (scale === 'all') {
                    //console.log(grades)
                }
                else {
                    this.echo('Grade option does not exist: ' + scale);
                }
            },
            neeger: function () {
                window.location.href = 'https://neeger.ee/'
            },
            faggot: function () {
                this.echo("fag");
            }
        }, {
            //greetings: 'Tahvel CLI v1.0' + '\n' + 'Tahvel ' + localStorage.getItem('TAHVEL_VERSION')
            greetings: function(){
                var tahvelVersion = localStorage.getItem('TAHVEL_VERSION');
                var logedin = getCookie('SESSION');

                console.log(logedin);

                if(logedin !== ''){
                    this.echo('Tahvel CLI v1.0' + '\n' + 'Tahvel ' + tahvelVersion + '\n' + 'Loged in');
                }
                else{
                    this.echo('Tahvel CLI v1.0' + '\n' + 'Tahvel ' + tahvelVersion);
                }
            }
        });
    }

    //utility functions
    function getGrades() {
        let url = 'https://tahvel.edu.ee/hois_back/journals/studentJournals?studentId=86673&studyYearId=658';

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'SESSION=ZTIwZDcxNDEtNTI3Ny00OGNkLWJhYmItYzRmM2FjNzNiY2M1; __edux_uid=1-56te133u-ltgvg0xf; taraStateToken=3ed2a1fd-c419-4937-b0e3-02cd2aca5b33; XSRF-TOKEN=e654821c-d0e7-4ca2-8bb8-e77d0c468591; _ga=GA1.3.983216143.1709794507; _gid=GA1.3.1277349965.1709794507; _gat_UA-143928412-1=1',
                'Host': 'tahvel.edu.ee',
                'Referer': 'https://tahvel.edu.ee/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': 'e654821c-d0e7-4ca2-8bb8-e77d0c468591',
                'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                return data;
            })
            .catch(error => {
                this.echo(error);
            });
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
    }

    //start up
    removeElements();
    loadDependencies(initTerminal);
    GM_addStyle(CSS);

    /*
    const timer = ms => new Promise(res => setTimeout(res, ms))
    let username = document.getElementById('user-menu-name');
    let group = document.getElementById('user-menu-button');
    let lastGradesTable = (document.getElementsByClassName("home-grades-section-content"));
    console.log(lastGradesTable[0]);
    let usernametext = username.innerText;
    let grouptext = group.ariaLabel;
    async function getUserData() {
        while(username.innerText == "") {
            usernametext = username.innerText;
            await timer(500);
        }
        grouptext = group.ariaLabel;
    }
    async function index() {
        await getUserData()
        var regex = /\((.*?)\)/
        grouptext = grouptext.match(regex)[1];
    }
    index();
    //let currentUser = User()
    */
})();
