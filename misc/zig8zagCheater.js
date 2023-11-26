let ___int = setInterval(async ()=>{
        if (!MWGTM_M) return;
        
        const obj = {
            map: MWGTM_M,
            GM_addStyle: GM_addStyle
        };

        clearInterval(___int);
        
        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/satellite_view.js').then(x => x.text()));
        satelliteView(obj);
        
        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/usatest.js').then(x => x.text()));
        usaPlates(obj);

        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/brazilCodesTest.js').then(x => x.text()));
        brazilCodes(obj);

        eval(await fetch('https://echandler.github.io/Simple-Reverse-Geocoding-Script/reverseGeocodingScript.user.js').then(x => x.text()));
        
        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/chillStreaks.js').then(x => x.text()));
        chillStreaks(obj);
}, 1000);
