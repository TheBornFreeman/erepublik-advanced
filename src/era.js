/**
 * @namespace eRepublik Advanced
 */
var era = {

    version: '4.2.7dev',
    releaseDate: '17. Nov 2013.',

    /**
    * Recognized ID in the host system.
    * If this is not right then we can't run.
    */
    characterId: null,

    /**
    * Level of the character.
    * NaN if character is an Organization.
    */
    characterLevel: null,

    /**
    * The character's national currency.
    */
    characterCurrency: null,

    characterMoney: null,

    /**
    * Don't trust it.
    */
    characterCitizenshipId: null,

    /**
    * The host interface's language.
    */
    hostLang: null,

    /**
    * Day of the New World.
    */
    erepDay: null,

    settings: null,

    healthyKeyPattern: /^[0-9]+\.[a-z]+$/i,

    corruptedKeyPattern: /^undefined\.[a-z]+$/i,

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

    database: [
        'country_id',
        'id_country',
        'id_countryName',
        'countryName_id',
        'country_currency',
        'currency_country',
        'threshold_id',
        'region_link',
    ],

    chrome: typeof chrome == 'object',

    keyIsOurs: function(key) {
        return era.healthyKeyPattern.test(key) || era.corruptedKeyPattern.test(key);
    },

    /**
     * Chrome only.
     */
    getOurStoragePairs: function() {
        var tmp = {};
        for (var key in localStorage) era.keyIsOurs(key) && (tmp[key] = localStorage.getItem(key));
        return tmp;
    },

    styleContainer: '',

    addStyle: function(css) {
        era.styleContainer += css;
    },

    renderStyle: function() {
        $('head').append($('<style>').text(era.styleContainer));
    },

    /**
     * Provides storage related stuff.
     */
    storage: {

        /**
         * Stores last read values in memory.
         */
        cache: {},

        init: function() {
            era.storage.maintainer();
            $(document).bind('maintainYourValues', era.storage.maintainer);
        },
        
        /**
         * Get accessor.
         *
         * The values in the storage are in JSON format. It's transparent
         * from above.
         *
         * @example
         * // 7823468.SomeValue
         * era.storage.get('SomeValue');
         * 
         * @param {String} dataKey Only after the period.
         * @param [defaultValue] This will be returned if no value found.
         * @returns The requested value or the defaultValue param.
         */
        get: function(dataKey, defaultValue) {
            var cache = localStorage.getItem(era.characterId + '.' + dataKey);
            if (cache === null) return era.storage.cache[dataKey] = defaultValue;

            return era.storage.cache[dataKey] = 'string' == typeof cache ? JSON.parse(cache) : cache;
        },
        
        /**
         * Set accessor.
         *
         * @example
         * // 7823468.SomeValue
         * var someValue = 142;
         * era.storage.set('SomeValue', someValue);
         *
         * @param {String} dataKey Only after the period.
         * @param value The value to be set.
         * @returns undefined
         */
        set: function(dataKey, value) {
            var key = era.characterId + '.' + dataKey;
            value = JSON.stringify(value);

            if (!era.chrome) {
                self.port.emit('setToStorage', {'key': key, 'value': value});
            } else {
                chrome.extension.sendMessage({'action': 'setToStorage', 'key': key, 'value': value});
            }

            return localStorage.setItem(key, value);
        },
        
        /**
         * Maintains the storage data's integrity to always work
         * with a valid and up to date data.
         */
        maintainer: function() {
            for (var key in localStorage) era.corruptedKeyPattern.test(key) && localStorage.removeItem(key);
        },

        reset: function() {
            if (!era.chrome) {
                self.port.emit('resetStorage', {'domain': document.domain});
            } else {
                chrome.extension.sendMessage({'action': 'resetStorage', 'domain': document.domain});
            }

            for (var key in localStorage) era.keyIsOurs(key) && localStorage.removeItem(key);
        }

    },

    ajax: {

        get: function(url, callback) {
            if (!era.chrome) {
                self.port.once('xhrGETDone' + url, function(response) {
                    callback(response);
                });

                self.port.emit('xhrGET', {'url': url});
            } else {
                chrome.extension.sendMessage({'action': 'xhrGET', 'url': url}, function(data) {
                    callback(data);
                });
            }
        },

        post: function(url, data, callback) {
            var toQueryString = function(o) {
                if (typeof o != 'object') return '';
                var tmp = [];
                for (var i in o) tmp.push(encodeURIComponent(i) + '=' + encodeURIComponent(o[i]));
                return tmp.join('&');
            };

            if (!era.chrome) {
                self.port.once('xhrPOSTDone' + url, function(response) {
                    callback(response);
                });

                self.port.emit('xhrPOST', {'url': url, 'data': JSON.stringify(data)});
            } else {
                chrome.extension.sendMessage({'action': 'xhrPOST', 'url': url, 'data': JSON.stringify(data)}, function(data) {
                    callback(data);
                });
            }
        }

    },

    options: {

        init: function() {
            era.options.storage.maintainer();
            $(document).bind('maintainYourValues', era.options.storage.maintainer);
        },

        renderButton: function() {
            era.addStyle(
                '.infoHolder { background: url(' + infoImg + ') no-repeat scroll 0px 0px transparent; height: 12px; width: 12px; display: inline; float: left; margin-left: 2px; margin-top: -34px; cursor: pointer; }' +
                '.infoHolder:hover { background: url(' + infoImgHover + ') no-repeat scroll 0px 0px transparent; }' +
                '.infoHolder .infoContent { box-shadow: 0px 0px 5px #9F9F9F; border-radius: 7px 7px 7px 7px; background: url(' + loadingBackImg + ') repeat scroll 0 0 transparent; display: none; height: 310px; position: fixed; margin: -155px -150px; width: 300px; z-index: 999999; top: 50%; left: 50%; font-size: 11px; }' +
                '.infoHolder:hover .infoContent { display: inline; z-index: 9999; }' +
                '.infoHolder:hover .infoContent table tr td { padding: 5px 10px 5px 10px; }' +

                '#optionsHolder { float: left; width: 149px; margin: 15px 3px 0 3px; padding: 10px; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.9); background-color: #f0efef; background-color: rgba(233,233,233,0.8); z-index: 10; box-shadow: 0px 0px 7px rgba(230,230,230,0.9); }' +
                '#optionsHolder .optionsContent { height: 35px; border-radius: 3px 3px 3px 3px; background: url(' + mainImg + ') no-repeat scroll 0 0 transparent; width: 149px; line-height: 35px; cursor: pointer; }' +
                '#optionsHolder .optionsContent:hover { background: url(' + mainImgOn + ') no-repeat scroll 0 0 transparent; }' +
                '#optionsHolder .versionHolder { color: #EDF4F9; cursor: default; font-size: 9px; font-weight: bold; margin-right: 98px; margin-top: -12px; padding: 0 0 2px; text-align: center; }'
            );

            $('#large_sidebar').append(
                $('<div>', {id: 'optionsHolder'}).append(
                    $('<div>', {id: 'optionsContent', class: 'optionsContent'}),
                    $('<div>', {class: 'versionHolder', text: 'v ' + era.version}),
                    $('<span>', {class: 'infoHolder'}).append(
                        $('<div>', {class: 'infoContent'}).append(
                            $('<span>', {class: 'menuWindowHeader'}),
                            $('<table>', {border: '0', cellspacing: '5px', cellpadding: '5px'}).append(
                                $('<tr>').append($('<td>').text('Founder: ').append($('<strong>').text('Roktaal'))),
                                $('<tr>').append($('<td>').text('Developer: ').append($('<strong>').text('frimen'))),
                                $('<tr>').append($('<td>').text('Version: ').append($('<strong>').text('v' + era.version))),
                                $('<tr>').append($('<td>').text('Release date: ').append($('<strong>').text(era.releaseDate))),
                                $('<tr>').append($('<td>').text('Special thanks to: ').append($('<strong>').text('SJeB, Veljkokg, nolf, ziloslav, Brdar Dragan, drcika, Boolee, Denis Cicic, hapf, Leroy Combs, Basowy, ThomasRed, RatePV and many others.'))),
                                $('<tr>').append($('<td>', {align: 'center'}).append($('<i>').text("Software is provided 'AS IS' and without any warranty. Use on your own responsibility.")))
                            )
                        )
                    )
                )
            );
        },

        renderOptions: function(options) {                
            if($('#optionsContentMain').length == 0) {
                $('body').append('<div id="optionsContentMain" class="optionsContentMain">' +
                                    '<div class="optionsInnerHeader">' +
                                        '<a id="optionsInnerClose" class="closeButton" title="Close" href="javascript:;">&nbsp;</a>' +
                                    '</div>' +
                                    '<div class="optionsInnerContent">' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Market tools </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="market" type="checkbox" id="opt2" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Automatic search redirection </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="search" type="checkbox" id="opt3" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Battlefield improvements </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="battlefield" type="checkbox" id="opt4" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Sidebar improvements </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="sidebar" type="checkbox" id="opt5" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Profile page improvements </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="profile" type="checkbox" id="opt6" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Elections page improvements </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="elections" type="checkbox" id="opt7" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Inventory improvements </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="inventory" type="checkbox" id="opt8" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Tax table on inventory page </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="taxes" type="checkbox" id="opt9" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Newspaper tools </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="news" type="checkbox" id="opt12" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Military events on main page </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="milevents" type="checkbox" id="opt14" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Remove news categories </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="removecat" type="checkbox" id="opt15" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Subscriptions icon on sidebar </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="subs" type="checkbox" id="opt16" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem">' +
                                            '<div class="optionsInnerItemLabel">Daily order tracker </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="dotrack" type="checkbox" id="opt17" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItemRight">' +
                                            '<div class="optionsInnerItemLabel">Monetary market tools </div>' +
                                            '<div style="float: left; line-height: 20px; margin-right: 10px;">' +
                                                '<input desc="mmarket" type="checkbox" id="opt18" style="margin-top: 7px; cursor: pointer;">' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem" style="text-align: center; float: none; width: 100%;">' +
                                            '<div id="customQuickLinks" class="optionsInnerItemLabel_QuickLinks">Custom quick links</div>' +
                                        '</div>' +
                                        '<div class="optionsInnerItem" style="text-align: center; float: none; width: 100%;">' +
                                            '<div id="resetSettings" class="optionsInnerItemLabel_QuickLinks">Reset settings and data</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="optionsInnerVersion">v' + era.version + '</div>' +
                                    '<div class="optionsInnerFooter">Note: After you change these settings reload current page in order for settings to take effect.</div>' +
                                '</div>');
                
                $('#optionsContentMain').css('display', 'block');
                
                $(document).on('click', '#optionsInnerClose', function(e) {
                    e.stopPropagation();
                    $('#optionsContentMain').remove();
                });
                
                $('input[id*="opt"]').each(function() {
                    var optName = $(this).attr('desc');
                    if (options[optName] == null) {
                        if (optName == 'removecat') {
                            options[optName] = false;
                            era.storage.set('Options', options);
                            $(this).prop('checked', false);
                        } else {
                            options[optName] = true;
                            era.storage.set('Options', options);
                            $(this).prop('checked', true);
                        }
                    } else {
                        $(this).prop('checked', options[optName]);
                    }
                    $(this).change(function() {
                        options[optName] = Boolean($(this).prop('checked'));
                        era.storage.set('Options', options);
                    });
                });
                
                $('#resetSettings').click(function() {
                    confirm('You are about to reset all settings and data. Are you sure?') && era.storage.reset();
                });
                
                $('#customQuickLinks').click(function() {
                    $('#menuWindow').length && $('#menuWindow').remove();
                    $('#optionsContentMain').remove();

                    $('#content').append(
                        $('<div>', {id: 'menuWindow', class: 'menuWindow'}).append(
                            $('<span>', {class: 'menuWindowHeader'}).append($('<a>', {id: 'windowClose', class: 'closeButton', title: 'Close', href: '#'})),
                            $('<span>', {class: 'menuWindowContent'}).append(
                                $('<div>').append(
                                    $('<div>', {style: 'background-color: #666666; color: #e2e2e2; padding: 2px;', text: ' Custom links at the top of page'}).prepend(
                                        $('<input/>', {desc: 'menu1', type: 'checkbox', id: 'opt6_1', style: 'margin-bottom: 2px; margin-left: 2px; vertical-align: middle;'})
                                    )
                                ),
                                $('<div>', {class: 'menuWindowContentTable'})
                                .append(
                                    $('<div>', {class: 'menuWindowContentRow'}).append(
                                        $('<div>', {class: 'menuWindowContentCell'}),
                                        $('<div>', {class: 'menuWindowContentCell'}).text('Title'),
                                        $('<div>', {class: 'menuWindowContentCell'}).text('Link'),
                                        $('<div>', {class: 'menuWindowContentCell'})
                                    )
                                )
                                .append(
                                    function(index, html) {
                                        var elements = [];

                                        for (var i = 1; i < 9; i++) {
                                            elements.push(
                                                $('<div>', {class: 'menuWindowContentRow'}).append(
                                                    $('<div>', {class: 'menuWindowContentCell'}).text(i),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuTopTitle_' + i, type: 'text', style: 'width: 320px;'})),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuTopLink_' + i, type: 'text', style: 'width: 320px;'})),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuTopTarget_' + i, type: 'checkbox', title: 'Open link in new tab?'}))
                                                )
                                            );
                                        };

                                        return elements;
                                    }
                                )
                                .append(
                                    $('<div>', {class: 'menuWindowContentRow'}).append(
                                        $('<div>', {class: 'menuWindowContentCell'}),
                                        $('<div>', {class: 'menuWindowContentCell'}),
                                        $('<div>', {class: 'menuWindowContentCell'}),
                                        $('<div>', {class: 'menuWindowContentCell'})
                                    )
                                ),
                                $('<div>').append(
                                    $('<div>', {style: 'background-color: #666666; color: #e2e2e2; margin-top: 5px; padding: 2px;', text: ' Custom links below main menu'}).prepend(
                                        $('<input/>', {desc: 'menu2', type: 'checkbox', id: 'opt6_2', style: 'margin-bottom: 2px; margin-left: 2px; vertical-align: middle;'})
                                    )
                                ),
                                $('<div>', {class: 'menuWindowContentTable'})
                                .append(
                                    $('<div>', {class: 'menuWindowContentRow'}).append(
                                        $('<div>', {class: 'menuWindowContentCell'}),
                                        $('<div>', {class: 'menuWindowContentCell'}).text('Title'),
                                        $('<div>', {class: 'menuWindowContentCell'}).text('Link'),
                                        $('<div>', {class: 'menuWindowContentCell'})
                                    )
                                )
                                .append(
                                    function(index, html) {
                                        var elements = [];

                                        for (var i = 1; i < 9; i++) {
                                            elements.push(
                                                $('<div>', {class: 'menuWindowContentRow'}).append(
                                                    $('<div>', {class: 'menuWindowContentCell'}).text(i),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuTitle_' + i, type: 'text', style: 'width: 320px;'})),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuLink_' + i, type: 'text', style: 'width: 320px;'})),
                                                    $('<div>', {class: 'menuWindowContentCell'}).append($('<input/>', {id: 'menuTarget_' + i, type: 'checkbox', title: 'Open link in new tab?'}))
                                                )
                                            );
                                        };

                                        return elements;
                                    }
                                )
                            )
                        )
                    );

                    var menu = era.storage.get('Menu');
                    
                    $('#menuTitle_1').val(menu['menu1'].title);
                    $('#menuLink_1').val(menu['menu1'].lnk);
                    $('#menuTarget_1').prop('checked', menu['menu1'].target == null ? false : menu['menu1'].target);
                    $('#menuTitle_2').val(menu['menu2'].title);
                    $('#menuLink_2').val(menu['menu2'].lnk);
                    $('#menuTarget_2').prop('checked', menu['menu2'].target == null ? false : menu['menu2'].target);
                    $('#menuTitle_3').val(menu['menu3'].title);
                    $('#menuLink_3').val(menu['menu3'].lnk);
                    $('#menuTarget_3').prop('checked', menu['menu3'].target == null ? false : menu['menu3'].target);
                    $('#menuTitle_4').val(menu['menu4'].title);
                    $('#menuLink_4').val(menu['menu4'].lnk);
                    $('#menuTarget_4').prop('checked', menu['menu4'].target == null ? false : menu['menu4'].target);
                    $('#menuTitle_5').val(menu['menu5'].title);
                    $('#menuLink_5').val(menu['menu5'].lnk);
                    $('#menuTarget_5').prop('checked', menu['menu5'].target == null ? false : menu['menu5'].target);
                    $('#menuTitle_6').val(menu['menu6'].title);
                    $('#menuLink_6').val(menu['menu6'].lnk);
                    $('#menuTarget_6').prop('checked', menu['menu6'].target == null ? false : menu['menu6'].target);
                    $('#menuTitle_7').val(menu['menu7'].title);
                    $('#menuLink_7').val(menu['menu7'].lnk);
                    $('#menuTarget_7').prop('checked', menu['menu7'].target == null ? false : menu['menu7'].target);
                    $('#menuTitle_8').val(menu['menu8'].title);
                    $('#menuLink_8').val(menu['menu8'].lnk);
                    $('#menuTarget_8').prop('checked', menu['menu8'].target == null ? false : menu['menu8'].target);
                    
                    $('#menuTopTitle_1').val(menu['menutop1'].title);
                    $('#menuTopLink_1').val(menu['menutop1'].lnk);
                    $('#menuTopTarget_1').prop('checked', menu['menutop1'].target == null ? false : menu['menutop1'].target);
                    $('#menuTopTitle_2').val(menu['menutop2'].title);
                    $('#menuTopLink_2').val(menu['menutop2'].lnk);
                    $('#menuTopTarget_2').prop('checked', menu['menutop2'].target == null ? false : menu['menutop2'].target);
                    $('#menuTopTitle_3').val(menu['menutop3'].title);
                    $('#menuTopLink_3').val(menu['menutop3'].lnk);
                    $('#menuTopTarget_3').prop('checked', menu['menutop3'].target == null ? false : menu['menutop3'].target);
                    $('#menuTopTitle_4').val(menu['menutop4'].title);
                    $('#menuTopLink_4').val(menu['menutop4'].lnk);
                    $('#menuTopTarget_4').prop('checked', menu['menutop4'].target == null ? false : menu['menutop4'].target);
                    $('#menuTopTitle_5').val(menu['menutop5'].title);
                    $('#menuTopLink_5').val(menu['menutop5'].lnk);
                    $('#menuTopTarget_5').prop('checked', menu['menutop5'].target == null ? false : menu['menutop5'].target);
                    $('#menuTopTitle_6').val(menu['menutop6'].title);
                    $('#menuTopLink_6').val(menu['menutop6'].lnk);
                    $('#menuTopTarget_6').prop('checked', menu['menutop6'].target == null ? false : menu['menutop6'].target);
                    $('#menuTopTitle_7').val(menu['menutop7'].title);
                    $('#menuTopLink_7').val(menu['menutop7'].lnk);
                    $('#menuTopTarget_7').prop('checked', menu['menutop7'].target == null ? false : menu['menutop7'].target);
                    $('#menuTopTitle_8').val(menu['menutop8'].title);
                    $('#menuTopLink_8').val(menu['menutop8'].lnk);
                    $('#menuTopTarget_8').prop('checked', menu['menutop8'].target == null ? false : menu['menutop8'].target);
                    
                    $('input[id*="opt"]').each(function() {
                        var numbId = $(this).attr('id').replace('opt', '');
                        var optName = $(this).attr('desc');
                        if (options[optName] == null) {
                            options[optName] = true;
                            era.storage.set('Options', options);
                            $(this).prop('checked', true);
                        } else {
                            $(this).prop('checked', Boolean(options[optName]));
                        }
                        $(this).change(function() {
                            options[optName] = Boolean($(this).prop('checked'));
                            era.storage.set('Options', options);
                        });
                    });
                    
                    $('input[id*="menuTitle"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menu' + numbId].title = $(this).val();
                            era.storage.set('Menu', menu);

                        });
                    });
                    
                    $('input[id*="menuLink"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menu' + numbId].lnk = $(this).val();
                            era.storage.set('Menu', menu);
                        });
                    });
                    
                    $('input[id*="menuTarget"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menu' + numbId].target = Boolean($(this).prop('checked'));
                            era.storage.set('Menu', menu);
                        });
                    });
                    
                    $('input[id*="menuTopTitle"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menutop' + numbId].title = $(this).val();
                            era.storage.set('Menu', menu);
                        });
                    });
                    
                    $('input[id*="menuTopLink"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menutop' + numbId].lnk = $(this).val();
                            era.storage.set('Menu', menu);
                        });
                    });
                    
                    $('input[id*="menuTopTarget"]').each(function() {
                        var numbId = $(this).attr('id').split('_')[1];
                        $(this).change(function() {
                            menu['menutop' + numbId].target = Boolean($(this).prop('checked'));
                            era.storage.set('Menu', menu);
                        });
                    });
                    
                    $('#windowClose').click(function() {
                        $('#menuWindow').remove();
                    });
                        
                    $('#menuWindow').css('display', 'block');
                });
            } else {
                $('#optionsContentMain').remove();
            }
        },

        renderTwitter: function() {
            era.addStyle(
                '#optionsHolder .twitterHolder { float: left; margin-top: 3px; }' +
                '#optionsHolder .twitterHolder .btn { position: relative; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(white),to(#DEDEDE)); background-image: -moz-linear-gradient(top,white,#DEDEDE); background-image: -o-linear-gradient(top,white,#DEDEDE); background-image: -ms-linear-gradient(top,white,#DEDEDE); background-image: linear-gradient(top,white,#DEDEDE); border: #CCC solid 1px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; color: #333; -webkit-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none; cursor: pointer; overflow: hidden; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box; height: 20px; max-width: 100%; text-shadow: 0 1px 0 rgba(255, 255, 255, .5); display: inline-block; vertical-align: top; zoom: 1; font-family: \'Helvetica Neue\', Arial, sans-serif; font-size: 11px; font-style: normal; font-variant: normal; font-weight: bold; line-height: 18px; }' +
                '#optionsHolder .twitterHolder .btn:focus, .btn:hover, .btn:active { border-color: #BBB; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(#F8F8F8),to(#D9D9D9)); background-image: -moz-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -o-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -ms-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: linear-gradient(top,#F8F8F8,#D9D9D9); -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }' +
                '#optionsHolder .twitterHolder .btn .label { padding: 0 7px 0 22px; display: inline-block; vertical-align: top; zoom: 1; }' +
                '#optionsHolder .twitterHolder .btn i { position: absolute; top: 50%; left: 2px; margin-top: -6px; width: 16px; height: 12px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAoCAYAAABq13MpAAAGcklEQVRYw+2YXUyTVxjHz4vJLiZGd7MtXi2LkZtdELM7lyzOG7Nk2RJvl8iujBiNV2JcMA0fwqCFEGCAfJRC+SyltqWFgnwUlIKAWB3yOVrAttQWC1ZCOi6ePc8LL74tVD6ly2KTf87J6Tnv+3uf8zzP+WAAwEhMIj8h1MViEs0Jlqi+we5oJFjGCX3D9X+fmKTmq/f/rzkRlX5fzkmNPhLVqW2DQ1Ify9eFAZ8kafUsURMX+qCo1BYry3oILKcfmLQb2N3Wzqhk48xn6YbLuwJO1cQeydAvURkWONtk5UoGgKsaXRPWo3LarVHSJvkRmXHm+6pHV3h4YdDp0gE7D5XUJPo6QyzLfwKscgZY1UtgChuwkjH4tOhpQPp4Nn430GeU/TcJ4sif5iV2V/NL6P/H81oTOIUVuPsO4AyeNVG9ehw4xTP4oubZ268VFiP2jd4Y9Hufw8TKJoAgufT2RZZikJ8s7JMzxTQw1QKwhtdrZY0Likd9Azjm1G6gpcOz8VzdFHC1E8AV9gKXYdCI3eWc9q96Tj0DnHEBuObXa6J60yvgtC740Tw3jf0Sgtzj89JhK6tyAKt2Ag9f+AxY8SgPyQMLUs5hd/hut/5MH3mp3z3H6eeBa7ADV/4UuNxO4DINw1GyZklMw/MhTut8BywCj2mb9wvAQdBN0z5ldJ1zlbemygusdn5NVBeA8b/Tart/D8CMyVrjjteNeo81v1rljF7gdC7gVNPAKUeAdwuaAb17MzS6yTdGmzPoWWJLXLG8Go9We1aDLCtWnRskA27zXqCfuP0Xj9ZNBHgwwQWE6acP4Nu9m6FxZn7tmbWEg2Zpg670U1rXUpB1xVbWOsjKF/YCTQHU5X5rjmn3+IP8djthMJaNe+6EhUbFmub8jefaPZ5NbtHk8TuX/1HsEZiXetJz5rc+11BMxw7Bsc+3bS99oUH/bgGRYCL/o93Hp7gKO7B6zzqwF342L7jWgaP3A03jzxrGTJzm5dausIVrlP/tU22KD+FhFJ1djjfma4/mbdf6vbZrgz6bbOTN6IvFgGU9cvcLLOjqi6WA5bp10RbTuRDe4vhR1594bTT74aA3ghEVJxL575cHBLuhC3rr+bPN06ajOkdgS4tj26UB79w6A9sO+oMpKk0j5zKbOrksk48reLiW6mjFE0Oj1U+2elbK7P7nNCNh0+dhQZOLSa0u3U8dttmTOvsKv5DQUo2gx0wLqz88eu2RTbwZxX412y1ehwnN1mES1sE6RdKjkneaTg8b+kD0Efoj9P8WWiKRbHnmo/bExMQbWEqwjBPawvU/VOjk5GQ9gmxagdLS0qzZ2dmQm5sLWVlZkJ6e3pmamjqD5eWIQ8vlcjtBpaSkyAUrIlxsQUEBKJVKqK6uhsrKSigrK4Pi4uLA48eP4yMO3dfXZyovLweCzMjIWCT4e/fuySsqKkCtVkNjYyNf1tXVwdjY2K7PiB8EurS01FpTUwO1tbVA8AgM2MZDErAgsvgez4gHD22325UqlWqVrEmqr6/nJVhZsDSW/v288NatW++9sFkPcjm6po9EdcFdqbx9+3Zs0LbUYrGMazSaVbFlxcKPgqGhIfNegfGlsRjwS1SGA6bAz8/P52eZRHV0Vyu5KyUA9IIrQYMGBwfT9Xr9kti6YivrdLr9nBEZBvHNvLw8ykIEvunCRiaTJRQVFQG5aUNDAy+qU/CTuyLwWyyNm86IDoejsaOjwxPqFkaj0b+8vLyvMyIaJV6hUPAxk5OTA2g5DcJvuAvOZD1lqtB30wxTbLW1tfEXNhvTkpSUJM/MzPQJKY6+UhjU3d3tWgfe75HrVE9PzxzFCr2jsLAQpFIppdlh/ABJVVXVECWCrWYZPcAfesPEnxHRyube3l4b5mAbWsU2ir/FxcUDOyOiv8ahpb0UN0L6pJRaUlIC5BY0A2TVUGgyII5xRuSM6Ha7LyJkgMDEuV+YfnG7WDQzDx48sERqwxTtdDrNFB9bwYUTBSNO+p2I7fImJyfPoF8PNTc37wic+hgMhqALm0isaNEIY6KVdSfQ5BoTExOq/8J++ioFOAV7S0tLWItTOyWF0AubiO0fMOjO42JlwgAMhFvMMJNteWFzqKC0j8Cc3Il7cR/t0SnVUZCFLiaYk1empqbCXtgctoUTcO+iQ5eYRUuv0EJCOZhAtVrtaldXl2dkZGTbC5tIuMa+L2z+BexZXK+OBaruAAAAAElFTkSuQmCC") 0 0 no-repeat; }'
            );

            $('#optionsHolder').append('<div class="twitterHolder"><a class="btn" target="_blank" title="Follow eRepublik Advanced on Twitter" href="http://twitter.com/eRAdvanced"><i></i><span class="label"><span id="l">Follow</span>&nbsp;<span id="screen-name" class="fn nickname">@eRAdvanced</span></span></a></div>');
        },

        renderFacebook: function() {
            era.addStyle(
                '#optionsHolder .facebookHolder { float: left; margin-top: 4px; }' +
                '#optionsHolder .facebookHolder .btn { position: relative; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(white),to(#DEDEDE)); background-image: -moz-linear-gradient(top,white,#DEDEDE); background-image: -o-linear-gradient(top,white,#DEDEDE); background-image: -ms-linear-gradient(top,white,#DEDEDE); background-image: linear-gradient(top,white,#DEDEDE); border: #CCC solid 1px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; color: #333; -webkit-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none; cursor: pointer; overflow: hidden; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box; height: 20px; max-width: 100%; text-shadow: 0 1px 0 rgba(255, 255, 255, .5); display: inline-block; vertical-align: top; zoom: 1; font-family: \'Helvetica Neue\', Arial, sans-serif; font-size: 11px; font-style: normal; font-variant: normal; font-weight: bold; line-height: 18px; }' +
                '#optionsHolder .facebookHolder .btn:focus, .btn:hover, .btn:active { border-color: #BBB; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(#F8F8F8),to(#D9D9D9)); background-image: -moz-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -o-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -ms-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: linear-gradient(top,#F8F8F8,#D9D9D9); -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }' +
                '#optionsHolder .facebookHolder .btn .label { padding: 0 4px 0 18px; display: inline-block; vertical-align: top; zoom: 1; }' +
                '#optionsHolder .facebookHolder .btn i { position: absolute; top: 50%; left: 3px; margin-top: -6px; width: 16px; height: 12px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAAEhcmxxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAU5JREFUeNpiNPfunc3AwJDCxMIjkMLAwMAAAAAA//9iMPfu/c/EwMjEAAAAAP//YrQOn/ufgYGBQZD9LwMAAAD//2I09+79zwAFTCw8AgzHNxcxsPAIMDAxMDAwMDJCZAAAAAD//4LrYWBgYJAR52dY3BvI4BizgIEFJrh2SjiDuAg3A9wsGCM4ZyUDAwMDg03EPAYGBgYGAAAAAP//QrERCcxjYeERgPMm1HgyfPz0g6F+0v4kFmRlJjqSDJYBkxmYObgRdhxZkcTAwMDAsG1RKqrlFj59DAwMDAxesbNQJWB2MXPyMDAwMDAAxGgZNP0/EysbAzHg3+9fDCy4FM9u9WXQVBZlYGBgYDh69gFDefc+BiZWNgYWXKbBFNuEz2FgYIS7kAElzBkYGBjWTA5lkBDlRdF8+cYLhsyGbdg1oAcPLAqQ42gBA/FgAWAAwp1CQHByl7sAAAAASUVORK5CYII=") 0 0 no-repeat; }'
            );

            $('#optionsHolder').append('<div class="facebookHolder"><a class="btn" target="_blank" title="Like eRepublik Advanced on Facebook" href="https://www.facebook.com/eRepublik.Advanced"><i></i><span class="label"><span id="l">Facebook</span></span></a></div>');
        },

        renderGoogle: function() {
            era.addStyle(
                '#optionsHolder .googleHolder { float: left; margin: 4px 0 0 4px; }' +
                '#optionsHolder .googleHolder .btn { position: relative; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(white),to(#DEDEDE)); background-image: -moz-linear-gradient(top,white,#DEDEDE); background-image: -o-linear-gradient(top,white,#DEDEDE); background-image: -ms-linear-gradient(top,white,#DEDEDE); background-image: linear-gradient(top,white,#DEDEDE); border: #CCC solid 1px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; color: #333; -webkit-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none; cursor: pointer; overflow: hidden; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box; height: 20px; max-width: 100%; text-shadow: 0 1px 0 rgba(255, 255, 255, .5); display: inline-block; vertical-align: top; zoom: 1; font-family: \'Helvetica Neue\', Arial, sans-serif; font-size: 11px; font-style: normal; font-variant: normal; font-weight: bold; line-height: 18px; }' +
                '#optionsHolder .googleHolder .btn:focus, .btn:hover, .btn:active { border-color: #BBB; background-color: #F8F8F8; background-image: -webkit-gradient(linear,left top,left bottom,from(#F8F8F8),to(#D9D9D9)); background-image: -moz-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -o-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: -ms-linear-gradient(top,#F8F8F8,#D9D9D9); background-image: linear-gradient(top,#F8F8F8,#D9D9D9); -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }' +
                '#optionsHolder .googleHolder .btn .label { padding: 0 3px 0 18px; display: inline-block; vertical-align: top; zoom: 1; }' +
                '#optionsHolder .googleHolder .btn i { position: absolute; top: 50%; left: 3px; margin-top: -6px; width: 16px; height: 12px; background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAfBJREFUeNpUkcFLFFEAh79583Z1dnZ21XWorVxyIaGIDl1CLYSCCCwCQ4ogwUMIHaI6+g9462aHUCyU6GCUQXgpiQIhkAINscNCIZlpOrszO+tu7pvXoTz0O3/f5fsZhd7ONUwzqSshquiBlESBD0IQ238AYdloVeffyhLDyEZhGUMIWgaGMJuaEbaDKgdUPryn+vkTwknvCY5EqUCHZSd7fwxdq7H9eJTcxAxRWKY4PYmOItT2L8yMC1oHIgoD4vkO7M4egjev2Hz0kq2JUYSdpL6xjsy4WCdPoXd3IYoQRkMju2urqKKHe3sYK2cjGi12FuZRRY9Y22EyN++gazVQCqNwqdtXJc+JuVlSvX0kunuIfJ/C2S7cu/do6r9B7FCO6vIi3pPxQBrCBK2priwhnBQtg7cASPdfIZibRba6pPsH8KbGqK9/R6qSRzyXp3XkAfWtTVaHrpHuu05ufJqvV89TfPEUFfjsLH1EJGyM5Y5mv/35W6ch38Fi0kIkAQlHv2wQzM6wPjKMaSeR+7IAgRRWgvDdaxqPnaB95hm/CyvE24+wszBPcXqS+ME2RLwBtAbA+HaxS6uSR+rCZewz54gqIcrbxpt6iPJLyIyLVmrvOIy508fXtKon6z9//E0nBIaUmBkXYSX+g4HynwEA+wvQg6MwQdkAAAAASUVORK5CYII=") 0 0 no-repeat; }'
            );

            $('#optionsHolder').append('<div class="googleHolder"><a class="btn" target="_blank" title="+1 eRepublik Advanced on Google+" href="https://plus.google.com/115513975434718464998"><i></i><span class="label"><span id="l">Google+</span></span></a></div>');
        },

        storage: {

            values: {
                'lang': 'en',
                'menu1': true,
                'menu2': true,
                'sidebar': true,
                'market': true,
                'search': true,
                'milevents': true,
                'subs': true,
                'dotrack': true,
                'inventory': true,
                'taxes': true,
                'news': true,
                'elections': true,
                'battlefield': true,
                'profile': true,
                'mmarket': true
            },

            maintainer: function() {
                var data = era.storage.get('Options', {});
                typeof data != 'object' && (data = era.options.storage.values);
                for (var i in data) !era.options.storage.values.hasOwnProperty(i) && delete data[i];
                for (var i in era.options.storage.values) (!data.hasOwnProperty(i) || typeof data[i] != typeof era.options.storage.values[i]) && (data[i] = era.options.storage.values[i]);
                era.storage.set('Options', data);
            }

        }

    },

    /**
    * Dealing with exchange rates.
    */
    exchangeRate: {

        /**
         * Entries will be updated only if they aren't younger than this value.
         * It's in seconds.
         */
        ageLimit: 30,

        subscribers: {},

        init: function() {
            era.exchangeRate.storage.maintainer();
            $(document).bind('maintainYourValues', era.exchangeRate.storage.maintainer);

            var exchFn = function(type, amount, decimal, beforeInsert, afterInsert) {
                var target = this;
                amount = isNaN(amount) ? 0 : amount;
                decimal = isNaN(decimal) ? 0 : decimal;

                era.exchangeRate.get('gold', function(rate) {
                    var v = (rate > 0 ? (/^gold/i.test(type) ? amount / rate : amount * rate) : 0).toFixed(decimal);
                    typeof beforeInsert == 'function' && (v = beforeInsert.call(target, v));
                    $(target).text(v);
                    typeof afterInsert == 'function' && (afterInsert.call(target, v));
                });
            }

            var exch = function(type, amount, decimal, callback) {
                amount = isNaN(amount) ? 0 : amount;
                decimal = isNaN(decimal) ? 0 : decimal;

                return era.exchangeRate.get('gold', function(rate) {
                    var v = (rate > 0 ? (/^gold/i.test(type) ? amount / rate : amount * rate) : 0).toFixed(decimal);
                    typeof callback == 'function' && callback(v);
                });
            }

            $.fn.extend({
                'gold': function(amount, decimal, beforeInsert, afterInsert) {
                    var e = $(this);
                    var target = this;
                    exchFn.call(target, 'gold', amount, decimal, beforeInsert, afterInsert);
                    return e;
                }
            });

            $.extend({
                'gold': function(amount, decimal, callback) {
                    return exch('gold', amount, decimal, callback);                    
                }
            });

            $.fn.extend({
                'currency': function(amount, decimal, beforeInsert, afterInsert) {
                    var e = $(this);
                    var target = this;
                    exchFn.call(target, 'currency', amount, decimal, beforeInsert, afterInsert);
                    return e;
                }
            });

            $.extend({
                'currency': function(amount, decimal, callback) {
                    return exch('currency', amount, decimal, callback);                    
                }
            });
        },

        /**
         * Methods
         * - tof: Top of first page (default)
         * - mof: Middle of first page
         * - aof: Average of first page
         *
         * Callback accept one argument for the fetched rate. It's NaN when no rate has fetched.
         */
        fetch: function(buy, callback, method) {
            method = (typeof method == 'undefined' ? 'tof' : method);

            if (!/^gold$/i.test(buy) && !currency_country.hasOwnProperty(buy.toUpperCase())) {
                typeof callback == 'function' && callback();
                return false;
            }

            var rate = (/^gold$/i.test(buy) ? (era.characterCurrency.toUpperCase() + 'GOLD') : ('GOLD' + era.characterCurrency.toUpperCase()));
            var data = era.storage.get('SCD');

            if (data.hasOwnProperty(rate) && parseInt((new Date).getTime() / 1000) - data[rate].ts < era.exchangeRate.ageLimit) {
                typeof callback == 'function' && callback();
                return false;
            }

            if (era.exchangeRate.subscribers.hasOwnProperty(rate)) {
                era.exchangeRate.subscribers[rate].push(callback);
                return false;
            }

            era.exchangeRate.subscribers[rate] = [];

            era.ajax.get('http://www.erepublik.com/en/economy/exchange-market', function(r) {
                var start = r.indexOf("id='_token'");
                var data = {'_token': $('<input ' + r.substr(start, r.indexOf('/>', start) - start + 2)).val(), 'personalOffers': 0, 'page': 0, 'currencyId': (/^gold$/i.test(buy) ? 62 : 1)};

                era.ajax.post('http://www.erepublik.com/en/economy/exchange/retrieve', data, function(r) {
                    var table = $(JSON.parse(r).buy_mode).find('tbody');

                    if (/^mof$/i.test(method)) {
                        var rows = table.find('tr').length;
                        var v = (rows ? table.find('tr:eq(' + (parseInt(rows / 2) - 1) + ') > td:eq(2) > strong:last > span').text() * 1 : 0);
                    } else if (/^aof$/i.test(method)) {
                        var tmp = 0;
                        var num = 0;

                        table.find('tr').each(function(i) {
                            tmp += $(this).find('td:eq(2) > strong:last > span').text() * 1;
                            num = i;
                        });

                        var v = tmp / (num + 1);
                    } else {
                        var rows = table.find('tr').length;
                        var v = (rows ? table.find('tr:first > td:eq(2) > strong:last > span').text() * 1 : 0);
                    }

                    if (isNaN(v)) {
                        typeof callback == 'function' && callback();
                        for (var i in era.exchangeRate.subscribers[rate]) era.exchangeRate.subscribers[rate][i]();
                        delete era.exchangeRate.subscribers[rate];
                        return false;
                    }

                    var data = era.storage.get('SCD');
                    data[rate] = {'v': v, 'ts': parseInt((new Date).getTime() / 1000)};

                    era.storage.set('SCD', data);

                    typeof callback == 'function' && callback(v);
                    for (var i in era.exchangeRate.subscribers[rate]) era.exchangeRate.subscribers[rate][i](v);
                    delete era.exchangeRate.subscribers[rate];

                    return true;
                });
            });

            return true;
        },

        /**
         * To get rates easily.
         */
        get: function(buy, callback) {
            era.exchangeRate.fetch(buy, function(v) {
                if (isNaN(v)) {
                    var rate = (/^gold$/i.test(buy) ? (era.characterCurrency.toUpperCase() + 'GOLD') : ('GOLD' + era.characterCurrency.toUpperCase()));
                    var data = era.storage.get('SCD');
                    if (data.hasOwnProperty(rate)) v = data[rate].v;
                    else v = 0;
                }

                typeof callback == 'function' && callback(v);
            }, 'tof');
        },

        /**
        * Provides storage related stuff for it's parent object.
        */
        storage: {

            /**
            * Maintains the storage data's integrity to always work
            * with a valid and up to date data.
            */
            maintainer: function() {
                var sellCurrencyData = era.storage.get('SCD');

                if (typeof sellCurrencyData != 'object') sellCurrencyData = {};
                else {
                    for (var i in sellCurrencyData) {
                        if (!sellCurrencyData[i].hasOwnProperty('v') || isNaN(sellCurrencyData[i].v) || !sellCurrencyData[i].hasOwnProperty('ts') || isNaN(sellCurrencyData[i].ts)) delete sellCurrencyData[i];
                    }
                }
                
                era.storage.set('SCD', sellCurrencyData);
            }

        }

    },

    scrollBlocker: {

        init: function() {
            $('#large_sidebar').next().remove();
            era.addStyle('#large_sidebar { position: relative !important; top: 0 !important; left: 0 !important; }');
        }

    },

    influenceLog: {

        init: function() {
            era.influenceLog.storage.maintainer();
            $(document).bind('maintainYourValues', era.influenceLog.storage.maintainer);
        },

        storage: {

            value: {
                'Hits': 0,
                'Kills': 0,
                'Influence': 0,
                'Rank': 0
            },

            maintainer: function() {
                var data = era.storage.get('Influence', {});
                typeof data != 'object' && (data = {});
                var tmp = {};

                for (var i = 0; i < 10; i++) {
                    (!data.hasOwnProperty(era.erepDay - i) || typeof data[era.erepDay - i] != 'object') && (data[era.erepDay - i] = era.influenceLog.storage.value);
                    for (var k in data[era.erepDay - i]) !era.influenceLog.storage.value.hasOwnProperty(k) && delete data[era.erepDay - i][k];
                    for (var k in era.influenceLog.storage.value) (!data[era.erepDay - i].hasOwnProperty(k) || typeof data[era.erepDay - i][k] != typeof era.influenceLog.storage.value[k] || data[era.erepDay - i][k] < 0) && (data[era.erepDay - i][k] = 0);
                    tmp[era.erepDay - i] = data[era.erepDay - i];
                }

                era.storage.set('Influence', tmp);
            }

        }

    },

    customMenu: {

        addStyle: function() {
            era.addStyle(
                '.customMenuHolder { padding: 0px 2px 2px 2px; float: left; margin-left: 3px; width: 944px; }' +
                '.customMenuElemHolder { border-radius: 0px 0px 5px 5px; background-color: #eeeeee; float: left; width: 118px; height: 20px; text-align: center; color: #7F7F7F; cursor: default; vertical-align: middle; line-height: 20px; font-size: 11px; }' +
                '.customMenuElement { border-radius: 0px 0px 5px 5px; background-color: #eeeeee; padding: 2px; float: left; width: 114px; height: 16px; text-align: center; color: #7F7F7F; cursor: pointer; vertical-align: middle; line-height: 16px; font-size: 11px; }' +
                '.customMenuElement:hover { background: #505050; color: #D8D8D8; }' +
                '.customMenuElementAdd { border-radius: 0px 0px 5px 5px; background-color: #eeeeee; padding: 2px; float: left; width: 114px; height: 16px; text-align: center; color: #CCCCCC; cursor: pointer; vertical-align: middle; line-height: 16px; font-size: 11px; }' +
                '.customMenuElementAdd:hover { background: #CCCCCC; color: #D8D8D8; }' +
                '.customMenuPrompt { box-shadow: 0px 0px 5px #9F9F9F; border-radius: 5px 5px 5px 5px; background: url(' + loadingBackImg + ') repeat scroll 0 0 transparent; border: 1px solid #bbbbbb; display: none; height: 200px; position: absolute; margin-left: 10%; margin-right: auto; width: 400px; z-index: 999999; top: 250px; }'
            );
        },

        renderTop: function() {
            var menu = era.storage.get('Menu', {});
            
            $('#container').prepend('<div id="customTopMenu" class="customMenuHolder">' +
                                        '<div id="menuTopElement1" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement2" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement3" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement4" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement5" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement6" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement7" class="customMenuElemHolder"></div>' +
                                        '<div id="menuTopElement8" class="customMenuElemHolder"></div>' +
                                    '</div>');
    
            for (var i = 1; i <= 8; i++) {
                !menu.hasOwnProperty('menutop' + i) && (menu['menutop' + i] = {'title': '', 'lnk': ''});

                if (menu['menutop' + i].title != null && menu['menutop' + i].title.length > 1 && menu['menutop' + i].lnk != null && menu['menutop' + i].lnk.length > 1) {
                    $('#menuTopElement' + i).empty().append(
                        $('<a>', {href: menu['menutop' + i].lnk, target: menu['menutop' + i].target ? '_blank' : '_self'}).append($('<div>', {class: 'customMenuElement', text: menu['menutop' + i].title}))
                    );
                } else {
                    $('#menuTopElement' + i).empty().append(
                        $('<a>', {id: 'addTopLinkHere_' + i, title: 'Add current page', href: 'javascript:;', target: '_self'}).append($('<div>', {class: 'customMenuElementAdd', text: '+'}))
                    );
                }
            }

            era.storage.set('Menu', menu);
            
            $(document).on('click', 'a[id*="addTopLinkHere"]', function() {
                var linkIdNumber = $(this).attr('id').split('_')[1];
                
                $('#content').append('<div id="customMenuTopPrompt_' + linkIdNumber + '" class="customMenuPrompt">' +
                                        '<span class="menuWindowHeader">' +
                                            '<a id="customMenuTopPromptClose_' + linkIdNumber + '" class="closeButton" title="Close" href="javascript:;">&nbsp;</a>' +
                                        '</span>' +
                                        '<span style="float: left; margin-left: 5%; margin-right: 5%; margin-top: 10px; padding: 5px; width: 90%;">' +
                                            '<div style="display: block; font-size: 16px; height: 35px; padding-bottom: 10px; text-align: center; vertical-align: middle; width: 100%;">Please enter desired link title<br>and choose if you want to open it in new tab.</div>' +
                                            '<div class="menuWindowContentTable">' +
                                                '<div class="menuWindowContentRow">' +
                                                    '<div class="menuWindowContentCell">Title</div>' +
                                                    '<div class="menuWindowContentCell">&nbsp;</div>' +
                                                '</div>' +
                                                '<div class="menuWindowContentRow">' +
                                                    '<div class="menuWindowContentCell"><input id="customMenuTopPromptName_' + linkIdNumber + '" type="text" size="50"></div>' +
                                                    '<div class="menuWindowContentCell"><input id="customMenuTopPromptTarget_' + linkIdNumber + '" type="checkbox" title="Open link in new tab?"></div>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div style="display: block; font-size: 16px; height: 35px; padding-bottom: 10px; text-align: center; vertical-align: middle; width: 100%;">' +
                                                '<a id="customMenuTopPromptSubmit_' + linkIdNumber + '" title="Submit" class="fluid_blue_raised_medium" style="display: inline; left: 95px; margin-top: 15px; margin-right: 15px;">' +
                                                    '<span style="font-size: 10px; text-align: center;">Submit</span>' +
                                                '</a>' +
                                                '<a id="customMenuTopPromptCancel_' + linkIdNumber + '" title="Cancel" class="fluid_red_small" style="display: inline; left: 95px; margin-top: 15px;">' +
                                                    '<span style="font-size: 10px; text-align: center;">Cancel</span>' +
                                                '</a>' +
                                            '</div>' +
                                        '</span>' +
                                    '</div>');
                
                $('#customMenuTopPrompt_' + linkIdNumber).css('display', 'block');
                
                $('a[id*="customMenuTopPromptClose"]').each(function() {
                    var closeId = $(this).attr('id').split('_')[1];
                    $(this).click(function() {
                        $('#customMenuTopPromptName_' + closeId).val('');
                        $('#customMenuTopPromptTarget_' + closeId).prop('checked', false);
                        
                        $('#customMenuTopPrompt_' + closeId).remove();
                    });
                });
                    
                $(document).on('click', 'a[id*="customMenuTopPromptSubmit"]', function() {
                    var linkIdNumber = $(this).attr('id').split('_')[1];
                    var thisLink = document.location.href;
                    var thisName = null;
                    var thisTarget = null;
                    
                    if($('#customMenuTopPromptName_' + linkIdNumber) != null) {
                        thisName = $('#customMenuTopPromptName_' + linkIdNumber).val();
                        thisTarget = Boolean($('#customMenuTopPromptTarget_' + linkIdNumber).prop('checked'));
                        
                        menu['menutop' + linkIdNumber] = {title: thisName, lnk: thisLink, target: thisTarget};
                        era.storage.set('Menu', menu);
                        
                        $('#customMenuTopPrompt_' + linkIdNumber).remove();
                    }
                });
                
                $(document).on('click', 'a[id*="customMenuTopPromptCancel"]', function() {
                    var linkIdNumber = $(this).attr('id').split('_')[1];
                    
                    $('#customMenuTopPromptName_' + linkIdNumber).val('');
                    $('#customMenuTopPromptTarget_' + linkIdNumber).prop('checked', false);
                    
                    $('#customMenuTopPrompt_' + linkIdNumber).remove();
                });
            });
        },

        renderBottom: function() {
            var menu = era.storage.get('Menu', {});

            $('#menuText').append('<div id="customBottomMenu" class="customMenuHolder">' +
                                '<div id="menuElement1" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement2" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement3" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement4" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement5" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement6" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement7" class="customMenuElemHolder"></div>' +
                                '<div id="menuElement8" class="customMenuElemHolder"></div>' +
                            '</div>');
    
            for (var i = 1; i <= 8; i++) {
                !menu.hasOwnProperty('menu' + i) && (menu['menu' + i] = {'title': '', 'lnk': ''});
                if (menu['menu' + i].title != null && menu['menu' + i].title.length > 1 && menu['menu' + i].lnk != null && menu['menu' + i].lnk.length > 1) {
                    $('#menuElement' + i).empty().append(
                        $('<a>', {href: menu['menu' + i].lnk, target: menu['menu' + i].target ? '_blank' : '_self'}).append($('<div>', {class: 'customMenuElement', text: menu['menu' + i].title}))
                    );
                } else {
                    $('#menuElement' + i).empty().append(
                        $('<a>', {id: 'addLinkHere_' + i, title: 'Add current page', href: 'javascript:;', target: '_self'}).append($('<div>', {class: 'customMenuElementAdd', text: '+'}))
                    );
                }
            }

            era.storage.set('Menu', menu);
            
            $(document).on('click', 'a[id*="addLinkHere"]', function() {
                var linkIdNumber = $(this).attr('id').split('_')[1];
                
                $('#content').append('<div id="customMenuPrompt_' + linkIdNumber + '" class="customMenuPrompt">' +
                                        '<span class="menuWindowHeader">' +
                                            '<a id="customMenuPromptClose_' + linkIdNumber + '" class="closeButton" title="Close" href="javascript:;">&nbsp;</a>' +
                                        '</span>' +
                                        '<span style="float: left; margin-left: 5%; margin-right: 5%; margin-top: 10px; padding: 5px; width: 90%;">' +
                                            '<div style="display: block; font-size: 16px; height: 35px; padding-bottom: 10px; text-align: center; vertical-align: middle; width: 100%;">Please enter desired link title<br>and choose if you want to open it in new tab.</div>' +
                                            '<div class="menuWindowContentTable">' +
                                                '<div class="menuWindowContentRow">' +
                                                    '<div class="menuWindowContentCell">Title</div>' +
                                                    '<div class="menuWindowContentCell">&nbsp;</div>' +
                                                '</div>' +
                                                '<div class="menuWindowContentRow">' +
                                                    '<div class="menuWindowContentCell"><input id="customMenuPromptName_' + linkIdNumber + '" type="text" size="50"></div>' +
                                                    '<div class="menuWindowContentCell"><input id="customMenuPromptTarget_' + linkIdNumber + '" type="checkbox" title="Open link in new tab?"></div>' +
                                                '</div>' +
                                            '</div>' +
                                            '<div style="display: block; font-size: 16px; height: 35px; padding-bottom: 10px; text-align: center; vertical-align: middle; width: 100%;">' +
                                                '<a id="customMenuPromptSubmit_' + linkIdNumber + '" title="Submit" class="fluid_blue_raised_medium" style="display: inline; left: 95px; margin-top: 15px; margin-right: 15px;">' +
                                                    '<span style="font-size: 10px; text-align: center;">Submit</span>' +
                                                '</a>' +
                                                '<a id="customMenuPromptCancel_' + linkIdNumber + '" title="Cancel" class="fluid_red_small" style="display: inline; left: 95px; margin-top: 15px;">' +
                                                    '<span style="font-size: 10px; text-align: center;">Cancel</span>' +
                                                '</a>' +
                                            '</div>' +
                                        '</span>' +
                                    '</div>');
                
                $('#customMenuPrompt_' + linkIdNumber).css('display', 'block');
                
                $('a[id*="customMenuPromptClose"]').each(function() {
                    var closeId = $(this).attr('id').split('_')[1];
                    $(this).click(function() {
                        $('#customMenuPromptName_' + closeId).val('');
                        $('#customMenuPromptTarget_' + closeId).prop('checked', false);
                        
                        $('#customMenuPrompt_' + closeId).remove();
                    });
                });
                
                $(document).on('click', 'a[id*="customMenuPromptSubmit"]', function() {
                    var linkIdNumber = $(this).attr('id').split('_')[1];
                    var thisLink = document.location.href;
                    var thisName = null;
                    var thisTarget = null;
                    
                    if($('#customMenuPromptName_' + linkIdNumber) != null) {
                        thisName = $('#customMenuPromptName_' + linkIdNumber).val();
                        thisTarget = Boolean($('#customMenuPromptTarget_' + linkIdNumber).prop('checked'));
                        
                        menu['menu' + linkIdNumber] = {title: thisName, lnk: thisLink, target: thisTarget};
                        era.storage.set('Menu', menu);
                        
                        $('#customMenuPrompt_' + linkIdNumber).remove();
                    }
                });
                
                $(document).on('click', 'a[id*="customMenuPromptCancel"]', function() {
                    var linkIdNumber = $(this).attr('id').split('_')[1];
                    
                    $('#customMenuPromptName_' + linkIdNumber).val('');
                    $('#customMenuPromptTarget_' + linkIdNumber).prop('checked', false);
                    
                    $('#customMenuPrompt_' + linkIdNumber).remove();
                });
            });
        }

    },

    inventoryPageProcessor: {

        ageLimit: 30,

        inProgress: false,

        subscribers: [],

        init: function() {
            era.inventoryPageProcessor.storage.maintainer();
            $(document).bind('maintainYourValues', era.inventoryPageProcessor.storage.maintainer);
        },

        o: function() {
            if (era.inventoryPageProcessor.inProgress) return false;
            era.inventoryPageProcessor.inProgress = true;

            if (parseInt((new Date).getTime() / 1000) - era.storage.get('IPP') < era.inventoryPageProcessor.ageLimit) {
                for (var i in era.inventoryPageProcessor.subscribers) 'function' == typeof era.inventoryPageProcessor.subscribers[i] && era.inventoryPageProcessor.subscribers[i]();
                era.inventoryPageProcessor.subscribers = [];
                return era.inventoryPageProcessor.inProgress = false;
            }

            era.ajax.get('http://www.erepublik.com/en/economy/inventory', function(response) {
                era.storage.set('IPP', parseInt((new Date).getTime() / 1000));
                var $html = $(response.replace(/src=/gi, 'dgffd='));

                var storageStatus = /\(([^\(\)]+)\)/i.exec(response.substr(response.indexOf('class="area storage"')))[1].replace(/,/g, '').split('/');
                era.storage.set('StorageStatus', {
                    'currentSize': storageStatus[0],
                    'maxSize': storageStatus[1]
                });

                var storageContent = {'cooked': [], 'raw': []};

                $html.find('#inventory_overview .items_holder .item_mask:eq(0) li').each(function() {
                    storageContent.cooked.push({
                        'industry': $(this).attr('industry'),
                        'quality': $(this).attr('quality'),
                        'amount': $(this).find('strong').html().replace(/,/g, '')
                    });
                });

                $html.find('#inventory_overview .items_holder .item_mask:eq(1) li').each(function() {
                    storageContent.raw.push({
                        'industry': $(this).find('strong').attr('id').split('_')[1],
                        'amount': $(this).find('strong').html().replace(/,/g, '')
                    });
                });

                storageContent.bazooka = $html.find('.collection_list:eq(0) .bazooka strong:eq(0)').html().replace(/,/g, '');

                era.storage.set('StorageContent', storageContent);

                var marketOffers = [];

                $html.find('#sell_offers tbody tr:gt(0)').each(function() {
                    var offerImage = $(this).find('td:eq(0) img');

                    marketOffers.push({
                        'id': $(this).attr('id').split('_')[1] * 1,
                        'industry': offerImage.attr('dgffd').split('/')[6] * 1,
                        'quality': offerImage.attr('dgffd').split('/')[7].split('_')[0].replace(/q/g, '') * 1,
                        'amount': $(this).find('td:eq(1) strong').html().replace(',', '') * 1,
                        'price': $(this).find('td:eq(2) strong:first').html().replace(/,+/gi, '') * 1,
                        'country': $(this).find('td:eq(3) img').attr('alt')
                    });
                });

                era.storage.set('MarketOffers', marketOffers);

                var taxes = {};
                var tmp = JSON.parse(response.split('countryList = ')[1].split(';')[0]);

                for (var i in tmp) {
                    if ('object' == typeof tmp[i].taxes) {
                        'object' != typeof taxes[i] && (taxes[i] = {});

                        for (var k in tmp[i].taxes) taxes[i][k] = {
                            'import_tax': tmp[i].taxes[k].import_tax,
                            'income_tax': tmp[i].taxes[k].income_tax,
                            'value_added_tax': tmp[i].taxes[k].value_added_tax
                        }
                    }
                }

                era.storage.set('TaxValues', taxes);

                era.characterCitizenshipId = response.split('citizenshipCountry = ')[1].split(';')[0];

                for (var i in era.inventoryPageProcessor.subscribers) 'function' == typeof era.inventoryPageProcessor.subscribers[i] && era.inventoryPageProcessor.subscribers[i]();
                era.inventoryPageProcessor.subscribers = [];

                era.inventoryPageProcessor.inProgress = false;
            });
        },

        storage: {

            storageStatusValue: {
                'currentSize': 0,
                'maxSize': 0
            },

            maintainer: function() {
                var age = era.storage.get('IPP', 0);
                era.storage.set('IPP', isNaN(age) ? 0 : age);
            }

        }

    },

    monetaryOffersFetcher: {

        ageLimit: 30,

        inProgress: false,

        subscribers: [],

        init: function() {
            era.monetaryOffersFetcher.storage.maintainer();
            $(document).bind('maintainYourValues', era.monetaryOffersFetcher.storage.maintainer);
        },

        o: function() {
            if (era.monetaryOffersFetcher.inProgress) return false;
            era.monetaryOffersFetcher.inProgress = true;

            if (parseInt((new Date).getTime() / 1000) - era.storage.get('MOF') < era.monetaryOffersFetcher.ageLimit) {
                for (var i in era.monetaryOffersFetcher.subscribers) 'function' == typeof era.monetaryOffersFetcher.subscribers[i] && era.monetaryOffersFetcher.subscribers[i]();
                era.monetaryOffersFetcher.subscribers = [];
                return era.monetaryOffersFetcher.inProgress = false;
            }

            era.ajax.get('http://www.erepublik.com/en/economy/exchange-market', function(r) {
                era.storage.set('MOF', parseInt((new Date).getTime() / 1000));

                var offers = [];

                var start = r.indexOf("class='exchange_offers mine'");

                if (start >= 0) {
                    var table = '<table ' + r.substr(start, r.indexOf('</table>', start) - start + 8);
        
                    $(table).find('tbody > tr').each(function() {
                        var $amount = $(this).find('td:eq(1) input');
                        offers.push({'id': $amount.attr('id').split('_')[2],'amount': $amount.val(), 'currency': $(this).find('td:eq(1) em').text(), 'rate': $(this).find('td:eq(2) input').val()});
                    });
                }
    
                era.storage.set('MonetaryOffers', offers);

                for (var i in era.monetaryOffersFetcher.subscribers) 'function' == typeof era.monetaryOffersFetcher.subscribers[i] && era.monetaryOffersFetcher.subscribers[i]();
                era.monetaryOffersFetcher.subscribers = [];

                era.monetaryOffersFetcher.inProgress = false;
            });
        },

        storage: {

            maintainer: function() {
                var age = era.storage.get('MOF', 0);
                era.storage.set('MOF', isNaN(age) ? 0 : age);
            }

        }

    },

    profilePageProcessor: {

        ageLimit: 30,

        inProgress: false,

        subscribers: [],

        init: function() {
            era.profilePageProcessor.storage.maintainer();
            $(document).bind('maintainYourValues', era.profilePageProcessor.storage.maintainer);
        },

        o: function() {
            if (era.profilePageProcessor.inProgress) return false;
            era.profilePageProcessor.inProgress = true;

            if (parseInt((new Date).getTime() / 1000) - era.storage.get('PPP') < era.profilePageProcessor.ageLimit) {
                for (var i in era.profilePageProcessor.subscribers) 'function' == typeof era.profilePageProcessor.subscribers[i] && era.profilePageProcessor.subscribers[i]();
                era.profilePageProcessor.subscribers = [];
                return era.profilePageProcessor.inProgress = false;
            }

            era.ajax.get('http://www.erepublik.com/en/citizen/profile/' + era.characterId, function(r) {
                era.storage.set('PPP', parseInt((new Date).getTime() / 1000));

                var mercenary = {};
                var $r = $(r.replace(/src=/gi, 'dgffd='));

                $r.find('#achievment .country_list:last li').each(function() {
                    mercenary[$(this).find('small').text()] = {
                        'country': $(this).attr('title'),
                        'progress': $(this).find('em').text().split('/')[0]
                    }
                });

                era.storage.set('MercenaryProgress', {
                    'totalProgress': ~~$r.find('#achievment .country_list:last').prev().text().match(/\d+/),
                    'countryProgress': mercenary
                });

                for (var i in era.profilePageProcessor.subscribers) 'function' == typeof era.profilePageProcessor.subscribers[i] && era.profilePageProcessor.subscribers[i]();
                era.profilePageProcessor.subscribers = [];

                era.profilePageProcessor.inProgress = false;
            });
        },

        storage: {

            maintainer: function() {
                var age = era.storage.get('PPP', 0);
                era.storage.set('PPP', isNaN(age) ? 0 : age);
            }

        }

    },

    naturalEnemyFetcher: {

        ageLimit: 3600,

        inProgress: false,

        subscribers: [],

        init: function() {
            era.naturalEnemyFetcher.storage.maintainer();
            $(document).bind('maintainYourValues', era.naturalEnemyFetcher.storage.maintainer);
        },

        o: function() {
            if (era.naturalEnemyFetcher.inProgress) return false;
            era.naturalEnemyFetcher.inProgress = true;

            if (parseInt((new Date).getTime() / 1000) - era.storage.get('NEF') < era.naturalEnemyFetcher.ageLimit) {
                for (var i in era.naturalEnemyFetcher.subscribers) 'function' == typeof era.naturalEnemyFetcher.subscribers[i] && era.naturalEnemyFetcher.subscribers[i]();
                era.naturalEnemyFetcher.subscribers = [];
                return era.naturalEnemyFetcher.inProgress = false;
            }

            era.ajax.get('http://www.erepublik.com/' + era.hostLang + '/country/military/' + currency_country[era.characterCurrency], function(r) {
                era.storage.set('NEF', parseInt((new Date).getTime() / 1000));

                era.storage.set('Natural', $.trim($(r.replace(/src=/gi, 'dgffd=')).find('.indent:eq(0) .attacker .nameholder a').text()));

                for (var i in era.naturalEnemyFetcher.subscribers) 'function' == typeof era.naturalEnemyFetcher.subscribers[i] && era.naturalEnemyFetcher.subscribers[i]();
                era.naturalEnemyFetcher.subscribers = [];

                era.naturalEnemyFetcher.inProgress = false;
            });
        },

        storage: {

            maintainer: function() {
                var age = era.storage.get('NEF', 0);
                era.storage.set('NEF', isNaN(age) ? 0 : age);
            }

        }

    },

    subscriptions: {

        ageLimit: 300,

        inProgress: false,

        subscribers: [],

        init: function() {
            era.subscriptions.storage.maintainer();
            $(document).bind('maintainYourValues', era.subscriptions.storage.maintainer);
        },

        compare: function() {
            var data = era.storage.get('LatestSubscription', {}),
                left = 0, step = 22;

            $('.user_notify:first a').each(function() {
                $(this).css('left', left + 'px');
                left += step;
            });

            if (!data.hasOwnProperty('latest') || !data.hasOwnProperty('previous') || !data.latest.length || !data.previous.length || data.latest == data.previous)
                $('.user_notify:first').append('<a href="/' + era.hostLang + '/news/subscriptions" title="New articles: 0" class="notify nalert" style="left: ' + left + 'px; background-image: url(' + subsIcon + ');"></a>');
            else if (data.hasOwnProperty('latest') && data.hasOwnProperty('previous') && data.latest.length && data.previous.length && data.latest != data.previous)
                $('.user_notify:first').append('<a href="/' + era.hostLang + '/news/subscriptions" title="New articles: 1" class="notify nalert" style="left: ' + left + 'px; background-image: url(' + subsIcon + ');"><em class="fadeInUp">1<span>&nbsp;</span></em></a>');
        },

        o: function() {
            if (era.subscriptions.inProgress) return false;
            era.subscriptions.inProgress = true;

            if (parseInt((new Date).getTime() / 1000) - era.storage.get('SUB') < era.subscriptions.ageLimit) {
                for (var i in era.subscriptions.subscribers) 'function' == typeof era.subscriptions.subscribers[i] && era.subscriptions.subscribers[i]();
                era.subscriptions.subscribers = [];
                return era.subscriptions.inProgress = false;
            }

            var data = era.storage.get('LatestSubscription', {});
            data.previous = data.hasOwnProperty('latest') ? data.latest : '';
            era.storage.set('LatestSubscription', data);

            era.ajax.get('http://www.erepublik.com/' + era.hostLang + '/news/subscriptions', function(r) {
                era.storage.set('SUB', parseInt((new Date).getTime() / 1000));

                var data = era.storage.get('LatestSubscription', {});
                data.latest = $.trim($(r.replace(/src=/gi, 'dgffd=')).find('#content .holder.bordersep:first a:first').text());

                era.storage.set('LatestSubscription', data);

                for (var i in era.subscriptions.subscribers) 'function' == typeof era.subscriptions.subscribers[i] && era.subscriptions.subscribers[i]();
                era.subscriptions.subscribers = [];

                era.subscriptions.inProgress = false;
            });
        },

        storage: {

            maintainer: function() {
                var age = era.storage.get('SUB', 0);
                era.storage.set('SUB', isNaN(age) ? 0 : age);
            }

        }

    },

    enchantMarket: {
        o: function () {            
            var marketIndustry = ~~location.href.split('/')[7],
                baser = function(v) { return (v + '').match(/^[0-9]+/i)[0]; },
                supper = function(v) { return '.' + (v + '').match(/[0-9]+$/i)[0]; },
                completeArray = {},
                totalAmount = 0,
                totalValue = 0,
                tableAddendum = '',
                x
            ;

            if (marketIndustry == 1) {
                $('th[class*="m_price"]').after('<th title="The price of one health unit.">Health Price</th>');
            }
            
            $('td[class*="m_price"]').each(function(i) {
                var basePrice = parseFloat($(this).find('strong:first').text() + '.' + $(this).find('sup:first').text().match(/[0-9]+/i)),
                    $row = $(this).parent(),
                    qty = ~~$row.find('td[class*="m_stock"]').text().match(/\d+\.?\d*/g).join(''),
                    offerId = $row.find('.m_buy a').attr('id')
                ;

                $row.data('eraInputMutex', true);

                $(this).append(
                    '<br/>' +
                    '<strong id="gPrice1' + i + '" style="color: #a2a2a2;">n/a</strong>' +
                    '<sup style="color: #a2a2a2;"><span id="gPrice2' + i + '"></span> <strong>GOLD</strong></sup>'
                );

                $('#gPrice1' + i).gold(basePrice, 5, baser);
                $('#gPrice2' + i).gold(basePrice, 5, supper);
                
                if (marketIndustry == 1) {
                    var hpPrice = basePrice / ~~$('#filters_summary strong:first').html();

                    $(this).after(
                        '<td class="m_price stprice">' +
                            '<strong>' + baser(hpPrice.toFixed(1)) + '</strong>' +
                            '<sup>' + supper(hpPrice.toFixed(5)) + ' <strong>' + $(this).find('sup strong:first').text() +'</strong></sup>' +
                            '<br/>' +
                            '<strong style="color: #a2a2a2;" id="ghpPrice1' + i + '">n/a</strong>' +
                            '<sup style="color: #a2a2a2;"><span id="ghpPrice2' + i + '"></span> <strong>GOLD</strong></sup>' +
                        '</td>'
                    );

                    $('#ghpPrice1' + i).gold(hpPrice, 5, baser);
                    $('#ghpPrice2' + i).gold(hpPrice, 5, supper);
                }

                completeArray[basePrice.toFixed(2)] = ~~completeArray[basePrice.toFixed(2)] + qty;
                totalAmount += qty;
                totalValue += basePrice * qty;

                $row.find('.m_quantity').css('padding', '10px').append(
                    '<div style="margin: 1px 0 0 2px;">' +
                        '<button title="Set total quantity" class="f_light_blue_big eraAllButton" style="cursor: pointer; outline:none; border: none; margin: 0; padding: 0; width: 27px; background: #fff url(/images/parts/fluids_map.jpg) right -526px no-repeat; height: 26px; line-height: 25px; color: #3c8fa7; float: left; font-size: 12px;">' + 
                            '<span style="' + (!era.chrome ? 'position: relative; top: -1px; left: -3px; ' : '') + 'padding-left: 9px; background: #fff url(/images/parts/fluids_map.jpg) left -526px no-repeat; height: 26px; line-height: 25px; color: #3c8fa7; float: left; cursor: pointer; text-shadow: 0 1px 0 #fff; font-weight: bold;">A</span>'+ 
                        '</button>' +
                        '<button title="Set max quantity you can buy" class="f_light_blue_big eraMaxButton" style="cursor: pointer; outline:none; border: none; margin: 0; padding: 0; width: 27px; background: #fff url(/images/parts/fluids_map.jpg) right -526px no-repeat; height: 26px; line-height: 25px; color: #3c8fa7; float: left; font-size: 12px; margin-left: 1px;">' +
                            '<span style="' + (!era.chrome ? 'position: relative; top: -1px; left: -3px; ' : '') + 'padding-left: 8px; background: #fff url(/images/parts/fluids_map.jpg) left -526px no-repeat; height: 26px; line-height: 25px; color: #3c8fa7; float: left; cursor: pointer; text-shadow: 0 1px 0 #fff; font-weight: bold;">M</span>' +
                        '</button>' +
                    '</div>'
                );

                $row.find('button.eraAllButton').hover(function() {
                    $(this).css('background-position', 'right -552px');
                    $(this).find('span').css('color', '#fff').css('background-position', 'left -552px').css('text-shadow', '0 -1px 0 #60a9c1');
                }, function() {
                    $(this).css('background-position', 'right -526px');
                    $(this).find('span').css('color', '#3c8fa7').css('background-position', 'left -526px').css('text-shadow', '0 1px 0 #fff');
                }).click(function() {
                    if (!$row.data('eraInputMutex')) return;
                    else $row.data('eraInputMutex', false);

                    var $button = $row.find('.m_buy').find('a');

                    $row.find('.m_quantity input').val(qty);

                    if (qty > 1) {
                        $button.find('span').text($button.data('i18n') + ' ' + numeral(qty * basePrice).format('0,0.[00]') + ' ' + $button.data('currency'));
                    } else {
                        $button.find('span').text($button.attr('title'));
                    }

                    $row.data('eraInputMutex', true);
                });

                $row.find('button.eraMaxButton').hover(function() {
                    $(this).css('background-position', 'right -552px');
                    $(this).find('span').css('color', '#fff').css('background-position', 'left -552px').css('text-shadow', '0 -1px 0 #60a9c1');
                }, function() {
                    $(this).css('background-position', 'right -526px');
                    $(this).find('span').css('color', '#3c8fa7').css('background-position', 'left -526px').css('text-shadow', '0 1px 0 #fff');
                }).click(function() {
                    if (!$row.data('eraInputMutex')) return;
                    else $row.data('eraInputMutex', false);

                    var finalAmount = (era.characterMoney >= qty * basePrice) ? qty : ~~(era.characterMoney / basePrice);
                    var $button = $row.find('.m_buy').find('a');

                    $row.find('.m_quantity input').val(finalAmount);

                    if (finalAmount > 1) {
                        $button.find('span').text($button.data('i18n') + ' ' + numeral(finalAmount * basePrice).format('0,0.[00]') + ' ' + $button.data('currency'));
                    } else {
                        $button.find('span').text($button.attr('title'));
                    }

                    $row.data('eraInputMutex', true);
                });
            });

            for (x in completeArray) {
                tableAddendum +=
                    '<tr>' +
                        '<td colspan="3" style="text-align: right; background: none repeat scroll 0 0 #FFFFEC; padding: 5px 10px 5px 0px; text-indent: 5px; width: 50px; cursor: default; border-bottom: none;">' + numeral(completeArray[x]).format('0,0') + '</td>' +
                        '<td colspan="4" style="background: none repeat scroll 0 0 #FFFFEC; border-left: 1px solid #F7F4E1; border-bottom: none; padding: 5px 0px 5px 10px; width: 100px; cursor: default;">' +
                            '<strong style="font-size: 18px; font-weight: normal;">' + numeral(~~x).format('0,0') + '</strong>' +
                            '<sup>' + supper(x) + ' <strong>' + $('td.m_price:first sup strong:first').text() + '</strong></sup>' +
                        '</td>' +
                    '</tr>'
                ;
            }

            tableAddendum +=
                '<tr>' +
                    '<td colspan="3" style="text-align: right; background: none repeat scroll 0 0 #FFFFEC; padding: 10px 10px 10px 0px; text-indent: 5px; width: 50px; cursor: default; border-bottom: none; border-top: 1px solid #CCCCCC;">' + numeral(totalAmount).format('0,0') + '</td>' +
                    '<td colspan="4" style="background: none repeat scroll 0 0 #FFFFEC; border-left: 1px solid #F7F4E1; border-bottom: none; border-top: 1px solid #CCCCCC; padding: 10px 0px 10px 10px; width: 100px; cursor: default;">' +
                        '<strong style="font-size: 18px; font-weight: normal;">' + numeral(~~totalValue).format('0,0') + '</strong>' +
                        '<sup>' + supper(totalValue.toFixed(2)) + ' <strong>' + $('td.m_price:first sup strong:first').text() + '</strong></sup>' +
                        '<br/>' +
                        '<strong style="font-size: 18px; font-weight: normal; color: #a2a2a2;" id="gTotal1">n/a</strong>' +
                        '<sup style="color: #a2a2a2;"><span id="gTotal2"></span> <strong>GOLD</strong></sup>' +
                    '</td>' +
                '</tr>'
            ;

            $('td[id*="productId_"]:last').parent().after(tableAddendum);

            $('#gTotal1').gold(totalValue, 5, function (v){ return numeral(~~v).format('0,0'); });
            $('#gTotal2').gold(totalValue, 5, supper);
        }
    },

    improveProfile: {
        o: function() {
            era.storageTab.o();

            !$('.citizen_menu').append(
                '<li>' +
                    '<a href="http://egov4you.info/citizen/history/' + location.href.split('/')[6] + '" target="_blank" title="Citizen history">egov4you</a>' +
                '</li>'
            ).length && $('#content h2:first').after(
                '<ul class="citizen_menu">' +
                    '<li>' +
                        '<a href="http://egov4you.info/citizen/history/' + location.href.split('/')[6] + '" target="_blank" title="Citizen history">egov4you</a>' +
                    '</li>' +
                '</ul>'
            );

            $('ul.achiev .hinter .country_list li em').each(function() {
                if($(this).html() == '0/25') {
                    $(this).css({
                        'background' : '#e9e9e9',
                        'backgroundColor' : '#e1e1e1',
                        'backgroundImage' : '-webkit-gradient(linear, left bottom, left top, color-stop(1, #e9e9e9), color-stop(0, #e1e1e1))',
                        'backgroundImage' : '-webkit-linear-gradient(center bottom, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-moz-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-o-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-ms-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : 'linear-gradient(top, #e9e9e9 0%,#e1e1e1 100%)'
                    });
                } else if ($(this).html() == '25/25') {
                    $(this).css({
                        'background' : '#cbe2bc',
                        'backgroundColor' : '#b6d6a1',
                        'backgroundImage' : '-webkit-gradient(linear, left bottom, left top, color-stop(1, #cbe2bc), color-stop(0, #b6d6a1))',
                        'backgroundImage' : '-webkit-linear-gradient(center bottom, #cbe2bc 0%, #b6d6a1 100%)',
                        'backgroundImage' : '-moz-linear-gradient(top, #cbe2bc 0%, #b6d6a1 100%)',
                        'backgroundImage' : '-o-linear-gradient(top, #cbe2bc 0%, #b6d6a1 100%)',
                        'backgroundImage' : '-ms-linear-gradient(top, #cbe2bc 0%, #b6d6a1 100%)',
                        'backgroundImage' : 'linear-gradient(top, #cbe2bc 0%,#b6d6a1 100%)'
                    });
                }
            });

            $('#content .citizen_mass_destruction').css('margin-bottom', '35px');
            $('h3.eracalc').css('margin-bottom', '5px');

            // --- ssCalc2

            function ssCalc2(currentStrength, destinationStrength, trainingGrounds, climbingCenter, shootingRange, specialForcesCenter, dailyBonusStrength) {
                (isNaN(currentStrength) || currentStrength < 0) && (currentStrength = 0); (isNaN(destinationStrength) || destinationStrength < 0) && (destinationStrength = 0);
                (isNaN(trainingGrounds) || trainingGrounds < 0 || trainingGrounds > 4) && (trainingGrounds = 0); (isNaN(climbingCenter) || climbingCenter < 0 || climbingCenter > 4) && (climbingCenter = 0);
                (isNaN(shootingRange) || shootingRange < 0 || shootingRange > 4) && (shootingRange = 0); (isNaN(specialForcesCenter) || specialForcesCenter < 0 || specialForcesCenter > 4) && (specialForcesCenter = 0);
                (isNaN(dailyBonusStrength) || dailyBonusStrength < 0 || dailyBonusStrength > 2) && (dailyBonusStrength = 0);

                var strengthLength = destinationStrength - currentStrength;
                if (!strengthLength || !((trainingGrounds *= 1) + (climbingCenter *= 1) + (shootingRange *= 1) + (specialForcesCenter *= 1))) return {'d': 0, 'g': 0, 'h': 0, 'dailyS': 0, 'dailyG': 0, 'dailyH': 0};

                var db = {
                    'trainingGrounds': [
                        {'g': 0, 's': 0},
                        {'g': 0, 's': 5},
                        {'g': 0, 's': 10},
                        {'g': 0, 's': 15},
                        {'g': 0, 's': 20}
                    ],
                    'climbingCenter': [
                        {'g': 0, 's': 0},
                        {'g': 0.19, 's': 2.5},
                        {'g': 0.19, 's': 5},
                        {'g': 0.19, 's': 7.5},
                        {'g': 0.19, 's': 10}
                    ],
                    'shootingRange': [
                        {'g': 0, 's': 0},
                        {'g': 0.89, 's': 5},
                        {'g': 0.89, 's': 10},
                        {'g': 0.89, 's': 15},
                        {'g': 0.89, 's': 20}
                    ],
                    'specialForcesCenter': [
                        {'g': 0, 's': 0},
                        {'g': 1.79, 's': 10},
                        {'g': 1.79, 's': 20},
                        {'g': 1.79, 's': 30},
                        {'g': 1.79, 's': 40},
                    ]
                }

                var dailyEffect = {'s': 0, 'g': 0, 'h': 0};

                dailyEffect.h += 10 * (!!trainingGrounds + !!climbingCenter + !!shootingRange + !!specialForcesCenter + !!((dailyBonusStrength *= 1) == 2 ? 1 : 0));

                dailyEffect.s += db.trainingGrounds[trainingGrounds].s;

                dailyEffect.s += db.climbingCenter[climbingCenter].s;
                dailyEffect.g += db.climbingCenter[climbingCenter].g;

                dailyEffect.s += db.shootingRange[shootingRange].s;
                dailyEffect.g += db.shootingRange[shootingRange].g;

                dailyEffect.s += db.specialForcesCenter[specialForcesCenter].s;
                dailyEffect.g += db.specialForcesCenter[specialForcesCenter].g;

                dailyEffect.s += 1.8 * !!dailyBonusStrength;

                var result = {'d': Math.ceil(strengthLength / dailyEffect.s)};
                result.g = dailyEffect.g * result.d;
                result.h = dailyEffect.h * result.d;
                result.dailyS = dailyEffect.s;
                result.dailyG = dailyEffect.g;
                result.dailyH = dailyEffect.h;

                return result;
            }

            function ssCalc2Calc() {
                var data = era.storage.get('sscalc2', {});

                data.trainingGrounds = $('#trainingGrounds').val();
                data.climbingCenter = $('#climbingCenter').val();
                data.shootingRange = $('#shootingRange').val();
                data.specialForcesCenter = $('#specialForcesCenter').val();
                data.dailyBonusStrength = $('#dailyBonusStrength').val();

                era.storage.set('sscalc2', data);

                var result = ssCalc2(
                    $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', ''),
                    $('#content .citizen_content .citizen_military:first strong:last').text().split(' ')[2].replace(',', ''),
                    data.trainingGrounds, data.climbingCenter, data.shootingRange, data.specialForcesCenter, data.dailyBonusStrength
                );

                $('#ssCalcD').text(result.d);
                $('#ssCalcG').text((result.g).toFixed(2));
                $('#ssCalcH').text(result.h);

                $('#rankCalc').triggerHandler('change');
            }

            function ssCalc2Create() {
                era.addStyle(
                    '#ssCalc td { text-align: center; padding: 5px; }' +
                    '#ssCalc { margin-bottom: 15px; color: #666; }' +
                    '#dailyBonusStrength { width: 155px !important;}' +
                    '#ssCalc select { font-size: 11px; color: #666; cursor: pointer; -webkit-appearance: none; -moz-appearance: none; border: none; width: 52px; background: url(http://economy.erepublik.com/css/dd_arrow.gif) no-repeat; background-position: top right; height: 21px; }' +
                    '#ssCalc select:hover { background-position: bottom right; }' +
                    '#ssCalc div.select { display: inline-block; padding: 1px; border: 1px solid #E8F1F5; border-radius: 3px; margin-top: 7px; }' +
                    '#ssCalc span { font-weight: bold; }'
                );

                $('#content .citizen_content').append(
                    '<div class="clear"></div>' +
                    '<h3 class="eracalc">Super Soldier Calculator</h3>' +
                    '<div id="ssCalc">' +
                        '<table>'+
                            '<tr>' +
                                '<td>' +
                                    'Training grounds' +
                                    '<div class="select"><select id="trainingGrounds">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Q1</option>' +
                                        '<option value="2">Q2</option>' +
                                        '<option value="3">Q3</option>' +
                                        '<option value="4">Q4</option>' +
                                    '</select></div>' +
                                '</td>' +
                                '<td>' +
                                    'Climbing center' +
                                    '<div class="select"><select id="climbingCenter">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Q1</option>' +
                                        '<option value="2">Q2</option>' +
                                        '<option value="3">Q3</option>' +
                                        '<option value="4">Q4</option>' +
                                    '</select></div>' +
                                '</td>' +
                                '<td>' +
                                    'Shooting range' +
                                    '<div class="select"><select id="shootingRange">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Q1</option>' +
                                        '<option value="2">Q2</option>' +
                                        '<option value="3">Q3</option>' +
                                        '<option value="4">Q4</option>' +
                                    '</select></div>' +
                                '</td>' +
                                '<td>' +
                                    'Special forces center' +
                                    '<div class="select"><select id="specialForcesCenter">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Q1</option>' +
                                        '<option value="2">Q2</option>' +
                                        '<option value="3">Q3</option>' +
                                        '<option value="4">Q4</option>' +
                                    '</select></div>' +
                                '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td colspan="4">' +
                                    'Daily bonus effects acquired for completing daily tasks<br />' +
                                    '<div class="select"><select id="dailyBonusStrength">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Strength effect</option>' +
                                        '<option value="2">Strength and health effect</option>' +
                                    '</select></div>' +
                                '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td colspan="4">You need <span id="ssCalcD">0</span> days, <span id="ssCalcG">0.00</span> Gold and <span id="ssCalcH">0</span> Health for the next medal.</td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>'
                );

                $('#ssCalc select').change(ssCalc2Calc);
            }

            function ssCalc2Update() {
                var data = era.storage.get('sscalc2', {});

                $('#trainingGrounds').val(data.trainingGrounds);
                $('#climbingCenter').val(data.climbingCenter);
                $('#shootingRange').val(data.shootingRange);
                $('#specialForcesCenter').val(data.specialForcesCenter);
                $('#dailyBonusStrength').val(data.dailyBonusStrength);

                var result = ssCalc2(
                    $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', ''),
                    $('#content .citizen_content .citizen_military:first strong:last').text().split(' ')[2].replace(',', ''),
                    data.trainingGrounds, data.climbingCenter, data.shootingRange, data.specialForcesCenter, data.dailyBonusStrength
                );

                $('#ssCalcD').text(result.d);
                $('#ssCalcG').text((result.g).toFixed(2));
                $('#ssCalcH').text(result.h);

                $('#rankCalc').triggerHandler('change');
            }

            ssCalc2Create();
            ssCalc2Update();

            // ---

            // --- rankCalc

            function rankCalc2(rankValue, currentStrength, rankPointNeeded, hitsPerDay, weaponQ, ssc) {
                (isNaN(rankValue *= 1) || rankValue < 0) && (rankValue = 0); (isNaN(currentStrength *= 1) || currentStrength < 0) && (currentStrength = 0);
                (isNaN(rankPointNeeded *= 1) || rankPointNeeded < 0) && (rankPointNeeded = 0); (isNaN(hitsPerDay *= 1) || hitsPerDay < 0) && (hitsPerDay = 0);
                (isNaN(weaponQ *= 1) || weaponQ < 0) && (weaponQ = 0); (isNaN(ssc *= 1) || ssc < 0 || ssc > 1) && (ssc = 0);

                if (0 == rankPointNeeded || 0 == hitsPerDay) return {'d': 0, 'h': 0, 'g': 0};

                function influence(rankValue, strength, weaponQ) {
                    var weaponPower = 0;

                    switch (weaponQ) {
                        case 1: weaponPower = 20; break;
                        case 2: weaponPower = 40; break;
                        case 3: weaponPower = 60; break;
                        case 4: weaponPower = 80; break;
                        case 5: weaponPower = 100; break;
                        case 6: weaponPower = 120; break;
                        case 7: weaponPower = 200; break;
                        case 10: weaponPower = 100; break;
                    }

                    return weaponQ == 10 ? 10000 : 0.00005 * (5 + rankValue) * (400 + strength) * (100 + weaponPower);
                }

                var data = era.storage.get('sscalc2', {});

                var result = ssc ? ssCalc2(
                    currentStrength, currentStrength + 1,
                    data.trainingGrounds, data.climbingCenter, data.shootingRange, data.specialForcesCenter, data.dailyBonusStrength
                ) : {'dailyS': 0, 'dailyH': 0, 'dailyG': 0};

                var generatedRank = 0;
                var lastRank = 0;
                var lastDistance = 0;

                for (var i = 0; generatedRank < rankPointNeeded; i++) {
                    lastDistance = rankPointNeeded - generatedRank;
                    generatedRank += (lastRank = Math.floor(Math.floor(influence(rankValue, currentStrength += !!i * result.dailyS, weaponQ)) / 10)) * hitsPerDay;
                }

                return {'d': i, 'h': ((i * hitsPerDay) + Math.ceil(lastDistance / lastRank) - hitsPerDay) * 10 + i * result.dailyH, 'g': i * result.dailyG};
            }

            function rankCalc2Calc() {
                var data = era.storage.get('rankcalc2', {});

                data.hits = $('#rankHits').val(); (isNaN(data.hits) || data.hits < 0) && $('#rankHits').val(data.hits = 0);
                data.weapon = $('#rankWeapon').val(); (isNaN(data.weapon) || data.weapon < 0) && $('#rankWeapon').val(data.weapon = 0);
                data.ssc = $('#rankSsc').val(); (isNaN(data.ssc) || data.ssc < 0 || data.ssc > 1) && $('#rankSsc').val(data.ssc = 0);

                data.hits > 1000000 && $('#rankHits').val(data.hits = 1000000);

                era.storage.set('rankcalc2', data);

                var result = rankCalc2(
                    threshold_id[$('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '')] - 1,
                    $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', ''),
                    $('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '') - $('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[0].replace(/,+/gi, ''),
                    data.hits, data.weapon, data.ssc
                );

                $('#rankCalcD').text(result.d);
                $('#rankCalcH').text(result.h);
                $('#rankCalcG').text((result.g).toFixed(2));
            }

            function rankCalc2Create() {
                era.addStyle(
                    '#rankCalc td { text-align: center; padding: 5px; }' +
                    '#rankCalc table { width: 100%; }' +
                    '#rankHits { width: 50px; }' +
                    '#rankCalc { margin-bottom: 15px; color: #666; }' +
                    '#rankCalc select { font-size: 11px; color: #666; cursor: pointer; -webkit-appearance: none; -moz-appearance: none; border: none; width: 55px; background: url(http://economy.erepublik.com/css/dd_arrow.gif) no-repeat; background-position: top right; height: 21px; }' +
                    '#rankCalc select:hover { background-position: bottom right; }' +
                    '#rankCalc div.select { display: inline-block; padding: 1px; border: 1px solid #E8F1F5; border-radius: 3px; margin-left: 5px; }' +
                    '#rankCalc tr:last-child span { font-weight: bold; }' +
                    '#rankCalc tr:first-child span { cursor: help; }' +
                    '#rankCalc input { width: 50px; border: 1px solid #E8F1F5; border-radius: 3px; color: #666; font-size: 11px; height: 23px; text-align: center; padding-right: 1px; margin-left: 5px; }' +
                    '#rankWeapon { width: 70px !important; }' +
                    '#rankSsc { width: 48px !important; }'
                );

                $('#content .citizen_content').append(
                    '<div class="clear"></div>' +
                    '<h3 class="eracalc">Rank Calculator</h3>' +
                    '<div id="rankCalc">' +
                        '<table>'+
                            '<tr>' +
                                '<td>' +
                                    'Hits / day<input type="text" id="rankHits" value="0" maxlength="7" />' +
                                '</td>' +
                                '<td>' +
                                    'Weapon' +
                                    '<div class="select"><select id="rankWeapon">' +
                                        '<option value="0">None</option>' +
                                        '<option value="1">Q1</option>' +
                                        '<option value="2">Q2</option>' +
                                        '<option value="3">Q3</option>' +
                                        '<option value="4">Q4</option>' +
                                        '<option value="5">Q5</option>' +
                                        '<option value="6">Q6</option>' +
                                        '<option value="7">Q7</option>' +
                                        '<option value="10">Bazooka</option>' +
                                    '</select></div>' +
                                '</td>' +
                                '<td>' +
                                    'Use <span title="Super Soldier Calculator">SSC</span> training data' +
                                    '<div class="select"><select id="rankSsc">' +
                                        '<option value="0">No</option>' +
                                        '<option value="1">Yes</option>' +
                                    '</select></div>' +
                                '</td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td colspan="3">You need <span id="rankCalcD">0</span> days, <span id="rankCalcG">0.00</span> Gold and <span id="rankCalcH">0</span> Health for the next rank.</td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>'
                );

                $('#rankHits, #rankWeapon, #rankCalc, #rankSsc').bind('input change', rankCalc2Calc);
                $('#rankCalc input').keydown(function(e) {
                    switch(e.which) {
                        case 38: $(this).val($(this).val() * 1 + 1); break;
                        case 40: $(this).val($(this).val() * 1 - 1); break;
                    }

                    (e.which == 38 || e.which == 40) && $(this).triggerHandler('change');
                });
            }

            function rankCalc2Update() {
                var data = era.storage.get('rankcalc2', {});

                $('#rankHits').val(data.hits);
                $('#rankWeapon').val(data.weapon);
                $('#rankSsc').val(data.ssc);

                var result = rankCalc2(
                    threshold_id[$('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '')] - 1,
                    $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', ''),
                    $('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '') - $('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[0].replace(/,+/gi, ''),
                    data.hits, data.weapon, data.ssc
                );

                $('#rankCalcD').text(result.d);
                $('#rankCalcH').text(result.h);
                $('#rankCalcG').text((result.g).toFixed(2));
            }

            rankCalc2Create();
            rankCalc2Update();

            // ---

            // --- influCalc

            function influCalc2(rankValue, currentStrength, weaponQ, hits, natural) {
                (isNaN(rankValue *= 1) || rankValue < 0) && (rankValue = 0); (isNaN(currentStrength *= 1) || currentStrength < 0) && (currentStrength = 0);
                (isNaN(weaponQ *= 1) || weaponQ < 0) && (weaponQ = 0); (isNaN(hits *= 1) || hits < 0) && (hits = 0);
                (isNaN(natural *= 1) || natural < 0) && (natural = 0);

                var weaponPower = 0;

                switch (weaponQ) {
                    case 1: weaponPower = 20; break;
                    case 2: weaponPower = 40; break;
                    case 3: weaponPower = 60; break;
                    case 4: weaponPower = 80; break;
                    case 5: weaponPower = 100; break;
                    case 6: weaponPower = 120; break;
                    case 7: weaponPower = 200; break;
                    case 10: weaponPower = 100; break;
                }

                return hits * (weaponQ == 10 ? 10000 : Math.floor(0.00005 * (5 + rankValue) * (400 + currentStrength) * (100 + weaponPower) * (1.0 + 0.1 * natural)));
            }

            function influCalc2Calc() {
                var data = era.storage.get('influcalc2', {});

                data.hits = $('#influHits').val(); (isNaN(data.hits) || data.hits < 0) && $('#influHits').val(data.hits = 0);
                data.natural = $('#influNatural').val();

                data.hits > 1000000 && $('#influHits').val(data.hits = 1000000);

                era.storage.set('influcalc2', data);

                var rankValue = threshold_id[$('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '')] - 1;
                var currentStrength = $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', '');

                $('#influCalcQ0').text(influCalc2(rankValue, currentStrength, 0, data.hits, data.natural));
                $('#influCalcQ1').text(influCalc2(rankValue, currentStrength, 1, data.hits, data.natural));
                $('#influCalcQ2').text(influCalc2(rankValue, currentStrength, 2, data.hits, data.natural));
                $('#influCalcQ3').text(influCalc2(rankValue, currentStrength, 3, data.hits, data.natural));
                $('#influCalcQ4').text(influCalc2(rankValue, currentStrength, 4, data.hits, data.natural));
                $('#influCalcQ5').text(influCalc2(rankValue, currentStrength, 5, data.hits, data.natural));
                $('#influCalcQ6').text(influCalc2(rankValue, currentStrength, 6, data.hits, data.natural));
                $('#influCalcQ7').text(influCalc2(rankValue, currentStrength, 7, data.hits, data.natural));
            }

            function influCalc2Create() {
                era.addStyle(
                    '#influCalc table, #influResults table { width: 100%; }' +
                    '#influCalc td, #influResults td { text-align: center; }' +
                    '#influCalc td:last-child img { position: relative; top: 2px; margin-right: 4px; }' +
                    '#influCalc td:last-child { font-size: 11px; text-align: right; }' +
                    '#influCalc { margin-bottom: 15px; color: #666; }' +
                    '#influHits { width: 50px; }' +
                    '#influResults { font-size: 11px; color: #666; }' +
                    '#influResults span { position: relative; top: -13px; margin-left: 5px; }' +
                    '#influResults img { width: 35px; height: 35px; }' +
                    '#influHits { width: 50px; }' +
                    '#influCalc select { cursor: pointer; font-size: 11px; color: #666; -webkit-appearance: none; -moz-appearance: none; border: none; width: 55px; background: url(http://economy.erepublik.com/css/dd_arrow.gif) no-repeat; background-position: top right; height: 21px; }' +
                    '#influCalc select:hover { background-position: bottom right; }' +
                    '#influCalc div.select { display: inline-block; padding: 1px; border: 1px solid #E8F1F5; border-radius: 3px; margin-left: 5px; }' +
                    '#influCalc input { width: 50px; border: 1px solid #E8F1F5; border-radius: 3px; color: #666; font-size: 11px; height: 23px; text-align: center; padding-right: 1px; margin-left: 5px; }' +
                    '#influNatural { width: 48px !important; }'
                );

                $('#content .citizen_content').append(
                    '<div class="clear"></div>' +
                    '<h3>Influence Calculator</h3>' +
                    '<div id="influCalc">' +
                        '<table>'+
                            '<tr>' +
                                '<td>' +
                                    'Hits<input type="text" id="influHits" value="0" maxlength="7" />' +
                                '</td>' +
                                '<td>' +
                                    'Natural enemy' +
                                    '<div class="select"><select id="influNatural">' +
                                        '<option value="0">No</option>' +
                                        '<option value="1">Yes</option>' +
                                    '</select></div>' +
                                '</td>' +
                                '<td>' +
                                    '<img src="http://www.erepublik.com/images/modules/_icons/small_info_icon.png" alt="Note" />Bazooka deals constant 10.000 influence.' +
                                '</td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>' +
                    '<div id="influResults" class="citizen_military">' +
                        '<table>' +
                            '<tr>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q1.png" style="opacity: 0.3;"><span id="influCalcQ0">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q1.png"><span id="influCalcQ1">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q2.png"><span id="influCalcQ2">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q3.png"><span id="influCalcQ3">0</span></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q4.png"><span id="influCalcQ4">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q5.png"><span id="influCalcQ5">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q6.png"><span id="influCalcQ6">0</span></td>' +
                                '<td><img src="http://www.erepublik.com/images/icons/industry/2/q7.png"><span id="influCalcQ7">0</span></td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>'
                );

                $('#influHits, #influNatural').bind('input change', influCalc2Calc);
                $('#influCalc input').keydown(function(e) {
                    switch(e.which) {
                        case 38: $(this).val($(this).val() * 1 + 1); break;
                        case 40: $(this).val($(this).val() * 1 - 1); break;
                    }

                    (e.which == 38 || e.which == 40) && $(this).triggerHandler('change');
                });
            }

            function influCalc2Update () {
                var data = era.storage.get('influcalc2', {});

                $('#influHits').val(data.hits);
                $('#influNatural').val(data.natural);

                var rankValue = threshold_id[$('#content .citizen_content .citizen_military:eq(1) strong:last').text().split(' ')[2].replace(/,+/gi, '')] - 1;
                var currentStrength = $.trim($('#content .citizen_content .citizen_military:first h4').text()).replace(',', '');

                $('#influCalcQ0').text(influCalc2(rankValue, currentStrength, 0, data.hits, data.natural));
                $('#influCalcQ1').text(influCalc2(rankValue, currentStrength, 1, data.hits, data.natural));
                $('#influCalcQ2').text(influCalc2(rankValue, currentStrength, 2, data.hits, data.natural));
                $('#influCalcQ3').text(influCalc2(rankValue, currentStrength, 3, data.hits, data.natural));
                $('#influCalcQ4').text(influCalc2(rankValue, currentStrength, 4, data.hits, data.natural));
                $('#influCalcQ5').text(influCalc2(rankValue, currentStrength, 5, data.hits, data.natural));
                $('#influCalcQ6').text(influCalc2(rankValue, currentStrength, 6, data.hits, data.natural));
                $('#influCalcQ7').text(influCalc2(rankValue, currentStrength, 7, data.hits, data.natural));
            }

            influCalc2Create();
            influCalc2Update();

            // ---

            $('h3.eracalc').css('margin-bottom', '5px');

            if(era.characterId == window.location.href.split('/')[6]) {
                var hitsTotal = 0,
                    killsTotal = 0,
                    influTotal = 0,
                    rankTotal = 0,
                    influenceLog = era.storage.get('Influence', {}),
                    avHit = influenceLog[era.erepDay].Hits ? ~~(influenceLog[era.erepDay].Influence / influenceLog[era.erepDay].Hits) : 0,
                    influRow0 =
                        '<tr class="current">' +
                            '<td style="color: #666666; font-size: 11px; width: 230px; padding-left: 10px;">' + era.erepDay + '</td>' +
                            '<td style="color: #666666; font-size: 11px; width: 50px;">' + influenceLog[era.erepDay].Hits + '</td>' +
                            '<td style="color: #666666; font-size: 11px; width: 50px;">' + influenceLog[era.erepDay].Kills + '</td>' +
                            '<td style="color: #666666; font-size: 11px; width: 70px;">' + influenceLog[era.erepDay].Influence + '</td>' +
                            '<td style="color: #666666; font-size: 11px; width: 50px;">' + influenceLog[era.erepDay].Rank + '</td>' +
                            '<td style="color: #666666; font-size: 11px; width: 50px;">' + avHit + '</td>' +
                        '</tr>'
                    ;
                
                var influ0 = influenceLog[era.erepDay]['Influence'];
                var influ1 = influenceLog[era.erepDay - 1]['Influence'];
                var influ2 = influenceLog[era.erepDay - 2]['Influence'];
                var influ3 = influenceLog[era.erepDay - 3]['Influence'];
                var influ4 = influenceLog[era.erepDay - 4]['Influence'];
                var influ5 = influenceLog[era.erepDay - 5]['Influence'];
                var influ6 = influenceLog[era.erepDay - 6]['Influence'];
                var influ7 = influenceLog[era.erepDay - 7]['Influence'];
                var influ8 = influenceLog[era.erepDay - 8]['Influence'];
                var influ9 = influenceLog[era.erepDay - 9]['Influence'];
                
                var influArray = [influ0, influ1, influ2, influ3, influ4, influ5, influ6, influ7, influ8, influ9];
                
                var min_value = parseFloat(influ0);
                for(var i = 0; i < influArray.length; i++) {
                    if(parseFloat(influArray[i]) <= min_value) {
                        min_value = parseFloat(influArray[i]);
                    }
                }
                
                if (min_value > 0) {
                    min_value = (Math.floor(min_value * 0.95 / 1000) * 1000).toFixed(0);
                }
                
                influ0 = parseFloat(influ0) - min_value;
                influ1 = parseFloat(influ1) - min_value;
                influ2 = parseFloat(influ2) - min_value;
                influ3 = parseFloat(influ3) - min_value;
                influ4 = parseFloat(influ4) - min_value;
                influ5 = parseFloat(influ5) - min_value;
                influ6 = parseFloat(influ6) - min_value;
                influ7 = parseFloat(influ7) - min_value;
                influ8 = parseFloat(influ8) - min_value;
                influ9 = parseFloat(influ9) - min_value;
                
                influArray = [influ0, influ1, influ2, influ3, influ4, influ5, influ6, influ7, influ8, influ9];
                
                var max_value = parseFloat(influ0);
                for(var i = 0; i < influArray.length; i++) {
                    if (parseFloat(influArray[i]) >= max_value) {
                        max_value = parseFloat(influArray[i]);
                    }
                }
                
                if (max_value > 0) {
                    max_value = (Math.floor(max_value * 1.2 / 1000) * 1000).toFixed(0);
                }
                
                influ0 = ~~((influ0 / max_value) * 100);
                influ1 = ~~((influ1 / max_value) * 100);
                influ2 = ~~((influ2 / max_value) * 100);
                influ3 = ~~((influ3 / max_value) * 100);
                influ4 = ~~((influ4 / max_value) * 100);
                influ5 = ~~((influ5 / max_value) * 100);
                influ6 = ~~((influ6 / max_value) * 100);
                influ7 = ~~((influ7 / max_value) * 100);
                influ8 = ~~((influ8 / max_value) * 100);
                influ9 = ~~((influ9 / max_value) * 100);
                
                var mInflu0 = influenceLog[era.erepDay]['Influence'];
                var mInflu1 = influenceLog[era.erepDay - 1]['Influence'];
                var mInflu2 = influenceLog[era.erepDay - 2]['Influence'];
                var mInflu3 = influenceLog[era.erepDay - 3]['Influence'];
                var mInflu4 = influenceLog[era.erepDay - 4]['Influence'];
                var mInflu5 = influenceLog[era.erepDay - 5]['Influence'];
                var mInflu6 = influenceLog[era.erepDay - 6]['Influence'];
                var mInflu7 = influenceLog[era.erepDay - 7]['Influence'];
                var mInflu8 = influenceLog[era.erepDay - 8]['Influence'];
                var mInflu9 = influenceLog[era.erepDay - 9]['Influence'];
                
                influArray = [mInflu0, mInflu1, mInflu2, mInflu3, mInflu4, mInflu5, mInflu6, mInflu7, mInflu8, mInflu9];
                
                var max_value = parseFloat(mInflu0);
                for(var i = 0; i < influArray.length; i++) {
                    if(parseFloat(influArray[i]) >= max_value) {
                        max_value = parseFloat(influArray[i]);
                    }
                }
                
                if (max_value > 0) {
                    max_value = (Math.floor(max_value * 1.2 / 1000) * 1000).toFixed(0);
                }
                
                var tInflu0 = influenceLog[era.erepDay]['Influence'];
                var tInflu1 = influenceLog[era.erepDay - 1]['Influence'];
                var tInflu2 = influenceLog[era.erepDay - 2]['Influence'];
                var tInflu3 = influenceLog[era.erepDay - 3]['Influence'];
                var tInflu4 = influenceLog[era.erepDay - 4]['Influence'];
                var tInflu5 = influenceLog[era.erepDay - 5]['Influence'];
                var tInflu6 = influenceLog[era.erepDay - 6]['Influence'];
                var tInflu7 = influenceLog[era.erepDay - 7]['Influence'];
                var tInflu8 = influenceLog[era.erepDay - 8]['Influence'];
                var tInflu9 = influenceLog[era.erepDay - 9]['Influence'];
                
                $('#content .citizen_content').append('<div class="clear"></div>' +
                                         '<h3>Influence Done</h3>' +
                                          '<table id="influTable" border="0" width="100%" class="details">' +
                                                '<thead>' +
                                                    '<tr>' +
                                                        '<th style="padding-left: 10px;">eDay</th>' +
                                                        '<th>Hits</th>' +
                                                        '<th>Kills</th>' +
                                                        '<th>Influence</th>' +
                                                        '<th>Rank</th>' +
                                                        '<th>Av. hit</th>' +
                                                    '</tr>' +
                                                '</thead>' +
                                                '<tbody>' +
                                                    influRow0 +             
                                                '</tbody>' +
                                            '</table>' +
                                            '<div class="clear"></div>' +
                                            '<div id="influChart">' +
                                                '<img src="http://chart.googleapis.com/chart?cht=lc&chs=504x100&chd=t:' + influ9 + ',' + influ8 + ',' + influ7 + ',' + influ6 + ',' + influ5 + ',' + influ4 + ',' + influ3 + ',' + influ2 + ',' + influ1 + ',' + influ0 + '&chco=999999&chf=c,s,fafcf7&chxs=0,999999,10,0,lt,999999,e4fad3|1,999999,10,0,lt,999999,e4fad3&chm=t' + tInflu9 + ',999999,0,0,9,,hv|t' + tInflu8 + ',999999,0,1,9,,hv|t' + tInflu7 + ',999999,0,2,9,,hv|t' + tInflu6 + ',999999,0,3,9,,hv|t' + tInflu5 + ',999999,0,4,9,,hv|t' + tInflu4 + ',999999,0,5,9,,hv|t' + tInflu3 + ',999999,0,6,9,,hv|t' + tInflu2 + ',999999,0,7,9,,hv|t' + tInflu1 + ',999999,0,8,9,,hv|t' + tInflu0 + ',999999,0,9,9,,hv|o,999999,0,-1,4&chxt=x,y&chxl=0:|' + parseFloat(era.erepDay - 9) + '|' + parseFloat(era.erepDay - 8) + '|' + parseFloat(era.erepDay - 7) + '|' + parseFloat(era.erepDay - 6) + '|' + parseFloat(era.erepDay - 5) + '|' + parseFloat(era.erepDay - 4) + '|' + parseFloat(era.erepDay - 3) + '|' + parseFloat(era.erepDay - 2) + '|' + parseFloat(era.erepDay - 1) + '|' + parseFloat(era.erepDay) + '|1:|' + ~~min_value + '|' + ~~max_value + '" style="float: left; border: 1px solid #e4fad3; padding: 15px 2px 2px; border-radius: 5px 5px 5px 5px; margin-bottom: 15px;">' +
                                            '</div>');
                
                hitsTotal += parseFloat(influenceLog[era.erepDay]['Hits']);
                killsTotal += parseFloat(influenceLog[era.erepDay]['Kills']);
                influTotal += parseFloat(influenceLog[era.erepDay]['Influence']);
                rankTotal += parseFloat(influenceLog[era.erepDay]['Rank']);
                
                var influRow1 = '';
                
                for (var i = 1; i < 5; i++) {
                    var cDay = era.erepDay - i;
                    
                    if (influenceLog[cDay] == undefined) {
                        influenceLog[cDay] = {};
                        influenceLog[cDay]['Hits'] = 0;
                        influenceLog[cDay]['Kills'] = 0;
                        influenceLog[cDay]['Influence'] = 0;
                        influenceLog[cDay]['Rank'] = 0;
                    }
                    
                    if (parseFloat(influenceLog[cDay]['Influence']) != 0 && parseFloat(influenceLog[cDay]['Influence']) != undefined) {
                        var avHitB = ~~(parseFloat(influenceLog[cDay]['Influence']) / parseFloat(influenceLog[cDay]['Hits']));
                    } else {
                        var avHitB = 0;
                    }
                    
                    influRow1 += '<tr class="current">' +
                                        '<td style="color: #999999; font-size: 11px; width: 230px; padding-left: 10px;">' + cDay + '</td>' +
                                        '<td style="color: #999999; font-size: 11px;">' + influenceLog[cDay]['Hits'] + '</td>' +
                                        '<td style="color: #999999; font-size: 11px;">' + influenceLog[cDay]['Kills'] + '</td>' +
                                        '<td style="color: #999999; font-size: 11px; width: 70px;">' + influenceLog[cDay]['Influence'] + '</td>' +
                                        '<td style="color: #999999; font-size: 11px; width: 50px;">' + influenceLog[cDay]['Rank'] + '</td>' +
                                        '<td style="color: #999999; font-size: 11px; width: 50px;">' + avHitB + '</td>' +
                                    '</tr>';
                    
                    hitsTotal += parseFloat(influenceLog[cDay]['Hits']);
                    killsTotal += parseFloat(influenceLog[cDay]['Kills']);
                    influTotal += parseFloat(influenceLog[cDay]['Influence']);
                    rankTotal += parseFloat(influenceLog[cDay]['Rank']);
                }
                
                influRow1 += '<tr class="current" style="font-weight: bold;">' +
                                '<td style="color: #999999; font-size: 11px; width: 230px; padding-right: 30px; text-align: right;">Total</td>' +
                                '<td style="color: #999999; font-size: 11px;">' + hitsTotal + '</td>' +
                                '<td style="color: #999999; font-size: 11px;">' + killsTotal + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 70px;">' + influTotal + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 50px;">' + rankTotal + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 50px;">&nbsp;</td>' +
                            '</tr>' +
                            '<tr class="current" style="font-weight: bold;">' +
                                '<td style="color: #999999; font-size: 11px; width: 230px; padding-right: 30px; text-align: right;">Average</td>' +
                                '<td style="color: #999999; font-size: 11px;">' + ~~(hitsTotal / 5) + '</td>' +
                                '<td style="color: #999999; font-size: 11px;">' + ~~(killsTotal / 5) + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 70px;">' + ~~(influTotal / 5) + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 50px;">' + ~~(rankTotal / 5) + '</td>' +
                                '<td style="color: #999999; font-size: 11px; width: 50px;">&nbsp;</td>' +
                            '</tr>';
                
                $('#influTable > tbody:last').append(influRow1);
            }
            
            $('.citizen_avatar').wrap('<a href="' + $('.citizen_avatar').css('background-image').match(/url\((.+)\)/i)[1].split('_')[0].replace(/"/i, '') + '.jpg" target="_blank" />');
        }
    },

    monetaryMarket: {
        o: function() {
            var transformer = function() {
                var goldIcon = '<img src="http://www.erepublik.net/images/modules/_icons/gold_icon.png" alt="">',
                    goldMode = $('#buy_flag em').text() == 'GOLD',
                    currency = $('#buy_flag em').text()
                ;

                $('.buy_mode .exchange_offers:first tbody tr').each(function() {
                    var $row = $(this);

                    $row.find('.ex_buy').append(
                        '<div style="clear:both;"></div>' +
                        '<div class="eraButtonContainer">' +
                            '<span class="eraButton eraAllButton" title="Set total amount">A</span>' +
                            '<span class="eraButton eraMaxButton last" title="Set maximum amount you can buy">M</span>' +
                        '</div>'
                    );

                    $row.find('.eraAllButton').click(function() {
                        if (false === $row.data('mutex')) return;
                        $row.data('mutex', false);

                        var $button = $row.find('.ex_buy button'),
                            amount = $button.data('max')
                        ;

                        $row.find('.buy_field').val(amount);

                        if (amount > 0) {
                            $button.text($button.data('i18n') + ' ' + numeral(amount * $button.data('price')).format('0,0.[00]') + ' ');

                            if (goldMode) {
                                $button.append($('<img>', {src: 'http://www.erepublik.net/images/modules/_icons/gold_icon.png'}));
                            } else {
                                $button.append(currency);
                            }
                        } else {
                            $button.text($button.attr('title'));
                        }

                        $row.data('mutex', true);
                    });

                    $row.find('.eraMaxButton').click(function() {
                        if (false === $row.data('mutex')) return;
                        $row.data('mutex', false);

                        var $button = $row.find('.ex_buy button'),
                            amount = ~~(((goldMode ? era.characterGold : era.characterMoney) / $button.data('price')) * 100) / 100
                        ;

                        if (amount > $button.data('max')) amount = $button.data('max');

                        $row.find('.buy_field').val(amount);

                        if (amount > 0) {
                            $button.text($button.data('i18n') + ' ' + numeral(amount * $button.data('price')).format('0,0.[00]') + ' ');

                            if (goldMode) {
                                $button.append($('<img>', {src: 'http://www.erepublik.net/images/modules/_icons/gold_icon.png'}));
                            } else {
                                $button.append(currency);
                            }
                        } else {
                            $button.text($button.attr('title'));
                        }

                        $row.data('mutex', true);
                    });
                });
            }

            document.addEventListener(!era.chrome ? 'animationstart' : 'webkitAnimationStart', function(e){
                if (e.animationName != 'nodeInserted' || !$(e.target).hasClass('exchange_offers') || $(e.target).data('eraTransformed')) return;

                $(e.target).data('eraTransformed', true);
                transformer();
            }, true);

            era.addStyle(
                '.buy_mode .exchange_offers {' +
                    '-webkit-animation-duration: 0.001s;' +
                    '-webkit-animation-name: nodeInserted;' +
                    '-moz-animation-duration: 0.001s;' +
                    '-moz-animation-name: nodeInserted;' +
                '}' +
                '.eraButtonContainer { display: inline-block; margin: 2px 0 0 0; -webkit-user-select: none; -moz-user-select: none; user-select: none; }' +
                '.eraButton {' +
                    'text-indent: 11px; color: #72abcc; font-size: 11px; cursor: pointer; font-family: Arial; height: 20px; text-shadow: #fff 0 1px 0; padding: 0; width: 29px; font-weight: bold; float: left; background-color: #d1eefb;' +
                    'background-image: -webkit-gradient(linear, left bottom, left top, color-stop(1, #eefaff), color-stop(0, #d1eefb));' +
                    'background-image: -webkit-linear-gradient(center bottom, #eefaff 0%, #d1eefb 100%);' +
                    'background-image: -moz-linear-gradient(top, #eefaff 0%, #d1eefb 100%);' +
                    'background-image: linear-gradient(top, #eefaff 0%,#d1eefb 100%);' +
                    'background-repeat: no-repeat; background-position: right; border: 1px solid #deeff7; border-bottom: 1px solid #b4dcee; white-space: nowrap; box-shadow: #fff 0 1px 0 inset; line-height: 20px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; -webkit-transition: width 0.15s ease-in-out; -moz-transition: width 0.15s ease-in-out; transition: width 0.15s ease-in-out; -webkit-transform: translateZ(0);' +
                '}' +
                '.eraButton.last { margin-left: 2px; text-indent: 9px; }' +
                '.eraButton:hover {' +
                    'background-color: #d6f0fb;' +
                    'background-image: -webkit-gradient(linear, left bottom, left top, color-stop(1, #f3fbff), color-stop(0, #d6f0fb));' +
                    'background-image: -webkit-linear-gradient(center bottom, #f3fbff 0%, #d6f0fb 100%);' +
                    'background-image: -moz-linear-gradient(top, #f3fbff 0%, #d6f0fb 100%);' +
                    'background-image: linear-gradient(top, #f3fbff 0%,#d6f0fb 100%);' +
                    'border: 1px solid #c9e6f3; border-bottom: 1px solid #93cce6; box-shadow: #fff 0 1px 0 inset,#cefefb 0 0 3px;' +
                '}' +
                '.eraButton:active {' +
                    'background-color:#ccecfb;' +
                    'background-image: -webkit-gradient(linear, left bottom, left top, color-stop(1, #e9f8ff), color-stop(0, #ccecfb));' +
                    'background-image: -webkit-linear-gradient(center bottom, #e9f8ff 0%, #ccecfb 100%);' +
                    'background-image: -moz-linear-gradient(top, #e9f8ff 0%, #ccecfb 100%);' +
                    'background-image: linear-gradient(top, #e9f8ff 0%,#ccecfb 100%);' +
                    'border-top: 1px solid #93cce6; box-shadow: #93cce6 0 1px 2px inset;' +
                '}'
            );

            if (!$('.buy_mode .exchange_offers:first').data('eraTransformed')) {
                $('.buy_mode .exchange_offers:first').data('eraTransformed', true);
                transformer();
            }
        }
    },

    battlefield: {
        o: function() {
            // Disable activity check.
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = 'function globalTick(){}';
            document.getElementsByTagName('head')[0].appendChild(script);
            // --

            // Show daily order progress.
            var dod = era.storage.get('Dod', {});

            era.settings.dotrack && dod.Battlefield == location.href.split('/')[6] && $('#pvp_actions').after(
                '<div class="dailyTrackerHolder">' +
                    '<div id="dailyTracker" class="dailyTrackerInner">' + dod.Progress + ' / 25</div>' +
                    '<div class="dtTipsy"><div class="dtTipsy-arrow">&nbsp;</div><div class="dtTipsy-inner">Daily orders progress</div></div>' +
                '</div>'
            );
            // --
            
            // Convert region name to region link.    
            $('#pvp_header h2:eq(0)').each(function() {
                var regionName = $(this).text();
                $(this).empty().append(
                    $('<a>', {class: 'regionLink', title: regionName, href: 'http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName], target: '_blank', text: regionName})
                );
            });
            // --

            // Determining natural enemy status and showing it's icon.
            var myCountry = $('#pvp_header div.country.left_side h3').text();
            var vsCountry = $('#pvp_header div.country.right_side h3').text();
            var natural = era.storage.get('Natural', {});
            var enemyNatural = false;
            var userCountry = currency_country[era.characterCurrency];
            
            if (myCountry.indexOf('Resistance') == -1 && vsCountry.indexOf('Resistance') == -1 && myCountry == userCountry && vsCountry == natural) {
                $('#pvp_header div.country.right_side a img').after('<img alt="" title="Natural enemy" src="' + neIcon + '" style="margin-top: -2px; position: absolute; margin-left: -9px;">');
                enemyNatural = true;
            }
            // --

            $('body').append($('<div>', {id: 'fightHappened', style: 'display: none;'}));

            (new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type != 'childList' || !mutation.addedNodes.length) return;

                    var data = JSON.parse($(mutation.target).text()),
                        influenceLog = era.storage.get('Influence', {})
                    ;

                    if (data.error || data.message != 'ENEMY_KILLED') return;

                    // Log hits.
                    influenceLog[era.erepDay].Hits += ~~data.hits;
                    // --

                    // Log influence and kill
                    // Update daily order progress data and display.
                    // Update left side mercenary tracker.
                    $('#pvp_header .country.left_side div:last').each(function() {
                        if (!$(this).hasClass('mercCheckRight')) {
                            var v = $(this).text() * 1 + 1;
                            v < 25 ? $(this).text(v).css('color', '#9e0b0f') : $(this).replaceWith('<div class="mercCheckRight" style="float: left; margin-top: 8px; margin-right: 10px;"></div>');
                        }
                    });

                    influenceLog[era.erepDay].Kills++;
                    influenceLog[era.erepDay].Influence += ~~data.user.givenDamage + Math.floor(~~data.user.givenDamage / 10) * data.oldEnemy.isNatural;

                    if (era.settings.dotrack) {
                        var dod = era.storage.get('Dod', {});
                        dod.Progress < 25 && dod.Battlefield == location.href.split('/')[6] && dod.Country == countryName_id[$('#pvp_header .country.left_side h3').text().replace('Resistance Force Of ', '')] && $('#dailyTracker').text(++dod.Progress + ' / 25');
                        era.storage.set('Dod', dod);
                    }
                    // --

                    // Log rank.
                    influenceLog[era.erepDay].Rank += ~~data.user.earnedRankPoints;
                    // --

                    era.storage.set('Influence', influenceLog);
                });    
            })).observe(document.querySelector('#fightHappened'), {attributes: true, childList: true, characterData: true});

            function fightTracker($) {
                $(document).ajaxSuccess(function(event, request, options) {
                    if (!/military\/fight-sh[o]+t/i.test(options.url) || request.status != 200) return;
                    $('#fightHappened').text(request.responseText);
                });
            }

            var script = document.createElement('script');
            script.type  = 'text/javascript';
            script.text = '(' + fightTracker + ')(jQuery);'
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    },

    miniInventory: {
        o: function() {
            var itemIndustry;
            var itemQuality;
            var itemCount;
            var itemPresent = false;
            
            var rawIndustry;
            var rawCount;
            var rawPresent = false;

            var marketOffers = era.storage.get('MarketOffers', []);
            var storageStatus = era.storage.get('StorageStatus', {});
            var storageContent = era.storage.get('StorageContent', {});
            
            $('.inventoryHolder a:first').empty().append(
                $('<div>', {style: 'text-align: center; display: block; float: left; color: #b4b4b4; width: 100%; margin-bottom: 3px;', text: 'Storage' + (!storageStatus.hasOwnProperty('currentSize') || !storageStatus.hasOwnProperty('maxSize') ? '' : ' (' + numeral(storageStatus.currentSize).format('0,0') + '/' + numeral(storageStatus.maxSize).format('0,0') + ')')})
            );
            
            $('.inventoryHolder a:first').append('<div id="miniInventory1" class="miniInventoryHolder"></div>');
            
            if (marketOffers.length) {
                $('.inventoryHolder a:first').append('<div style="text-align: center; display: block; float: left; color: #b4b4b4; width: 100%; margin-bottom: 3px;">On market</div>' +
                                                '<div id="miniInventory3" class="miniInventoryHolder"></div>');
            }
         
            if (storageContent.hasOwnProperty('cooked')) {
                for (var i in storageContent.cooked) {
                    var icon;

                    if (storageContent.cooked[i].industry == 2 && storageContent.cooked[i].quality == 141) {
                        icon = '<img src="http://www.erepublik.com/images/icons/industry/999/26.png">';
                    } else if (storageContent.cooked[i].industry == 2 && storageContent.cooked[i].quality == 13) {
                        icon = '<img src="http://s3.www.erepublik.net/images/icons/industry/999/1.png">';
                    } else if (storageContent.cooked[i].industry == 2 && storageContent.cooked[i].quality == 1213) {
                        icon = '<img src="http://s1.www.erepublik.net/images/icons/industry/999/21.png">';
                    } else if (storageContent.cooked[i].industry == 2 && storageContent.cooked[i].quality == 12) {
                        icon = '<img src="http://s3.www.erepublik.net/images/icons/industry/999/1.png">';
                    } else if (storageContent.cooked[i].industry == 2 && storageContent.cooked[i].quality == 1212) {
                        icon = '<img src="http://s1.www.erepublik.net/images/icons/industry/999/21.png">';
                    } else {
                        icon = '<img src="http://www.erepublik.com/images/icons/industry/' + storageContent.cooked[i].industry + '/q' + storageContent.cooked[i].quality + '.png">';
                    }

                    $('#miniInventory1').append(
                        '<div class="itemCountHolder">' +
                            icon +
                            '<strong style="color: #585858; font-size: 12px; text-shadow: 0 1px 0 #FFFFFF; font-weight: bold;">' + storageContent.cooked[i].amount + '</strong>' +
                        '</div>'
                    );
                }
            }

            if (storageContent.hasOwnProperty('raw')) {
                for (var i in storageContent.raw) {
                    $('#miniInventory1').append('<div class="itemCountHolder">' +
                                                    '<img src="http://www.erepublik.com/images/icons/industry/' + storageContent.raw[i].industry + '/default.png">' +
                                                    '<strong style="color: #585858; font-size: 12px; text-shadow: 0 1px 0 #FFFFFF; font-weight: bold;">' + storageContent.raw[i].amount + '</strong>' +
                                                '</div>');
                }
            }
            
            if (storageContent.hasOwnProperty('bazooka') && storageContent.bazooka > 0) {
                $('#miniInventory1').append('<div class="itemCountHolder">' +
                                                '<img src="http://www.erepublik.com/images/icons/industry/000/1.png">' +
                                                '<strong style="color: #585858; font-size: 12px; text-shadow: 0 1px 0 #FFFFFF; font-weight: bold;">' + storageContent.bazooka + '</strong>' +
                                            '</div>');
            }
            
            var citizenshipCountry = id_country[era.characterCitizenshipId];
            var taxes = era.storage.get('TaxValues', {});
            var marketOffers = era.storage.get('MarketOffers', []);

            for (var i in marketOffers) {
                var foreignOffer = function() {
                    return marketOffers[i].country != currency_country[era.characterCurrency];
                }

                var offVat = Number(taxes[country_id[marketOffers[i].country.toLowerCase()]][marketOffers[i].industry].value_added_tax);
                var offImp = Number(taxes[country_id[marketOffers[i].country.toLowerCase()]][marketOffers[i].industry].import_tax);

                var offPriceTax = parseFloat(marketOffers[i].price) / (1 + ((offVat + offImp * foreignOffer()) / 100));
                var tOfferVal = marketOffers[i].amount * parseFloat(marketOffers[i].price) / (1 + ((offVat + offImp * foreignOffer()) / 100));

                $('#miniInventory3').append('<div id="itemCountHolder_' + marketOffers[i].id + '" class="itemCountHolder">' +
                                                (marketOffers[i].quality > 0 ? '<img src="http://www.erepublik.com/images/icons/industry/' + marketOffers[i].industry + '/q' + marketOffers[i].quality + '.png">' : '<img src="http://www.erepublik.com/images/icons/industry/' + marketOffers[i].industry + '/default.png">') +
                                                '<strong style="color: #585858; font-size: 12px; text-shadow: 0 1px 0 #FFFFFF; font-weight: bold;">' + marketOffers[i].amount + '</strong>' +
                                                '<img style="float: right; margin-right: 3px; margin-left: 3px; margin-top: 5px; height: 16px; width: 16px;" title="' + era.characterCurrency + '" alt="' + era.characterCurrency + '" src="http://www.erepublik.com/images/flags_png/S/' + marketOffers[i].country + '.png">' +
                                                '<span style="float: right; font-size: 11px; color: grey;">' + marketOffers[i].price + '</span>' +
                                            '</div>' +
                                            '<div id="marketDropHolder_' + marketOffers[i].id + '" class="marketDropHolder">' +
                                                '<img style="float: right; margin-right: 3px; margin-left: 3px; margin-top: 5px; height: 16px; width: 16px;" title="Gold" alt="Gold" src="http://www.erepublik.com/images/modules/_icons/gold.png">' +
                                                '<span id="offPriceTaxG_' + marketOffers[i].id + '" style="float: right; font-size: 11px; color: grey; margin-left: 5px;">n/a</span>' +
                                                '<img style="float: right; margin-right: 3px; margin-left: 3px; margin-top: 5px; height: 16px; width: 16px;" title="' + era.characterCurrency + '" alt="' + era.characterCurrency + '" src="http://www.erepublik.com/images/flags_png/S/' + marketOffers[i].country + '.png">' +
                                                '<span style="float: right; font-size: 11px; color: grey;">' + offPriceTax.toFixed(2) + '</span>' +
                                                
                                                '<img style="float: right; margin-right: 3px; margin-left: 3px; margin-top: 5px; height: 16px; width: 16px; clear: both;" title="Gold" alt="Gold" src="http://www.erepublik.com/images/modules/_icons/gold.png">' +
                                                '<span id="tOfferValG_' + marketOffers[i].id + '" style="float: right; font-size: 11px; color: grey; margin-left: 5px;">n/a</span>' +
                                                '<img style="float: right; margin-right: 3px; margin-left: 3px; margin-top: 5px; height: 16px; width: 16px;" title="' + era.characterCurrency + '" alt="' + era.characterCurrency + '" src="http://www.erepublik.com/images/flags_png/S/' + marketOffers[i].country + '.png">' +
                                                '<span style="float: right; font-size: 11px; color: grey;">' + tOfferVal.toFixed(2) + '</span>' +
                                            '</div>');
                
                $('#offPriceTaxG_' + marketOffers[i].id).gold(offPriceTax, 4);
                $('#tOfferValG_' + marketOffers[i].id).gold(tOfferVal, 4);
            }
            
            $('#miniInventory1 div:last').css('border-bottom', 'none');
            $('#miniInventory3 .itemCountHolder:last').css('border-bottom', 'none');
            $('#miniInventory3 .marketDropHolder:last').css('border-bottom', 'none');

            $('div[id*="itemCountHolder_"]').hover(function() {
                $(this)
                    .css('border-bottom', '1px solid #DEDEDE')
                    .parent().find('div[id*="marketDropHolder_' + $(this).attr('id').split('_')[1] + '"]').css('display', 'block')
                ;
            }, function() {
                $('#miniInventory3 .itemCountHolder:last, #miniInventory3 .marketDropHolder:last').css('border-bottom', 'none');
                $(this).parent().find('div[id*="marketDropHolder_' + $(this).attr('id').split('_')[1] + '"]').css('display', 'none');
            });
        }
    },

    miniMonetary: {
        o: function() {
            var monetaryOffers = era.storage.get('MonetaryOffers', []);

            if(!monetaryOffers.length) return;
            
            $('.inventoryHolder').append('<a href="http://www.erepublik.com/' + era.hostLang + '/economy/exchange-market"><div style="text-align: center; display: block; float: left; color: #b4b4b4; width: 100%; margin-bottom: 3px;">Monetary market</div><div id="miniMonetary1" class="miniInventoryHolder"></div></a>');

            for (var i in monetaryOffers) {
                $('#miniMonetary1').append('<div id="monCountHolder_' + monetaryOffers[i].id + '" class="monCountHolder">' +
                                                (monetaryOffers[i].currency == 'GOLD' ? '<img title="Gold" alt="Gold" src="http://www.erepublik.com/images/modules/_icons/gold.png">' : '<img title="' + monetaryOffers[i].currency + '" alt="' + monetaryOffers[i].currency + '" src="http://www.erepublik.com/images/flags_png/S/' + currency_country[monetaryOffers[i].currency] + '.png">') +
                                                '<strong style="color: #585858; font-size: 12px; text-shadow: 0 1px 0 #FFFFFF; font-weight: bold; float: left;">' + (monetaryOffers[i].currency == 'GOLD' ? (monetaryOffers[i].amount * 1).toFixed(2) : (monetaryOffers[i].amount * 1).toFixed(0) ) + '</strong>' +
                                                (monetaryOffers[i].currency == 'GOLD' ? '<img title="' + era.characterCurrency + '" alt="' + era.characterCurrency + '" src="http://www.erepublik.com/images/flags_png/S/' + currency_country[era.characterCurrency] + '.png" style="float: right; margin-left: 6px; margin-right: 1px; margin-top: 6px;">' : '<img title="Gold" alt="Gold" src="http://www.erepublik.com/images/modules/_icons/gold.png" style="float: right; margin-left: 6px; margin-right: 1px; margin-top: 6px;">') +
                                                '<span style="color: grey; font-size: 11px; text-shadow: 0 1px 0 #FFFFFF; float: right;">' + (monetaryOffers[i].currency == 'GOLD' ? (monetaryOffers[i].rate * 1).toFixed(0) : (monetaryOffers[i].rate * 1).toFixed(2) ) + '</strong>' +
                                            '</div>' +
                                            '<div id="monDropHolder_' + monetaryOffers[i].id + '" class="monDropHolder">' +
                                                (monetaryOffers[i].currency == 'GOLD' ? '<img title="' + era.characterCurrency + '" alt="' + era.characterCurrency + '" src="http://www.erepublik.com/images/flags_png/S/' + currency_country[era.characterCurrency] + '.png" style="float: right; margin-left: 6px; margin-right: 1px; margin-top: 6px;">' : '<img title="Gold" alt="Gold" src="http://www.erepublik.com/images/modules/_icons/gold.png" style="float: right; margin-left: 6px; margin-right: 1px; margin-top: 6px;">') +
                                                '<span style="float: right; font-size: 11px; color: grey; margin-left: 5px;">' + (monetaryOffers[i].currency == 'GOLD' ? (monetaryOffers[i].amount * monetaryOffers[i].rate).toFixed(0) : (monetaryOffers[i].amount * monetaryOffers[i].rate).toFixed(2) ) + '</span>' +
                                            '</div>');
            }
            
            $('#miniMonetary1 .monCountHolder:last').css('border-bottom', 'none');
            $('#miniMonetary1 .monDropHolder:last').css('border-bottom', 'none');

            $('div[id*="monCountHolder_"]').hover(function() {
                $(this)
                    .css('border-bottom', '1px solid #DEDEDE')
                    .parent().find('div[id*="monDropHolder_' + $(this).attr('id').split('_')[1] + '"]').css('display', 'block')
                ;
            }, function() {
                $('#miniMonetary1 .monCountHolder:last, #miniMonetary1 .monDropHolder:last').css('border-bottom', 'none');
                $(this).parent().find('div[id*="monDropHolder_' + $(this).attr('id').split('_')[1] + '"]').css('display', 'none');
            });
        }
    },

    miniMercenary: {
        o: function() {
            var mercenaryProgress = era.storage.get('MercenaryProgress', {});

            if (!mercenaryProgress.hasOwnProperty('totalProgress') || mercenaryProgress.totalProgress >= 50 || !mercenaryProgress.hasOwnProperty('countryProgress') || 'object' != typeof mercenaryProgress.countryProgress) return;
            
            $('.inventoryHolder').append('<div style="text-align: center; display: block; float: left; color: #b4b4b4; width: 100%; margin-bottom: 3px;">Mercenary</div><div id="miniMercenary1" class="miniInventoryHolder" style="cursor: default;"></div>');

            var tmp = '<div id="mercHolder" class="mercHolder" data-state="0" style="text-align: center; position: relative; cursor: pointer;">' +
                                            '<div id="mercenaryTooltip" style="display: none; position: absolute;">' +
                                                '<div style="font-size: 11px; background-color: #fffcc8; line-height: initial; padding: 5px; border-radius: 4px; border: 1px solid #ffd800; color: #595959;">Defeat 25 enemies for 50 different countries to get Mercenary medal.</div>' +
                                                '<div style="width: 0; height: 0; border: 1px solid transparent; border-top-color: #ffd800; border-width: 4px 4px; margin: auto;"></div>' +
                                            '</div>' +
                                            '<div class="mercBarBg">' +
                                                '<img src="' + mercBarIcon + '" alt="" style="position: absolute; top: -1px; z-index: 3; left: -5px;">' +
                                                '<strong id="currMercProgress" style="width: 100%; text-align: center; position: absolute; right: 2px; top: 2px; height: 17px; font-size: 11px; line-height: 17px; z-index: 3; color: #333; color: rgba(51, 74, 33, 0.6); text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4),0 0 5px rgba(255, 255, 255, 0.9);">' + mercenaryProgress.totalProgress + ' / 50</strong>' +
                                                '<div id="mercBarProgress" class="mercBarProgress"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="mercDropHolder" class="mercDropHolder" style="text-align: center;">' +
                                            '<ul class="mercList" style="font-size: 11px; color: grey;">';

                                        for (var i in mercenaryProgress.countryProgress) {
            tmp +=                                  '<li title="' + mercenaryProgress.countryProgress[i].country + '">' +
                                                        '<img src="http://www.erepublik.com/images/flags_png/S/' + id_country[countryName_id[mercenaryProgress.countryProgress[i].country]] + '.png" alt="">' +
                                                        '<small>' + i + '</small>' +
                                                        '<em style="background-image: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: rgb(225, 225, 225); background-position: initial initial; background-repeat: initial initial; ">' + mercenaryProgress.countryProgress[i].progress + '/25</em>' +
                                                    '</li>';
                                        }


            tmp +=                          '</ul>' +
                                        '</div>';

            $('#miniMercenary1').append(tmp);
            
            $('#mercBarProgress').css('width', mercenaryProgress.totalProgress / 0.5 + '%');
            
            $('.mercList li em').each(function() {
                if($(this).html() == '0/25') {
                    $(this).css({
                        'background' : '#e9e9e9',
                        'backgroundColor' : '#e1e1e1',
                        'backgroundImage' : '-webkit-gradient(linear, left bottom, left top, color-stop(1, #e9e9e9), color-stop(0, #e1e1e1))',
                        'backgroundImage' : '-webkit-linear-gradient(center bottom, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-moz-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-o-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',
                        'backgroundImage' : '-ms-linear-gradient(top, #e9e9e9 0%, #e1e1e1 100%)',

                        'backgroundImage' : 'linear-gradient(top, #e9e9e9 0%,#e1e1e1 100%)'
                    });
                } else if ($(this).html() == '25/25') {
                    $(this).parent().remove();
                }
            });

            $('#mercHolder').hover(
                function() {
                    $('#mercenaryTooltip').css('top', 7 - $('#mercenaryTooltip').height() + 'px').show();
                },
                function() {
                    $('#mercenaryTooltip').hide();
                }
            ).click(function() {
                if ($(this).data('state')) {
                    $('#mercDropHolder').hide();
                    $(this).data('state', 0)
                } else {
                    $('#mercDropHolder').show();
                    $(this).data('state', 1)
                }
            });
        }
    },

    searchRedirect: {
        o: function() {
            if (eRAopt['search'] == false || $('table.bestof:first tr').length != 2) {
                return;
            }

            $('<tr/>').append($('<td>', {colspan: 4, style: 'text-align: center; padding: 10px;', text: 'Redirecting...'})).insertAfter('table.bestof:first tr:last');
            location.assign($('.entity a:first').attr('href'));
        }
    },

    changeComments: {
        o: function() {
            if (!era.settings.news) return;
            
            // time stamp
            var timeNow = $('#live_time').text().split(':');
            var totalTimeNow = (parseInt(era.erepDay, 10) * 1440) + (parseInt(timeNow[0], 10) * 60) + parseInt(timeNow[1], 10);
            
            $('#comments_div .comment-holder').each(function() {
                var commentTimestamp = $(this).find('.article_comment_posted_at').text().match(/(\d+,\d+),[ ]+(\d+:\d+)/);
                
                var commentDay = ~~commentTimestamp[1].match(/\d+/g).join('');
                var commentTime = commentTimestamp[2].split(':');
                
                var totalTimeCom = (commentDay * 1440) + (commentTime[0] * 60) + ~~commentTime[1];
                var totalMinutes = totalTimeNow - totalTimeCom;
                
                var showText = '';
                var comYears = Math.floor(totalMinutes / 525600);
                if (comYears > 0) {
                    showText = 'more than one year';
                } else {
                    var comDays = Math.floor(totalMinutes / 1440);
                    showText = (comDays > 0) ? comDays + 'd ' : '';
                    var comHours = Math.floor((totalMinutes - (comDays * 1440)) / 60);
                    showText += (comHours > 0) ? comHours + 'h ' : '';
                    var comMinutes = Math.floor(totalMinutes - (comDays * 1440) - (comHours * 60));
                    if (totalMinutes > 0) {
                        showText += (comMinutes > 0) ? comMinutes + 'm' : '';
                    } else {
                        showText += 'less then min.';
                    }
                }

                $(this).find('.reply_links').append('<li style="color: #999; font-size: 11px;">' + showText + ' ago</li>');
            });
        }
    },

    betterMessages: {
        o: function() {
            era.addStyle(
                '#message_form .widearea-wrapper {' +
                    '-webkit-animation-duration: 0.001s;' +
                    '-webkit-animation-name: nodeInserted;' +
                    '-moz-animation-duration: 0.001s;' +
                    '-moz-animation-name: nodeInserted;' +
                '}'
            );

            document.addEventListener(!era.chrome ? 'animationstart' : 'webkitAnimationStart', function(e){
                if (e.animationName != 'nodeInserted' || !$(e.target).hasClass('widearea-wrapper') || $('#message_form igmClear').length) return;

                $('#message_form').append(
                    '<a href="javascript:;" id="igmClear" title="Delete saved message and subject" class="fluid_blue_dark_medium" style="margin-right: 10px; float: right;">' +
                        '<span class="bold">Clear</span>' +
                    '</a>' +
                    '<a href="javascript:;" id="igmSave" title="Save message and subject" class="fluid_blue_dark_medium" style="margin-right: 10px; float: right;">' +
                        '<span class="bold">Save</span>' +
                    '</a>' +
                    '<a href="javascript:;" id="igmFill" title="Fill the fields with the saved data" class="fluid_blue_dark_medium" style="margin-right: 10px; float: right;">' +
                        '<span class="bold">Fill</span>' +
                    '</a>'
                );

                $('#igmFill').click(function() {
                    var data = era.storage.get('Messenger', {});
                    $('#citizen_subject').length && $('#citizen_subject').val(data.subject);
                    $('#citizen_message').val(data.message);
                });
                
                $('#igmSave').click(function() {
                    var data = {};
                    $('#citizen_subject').length && (data.subject = $('#citizen_subject').val()) || (data.subject = '');
                    data.message = $('#citizen_message').val();
                    era.storage.set('Messenger', data);
                });
                
                $('#igmClear').click(function() {
                    var data = {message: '', subject: ''};
                    confirm('Are you sure you want to delete the saved message and subject?') && era.storage.set('Messenger', data);
                });
            }, true);
        }
    },

    enchantInventory: {
        o: function() {
            document.countries = [];
            $('#market_licenses_select .ml_repeat li a').each(function() {
                document.countries.push($(this).attr('title'));
            });

            if (eRAopt['inventory'] == false) return;

            var taxes = era.storage.get('TaxValues', {});
            var citCountry = $('#content script:last').text().split('var ')[5].replace('citizenshipCountry = ', '').match(/^[0-9]+/i)[0];
            var initValue = parseFloat($('#sell_price').val());
            var initTax = parseFloat($('#tax').text().split(' ')[0]);
            var initCurr = $('#sell_currency').text();
            var initAmount = parseFloat($('#sell_amount').val());
            var citizenCurrency = country_currency[id_country[citCountry]];
            var originalRowCount = $('#sell_offers > table tr:gt(1):not(:last)').length;

            $('.offers_price').css('height', '110px').css('width', '330px');
            $('.offers_product').css('width', '70px');
            $('.offers_quantity').css('width', '100px');
            $('.buy_market_license td').attr('colspan', '7').find('div:first').css('float', 'none').css('width', '100%');
            $('#big_notifiers').css('padding-top', '15px').css('padding-bottom', '5px').css('width', '716px');
            $('.delete_offer').css('opacity', '1');
            $('.offers_action').css('padding-left', '0px');

            $('.offers_price').after(
                '<th id="priceWithoutTax" class="offers_price" style="width: 225px; padding-left: 5px;">' +
                    '<div class="relative">' +
                        '<strong style="text-align: center; margin-bottom: 3px; margin-top: -45px;">Price / unit<br/>w/o Tax</strong>' +
                        '<small id="wtax" style="top: -7px;"><span id="priceWoTax">n/a</span> <span class="destCurrency">n/a</span></small><small id="wtaxG" style="font-size: 10px; top: -7px;"><br /><span>n/a</span> GOLD</small>' +
                    '</div>' +
                '</th>'
            );

            $('#priceWithoutTax').after(
                '<th id="totalValue" class="offers_price" style="width: 90px; padding-left: 10px;">' +
                    '<div class="relative">' +
                        '<strong style="text-align: center; margin-bottom: 3px; margin-top: -45px;">Total value<br/>w/o Tax</strong>' +
                        '<small id="tvwotax" style="top: -7px;"><span id="tPriceWoTax">n/a</span> <span class="destCurrency">n/a</span></small><small id="tvwotaxG" style="font-size: 10px; top: -7px;"><br /><span>n/a</span> GOLD</small>' +
                    '</div>' +
                '</th>'
            );

            $('#sell_offers table').append(
                '<tfoot>' +
                    '<tr style="background: none repeat scroll 0 0 #F7FCFF;">' +
                        '<td colspan="4">&nbsp;</td>' +
                        '<td id="marketTotals" style="border-top: 1px solid #E2F3F9; color: #5E5E5E; padding-left: 12px;">' +
                            '<strong id="sumValue">' + (0).toFixed(2) + '</strong>&nbsp;' + citizenCurrency + '<br>' +
                            '<strong style="color: #B2B2B2; font-size: 10px;" id="sumGold">' + (0).toFixed(4) + '</strong>' +
                            '<span style="color: #B2B2B2; font-size: 10px;">&nbsp;GOLD</span>' +
                        '</td>' +
                        '<td colspan="2">&nbsp;</td>' +
                    '</tr>' +
                '</tfoot>'
            ).find('th:not(#totalValue, .offers_action)').css('padding-left', '10px');

            $('#sell_offers').bind('update', function() {
                var price = $('#sell_price').val().replace(',', '.');
                price = isNaN(price) ? 0 : price;

                var tax = $('#tax').text().split(' ')[0];
                tax = isNaN(tax) ? 0 : tax;

                var amount = $('#sell_amount').val().replace(',', '.');
                amount = isNaN(amount) ? 0 : amount;

                var taxlessPrice = price - tax;

                var currency = $('#sell_currency').text();

                $('.destCurrency').text(currency);

                $('#priceWoTax').text(taxlessPrice.toFixed(2));
                $('#wtaxG span').text('n/a').gold(taxlessPrice, 4);

                $('#tPriceWoTax').text((amount * taxlessPrice).toFixed(2));
                $('#tvwotaxG span').text('n/a').gold(amount * taxlessPrice, 4);
            });

            $('#sell_offers').triggerHandler('update');

            $('#sell_price, #sell_amount').bind('keyup', function() { $('#sell_offers').triggerHandler('update'); });
            $('.ml_selector, .sell_selector a').click(function() { $('#sell_offers').triggerHandler('update'); });    

            var enchantOffer = function(i) {
                var offerId = $(this).attr('id').split('_')[1];
                var offerCurrency = country_currency[id_country[countryName_id[$(this).find('.offer_flag').attr('title')]]];
                var offerPrice = $(this).find('.offer_price strong').text().replace(',', '');
                var offerIndustry = $(this).find('.offer_image').attr('src').split('/')[6];
                var offerAmount = $(this).find('.offer_amount').text().replace(',', '');

                var foreignOffer = function() {
                    return !(new RegExp(citizenCurrency, 'i')).test(offerCurrency);
                }

                var taxVat = parseFloat(taxes[country_id[currency_country[offerCurrency].toLowerCase()]][offerIndustry].value_added_tax);
                var taxImp = parseFloat(taxes[country_id[currency_country[offerCurrency].toLowerCase()]][offerIndustry].import_tax);

                var taxlessOfferPrice = offerPrice / (1 + ((taxVat + taxImp * foreignOffer()) / 100));

                
                if (offerIndustry > 0 && offerIndustry < 7)
                    var offerQuality = $(this).find('.offer_image').attr('src').split('/')[7].split('_')[0].replace('q', '');
                else
                    var offerQuality = 1;

                $(this).find('.offer_price').append(
                    '<br/>' +
                    '<strong class="goldOfferPrice" style="color: #B2B2B2; font-size: 10px;">n/a</strong>' +
                    '<span style="color: #B2B2B2; font-size: 10px;"> GOLD</span>'
                );

                $(this).find('.goldOfferPrice').gold(offerPrice, 4);

                $(this).find('.offer_price').after(
                    '<td style="border-top: 1px solid #E2F3F9; color: #5E5E5E; padding-left: 12px;">' +
                        '<strong class="taxlessOfferPrice">' + taxlessOfferPrice.toFixed(2) + '</strong> ' + citizenCurrency + '<br>' +
                        '<strong class="goldTaxlessOfferPrice" style="color: #B2B2B2; font-size: 10px;">n/a</strong>' +
                        '<span style="color: #B2B2B2; font-size: 10px;"> GOLD</span>' +
                    '</td>' +
                    '<td style="border-top: 1px solid #E2F3F9; color: #5E5E5E; padding-left: 12px;">' +
                        '<strong class="taxlessTotalOfferPrice">' + (offerAmount * taxlessOfferPrice).toFixed(2) + '</strong> ' + citizenCurrency + '<br>' +
                        '<strong class="goldTaxlessTotalOfferPrice" style="color: #B2B2B2; font-size: 10px;">n/a</strong>' +
                        '<span style="color: #B2B2B2; font-size: 10px;">&nbsp;GOLD</span>' +
                    '</td>'
                );

                $(this).find('.goldTaxlessOfferPrice').gold(taxlessOfferPrice, 4);

                $(this).find('.goldTaxlessTotalOfferPrice').gold(offerAmount * taxlessOfferPrice, 4, null, function(v) {
                    (i == originalRowCount || typeof i != 'number') && $('#sell_offers > table:first').triggerHandler('totalRecalc');
                });

                $(this).find('.delete_offer').before(
                    '<a title="Visit market" target="_blank" class="fluid_blue_dark_small" style="padding-left: 3px;" id="visit_market" href="http://www.erepublik.com/' + era.hostLang + '/economy/market/' + country_id[currency_country[offerCurrency].toLowerCase()] + '/' + offerIndustry + '/' + offerQuality + '/citizen/0/price_asc/1">' +
                        '<span>M</span>' +
                    '</a>'
                );

                $(this).find('td:last').css('padding-left', '15px');
                $(this).find('td:eq(5)').css('padding-left', '19px');
            };

            var updateOffer = function() {
                var offerCurrency = country_currency[id_country[countryName_id[$(this).find('.offer_flag').attr('title')]]];
                var offerPrice = $(this).find('.offer_price strong').text().replace(',', '');
                var offerIndustry = $(this).find('.offer_image').attr('src').split('/')[6];
                var offerAmount = $(this).find('.offer_amount').text().replace(',', '');

                var foreignOffer = function() {
                    return !(new RegExp(citizenCurrency, 'i')).test(offerCurrency);
                }

                var taxVat = parseFloat(taxes[country_id[currency_country[offerCurrency].toLowerCase()]][offerIndustry].value_added_tax);
                var taxImp = parseFloat(taxes[country_id[currency_country[offerCurrency].toLowerCase()]][offerIndustry].import_tax);

                var taxlessOfferPrice = offerPrice / (1 + ((taxVat + taxImp * foreignOffer()) / 100));

                $(this).find('.offer_price').append(
                    '<br/>' +
                    '<strong class="goldOfferPrice" style="color: #B2B2B2; font-size: 10px;">n/a</strong>' +
                    '<span style="color: #B2B2B2; font-size: 10px;"> GOLD</span>'
                );

                $(this).find('.goldOfferPrice').gold(offerPrice, 4);

                $(this).find('.taxlessOfferPrice').text(taxlessOfferPrice.toFixed(2));

                $(this).find('.goldTaxlessOfferPrice').gold(taxlessOfferPrice, 4);

                $(this).find('.taxlessTotalOfferPrice').text((offerAmount * taxlessOfferPrice).toFixed(2));

                $(this).find('.goldTaxlessTotalOfferPrice').gold(offerAmount * taxlessOfferPrice, 4, null, function(v) {
                    $('#sell_offers > table:first').triggerHandler('totalRecalc');
                });
            }

            $('#sell_offers > table:first').bind('totalRecalc', function() {
                var ttv = 0;

                $('#sell_offers > table tr:gt(1):not(:last)').each(function() {
                    ttv += $(this).find('.taxlessTotalOfferPrice').text() * 1;
                    
                    $('#sumValue').text(isNaN(ttv) ? 'n/a' : (ttv).toFixed(2));

                    if (!isNaN(ttv)) $('#sumGold').gold(ttv, 4, function(v) {
                        return $('#sumValue').text() != 0 ? v : (0).toFixed(4);
                    });
                    else $('#sumGold').text('n/a');
                });

                if (ttv == 0) {
                    $('#sumValue').text((0).toFixed(2));
                    $('#sumGold').text((0).toFixed(4));
                }
            });

            $(document).on('click', '.delete_offer', function() {
                $(this).parent().parent().remove();
                $('#sell_offers > table:first').triggerHandler('totalRecalc');
            });

            $('#sell_offers > table:first').bind('DOMNodeInserted', function(e) {
                if (era.chrome) {
                    if(/^tr$/i.test(e.target.tagName)) {
                        $(e.target).find('.delete_offer').css('opacity', '1');
            
                        if ($(e.target).find('td').length == 7) updateOffer.apply(e.target);
                        else enchantOffer.apply(e.target);
                    }
                } else {
                    setTimeout(function() {
                        if(/^tr$/i.test(e.target.tagName)) {
                            $(e.target).find('.delete_offer').css('opacity', '1');
                
                            if ($(e.target).find('td').length == 7) updateOffer.apply(e.target);
                            else enchantOffer.apply(e.target);
                        }
                    }, 0);
                }
            });

            $('#sell_offers > table tr:gt(1):not(:last)').each(enchantOffer);
        }
    },

    taxTable: {
        o: function() {
            if (eRAopt['taxes'] == false) {
                return;
            }
            
            var taxData = JSON.parse($('#content script:last').text().split('var ')[4].replace('countryList = ', '').replace(';', ''));
            var citizenCountry = $.trim($('#content script:last').text().split('var ')[5].replace('citizenshipCountry = ', '').replace(';', ''));
            
            $('#sell_offers').after('<div class="taxTbl" style="display: block;">' +
                                        '<table id="taxTable" width="100%">' +
                                            '<thead>' +
                                                '<tr>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;">&nbsp;</th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/1/q6.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/2/q6.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/3/q5.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/4/q5.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/5/q5.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/6/default.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/7/default.png"></th>' +
                                                    '<th style="height: 40px; text-align: center; padding-left: 0px;"><img width="35px" height="35px" src="http://www.erepublik.com/images/icons/industry/12/default.png"></th>' +
                                                '</tr>' +
                                            '</thead>' +
                                            '<tbody></tbody>' +
                                        '</table>' +
                                    '</div>');
            
            $('#market_licenses_select .ml_repeat li').each(function() {
                var countrCode = country_id[$(this).find('img').attr('src').split('/')[6].split('.')[0].toLowerCase()];
                var countrName = $(this).find('img').attr('alt');
                var countrFlag = $(this).find('img').attr('src');
                
                if (countrCode == citizenCountry) {
                    var taxSum1 = parseFloat(taxData[countrCode].taxes["1"].value_added_tax);
                    var taxSum2 = parseFloat(taxData[countrCode].taxes["2"].value_added_tax);
                    var taxSum3 = parseFloat(taxData[countrCode].taxes["3"].value_added_tax);
                    var taxSum4 = parseFloat(taxData[countrCode].taxes["4"].value_added_tax);
                    var taxSum5 = parseFloat(taxData[countrCode].taxes["5"].value_added_tax);
                    var taxSum6 = parseFloat(taxData[countrCode].taxes["6"].value_added_tax);
                    var taxSum7 = parseFloat(taxData[countrCode].taxes["7"].value_added_tax);
                    var taxSum12 = parseFloat(taxData[countrCode].taxes["12"].value_added_tax);
                } else {
                    var taxSum1 = parseFloat(taxData[countrCode].taxes["1"].value_added_tax) + parseFloat(taxData[countrCode].taxes["1"].import_tax);
                    var taxSum2 = parseFloat(taxData[countrCode].taxes["2"].value_added_tax) + parseFloat(taxData[countrCode].taxes["2"].import_tax);
                    var taxSum3 = parseFloat(taxData[countrCode].taxes["3"].value_added_tax) + parseFloat(taxData[countrCode].taxes["3"].import_tax);
                    var taxSum4 = parseFloat(taxData[countrCode].taxes["4"].value_added_tax) + parseFloat(taxData[countrCode].taxes["4"].import_tax);
                    var taxSum5 = parseFloat(taxData[countrCode].taxes["5"].value_added_tax) + parseFloat(taxData[countrCode].taxes["5"].import_tax);
                    var taxSum6 = parseFloat(taxData[countrCode].taxes["6"].value_added_tax) + parseFloat(taxData[countrCode].taxes["6"].import_tax);
                    var taxSum7 = parseFloat(taxData[countrCode].taxes["7"].value_added_tax) + parseFloat(taxData[countrCode].taxes["7"].import_tax);
                    var taxSum12 = parseFloat(taxData[countrCode].taxes["12"].value_added_tax) + parseFloat(taxData[countrCode].taxes["12"].import_tax);
                }
                
                function generateItem(industry, quality) {
                    var genItem = '<a href="http://www.erepublik.com/' + era.hostLang + '/economy/market/' + countrCode + '/' + industry + '/' + quality + '/citizen/0/price_asc/1" target="_blank"><div class="taxLinkItem">Q' + quality + '</div></a>';
                    return (genItem);
                }

                $('#taxTable tbody').append('<tr>' +
                                                '<td style="padding-left: 5px;"><img style="vertical-align: top;" src="' + countrFlag + '"> ' + countrName + '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(1, 1) +
                                                        generateItem(1, 2) +
                                                        generateItem(1, 3) +
                                                        generateItem(1, 4) +
                                                        generateItem(1, 5) +
                                                        generateItem(1, 6) +
                                                        generateItem(1, 7) +
                                                    '</div>' +
                                                    '<span>' + taxSum1 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(2, 1) +
                                                        generateItem(2, 2) +
                                                        generateItem(2, 3) +
                                                        generateItem(2, 4) +
                                                        generateItem(2, 5) +
                                                        generateItem(2, 6) +
                                                        generateItem(2, 7) +
                                                    '</div>' +
                                                    '<span>' + taxSum2 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(3, 1) +
                                                        generateItem(3, 2) +
                                                        generateItem(3, 3) +
                                                        generateItem(3, 4) +
                                                        generateItem(3, 5) +
                                                    '</div>' +

                                                    '<span>' + taxSum3 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(4, 1) +
                                                        generateItem(4, 2) +
                                                        generateItem(4, 3) +
                                                        generateItem(4, 4) +
                                                        generateItem(4, 5) +
                                                    '</div>' +
                                                    '<span>' + taxSum4 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(5, 1) +
                                                        generateItem(5, 2) +
                                                        generateItem(5, 3) +
                                                        generateItem(5, 4) +
                                                        generateItem(5, 5) +
                                                    '</div>' +
                                                    '<span>' + taxSum5 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<div class="taxLinkHolder">' +
                                                        '<div class="taxLinkItemTransparent">&nbsp;</div>' +
                                                        generateItem(6, 1) +
                                                        generateItem(6, 2) +
                                                        generateItem(6, 3) +
                                                        generateItem(6, 4) +
                                                        generateItem(6, 5) +
                                                    '</div>' +
                                                    '<span>' + taxSum6 + '%</span>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<a href="http://www.erepublik.com/' + era.hostLang + '/economy/market/' + countrCode + '/7/1/citizen/0/price_asc/1" target="_blank">' + taxSum7 + '%</a>' +
                                                '</td>' +
                                                '<td class="taxLink" style="text-align: center; padding-left: 0px;">' +
                                                    '<a href="http://www.erepublik.com/' + era.hostLang + '/economy/market/' + countrCode + '/12/1/citizen/0/price_asc/1" target="_blank">' + taxSum12 + '%</a>' +
                                                '</td>' +
                                            '</tr>');
            });
            
            $('#taxTable tbody td').each(function() {
                var cellWidth = $(this).width();
                $(this).find('.taxLinkHolder').width(cellWidth - 4);
            });
        }
    },

    linkRegions: {
        o: function() {
            if ($('#homepage_feed').html() != undefined) {
                $('#battle_listing .bod_listing li').each(function() {
                    var regionName = $(this).find('strong:first').html().replace(/\./gi, '');

                    if (!region_link.hasOwnProperty(regionName)) return;
                    else $(this).find('strong:first').wrap('<a style="float: left; margin-top: 0px; margin-left: 0px; background: none;" href="http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName] + '" />');
                });
                
                $('#battle_listing .country_battles li').each(function() {
                    var regionName = $(this).find('strong:first').text().replace(/\./gi, '');

                    if (!region_link.hasOwnProperty(regionName)) return;
                    else $(this).find('strong:first').wrap('<a style="float: left; margin-top: 0px; margin-left: 0px; background: none;" href="http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName] + '" />');
                });
                
                $('#battle_listing .allies_battles li').each(function() {
                    var regionName = $(this).find('strong:first').text().replace(/\./gi, '');

                    if (!region_link.hasOwnProperty(regionName)) return;
                    else $(this).find('strong:first').wrap('<a style="float: left; margin-top: 0px; margin-left: 0px; background: none;" href="http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName] + '" />');
                });
            } else {
                $('#battle_listing li').each(function() {
                    var regionName = $(this).find('.county:eq(0) span').text().replace(/\./gi, '');

                    if (!region_link.hasOwnProperty(regionName)) return;
                    else $(this).find('.county:eq(0)').attr('href', 'http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName]);
                });
                
                $('#victory_listing li').each(function() {
                    var regionName = $(this).find('.county:eq(0) span').text().replace(/\./gi, '');

                    if (!region_link.hasOwnProperty(regionName)) return;
                    else $(this).find('.county:eq(0)').attr('href', 'http://www.erepublik.com/' + era.hostLang + '/region/' + region_link[regionName]);
                });
            }
        }
    },

    changeFlagsMain: {
        o: function() {
            var natural = era.storage.get('Natural', '');
            var userCountry = currency_country[era.characterCurrency];
            
            $('#battle_listing .side_flags').each(function() {
                var flagName = $(this).attr('src').split('/')[4].split('.')[0];
                
                if (flagName == userCountry) {
                    var holder = $(this).parent();
                    
                    if($(this).parent().hasClass('opponent_holder')) {
                        holder = $(this).parent().parent();
                    }
                    
                    $(holder).find('img[title*="' + natural + '"]').each(function() {
                        if($(holder).find('img[class*="resistance_sign"]').attr('title') == undefined) {
                            var neImage = '<img alt="" title="Natural enemy" src="' + neIcon + '" class="natural_sign">';
                            
                            $(this).before(neImage);
                            
                            if($(this).index() > 1) {
                                $(this).prev().addClass('two');
                            } else {
                                $(this).prev().addClass('one');
                            }
                        }
                    });
                }
            });
        }
    },

    changeFlagsWar: {
        o: function() {
            var natural = era.storage.get('Natural', '');
            var userCountry = currency_country[era.characterCurrency];
            
            $('#battle_listing .side_flags').each(function() {
                var flagName = $(this).attr('src').split('/')[4].split('.')[0];
                
                if (flagName == userCountry) {
                    var holder = $(this).parent();
                    
                    if($(this).parent().hasClass('opponent_holder')) {
                        holder = $(this).parent().parent();
                    }
                    
                    $(holder).find('img[title*="' + natural + '"]').each(function() {
                        if($(holder).find('img[class*="resistance_sign"]').attr('title') == undefined) {
                            if($(this).parent().parent().hasClass('victory_listing')) {
                                $(this).wrap('<div class="opponent_holder">');
                            }
                            
                            var neImage = '<img alt="" title="Natural enemy" src="' + neIcon + '" class="natural_sign">';
                            
                            $(this).before(neImage);
                            
                            if($(this).parent().hasClass('opponent_holder')) {
                                $(this).prev().addClass('two');
                            } else {
                                $(this).prev().addClass('one');
                            }
                        }
                    });
                }
            });
        }
    },

    improveShouts: {
        o: function() {
            $('.post_actions').each(function() {

                var postId = $(this).parent().parent().attr('id').split('_')[1];
                
                if($(this).find('.shareButton').length < 1) {
                    if ($('#show_friends_feed').hasClass('active')) {
                        $(this).append('<span class="shareDot">· </span>' +
                                        '<a class="shareButton" href="javascript:;">Share</a>' +
                                        '<div style="clear: both; width: 310px; display: none; padding: 5px 0 0 0; height: 0px; overflow: hidden;">' +
                                            '<input class="shareUrl" name="shareUrl" value="http://www.erepublik.com/en?viewPost=' + postId + '" style="display: none; width: 300px; font-size: 9px; border-radius: 3px; border: 1px solid #D2D2D2; color: grey; padding: 2px; opacity: 0;">' +
                                        '</div>');
                    } else {
                        $(this).append('<span class="shareDot">· </span>' +
                                        '<a class="shareButton" href="javascript:;">Share</a>' +
                                        '<div style="clear: both; width: 310px; display: none; padding: 5px 0 0 0; height: 0px; overflow: hidden;">' +
                                            '<input class="shareUrl" name="shareUrl" value="http://www.erepublik.com/en?unitPost=' + postId + '" style="display: none; width: 300px; font-size: 9px; border-radius: 3px; border: 1px solid #D2D2D2; color: grey; padding: 2px; opacity: 0;">' +
                                        '</div>');
                    }
                }
            });
            
            $('.shareButton').each(function() {
                $(this).click(function() {
                    $(this).addClass('act');
                    
                    $('.post_actions').each(function() {
                        if(!$(this).find('.shareButton').hasClass('act')) {
                            if($(this).find('.shareUrl').css('opacity') != '0') {
                                $(this).find('.shareUrl').animate({'opacity':'0'}, 300, "linear", function() {
                                    $(this).hide();
                                    $(this).parent().animate({'height':'0'}, 200, "linear", function() {
                                        $(this).hide();
                                    });
                                });
                            }
                        }
                    });
                    
                    $(this).removeClass('act');
                    
                    if($(this).next().css('height') == '0px') {
                        $(this).next().show();
                        $(this).next().animate({'height':'25'}, 200, "linear", function() {
                            $(this).find('.shareUrl').show();
                            $(this).find('.shareUrl').animate({'opacity':'1'}, 300).focus().select();
                            $(this).find('.shareUrl').click(function() {
                                $(this).select();
                            });
                        });
                    } else {
                        $(this).next().find('.shareUrl').animate({'opacity':'0'}, 300, "linear", function() {
                            $(this).hide();
                            $(this).parent().animate({'height':'0'}, 200, "linear", function() {
                                $(this).hide();
                            });
                        });
                    }
                });
            });
                
            if ($('#citizen_older_feeds #lessCitizenPosts').length < 1) {
                $('#citizen_older_feeds').append('<a id="lessCitizenPosts" class="blueButtonArrowUp" title=""><span>&nbsp;</span></a>');
            
                $('#lessCitizenPosts').click(function() {
                    $('.wall_post_list li:gt(9)').each(function() {
                        $(this).hide();
                    });
                });
            }
            if ($('#group_older_feeds #lessGroupPosts').length < 1) {
                $('#group_older_feeds').append('<a id="lessGroupPosts" class="blueButtonArrowUp" title=""><span>&nbsp;</span></a>');
            
                $('#lessGroupPosts').click(function() {
                    $('.wall_post_list li:gt(9)').each(function() {
                        $(this).hide();
                    });
                });
            }
            
            era.loadShoutScript.o();
        }
    },

    shoutScript: {
        o: function() {
            $ = window.jQuery;
            
            $(document).ajaxSuccess(function (event, requestData, settings) {
                if (settings.url.match(/older/gi) != null ) {
                    $('.post_actions').each(function() {
                        $(this).find('.shareDot').each(function() {
                            $(this).remove();
                        });
                        
                        $(this).find('.shareButton').each(function() {
                            $(this).remove();
                        });
                        
                        $(this).find('.shareUrl').each(function() {
                            $(this).parent().remove();
                        });
                        
                        var postId = $(this).parent().parent().attr('id').split('_')[1];
                        
                        if ($('#show_friends_feed').hasClass('active')) {
                            $(this).append('<span class="shareDot">· </span>' +
                                            '<a class="shareButton" href="javascript:;">Share</a>' +
                                            '<div style="clear: both; width: 310px; display: none; padding: 5px 0 0 0; height: 0px; overflow: hidden;">' +
                                                '<input class="shareUrl" name="shareUrl" value="http://www.erepublik.com/en?viewPost=' + postId + '" style="display: none; width: 300px; font-size: 9px; border-radius: 3px; border: 1px solid #D2D2D2; color: grey; padding: 2px; opacity: 0;">' +
                                            '</div>');
                        } else {
                            $(this).append('<span class="shareDot">· </span>' +
                                            '<a class="shareButton" href="javascript:;">Share</a>' +
                                            '<div style="clear: both; width: 310px; display: none; padding: 5px 0 0 0; height: 0px; overflow: hidden;">' +
                                                '<input class="shareUrl" name="shareUrl" value="http://www.erepublik.com/en?unitPost=' + postId + '" style="display: none; width: 300px; font-size: 9px; border-radius: 3px; border: 1px solid #D2D2D2; color: grey; padding: 2px; opacity: 0;">' +
                                            '</div>');
                        }
                    });
                    
                    $('.shareButton').each(function() {
                        $(this).click(function() {
                            $(this).addClass('act');
                            
                            $('.post_actions').each(function() {
                                if(!$(this).find('.shareButton').hasClass('act')) {
                                    if($(this).find('.shareUrl').css('opacity') != '0') {
                                        $(this).find('.shareUrl').animate({'opacity':'0'}, 300, "linear", function() {
                                            $(this).hide();
                                            $(this).parent().animate({'height':'0'}, 200, "linear", function() {
                                                $(this).hide();
                                            });
                                        });
                                    }
                                }
                            });
                            
                            $(this).removeClass('act');
                            
                            if($(this).next().css('height') == '0px') {
                                $(this).next().show();
                                $(this).next().animate({'height':'25'}, 200, "linear", function() {
                                    $(this).find('.shareUrl').show();
                                    $(this).find('.shareUrl').animate({'opacity':'1'}, 300).focus().select();
                                    $(this).find('.shareUrl').click(function() {
                                        $(this).select();
                                    });
                                });
                            } else {
                                $(this).next().find('.shareUrl').animate({'opacity':'0'}, 300, "linear", function() {
                                    $(this).hide();
                                    $(this).parent().animate({'height':'0'}, 200, "linear", function() {
                                        $(this).hide();
                                    });
                                });
                            }
                        });
                    });
                    
                    if ($('#citizen_older_feeds #lessCitizenPosts').length < 1) {
                        $('#citizen_older_feeds').append('<a id="lessCitizenPosts" class="blueButtonArrowUp" title=""><span>&nbsp;</span></a>');
                    
                        $('#lessCitizenPosts').click(function() {
                            $('.wall_post_list li:gt(9)').each(function() {
                                $(this).hide();
                            });
                        });
                    }
                    if ($('#group_older_feeds #lessGroupPosts').length < 1) {
                        $('#group_older_feeds').append('<a id="lessGroupPosts" class="blueButtonArrowUp" title=""><span>&nbsp;</span></a>');
                    
                        $('#lessGroupPosts').click(function() {
                            $('.wall_post_list li:gt(9)').each(function() {
                                $(this).hide();
                            });
                        });
                    }
                }
            });
        }
    },

    loadShoutScript: {
        o: function() {
            if (document.getElementById('eRAShoutScript')) {
                return;
            }
            var headID = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.id = 'eRAShoutScript';
            script.type = 'text/javascript';
            script.appendChild(document.createTextNode('('+ era.shoutScript.o +')();'));
            headID.appendChild(script);
        }
    },

    dailyTrackerGet: {
        o: function() {
            if (eRAopt['dotrack'] == false || $('#homepage_feed').html() == undefined) {
                return;
            }
            
            var eToday = parseFloat($('.eday strong').html().replace(/,/gi, ''));
            
            if ($('#orderContainer').html() != undefined) {
                if ($('#orderContainer big').html() == undefined) {
                    eRAdaily = {};
                    eRAdaily['eDay'] = eToday;
                    eRAdaily['Battlefield'] = '0';
                    eRAdaily['Country'] = '0';
                    eRAdaily['Progress'] = '25';
                    
                    era.storage.set('Dod', eRAdaily);
                    
                    return;
                }
            } else {
                eRAdaily = {};
                eRAdaily['eDay'] = eToday;
                eRAdaily['Battlefield'] = '0';
                eRAdaily['Country'] = '0';
                eRAdaily['Progress'] = '0';
                
                era.storage.set('Dod', eRAdaily);
                
                return;
            }
            
            var dailyBattle = $('#orderContainer a:eq(0)').attr('href').split('/')[4];
            var dailyCountry = countryName_id[$('#orderContainer strong').html().replace('Fight for ', '').split(' in ')[0]];
            var dailyProgress = $('#orderContainer big').html().split('/')[0];
            
            eRAdaily = era.storage.get('Dod', {});
            
            if (eRAdaily['eDay'] == undefined || eRAdaily['eDay'] != eToday || eRAdaily['Progress'] == undefined || eRAdaily['Progress'] <= parseFloat(dailyProgress)) {
                eRAdaily = {};
                eRAdaily['eDay'] = eToday;
                eRAdaily['Battlefield'] = dailyBattle;
                eRAdaily['Country'] = dailyCountry;
                eRAdaily['Progress'] = dailyProgress;
                
                era.storage.set('Dod', eRAdaily);
            }
        }
    },

    storageTab: {
        o: function() {
            $('.citizen_menu').append('<li>' +
                                            '<a href="http://www.erepublik.com/en/economy/inventory" title="Storage">Storage</a>' +
                                        '</li>');
        }
    },

    mercTrackerMain: {
        o: function() {
            var mercenaryProgress = era.storage.get('MercenaryProgress', {});

            if (!mercenaryProgress.hasOwnProperty('countryProgress') || 'object' != typeof mercenaryProgress.countryProgress) return;

            var neededProgress = {};

            $('#battle_listing li .side_flags').each(function() {
                neededProgress[$(this).attr('title')] = 0;
            });

            for (var i in mercenaryProgress.countryProgress) {
                neededProgress.hasOwnProperty(mercenaryProgress.countryProgress[i].country) && (neededProgress[mercenaryProgress.countryProgress[i].country] = mercenaryProgress.countryProgress[i].progress);
            }

            $('#battle_listing li').each(function() {
                $(this).css('height', '61px');
                
                var mercProgressOne = neededProgress[$(this).find('.side_flags:eq(0)').attr('title')];
                var mercProgressTwo = neededProgress[$(this).find('.side_flags:eq(1)').attr('title')];

                if(mercProgressOne == 25 && mercProgressTwo == 25) {
                    $(this).append('<div class="mercMainHolder">' +
                                        '<div style="width: 157px; float: left;">' +
                                            '&nbsp;' +
                                        '</div>' +
                                        '<div class="mercCheckSmallRight"></div>' +
                                        '<div style="width: 147px; float: left;">' +
                                            '&nbsp;' +
                                        '</div>' +
                                   '</div>');
                } else {
                    $(this).append('<div class="mercMainHolder">' +
                                        '<div style="width: 139px; float: left;">' +
                                            '<strong style="font-size: 11px; float: right; color: #9e0b0f; margin-top: 1px; margin-left: 0px; font-weight: bold;">' + mercProgressOne + '</strong>' +
                                        '</div>' +
                                        '<div class="mercTank" style="margin: 3px 13px 0 13px;"></div>' +
                                        '<div style="width: 130px; float: left;">' +
                                            '<strong style="font-size: 11px; float: left; color: #9e0b0f; margin-top: 1px; margin-left: 0px; font-weight: bold;">' + mercProgressTwo + '</strong>' +
                                        '</div>' +
                                   '</div>');
                }
                
                if (mercProgressTwo == '0') {
                    $(this).find('.mercMainHolder strong:eq(1)').css('color', '#999999');
                } else if (mercProgressTwo == '25') {
                    $(this).find('.mercMainHolder strong:eq(1)').replaceWith('<div class="mercCheckSmallRight"></div>');
                }
                
                if (mercProgressOne == '0') {
                    $(this).find('.mercMainHolder strong:eq(0)').css('color', '#999999');
                } else if (mercProgressOne == '25') {
                    $(this).find('.mercMainHolder strong:eq(0)').replaceWith('<div class="mercCheckSmallLeft"></div>');
                }
                
                if($(this).parent().hasClass('bod_listing')) {
                    $(this).find('.mercMainHolder').css('background-color', '#EAD791');
                    $(this).find('.mercTank').css('background-position', 'center bottom');
                }
            });
        }
    },

    mercTrackerWar: {
        o: function() {
            var mercenaryProgress = era.storage.get('MercenaryProgress', {});

            if (!mercenaryProgress.hasOwnProperty('countryProgress') || 'object' != typeof mercenaryProgress.countryProgress) return;

            var neededProgress = {};

            for (var i in mercenaryProgress.countryProgress) {
                neededProgress[mercenaryProgress.countryProgress[i].country] = mercenaryProgress.countryProgress[i].progress;
            }
            
            $('#battle_listing li').each(function() {
                if ($(this).parent().hasClass('victory_listing')) return;
                
                var mercProgressOne = neededProgress[$(this).find('.side_flags:eq(0)').attr('title')];
                var mercProgressTwo = neededProgress[$(this).find('.side_flags:eq(1)').attr('title')];
                
                if(mercProgressOne == '25' && mercProgressTwo == '25') {
                    $(this).append('<div class="mercTrackerHolder" style="width: 106px;">' +
                                        '<div style="width: 28px; float: left;">' +
                                            '&nbsp;' +
                                        '</div>' +
                                        '<div class="mercCheckRight" style="margin: 16px 16px 0 16px;"></div>' +
                                        '<div style="width: 28px; float: left;">' +
                                            '&nbsp;' +
                                        '</div>' +
                                   '</div>');
                } else {
                    $(this).append('<div class="mercTrackerHolder" style="width: 106px;">' +
                                        '<div style="width: 28px; float: left; text-align: center;">' +
                                            '<strong style="font-size: 11px; color: #9e0b0f; margin-top: 15px; font-weight: bold; width: 28px; margin-left: 0px;">' + mercProgressOne + '</strong>' +
                                        '</div>' +
                                        '<div class="tank_img" style="margin: 16px 13px 0 13px;"></div>' +
                                        '<div style="width: 28px; float: left; text-align: center;">' +
                                            '<strong style="font-size: 11px; color: #9e0b0f; margin-top: 15px; font-weight: bold; width: 28px; margin-left: 0px;">' + mercProgressTwo + '</strong>' +
                                        '</div>' +
                                   '</div>');
                }
                
                if (mercProgressTwo == '0') {
                    $(this).find('.mercTrackerHolder strong:eq(1)').css('color', '#999999');
                } else if (mercProgressTwo == '25') {
                    $(this).find('.mercTrackerHolder strong:eq(1)').replaceWith('<div class="mercCheckRight"></div>');
                }
                
                if (mercProgressOne == '0') {
                    $(this).find('.mercTrackerHolder strong:eq(0)').css('color', '#999999');
                } else if (mercProgressOne == '25') {
                    $(this).find('.mercTrackerHolder strong:eq(0)').replaceWith('<div class="mercCheckLeft"></div>');
                }
                
                if($(this).parent().hasClass('bod_listing')) {
                    $(this).find('.tank_img').css('background-position', 'left bottom');
                }
            });
        }
    },

    mercTrackerRes: {
        o: function() {
            var mercenaryProgress = era.storage.get('MercenaryProgress', {});

            if (!mercenaryProgress.hasOwnProperty('countryProgress') || 'object' != typeof mercenaryProgress.countryProgress) return;

            var neededProgress = {};

            neededProgress[id_countryName[$('.listing.resistance a:first').attr('href').split('/').pop()]] = 0;
            neededProgress[id_countryName[$('.listing.resistance a:last').attr('href').split('/').pop()]] = 0;

            for (var i in mercenaryProgress.countryProgress) {
                neededProgress.hasOwnProperty(mercenaryProgress.countryProgress[i].country) && (neededProgress[mercenaryProgress.countryProgress[i].country] = mercenaryProgress.countryProgress[i].progress);
            }
            
            var mercProgressOne = neededProgress[id_countryName[$('.listing.resistance a:first').attr('href').split('/').pop()]];
            var mercProgressTwo = neededProgress[id_countryName[$('.listing.resistance a:last').attr('href').split('/').pop()]];
            
            $('.listing.resistance strong:eq(0)').after('<strong style="font-size: 11px; color: #9e0b0f; font-weight: bold; width: 35%; right: 0px; left: auto;"><div style="float: left;">' + mercProgressTwo + '</div></strong>');
            $('.listing.resistance strong:eq(0)').before('<strong style="font-size: 11px; color: #9e0b0f; font-weight: bold; width: 35%; left: 0px;"><div style="float: right;">' + mercProgressOne + '</div></strong>');
            
            if (mercProgressTwo == '0') {
                $('.listing.resistance strong:eq(2)').css('color', '#999999');
            } else if (mercProgressTwo == '25') {
                $('.listing.resistance strong:eq(2)').empty().append($('<div>', {class: 'mercCheckRight', style: 'margin: 8px 0px 0px 0px;'}));
            }
            
            if (mercProgressOne == '0') {
                $('.listing.resistance strong:eq(0)').css('color', '#999999');
            } else if (mercProgressOne == '25') {
                $('.listing.resistance strong:eq(0)').empty().append($('<div>', {class: 'mercCheckLeft', style: 'margin: 8px 0px 0px 0px;'}));
            }
        }
    },

    mercTrackerBattle: {
        o: function() {
            var mercenaryProgress = era.storage.get('MercenaryProgress', {});

            if (!mercenaryProgress.hasOwnProperty('countryProgress') || 'object' != typeof mercenaryProgress.countryProgress) return;

            var neededProgress = {};

            neededProgress[$('#pvp_header .country.left_side h3').html().replace('Resistance Force Of ', '')] = 0;
            neededProgress[$('#pvp_header .country.right_side h3').html().replace('Resistance Force Of ', '')] = 0;

            for (var i in mercenaryProgress.countryProgress) {
                neededProgress.hasOwnProperty(mercenaryProgress.countryProgress[i].country) && (neededProgress[mercenaryProgress.countryProgress[i].country] = mercenaryProgress.countryProgress[i].progress);
            }

            var mercProgressOne = neededProgress[$('#pvp_header .country.left_side h3').html().replace('Resistance Force Of ', '')];
            var mercProgressTwo = neededProgress[$('#pvp_header .country.right_side h3').html().replace('Resistance Force Of ', '')];
            
            $('#pvp_header .country.left_side').append('<div style="font-size: 14px; color: #9e0b0f; font-weight: bold; float: left; position: absolute; left: 130px; top: 20px;">' + mercProgressOne + '</div>');
            $('#pvp_header .country.right_side').append('<div style="font-size: 14px; color: #9e0b0f; font-weight: bold; float: left; position: absolute; right: 130px; top: 20px;">' + mercProgressTwo + '</strong>');
            
            if (mercProgressOne == '0') {
                $('#pvp_header .country.left_side div:last').css('color', '#999999');
            } else if (mercProgressOne == '25') {
                $('#pvp_header .country.left_side div:last').replaceWith('<div class="mercCheckRight" style="float: left; margin-top: 8px; margin-left: 10px;"></div>');
            }
            
            if (mercProgressTwo == '0') {
                $('#pvp_header .country.right_side div:last').css('color', '#999999');
            } else if (mercProgressTwo == '25') {
                $('#pvp_header .country.right_side div:last').replaceWith('<div class="mercCheckRight" style="float: right; margin-top: 8px; margin-right: 10px;"></div>');
            }
        }
    },

    improveEmployees: {
        o: function() {
            $('.list_group .listing').each(function() {
                var employeeId = $(this).prev().attr('id').split('_')[2];
                
                var employeeName = $(this).find('.employee_info .employee_entry strong').html();
                $(this).find('.employee_info .employee_entry strong').replaceWith('<p style="float: left; margin-left: 8px; margin-top: 14px; color: #333; font-size: 11px; font-weight: bold; text-shadow: white 0 1px 0; width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + employeeName + '</p>');
                
                $(this).find('.employee_info .employee_entry').css({'position': 'relative', 'z-index': '1'});
                $(this).find('.employee_info').append('<div class="citizen_actions">' +
                                                                    '<a href="http://www.erepublik.com/' + era.hostLang + '/main/messages-compose/' + employeeId + '" class="action_message tip" original-title="Send message">Send message</a>' +
                                                                    '<a href="http://www.erepublik.com/' + era.hostLang + '/economy/donate-items/' + employeeId + '" class="action_donate tip" original-title="Donate">Donate</a>' +
                                                                '</div>');
            });
            
            $('#remove_mode').click(function() {
                if($(this).hasClass('active')) {
                    $('.list_group .listing .employee_info .citizen_actions').each(function() {
                        $(this).fadeOut();
                    });
                } else {
                    $('.list_group .listing .employee_info .citizen_actions').each(function() {
                        $(this).fadeIn();
                    });
                }
            });
        }
    },

    companySelector: {
        o: function() {
            $('#selectAll, #selectFactory, #selectRaw').click(function() {
                switch ($(this).attr('id')) {
                    case 'selectAll': var s = '.list_group'; var t = ['Select all companies', 'Deselect all companies']; break;
                    case 'selectFactory': var s = '.list_group > .upgradeable'; var t = ['Select all factories', 'Deselect all factories']; break;
                    case 'selectRaw': var s = '.list_group > :not(.upgradeable)'; var t = ['Select all raw companies', 'Deselect all raw companies']; break;
                }

                if ($(this).hasClass('eractive')) {
                    $(s + ' .owner_work.active').click();
                    $(this).removeClass('eractive').attr('title', t[0]);
                } else {
                    $(s + ' .owner_work:not(.active)').click();
                    $(this).addClass('eractive').attr('title', t[1]);
                }
            });

            $('#selectFood, #selectWeapon, #selectFoodRaw, #selectWeaponRaw').click(function() {
                var eractive = $(this).hasClass('eractive');

                switch ($(this).attr('id')) {
                    case 'selectFood': var s = '7'; var t = ['Select all food factories', 'Deselect all food factories']; var m = 0; break;
                    case 'selectWeapon': var s = '12'; var t = ['Select all weapon factories', 'Deselect all weapon factories']; var m = 0; break;
                    case 'selectFoodRaw': var s = '7'; var t = ['Select all food raw companies', 'Deselect all food raw companies']; var m = 1; break;
                    case 'selectWeaponRaw': var s = '12'; var t = ['Select all weapon raw companies', 'Deselect all weapon raw companies']; var m = 1; break;
                }

                $(m == 0 ? '.list_group > .upgradeable' : '.list_group > :not(.upgradeable)').each(function() {
                    if (s == $(this).find('.c4 img').attr('src').split('/')[6]) {
                        if (eractive) $(this).find('.owner_work.active').click();
                        else $(this).find('.owner_work:not(.active)').click();
                    }
                });

                if (eractive) $(this).removeClass('eractive').attr('title', t[0]);
                else $(this).addClass('eractive').attr('title', t[1]);
            });
        }
    },

    improveCompanies: {
        o: function() {
            $('.area h4').css('position', 'relative').append(
                '<div class="area_buttons" style="top: 0; left: 110px; position: absolute;">' +
                    '<a id="selectAll" href="javascript:;" class="grey_plastic" title="Select all companies" style="display: inline-block; float: none; vertical-align: -9px; margin-left: 4px;">' +
                        '<img src="' + allCompanies + '" alt="">' +
                    '</a>' +
                    '<a id="selectFactory" href="javascript:;" class="grey_plastic left_pos" title="Select all factories" style="display: inline-block; float: none; vertical-align: -9px; margin-left: 10px;">' +
                        '<img src="' + allFactories + '" alt="">' +
                    '</a>' +
                    '<a id="selectRaw" href="javascript:;" class="grey_plastic right_pos" title="Select all raw companies" style="display: inline-block; float: none; vertical-align: -9px; margin-left: -1px;">' +
                        '<img src="' + allRaw + '" alt="">' +
                    '</a>' +
                    '<a id="selectFood" href="javascript:;" class="grey_plastic left_pos" title="Select all food factories" style="display: inline-block; float: none; vertical-align: -9px; margin-left: 10px;">' +
                        '<img src="http://www.erepublik.com/images/icons/industry/1/q6.png" alt="">' +
                    '</a>' +
                    '<a id="selectWeapon" href="javascript:;" class="grey_plastic mid" title="Select all weapon factories" style="display: inline-block; float: none; vertical-align: -9px;">' +
                        '<img src="http://www.erepublik.com/images/icons/industry/2/q6.png" alt="">' +
                    '</a>' +
                    '<a id="selectFoodRaw" href="javascript:;" class="grey_plastic mid" title="Select all food raw companies" style="display: inline-block; float: none; vertical-align: -9px;">' +
                        '<img src="http://www.erepublik.com/images/icons/industry/7/default.png" alt="">' +
                    '</a>' +
                    '<a id="selectWeaponRaw" href="javascript:;" class="grey_plastic right_pos" title="Select all weapon raw companies" style="display: inline-block; float: none; vertical-align: -9px;">' +
                        '<img src="http://www.erepublik.com/images/icons/industry/12/default.png" alt="">' +
                    '</a>' +
                '</div>'
            );

            $('.listing_holder').css('margin-top', '8px');

            var script = document.createElement('script');
            script.type  = 'text/javascript';
            script.text = '(' + era.companySelector.o + ')();'
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    },

    Main: {
        o: function() {

            /**
            * Always delete corrupted values.
            */
            era.storage.init();

            /**
            * Only run if the user is signed in.
            */
            if (!document.getElementById('large_sidebar')) return false;

            /**
            * Determine the character id.
            * Only run if it's valid.
            */
            era.characterId = parseInt($('#large_sidebar .user_section a:eq(0)').attr('href').split('/')[6]);
            if (isNaN(era.characterId)) era.characterId = $('#large_sidebar .user_section a:eq(0)').attr('href').split('/')[4];
            if (isNaN(era.characterId)) throw new TypeError('Character id is not number. Possible html change.');

            era.addStyle(
                '#optionsContentMain { box-shadow: 0px 0px 5px #9F9F9F; border-radius: 7px 7px 7px 7px; background: url(' + loadingBackImg + ') repeat scroll 0 0 transparent; display: none; height: 500px; position: fixed; margin: -250px -275px; width: 550px; z-index: 999999; top: 50%; left: 50%; }' +
                '#optionsContentMain .optionsInnerHeader { border-radius: 7px 7px 0px 0px; background: url(' + linksHeader + ') no-repeat scroll 0 0 transparent; float: left; height: 35px; width: 100%; }' +
                '#optionsContentMain .optionsInnerContent { float: left; margin-top: 10px; margin-left: 10px; margin-right: 10px; width: 500px; padding: 0px 15px; }' +
                '#optionsContentMain .optionsInnerVersion { clear: both; bottom: -5px; font-size: 9px; margin-left: 10px; margin-right: 10px; padding: 50px 15px 0px 15px; position: relative; text-align: center; cursor: default; }' +
                '#optionsContentMain .optionsInnerFooter { border-top: 1px solid #CCCCCC; bottom: -10px; clear: both; font-size: 10px; margin-left: 10px; margin-right: 10px; padding: 10px 15px; position: relative; text-align: center;  cursor: default; }' +
                '#optionsContentMain .optionsInnerItem { clear: both; float: left; width: 225px; }' +
                '#optionsContentMain .optionsInnerItem:hover { font-weight: bold; background: none repeat scroll 0 0 #FFFFCC; }' +
                '#optionsContentMain .optionsInnerItemRight { float: right; width: 225px; }' +
                '#optionsContentMain .optionsInnerItemRight:hover { font-weight: bold; background: none repeat scroll 0 0 #FFFFCC; }' +
                '#optionsContentMain .optionsInnerItemLabel { float: left; vertical-align: middle; line-height: 20px; margin-bottom: 5px; margin-right: 10px; margin-left: 10px; padding-top: 5px; width: 180px; cursor: default; }' +
                '#optionsContentMain .optionsInnerItemLabel_QuickLinks { float: left; vertical-align: middle; line-height: 20px; margin-bottom: 2px; padding-top: 3px; margin-right: 0px; margin-left: 0px; width: 100%; cursor: pointer; border-top: 1px solid #CCCCCC; }' +
                '#optionsContentMain .optionsInnerItemLabel_QuickLinks:hover { font-weight: bold; background: none repeat scroll 0 0 #FFFFCC; }' +
                
                '.profitTable { background: url("http://www.erepublik.com/images/parts/back_el_secondh.png") repeat-x scroll left bottom transparent; cursor: default; border-top: 1px solid #eeeeee; border-bottom: 1px solid #dddddd; padding: 10px 0px 10px 0px; }' +
                '.dayProfitTable { background: url("http://www.erepublik.com/images/parts/bg_el_days.png") repeat-x scroll left bottom transparent; cursor: default; border-bottom: 1px solid #cccccc; padding: 7px 0px 7px 0px; }' +

                '.menuRight { float: right; }' +
                '.menuItem:hover { background-color: #CCCCCC; }' +
                
                '.menuWindow { box-shadow: 0px 0px 5px #9F9F9F; border-radius: 7px 7px 7px 7px; background: url(' + loadingBackImg + ') repeat scroll 0 0 transparent; display: none; height: 600px; position: fixed; margin: -300px -352px; width: 705px; z-index: 999999; top: 50%; left: 50%; }' +
                '.closeButton { background: url("http://www.erepublik.com/images/parts/remove_upper_inventory_hover.png") no-repeat scroll 0 0 transparent; float: right; height: 10px; margin: 5px; text-indent: -9999px; width: 10px; }' +
                '.menuWindowHeader { border-radius: 5px 0px 0px 0px; background: url(' + linksHeader + ') no-repeat scroll 0 0 transparent; float: left; height: 35px; width: 100%; }' +
                '.menuWindowContent { float: left; padding: 5px; }' +
                '.menuWindowContentTable { display: table; }' +
                '.menuWindowContentRow { display: table-row-group; }' +
                '.menuWindowContentCell { display: table-cell; padding: 3px; }' +

                '.miniInventoryHolder { background: url(' + sideBoxes + ') no-repeat scroll 0 0 #FFFFFF; float: left; margin-bottom: 7px; width: 153px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; height: auto !important; padding-top: 5px; }' +
                '.miniInventoryHolder .itemCountHolder { clear: both; float: left; line-height: 26px; margin-left: 6px; width: 142px; border-bottom: 1px solid #DEDEDE; }' +
                '.miniInventoryHolder .itemCountHolder img { float: left; width: 26px; height: 26px; margin-left: 1px; margin-right: 6px; }' +
                '.miniInventoryHolder .itemCountHolder .itemCount { text-align: center; color: grey; line-height: 30px; }' +
                
                '.miniInventoryHolder .marketDropHolder { clear: both; float: left; line-height: 26px; margin-left: 6px; width: 142px; border-bottom: 1px solid #DEDEDE; display: none; }' +
                '.miniInventoryHolder .marketDropHolder img { float: left; width: 26px; height: 26px; margin-left: 1px; margin-right: 6px; }' +
                '.miniInventoryHolder .marketDropHolder .itemCount { text-align: center; color: grey; line-height: 30px; }' +
                
                '.miniInventoryHolder .monCountHolder { clear: both; float: left; line-height: 26px; margin-left: 6px; width: 142px; border-bottom: 1px solid #DEDEDE; }' +
                '.miniInventoryHolder .monCountHolder img { float: left; margin-left: 1px; margin-right: 6px; margin-top: 6px; }' +
                '.miniInventoryHolder .monCountHolder .itemCount { text-align: center; color: grey; line-height: 30px; }' +
                
                '.miniInventoryHolder .monDropHolder { clear: both; float: left; line-height: 26px; margin-left: 6px; width: 142px; border-bottom: 1px solid #DEDEDE; display: none; }' +
                '.miniInventoryHolder .monDropHolder img { float: left; margin-left: 1px; margin-right: 6px; margin-top: 6px; }' +
                '.miniInventoryHolder .monDropHolder .itemCount { text-align: center; color: grey; line-height: 30px; }' +
                
                '.taxTbl { background-color: #BAE7F9; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; border-top-right-radius: 5px; border-top-left-radius: 5px; display: block; float: left; margin-top: 11px; margin-left: 15px; position: relative; width: 730px; }' +
                '.taxTbl table { background: none repeat scroll 0 0 #FFFFFF; border: 1px solid #95D4ED; margin: 5px auto; width: 718px; }' +
                '.taxTbl table th { background: none repeat scroll 0 0 #F7FCFF; }' +
                '.taxTbl table tbody tr:hover td { background-color: #FFFFE7; }' +
                '.taxTbl table td { border-top: 1px solid #E2F3F9; color: #5E5E5E; padding-bottom: 5px; padding-left: 25px; padding-top: 5px; }' +
                '.taxLink { cursor: pointer; }' +
                '.taxLink .taxLinkHolder { border: 2px solid #CFEFFB; border-radius: 3px 3px 3px 3px; position: absolute; margin-top: -7px; display: none; z-index: 100; }' +
                '.taxLink:hover .taxLinkHolder { display: block; }' +
                '.taxLink .taxLinkHolder .taxLinkItemTransparent { background: none repeat scroll 0 0 transparent; text-align: center; height: 25px; }' +
                '.taxLink .taxLinkHolder .taxLinkItem { background-color: #FFFFE7; text-align: center; }' +
                '.taxLink .taxLinkHolder .taxLinkItem:hover { background-color: #F7FCFF !important; }' +
                
                '.battleHealth { color: #E3E3E3; font-size: 11px; font-weight: bold; position: absolute; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6); top: 0; width: 100%; opacity: 1; }' +
                
                '#large_sidebar a.newLogout { background: none repeat scroll 0 0 #FF8888; border: 1px solid #FF0000; border-radius: 3px 3px 3px 3px; color: #FFFFFF; display: inline; float: left; font-weight: bold; padding: 4px; text-align: center; width: 58px; margin-left: 40px; }' +
                '#large_sidebar a.newLogout:hover { background: none repeat scroll 0 0 #FF6666; }' +
                
                '#marketplace table tbody td.m_quantity { text-align: center; }' +
                '#marketplace table tbody td.m_provider { width: 138px; }' +
                
                '.hitsNeededHolder { position: absolute; text-align: center; background-color: #333333; width: 92px; border-radius: 7px 0px 0px 7px; margin-top: 12px; margin-left: -95px; padding: 5px 0px 5px 5px; }' +
                '.hitsNeededTitle { font-weight: bold; color: white; }' +
                '.hitsNeededNumber { line-height: 13px; text-shadow: 0 -1px 0 #6E9C08; text-align: center; height: 16px; font-size: 10px; display: inline; padding: 0 4px 0 4px; background-color: #83b70b; border-radius: 3px; color: #FFFFFF; }' +
                
                '.regionLink { background: none repeat scroll 0 0 transparent !important; height: auto !important; left: 0px !important; margin: 0 !important; }' +
                
                '.influValueHolder { margin-left: 2px; float: left; margin-right: 5px; width: auto; display: inline; line-height: 44px; text-align: center; padding-right: 2px; }' +
                '.influValueHolder .influValue { background: url("/images/parts/shadow.gif") repeat-x scroll center top #FFFFFF; border-color: #AEAEAE #C8C8C8 #E3E3E3; border-radius: 3px 3px 3px 3px; border-style: solid; border-width: 1px; color: #333333; padding: 4px; text-align: center; width: 35px; font-size: 10px; }' +
                '.influValueHolder .influValue:focus { background: none repeat scroll 0 0 #FFFFCC; }' +

                '.influGoldHolder { margin-left: 2px; float: right; margin-right: 5px; width: 60px; display: inline; line-height: 44px; text-align: center; }' +
                '.influGoldHolder .influValue { background: url("/images/parts/shadow.gif") repeat-x scroll center top #FFFFFF; border-color: #AEAEAE #C8C8C8 #E3E3E3; border-radius: 3px 3px 3px 3px; border-style: solid; border-width: 1px; color: #333333; padding: 4px; text-align: center; width: 40px; font-size: 10px; }' +
                '.influGoldHolder .influValue:focus { background: none repeat scroll 0 0 #FFFFCC; }' +
                '.influNaturalHolder { margin-left: 2px; float: left; margin-right: 5px; width: 20px; display: inline; line-height: 44px; text-align: center; }' +
                '.influNaturalHolder .influCheckbox { width: 13px; height: 13px; padding: 0; margin: 0; vertical-align: middle; position: relative; top: -1px; overflow: hidden; }' +
                '.influTable { width: 510px; }' +
                '.influTable .influImageCell { width: 35px; }' +
                '.influTable .influValueCell { width: 44px; font-size: 10px; font-weight: bold; color: #666666; }' +
                '.influTable .influImageCell .influImage { width: 30px; height: 35px; margin: 5px 0px 0px 0px; }' +
                
                '.mMarketButton { border-radius: 3px; background: none no-repeat scroll left center #e9f5fa; border: medium none; color: #3C8FA7; cursor: pointer; font-size: 12px; line-height: 32px; padding: 0 6px 1px 6px; text-align: left; height: 32px; }' +
                
                '.topNewsItem { display: block; float: left; margin-bottom: 10px; width: 333px; border-bottom: 1px solid #E0E0E0; }' +
                
                '.oldNewsSwitchHolder { border-bottom: 1px solid #E0E0E0; float: left; margin-bottom: 10px; padding: 0 2px 0; width: 333px; }' +
                '.oldNewsSwitch { background-color: #EEEEEE; border-radius: 5px 5px 0 0; color: #7F7F7F; cursor: pointer; float: left; font-size: 12px; font-weight: bold; height: 24px; line-height: 24px; margin: 0 1px; padding: 2px; text-align: center; vertical-align: middle; }' +
                '.oldNewsSwitch:hover { background-color: #505050; color: #D8D8D8; }' +
                '.oldNewsSwitchActive { background-color: #505050; border-radius: 5px 5px 0 0; color: #D8D8D8; cursor: pointer; float: left; font-size: 12px; font-weight: bold; height: 24px; line-height: 24px; margin: 0 1px; padding: 2px; text-align: center; vertical-align: middle; }' +
                
                '.eventsHolder { display: block; float: left; width: 333px; }' +
                '.eventsItem { border-bottom: 1px solid #EFEDED; display: block; float: left; margin-bottom: 10px; padding-bottom: 10px; width: 333px; cursor: default; }' +
                '.eventsDetailHolder { display: block; float: left; margin-bottom: 0; padding-bottom: 0px; width: 273px; }' +
                '.eventsTitle { color: #333; display: block; line-height: 18px; width: 273px; font-size: 12px; margin-top: 2px; float: left; }' +
                '.eventsDetails { color: #999; font-size: 11px; margin-top: 2px; width: 273px; float: left; }' +
                '.eventsIcon { background: url(' + militaryEventsIcons + ') no-repeat scroll 0 0 transparent; display: block; float: left; height: 30px; padding: 8px 9px 0 0; text-align: center; width: 48px; }' +
                
                '.greyButton { background-image: url(' + greyButtonImg + '); background-position: right 0; background-repeat: no-repeat; color: #3B5B74; display: inline; float: left; font-size: 11px !important; height: 28px; line-height: 26px; margin-left: 5px; outline: medium none; position: relative; text-shadow: 0 1px 0 #FFFFFF; z-index: 100; text-decoration: none !important; }' +
                '.greyButton:hover { background-position: right -28px; }' +
                '.greyButton:active { background-position: right -56px; }' +
                '.greyButton span { background-image: url(' + greyButtonImg + '); background-position: left 0; background-repeat: no-repeat; color: #3B5B74; cursor: pointer; display: inline; float: left; font-size: 11px !important; position: relative; right: 5px; white-space: nowrap; font-weight: bold; line-height: 26px; margin-right: 8px; padding-left: 13px; text-decoration: none !important; }' +
                '.greyButton:hover span { background-position: left -28px; }' +
                '.greyButton:active span { background-position: left -56px; }' +
                
                '.greyButtonArrowUp { background-image: url(' + greyButtonArrowUp + '); background-position: right 0; background-repeat: no-repeat; color: #3B5B74; display: inline; float: left; font-size: 11px !important; height: 28px; line-height: 26px; margin-left: 5px; outline: medium none; position: relative; text-shadow: 0 1px 0 #FFFFFF; z-index: 100; text-decoration: none !important; padding-left: 5px; }' +
                '.greyButtonArrowUp:hover { background-position: right -28px; }' +
                '.greyButtonArrowUp:active { background-position: right -56px; }' +
                '.greyButtonArrowUp span { background-image: url(' + greyButtonArrowUp + '); background-position: left 0; background-repeat: no-repeat; color: #3B5B74; cursor: pointer; display: inline; float: left; font-size: 11px !important; position: relative; right: 5px; white-space: nowrap; font-weight: bold; line-height: 26px; margin-right: 2px; padding-left: 18px; text-decoration: none !important; }' +
                '.greyButtonArrowUp:hover span { background-position: left -28px; }' +
                '.greyButtonArrowUp:active span { background-position: left -56px; }' +
                
                '.blueButtonArrowUp { background-image: url(' + blueButtonArrowUp + '); background-position: right 0; background-repeat: no-repeat; color: #3B5B74; display: inline; float: left; font-size: 11px !important; height: 27px; line-height: 25px; margin-left: 5px; outline: medium none; position: relative; text-shadow: 0 1px 0 #FFFFFF; z-index: 100; text-decoration: none !important; padding-left: 5px; }' +
                '.blueButtonArrowUp:hover { background-position: right -27px; }' +
                '.blueButtonArrowUp:active { background-position: right -54px; }' +
                '.blueButtonArrowUp span { background-image: url(' + blueButtonArrowUp + '); background-position: left 0; background-repeat: no-repeat; color: #3B5B74; cursor: pointer; display: inline; float: left; font-size: 11px !important; position: relative; right: 5px; white-space: nowrap; font-weight: bold; line-height: 26px; margin-right: 2px; padding-left: 18px; text-decoration: none !important; }' +
                '.blueButtonArrowUp:hover span { background-position: left -27px; }' +
                '.blueButtonArrowUp:active span { background-position: left -54px; }' +
                
                '.dtTipsy { display: none; font-size: 10px; left: -13px; padding: 5px; position: absolute; top: -12px; width: 114px; z-index: 999999; opacity: 0.8; }' +
                '.dtTipsy-inner { background-color: #000000; color: #FFFFFF; max-width: 200px; padding: 5px 8px 4px; text-align: center; text-shadow: 0 1px 1px #000000; border-radius: 3px 3px 3px 3px; z-index: 999999; }' +
                '.dtTipsy-arrow { background-image: url("http://www.erepublik.com/images/modules/_components/tipsy/tipsy.gif"); background-position: left bottom; background-repeat: no-repeat; height: 5px; position: absolute; width: 9px; left: 50%; margin-left: -4px; bottom: 0; z-index: 999999; }' +
                
                '.dailyTrackerHolder { width: 98px; height: 58px; display: block; position: absolute; left: 12px; bottom: 15px; background-image: url(' + dailyTrackerBack + '); cursor: default; }' +
                '.dailyTrackerHolder .dailyTrackerInner { color: #a8a6a4; bottom: 8px; position: absolute; right: 15px; width: auto; font-size: 15px; font-weight: bold; cursor: default; }' +
                '.dailyTrackerHolder:hover .dtTipsy { display: block; }' +
                
                '.neSign { margin-top: 11px; left: 25px; top: 12px; position: absolute; }' +
                '.neSignRight { margin-top: 11px; left: 24px; top: 12px; position: absolute; }' +
                
                '#battle_listing .natural_sign { position: absolute; top: 12px; }' +
                '#battle_listing .natural_sign.one { left: 22px; }' +
                '#battle_listing .natural_sign.two { left: 70px; }' +
                '#battle_listing.full_width .natural_sign.two { left: 14px; }' +
                
                '.entity .nameholder { float: left; display: block; margin-right: 10px; padding-top: 0px; position: relative; }' +
                
                'ul.achiev .hinter .country_list li em { float: left; position: inherit; opacity: 1; }' +
                'ul.achiev .hinter .country_list li img { opacity: 1; }' +
                'ul.achiev .hinter .country_list li small { color: #666666; }' +
                
                '.mercHolder { clear: both; float: left; line-height: 26px; width: 100%; }' +
                '.mercDropHolder { clear: both; float: left; line-height: 14px; width: 153px; display: none; }' +
                
                '.mercBarBg { float: left; width: 136px; height: 21px; margin: 5px 0px 8px 11px; position: relative; background-image: url(' + mercBarBgImg + '); background-repeat: no-repeat; background-position: right; }' +
                '.mercBarProgress { width: auto; float: left; height: 17px; margin-top: 2px; left: -2px; position: absolute; z-index: 2; background-image: url(' + mercBarProgressImg + '); background-repeat: no-repeat; background-position: right; }' +
                
                '.mercList { width: 143px; padding: 5px 0px 5px 10px; float: left; background: transparent; list-style: none; }' +
                '.mercList li { float: left; padding: 0; margin: 0 0 6px; height: auto; width: 47px; position: relative; display: block; text-align: center; }' +
                '.mercList li img { float: left; margin-right: 5px; opacity: 1; -moz-opacity: 1; }' +
                '.mercList li small { float: left; color: #666666; font-size: 10px; text-shadow: rgba(255,255,255,0.4) 0 1px 0; }' +
                '.mercList li em { position: inherit; float: left; width: 40px; font-size: 10px; text-align: center; font-weight: bold; text-shadow: rgba(255, 255, 255, 0.4) 0 1px 0; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; -moz-box-shadow: rgba(255,255,255,0.4) 0 1px 0; -webkit-box-shadow: rgba(255,255,255,0.4) 0 1px 0; -o-box-shadow: rgba(255,255,255,0.4) 0 1px 0; box-shadow: rgba(255,255,255,0.4) 0 1px 0; background: #EEE08A; background-color: #E8D45D; background-image: -webkit-gradient(linear, left bottom, left top, color-stop(1, #eee08a), color-stop(0, #e8d45d)); background-image: -webkit-linear-gradient(center bottom, #eee08a 0%, #e8d45d 100%); background-image: -moz-linear-gradient(top, #eee08a 0%, #e8d45d 100%); background-image: -o-linear-gradient(top, #eee08a 0%, #e8d45d 100%); background-image: -ms-linear-gradient(top, #eee08a 0%, #e8d45d 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#eee08ae\', endColorstr=\'#e8d45d\',GradientType=1 ); -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#eee08a\', endColorstr=\'#e8d45d\')"; background-image: linear-gradient(top, #eee08a 0%,#e8d45d 100%); color: #695E1E; top: 0; left: 0; height: 15px; opacity: 1; -moz-opacity: 0; -ms-fiter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; filter: alpha(opacity=0); -webkit-transition: all 0.2s ease-in; -moz-transition: all 0.2s ease-in; -o-transition: all 0.2s ease-in; -ms-transition: all 0.2s ease-in; transition: all 0.2s ease-in; }' +
                
                '.mercTrackerHolder { float: right; margin-right: 15px; }' +
                '.mercVs { float: left; margin: 15px 5px 0 5px; font-size: 10px; color: #5A8931; }' +
                '.mercCheckLeft { width: 18px; height: 14px; background-image: url(' + mercCheckImg + '); background-position: left top; background-repeat: no-repeat; float: right; display: block; margin: 16px 5px 0 5px; }' +
                '.mercCheckRight { width: 18px; height: 14px; background-image: url(' + mercCheckImg + '); background-position: left top; background-repeat: no-repeat; float: left; display: block; margin: 16px 5px 0 5px; }' +
                '.mercCheckSmallLeft { width: 15px; height: 12px; background-image: url(' + mercCheckImgSmall + '); background-position: center top; background-repeat: no-repeat; float: right; display: block; margin: 2px; }' +
                '.mercCheckSmallRight { width: 15px; height: 12px; background-image: url(' + mercCheckImgSmall + '); background-position: center top; background-repeat: no-repeat; float: left; display: block; margin: 2px; }' +
                '.mercTank { width: 28px; height: 10px; background-image: url(' + mercTankImg + '); background-position: center top; background-repeat: no-repeat; float: left; display: block; line-height: 10px; }' +
                '.mercMainHolder { clear: both; float: left; width: 100%; height: 16px; background-color: #D4EDC0; padding-right: 10px; margin-left: -10px; text-align: center; }' +
                
                'table.offers td { white-space: nowrap; }' +
                
                '.employee_info .citizen_actions { position: absolute; left: 190px; margin-top: 2px; z-index: 0; }' +
                '.employee_info .citizen_actions a { float: left; display: inline; width: 24px; height: 25px; text-indent: -9999px; background-image: url("http://www.erepublik.com/images/modules/citizenprofile/citizen_profile_icons.png"); margin-right: 4px; margin-top: 2px; clear: both; }' +
                '.employee_info .citizen_actions a.action_message { background-position: -24px 0; }' +
                '.employee_info .citizen_actions a.action_message:hover { background-position: -24px -25px; }' +
                '.employee_info .citizen_actions a.action_message:active { background-position: -24px -50px; }' +
                '.employee_info .citizen_actions a.action_donate { background-position: -48px 0; }' +
                '.employee_info .citizen_actions a.action_donate:hover { background-position: -48px -25px; }' +
                '.employee_info .citizen_actions a.action_donate:active { background-position: -48px -50px; }' +
                
                '#citizen_feed h6 em { color: #000000; }' +
                
                '.citizen_military .stat .userProgress { width: 196px; margin: 4px 7px; height: 5px; float: left; clear: both; position: relative; background: url(' + progressBarImg + ') no-repeat scroll 0 0 transparent; }' +
                '.citizen_military .stat .userProgress .progressBar { float: left; height: 5px; width: auto; background: url(' + progressBarImg + ') no-repeat scroll 0 -5px transparent; }' +
                '.citizen_military .stat .userProgress .progressBar span { float: right; width: 1px; height: 5px; background: url(' + progressBarImg + ') no-repeat scroll 0 -5px transparent; }' +

                '@-webkit-keyframes nodeInserted {' +
                    'from { clip: rect(1px, auto, auto, auto); }' +
                    'to { clip: rect(0px, auto, auto, auto); }' +
                '}' +
                '@-moz-keyframes nodeInserted {' +
                    'from { clip: rect(1px, auto, auto, auto); }' +
                    'to { clip: rect(0px, auto, auto, auto); }' +
                '}'
            );

            /**
            * Alter the content area and show the eRA button.
            */
            era.options.renderButton();

            /**
            * Show Twitter button.
            */
            era.options.renderTwitter();

            /**
            * Show Facebook button.
            */
            era.options.renderFacebook();

            /**
            * Show Google button.
            */
            era.options.renderGoogle();

            /**
            * Maintain option values.
            */
            era.options.init();
            era.settings = era.storage.get('Options');

            /**
            * Remove mission alert animation.
            */
            era.settings.sidebar && $('#point').remove();

            /**
            * Run scroll blocker.
            */
            era.scrollBlocker.init();

            /**
            * Show options window when eRA button clicked.
            */
            $(document).on('click', '#optionsContent', function(e) {
                e.stopPropagation();
                era.options.renderOptions(era.settings);
            });

            era.hostLang = location.href.split('/')[3].split('?')[0];
            era.characterLevel = parseInt($('.user_level b').html());
            era.characterCurrency = $('.currency_amount span').text();
            era.characterMoney = parseFloat($('#large_sidebar .currency_amount strong').text().match(/\d+\.?\d*/g).join(''));
            era.characterGold = parseFloat($('#large_sidebar .gold_amount strong').text().match(/\d+\.?\d*/g).join(''));

            era.settings.sidebar && $('#experienceTooltip').css('width', '122px');

            /**
            * Show custom menu rows.
            */
            (era.settings.menu1 || era.settings.menu2) && era.customMenu.addStyle();
            era.settings.menu1 && era.customMenu.renderTop();
            era.settings.menu2 && era.customMenu.renderBottom();

            /**
            * Maintain influence log values.
            */
            era.erepDay = parseInt($('.eday strong').html().replace(',', ''));
            era.influenceLog.init();

            era.exchangeRate.init();

            /**
            * Sidebar improvements.
            */
            era.settings.sidebar && era.addStyle(
                '.inventoryHolder {' +
                    'float: left;' +
                    'width: 149px;' +
                    'margin: ' + ($('#large_sidebar .sidebar_banners_area').length ? '0' : '15px') + ' 3px 0 3px;' +
                    'padding: 10px;' +
                    '-moz-border-radius: 5px;' +
                    '-webkit-border-radius: 5px;' +
                    'border-radius: 5px;' +
                    'border: 1px solid rgba(255,255,255,0.9);' +
                    'background-color: #f0efef;' +
                    'background-color: rgba(233,233,233,0.8);' +
                    'z-index: 10;' +
                    'box-shadow: 0px 0px 7px rgba(230,230,230,0.9);' +
                '}'
            );
            era.settings.sidebar && $('#optionsHolder').before('<div class="inventoryHolder"><a href="http://www.erepublik.com/' + era.hostLang + '/economy/inventory"></a></div>');

            era.settings.sidebar && era.inventoryPageProcessor.subscribers.push(era.miniInventory.o);
            era.settings.sidebar && era.inventoryPageProcessor.o();

            era.settings.sidebar && era.monetaryOffersFetcher.subscribers.push(era.miniMonetary.o);
            era.settings.sidebar && era.monetaryOffersFetcher.o();

            era.settings.sidebar && era.profilePageProcessor.subscribers.push(era.miniMercenary.o);

            /**
            * Mercenary tracker.
            */
            $('#homepage_feed').length && era.profilePageProcessor.subscribers.push(era.mercTrackerMain.o);
            location.href.indexOf('military/battlefield/') >= 0 && era.profilePageProcessor.subscribers.push(era.mercTrackerBattle.o);
            location.href.indexOf('military/campaigns') >= 0 && era.profilePageProcessor.subscribers.push(era.mercTrackerWar.o);
            location.href.indexOf('wars/show/') >= 0 && era.profilePageProcessor.subscribers.push(era.mercTrackerRes.o);
         
            era.profilePageProcessor.o();

            $('#homepage_feed').length && era.naturalEnemyFetcher.subscribers.push(era.changeFlagsMain.o);
            location.href.indexOf('military/campaigns') >= 0 && era.naturalEnemyFetcher.subscribers.push(era.changeFlagsWar.o);

            era.naturalEnemyFetcher.o();

            if (era.settings.subs){
                era.subscriptions.subscribers.push(era.subscriptions.compare);
                era.subscriptions.o();
            }

            eRAopt = era.storage.get('Options');

            era.linkRegions.o();
            era.improveShouts.o();
            era.dailyTrackerGet.o();

            era.settings.battlefield && location.href.indexOf('military/battlefield/') >= 0 && era.battlefield.o();
            era.settings.market && location.href.indexOf('economy/market') >= 0 && era.enchantMarket.o();
            era.settings.profile && location.href.indexOf('citizen/profile/') >= 0 && era.improveProfile.o();
            era.settings.mmarket && location.href.indexOf('economy/exchange-market') >= 0 && era.monetaryMarket.o();
            
            var pagesFunctions = [
                {p: 'main/search/', f: era.searchRedirect.o},
                {p: 'economy/inventory', f: era.enchantInventory.o},
                {p: 'economy/inventory', f: era.taxTable.o},
                {p: 'article/', f: era.changeComments.o},
                {p: 'economy/citizen-accounts/', f: era.storageTab.o},
                {p: 'citizen/edit/profile', f: era.storageTab.o},
                {p: 'citizen/change-residence', f: era.storageTab.o},
                {p: 'main/messages-inbox', f: era.betterMessages.o},
                {p: 'economy/manage-employees/', f: era.improveEmployees.o},
                {p: 'economy/myCompanies', f: era.improveCompanies.o}
            ];

            pagesFunctions.forEach(function(v) {
                if (location.href.substr(location.href.indexOf('/', location.href.indexOf('/') + 2) + 1 + era.hostLang.length + 1).substr(0, v.p.length) == v.p) {
                    v.f();
                }
            });

            $('.banner_place').insertAfter('#content');
            $('.banner_place').css({clear: 'left', 'float': 'left', marginTop: (!era.chrome ? 1 : 0) + 3 + 'px'});

            era.renderStyle();

            return true;

        }
    }
};

if (!era.chrome) {
    self.port.on('getUrlsDone', function(response) {
        for (var i in era.images) {
            window[era.images[i]] = response['img/' + era.images[i] + '.png'];
        }

        for (var i in self.options.database) {
            window[i] = self.options.database[i];
        }

        era.Main.o();
    });

    self.port.on('syncStorageUpDone', function() {
        self.port.emit('syncStorageDown');
    });

    self.port.on('syncStorageDownDone', function(response) {
        for (var key in localStorage) era.keyIsOurs(key) && localStorage.removeItem(key);
        for (var key in response = JSON.parse(response)) localStorage.setItem(key, response[key]);
        self.port.emit('getUrls');
    });

    self.port.emit('syncStorageUp', {'data': JSON.stringify(era.getOurStoragePairs()), 'domain': document.domain});
} else {
    chrome.extension.sendMessage({'action': 'syncStorageUp', 'data': JSON.stringify(era.getOurStoragePairs()), 'domain': document.domain}, function() {
        chrome.extension.sendMessage({'action': 'syncStorageDown'}, function(response) {
            for (var key in localStorage) era.keyIsOurs(key) && localStorage.removeItem(key);
            for (var key in response = JSON.parse(response)) localStorage.setItem(key, response[key]);

            for (var i in era.images) {
                window[era.images[i]] = chrome.extension.getURL('data/img/' + era.images[i] + '.png');
            }

            $.getJSON(chrome.extension.getURL('data/json/db.json'), function(db) {
                for (var i in era.database) {
                    window[era.database[i]] = db[era.database[i]];
                }

                era.Main.o();
            });
        });
    });
}
