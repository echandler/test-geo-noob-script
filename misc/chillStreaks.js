
function chillStreaks(obj){
console.log("chillStreaks mod test", MWGTM_SV);

obj.GM_addStyle(`
    img {
        border-radius: 3px;
        box-shadow: 0px 0px 2px 0px grey;
    }
    div:has( > img[src*='tk']) {
        overflow: visible !important;
        animation: growInAnimation 0.5s both;
    }

    @keyframes growInAnimation {
        0% {
            transform: scale(1.0);
        }
        100% {
            transform: scale(1.5);
        }
    }

    .shrinkOut{
        animation: shrinkOutAnimation 0.5s both !important;
    }

    @keyframes shrinkOutAnimation {
        0% {
            transform: scale(1.5);
        }
        70% {
            transform: scale(2.0);
        }
        100% {
            transform: scale(0.0);
        }
    }
`);

// Copied from MDN https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
let stateObj = JSON.parse(localStorage['chillStreak'] || null);
if (!stateObj){
    stateObj = {
        state: true,
        numOfChoices: 4,
        delay: 5
    };
    localStorage['chillStreak'] = JSON.stringify(stateObj);
}

let chillStreaks_map = obj.map;
let polygonArray = [];
let currentLatLng = null;

let menu ={
        menuBody: null,
        opened: false,

        open: function(){
            if (this.opened) return;

            this.opened = true;

            let pos = localStorage['chillStreaksMenu']? JSON.parse(localStorage['chillStreaksMenu']): {x: 10, y: 10};

            let body = document.createElement('div');
            body.style.cssText = " position: absolute; top: "+pos.y+"px; left: "+pos.x+"px; background: white;padding: 10px; border-radius: 10px; border: 1px solid grey;z-index: 100000;";

            this.menuBody = body;

            let table = document.createElement('table');

            let header=document.createElement('tr');
            header.innerHTML = "<th>ChillStreaks Options</th>";

            let tr1 = document.createElement('tr');
            tr1.innerHTML = "<td>Activate ChillStreaks </td><td style='text-align:center;'> <input style='width:4em;' type='checkbox' id='stateCheckBox' "+(stateObj.state?"checked":"")+"></td>";
            let tr2 = document.createElement('tr');
            tr2.innerHTML = "<td>Number of random countries</td><td style='text-align:center;'><input style='width:4em;' type='text' id='numOfChoicesInput' value="+stateObj.numOfChoices+"></td>";
            let tr3 = document.createElement('tr');
            tr3.innerHTML = "<td>Delay time</td><td style='text-align:center;'><input style='width:4em;' type='text' id='delayInput' value="+stateObj.delay+"></td>";

            let saveBtn = document.createElement('button');
            saveBtn.innerHTML = 'Save';
            saveBtn.addEventListener('click', ()=>{
                stateObj.state = document.getElementById('stateCheckBox').checked;

                if (stateObj.state === true && currentLatLng){
                   unsafeWindow.g(currentLatLng);
                } else if (unsafeWindow.chillStreakMarker){
                    // Should Remove all markers.
                    unsafeWindow.chillStreakMarker.setMap(null);
                }

                stateObj.delay = JSON.stringify(+document.getElementById('delayInput').value);

                let _numOfChoices = +document.getElementById('numOfChoicesInput').value;
                _numOfChoices = _numOfChoices < 3? 3 : _numOfChoices;

                stateObj.numOfChoices = _numOfChoices;

                localStorage['chillStreak'] = JSON.stringify(stateObj);
                saveMsg.innerText = '';
                setTimeout(()=> saveMsg.innerText = 'Saved. Some changes take effect next round.', 200);
            });

            let saveMsg = document.createElement('span');
            saveMsg.style.cssText = `margin-left: 5px; font-size: 0.9em; color: grey;`;

            let closeBtn = document.createElement('div');
            closeBtn.style = 'position:absolute; right: 10px; top:10px; cursor: pointer;';
            closeBtn.innerText = 'X';
            closeBtn.addEventListener('click', this.close.bind(this));

            table.appendChild(header);
            table.appendChild(tr1);
            table.appendChild(tr2);
            table.appendChild(tr3);
//            table.appendChild(tr4);
            body.appendChild(table);
            body.appendChild(saveBtn);
            body.appendChild(saveMsg);
            body.appendChild(closeBtn);
            document.body.appendChild(body);

            body.addEventListener('mousedown', function(e){
                document.body.addEventListener('mousemove', mmove);
                document.body.addEventListener('mouseup', mup);
                let yy = pos.y - e.y;
                let xx = e.x - pos.x;

                function mmove(evt){
                    if (Math.abs(evt.x - e.x) > 2 || Math.abs(evt.y - e.y) > 2){
                       document.body.removeEventListener('mousemove', mmove);
                       document.body.addEventListener('mousemove', _mmove);
                    }
                }

                function _mmove(evt){
                    body.style.top = evt.y + yy + "px";
                    body.style.left = evt.x - xx + "px";
                }

                function mup(evt){
                    document.body.removeEventListener('mousemove', mmove);
                    document.body.removeEventListener('mousemove', _mmove);
                    document.body.removeEventListener('mouseup', mup);

                    if (Math.abs(evt.x - e.x) < 2 && Math.abs(evt.y - e.y) < 2){
                        return;
                    }

                    pos.x = evt.x - xx;
                    pos.y = evt.y + yy;
                    localStorage['chillStreaksMenu'] = JSON.stringify(pos);
                }
            });
        },
        close : function(){
            this.opened = false;
            document.body.removeChild(this.menuBody);
            this.menuBody = null;
        },
};

 function modifyStreetVeiwPanoramaObj(){
    let oldPano = google.maps.StreetViewPanorama;

    let oldSVSetPos = google.maps.StreetViewPanorama.prototype.setPosition;

    google.maps.StreetViewPanorama.prototype.setPosition = _setPos;

    function _setPos(...args){
        // chill streaks.

        oldSVSetPos.apply(this, args);

        google.maps.StreetViewPanorama.prototype.setPosition = oldSVSetPos;

        currentLatLng = args[0];
        unsafeWindow.__sv = this;
        if (stateObj.state === true){

            setTimeout(()=>chillStreaks_map && chillStreaks_map.zoom < 3 && chillStreaks_map.setCenter({lat: 0, lng:0}), 1000);

            unsafeWindow.g(args[0]);
        }
    }
}

let int = null;
let lastLatLng = {lat:0, lng: 0};

let curCoords = {}; // Fix for naughty bug.

unsafeWindow.g = function(args) {
    if (unsafeWindow.__map && unsafeWindow.__map !== chillStreaks_map){
        chillStreaks_map = unsafeWindow.__map;
    }

    let isChallenge = /challenge/i.test(location.href);
    if (isChallenge) return;

    curCoords = {...args}; // TODO: possible fix for a confusing bug.

    let gameId = location.pathname;
    let roundNum = document.body.querySelector('[data-qa="round-number"]')?.textContent.replace(/.*?(\d+).*/, "$1");
    let chillStreaksSave = localStorage["chillStreaksSave"] ? JSON.parse(localStorage["chillStreaksSave"]) : {};
    let ready = false;
    let _int = null;
    let p = 0;

    chillStreaksSave[gameId] = chillStreaksSave[gameId] || {};

    setTimeout(()=> { ready = true; }, stateObj.delay * 1000);

    clearInterval(int); // clearInterval doesn't always work.

    int = setInterval(async function(_int){
        if (!chillStreaks_map || !ready) return;

        clearInterval(int); // clearInterval doesn't always work.
        clearInterval(_int);

        p++;

        ready = false;

        if (p > 1) {
            alert('There appears to be a problem with Chill Streaks. Please reload page.');
        }

        if (chillStreaksSave[gameId][roundNum]){
            antiCheat(chillStreaksSave[gameId][roundNum]);
        } else {
            let info = await makeNewRound(curCoords);
            chillStreaksSave[gameId][roundNum] = info;
            localStorage["chillStreaksSave"] = JSON.stringify(chillStreaksSave);
        }
    }, 500, int);
}

function antiCheat(info){
    // Round alread exits.
    //debugger;
    let LocationPoly = makePoly(info.location.toLowerCase(), 'blue', chillStreaks_map, 0.50);
    LocationPoly.setMap(chillStreaks_map);
    polygonArray.push(LocationPoly);
   // unsafeWindow.highlightManager.add(LocationPoly);
    info.randomCountries.forEach(country => {
        let poly = makePoly(country.toLowerCase(), 'blue', chillStreaks_map, 0.50);
        poly.setMap(chillStreaks_map);
        polygonArray.push(poly);
    //    unsafeWindow.highlightManager.add(poly);
    });
}

async function makeNewRound(args){
    let antiCheat = {location: null, randomCountries: [], time: Date.now() };
    let lat = typeof args.lat === 'function'? args.lat(): args.lat;
    let lng = typeof args.lng === 'function'? args.lng(): args.lng;

    if (lat === lastLatLng.lat && lng === lastLatLng.lng){
        console.error("Current Position and last position the same.", lat, lng, lastLatLng);
        alert('Location could be wrong.');
    }

    lastLatLng = {lat, lng};

    await makeCorrectCountry(antiCheat, lat, lng);

    makeWrongCountries(antiCheat);

    return antiCheat;
}

async function makeCorrectCountry(antiCheat, lat, lng){
    let locationObj = await sgs.reverse({lat, lng});

    if (locationObj.error){
        antiCheat.location = false;
    } else {
        antiCheat.location = locationObj.country.country_code;
    }
    if (antiCheat.location === false) {
        alert("ChillStreaks can't find this country");
        return;
    }

    let locationPoly = makePoly(antiCheat.location.toLowerCase(), 'blue', chillStreaks_map, 0.50);
    locationPoly.setMap(chillStreaks_map);
    polygonArray.push(locationPoly);
}

let wrongCountries = ["CA","US","MX","GT","CO","EC","CN","PE","BO","BR","AR","UY","CL","ZA","SG","HK","NG","GH","PT","ES","FR","IT","CH","DE","BE","NL","IE","GB","DK","SE","NO","FI","EE","LV","LT","PL","CZ","AT","RU","UA","HU","RO","BG","RS","BA","ME","AL","MK","GR","TR","SI","HR","SK","IL","JO","TN","AE","LK","TH","KH","VN","LA","MY","ID","PH","TW","KR","JP","AU","NZ","IS","MN","KG"]

function makeWrongCountries(antiCheat){
    let repeat = {};

    repeat[antiCheat.location.toUpperCase()] = true;

    for (let n = 0; n < stateObj.numOfChoices - 1; n++){
        let country = null;

        for(;;){
            country = wrongCountries[Math.floor(Math.random() * wrongCountries.length)];
            if (country === 'AQ' || repeat[country]) {
                continue;
            }
            break;
        }

        repeat[country] = true;

        antiCheat.randomCountries.push(country);

        let poly = makePoly(country.toLowerCase(), 'blue', chillStreaks_map, 0.50);

        poly.setMap(chillStreaks_map);

        polygonArray.push(poly);
    }
}

function endOfRoundScreenFn(){
    if (endOfRoundScreenFn.runOnce){ return;}
    endOfRoundScreenFn.runOnce = true;
    modifyStreetVeiwPanoramaObj();
    clearInterval(int);
    setTimeout(function(){
        endOfRoundScreenFn.runOnce = false;
        cleanAntiCheat();
        polygonArray.forEach(poly => poly.setMap(null));
        polygonArray = [];
    }, 1000);
}
endOfRoundScreenFn.runOnce = false;

function cleanAntiCheat(){
    let nowTime = Date.now();
    let daysInMilli = 5 * 8640000;//86,400,00 milliseconds in a day;
    let ls = localStorage["chillStreaksSave"]? JSON.parse(localStorage["chillStreaksSave"]): {};
    let keys = Object.keys(ls);
    for (let n = 0; n < keys.length; n++){
        for (let m = 1; m < 6; m++){
            let num = m.toString();
            if (!ls[keys[n]][num]) continue;
            if ((nowTime - ls[keys[n]][num].time) > daysInMilli){
                delete ls[keys[n]];
                m = 100;
            }
        }
    }
    localStorage["chillStreaksSave"] = JSON.stringify(ls);
}

document.addEventListener("keydown", (e) => {
  //  if (/\/game\//.test(location.pathname) === false) return;
    switch (e.key) {
        case 'Escape':
            menu.opened ? menu.close(): menu.open();
    }
});

// Monitor end of round status.
var round = null;
var endOfRoundObserver = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach(record => {
        if (record.type == 'characterData'){
            let dataqa = record.target.parentElement.parentElement.getAttribute('data-qa');
            if (dataqa === 'round-number' || dataqa === 'score'){
                endOfRoundScreenFn();
                // alert('End of Round');
            }
            return;
        }

        if (record.type == 'childList'){
            setTimeout(function(removed, added){
                removed.forEach(node => {
                    if (!node.querySelector){
                        return;
                    }
                    if (node.querySelector('[data-qa="round-number"]')){
                        endOfRoundScreenFn();
                        return;
                    }
                });

                added.forEach(node => {
                    if (!node.querySelectorAll){
                        return;
                    }
                    let buttons = node.querySelectorAll('button');
                    buttons.forEach(button =>{
                        if(/play again/i.test(button.innerHTML) || /next game/i.test(button.innerHTML)){
                            endOfRoundScreenFn();
                        }
                    });
                    let anchors = node.querySelectorAll('a');
                    anchors.forEach(anchor =>{
                        if(/play again/i.test(anchor.innerHTML) || /next game/i.test(anchor.innerHTML)){
                            endOfRoundScreenFn();
                        }
                    });
                });
            }, 100, record.removedNodes, record.addedNodes);
        }
    });
})

endOfRoundObserver.observe(document.body, {
  childList: true,
  characterData: true,
  subtree: true,
})

function makeMarker(country, color, map, opacity){
    let flag = unsafeWindow.sgs.countryFlags[country.toUpperCase()];
    flag = flag? flag:  unsafeWindow.sgs.countryFlags['UNKNOWN'];

    let image ={
        url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flag),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(21/2, 15/2), // Most SVG Flags are 21 width and 15 height.
    };

    let pos = unsafeWindow.sgs.countryCentroids[country.toUpperCase()];
    if (!pos){
        console.log("MAKE MARKER ERROR", country)
     debugger;

    }
    const marker = new google.maps.Marker({
        position: {lat: pos.y, lng: pos.x},
        icon: image,
        clickable: false,
    });
    unsafeWindow.abcd = marker;
    let _setMap = marker.setMap;

    marker.setMap = function(map){
        if (map !== null){
            _setMap.call(this, map);
            return;
        }
        let icons = document.querySelectorAll("div:has( > img[src*='tk'])");
        if (icons) icons.forEach(icon => icon.classList.add('shrinkOut'));
        setTimeout(() => _setMap.call(this, map), 1000);
    }

unsafeWindow.chillStreakMarker = marker;

    return marker;

}

function makePoly(country, color, map, opacity) {
    return makeMarker(country, color, map, opacity);
    let coords = [];
    let n = 0;
   // let ca = testObj.__c;

    let ca = __t;

    country = (typeof country === 'string')? country.toLowerCase(): country;

    if (!ca[country]) {
        ca[country] = [[[]]];
    }

    for (; n < /*2*/ ca[country].length; n++) {
        coords.push([]);
        ca[country][n].forEach((a, i) => {
            coords[coords.length - 1].push({
                lat: a[1],
                lng: a[0],
            });
        });
    }

    let p = new google.maps.Polygon({
        paths: coords,
        strokeColor:  "#ffffff",
        strokeOpacity: 0.8,
        strokeWeight: 0.35,
        fillColor: testObj.bordersConfig[country] ? 'blue' : (color || "#00ff00"),
        fillOpacity: opacity || 0.25,
        clickable: false,
    });

    p._map = map;

    p.country = country;


    function zoomchange(evt) {
     //   if (p.map !== null && app.showPlayer && p._map && p._map.zoom > 10) {
     //       p.oldSetMap(null);
     //   } else if (p.map === null && app.showPlayer && p._map && p._map.zoom <= 10) {
     //       p.oldSetMap(p._map);
     //   }
    }

    return p;
}

        setInterval(()=>{
          let container = document.querySelector("#mwgtm-settings-buttons");
            if (!container) return;    
            if (container && document.querySelector("#chillStreaks")) return;

            const div = document.createElement('div');
            div.classList.add("mwgtm-settings-option");
            div.id = "chillStreaks"; 
            div.innerHTML = "Chill Streaks Menu";
            div.style.color = "white";
            div.addEventListener('click', ()=>{
		    menu.opened ? menu.close(): menu.open();
            });
             
            container.appendChild(div);
        }, 1000);


            unsafeWindow.g(MWGTM_SV.position);
//modifyStreeVeiwPanoramaObj();

}

