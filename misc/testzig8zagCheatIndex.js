let ___int = setInterval(async ()=>{
        if (!MWGTM_M) return;

        clearInterval(___int);

        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/usatest.js').then(x => x.text()));
        usaPlates({
            map: MWGTM_M,
            GM_addStyle: GM_addStyle
        });

        eval(await fetch('https://echandler.github.io/test-geo-noob-script/misc/brazilCodesTest.js').then(x => x.text()));
        brazilCodes({
            map: MWGTM_M,
            GM_addStyle: GM_addStyle
        });
}, 1000);
