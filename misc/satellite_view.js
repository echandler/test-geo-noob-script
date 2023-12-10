
async function satelliteView(obj) {
    let map = null;
    let mapContainer = null;
    let _toggleTerrain = toggleTerrain;

    GeoGuessrEventFramework.init().then((GEF) => {
        GEF.events.addEventListener("round_start", (state) => {
            setTimeout(makeSatelliteView, 100);
        });

    //    GEF.events.addEventListener("round_end", (state) => {});
    });

    makeSatelliteView();

    async function makeSatelliteView() {
        let sv_canvas = document.querySelector('div[data-qa="panorama-canvas"]');
        let ls = localStorage["satelliteView"];
        ls = ls ? JSON.parse(ls) : false;

        if (ls === false) {
            if (mapContainer) {
                mapContainer.style.display = "none";
            }

            sv_canvas.style.display = "";

            toggleTerrain = _toggleTerrain;

            return;
        }

        sv_canvas.style.display = "none";
        let mapId = location.href.replace(/.*\/(.*$)/, "$1");
        let isChallenge = /challenge/i.test(location.href);
        let curMapInfo = await fetch(`https://www.geoguessr.com/api/v3/${isChallenge? 'challenges': 'games'}/${mapId}`).then((x) => x.json());

        curMapInfo.mapName = isChallenge ? curMapInfo.map.name : curMapInfo.mapName;
        curMapInfo.forbidPanning = isChallenge ? curMapInfo.challenge.forbidRotating : curMapInfo.forbidPanning;
        curMapInfo.forbidMoving = isChallenge ? curMapInfo.challenge.forbidMoving : curMapInfo.forbidMoving;
        curMapInfo.forbidZooming = isChallenge ? curMapInfo.challenge.forbidZooming : curMapInfo.forbidZooming;

        let isSatelliteMap = curMapInfo.mapName.match(/\[(\d+)\]/i);

        let bounds = isSatelliteMap? +isSatelliteMap[1]: null;

        if (curMapInfo.forbidPanning) {
            bounds = 1;
        } else if (curMapInfo.forbidMoving) {
            bounds = 2;
        } else if (curMapInfo.forbidZooming) {
            bounds = 5;
        }

        if (!mapContainer || !document.getElementById('satMapContainer')) {
            mapContainer = document.createElement("div");
            mapContainer.style.cssText = `height: 100%; width: 100%; margin: 0; padding: 0;`;
            mapContainer.id = 'satMapContainer';
            sv_canvas.parentElement.appendChild(mapContainer);
            map = null;
            let activeClass = null;
            mapContainer.addEventListener("mousedown", function(){
                const guessmap = document.querySelector("div[data-qa='guess-map']");
                if (!activeClass){
                    activeClass = Array.from(guessmap.classList).reduce((x,a)=> x + (/active/i.test(a)? a: ""), "");
                }
                guessmap.classList.remove(activeClass);
            });
        }

        // Make sure it's not hidden.
        mapContainer.style.display = "";

        const pinLocation = {
            lat: MWGTM_SV.position.lat(),
            lng: MWGTM_SV.position.lng(),
        };
        
        if (!map) {
            map = new google.maps.Map(mapContainer, {
                //  center: AUCKLAND,
                //  restriction: {
                //  latLngBounds: BOUNDS, //BOUNDS,
                //  strictBounds: false,
                //  },
                disableDefaultUI: true,
        //        mapTypeId: "satellite",
                gestureHandling: "greedy",
            });
        }
        
        map.setMapTypeId("satellite");

        if (bounds){

            const _bounds = getBBox2(pinLocation, bounds * 1000);

            const northEast = new google.maps.LatLng(_bounds[0], _bounds[3]);
            const southWest = new google.maps.LatLng(_bounds[2], _bounds[1]);
            const BOUNDS = new google.maps.LatLngBounds(southWest, northEast);

            map.setRestriction({
                latLngBounds: BOUNDS, //BOUNDS,
                strictBounds: true,
            });
        }
        
        map.setCenter(pinLocation);
        
        map.setZoom(7);

        google.maps.event.clearListeners(map, "idle");

        const marker = new google.maps.Marker({
            position: pinLocation,
            map: map,
        });

        toggleTerrain = function () {};
    }

    setInterval(() => {
        let container = document.querySelector("#mwgtm-settings-buttons");
        if (!container) return;
        if (container && document.querySelector("#satelliteView")) return;

        const div = document.createElement("div");
        div.classList.add("mwgtm-settings-option");
        div.id = "satelliteView";
        div.innerHTML = "Hide/Show Satellite View";
        div.style.color = "white";
        div.addEventListener("click", () => {
            let ls = localStorage["satelliteView"];
            ls = ls ? JSON.parse(ls) : false;
            localStorage["satelliteView"] = ls === true ? false : true;
            makeSatelliteView();
        });

        container.appendChild(div);
    }, 1000);

}

function getBBox2(coordinates, meters) {
    // From unity script
    let SW = moveFrom(coordinates, 135, meters * 1.44);
    let NE = moveFrom(coordinates, 315, meters * 1.44);
    if (NE.lat > 90) {
        SW.lat -= NE.lat - 90;
        NE.lat = 90;
    }
    if (SW.lat < -90) {
        NE.lat += -90 - SW.lat;
        SW.lat = -90;
    }
    if (SW.lng < -180) {
        NE.lng += -180 - SW.lng;
        SW.lng = -180;
    }
    if (NE.lng > 180) {
        SW.lng -= NE.lng - 180;
        NE.lng = 180;
    }
    return [NE.lat, SW.lng, SW.lat, NE.lng];
}

function moveFrom(coords, angle, distance) {
    // From unity script
    const R_EARTH = 6378.137;
    const M = 1 / (((2 * Math.PI) / 360) * R_EARTH) / 1000;
    let radianAngle = (-angle * Math.PI) / 180;
    let x = 0 + distance * Math.cos(radianAngle);
    let y = 0 + distance * Math.sin(radianAngle);

    let newLat = coords.lat + y * M;
    let newLng = coords.lng + (x * M) / Math.cos(coords.lat * (Math.PI / 180));
    return { lat: newLat, lng: newLng };
}

setInterval(function () {
        const guessmap = document.querySelector("div[data-qa='guess-map']");
            const canvas = document.querySelector("#satMapContainer");

            if (guessmap && !guessmap.__n) {
                    // Sometimes the guess map doesn't open back up.

                guessmap.addEventListener("mouseover", function (e) {
                if (!guessmap.activeClass) {
                    setTimeout(()=>{
                        guessmap.activeClass = Array.from(guessmap.classList).reduce( (x, a) => x + (/active/i.test(a) ? a : ""), "",);
                    }, 100);
                    return;
                }
                guessmap.classList.add(guessmap.activeClass);
                });
                guessmap.__n = true;
            }
            if (canvas && !canvas.__n) {
                canvas.addEventListener("mousedown", function () {
                    const guessmap = document.querySelector("div[data-qa='guess-map']");
                    if (!guessmap.activeClass) {
                        guessmap.activeClass = Array.from(guessmap.classList).reduce( (x, a) => x + (/active/i.test(a) ? a : ""), "",);
                    }
                    guessmap.classList.remove(guessmap.activeClass);
                });
                canvas.__n = true;
            }
 }, 2000);

