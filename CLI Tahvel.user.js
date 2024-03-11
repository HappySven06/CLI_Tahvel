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
        constructor(id, username, group, grades, recentGrades, homework, timeTable) {
            this.id = id;
            this.username = username;
            this.group = group;
            this.grades = grades;
            this.recentGrades = recentGrades;
            this.homework = homework;
            this.timeTable = timeTable;
        }
    };
    let user = new User();

    let hasBeenCalled = false;
    let hasGreetingBeenCalled = false;

    let time;
    let timeUtc;

    //start up functions
    function removeElements() {
        // Get the button element
        let button = document.getElementById("mobile-logout");
    
        if (button) {
            button.style.display = 'none';
        }

        let newBody = document.createElement("body");

        if (button) {
            newBody.appendChild(button);
        }

        document.body.parentNode.replaceChild(newBody, document.body);

        localStorage.removeItem('0_commands');
    }

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
                let loggedin = getCookie('XSRF-TOKEN');

                this.echo("Available commands:");
                if(loggedin !== '') {
                    this.echo("| logout - Logout of tahvel.");
                    this.echo("| grades [option] - View grades. Options: 'recent', 'all'");
                    this.echo("| homework - View homework assignments.");
                    this.echo("| timetable [option] - View timetable for a specific date. Options: 'today', 'tomorrow', 'thisweek', 'nextweek'");
                }
                else {
                    this.echo("| login [option] - Login into tahvel. Options: 'hari', 'smartid'");
                }
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
                let button = document.querySelector("#mobile-logout");

                button.click();
                this.clear();
                document.cookie = 'XSRF-TOKEN' + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                location.reload();
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

                    this.echo(formatDay(from));
                }
                else if (paramiter === 'tomorrow') {
                    from = time.add(1, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.add(1, 'd').format('YYYY-MM-DDT00:00:00.000[Z]');

                    this.echo(formatDay(from));
                }
                else if (paramiter === 'thisweek') {
                    from = time.startOf('w').format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.endOf('w').format('YYYY-MM-DDT00:00:00.000[Z]');

                    this.echo(formatWeek(from, thru));
                }
                else if (paramiter === 'nextweek') {
                    from = time.startOf('w').add(1, 'w').format('YYYY-MM-DDT00:00:00.000[Z]');
                    thru = time.endOf('w').add(1, 'w').format('YYYY-MM-DDT00:00:00.000[Z]');

                    this.echo(formatWeek(from, thru));

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
            greetings: function (callback) {
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
        if (!hasBeenCalled) {
            let userdata = await (await fetch('https://tahvel.edu.ee/hois_back/user')).json();
            let studyyears = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalStudyYears?studentId=${userdata.student}`)).json();
            let grades = await getGrades(userdata.student, studyyears[studyyears.length - 1]);
            let recentGrades = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalLastResults?studentId=${userdata.student}`)).json();
            let homework = await (await fetch(`https://tahvel.edu.ee/hois_back/journals/studentJournalTasks?studentId=${userdata.student}`)).json();
    
            user = new User(userdata.student, userdata.fullname, userdata.users[0].studentGroup, grades, recentGrades, homework.tasks);
    
            getTimetable(userdata).then(timeTable => {
                user.timeTable = timeTable;
                console.log(timeTable);
                hasBeenCalled = true;
            });
        }
    }

    async function getTimetable(userdata) {
        let from = time.startOf('w').format('YYYY-MM-DDT00:00:00.000[Z]');
        let thru = time.endOf('w').add(1, 'w').format('YYYY-MM-DDT00:00:00.000[Z]');
        let timeTable = await (await fetch(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByStudent/14?from=${from}&student=${userdata.student}&thru=${thru}`)).json();
        return timeTable.timetableEvents;
    };

    function devideClasses(timetable, from, thru) {
        let week = [];
        let timeCurrent = dayjs(from);
        let timeScope = dayjs(thru);

        while (timeCurrent.isBefore(timeScope)) {
            let arr = [];
            for (let i = 0; i < timetable.length; i++) {
                if (timetable[i].date) {
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

    function formatDay(from) {
        let response = '';
        let timetable = [];
        let currentDate;
        let searchDate = dayjs(from);

        for(let i = 0; i < user.timeTable.length; i++) {
            currentDate = dayjs(user.timeTable[i].date);
            if(currentDate.isSame(searchDate)) {
                timetable.push(user.timeTable[i]);
            }
        }

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
        return response
    }

    function formatWeek(from, thru) {
        let response = '';
        let week;

        week = devideClasses(user.timeTable, from, thru)
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
        return response;
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
    function startUp() {
        removeElements();
        loadTerminal(initTerminal);
        loadDayJs(function () {
            initDayjs();
            loadUtc(initUtc);
        });
        GM_addStyle(CSS);
    };

    startUp();
})();