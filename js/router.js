let routs = [
    {
        name: '',
        match: '',
        onEnter: () => {
            document.getElementsByTagName('body')[0].innerHTML = '';
            tick = 0;
            recordGameArr = [{
                width: 32,
                height: 50,
                src: 'img/hero.png',
                frame: 9,
                x: [],
                y: [],
                dx: [],
                dy: []
            }];
            START();
        }
    },
    {
        name: 'record',
        match: 'record',
        onEnter: () => {
            document.getElementsByTagName('body')[0].innerHTML = '';
            tick = 0;
            RECORD();
        }
    }
];

function Router(routs) {

    //обработчик URL
    function handleUrl(url) {

        // let curentURL = url;
        // if(!curentURL.includes('#')) {
        //     curentURL += '#game';
        //     window.location.href += '#game';
        // }

        let curentRout = findRout(url);

        curentRout.onEnter();

    }

    function findRout(url) {
        if (!url.includes('#')) {
            url = '';
        } else {
            url = url.split('#').pop();
        }
        console.log(url);
        return routs.find((rout) => {
            if (typeof rout.match === 'string') {
                return rout.match === url;
            }
            if (rout.match instanceof RegExp) {
                return rout.match.test(url);
            }
            if (typeof rout.match === 'function') {
                return rout.match(url);
            }
        });
    }

    // Подписаться на изменения URL
    window.addEventListener('hashchange', (ev) => handleUrl(ev.newURL));

    // При загрузке страницы - считать состояние и запустить обработчик
    handleUrl(window.location.href);

    // Переопределить поведение внутренних ссылок
    document.body.addEventListener('click', (ev) => {
        if(!ev.target.matches('a')) {
            return;
        }
        ev.preventDefault();
        // При клике по ссылке - обновлять URL
        window.location.hash = ev.target.getAttribute('href');
    });
}

Router(routs);