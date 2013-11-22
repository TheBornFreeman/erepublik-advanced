var bg = {
    runPattern: /^http:\/\/(www|economy|static)\.erepublik\.com/i,
    healthyEraKeyPattern: /^[0-9]+\.[a-z]+$/i,
    corruptedEraKeyPattern: /^undefined\.[a-z]+$/i,
    systemKeyPattern: /^sys\./i,
    storageNames: ['www.erepublik.com', 'economy.erepublik.com'],
    chrome: null,

    images: [
        'mainImg',
        'mainImgOn',
        'linksHeader',
        'infoImg',
        'infoImgHover',
        'loadingBackImg',
        'iconOffer',
        'neIcon',
        'sideBoxes',
        'militaryEventsIcons',
        'greyButtonImg',
        'greyButtonArrowUp',
        'blueButtonArrowUp',
        'subsIcon',
        'dailyTrackerBack',
        'mercBarIcon',
        'mercBarProgressImg',
        'mercBarBgImg',
        'mercCheckImg',
        'mercCheckImgSmall',
        'mercTankImg',
        'progressBarImg',
        'allCompanies',
        'allRaw',
        'allFactories',
    ],

    keyIsEra: function(key) {
        return bg.healthyEraKeyPattern.test(key) || bg.corruptedEraKeyPattern.test(key);
    },

    getEraStoragePairs: function() {
        var tmp = {};
        for (var key in (bg.chrome ? localStorage : ss.storage)) bg.healthyEraKeyPattern.test(key) && (tmp[key] = (bg.chrome ? localStorage.getItem(key) : ss.storage[key]));
        return tmp;
    },

    deleteAlienPairs: function() {
        for (var key in (bg.chrome ? localStorage : ss.storage)) !bg.systemKeyPattern.test(key) && !bg.keyIsEra(key) && (bg.chrome ? localStorage.removeItem(key) : delete ss.storage[key]);
    },

    cleanStorage: function() {
        for (var key in (bg.chrome ? localStorage : ss.storage)) bg.corruptedEraKeyPattern.test(key) && (bg.chrome ? localStorage.removeItem(key) : delete ss.storage[key]);
    },

    syncStorageUp: function(data, domain) {
        if (bg.chrome) {
            var toReset = localStorage.getItem('sys.toReset');
            toReset === null ? toReset = {} : typeof (toReset = JSON.parse(toReset)) != 'object' && (toReset = {});
        } else {
            var toReset = {};
            ss.storage.hasOwnProperty('sys.toReset') && typeof (toReset = JSON.parse(ss.storage['sys.toReset'])) != 'object' && (toReset = {});
        }

        if (toReset.hasOwnProperty(domain)) {
            delete toReset[domain];
            bg.chrome ? localStorage.setItem('sys.toReset', JSON.stringify(toReset)) : (ss.storage['sys.toReset'] = JSON.stringify(toReset));
            return;
        }

        for (var i in data) {
            if (bg.healthyEraKeyPattern.test(i) && (bg.chrome ? localStorage.getItem(i) === null : !ss.storage.hasOwnProperty(i))) {
                bg.chrome ? localStorage.setItem(i, data[i]) : (ss.storage[i] = data[i]);
            }
        }
    },

    syncStorageDown: function(callback) {
        callback(JSON.stringify(bg.getEraStoragePairs()));
    },

    deleteFromStorage: function(key) {
        !bg.systemKeyPattern.test(key) && (bg.chrome ? localStorage.removeItem(key) : delete ss.storage[key]);
    },

    setToStorage: function(key, value) {
        bg.healthyEraKeyPattern.test(key) && (bg.chrome ? localStorage.setItem(key, value) : (ss.storage[key] = value));
    },

    xhrGET: function(url, callback) {
        if (bg.chrome) {
            $.get(url, function(data) {
                callback(data);
            });
        } else {
            request({
                url: url,
                onComplete: function (response) {
                    callback(response.text);
                }
            }).get();
        }
    },

    xhrPOST: function(url, data, callback) {
        if (bg.chrome) {
            $.post(url, data, function(data) {
                callback(data);
            });
        } else {
            request({
                url: url,
                content: data,
                onComplete: function (response) {
                    callback(response.text);
                }
            }).post();
        }
    },

    resetStorage: function(domain) {
        if (bg.chrome) {
            var toReset = localStorage.getItem('sys.toReset');
            toReset === null ? toReset = {} : typeof (toReset = JSON.parse(toReset)) != 'object' && (toReset = {});
        } else {
            var toReset = {};
            ss.storage.hasOwnProperty('sys.toReset') && typeof (toReset = JSON.parse(ss.storage['sys.toReset'])) != 'object' && (toReset = {});
        }

        for (var i in bg.storageNames) bg.storageNames[i] != domain && (toReset[bg.storageNames[i]] = true);
        bg.chrome ? localStorage.setItem('sys.toReset', JSON.stringify(toReset)) : (ss.storage['sys.toReset'] = JSON.stringify(toReset));
        for (var key in (bg.chrome ? localStorage : ss.storage)) !bg.systemKeyPattern.test(key) && (bg.chrome ? localStorage.removeItem(key) : delete ss.storage[key]);
    }
};

bg.chrome = this.hasOwnProperty('chrome');

if (!bg.chrome) {
    var ss = require("sdk/simple-storage"),
        request = require("sdk/request").Request,
        pageMod = require("sdk/page-mod"),
        self = require("sdk/self");
}

bg.deleteAlienPairs();
bg.cleanStorage();

if (bg.chrome) {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        bg.runPattern.test(tab.url) && chrome.pageAction.show(tabId);
    });

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.action) {
            case 'syncStorageUp': bg.syncStorageUp(JSON.parse(request.data), request.domain); sendResponse(); break;
            case 'syncStorageDown': bg.syncStorageDown(sendResponse); break;
            case 'deleteFromStorage': bg.deleteFromStorage(request.key); sendResponse(); break;
            case 'setToStorage': bg.setToStorage(request.key, request.value); sendResponse(); break;
            case 'xhrGET': bg.xhrGET(request.url, sendResponse); break;
            case 'xhrPOST': bg.xhrPOST(request.url, JSON.parse(request.data), sendResponse); break;
            case 'resetStorage': bg.resetStorage(request.domain); sendResponse(); break;
        }

        return true;
    });
} else {
    pageMod.PageMod({
        include: ["http://www.erepublik.com/*", "http://economy.erepublik.com/*", "http://static.erepublik.com/*"],
        contentScriptFile: [self.data.url("jquery-2.0.3.min.js"), self.data.url("numeral.min.js"), self.data.url("era.js")],
        contentScriptOptions: {database: JSON.parse(self.data.load('json/db.json'))},
        onAttach: function (worker) {
            worker.port.on('syncStorageUp', function (request) {
                bg.syncStorageUp(JSON.parse(request.data), request.domain);
                worker.port.emit('syncStorageUpDone');
            });

            worker.port.on('syncStorageDown', function () {
                bg.syncStorageDown(function (data) {
                    worker.port.emit('syncStorageDownDone', data);
                });
            });

            worker.port.on('setToStorage', function (request) {
                bg.setToStorage(request.key, request.value);
            });

            worker.port.on('xhrGET', function (request) {
                bg.xhrGET(request.url, function (data) {
                    worker.port.emit('xhrGETDone' + request.url, data);
                });
            });

            worker.port.on('xhrPOST', function (request) {
                bg.xhrPOST(request.url, JSON.parse(request.data), function (data) {
                    worker.port.emit('xhrPOSTDone' + request.url, data);
                });
            });

            worker.port.on('resetStorage', function (request) {
                bg.resetStorage(request.domain);
            });

            worker.port.on('getUrls', function () {
                var data = {}, i;

                for (i in bg.images) {
                    data['img/' + bg.images[i] + '.png'] = self.data.url('img/' + bg.images[i] + '.png');
                }

                worker.port.emit('getUrlsDone', data);
            });
        }
    });
}
