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
        constructor(id, username, group, grades) {
            this.id = id;
            this.username = username;
            this.group = group;
            this.grades = grades;
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
            greetings: async function(){
                var tahvelVersion = localStorage.getItem('TAHVEL_VERSION');
                var loggedin = getCookie('XSRF-TOKEN');
                let user = null;
                console.log(loggedin);

                if(loggedin !== ''){
                    let userdata = await (await fetch('https://tahvel.edu.ee/hois_back/user')).json();
                    let studyyears = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalStudyYears?studentId=${userdata.student}`)).json();
                    let grades = await getGrades(userdata.student ,studyyears[studyyears.length-1])
                    user = new User(userdata.student,userdata.fullname, userdata.users[0].studentGroup, grades)
                    this.echo(`Tahvel CLI v1.0 \nTahvel ${tahvelVersion}\nLogged in as ${user.username}`);
                }
                else{
                    this.echo('Tahvel CLI v1.0' + '\n' + 'Tahvel ' + tahvelVersion);
                }
            }
        });
    }

    //utility functions
    async function getGrades(userId, studyYear) {
        let url = `https://tahvel.edu.ee/hois_back/journals/studentJournals?studentId=${userId}&studyYearId=${studyYear.id}`;
        
        return await fetch(url, {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
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
