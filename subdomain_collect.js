// ==UserScript==
// @name         SecurityTrails Subdomains Fetcher
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Получение поддоменов с сайта SecurityTrails с улучшенным интерфейсом и функционалом
// @author       You
// @match        https://securitytrails.com/list/apex_domain/*
// @grant        none
// ==/UserScript==

(function() {
    const apexDomain = location.pathname.split('/').pop();

    const style = document.createElement('style');
    style.textContent = `
        ::-webkit-scrollbar { display: none; }
        body { overflow: hidden; padding: 0; margin: 0; }
        .fetcher-wrapper {
            font-family: system-ui, sans-serif;
            position: fixed; top: 0; left: 0;
            display: flex; align-items: center; justify-content: center;
            height: 100%; width: 100%; background: rgba(0,0,0,.5); z-index: 99999;
        }
        .fetcher-modal {
            width: 400px; padding: 20px; background: linear-gradient(180deg, #28313A, #1D2428);
            color: #fff; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,.3);
            display: flex; flex-direction: column; gap: 10px;
        }
        .fetcher-modal input, .fetcher-modal select, .fetcher-modal button {
            padding: 8px; border-radius: 4px; border: none;
        }
        .fetcher-modal button { cursor: pointer; }
        .log {
            max-height: 100px; overflow: auto; font-size: 12px; background: #1a1f23; padding: 8px; border-radius: 4px;
        }
    `;

    document.head.appendChild(style);

    document.body.insertAdjacentHTML('afterbegin', `
        <div class="fetcher-wrapper">
            <div class="fetcher-modal">
                <input id="startPage" type="number" placeholder="Начальная страница">
                <input id="endPage" type="number" placeholder="Конечная страница">
                <select id="format">
                    <option value="txt">TXT</option>
                    <option value="json">JSON</option>
                </select>
                <button id="startBtn">Старт</button>
                <button id="pauseBtn" disabled>Пауза</button>
                <button id="downloadBtn" disabled>Скачать</button>
                <div class="log" id="log"></div>
            </div>
        </div>
    `);

    let subdomains = [];
    let paused = false;
    let currentPage;
    let endPage;

    const log = (msg) => {
        const logContainer = document.getElementById('log');
        logContainer.innerHTML += msg + '<br>';
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const randomDelay = () => Math.floor(Math.random() * 4000) + 2000;

    async function fetchPage(page) {
        const response = await fetch(`https://securitytrails.com/list/apex_domain/${apexDomain}?page=${page}`, {
            headers: { 'accept': 'text/html', 'x-requested-with': 'XMLHttpRequest' },
            credentials: 'include'
        });

        if (response.status !== 200) {
            log(`Ошибка загрузки страницы ${page}: ${response.status}`);
            return;
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('table.ui-table tbody tr td:first-child a');

        links.forEach(link => subdomains.push(link.textContent.trim()));

        log(`Обработана страница ${page}`);
    }

    async function fetchSubdomains() {
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('downloadBtn').disabled = true;

        while (currentPage <= endPage && !paused) {
            await fetchPage(currentPage);
            currentPage++;
            await sleep(randomDelay());
        }

        if (currentPage > endPage) {
            log('Готово! Можно скачать.');
            document.getElementById('downloadBtn').disabled = false;
        }

        document.getElementById('pauseBtn').disabled = true;
    }

    document.getElementById('startBtn').onclick = () => {
        if (!paused) {
            subdomains = [];
            currentPage = parseInt(document.getElementById('startPage').value);
            endPage = parseInt(document.getElementById('endPage').value);
            if (!currentPage || !endPage || currentPage > endPage) return alert('Введите корректный диапазон страниц');
        }
        paused = false;
        fetchSubdomains();
    };

    document.getElementById('pauseBtn').onclick = () => {
        paused = true;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').textContent = 'Продолжить';
        log('Пауза.');
        document.getElementById('downloadBtn').disabled = false;
    };

    document.getElementById('downloadBtn').onclick = () => {
        const format = document.getElementById('format').value;
        const dataStr = format === 'json' ? JSON.stringify(subdomains, null, 2) : subdomains.join('\n');

        const blob = new Blob([dataStr], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${apexDomain}_subdomains.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        log('Файл скачан.');
    };
})();
