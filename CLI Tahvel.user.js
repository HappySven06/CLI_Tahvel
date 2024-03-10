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
        constructor(id, username, group, grades, recentGrades, homework) {
            this.id = id;
            this.username = username;
            this.group = group;
            this.grades = grades;
            this.recentGrades = recentGrades;
            this.homework = homework
        }
    };
    let user = new User();

    let hasBeenCalled = false;
    let hasGreetingBeenCalled = false;

    let time;
    let timeUtc;

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

    function loadTerminal(callback) {
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

    function loadDayJs(callback) {
        const scriptDayjs = document.createElement('script');
        scriptDayjs.src = 'https://cdn.jsdelivr.net/npm/dayjs@1.10.7';
        scriptDayjs.onload = function () {
            callback();
        };
        document.head.appendChild(scriptDayjs);
    };

    function loadUtc(callback) {
        const scriptUtc = document.createElement('script');
        scriptUtc.src = 'https://cdn.jsdelivr.net/npm/dayjs@1.10.7/plugin/utc';
        scriptUtc.onload = function () {
            callback();
        };
        document.head.appendChild(scriptUtc);
    };

    function initDayjs() {
        time = dayjs();
    };

    function initUtc() {
        dayjs.extend(window.dayjs_plugin_utc);
        time = dayjs.utc();
    };

    function initTerminal() {
        $('body').terminal({
            help: function () {
                this.echo("Available commands:");
                this.echo("| login [option] - Login into tahvel. Options: 'hari', 'smartid'");
                this.echo("| grades [option] - View grades. Options: 'recent', 'all'");
                this.echo("| homework - View homework assignments.");
                this.echo("| timetable [option] - View timetable for a specific date. Options: 'today', 'tomorrow', 'thisweek', 'nextweek'");
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
            logout: function () {

            },
            grades: function (scale) {
                window.location.href = '#/students/journals'

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
                window.location.href = '#/students/tasks'

                user.homework.forEach(task => {
                    if(task.isDone !== true) {
                        this.echo(`| ${task.date.split('T')[0]} - ${task.journalName} - ${task.taskContent}`);
                    }
                })
            },
            timetable: function (paramiter) {
                let from;
                let thru;

                if (paramiter === 'today') {
                    from = time.format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.format('YYYY-MM-DDT00:00:00.000[Z]');

                    formatDay(from, thru)
                        .then(responce => {
                            this.echo(responce);
                        });
                }
                else if (paramiter === 'tomorrow') {
                    from = time.add(1, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.add(1, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');

                    formatDay(from, thru)
                        .then(responce => {
                            this.echo(responce);
                        });
                }
                else if (paramiter === 'thisweek') {
                    from = time.format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.add(7, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');

                    formatWeek(from, thru)
                        .then(responce => {
                            this.echo(responce);
                        });
                }
                else if (paramiter === 'nextweek') {
                    from = time.add(1, 'w').format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.add(1, 'w').add(7, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');

                    formatWeek(from, thru)
                        .then(responce => {
                            this.echo(responce);
                        });

                    //console.log(`${from}\n${thru}`)
                }
                else {
                    this.echo('Timetable option does not exist: ' + paramiter);
                }
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
    };

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
    };

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
    };

    async function newUser() {
        if (hasBeenCalled === false) {
            let userdata = await (await fetch('https://tahvel.edu.ee/hois_back/user')).json();
            let studyyears = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalStudyYears?studentId=${userdata.student}`)).json();
            let grades = await getGrades(userdata.student, studyyears[studyyears.length - 1])
            let recentGrades = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalLastResults?studentId=${userdata.student}`)).json();
            let homework = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalTasks?studentId=${userdata.student}`)).json();
            console.log(homework.tasks);
            user = new User(userdata.student, userdata.fullname, userdata.users[0].studentGroup, grades, recentGrades, homework.tasks)

            hasBeenCalled = true
        }
    };

    function getTimetable(from, thru) {
        return new Promise(async (resolve, reject) => {
            const response = await fetch(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByStudent/14?from=${from}&student=${user.id}&thru=${thru}`);
            const timetable = await response.json();
            const timetableData = timetable.timetableEvents;
            resolve(timetableData);
        });
    };

    function devideClasses(timetable, from, thru) {
        let week = [];
        let timeCurrent = dayjs(from);
        let timeScope = dayjs(thru);

        while (timeCurrent.isBefore(timeScope)) {
            let arr = [];
            for (let i = 0; i < timetable.length; i++) {
                if (timetable[i].date) { // Check if 'date' property exists
                    let c = dayjs(timetable[i].date);
                    if (c.isSame(timeCurrent, 'day')) {
                        arr.push(timetable[i]);
                    }
                }
            }
            week.push(arr);
            timeCurrent = timeCurrent.add(1, 'd');
        }

        return week;
    };

    function formatDay(from, thru) {
        return new Promise((resolve, reject) => {
            let response = '';
    
            getTimetable(from, thru)
                .then(timetable => {
                    let c = timetable;
                    if (c.length !== 0) {
                        let currentDay = dayjs(c[0].date).format('dddd');
                        response += `${currentDay}:\n`;

                        c.sort((a, b) => {
                            return a.timeStart.localeCompare(b.timeStart);
                        });

                        for (let j = 0; j < c.length; j++) {
                            let currentClass = c[j];
                            if (currentClass && currentClass.teachers && currentClass.teachers.length > 0 && currentClass.rooms && currentClass.rooms.length > 0) {
                                response += `| ${currentClass.timeStart}-${currentClass.timeEnd}, ${currentClass.nameEt}, ${currentClass.teachers[0].name}, ${currentClass.rooms[0].roomCode}\n`;
                            } else {
                                console.error('Teacher or room information not available for class:', currentClass);
                            }
                        }
                    }
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
        })  
    }

    function formatWeek(from, thru) {
        return new Promise((resolve, reject) => {
            let response = '';
    
            getTimetable(from, thru)
                .then(timetable => {
                    return devideClasses(timetable, from, thru);
                })
                .then(week => {
                    for (let i = 0; i < week.length; i++) {
                        let c = week[i];
                        if (c.length !== 0) {
                            let currentDay = dayjs(c[0].date).format('dddd');
                            response += `${currentDay}:\n`;
    
                            c.sort((a, b) => {
                                return a.timeStart.localeCompare(b.timeStart);
                            });
    
                            for (let j = 0; j < c.length; j++) {
                                let currentClass = c[j];
                                if (currentClass && currentClass.teachers && currentClass.teachers.length > 0 && currentClass.rooms && currentClass.rooms.length > 0) {
                                    response += `| ${currentClass.timeStart}-${currentClass.timeEnd}, ${currentClass.nameEt}, ${currentClass.teachers[0].name}, ${currentClass.rooms[0].roomCode}\n`;
                                } else {
                                    console.error('Teacher or room information not available for class:', currentClass);
                                }
                            }
                        }
                    }
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                });
        });
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
    };

    //start up
    removeElements();
    loadTerminal(initTerminal);
    loadDayJs(function () {
        initDayjs();
        loadUtc(initUtc);
    });
    GM_addStyle(CSS);
})();
