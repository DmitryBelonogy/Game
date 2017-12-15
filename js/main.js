let recordGameArr = [{
    width: 32,
    height: 50,
    src: 'img/hero.png',
    frame: 9,
    x: [],
    y: [],
    dx: [],
    dy: []
}];
let tick = 0;
let bestPlayersArr;
let duration;
let componentArr = [];
if (localStorage.getItem('best')) {
    bestPlayersArr = JSON.parse(localStorage.getItem('best'));
} else {
    bestPlayersArr = [];
}

function START() {
    let paused = false;
    let count = 0;
    let enemiesArr = [];

    class myGame {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.img = new Image();  // Создание нового объекта изображения
            this.img.src = 'img/grass.png';
            this.init();
        }

        init() {
            myGame.addControlButton();
            this.canvas.width = document.documentElement.clientWidth;
            this.canvas.height = document.documentElement.clientHeight;
            this.context = this.canvas.getContext('2d');
            this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            setInterval(myGame.addCount, 1000);
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
        }

        static addCount() {
            if (paused) {
                return false;
            }
            count++;
            document.getElementById('count').innerText = `${count}`;
        }

        static addControlButton() {
            document.getElementsByTagName('body')[0].innerHTML = '<span id="count">0</span><div id="menuPanel"><div id="navigation"><ul><li><button id="about">About</button></li><li><button id="bestPlayers">Best palyers</button></li><li><a href="#record" id="recordGame">Record last game</a></li></ul></div><div id="content"></div></div><div id="menu"><img src="img/settings.png" alt="menu"></div><div id="pause"><img src="img/pause.png" alt="pause"></div><div id="controls"><button id="top"></button><button id="right"></button><button id="bot"></button><button id="left"></button></div>';
        }
    }

    class Component {
        constructor(width, height, frame, src) {
            this.ctx = game.context;
            this.width = width;
            this.height = height;
            this.x = Math.random()*(50 - document.documentElement.clientWidth) + document.documentElement.clientWidth;
            this.y = Math.random()*(50 - document.documentElement.clientHeight) + document.documentElement.clientHeight;
            this.dx = (Math.random()*2 - Math.random()*2)*2;
            this.dy = (Math.random()*2 - Math.random()*2)*2;
            this.frames = frame;
            this.image = new Image();
            this.image.src = src;
            this.currentFrame = 0;
            this.currentIndex = 0;
        }

        action() {

            this.x += this.dx;
            this.y += this.dy;
            if (this.x >= game.canvas.width) {
                this.x = 1;
            }
            if (this.y >= game.canvas.height) {
                this.y = 1;
            }
            if (this.x <= 0) {
                this.x = game.canvas.width;
            }
            if (this.y <= 0) {
                this.y = game.canvas.height;
            }
            this.drawImg();
        }

        drawImg() {

            if (this.dx === 0 && this.dy === 0) {
                this.ctx.drawImage(this.image, 0, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);
                return;
            }

            if (this.dx === 0 && this.dy > 0) {
                this.currentIndex = 0;
            } else if ((this.dx < 0 && this.dy <= 0) || (this.dx < 0 && this.dy > 0)) {
                this.currentIndex = 1;
            } else if (this.dx === 0 && this.dy < 0) {
                this.currentIndex = 2;
            } else if ((this.dx > 0 && this.dy <= 0) || (this.dx > 0 && this.dy > 0)) {
                this.currentIndex = 3;
            }

            this.ctx.drawImage(this.image, this.width * this.currentFrame, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);

            if (this.currentFrame === this.frames - 1) {
                this.currentFrame = 0;
            } else {
                this.currentFrame++;
            }
        }
    }

    class Enemy extends Component {

        action() {
            super.action();
            this.collizion();
        }

        collizion() {
            let XColl = false;
            let YColl = false;

            if ((this.x + this.width >= hero.x) && (this.x <= hero.x + hero.width)) XColl = true;
            if ((this.y + this.height >= hero.y) && (this.y <= hero.y + hero.height)) YColl = true;

            if (XColl && YColl) {
                clearInterval(interval);
                paused = true;
                let name = prompt('Your name', 'name') || 'no name';
                let player = {
                    name: `${name}`,
                    count: count
                };
                bestPlayersArr.push(player);
                function compareNumeric(a, b) {
                    if (a.count > b.count) return -1;
                    if (a.count < b.count) return 1;
                }
                bestPlayersArr.sort(compareNumeric);
                if (bestPlayersArr.length > 10) {
                    bestPlayersArr.length = 10;
                }
                localStorage.setItem('best', JSON.stringify(bestPlayersArr));
                localStorage.setItem('record', JSON.stringify(recordGameArr));
                let newGame = confirm('Start new game?');
                if (newGame) {
                    location.reload();
                }
            }
        }
    }

    class SmartEnemy extends Enemy{
        constructor(width, height, frame, src, radius) {
            super(width, height, frame, src);
            this.radius = radius;
        }

        create() {
            this.ctx.beginPath();
            this.ctx.arc(this.x + this.width/2, this.y + this.height/2, this.radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        action() {
            super.action();
            this.create();
            this.observation();
        }

        observation() {
            let pursuit = false;
            let centerX = this.x + this.width/2;
            let centerY = this.y + this.height/2;
            let pursuitX = -(centerX - (hero.x + hero.width / 2))/20;
            let pursuitY = -(centerY - (hero.y + hero.height / 2))/20;

            if (Math.sqrt(Math.pow(centerX - (hero.x + hero.width / 2), 2) + Math.pow(centerY - (hero.y + hero.height / 2), 2)) <= this.radius) pursuit = true;

            if (pursuit) {
                this.dx = Math.abs(pursuitX) >= 2.8 ?  pursuitX / 2 : pursuitX;
                this.dy = Math.abs(pursuitY) >= 2.8 ?  pursuitY / 2 : pursuitY;
            }
        }

    }

    class Hero extends Component {
        constructor(width, height, frame, src) {
            super(width, height, frame, src);
            this.x = document.documentElement.clientWidth / 2.1;
            this.y = document.documentElement.clientHeight / 2.1;
            this.dx = 0;
            this.dy = 0;
            this.keysdown = {
                68: false,
                65: false,
                87: false,
                83: false
            };
            this.controlKeyDown();
            this.controlKeyUp();
            this.frames = frame;
            this.image = new Image();
            this.image.src = src;
            this.currentFrame = 0;
            this.currentIndex = 0;
        }

        controlKeyDown() {
            window.addEventListener('keydown', (ev) => {
                this.keysdown[ev.keyCode] = true;
                this.changeDirection();
            });
            document.getElementById('controls').addEventListener('touchstart', (ev)=> {
                if (ev.target.tagName !== 'BUTTON') {
                    return false;
                }
                switch(ev.target.id) {
                    case 'top':
                        this.keysdown[87] = true;
                        break;
                    case 'right':
                        this.keysdown[68] = true;
                        break;
                    case 'bot':
                        this.keysdown[83] = true;
                        break;
                    case 'left':
                        this.keysdown[65] = true;
                        break;
                }
                this.changeDirection();
            });
        }

        controlKeyUp() {
            window.addEventListener('keyup', (ev) => {
                this.keysdown[ev.keyCode] = false;
                this.changeDirection();
            });
            document.getElementById('controls').addEventListener('touchend', (ev)=> {
                if (ev.target.tagName !== 'BUTTON') {
                    return false;
                }
                switch(ev.target.id) {
                    case 'top':
                        this.keysdown[87] = false;
                        break;
                    case 'right':
                        this.keysdown[68] = false;
                        break;
                    case 'bot':
                        this.keysdown[83] = false;
                        break;
                    case 'left':
                        this.keysdown[65] = false;
                        break;
                }
                this.changeDirection();
            })
        }

        changeDirection() {
            if (this.keysdown[65] === true) { //left
                this.dx = -3;
            } else if (this.keysdown[68] === true) { //right
                this.dx = 3;
            } else {
                this.dx = 0;
            }
            if (this.keysdown[87] === true) { //top
                this.dy = -3;
            } else if (this.keysdown[83] === true) { //bot
                this.dy = 3;
            } else {
                this.dy = 0;
            }
        }
    }

    let game = new myGame();

    let hero = new Hero(32, 50, 9, 'img/hero.png' );

    setInterval( ()=> {
        if (paused) {
            return false;
        }

        if (count % 5 === 0) {
            console.log('enemy');
            enemiesArr.push(new Enemy(25, 45, 9, 'img/ghost.png'));
            recordGameArr.push({
                width: 25,
                height: 45,
                src: 'img/ghost.png',
                frame: 9,
                x: [],
                y: [],
                dx: [],
                dy: []
            });
        }

        if (count % 10 === 0) {
            console.log('smartEnemy');
            enemiesArr.push(new SmartEnemy(25, 20, 9, 'img/bat.png', 100));
            recordGameArr.push({
                width: 25,
                height: 20,
                src: 'img/bat.png',
                frame: 9,
                x: [],
                y: [],
                dx: [],
                dy: []
            });
        }
    },1000);

    let interval = setInterval(function() {
        if (paused) {
            return false;
        }
        game.clear();

        for (let i = 0; i < enemiesArr.length; i++) {
            enemiesArr[i].action();
        }
        hero.action();
    }, 30);

    function pauseAction() {
        let pause = document.getElementById('pause');
        pause.addEventListener('click', ()=> {
            if (paused) {
                paused = false;
            } else if (!paused) {
                paused = true;
            }
        })
    }

    pauseAction();

    function showMenu() {
        let menu = document.getElementById('menu');
        menu.addEventListener('click', ()=> {
            paused = true;
            let menuPanel = document.getElementById('menuPanel');
            if (menuPanel.style.visibility === '') {
                menuPanel.style.visibility = 'visible';
            } else if (menuPanel.style.visibility === 'visible') {
                menuPanel.style.visibility = '';
            }
        })
    }

    showMenu();

    let content = document.getElementById('content');

    content.innerHTML = '<div id="intro"><p>It was a bad idea to go through the cemetery at night. With every second of the enemies become more and more. How long can I hold out? ....</p><p>Every 5 seconds a new ghost appears, every 10 seconds - a new bat.</p><p>Hero controlled by keyboard keys <img src="img/wasd.png" alt="controls"> or control buttons (for sensory devices).</p></div>';

    function addContent() {
        let navigation = document.getElementById('navigation');
        navigation.addEventListener('click', (ev)=> {
            if (ev.target.tagName !== 'BUTTON') {
                return false;
            } else {
                switch(ev.target.id) {
                    case 'about':
                        content.innerHTML = '';
                        content.innerHTML = '<div id="intro"><p>It was a bad idea to go through the cemetery at night. With every second of the enemies become more and more. How long can I hold out? ....</p><p>Every 5 seconds a new ghost appears, every 10 seconds - a new bat.</p><p>Hero controlled by keyboard keys <img src="img/wasd.png" alt="controls"> or control buttons (for sensory devices).</p></div>';
                        break;
                    case 'bestPlayers':
                        content.innerHTML = '';
                        addListPlayers();
                        break;
                }
            }
        })
    }

    function addListPlayers() {
        if (!localStorage.getItem('best')) return false;
        let data = JSON.parse(localStorage.getItem('best'));
        let playerList = document.createElement('ul');
        let ulContent = ``;
        playerList.id = 'best10';
        content.appendChild(playerList);
        for (let i = 0; i < data.length; i++) {
            ulContent += `<li>${data[i].name}<span>${data[i].count}</span></li>`;
        }
        playerList.innerHTML = ulContent;
    }

    addContent();

    function recordingGame() {
        setInterval(()=> {
            if (paused) {
                return false;
            }
            recordGameArr[0].x.push(hero.x);
            recordGameArr[0].y.push(hero.y);
            recordGameArr[0].dx.push(hero.dx);
            recordGameArr[0].dy.push(hero.dy);
            for (let i = 0; i < enemiesArr.length; i++) {
                recordGameArr[i+1].x.push(enemiesArr[i].x);
                recordGameArr[i+1].y.push(enemiesArr[i].y);
                recordGameArr[i+1].dx.push(enemiesArr[i].dx);
                recordGameArr[i+1].dy.push(enemiesArr[i].dy);
            }
        }, 30);
    }

    recordingGame();
}

/**
 * @return {boolean}
 */
function RECORD() {
    let recordInterval;
    // let componentArr = [];

    if (!localStorage.getItem('record')) {
        alert('Record game does not exist');
        return false;
    }

    recordGameArr = JSON.parse(localStorage.getItem('record'));

    duration = recordGameArr[0].x.length;

    class myGame {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.img = new Image();  // Создание нового объекта изображения
            this.img.src = 'img/grass.png';
            this.init();
        }

        init() {
            myGame.addButton();
            this.canvas.width = document.documentElement.clientWidth;
            this.canvas.height = document.documentElement.clientHeight;
            this.context = this.canvas.getContext('2d');
            this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
        }

        static addButton() {
            document.getElementsByTagName('body')[0].innerHTML += '<a id="back" href=""><img src="img/back.png" alt="menu"></a>'
        }

    }

    let gameRecord = new myGame();

    class RecordComponent {
        constructor(width, height, src, frame, x, y) {
            this.ctx = gameRecord.context;
            this.width = width;
            this.height = height;
            this.frames = frame;
            this.image = new Image();
            this.image.src = src;
            this.currentFrame = 0;
            this.currentIndex = 0;
            this.x = x;
            this.y = y;
        }

        action(parameters) {
            let {x, y, dx, dy} = parameters;
            this.x = x;
            this.y = y;
            // if (this.x >= gameRecord.canvas.width) {
            //     this.x = 1;
            // }
            // if (this.y >= gameRecord.canvas.height) {
            //     this.y = 1;
            // }
            // if (this.x <= 0) {
            //     this.x = gameRecord.canvas.width;
            // }
            // if (this.y <= 0) {
            //     this.y = gameRecord.canvas.height;
            // }
            // this.drawImg(dx, dy);
            if (dx === 0 && dy === 0) {
                this.ctx.drawImage(this.image, 0, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);
                return;
            }

            if (dx === 0 && dy > 0) {
                this.currentIndex = 0;
            } else if ((dx < 0 && dy <= 0) || (dx < 0 && dy > 0)) {
                this.currentIndex = 1;
            } else if (dx === 0 && dy < 0) {
                this.currentIndex = 2;
            } else if ((dx > 0 && dy <= 0) || (dx > 0 && dy > 0)) {
                this.currentIndex = 3;
            }

            this.ctx.drawImage(this.image, this.width * this.currentFrame, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);

            if (this.currentFrame === this.frames - 1) {
                this.currentFrame = 0;
            } else {
                this.currentFrame++;
            }
        }

        // drawImg(parameters) {
        //
            // if (dx === 0 && dy === 0) {
            //     this.ctx.drawImage(this.image, 0, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);
            //     return;
            // }
            //
            // if (dx === 0 && dy > 0) {
            //     this.currentIndex = 0;
            // } else if ((dx < 0 && dy <= 0) || (dx < 0 && dy > 0)) {
            //     this.currentIndex = 1;
            // } else if (dx === 0 && dy < 0) {
            //     this.currentIndex = 2;
            // } else if ((dx > 0 && dy <= 0) || (dx > 0 && dy > 0)) {
            //     this.currentIndex = 3;
            // }
            //
            // this.ctx.drawImage(this.image, this.width * this.currentFrame, this.height * this.currentIndex, this.width, this.height, this.x, this.y, this.width, this.height);
            //
            // if (this.currentFrame === this.frames - 1) {
            //     this.currentFrame = 0;
            // } else {
            //     this.currentFrame++;
            // }
        // }
    }

    for (let i = 0; i < recordGameArr.length; i++) {
        console.log('ok');
        let arr = [];
        let xLength = recordGameArr[i].x.length;
        arr.length = duration - xLength;
        recordGameArr[i].x = arr.concat(recordGameArr[i].x);
        recordGameArr[i].y = arr.concat(recordGameArr[i].y);
        recordGameArr[i].dx = arr.concat(recordGameArr[i].dx);
        recordGameArr[i].dy = arr.concat(recordGameArr[i].dy);
        let width = recordGameArr[i].width;
        let height = recordGameArr[i].height;
        let src = recordGameArr[i].src;
        let frame = recordGameArr[i].frame;
        let x = recordGameArr[i].x[0];
        let y = recordGameArr[i].y[0];
        componentArr.push(new RecordComponent(width, height, src, frame, x, y));
    }

    recordInterval = setInterval(() => {
        if (tick > duration) {
            clearInterval(recordInterval);
            alert('Record is end');
        }
        gameRecord.clear();
        for (let i = 0; i < recordGameArr.length; i++) {
            // let width = recordGameArr[i].width;
            // let height = recordGameArr[i].height;
            // let src = recordGameArr[i].src;
            // let frame = recordGameArr[i].frame;
            let x = recordGameArr[i].x[tick];
            let y = recordGameArr[i].y[tick];
            let dx = recordGameArr[i].dx[tick];
            let dy = recordGameArr[i].dy[tick];

            componentArr[i].action({x: x, y: y, dx: dx, dy: dy});
        }
        tick++;
    }, 30);
}






