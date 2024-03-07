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

    //global variables
    let CSS = `
        :root {
            --color: #aaa;
            --background: #000;
            --size: 1;
            /* --glow: 1 */
            --animation: terminal-blink;
        }
    `;

    class User {
        constructor(id, username, group, grades, recentGrades) {
            this.id = id;
            this.username = username;
            this.group = group;
            this.grades = grades;
            this.recentGrades = recentGrades
        }
    }
    let user = new User();

    let hasBeenCalled = false;
    let hasGreetingBeenCalled = false;

    //start up functions
    function removeElements() {
        let head = document.head;
        let currentBody = document.getElementsByTagName("body")[0];
        let newBody = document.createElement("body");

        while (head.firstChild) {
            head.removeChild(head.firstChild);
        };

        currentBody.parentNode.replaceChild(newBody, currentBody);

        localStorage.removeItem('0_commands');
    };

    function loadDependencies(callback) {
        let jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.onload = function () {
            let terminalScript = document.createElement('script');
            terminalScript.src = 'https://cdn.jsdelivr.net/npm/jquery.terminal@2.x.x/js/jquery.terminal.min.js';
            terminalScript.onload = function () {
                let terminalCSS = document.createElement('link');
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
                this.echo("Available commands:");
                this.echo("| login [option] - Login into tahvel. Options: 'hari' or 'smartid'");
                this.echo("| logout - Logout of tahvel.");
                this.echo("| grades [option] - View grades. Options: 'recent' or 'all'");
                this.echo("| homework - View homework assignments.");
                this.echo("| timetable [option] - View timetable for a specific date.");
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
            logout: function() {

            },
            grades: function (scale) {
                window.location.href = '#/students/journals'

                let grades = getGrades();

                if (scale === 'recent') {
                    this.echo(`\nRecent grades: \n`)
                    user.recentGrades.forEach(element => {
                        this.echo(`${element.grade.code[element.grade.code.length - 1]} -- ${element.nameEt} -- ${element.teacher}`)
                    });
                }
                else if (scale === 'all') {
                    this.echo(`\nAll grades:\n`)
                    user.grades.forEach(el => {
                        this.echo("=".repeat(40))
                        this.echo(el.nameEt)
                        el.journalEntries.forEach(hinne => {
                            if (hinne.grade !== null) {
                                this.echo(`| ${hinne.grade.code ? hinne.grade.code[hinne.grade.code.length - 1] : 'No Grade'} - ${hinne.addInfo ?? 'No info'}`)
                            }
                        })
                    });
                }
                else {
                    this.echo('Grade option does not exist: ' + scale);
                }
            },
            homework: function () {

            },
            timetable: function (date) {

            },
            neeger: function () {
                window.location.href = 'https://neeger.ee/'
            },
            faggot: function () {
                this.echo("fag");
            }
        }, {
            greetings: function () {
                if (hasGreetingBeenCalled === false) {
                    this.clear();
                    this.echo(createGreeting());

                    hasGreetingBeenCalled = true;
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
        for (let i = 0; i < ca.length; i++) {
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

    async function newUser() {
        console.log(hasBeenCalled);

        if (hasBeenCalled === false) {
            let userdata = await (await fetch('https://tahvel.edu.ee/hois_back/user')).json();
            let studyyears = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalStudyYears?studentId=${userdata.student}`)).json();
            let grades = await getGrades(userdata.student, studyyears[studyyears.length - 1])
            let recentGrades = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalLastResults?studentId=${userdata.student}`)).json();
            user = new User(userdata.student, userdata.fullname, userdata.users[0].studentGroup, grades, recentGrades)

            hasBeenCalled = true
        }
    }

    function createGreeting() {
        return new Promise(async (resolve, reject) => {
            let tahvelVersion = localStorage.getItem('TAHVEL_VERSION');
            let loggedin = getCookie('XSRF-TOKEN');

            if (loggedin !== '') {
                try {
                    await newUser();
                    resolve(`Tahvel CLI v1.0 \nTahvel ${tahvelVersion}\nLogged in as ${user.username}`);
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(`Tahvel CLI v1.0 \nTahvel ${tahvelVersion}`);
            }
        });
    }

    //start up
    removeElements();
    loadDependencies(initTerminal);
    GM_addStyle(CSS);
})();