// ==UserScript==
// @name         3d country streak counter v0.75
// @description  Webgl country streak counter for Geoguessr. 
// @namespace    3d country streak counter 
// @version      0.75
// @author       echandler
// @match        https://www.geoguessr.com/*
// @run-at       document-start
// @copyright    2023, echandler
// @license      MIT
// @updateURL    https://github.com/echandler/3D-Duels-Streak-Counter/raw/main/3dDuelsCounter.user.js
// @grant        none
// ==/UserScript==

function d3StreakCounter(obj) {
    "use strict";
unsafeWindow.__map = obj.map;
    obj.GM_addStyle(`
        .d3StreakBtn:hover { background-color: grey;}
    `);

    obj.map.addListener('click', function(evt){
         // Listen for player 
         event.trigger('player placed pin on map', { req: evt });
    });

    GeoGuessrEventFramework.init().then((GEF) => {
        // Total hack "event" system.
        let _createRoundEndListener = createRoundEndFn;

        GEF.events.addEventListener("round_start", roundStartFn);

        GEF.events.addEventListener("round_end", roundEndFn)

        GEF.events.addEventListener("game_end", (state) => {
            createResultPageObserver();
            GEF.events.removeEventListener('round_end', roundEndFn);
            GEF.events.removeEventListener('round_start', roundEndFn);
            GEF.events.addEventListener('game_start', gameStartFn);
            //event.trigger('between rounds');
        });
        
        let debounce = Date.now() + 1000;
        let roundStartTime = Date.now();

        function roundStartFn(state) {
            if (gameInfo?.curRound?.isCorrectCountry){
                gameInfo.curRound.isCorrectCountry = false;
                gameInfo.curRound.pinLocation = null;
            }

            roundStartTime = Date.now();

            setTimeout(()=>{  
                //alert('hi');
                if (Date.now() < debounce) return;

                debounce = Date.now()+ 1000;

                event.trigger('spawn found', {
                    lat: MWGTM_SV.position.lat(),
                    lng: MWGTM_SV.position.lng(),
                });
                
            }, 500);

            _createRoundEndListener();
            
        }

        function roundEndFn(state) {
            if (Date.now() < roundStartTime + 1000) return;

            event.trigger('between rounds');
        }
        
        function gameStartFn(state){
            if (gameInfo?.curRound?.isCorrectCountry){
                gameInfo.curRound.isCorrectCountry = false;
                gameInfo.curRound.pinLocation = null;
            }

            GEF.events.removeEventListener('game_start', gameStartFn);
            
            // make sure listeners are removed.
            GEF.events.removeEventListener('round_end', roundEndFn);
            GEF.events.removeEventListener('round_start', roundEndFn);

            _createRoundEndListener = createRoundEndFn;
            GEF.events.addEventListener("round_start", roundStartFn);
            //GEF.events.addEventListener("round_end", roundEndFn);
        }

        function createRoundEndFn(){
            GEF.events.addEventListener("round_end", roundEndFn);
            _createRoundEndListener = function(){};
        }

        setInterval(()=>{
            if (!/game|challenge/.test(location.href)){
                event.trigger('script disabled');
            }
        }, 1000);
    });

    const gameInfo = localStorage['d3StreakCounter']
                     ? JSON.parse(localStorage['d3StreakCounter'])
                     : {
                            scriptDisabled: true,
                            particlesDisabled: false,
                            particlesAmount: "50",
                            x: 10, 
                            y: 1,
                            score: 0, 
                            curRound: {
                                isCorrectCountry : false,
                                pinLocation : null,
                            },
                            doExplodeScore: false,
                            guessCorrectText : "YAY! $2!",
                            guessIncorrectText: "Spawn: $2. You clicked on: $1. Old score: $3",
                            guessAnimation: true,
                            state1Size: 100,
                            state1SpotLightAngle: 0.5,
                            state2XY : {x: 0, y: 0},
                            state2Size : "20",
                            state2SpotLightAngle : "0.1",
                            state2XY : {x: 0, y: 40},
                            guessFontSize: "30",
                            guessSpotLightAngle: "0.1",
                        }; 

    let _3dCounter = null;

    let streetViewObj = null;
    
    let sgsMissingAlertInt = 0;
    
    let fetchWasModified = false;

    let _ran = false;

//    const callback = function (mutationsList, observer) {
//        for (let mutation of mutationsList) {
//            if (mutation.type === "childList") {
//                let el = mutation.addedNodes[0];
//                if (el && el.tagName === "SCRIPT" && /googleapis/.test(el.src)) {
//                    //observer.disconnect();
//
//                    let m = modifyStreetViewPanoramaObj1;
//
//                    el.addEventListener("load", function () {
//                        if (_ran) return;
//                        if (!window.google) return;
//
//                        _ran = true;
//
//                        m();
//                        clearInterval(timer);
//                    });
//                }
//            }
//        }
//    };

//if (document?.head){
//	    const targetNode = document.head;
//	    const config = { childList: true, subtree: true };
//	    const observer = new MutationObserver(callback);
//	    observer.observe(targetNode, config);
//}

//document.addEventListener("readystatechange", (event) => {
//    console.log('ready state from extension', event, document.readyState);
//
//    if (document.readyState === "interactive"){
//	    const targetNode = document.head;
//	    const config = { childList: true, subtree: true };
//	    const observer = new MutationObserver(callback);
//	    observer.observe(targetNode, config);
//	}
//});

    const event = { addListener: (evt, fn)=>{ event._evts.push([evt, fn])},
                   trigger: (evt)=>{ event._trEvts.push(evt); },
                   _trEvts:[], _evts: [], obj: {payload:{}}}; // Temperary until google is loaded.

    function initEventSystem(){
        event.trigger = (evt, payload) => {
            event.obj[evt] = payload;
            google.maps.event.trigger(event.obj, evt);
        };
        event.addListener = (evt, fn) => google.maps.event.addListener(event.obj, evt, fn);
        event.removeListener = (handler) => google.maps.event.removeListener(handler);

        event._evts.forEach( e => event.addListener(e[0], e[1]) );
        event._trEvts.forEach( e => event.trigger(e) );

        createEvents();
    }

    initEventSystem();

    const initialLocation = {
        lat: MWGTM_SV.position.lat(),
        lng: MWGTM_SV.position.lng(),
    };

    setTimeout(()=> event.trigger('spawn found', initialLocation), 100);

    function createEvents(){

        event.addListener('new panorama object created', ()=>{
            let timer = setTimeout(()=>{
        //        let guard = document.querySelector('[data-qa="undo-move"]');

        //        if (!guard){
        //            event.trigger('between rounds');
        //            return;
        //        }

                event.trigger('wait to end of round');

            }, 500);

            const handler = event.addListener('spawn found', ()=>{
                clearTimeout(timer);
                event.removeListener(handler);
            });

            //modifySetPos(); // TODO might be necessary
        });

        event.addListener('spawn found', ()=>{
            if(_3dCounter || gameInfo.scriptDisabled) return;
            
            _3dCounter = new make3DCounter();
        });


        event.addListener('spawn found', async ()=>{
            let _info = event.obj['spawn found'];

            if (gameInfo.curRound == null) gameInfo.curRound = {};

           // gameInfo.curRound.spawn = _info;

            if (!unsafeWindow.sgs){
               let t = await getSGS();
               setTimeout(()=> event.trigger('spawn found', _info), 1000);
               return;
            }

            let spawnLocation = await sgs.reverse({lat: _info.lat, lng: _info.lng});
            gameInfo.curRound = {...gameInfo.curRound, spawnLocation};

            console.log('spawn found', _info );

            event.trigger('wait for end of round');
        });

        event.addListener('script disabled', ()=>{
            _3dCounter?.unload();
            _3dCounter = null;
        });

        event.addListener('player placed pin on map', async () => {
            let _info = event.obj['player placed pin on map'];
            let spawn = gameInfo?.curRound?.spawn;

            if (!unsafeWindow.sgs){
               let t = await getSGS();
               setTimeout(()=> event.trigger('player placed pin on map', { req: _info }), 1000);
                return;
            }

            if (unsafeWindow.sgs){

                let pinLocation = await sgs.reverse({ lat: _info.req.latLng.lat(), lng: _info.req.latLng.lng() });
                let spawnLocation = gameInfo.curRound.spawnLocation;

                event.trigger('streak location info', { pinLocation, spawnLocation, roundNumber: _info.req.roundNumber });

            } else {
                if (sgsMissingAlertInt % 10 == 0){
                  
                   let _confirm = confirm("3d Duels Streak Counter needs the Simple Reverse Geocoding Script to be installed. Do you want to install it now?");
                   if (_confirm){
                       unsafeWindow.open('https://github.com/echandler/Simple-Reverse-Geocoding-Script');
                   }
                }

                sgsMissingAlertInt += 1;
            }
        });

        event.addListener('streak location info', () =>{
            let _info = event.obj['streak location info'];
           
            let isCorrectCountry = _info.pinLocation.country.admin_country_code === _info.spawnLocation.country.admin_country_code;

            gameInfo.curRound = {...gameInfo.curRound, ..._info, isCorrectCountry };

            localStorage['d3StreakCounter'] = JSON.stringify(gameInfo);
        });

        event.addListener('is this event needed?', waitForEndOfRound);

        event.addListener('wait for end of round', waitForEndOfRound);

        event.addListener('wait for end of round', function(){

            unsafeWindow._evt.fire('wait for end of round', gameInfo);
        });

        event.addListener('between rounds', betweenRounds);

        event.addListener('update correct score', ()=>{
            gameInfo.score += 1;

            localStorage.setItem("d3StreakCounter",JSON.stringify(gameInfo));

            unsafeWindow._evt.fire('update streak', gameInfo);
        });

        event.addListener('update incorrect score', ()=>{
            gameInfo.score = 0;
            
            localStorage.setItem("d3StreakCounter",JSON.stringify(gameInfo));

            unsafeWindow._evt.fire('update streak', gameInfo);
        });

        event.addListener('wait for next round', () => {

            if (gameInfo?.curRound?.isCorrectCountry != undefined){
                gameInfo.curRound = null;
                localStorage['d3StreakCounter'] = JSON.stringify(gameInfo);
            }

            waitForNextRound();
        });

        event.addListener('end of game', () => {

            unsafeWindow._evt.fire('end of game', gameInfo);
        });

        event.addListener('reload counter', () => {

            unsafeWindow._evt.fire('reload counter', gameInfo);
        });
    }

    function modifyStreetViewPanoramaObj1(){
        if (document.querySelector('[aria-label="Street View"]')){
            alert(`Not sure if the buggy 3d Duels Counter loaded correctly. 
                   The page may need to be refreshed if it doesn't work.`);
        }

        let oldSV = google.maps.StreetViewPanorama;

        google.maps.StreetViewPanorama = function(...args){

            streetViewObj = this;

            event.trigger('new panorama object created');

            return Reflect.apply(oldSV, this, args);
        }

        google.maps.StreetViewPanorama.prototype = oldSV.prototype;
    }

    let modifySetPos = (function (){
        let oldSetPos = null;

        return function(){
            if (!unsafeWindow.google && !streetViewObj){
                console.log('3d country streak counter cant find google or street view obj');
                setTimeout(modifySetPos, 100);
                return;
            }

            if (oldSetPos !== null) return;

            oldSetPos = google.maps.StreetViewPanorama.prototype.setPosition;

            google.maps.StreetViewPanorama.prototype.setPosition = function (...args){
                if (args[0]?.lat){
                    let lat = typeof args[0].lat === 'function'? args[0].lat(): args[0].lat;
                    let lng = typeof args[0].lng === 'function'? args[0].lng(): args[0].lng;

                    event.trigger('spawn found', { lat, lng});
                }

                google.maps.StreetViewPanorama.prototype.setPosition = oldSetPos;

                let ret = Reflect.apply(oldSetPos, this, args);

                oldSetPos = null;

                return ret;
            }
        }
    })();

  //  window.fetch = (function () {
  //      let _fetch = window.fetch;
  //      
  //      return async function (...args) {
  //          fetchWasModified = true;

  //          if (!/geoguessr.com.(duels)/i.test(location.href)) {

  //              if (/geoguessr.com.api.v4/i.test(args[0])) {

  //                  checkForDuelsHREF();

  //              }

  //              return Reflect.apply(_fetch, window, args);
  //          }

  //          if (/geoguessr.com.api.v4/i.test(args[0])) {
  //              // Backup event, probably not needed anymore.
  //              event.trigger('is this event needed?');

  //          }

  //          if (/game-server.geoguessr.com.api.duels.*pin/i.test(args[0])) {

  //              let reqBody =JSON.parse(args[1].body);

  //              event.trigger('player placed pin on map', { req: reqBody });

  //              //                 return res;
  //          }

  //          return Reflect.apply(_fetch, window, args);
  //      };
  //  })();

    let waiting = false;
    function waitForEndOfRound() {

            if (waiting) return;

            waiting = true;

            if (gameInfo?.curRound?.resJSON?.gameID){
                let roundID = location.pathname.replace(/.*\/(.*)$/, '$1');

                if (gameInfo.curRound.resJSON.gameID !== roundID){
                    gameInfo.curRound = null;
                }
            }

            if (!unsafeWindow.google || !streetViewObj){

                setTimeout(waitForEndOfRound, 100);

                waiting = false;

                return;
            }

            let int = setInterval(()=>{
                // Game is still in progress if undo move button is visible.
                if (document.querySelector('[data-qa="undo-move"]')) return;

                clearInterval(int);

                waiting = false;

                event.trigger('between rounds');

            }, 300);
        
   } 

    function betweenRounds () {

       // setTimeout(modifySetPos, 1_000);
        //let correctLocPin = document.querySelector('[alt="Correct location"]');
        //if (!correctLocPin){
        //    // No map visible.

        //    event.trigger('wait for next round');
        //    return;
        //}

        if (gameInfo?.curRound?.isCorrectCountry){

            event.trigger('update correct score');

        } else {

            event.trigger('update incorrect score');

        }
        console.log(gameInfo, gameInfo.curRound);
       // event.trigger('wait for next round');
    };

    function waitForNextRound () {
        let int = setInterval(()=>{
            let isDuels = true; //geoguessr.com.duels/i.test(location.href); // TODO delete this

         //   if (!isDuels || gameInfo.scriptDisabled){

         //       clearInterval(int);

         //       event.trigger('script disabled');

         //       return;
         //   }

            let anchor = document.querySelector('[href="/multiplayer"]');
            if (anchor){

                event.trigger('end of game');
            };
            let guard = document.querySelector('[data-qa="undo-move"]');

            // The next round has started if undo move button is visible.
            if (!guard) return;

            clearInterval(int);

          //  event.trigger('wait for end of round');

        }, 100);
    }

    let menu ={
        menuBody: null,
        opened: false,
        updateStreakListener: null,
        open: function(){
            if (this.opened) {
                this.close();
                return;
            }

            this.opened = true;

            if (gameInfo.x < 0 || (gameInfo.x + 20) > unsafeWindow.innerWidth 
                || gameInfo.y < 0 || (gameInfo.y + 20) > unsafeWindow.innerHeight){
                // Incase it goes off screen.
                gameInfo.x = 0; 
                gameInfo.y = 0;
            }

            let body = document.createElement('div');
            body.style.cssText = `position: absolute; top: ${gameInfo.y}px; left: ${gameInfo.x}px; background: white;padding: 10px; border-radius: 10px;
                                      border: 1px solid grey;z-index: 100_000; min-width:12em; overflow:hidden;  overflow-y:auto; max-height: 60vh; z-index:999999;`;

            this.menuBody = body;
            
            let innerBody = document.createElement('div');

            innerBody.style.cssText = `background: white; min-width:12em; overflow-y:auto;`;

            let header = document.createElement('div');
            header.style.cssText = 'text-align: center; font-weight: bold;';
            header.innerHTML = "Duels 3D Counter";

            let table = document.createElement('table');
            table.id = '3dCounterTable';

            let trScriptDisabled = document.createElement('tr');
            trScriptDisabled.innerHTML = `
                <td></td>
                <td><label><input id='disableScriptCheck1' type='checkbox' ${(gameInfo.scriptDisabled ? "checked" : "")}><span>Disable script</span></label></td>
                `;


            let _score = gameInfo.score? gameInfo.score :0;
            let changeGameScore = document.createElement('tr');
            changeGameScore.innerHTML = `
                <td></td>
                <td style="border-bottom: 1px solid #ebebeb;"><span>Game Score</span><input id='changeGameScore' type='number' style="width: 4rem; margin-left: 1rem;" value="${_score}"></td>
                `;

            this.updateStreakListener = unsafeWindow._evt.on('update streak', (obj)=>{
               setTimeout(()=>{
                   document.getElementById("changeGameScore").value = gameInfo.score;
               }, 100);
            })

            let s1Size = document.createElement('tr');
            s1Size.innerHTML = `
                <td></td>
                <td><span>State 1 number font size</span><input id='s1Size' type='number' style="width: 4rem; margin-left: 1rem;" value="${gameInfo.state1Size}"></td>
                `;

            let s1SpotLightAngle = document.createElement('tr');
            s1SpotLightAngle.style.cssText = `border-bottom: 1px solid grey;`;
            s1SpotLightAngle.innerHTML = `
                <td></td>
                <td style="border-bottom: 1px solid #ebebeb;"><span>State 1 spotlight angle (radians)</span><input id='s1SpotLightAngle' type='number' step='0.01' style="width: 4.5rem; margin-left: 1rem;" value="${gameInfo.state1SpotLightAngle}"></td>
                `;

            let s2Size = document.createElement('tr');
            s2Size.innerHTML = `
                <td></td>
                <td><span>State 2 number font size</span><input id='s2Size' type='number' style="width: 4rem; margin-left: 1rem;" value="${gameInfo.state2Size}"></td>
                `;

            let s2SpotLightAngle = document.createElement('tr');
            s2SpotLightAngle.innerHTML = `
                <td></td>
                <td style="border-bottom: 1px solid #ebebeb;"><span>State 2 spotlight angle (radians)</span><input id='s2SpotLightAngle' type='number' step='0.01' style="width: 4.5rem; margin-left: 1rem;" value="${gameInfo.state2SpotLightAngle}"></td>
                `;

            let guessFontSize = document.createElement('tr');
            guessFontSize.innerHTML = `
                <td></td>
                <td><span>Guess text font size</span><input id='guessFontSize' type='number' style="width: 4rem; margin-left: 1rem;" value="${gameInfo.guessFontSize}"></td>
                `;

            let guessSpotLightAngle = document.createElement('tr');
            guessSpotLightAngle.innerHTML = `
                <td></td>
                <td style="border-bottom: 1px solid #ebebeb;"><span>Guess spotlight angle (radians)</span><input id='guessSpotLightAngle' type='number' step='0.01' style="width: 4.5rem; margin-left: 1rem;" value="${gameInfo.guessSpotLightAngle}"></td>
                `;

            let guessCorrectText = document.createElement('tr');
            guessCorrectText.innerHTML = `
                <td></td>
                <td><span>Correct guess text</span><input id='guessCorrectText' type='text' style="margin-left: 1rem;" value="${gameInfo.guessCorrectText || "YAY! $2!" }"></td>
                `;

            let guessIncorrectText = document.createElement('tr');
            guessIncorrectText.innerHTML = `
                <td></td>
                <td ><span>Incorrect guess text </span><input id='guessIncorrectText' type='text' style="margin-left: 1rem;" value="${gameInfo.guessIncorrectText || "Spawn: $2. You clicked on: $1. Old score: $3" }"></td>
                `;

            let guessAnimation = document.createElement('tr');
            guessAnimation.innerHTML = `
                <td></td>
                <td style="border-bottom: 1px solid #ebebeb;"><label><input id='guessAnimation' type='checkbox' ${(gameInfo.guessAnimation ? "checked" : "")}><span style='margin-left: 1rem;'>Guess text animation at end of round.</span></label>
                `;

            let particles = document.createElement('tr');
            particles.innerHTML = `
                <td></td>
                <td><label><input id='particlesCheck' type='checkbox' ${(!gameInfo.particlesDisabled ? "checked" : "")}><span style='margin-left: 1rem;'>Particles</span></label>
                <input id='particlesAmount' type='number' style="width: 4rem; margin-left: 1rem;" value="${gameInfo.particlesAmount === undefined? 50: gameInfo.particlesAmount}"></td>
                `;

            let exploded = document.createElement('tr');
            exploded.innerHTML = `
                <td></td>
                <td><label><input id='explodedCheck' type='checkbox' ${(gameInfo.doExplodeScore ? "checked" : "")}><span style='margin-left: 1rem;'>Explode correct score</span></label>
                `;

            let reloadBtn = document.createElement('button');
            reloadBtn.classList.add('d3StreakBtn');
            reloadBtn.innerHTML = 'Reload';
            reloadBtn.style.cssText = "border: 1px solid grey; margin-left: 1rem; padding: 0.5rem;";
            reloadBtn.addEventListener('click', async ()=>{
                event.trigger('reload counter', gameInfo);     
            });

            let saveBtn = document.createElement('button');
            saveBtn.classList.add('d3StreakBtn');
            saveBtn.innerHTML = 'Save';
            saveBtn.style.cssText = "border: 1px solid grey; margin-left: 1rem; padding: 0.5rem;";
            saveBtn.addEventListener('click', async ()=>{
                let _gameInfo = {...gameInfo};
                gameInfo.score = +document.getElementById('changeGameScore').value;
                gameInfo.scriptDisabled = document.getElementById('disableScriptCheck1').checked;
                gameInfo.state1SpotLightAngle = document.getElementById('s1SpotLightAngle').value;
                gameInfo.state1Size = document.getElementById('s1Size').value;
                gameInfo.state2SpotLightAngle = document.getElementById('s2SpotLightAngle').value;
                gameInfo.state2Size = document.getElementById('s2Size').value;
                gameInfo.guessFontSize = document.getElementById('guessFontSize').value;
                gameInfo.guessSpotLightAngle = document.getElementById('guessSpotLightAngle').value;
                gameInfo.guessCorrectText = document.getElementById('guessCorrectText').value;
                gameInfo.guessIncorrectText = document.getElementById('guessIncorrectText').value;
                gameInfo.guessAnimation = document.getElementById('guessAnimation').value;
                gameInfo.particlesDisabled = !document.getElementById('particlesCheck').checked;
                gameInfo.particlesAmount = document.getElementById('particlesAmount').value;
                gameInfo.doExplodeScore = document.getElementById('explodedCheck').checked;
                
                    debugger;
                if (_3dCounter?.mainScore?.stateObj?.state === 1){
                    _3dCounter.mainScore.spotLight.angle = +gameInfo.state1SpotLightAngle;
                    if (_3dCounter.mainScore.stateObj.size !== gameInfo.state1Size){
                        _3dCounter.mainScore.stateObj.size = gameInfo.state1Size;
                        _3dCounter.refreshMainScore(_3dCounter.mainScore.stateObj);
                    }
                } else if (_3dCounter?.mainScore?.stateObj?.state === 2){
                    _3dCounter.mainScore.spotLight.angle = +gameInfo.state2SpotLightAngle;
                    if (_3dCounter.mainScore.stateObj.size !== gameInfo.state2Size){
                        _3dCounter.mainScore.stateObj.size = gameInfo.state2Size;
                        _3dCounter.clearRotateScoreContinuous();
                        _3dCounter.makeState2(gameInfo, gameInfo._score);
                        //_3dCounter.refreshMainScore(_3dCounter.mainScore.stateObj);
                    }
                }
                
                if (_gameInfo.particlesAmount !== gameInfo.particlesAmount
                    || _gameInfo.particlesDisabled !== gameInfo.particlesDisabled){

                    if (_gameInfo.particlesDisabled !== gameInfo.particlesDisabled){
                        event.trigger('reload counter', gameInfo);     
                    } else if (gameInfo.particlesDisabled === false){
                        // No need to reload if particles are disabled.
                        event.trigger('reload counter', gameInfo);     
                    }
                }

                if (_gameInfo.score !== gameInfo.score){
                    event.trigger('reload counter', gameInfo);     
                }

                if (_3dCounter?.guessText){
                    let text = _3dCounter.guessText;
                    text.spotLight.angle = +gameInfo.guessSpotLightAngle;
                    
                    if (text.textStyle.size !== +gameInfo.guessFontSize
                        || text.stateObj.guessCorrectText !== gameInfo.guessCorrectText
                        || text.stateObj.guessIncorrectText !== gameInfo.guessIncorrectText){
                        text.remove();
                        _3dCounter.makeGuessText(gameInfo);
                    } 
                }

                localStorage['d3StreakCounter'] = JSON.stringify(gameInfo);

                msg.innerText = "Saved. May need to reload counter.";

                if (gameInfo.scriptDisabled){
                    event.trigger('script disabled');
                } else if (!gameInfo.scriptDisabled && !_3dCounter){
                    _3dCounter = new make3DCounter();
                }
            });

            let msg = document.createElement('span');
            msg.style.cssText = "margin-left: 2em; font-size: 0.7em; color: grey;";

            body.addEventListener('click', (e)=> {
                if (e.target == saveBtn) return;
                msg.innerText='';
            });

            let closeBtn = document.createElement('div');
            closeBtn.style = 'position:absolute; right: 10px; top:10px; cursor: pointer;';
            closeBtn.innerText = 'X';
            closeBtn.addEventListener('click', this.close.bind(this));

            // TODO: This will past a duplicate style element everytime the menu is opened.
            // document.head.insertAdjacentHTML("beforeend", `<style>#noCarMenuTable input[type="text" i] { margin-left: 0.4em; padding: 0.4em; } #noCarMenuTable span { margin-left: 0.4em; }</style>`)

            table.appendChild(trScriptDisabled);
            table.appendChild(changeGameScore);
            table.appendChild(s1Size);
            table.appendChild(s1SpotLightAngle);
            table.appendChild(s2Size);
            table.appendChild(s2SpotLightAngle);
            table.appendChild(guessFontSize);
            table.appendChild(guessSpotLightAngle);
            table.appendChild(guessCorrectText);
            table.appendChild(guessIncorrectText);
            table.appendChild(guessAnimation);
            table.appendChild(particles);
            table.appendChild(exploded);

            body.appendChild(header);

            innerBody.appendChild(table);

            body.appendChild(innerBody);
            body.appendChild(reloadBtn);
            body.appendChild(saveBtn);
            body.appendChild(msg);
            body.appendChild(closeBtn);

            document.body.appendChild(body);

            let inputs = body.querySelectorAll('input');

            inputs.forEach(el => el.addEventListener('mousedown', e => e.stopPropagation())); // Prevent mouse press from moving menu
            inputs.forEach(el => el.addEventListener('keydown', e => e.stopPropagation())); // Prevent key press from messing up game
            inputs.forEach(el => el.addEventListener('keyup', e => e.stopPropagation())); // Prevent key press from messing up game

            body.addEventListener('mousedown', function(e){
                document.body.addEventListener('mousemove', mmove);
                document.body.addEventListener('mouseup', mup);

                let yy = gameInfo.y - e.y;
                let xx = e.x - gameInfo.x;

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

                    gameInfo.x = evt.x - xx;
                    gameInfo.y = evt.y + yy;

                    localStorage['d3StreakCounter'] = JSON.stringify(gameInfo);
                }
            });
        },
        close : function(){
            this.opened = false;
            document.body.removeChild(this.menuBody);
            this.menuBody = null;
            unsafeWindow._evt.off(this.updateStreakListener);
        },
    };

     unsafeWindow._menu = menu;
 
  //  document.addEventListener('keydown', (evt) => {
  //      if (evt.key !== 'Escape') return;

  //      menu.opened? menu.close() : menu.open();
  //  });

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 3d counter
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    let events = {};
    let on = function(event, callback){
        events[event] = events[event] || [];
        let num = events[event].push(callback) -1;
        return {num, event, callback};
    }
    let off = function(eventObj){
        events[eventObj.event][eventObj.num] = null;
    }
    let fire = function(event, _a){

        google.maps.event.trigger(this, 'edited');

        if(!events[event]) {
        console.error('Event not found ->', event);
            return;
        }
        for(let e = 0;e < events[event].length; e++){
        if (!events[event][e]) continue;
            events[event][e](_a);
        }
    }

    unsafeWindow._evt = { events, on, off, fire };
    
    let neoSans_Italic = {"glyphs":{"0":{"ha":896,"x_min":0,"x_max":0,"o":"m 942 713 b 929 575 942 671 938 625 l 908 456 b 450 -12 849 110 707 -12 b 147 319 267 -12 147 97 b 160 456 147 361 151 407 l 181 575 b 638 1044 244 944 393 1044 b 942 713 828 1044 942 932 m 707 715 b 603 847 707 818 668 847 b 418 575 514 847 456 789 l 397 456 b 382 314 388 397 382 350 b 485 185 382 213 419 185 b 671 456 571 185 632 236 l 692 575 b 707 715 701 632 707 679 "},"1":{"ha":896,"x_min":0,"x_max":0,"o":"m 388 197 l 492 794 l 297 717 b 281 713 290 714 285 713 b 268 731 271 713 267 719 l 296 889 b 314 908 299 899 303 904 l 586 1026 b 619 1032 596 1031 606 1032 l 744 1032 b 765 1006 760 1032 768 1021 l 624 197 l 808 197 b 831 171 824 197 833 186 l 806 28 b 774 0 803 13 789 0 l 168 0 b 144 28 153 0 142 13 l 169 171 b 203 197 172 186 188 197 "},"2":{"ha":896,"x_min":0,"x_max":0,"o":"m 943 829 b 733 508 943 679 868 589 l 601 429 b 364 197 499 368 394 322 l 796 197 b 819 175 810 197 819 188 l 819 172 l 819 171 l 794 28 b 761 0 792 13 776 0 l 143 0 b 121 22 129 0 121 10 l 121 26 l 121 28 l 146 169 b 396 533 172 322 260 449 l 540 624 b 711 792 676 708 711 731 b 578 857 711 838 676 857 b 301 839 493 857 388 847 l 299 839 b 278 861 286 839 278 849 l 278 867 l 297 975 b 328 1001 300 989 313 997 b 632 1044 410 1025 514 1044 b 943 829 840 1044 943 961 "},"3":{"ha":896,"x_min":0,"x_max":0,"o":"m 940 808 b 772 528 940 690 886 578 b 864 356 824 497 864 425 b 438 -12 864 97 674 -12 b 157 26 329 -12 225 4 b 136 49 146 31 136 38 l 136 51 l 136 53 l 156 164 b 185 189 158 179 171 189 l 186 189 l 188 189 b 461 176 283 181 386 176 b 631 365 586 176 631 249 b 533 439 631 414 604 439 l 289 439 b 267 461 275 439 267 449 l 267 465 l 267 467 l 288 585 b 319 611 290 600 304 611 l 558 611 b 703 782 669 611 703 683 b 582 856 703 833 674 856 b 306 839 485 856 413 849 l 304 839 l 303 839 b 282 858 290 839 282 846 l 282 863 l 282 864 l 301 975 b 333 1001 304 989 318 997 b 625 1044 410 1024 517 1044 b 940 808 818 1044 940 964 "},"4":{"ha":896,"x_min":0,"x_max":0,"o":"m 904 388 l 882 260 b 849 232 879 244 864 232 l 757 232 l 722 28 b 690 0 719 13 706 0 l 506 0 b 485 22 492 0 485 10 l 485 28 l 519 232 l 118 232 b 96 254 104 232 96 242 l 96 260 l 119 394 b 143 438 122 410 131 424 l 683 1013 b 722 1032 696 1025 706 1032 l 871 1032 b 893 1010 885 1032 893 1022 l 893 1004 l 790 415 l 882 415 b 904 393 896 415 904 406 m 611 708 b 607 714 611 713 610 714 b 601 711 606 714 603 713 l 344 429 b 340 421 342 426 340 422 b 349 415 340 417 343 415 l 560 415 l 611 706 l 611 708 "},"5":{"ha":896,"x_min":0,"x_max":0,"o":"m 938 1006 l 913 867 b 881 840 910 851 896 840 l 503 840 l 451 649 l 492 649 b 856 392 717 649 856 576 b 414 -12 856 110 686 -12 b 149 28 325 -12 225 3 b 125 53 138 32 125 38 l 125 57 l 125 58 l 144 168 b 175 193 147 183 161 193 l 176 193 l 178 193 b 424 176 264 183 372 176 b 615 374 561 176 615 240 b 438 467 615 447 572 467 l 222 467 b 207 483 213 467 207 475 l 207 486 l 207 488 l 342 1006 b 374 1032 346 1019 360 1032 l 914 1032 b 938 1010 928 1032 938 1022 l 938 1007 "},"6":{"ha":896,"x_min":0,"x_max":0,"o":"m 929 1017 b 954 986 950 1011 957 1004 l 933 865 b 896 836 929 842 922 832 b 647 856 831 846 729 856 b 438 653 514 856 460 807 l 436 643 b 603 660 474 650 544 660 b 894 407 765 660 894 581 b 478 -12 894 136 722 -12 b 151 289 267 -12 151 99 b 197 608 151 339 163 410 b 661 1044 258 956 400 1044 b 929 1017 786 1044 875 1031 m 661 386 b 536 494 661 471 608 494 b 407 481 500 494 440 486 b 381 296 396 421 381 357 b 492 168 381 193 428 168 b 661 386 617 168 661 271 "},"7":{"ha":896,"x_min":0,"x_max":0,"o":"m 689 833 b 681 840 689 838 686 840 l 301 840 b 276 867 286 840 272 844 l 301 1006 b 335 1032 304 1021 311 1032 l 936 1032 b 975 986 964 1032 981 1021 l 957 885 b 924 821 954 867 940 847 l 418 26 b 379 0 407 8 396 0 l 183 0 b 161 14 167 0 161 6 b 168 32 161 19 164 26 l 686 825 b 689 833 688 828 689 831 "},"8":{"ha":896,"x_min":0,"x_max":0,"o":"m 956 790 b 801 536 956 679 906 590 b 883 357 853 493 883 431 b 454 -12 883 94 697 -12 l 439 -12 b 122 246 250 -12 122 86 b 286 536 122 369 182 468 b 210 711 236 581 210 635 b 626 1044 210 963 401 1044 l 642 1044 b 956 790 846 1044 956 943 m 733 779 b 611 871 733 838 696 871 l 596 871 b 429 707 489 871 429 814 b 536 617 429 653 463 617 l 579 617 b 733 779 678 617 733 688 m 654 349 b 550 450 654 401 626 450 l 507 450 b 351 263 403 450 351 356 b 471 163 351 203 385 163 l 486 163 b 654 349 599 163 654 246 "},"9":{"ha":896,"x_min":0,"x_max":0,"o":"m 929 743 b 883 424 929 693 918 622 b 419 -12 822 76 681 -12 b 151 15 294 -12 206 1 b 126 39 136 19 126 25 l 126 46 l 147 167 b 185 196 151 190 161 200 b 433 176 250 185 351 176 b 643 379 567 176 621 225 l 644 389 b 478 372 607 382 536 372 b 186 625 315 372 186 451 b 621 1044 186 896 358 1044 b 929 743 814 1044 929 933 m 700 736 b 589 864 700 839 653 864 b 419 646 464 864 419 761 b 544 538 419 561 472 538 b 674 551 581 538 640 546 b 700 736 685 611 700 675 "},"ý":{"ha":694,"x_min":0,"x_max":0,"o":"m 17 924 l 676 924 l 676 0 l 17 0 m 347 521 l 571 858 l 122 858 m 83 126 b 307 463 83 125 307 463 l 83 799 m 386 463 l 611 125 l 611 799 m 347 403 l 122 67 l 571 67 "}," ":{"ha":347,"x_min":0,"x_max":0,"o":""},"!":{"ha":379,"x_min":0,"x_max":0,"o":"m 489 1038 l 339 344 b 306 315 336 329 321 315 l 188 315 b 163 340 174 315 163 328 l 163 344 l 257 1038 b 292 1065 258 1053 276 1065 l 465 1065 b 489 1043 479 1065 489 1056 m 335 203 l 304 28 b 272 0 301 13 288 0 l 108 0 b 86 22 94 0 86 10 l 86 28 l 117 203 b 149 229 119 218 133 229 l 313 229 b 335 208 326 229 335 221 "},"\"":{"ha":656,"x_min":0,"x_max":0,"o":"m 808 1054 b 804 1039 808 1050 807 1044 l 646 735 b 615 708 636 717 629 708 l 475 708 b 464 718 467 708 464 713 b 468 735 464 722 465 728 l 597 1039 b 629 1065 606 1058 615 1065 l 794 1065 b 808 1054 804 1065 808 1061 m 504 1054 b 500 1039 504 1050 503 1044 l 342 735 b 311 708 332 717 325 708 l 171 708 b 160 718 163 708 160 713 b 164 735 160 722 161 728 l 293 1039 b 325 1065 301 1058 311 1065 l 490 1065 b 504 1054 500 1065 504 1061 "},"#":{"ha":971,"x_min":0,"x_max":0,"o":"m 1038 751 b 1036 746 1038 749 1036 747 l 1000 640 b 976 625 997 631 986 625 l 858 625 l 799 401 l 915 401 b 938 383 926 401 938 394 b 936 379 938 382 936 381 l 904 281 b 878 260 901 271 888 260 l 761 260 l 700 26 b 671 0 696 13 686 0 l 529 0 b 510 19 517 0 510 8 b 511 26 510 21 511 24 l 572 260 l 415 260 l 353 26 b 324 0 349 13 338 0 l 181 0 b 161 19 169 0 161 8 b 163 26 161 22 163 24 l 224 260 l 106 260 b 89 274 96 260 89 265 b 90 281 89 276 89 278 l 125 385 b 147 401 128 394 138 401 l 263 401 l 321 625 l 203 625 b 186 638 193 625 186 629 b 188 644 186 640 186 642 l 222 751 b 247 767 225 761 238 767 l 358 767 l 422 1006 b 453 1032 426 1019 439 1032 l 596 1032 b 614 1013 607 1032 614 1024 b 613 1006 614 1011 613 1008 l 549 767 l 706 767 l 771 1006 b 801 1032 775 1019 786 1032 l 943 1032 b 961 1014 956 1032 961 1024 b 960 1006 961 1011 961 1008 l 894 767 l 1015 767 b 1038 751 1026 767 1038 761 m 513 625 l 453 401 l 610 401 l 669 625 "},"$":{"ha":896,"x_min":0,"x_max":0,"o":"m 932 988 l 908 850 b 879 825 906 835 893 825 l 876 825 b 585 840 792 833 679 840 b 463 749 515 840 463 828 b 536 665 463 719 479 700 l 696 569 b 843 338 804 504 843 421 b 529 -1 843 146 718 18 l 506 -132 b 474 -160 503 -147 489 -160 l 321 -160 b 297 -136 307 -160 297 -150 l 297 -132 l 319 -8 b 147 18 251 -4 194 6 b 126 42 135 21 126 29 l 126 46 l 150 182 b 181 208 153 196 165 208 l 183 208 b 443 192 239 201 378 192 b 588 307 529 192 588 211 b 517 397 588 338 571 361 l 346 511 b 218 731 251 574 218 657 b 503 1035 218 915 333 1013 l 525 1156 b 558 1183 528 1171 543 1183 l 711 1183 b 733 1161 725 1183 733 1174 l 733 1156 l 713 1040 b 911 1014 793 1035 875 1024 b 932 992 922 1011 932 1003 "},"%":{"ha":1165,"x_min":0,"x_max":0,"o":"m 1178 389 b 1172 331 1178 371 1176 351 l 1154 226 b 906 -12 1124 49 1039 -12 b 738 168 796 -12 738 61 b 743 226 738 186 739 206 l 761 331 b 1008 568 793 513 876 568 b 1178 389 1115 568 1178 499 m 1149 1024 b 1140 1004 1149 1018 1146 1011 l 392 29 b 354 0 376 10 369 0 l 211 0 b 199 11 203 0 199 4 b 206 29 199 17 200 22 l 954 1004 b 994 1032 971 1025 979 1032 l 1138 1032 b 1149 1024 1146 1032 1149 1029 m 611 865 b 606 807 611 847 610 828 l 588 703 b 339 464 557 525 472 464 b 171 644 229 464 171 538 b 176 703 171 663 172 682 l 194 807 b 442 1044 226 989 310 1044 b 611 865 549 1044 611 975 m 1038 386 b 988 449 1038 435 1018 449 b 900 331 947 449 917 425 l 882 226 b 876 171 878 204 876 186 b 926 107 876 122 896 107 b 1014 226 967 107 997 132 l 1032 331 b 1038 386 1036 353 1038 371 m 471 863 b 421 925 471 911 451 925 b 333 807 381 925 350 901 l 315 703 b 310 647 311 681 310 663 b 360 583 310 599 329 583 b 447 703 400 583 431 608 l 465 807 b 471 863 469 829 471 847 "},"&":{"ha":1017,"x_min":0,"x_max":0,"o":"m 1011 497 l 1010 486 b 875 183 997 382 957 283 l 990 33 b 996 21 993 29 996 25 b 975 0 996 10 986 0 l 778 0 b 756 11 767 0 763 1 l 722 56 b 451 -12 646 13 554 -12 b 115 244 272 -12 115 50 b 350 542 115 400 226 474 l 340 554 b 260 764 272 642 260 710 b 628 1044 260 983 433 1044 b 908 832 811 1044 908 953 b 676 532 908 682 804 604 l 628 504 l 775 314 b 831 486 797 350 819 399 l 832 497 b 861 525 833 513 846 525 l 990 525 b 1011 501 1004 525 1011 515 m 701 821 b 606 889 701 863 671 889 b 461 763 519 889 461 853 b 517 649 461 733 471 701 l 526 638 l 567 660 b 701 821 633 696 701 733 m 453 407 b 343 244 378 365 343 326 b 481 149 343 176 383 149 b 625 181 538 149 585 160 "},"'":{"ha":351,"x_min":0,"x_max":0,"o":"m 504 1054 b 500 1039 504 1050 503 1044 l 342 735 b 311 708 332 717 325 708 l 171 708 b 160 718 163 708 160 713 b 164 735 160 722 161 728 l 293 1039 b 325 1065 301 1058 311 1065 l 490 1065 b 504 1054 500 1065 504 1061 "},"(":{"ha":501,"x_min":0,"x_max":0,"o":"m 642 1021 b 631 996 642 1014 638 1006 b 344 132 443 733 344 453 b 400 -233 344 -12 367 -140 b 404 -251 403 -239 404 -246 b 385 -269 404 -262 399 -269 l 260 -269 b 215 -250 239 -269 224 -265 b 119 174 151 -133 119 17 b 425 1013 119 476 222 785 b 475 1032 439 1028 454 1032 l 628 1032 b 642 1021 638 1032 642 1028 "},")":{"ha":501,"x_min":0,"x_max":0,"o":"m 515 581 b 211 -250 515 281 413 -25 b 161 -269 197 -265 182 -269 l 8 -269 b -7 -258 -3 -269 -7 -265 b 4 -233 -7 -251 -3 -242 b 293 639 194 32 293 314 b 235 996 293 785 269 901 b 232 1013 233 1001 232 1007 b 251 1032 232 1024 238 1032 l 376 1032 b 421 1013 397 1032 413 1028 b 515 581 472 917 515 761 "},"*":{"ha":665,"x_min":0,"x_max":0,"o":"m 757 792 b 736 771 757 782 749 775 l 576 724 l 676 588 b 683 568 681 581 683 574 b 675 551 683 561 682 556 l 603 499 b 590 494 599 496 594 494 b 568 508 582 494 574 500 l 472 647 l 376 508 b 354 494 371 500 363 494 b 342 499 350 494 346 496 l 268 551 b 258 568 261 556 258 561 b 267 588 258 574 263 581 l 367 724 l 208 771 b 186 793 196 775 186 782 b 188 800 186 794 186 797 l 215 888 b 233 901 218 897 225 901 b 249 899 239 901 243 900 l 408 846 l 404 1011 b 426 1040 404 1026 411 1040 l 518 1040 b 539 1011 533 1040 539 1026 l 538 846 l 694 899 b 710 901 700 900 704 901 b 728 888 718 901 725 897 l 756 800 b 757 792 757 797 757 794 "},"+":{"ha":896,"x_min":0,"x_max":0,"o":"m 904 481 b 876 458 904 465 892 458 l 640 458 l 640 224 b 618 196 640 208 633 196 l 493 196 b 471 224 478 196 471 208 l 471 458 l 236 458 b 208 481 221 458 208 465 l 208 606 b 236 628 208 621 221 628 l 471 628 l 471 864 b 493 892 471 879 478 892 l 618 892 b 640 864 633 892 640 879 l 640 628 l 876 628 b 904 606 892 628 904 621 l 904 481 "},",":{"ha":381,"x_min":0,"x_max":0,"o":"m 358 215 b 354 203 358 211 357 207 l 165 -108 b 135 -136 156 -124 150 -136 l 13 -136 b -8 -118 0 -136 -8 -129 b -6 -108 -8 -115 -7 -111 l 139 203 b 171 229 147 219 156 229 l 340 229 b 358 215 351 229 358 224 "},"-":{"ha":419,"x_min":0,"x_max":0,"o":"m 456 474 l 438 371 b 406 346 435 356 421 346 l 136 346 b 113 367 122 346 113 354 l 113 371 l 131 474 b 163 500 133 489 147 500 l 432 500 b 456 478 446 500 456 492 "},".":{"ha":381,"x_min":0,"x_max":0,"o":"m 336 203 l 306 28 b 272 0 303 13 288 0 l 110 0 b 86 24 96 0 86 10 l 86 28 l 117 203 b 150 229 119 218 135 229 l 313 229 b 336 207 326 229 336 221 "},"/":{"ha":563,"x_min":0,"x_max":0,"o":"m 721 1014 b 718 1004 721 1011 719 1007 l 254 29 b 221 0 247 14 236 0 l 44 0 b 22 19 32 0 22 8 b 25 29 22 22 24 26 l 490 1004 b 524 1032 497 1019 508 1032 l 700 1032 b 721 1014 711 1032 721 1025 "},":":{"ha":382,"x_min":0,"x_max":0,"o":"m 429 733 l 399 558 b 367 532 396 543 382 532 l 204 532 b 179 554 190 532 179 542 l 179 558 l 210 733 b 244 761 213 749 229 761 l 407 761 b 429 739 421 761 429 751 m 336 203 l 306 28 b 272 0 303 13 288 0 l 110 0 b 86 24 96 0 86 10 l 86 28 l 117 203 b 150 229 119 218 135 229 l 313 229 b 336 207 326 229 336 221 "},";":{"ha":382,"x_min":0,"x_max":0,"o":"m 429 733 l 399 558 b 365 532 396 543 381 532 l 203 532 b 179 554 189 532 179 540 l 179 558 l 210 733 b 243 761 213 749 228 761 l 406 761 b 429 738 419 761 429 751 m 336 213 b 332 200 336 210 335 206 l 146 -111 b 113 -139 136 -126 128 -139 l -10 -139 b -29 -122 -21 -139 -29 -132 b -26 -111 -29 -118 -28 -115 l 117 200 b 150 226 124 217 135 226 l 319 226 b 336 213 331 226 336 221 "},"<":{"ha":896,"x_min":0,"x_max":0,"o":"m 817 208 b 800 190 817 199 810 190 l 607 190 b 574 206 592 190 583 197 l 250 493 b 222 543 231 510 222 524 b 250 593 222 563 231 576 l 574 881 b 607 896 583 889 592 896 l 800 896 b 817 878 810 896 817 888 b 808 861 817 872 814 867 l 449 543 l 808 225 b 817 208 814 219 817 214 "},"=":{"ha":896,"x_min":0,"x_max":0,"o":"m 861 658 b 833 636 861 643 849 636 l 251 636 b 224 658 236 636 224 643 l 224 783 b 251 806 224 799 236 806 l 833 806 b 861 783 849 806 861 799 l 861 658 m 861 303 b 833 281 861 288 849 281 l 251 281 b 224 303 236 281 224 288 l 224 428 b 251 450 224 443 236 450 l 833 450 b 861 428 849 450 861 443 l 861 303 "},">":{"ha":896,"x_min":0,"x_max":0,"o":"m 867 543 b 838 493 867 524 857 510 l 515 206 b 482 190 506 197 497 190 l 289 190 b 272 208 279 190 272 199 b 281 225 272 214 275 219 l 640 543 l 281 861 b 272 878 275 867 272 872 b 289 896 272 888 279 896 l 482 896 b 515 881 497 896 506 889 l 838 593 b 867 543 857 576 867 563 "},"?":{"ha":665,"x_min":0,"x_max":0,"o":"m 749 872 b 599 585 749 751 679 668 l 521 504 b 418 381 443 424 424 410 l 411 342 b 374 315 408 325 389 315 l 235 315 b 214 338 221 315 214 326 l 214 343 l 219 381 b 308 567 231 453 243 497 l 390 654 b 483 817 435 701 483 746 b 425 857 483 842 472 857 b 224 842 353 857 292 850 l 219 842 b 200 861 206 842 200 850 b 201 871 200 864 201 868 l 222 994 b 254 1031 225 1014 232 1025 b 482 1060 317 1049 404 1060 b 749 872 635 1060 749 999 m 400 201 l 368 26 b 336 0 365 11 351 0 l 172 0 b 149 22 158 0 149 8 l 149 26 l 181 201 b 213 229 183 217 197 229 l 376 229 b 400 206 390 229 400 219 "},"@":{"ha":1075,"x_min":0,"x_max":0,"o":"m 1085 546 b 521 64 1085 185 846 64 b 299 242 389 64 299 129 b 304 290 299 258 301 274 l 335 451 b 633 683 369 635 472 683 b 817 663 693 683 760 675 b 846 631 836 658 846 646 b 844 619 846 626 846 624 l 763 204 b 972 547 919 231 972 410 b 672 819 972 700 886 819 b 235 478 429 819 281 704 l 190 256 b 179 167 185 225 179 199 b 499 -67 179 10 288 -67 b 704 -56 582 -67 656 -56 l 706 -56 l 707 -56 l 711 -56 b 721 -64 718 -56 721 -57 l 721 -68 l 721 -69 l 715 -124 b 696 -142 714 -133 707 -140 b 489 -156 649 -147 575 -156 b 67 167 236 -156 67 -42 b 76 256 67 196 71 226 l 122 485 b 683 918 181 778 378 918 b 1085 546 950 918 1085 739 m 672 544 b 601 551 649 549 624 551 b 492 446 535 551 508 525 l 460 292 b 456 251 457 281 456 263 b 544 196 456 207 482 196 b 603 197 565 196 585 196 l 672 544 "},"A":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 "},"B":{"ha":929,"x_min":0,"x_max":0,"o":"m 996 807 b 835 525 996 692 946 575 b 926 357 896 489 926 421 b 429 -12 926 67 671 -12 b 175 4 338 -12 228 -6 b 111 64 131 13 111 25 b 114 94 111 72 113 83 l 263 939 b 353 1029 274 1001 297 1021 b 607 1044 401 1036 518 1044 b 996 807 836 1044 996 978 m 763 768 b 588 850 763 829 713 850 b 482 849 565 850 501 850 l 439 608 l 594 608 b 763 768 700 608 763 660 m 694 347 b 565 443 694 401 661 443 l 410 443 l 364 183 b 478 182 386 183 458 182 b 694 347 593 182 694 210 "},"C":{"ha":779,"x_min":0,"x_max":0,"o":"m 897 990 l 874 856 b 840 828 871 839 858 828 l 839 828 l 838 828 b 635 839 786 832 711 839 b 421 604 539 839 454 789 l 389 429 b 381 344 383 397 381 369 b 521 194 381 229 442 194 b 728 206 597 194 674 201 l 732 206 b 756 185 746 206 756 199 b 754 178 756 183 754 181 l 729 43 b 693 11 725 24 714 17 b 482 -12 663 1 579 -12 b 139 326 300 -12 139 99 b 149 429 139 358 142 393 l 181 604 b 669 1044 247 969 447 1044 b 872 1021 767 1044 844 1031 b 897 997 889 1015 897 1011 l 897 993 "},"D":{"ha":947,"x_min":0,"x_max":0,"o":"m 993 706 b 983 606 993 674 990 640 l 951 426 b 431 -12 896 113 739 -12 b 139 8 315 -12 194 -1 b 106 43 118 13 106 21 b 107 57 106 47 106 51 l 269 975 b 318 1024 275 1007 290 1019 b 618 1044 376 1033 503 1044 b 993 706 849 1044 993 921 m 754 688 b 582 843 754 808 686 843 b 483 840 547 843 503 842 l 368 192 b 467 189 388 190 432 189 b 714 426 600 189 681 239 l 746 606 b 754 688 751 636 754 664 "},"E":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1007 b 904 999 906 1004 904 1001 l 881 869 b 849 842 878 854 864 842 l 567 842 b 461 749 510 842 475 831 l 439 621 l 799 621 b 821 597 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 379 286 b 375 250 376 272 375 260 b 451 192 375 206 399 192 l 733 192 b 757 168 747 192 757 182 l 757 164 l 733 35 b 701 6 731 17 721 8 b 432 -12 651 -1 582 -12 b 136 218 288 -12 136 39 b 143 286 136 239 139 263 l 225 747 b 617 1044 272 1017 426 1044 b 881 1026 767 1044 833 1033 b 906 1007 897 1024 906 1019 "},"F":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1004 b 904 997 906 1003 904 1000 l 881 868 b 849 840 878 853 864 840 l 567 840 b 461 746 501 840 474 818 l 439 621 l 799 621 b 821 599 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 335 28 b 301 0 332 13 317 0 l 121 0 b 99 22 107 0 99 10 l 99 28 l 225 746 b 615 1044 271 1008 424 1044 b 881 1025 765 1044 833 1032 b 906 1004 897 1022 906 1017 "},"G":{"ha":896,"x_min":0,"x_max":0,"o":"m 981 992 l 954 844 b 931 826 951 829 943 826 l 926 826 b 639 838 860 829 757 838 b 415 601 526 838 449 793 l 385 428 b 375 336 379 393 375 363 b 499 192 375 221 432 192 b 607 196 538 192 574 193 l 663 515 b 694 543 665 531 679 543 l 872 543 b 894 521 886 543 894 533 l 894 515 l 813 49 b 779 17 810 29 801 21 b 463 -12 701 1 601 -12 b 135 325 321 -12 135 75 b 144 429 135 357 138 392 l 175 601 b 676 1044 243 985 450 1044 b 961 1013 815 1044 911 1024 b 981 996 971 1010 981 1006 "},"H":{"ha":1013,"x_min":0,"x_max":0,"o":"m 1093 1006 l 921 28 b 888 0 918 13 903 0 l 706 0 b 683 22 692 0 683 10 l 683 28 l 753 429 l 410 429 l 340 28 b 307 0 338 13 322 0 l 125 0 b 103 22 111 0 103 10 l 103 28 l 275 1006 b 307 1032 278 1021 292 1032 l 489 1032 b 513 1010 503 1032 513 1024 l 513 1006 l 447 636 l 790 636 l 856 1006 b 888 1032 858 1021 872 1032 l 1069 1032 b 1093 1010 1083 1032 1093 1024 "},"I":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 340 28 b 308 0 338 13 324 0 l 122 0 b 103 21 110 0 103 10 l 103 28 l 275 1006 b 304 1032 278 1021 289 1032 l 490 1032 b 513 1011 504 1032 513 1024 "},"J":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 333 -8 b 42 -249 300 -197 182 -249 b -46 -243 10 -249 -10 -247 b -62 -224 -56 -242 -62 -235 l -62 -219 l -37 -78 b -18 -58 -36 -68 -28 -58 l 51 -58 b 96 -8 83 -58 90 -43 l 275 1006 b 307 1032 278 1021 292 1032 l 489 1032 b 513 1010 503 1032 513 1022 "},"K":{"ha":942,"x_min":0,"x_max":0,"o":"m 1086 1018 b 1075 997 1086 1013 1082 1006 l 646 528 l 890 29 b 893 17 893 25 893 21 b 871 0 893 7 885 0 l 647 0 b 619 19 631 0 625 8 l 419 478 l 340 28 b 307 0 338 13 322 0 l 125 0 b 103 22 111 0 103 10 l 103 28 l 275 1006 b 307 1032 278 1021 292 1032 l 489 1032 b 513 1010 503 1032 513 1024 l 513 1006 l 438 585 l 804 1015 b 838 1032 814 1026 822 1032 l 1065 1032 b 1086 1018 1079 1032 1086 1026 "},"L":{"ha":721,"x_min":0,"x_max":0,"o":"m 719 164 l 696 35 b 664 6 693 17 685 10 b 433 -12 617 -4 507 -12 b 140 217 281 -12 140 42 b 147 286 140 238 143 261 l 274 1004 b 307 1032 276 1019 292 1032 l 489 1032 b 511 1010 503 1032 511 1022 l 511 1004 l 385 286 b 381 250 382 272 381 260 b 457 192 381 206 404 192 l 696 192 b 719 168 710 192 719 182 "},"M":{"ha":1133,"x_min":0,"x_max":0,"o":"m 1211 993 b 1210 983 1211 990 1210 988 l 1039 19 b 1013 0 1036 4 1024 0 l 829 0 b 813 22 818 0 813 10 l 813 28 l 914 607 l 914 611 b 908 618 914 617 911 618 b 896 608 904 618 901 615 l 731 379 b 685 356 718 363 703 356 l 574 356 b 536 379 556 356 543 363 l 451 608 b 442 618 449 615 446 618 b 433 607 439 618 435 617 l 332 28 b 304 0 329 13 317 0 l 121 0 b 100 15 111 0 100 4 l 100 19 l 271 985 b 329 1032 276 1014 300 1032 l 450 1032 b 504 994 479 1032 496 1017 l 647 599 b 660 581 651 588 654 581 b 678 599 665 581 669 588 l 960 994 b 1028 1032 976 1018 999 1032 l 1168 1032 b 1211 993 1194 1032 1211 1017 "},"N":{"ha":1013,"x_min":0,"x_max":0,"o":"m 1093 1006 l 925 53 b 864 0 919 24 893 0 l 747 0 b 671 43 718 0 686 6 l 440 590 b 429 601 436 599 433 601 b 421 590 425 601 422 599 l 322 28 b 289 0 319 13 304 0 l 125 0 b 103 24 111 0 103 10 l 103 28 l 269 979 b 332 1032 275 1008 303 1032 l 438 1032 b 513 989 465 1032 499 1024 l 751 417 b 760 406 756 408 756 406 b 769 418 763 406 768 408 l 874 1006 b 906 1032 876 1021 890 1032 l 1069 1032 b 1093 1010 1083 1032 1093 1022 "},"O":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 "},"P":{"ha":906,"x_min":0,"x_max":0,"o":"m 986 763 b 983 710 986 746 985 728 l 982 697 b 508 361 953 435 749 361 b 396 365 475 361 431 364 l 338 28 b 304 0 335 13 319 0 l 125 0 b 101 22 111 0 101 8 l 101 26 l 267 960 b 340 1026 275 1007 296 1019 b 626 1044 413 1038 526 1044 b 986 763 838 1044 986 961 m 749 736 b 594 847 749 815 700 847 b 481 843 575 847 497 844 l 431 560 b 543 557 446 558 528 557 b 746 697 667 557 735 601 l 747 710 b 749 736 749 719 749 728 "},"Q":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 594 -4 924 158 793 29 l 590 -29 l 590 -33 l 590 -40 b 619 -64 590 -61 601 -64 l 744 -64 b 774 -82 757 -64 774 -68 l 774 -86 l 754 -200 b 717 -231 751 -214 738 -225 b 558 -249 676 -240 613 -249 b 363 -82 446 -249 363 -206 b 367 -31 363 -67 364 -49 l 372 1 b 140 328 236 38 140 146 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 "},"R":{"ha":944,"x_min":0,"x_max":0,"o":"m 990 779 b 756 424 990 614 918 479 l 896 32 b 899 21 897 28 899 25 b 874 0 899 10 890 0 l 672 0 b 650 28 657 0 656 14 l 525 379 l 524 379 b 499 378 518 379 510 378 b 400 381 469 378 426 381 l 339 28 b 306 0 336 13 321 0 l 125 0 b 103 22 111 0 103 10 l 103 26 l 103 28 l 267 960 b 340 1026 275 1007 296 1019 b 626 1044 407 1038 526 1044 b 990 779 835 1044 990 967 m 753 749 b 590 843 753 821 699 843 b 482 839 571 843 499 840 l 435 572 b 532 569 450 571 517 569 b 753 749 668 569 753 603 "},"S":{"ha":817,"x_min":0,"x_max":0,"o":"m 904 989 l 879 849 b 851 825 876 833 867 825 l 849 825 b 557 840 810 828 651 840 b 433 751 490 840 433 829 b 504 671 433 722 447 708 l 665 565 b 814 343 769 497 814 424 b 382 -12 814 89 615 -12 b 119 18 272 -12 188 0 b 97 42 107 21 97 29 l 97 46 l 121 182 b 150 208 124 199 135 208 l 154 208 b 415 192 210 203 361 192 b 558 306 493 192 558 217 b 486 403 558 336 542 367 l 315 515 b 190 731 228 572 190 653 b 599 1044 190 974 389 1044 b 888 1014 700 1044 838 1028 b 904 994 899 1011 904 1004 "},"T":{"ha":815,"x_min":0,"x_max":0,"o":"m 958 1006 l 933 863 b 899 836 931 847 914 836 l 674 836 l 532 28 b 499 0 529 13 514 0 l 317 0 b 294 22 303 0 294 10 l 294 28 l 436 836 l 210 836 b 188 857 196 836 188 844 l 188 863 l 213 1006 b 244 1032 215 1021 229 1032 l 933 1032 b 958 1010 947 1032 958 1022 "},"U":{"ha":988,"x_min":0,"x_max":0,"o":"m 1072 1006 l 963 388 b 490 -12 900 39 711 -12 b 153 289 296 -12 153 78 b 161 388 153 319 154 351 l 271 1006 b 303 1032 274 1021 288 1032 l 485 1032 b 508 1010 499 1032 508 1022 l 508 1006 l 399 388 b 390 306 393 357 390 329 b 526 186 390 222 429 186 b 725 388 651 186 700 246 l 835 1006 b 867 1032 838 1021 851 1032 l 1047 1032 b 1072 1010 1061 1032 1072 1024 "},"V":{"ha":953,"x_min":0,"x_max":0,"o":"m 1092 1015 b 1089 1003 1092 1011 1090 1007 l 731 142 b 474 -12 675 8 569 -12 b 271 142 378 -12 279 8 l 215 1003 l 215 1004 b 244 1032 215 1021 228 1032 l 431 1032 b 454 1007 444 1032 454 1021 l 486 206 b 501 185 486 190 489 185 b 525 206 514 185 519 190 l 840 1007 b 871 1032 846 1021 857 1032 l 1072 1032 b 1092 1015 1085 1032 1092 1025 "},"W":{"ha":1235,"x_min":0,"x_max":0,"o":"m 1390 1018 b 1389 1011 1390 1017 1390 1014 l 1100 101 b 953 -4 1075 21 1026 -4 l 883 -4 b 763 90 822 -4 768 21 l 726 506 b 717 517 725 517 724 517 b 703 506 710 517 707 517 l 519 90 b 375 -4 489 19 436 -4 l 304 -4 b 188 131 233 -4 188 54 l 188 138 l 218 1011 b 244 1032 218 1026 232 1032 l 428 1032 b 446 1008 439 1032 446 1022 l 446 1006 l 397 261 l 397 254 b 403 243 397 247 399 243 b 415 261 407 243 410 249 l 583 643 b 681 710 607 696 643 710 l 818 710 b 893 643 856 710 889 696 l 925 261 b 932 243 926 249 928 243 b 943 261 938 243 940 249 l 1158 1006 b 1185 1032 1163 1021 1174 1032 l 1371 1032 b 1390 1018 1381 1032 1390 1028 "},"X":{"ha":976,"x_min":0,"x_max":0,"o":"m 1086 1017 b 1082 1006 1086 1013 1085 1010 l 708 515 l 922 28 b 925 18 924 24 925 21 b 903 0 925 7 915 0 l 704 0 b 672 21 686 0 679 6 l 543 314 l 331 28 b 290 0 318 11 306 0 l 85 0 b 67 14 74 0 67 7 b 72 28 67 18 69 24 l 450 529 l 242 1006 b 240 1013 240 1008 240 1010 b 264 1032 240 1022 251 1032 l 465 1032 b 496 1006 481 1032 490 1018 l 618 725 l 824 1006 b 863 1032 833 1018 847 1032 l 1068 1032 b 1086 1017 1079 1032 1086 1025 "},"Y":{"ha":901,"x_min":0,"x_max":0,"o":"m 1049 1015 b 1044 1001 1049 1011 1047 1006 l 750 521 b 642 414 711 457 678 428 l 574 28 b 540 0 571 13 556 0 l 358 0 b 336 24 344 0 336 10 l 336 28 l 404 414 b 331 521 372 428 347 457 l 206 1001 b 204 1007 206 1003 204 1006 b 232 1032 204 1021 217 1032 l 426 1032 b 450 1008 440 1032 447 1021 l 531 617 b 549 596 535 599 539 596 b 572 617 558 596 563 599 l 792 1008 b 824 1032 799 1021 810 1032 l 1029 1032 b 1049 1015 1042 1032 1049 1025 "},"Z":{"ha":854,"x_min":0,"x_max":0,"o":"m 951 993 b 929 867 946 957 938 908 b 911 831 926 854 919 842 l 428 231 b 418 213 422 224 418 218 b 432 206 418 208 422 206 l 793 206 b 817 185 807 206 817 197 l 817 181 l 790 28 b 757 0 788 13 772 0 l 126 0 b 75 35 97 0 75 10 b 76 43 75 38 76 40 l 97 154 b 128 215 101 174 107 190 l 604 801 b 613 818 610 808 613 814 b 599 826 613 824 608 826 l 268 826 b 244 849 254 826 244 835 l 244 853 l 272 1006 b 304 1032 275 1021 289 1032 l 903 1032 b 951 1000 929 1032 951 1021 "},"[":{"ha":519,"x_min":0,"x_max":0,"o":"m 653 1004 l 632 883 b 600 856 629 868 615 856 l 467 856 l 299 -93 l 433 -93 b 457 -117 447 -93 457 -103 l 457 -121 l 435 -242 b 403 -269 432 -257 418 -269 l 64 -269 b 44 -249 51 -269 44 -260 l 44 -243 l 265 1006 b 293 1032 268 1019 279 1032 l 631 1032 b 653 1010 644 1032 653 1022 "},"\\":{"ha":563,"x_min":0,"x_max":0,"o":"m 547 19 b 517 -7 547 6 531 -7 l 340 -7 b 319 22 325 -7 321 7 l 196 1004 l 196 1007 b 226 1032 196 1021 213 1032 l 401 1032 b 425 1004 417 1032 424 1019 l 547 22 l 547 19 "},"]":{"ha":519,"x_min":0,"x_max":0,"o":"m 610 1006 l 389 -243 b 361 -269 386 -257 375 -269 l 22 -269 b -1 -246 8 -269 -1 -260 l -1 -242 l 21 -121 b 53 -93 24 -106 38 -93 l 188 -93 l 356 856 l 222 856 b 199 879 208 856 199 865 l 199 883 l 219 1004 b 253 1032 222 1019 238 1032 l 590 1032 b 610 1011 603 1032 610 1022 "},"a":{"ha":807,"x_min":0,"x_max":0,"o":"m 540 807 b 828 772 635 807 738 796 b 864 731 860 764 868 758 l 742 28 b 710 0 739 13 732 0 l 568 0 b 544 28 553 0 542 10 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 "},"b":{"ha":828,"x_min":0,"x_max":0,"o":"m 857 529 b 850 451 857 504 854 478 l 832 343 b 419 -12 790 96 649 -12 b 131 24 313 -12 207 4 b 94 64 97 32 90 42 l 267 1038 b 300 1065 269 1053 279 1065 l 468 1065 b 492 1038 483 1065 496 1057 l 449 797 b 564 807 490 803 536 807 b 857 529 757 807 857 694 m 632 519 b 532 621 632 583 607 621 b 417 614 499 621 451 618 l 340 181 b 453 172 365 176 407 172 b 607 343 551 172 589 231 l 625 451 b 632 519 629 476 632 499 "},"c":{"ha":658,"x_min":0,"x_max":0,"o":"m 528 807 b 710 786 611 807 672 796 b 733 754 735 779 736 772 l 711 631 b 678 607 708 615 706 604 b 510 617 625 613 589 617 b 368 456 442 617 392 585 l 347 339 b 340 272 343 313 340 290 b 433 178 340 197 375 178 b 604 188 513 178 551 182 b 629 164 625 190 632 179 l 607 40 b 572 8 603 19 594 14 b 388 -12 532 -1 471 -12 b 114 257 225 -12 114 85 b 122 339 114 283 117 310 l 143 456 b 528 807 189 715 326 807 "},"d":{"ha":828,"x_min":0,"x_max":0,"o":"m 903 1065 b 928 1038 922 1065 932 1058 l 756 64 b 706 24 751 42 744 32 b 404 -12 622 4 511 -12 b 114 271 218 -12 114 106 b 119 343 114 294 115 318 l 138 451 b 549 807 181 707 307 807 b 661 797 576 807 622 803 l 704 1038 b 736 1065 707 1053 717 1065 m 629 614 b 517 621 597 618 550 621 b 361 451 415 621 381 565 l 343 343 b 336 269 339 315 336 290 b 438 172 336 206 361 172 b 553 181 483 172 525 176 l 629 614 "},"e":{"ha":819,"x_min":0,"x_max":0,"o":"m 842 517 b 835 442 842 493 839 467 l 821 361 b 786 328 817 340 804 328 l 340 328 b 335 271 338 307 335 288 b 458 174 335 199 369 174 b 728 186 546 174 671 182 b 754 164 750 188 757 183 l 735 58 b 700 21 731 36 725 26 b 408 -12 607 -1 529 -12 b 117 267 258 -12 117 74 b 124 344 117 290 119 317 l 140 442 b 556 807 182 683 328 807 b 842 517 743 807 842 679 m 632 528 b 524 626 632 592 601 626 b 364 467 429 626 385 563 l 625 467 b 632 528 629 489 632 510 "},"f":{"ha":547,"x_min":0,"x_max":0,"o":"m 596 918 b 532 846 553 918 542 907 l 524 796 l 642 796 b 665 767 667 796 668 782 l 646 656 b 613 628 642 633 635 628 l 494 628 l 382 -1 b 92 -240 344 -214 240 -240 b -6 -228 57 -240 25 -233 b -28 -207 -17 -225 -28 -219 l -28 -204 l -10 -99 b 18 -74 -7 -82 6 -74 l 74 -74 b 157 -1 135 -74 146 -67 l 268 628 l 163 644 b 140 681 142 647 138 661 l 156 767 b 189 796 160 789 168 796 l 297 796 l 306 846 b 596 1085 340 1054 442 1085 b 694 1072 631 1085 664 1078 b 717 1047 707 1069 719 1061 l 699 944 b 668 918 696 928 690 918 l 596 918 "},"g":{"ha":796,"x_min":0,"x_max":0,"o":"m 861 743 b 860 733 861 740 860 738 l 731 -3 b 344 -281 696 -203 574 -281 b 86 -243 225 -281 133 -260 b 64 -218 71 -237 64 -231 b 65 -207 64 -214 65 -211 l 82 -114 b 111 -89 85 -99 96 -89 l 114 -89 b 376 -106 175 -94 310 -106 b 510 -3 472 -106 494 -83 l 513 13 b 400 0 474 4 436 0 b 100 276 232 0 100 90 b 107 357 100 301 101 328 l 124 451 b 535 807 169 710 290 807 b 824 772 661 807 771 786 b 861 743 851 765 861 757 m 618 611 b 503 621 593 615 556 621 b 347 451 404 621 365 550 l 331 357 b 324 289 326 331 324 308 b 435 183 324 204 368 183 b 544 193 467 183 504 188 l 618 611 "},"h":{"ha":850,"x_min":0,"x_max":0,"o":"m 863 575 b 857 514 863 556 861 535 l 772 28 b 739 0 769 13 754 0 l 569 0 b 547 22 556 0 547 10 l 547 28 l 632 513 b 636 551 635 528 636 540 b 531 624 636 606 606 624 b 417 613 489 624 447 619 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 25 99 0 89 11 l 89 29 l 267 1038 b 299 1065 269 1053 283 1065 l 468 1065 b 492 1042 482 1065 492 1056 l 492 1038 l 447 789 b 596 807 486 797 542 807 b 863 575 776 807 863 710 "},"i":{"ha":403,"x_min":0,"x_max":0,"o":"m 267 886 b 244 914 250 886 242 897 l 267 1043 b 300 1071 269 1058 278 1071 l 481 1071 b 503 1043 497 1071 507 1064 l 481 914 b 447 886 478 899 469 886 l 267 886 m 426 796 b 450 768 442 796 453 788 l 319 28 b 286 0 317 13 310 0 l 117 0 b 94 28 100 0 92 11 l 225 768 b 257 796 228 783 242 796 l 426 796 "},"j":{"ha":403,"x_min":0,"x_max":0,"o":"m 267 886 b 244 914 250 886 242 900 l 267 1043 b 300 1071 269 1058 279 1071 l 479 1071 b 503 1043 494 1071 506 1065 l 481 914 b 446 886 478 899 469 886 l 267 886 m 26 -110 b 81 -44 65 -110 72 -92 l 224 767 b 256 796 226 782 235 796 l 428 796 b 449 767 450 796 451 781 l 306 -44 b 44 -282 272 -233 200 -282 b -65 -272 8 -282 -26 -279 b -87 -244 -83 -269 -90 -260 l -68 -135 b -35 -110 -65 -119 -53 -110 l 26 -110 "},"k":{"ha":817,"x_min":0,"x_max":0,"o":"m 914 783 b 906 767 914 778 911 772 l 572 415 l 768 29 b 750 0 774 18 771 0 l 546 0 b 511 29 531 0 518 13 l 369 346 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 29 97 0 86 10 l 267 1038 b 300 1065 269 1053 279 1065 l 468 1065 b 492 1038 490 1065 494 1053 l 392 475 l 646 775 b 686 796 660 792 675 796 l 896 796 b 914 783 907 796 914 790 "},"l":{"ha":392,"x_min":0,"x_max":0,"o":"m 492 1038 l 314 29 b 282 0 311 14 297 0 l 113 0 b 89 25 99 0 89 11 l 89 29 l 267 1038 b 300 1065 269 1053 285 1065 l 469 1065 b 492 1043 483 1065 492 1056 "},"m":{"ha":1215,"x_min":0,"x_max":0,"o":"m 1229 588 b 1221 503 1229 560 1226 531 l 1138 29 b 1103 0 1135 14 1118 0 l 935 0 b 913 24 921 0 913 11 l 913 29 l 996 503 b 1003 563 1000 526 1003 546 b 931 618 1003 601 986 618 b 818 596 908 618 861 614 b 808 503 818 565 814 533 l 725 29 b 692 0 722 14 707 0 l 524 0 b 500 25 510 0 500 11 l 500 29 l 583 503 b 592 568 588 528 592 550 b 536 618 592 600 581 618 b 410 576 501 618 454 599 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 25 99 0 89 11 l 89 29 l 219 768 b 251 796 222 783 236 796 l 403 796 b 426 772 417 796 426 786 l 426 768 l 421 736 b 617 807 476 772 540 807 b 778 744 697 807 747 782 b 1024 807 860 792 929 807 b 1229 588 1178 807 1229 706 "},"n":{"ha":850,"x_min":0,"x_max":0,"o":"m 861 576 b 853 492 861 550 858 522 l 772 29 b 738 0 769 14 753 0 l 569 0 b 547 24 556 0 547 11 l 547 29 l 628 492 b 635 553 632 515 635 536 b 560 621 635 604 601 621 b 410 576 507 621 440 594 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 25 99 0 89 11 l 89 29 l 219 768 b 251 796 222 783 236 796 l 403 796 b 426 772 417 796 426 786 l 426 768 l 421 735 b 638 807 483 782 564 807 b 861 576 757 807 861 740 "},"o":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 "},"p":{"ha":828,"x_min":0,"x_max":0,"o":"m 857 526 b 850 451 857 503 854 478 l 832 343 b 432 -12 789 85 643 -12 b 308 -3 393 -12 351 -8 l 265 -243 b 233 -271 263 -258 249 -271 l 65 -271 b 40 -247 51 -271 40 -261 l 40 -243 l 213 731 b 263 771 217 753 224 763 b 564 807 346 790 457 807 b 857 526 750 807 857 694 m 632 524 b 532 621 632 588 607 621 b 417 614 486 621 444 618 l 340 181 b 444 172 379 175 414 172 b 607 343 532 172 583 206 l 625 451 b 632 524 629 479 632 503 "},"q":{"ha":828,"x_min":0,"x_max":0,"o":"m 875 742 b 874 731 875 739 875 735 l 701 -243 b 668 -271 699 -258 683 -271 l 501 -271 b 478 -247 488 -271 478 -261 l 478 -243 l 521 -3 b 414 -12 485 -10 449 -12 b 113 261 249 -12 113 67 b 119 343 113 286 114 314 l 138 451 b 549 807 178 696 308 807 b 838 771 656 807 761 790 b 875 742 867 764 875 756 m 629 614 b 517 621 604 618 563 621 b 361 451 418 621 381 565 l 343 343 b 336 276 339 317 336 296 b 444 172 336 192 376 172 b 553 181 476 172 513 176 l 629 614 "},"r":{"ha":550,"x_min":0,"x_max":0,"o":"m 657 779 l 633 647 b 608 621 631 635 621 621 l 597 621 b 410 572 529 621 465 600 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 24 99 0 89 11 l 89 29 l 219 768 b 251 796 222 783 236 796 l 417 796 b 440 774 431 796 440 786 l 440 768 l 435 740 b 633 807 503 797 560 807 b 657 783 647 807 657 797 "},"s":{"ha":699,"x_min":0,"x_max":0,"o":"m 747 743 l 728 631 b 700 604 725 615 715 604 l 696 604 b 468 622 657 610 539 622 l 463 622 b 386 574 426 622 386 621 b 419 531 386 557 397 544 l 574 432 b 683 260 660 376 683 314 b 340 -12 683 58 519 -12 b 93 18 264 -12 161 -1 b 72 43 79 22 72 31 l 72 50 l 93 163 b 125 189 96 179 108 189 l 129 189 b 363 169 203 179 301 169 b 454 232 410 169 454 174 b 413 288 454 250 443 268 l 250 392 b 160 557 188 432 160 496 b 485 807 160 751 318 807 b 726 775 582 807 658 793 b 747 750 740 771 747 763 "},"t":{"ha":585,"x_min":0,"x_max":0,"o":"m 676 768 l 656 656 b 624 628 653 640 639 628 l 510 628 l 438 224 b 433 185 435 207 433 194 b 472 158 433 164 443 158 l 540 158 b 565 139 554 158 565 153 l 565 135 l 546 26 b 515 -1 543 13 533 1 b 403 -12 472 -8 443 -12 b 206 154 276 -12 206 33 b 213 225 206 175 208 199 l 283 628 l 175 646 b 151 671 161 649 151 657 l 151 675 l 167 767 b 201 796 169 782 186 796 l 313 796 l 332 910 b 365 938 335 925 349 935 l 540 967 l 544 967 b 565 947 557 967 565 960 l 565 943 l 539 796 l 653 796 b 676 772 667 796 676 786 "},"u":{"ha":850,"x_min":0,"x_max":0,"o":"m 901 767 l 771 28 b 739 0 768 13 754 0 l 583 0 b 560 22 569 0 560 10 l 560 28 l 567 61 b 346 -12 501 18 442 -12 b 129 219 208 -12 129 74 b 138 304 129 246 132 274 l 218 767 b 253 796 221 782 238 796 l 421 796 b 443 772 435 796 443 785 l 443 767 l 363 304 b 356 240 358 281 356 257 b 442 174 356 193 376 174 b 581 219 469 174 538 194 l 676 767 b 710 796 679 782 694 796 l 878 796 b 901 771 892 796 901 785 "},"v":{"ha":813,"x_min":0,"x_max":0,"o":"m 919 776 b 917 764 919 772 918 768 l 631 133 b 403 -12 575 10 485 -12 b 229 133 321 -12 242 10 l 167 764 l 167 767 b 193 796 167 783 179 796 l 369 796 b 393 767 383 796 392 783 l 417 222 b 433 193 418 201 424 193 b 460 222 443 193 451 201 l 675 767 b 710 796 682 783 696 796 l 900 796 b 919 776 911 796 919 788 "},"w":{"ha":1174,"x_min":0,"x_max":0,"o":"m 1269 778 b 1268 767 1269 774 1269 771 l 1026 97 b 888 0 997 18 946 0 l 803 0 b 701 89 736 0 706 36 l 672 451 b 667 458 672 458 671 458 b 658 451 663 458 661 458 l 501 89 b 369 0 479 36 436 0 l 285 0 b 179 97 226 0 179 18 l 174 767 b 200 796 174 782 185 796 l 363 796 b 388 774 379 796 388 793 l 388 772 l 378 242 l 378 240 b 383 224 378 229 381 224 b 397 242 388 224 392 229 l 558 611 b 647 674 579 660 603 674 l 761 674 b 828 611 806 674 824 660 l 856 244 b 863 226 857 232 860 226 b 875 244 867 226 871 233 l 1050 772 b 1083 796 1057 793 1067 796 l 1253 796 b 1269 778 1264 796 1269 788 "},"x":{"ha":857,"x_min":0,"x_max":0,"o":"m 919 782 b 914 767 919 776 918 771 l 621 403 l 807 29 b 808 21 808 26 808 24 b 790 0 808 10 801 0 l 592 0 b 563 29 576 0 572 8 l 463 244 l 296 28 b 254 0 279 7 269 0 l 68 0 b 56 13 60 0 56 6 b 61 28 56 18 57 22 l 372 414 l 197 767 b 194 776 196 769 194 772 b 213 796 194 786 201 796 l 411 796 b 440 767 426 796 432 785 l 531 575 l 678 767 b 719 796 694 788 704 796 l 906 796 b 919 782 914 796 919 789 "},"y":{"ha":822,"x_min":0,"x_max":0,"o":"m 928 775 b 925 764 928 771 926 768 l 547 -54 b 208 -281 471 -218 413 -281 b 39 -258 157 -281 72 -269 b 14 -237 25 -254 14 -249 l 14 -233 l 35 -121 b 67 -94 38 -106 51 -94 l 69 -94 b 242 -106 114 -97 196 -106 b 346 -33 292 -106 321 -89 l 365 10 l 358 10 b 239 139 303 10 251 31 l 165 764 l 165 768 b 197 796 165 785 175 796 l 379 796 b 401 769 393 796 400 783 l 433 239 b 447 221 435 222 439 221 l 458 221 l 685 769 b 718 796 690 783 703 796 l 906 796 b 928 775 918 796 928 786 "},"z":{"ha":715,"x_min":0,"x_max":0,"o":"m 786 761 b 785 749 786 757 786 753 l 767 646 b 743 597 764 632 758 615 l 397 204 b 392 194 393 200 392 196 b 400 189 392 190 394 189 l 664 189 b 685 171 676 189 685 182 l 685 167 l 661 28 b 628 0 658 13 643 0 l 107 0 b 67 33 85 0 67 7 b 68 46 67 38 67 42 l 83 135 b 113 188 88 160 96 168 l 475 599 b 481 610 479 603 481 607 b 472 615 481 614 478 615 l 204 615 b 185 633 192 615 185 622 l 185 638 l 208 768 b 240 796 211 783 225 796 l 747 796 b 786 761 769 796 786 786 "},"{":{"ha":565,"x_min":0,"x_max":0,"o":"m 699 1004 l 678 883 b 646 856 675 868 661 856 l 565 856 b 497 775 521 856 508 843 l 465 588 b 313 379 449 488 414 422 b 396 214 369 347 396 279 b 392 169 396 199 394 183 l 358 -12 b 353 -57 356 -31 353 -46 b 399 -93 353 -86 367 -93 l 479 -93 b 503 -117 493 -93 503 -103 l 503 -121 l 481 -242 b 449 -269 478 -257 464 -269 l 368 -269 b 125 -85 200 -269 125 -208 b 132 -12 125 -62 128 -39 l 165 169 b 168 204 168 182 168 193 b 111 313 168 251 149 286 l 133 444 b 238 588 190 478 226 521 l 269 775 b 596 1032 308 1000 382 1032 l 676 1032 b 699 1010 690 1032 699 1022 "},"|":{"ha":403,"x_min":0,"x_max":0,"o":"m 411 -240 b 383 -269 411 -256 399 -269 l 213 -269 b 183 -240 197 -269 183 -256 l 183 1004 b 213 1032 183 1019 197 1032 l 383 1032 b 411 1004 399 1032 411 1019 l 411 -240 "},"}":{"ha":565,"x_min":0,"x_max":0,"o":"m 565 313 b 461 169 508 279 476 253 l 428 -12 b 103 -269 389 -226 326 -269 l 22 -269 b -1 -246 8 -269 -1 -260 l -1 -242 l 21 -121 b 53 -93 24 -106 38 -93 l 133 -93 b 201 -12 178 -93 189 -81 l 235 169 b 386 379 253 265 285 339 b 304 544 335 415 304 474 b 308 588 304 558 306 572 l 340 775 b 346 822 343 794 346 811 b 303 856 346 850 335 856 l 222 856 b 199 879 208 856 199 865 l 199 883 l 219 1004 b 253 1032 222 1019 238 1032 l 333 1032 b 575 844 490 1032 575 978 b 568 775 575 824 572 800 l 536 588 b 531 540 533 569 531 554 b 588 444 531 501 546 475 "}," ":{"ha":347,"x_min":0,"x_max":0,"o":""},"¡":{"ha":379,"x_min":0,"x_max":0,"o":"m 435 774 b 433 768 435 771 435 769 l 403 593 b 371 567 400 578 386 567 l 207 567 b 185 588 194 567 185 575 l 185 593 l 215 768 b 247 796 218 783 232 796 l 411 796 b 435 774 425 796 435 786 m 357 451 l 263 -242 b 228 -269 261 -257 243 -269 l 54 -269 b 31 -247 42 -269 31 -260 l 31 -242 l 181 451 b 214 481 185 467 199 481 l 332 481 b 357 456 346 481 357 468 "},"¢":{"ha":896,"x_min":0,"x_max":0,"o":"m 836 764 b 835 754 836 761 835 757 l 813 631 b 782 607 810 617 796 607 l 779 607 b 611 617 729 613 690 617 b 469 456 539 617 492 579 l 449 339 b 442 274 444 314 442 292 b 535 178 442 200 476 178 b 706 188 614 178 653 183 l 708 188 b 731 168 721 188 731 181 l 731 164 l 708 40 b 674 8 704 19 696 14 b 561 -10 646 1 608 -6 l 543 -111 b 510 -139 540 -126 525 -139 l 369 -139 b 347 -117 356 -139 347 -129 l 347 -111 l 368 6 b 217 261 279 46 217 135 b 224 339 217 286 218 311 l 244 456 b 506 789 285 679 381 754 l 526 903 b 558 931 529 918 543 931 l 699 931 b 722 907 713 931 722 921 l 722 903 l 704 804 b 811 786 750 800 786 793 b 836 764 828 782 836 778 "},"£":{"ha":896,"x_min":0,"x_max":0,"o":"m 963 1000 b 961 990 963 997 961 994 l 936 853 b 910 828 933 835 922 828 l 906 828 b 679 844 849 835 753 844 b 533 732 576 844 550 821 l 513 618 l 747 618 b 771 596 761 618 771 610 l 771 592 l 747 457 b 717 431 744 442 732 431 l 481 431 l 456 292 b 410 186 447 246 429 213 l 790 186 b 813 167 804 186 813 178 l 813 161 l 789 26 b 757 0 786 11 772 0 l 143 0 b 121 25 128 0 121 13 b 122 33 121 28 122 31 l 140 131 b 158 164 143 147 151 156 b 226 292 182 189 218 244 l 251 431 l 182 431 b 160 451 168 431 160 439 l 160 457 l 183 592 b 215 618 186 607 200 618 l 283 618 l 304 731 b 715 1044 350 981 457 1044 b 939 1018 794 1044 897 1028 b 963 1000 957 1014 963 1008 "},"¤":{"ha":896,"x_min":0,"x_max":0,"o":"m 906 774 b 896 753 906 765 901 758 l 776 635 b 808 515 797 597 808 557 b 775 390 808 472 797 429 l 892 274 b 901 253 897 268 901 260 b 894 238 901 247 899 242 l 815 158 b 800 151 811 154 806 151 b 779 161 792 151 785 156 l 660 282 b 546 253 625 263 585 253 b 426 283 504 253 464 263 l 308 165 b 286 154 303 160 294 154 b 272 161 282 154 276 157 l 193 240 b 186 257 189 244 186 251 b 196 278 186 264 190 272 l 314 394 b 282 515 293 432 282 474 b 310 629 282 554 290 594 l 192 749 b 182 769 186 754 182 763 b 189 785 182 775 185 781 l 268 864 b 283 871 272 868 278 871 b 304 861 290 871 299 867 l 419 746 b 546 778 458 768 503 778 b 665 747 588 778 628 768 l 783 865 b 804 875 789 871 797 875 b 819 868 810 875 815 872 l 899 789 b 906 774 903 785 906 779 m 665 519 b 549 635 665 583 613 635 b 431 519 485 635 431 583 b 549 403 431 456 485 403 b 665 519 613 403 665 456 "},"¥":{"ha":896,"x_min":0,"x_max":0,"o":"m 1061 1017 b 1056 1001 1061 1013 1060 1007 l 847 690 l 968 690 b 990 669 982 690 990 682 l 990 664 l 972 561 b 942 535 969 546 957 535 l 744 535 l 658 407 l 653 392 l 915 392 b 939 371 929 392 939 383 l 939 367 l 919 263 b 889 238 917 247 904 238 l 625 238 l 589 28 b 556 0 586 13 571 0 l 371 0 b 350 22 357 0 350 10 l 350 28 l 386 238 l 124 238 b 100 258 110 238 100 246 l 100 263 l 119 367 b 151 392 122 382 136 392 l 414 392 l 415 407 l 375 535 l 176 535 b 153 557 163 535 153 543 l 153 561 l 171 664 b 204 690 174 679 189 690 l 326 690 l 226 1001 b 225 1010 225 1004 225 1007 b 250 1032 225 1024 236 1032 l 449 1032 b 471 1008 463 1032 468 1021 l 569 633 l 803 1008 b 833 1032 811 1021 819 1032 l 1043 1032 b 1061 1017 1054 1032 1061 1026 "},"¦":{"ha":403,"x_min":0,"x_max":0,"o":"m 406 504 b 378 475 406 489 393 475 l 207 475 b 178 504 192 475 178 489 l 178 983 b 207 1011 178 999 192 1011 l 378 1011 b 406 983 393 1011 406 999 l 406 504 m 406 -264 b 378 -293 406 -279 393 -293 l 207 -293 b 178 -264 192 -293 178 -279 l 178 215 b 207 243 178 231 192 243 l 378 243 b 406 215 393 243 406 231 l 406 -264 "},"§":{"ha":818,"x_min":0,"x_max":0,"o":"m 907 988 l 882 846 b 861 826 881 835 872 826 l 860 826 b 558 838 763 832 660 838 b 429 756 499 838 429 833 b 514 669 429 726 453 706 l 675 574 b 821 344 776 513 821 432 b 746 136 821 276 793 204 b 764 35 754 117 764 64 b 339 -300 764 -210 560 -300 b 67 -269 229 -300 135 -287 b 43 -246 54 -267 43 -258 l 43 -242 l 68 -101 b 100 -75 71 -86 86 -75 l 103 -75 b 363 -94 189 -83 275 -94 l 368 -94 b 517 15 443 -94 517 -75 b 435 106 517 47 493 71 l 268 207 b 128 450 167 269 128 356 b 213 657 128 517 161 610 b 190 764 193 692 190 725 b 586 1044 190 982 408 1044 b 885 1014 688 1044 835 1028 b 907 992 896 1011 907 1003 m 625 318 b 544 424 625 364 617 381 l 421 499 b 353 542 389 518 374 528 b 324 463 328 513 324 483 b 421 356 324 415 372 385 l 510 304 b 600 249 546 283 572 269 b 625 318 614 268 625 303 "},"¨":{"ha":615,"x_min":0,"x_max":0,"o":"m 738 1043 l 715 914 b 679 886 713 899 694 886 l 549 886 b 525 910 535 886 525 896 l 525 914 l 547 1043 b 582 1071 550 1058 567 1071 l 713 1071 b 738 1047 726 1071 738 1061 m 436 1043 l 414 914 b 379 886 411 899 394 886 l 249 886 b 224 910 235 886 224 896 l 224 914 l 246 1043 b 282 1071 249 1058 267 1071 l 413 1071 b 436 1047 426 1071 436 1061 "},"©":{"ha":1042,"x_min":0,"x_max":0,"o":"m 1083 519 b 619 58 1083 264 875 58 b 158 519 364 58 158 264 b 619 985 158 775 364 985 b 1083 519 875 985 1083 775 m 1011 519 b 619 913 1011 735 835 913 b 229 519 404 913 229 735 b 619 131 229 304 404 131 b 1011 519 835 131 1011 304 m 763 254 b 744 235 763 243 757 238 b 631 222 721 228 683 222 b 394 485 482 222 394 306 l 394 563 b 631 825 394 743 482 825 b 744 811 683 825 722 817 b 763 794 757 808 763 806 l 763 707 b 746 690 763 694 756 690 l 743 690 b 631 697 711 694 685 697 b 538 563 582 697 538 672 l 538 485 b 631 349 538 372 582 349 b 743 356 678 349 711 351 l 747 356 b 763 340 756 356 763 353 l 763 254 "},"ª":{"ha":496,"x_min":0,"x_max":0,"o":"m 600 900 b 596 858 600 888 599 874 l 547 583 b 532 561 546 572 542 564 b 350 539 472 546 410 539 b 167 669 226 539 167 592 b 414 840 167 825 288 840 l 444 840 l 449 858 b 453 886 451 869 453 878 b 401 921 453 913 438 921 b 258 914 354 921 306 917 l 257 914 b 244 929 249 914 244 921 l 244 933 l 257 1003 b 281 1024 258 1014 269 1021 b 422 1044 310 1032 369 1044 b 600 900 525 1044 600 1000 m 431 758 b 410 760 428 758 418 760 b 307 681 353 760 307 747 b 368 643 307 651 326 643 b 411 647 386 643 400 646 l 431 758 "},"«":{"ha":997,"x_min":0,"x_max":0,"o":"m 1082 694 b 1074 679 1082 689 1079 683 l 763 397 l 958 115 b 961 106 961 113 961 108 b 939 88 961 96 951 88 l 788 88 b 749 104 767 88 757 92 l 572 361 b 558 401 563 375 558 389 b 578 443 558 418 567 432 l 836 690 b 881 707 849 703 860 707 l 1065 707 b 1082 694 1076 707 1082 701 m 650 694 b 642 679 650 689 647 683 l 331 397 l 526 115 b 529 106 529 113 529 108 b 507 88 529 96 519 88 l 356 88 b 317 104 335 88 325 92 l 140 361 b 126 401 131 375 126 389 b 146 443 126 418 135 432 l 404 690 b 449 707 417 703 428 707 l 633 707 b 650 694 644 707 650 701 "},"¬":{"ha":896,"x_min":0,"x_max":0,"o":"m 861 275 b 835 247 861 260 850 247 l 717 247 b 692 275 701 247 692 260 l 692 638 l 251 638 b 224 660 236 638 224 644 l 224 783 b 251 806 224 799 236 806 l 835 806 b 861 783 850 806 861 797 l 861 275 "},"­":{"ha":419,"x_min":0,"x_max":0,"o":"m 456 474 l 438 371 b 406 346 435 356 421 346 l 136 346 b 113 367 122 346 113 354 l 113 371 l 131 474 b 163 500 133 489 147 500 l 432 500 b 456 478 446 500 456 492 "},"®":{"ha":831,"x_min":0,"x_max":0,"o":"m 924 672 b 535 285 924 458 749 285 b 147 672 321 285 147 458 b 535 1060 147 886 321 1060 b 924 672 749 1060 924 886 m 853 672 b 535 990 853 847 710 990 b 218 672 360 990 218 847 b 535 354 218 497 360 354 b 853 672 710 354 853 497 m 726 458 b 713 444 726 451 721 444 l 619 444 b 606 456 613 444 608 450 l 518 610 b 507 618 515 610 510 618 l 471 618 l 471 460 b 456 444 471 451 464 444 l 372 444 b 357 460 364 444 357 451 l 357 868 b 392 910 357 897 365 906 b 515 917 413 913 478 917 b 710 767 636 917 710 879 l 710 757 b 628 636 710 692 675 656 l 724 468 b 726 458 725 465 726 463 m 600 767 b 525 821 600 804 579 821 l 468 821 l 468 703 b 525 701 475 703 519 701 b 600 757 579 701 600 721 "},"¯":{"ha":615,"x_min":0,"x_max":0,"o":"m 743 1033 l 725 933 b 693 907 722 918 708 907 l 243 907 b 219 929 229 907 219 915 l 219 933 l 238 1033 b 271 1060 240 1049 256 1060 l 721 1060 b 743 1039 735 1060 743 1051 "},"°":{"ha":501,"x_min":0,"x_max":0,"o":"m 606 831 b 393 617 606 713 511 617 b 179 831 276 617 179 713 b 393 1044 179 949 276 1044 b 606 831 511 1044 606 949 m 493 831 b 393 932 493 886 447 932 b 293 831 339 932 293 886 b 393 731 293 776 338 731 b 493 831 449 731 493 776 "},"±":{"ha":896,"x_min":0,"x_max":0,"o":"m 853 481 b 825 458 853 465 840 458 l 610 458 l 610 244 b 588 217 610 229 603 217 l 463 217 b 440 244 447 217 440 229 l 440 458 l 226 458 b 199 481 211 458 199 465 l 199 606 b 226 628 199 621 211 628 l 440 628 l 440 843 b 463 871 440 858 447 871 l 588 871 b 610 843 603 871 610 858 l 610 628 l 825 628 b 853 606 840 628 853 621 l 853 481 m 853 -6 b 825 -28 853 -21 840 -28 l 226 -28 b 199 -6 211 -28 199 -21 l 199 93 b 226 115 199 108 211 115 l 825 115 b 853 93 840 115 853 108 l 853 -6 "},"²":{"ha":493,"x_min":0,"x_max":0,"o":"m 368 815 b 457 894 438 860 457 864 b 392 928 457 921 442 928 b 243 918 347 928 292 924 b 224 942 225 915 221 926 l 233 1000 b 257 1024 236 1013 240 1019 b 424 1047 303 1036 368 1047 b 603 917 543 1047 603 1008 b 483 743 603 850 571 796 l 414 700 b 285 588 340 656 293 625 l 514 588 b 533 567 532 588 536 581 l 521 489 b 493 465 518 474 513 465 l 158 465 b 139 489 142 465 136 476 l 151 565 b 289 765 167 651 206 711 "},"³":{"ha":493,"x_min":0,"x_max":0,"o":"m 181 585 b 329 578 232 581 297 578 b 408 660 390 578 408 607 b 365 703 408 685 403 703 l 233 703 b 215 726 217 703 213 713 l 226 790 b 253 813 229 804 235 813 l 382 813 b 449 885 435 813 449 857 b 390 928 449 914 435 928 b 254 919 358 928 304 926 b 222 940 229 915 219 921 l 232 1000 b 257 1024 235 1014 246 1019 b 422 1047 299 1035 356 1047 b 596 918 535 1047 596 1001 b 511 758 596 843 563 786 b 553 660 540 733 553 707 b 314 458 553 525 472 458 b 158 479 254 458 197 468 b 142 503 149 483 139 488 l 153 563 b 181 585 156 576 163 585 "},"´":{"ha":615,"x_min":0,"x_max":0,"o":"m 775 1074 b 767 1061 775 1069 772 1065 l 567 892 b 531 875 554 881 549 875 l 368 875 b 357 883 361 875 357 878 b 365 899 357 888 360 893 l 524 1061 b 564 1082 539 1076 544 1082 l 760 1082 b 775 1074 768 1082 775 1079 "},"µ":{"ha":850,"x_min":0,"x_max":0,"o":"m 771 28 b 739 0 768 13 761 0 l 583 0 b 560 28 565 0 557 13 l 565 61 b 326 -11 479 7 415 -11 l 307 -11 l 267 -237 b 235 -265 264 -253 257 -265 l 65 -265 b 40 -237 44 -265 39 -253 l 218 767 b 253 796 221 782 231 796 l 421 796 b 443 767 436 796 447 789 l 361 304 b 354 243 357 279 354 260 b 431 175 354 193 375 175 b 579 219 482 175 528 194 l 676 767 b 710 796 679 782 688 796 l 878 796 b 901 767 893 796 904 786 l 771 28 "},"¶":{"ha":915,"x_min":0,"x_max":0,"o":"m 1015 1014 b 1014 1006 1015 1011 1014 1008 l 793 -244 b 765 -271 790 -258 779 -271 l 706 -271 b 686 -249 693 -271 686 -261 l 686 -244 l 893 926 l 806 926 l 599 -244 b 571 -271 596 -258 585 -271 l 511 -271 b 492 -249 499 -271 492 -261 l 492 -244 l 594 336 l 461 336 b 172 596 294 336 172 449 b 176 646 172 613 174 629 l 190 722 b 583 1032 232 950 385 1032 l 996 1032 b 1015 1014 1010 1032 1015 1025 "},"·":{"ha":381,"x_min":0,"x_max":0,"o":"m 408 618 l 378 443 b 346 415 375 428 361 415 l 183 415 b 158 439 169 415 158 425 l 158 443 l 189 618 b 224 644 192 633 208 644 l 386 644 b 408 624 400 644 408 636 "},"¸":{"ha":592,"x_min":0,"x_max":0,"o":"m 440 -57 b 432 -69 440 -60 438 -64 l 232 -239 b 196 -256 219 -250 214 -256 l 47 -256 b 36 -247 40 -256 36 -253 b 44 -232 36 -243 39 -237 l 201 -69 b 243 -49 217 -54 224 -49 l 426 -49 b 440 -57 435 -49 440 -51 "},"¹":{"ha":335,"x_min":0,"x_max":0,"o":"m 340 1036 b 361 1040 346 1039 353 1040 l 429 1040 b 446 1017 447 1040 447 1029 l 353 489 b 328 465 349 471 342 465 l 229 465 b 210 489 217 465 206 471 l 281 892 l 201 860 b 176 876 181 853 172 858 l 192 963 b 208 981 193 969 197 976 "},"º":{"ha":528,"x_min":0,"x_max":0,"o":"m 631 872 b 625 814 631 854 629 835 l 617 768 b 360 539 589 615 513 539 b 178 718 250 539 178 608 b 182 768 178 733 179 750 l 190 814 b 449 1044 222 989 311 1044 b 631 872 557 1044 631 988 m 482 863 b 426 919 482 907 463 919 b 338 814 379 919 353 897 l 329 768 b 325 724 326 751 325 736 b 382 663 325 678 344 663 b 468 768 429 663 454 690 l 476 814 b 482 863 481 833 482 849 "},"»":{"ha":997,"x_min":0,"x_max":0,"o":"m 1033 393 b 1014 351 1033 376 1025 363 l 756 104 b 711 88 743 92 732 88 l 526 88 b 510 100 515 88 510 93 b 518 115 510 106 513 111 l 829 397 l 633 679 b 631 689 631 682 631 686 b 653 707 631 699 640 707 l 804 707 b 843 690 825 707 835 703 l 1019 433 b 1033 393 1029 419 1033 406 m 601 393 b 582 351 601 376 593 363 l 324 104 b 279 88 311 92 300 88 l 94 88 b 78 100 83 88 78 93 b 86 115 78 106 81 111 l 397 397 l 201 679 b 199 689 199 682 199 686 b 221 707 199 699 208 707 l 372 707 b 411 690 393 707 403 703 l 588 433 b 601 393 597 419 601 406 "},"¼":{"ha":1075,"x_min":0,"x_max":0,"o":"m 360 1036 b 381 1040 365 1039 372 1040 l 449 1040 b 465 1017 467 1040 467 1029 l 372 489 b 347 465 368 471 361 465 l 249 465 b 229 489 236 465 225 471 l 300 892 l 221 860 b 196 876 200 853 192 858 l 211 963 b 228 981 213 969 217 976 m 1075 1024 b 1067 1004 1075 1018 1072 1011 l 318 29 b 281 0 303 10 296 0 l 138 0 b 125 11 129 0 125 4 b 132 29 125 17 126 22 l 881 1004 b 921 1032 897 1025 906 1032 l 1064 1032 b 1075 1024 1072 1032 1075 1029 m 1051 149 b 1025 125 1050 136 1044 125 l 983 125 l 967 24 b 940 0 964 7 960 0 l 840 0 b 822 24 824 0 821 11 l 839 125 l 629 125 b 611 149 618 125 608 131 l 625 221 b 639 250 626 229 629 240 l 932 561 b 960 575 940 569 949 575 l 1040 575 b 1060 551 1060 575 1063 564 l 1004 240 l 1046 240 b 1064 217 1064 240 1067 232 l 1051 149 m 889 383 l 758 240 l 864 240 "},"½":{"ha":1172,"x_min":0,"x_max":0,"o":"m 360 1036 b 381 1040 365 1039 372 1040 l 449 1040 b 465 1017 467 1040 467 1029 l 372 489 b 347 465 368 471 361 465 l 249 465 b 229 489 236 465 225 471 l 300 892 l 221 860 b 196 876 200 853 192 858 l 211 963 b 228 981 213 969 217 976 m 1075 1024 b 1067 1004 1075 1018 1072 1011 l 318 29 b 281 0 303 10 296 0 l 138 0 b 125 11 129 0 125 4 b 132 29 125 17 126 22 l 881 1004 b 921 1032 897 1025 906 1032 l 1064 1032 b 1075 1024 1072 1032 1075 1029 m 938 350 b 1026 429 1007 394 1026 399 b 961 463 1026 456 1011 463 b 813 453 917 463 861 458 b 793 476 794 450 790 461 l 803 535 b 826 558 806 547 810 554 b 993 582 872 571 938 582 b 1172 451 1113 582 1172 543 b 1053 278 1172 385 1140 331 l 983 235 b 854 122 910 190 863 160 l 1083 122 b 1103 101 1101 122 1106 115 l 1090 24 b 1063 0 1088 8 1082 0 l 728 0 b 708 24 711 0 706 11 l 721 100 b 858 300 736 186 775 246 "},"¾":{"ha":1168,"x_min":0,"x_max":0,"o":"m 1168 1024 b 1160 1004 1168 1018 1165 1011 l 411 29 b 374 0 396 10 389 0 l 231 0 b 218 11 222 0 218 4 b 225 29 218 17 219 22 l 974 1004 b 1014 1032 990 1025 999 1032 l 1157 1032 b 1168 1024 1165 1032 1168 1029 m 1144 149 b 1118 125 1143 136 1138 125 l 1076 125 l 1060 24 b 1033 0 1057 7 1053 0 l 933 0 b 915 24 917 0 914 11 l 932 125 l 722 125 b 704 149 711 125 701 131 l 718 221 b 732 250 719 229 722 240 l 1025 561 b 1053 575 1033 569 1042 575 l 1133 575 b 1153 551 1153 575 1156 564 l 1097 240 l 1139 240 b 1157 217 1157 240 1160 232 l 1144 149 m 982 383 l 851 240 l 957 240 m 165 585 b 314 578 217 581 282 578 b 393 660 375 578 393 607 b 350 703 393 685 388 703 l 218 703 b 200 726 201 703 197 713 l 211 790 b 238 813 214 804 219 813 l 367 813 b 433 885 419 813 433 857 b 375 928 433 914 419 928 b 239 919 343 928 289 926 b 207 940 214 915 204 921 l 217 1000 b 242 1024 219 1014 231 1019 b 407 1047 283 1035 340 1047 b 581 918 519 1047 581 1001 b 496 758 581 843 547 786 b 538 660 525 733 538 707 b 299 458 538 525 457 458 b 143 479 239 458 182 468 b 126 503 133 483 124 488 l 138 563 b 165 585 140 576 147 585 "},"¿":{"ha":665,"x_min":0,"x_max":0,"o":"m 657 769 l 625 594 b 593 567 622 579 608 567 l 429 567 b 406 590 415 567 406 576 l 406 594 l 438 769 b 469 796 440 785 454 796 l 633 796 b 657 774 647 796 657 788 m 606 -65 b 604 -75 606 -68 604 -72 l 583 -199 b 551 -235 581 -218 574 -229 b 324 -264 489 -253 401 -264 b 57 -76 171 -264 57 -203 b 207 211 57 44 126 128 l 285 292 b 388 415 363 372 382 386 l 394 454 b 432 481 397 471 417 481 l 571 481 b 592 458 585 481 592 469 l 592 453 l 586 415 b 497 229 575 343 563 299 l 415 142 b 322 -21 371 94 322 50 b 381 -61 322 -46 333 -61 b 582 -46 453 -61 514 -54 l 586 -46 b 606 -65 600 -46 606 -54 "},"À":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 793 1115 b 778 1103 793 1108 788 1103 l 640 1103 b 610 1119 622 1103 619 1108 l 471 1289 b 467 1299 468 1293 467 1296 b 483 1310 467 1306 474 1310 l 656 1310 b 690 1289 675 1310 681 1304 l 789 1126 b 793 1115 792 1122 793 1118 "},"Á":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 956 1301 b 947 1289 956 1297 953 1293 l 747 1119 b 711 1103 735 1108 729 1103 l 549 1103 b 538 1111 542 1103 538 1106 b 546 1126 538 1115 540 1121 l 704 1289 b 744 1310 719 1304 725 1310 l 940 1310 b 956 1301 949 1310 956 1307 "},"Â":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 935 1117 b 921 1104 935 1110 931 1104 l 785 1104 b 754 1121 767 1104 763 1108 l 685 1218 l 578 1121 b 542 1104 564 1108 560 1104 l 392 1104 b 381 1113 385 1104 381 1107 b 389 1128 381 1117 383 1122 l 542 1290 b 582 1311 557 1306 563 1311 l 804 1311 b 839 1290 824 1311 829 1307 l 932 1128 b 935 1117 935 1124 935 1119 "},"Ã":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 968 1288 l 964 1260 b 774 1090 946 1135 885 1090 b 671 1124 746 1090 696 1104 l 619 1164 b 568 1189 599 1181 583 1189 b 529 1151 550 1189 536 1185 l 524 1125 b 499 1101 521 1110 513 1101 l 400 1101 b 382 1118 389 1101 382 1107 b 383 1125 382 1119 383 1122 l 389 1151 b 582 1319 414 1272 468 1319 b 681 1288 610 1319 654 1307 l 733 1249 b 785 1224 754 1233 769 1224 b 824 1261 806 1224 818 1226 l 828 1288 b 854 1310 831 1303 840 1310 l 951 1310 b 968 1294 963 1310 968 1304 "},"Ä":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 939 1269 l 917 1140 b 881 1113 914 1125 896 1113 l 750 1113 b 726 1136 736 1113 726 1122 l 726 1140 l 749 1269 b 783 1297 751 1285 768 1297 l 914 1297 b 939 1274 928 1297 939 1288 m 638 1269 l 615 1140 b 581 1113 613 1125 596 1113 l 450 1113 b 425 1136 436 1113 425 1122 l 425 1140 l 447 1269 b 483 1297 450 1285 468 1297 l 614 1297 b 638 1274 628 1297 638 1288 "},"Å":{"ha":929,"x_min":0,"x_max":0,"o":"m 907 28 b 879 0 907 11 894 0 l 689 0 b 665 25 675 0 665 11 l 656 253 l 371 253 l 281 25 b 249 0 275 11 263 0 l 50 0 b 31 17 38 0 31 7 b 33 29 31 21 32 25 l 392 890 b 650 1044 447 1024 554 1044 b 851 890 746 1044 843 1024 l 907 29 l 907 28 m 633 826 b 619 847 633 840 632 847 b 596 826 607 847 601 840 l 443 443 l 650 443 m 839 1243 b 678 1082 839 1154 767 1082 b 515 1243 589 1082 515 1154 b 678 1406 515 1332 589 1406 b 839 1243 767 1406 839 1332 m 740 1244 b 678 1306 740 1278 711 1306 b 618 1244 644 1306 618 1279 b 678 1183 618 1210 644 1183 b 740 1244 711 1183 740 1211 "},"Æ":{"ha":1283,"x_min":0,"x_max":0,"o":"m 1382 1013 b 1381 1004 1382 1010 1381 1007 l 1357 869 b 1325 842 1354 854 1340 842 l 989 842 l 950 621 l 1275 621 b 1297 599 1289 621 1297 611 l 1297 593 l 1275 461 b 1242 433 1272 446 1257 433 l 917 433 l 890 286 b 888 250 888 272 888 260 b 963 192 888 206 910 192 l 1210 192 b 1233 168 1224 192 1233 182 l 1233 164 l 1210 35 b 1178 6 1207 17 1197 8 b 939 -12 1128 -1 1089 -12 b 647 208 774 -12 647 40 b 650 253 647 222 649 238 l 374 253 l 283 25 b 251 0 278 11 265 0 l 50 0 b 31 18 38 0 31 7 b 33 29 31 22 32 25 l 392 890 b 647 1032 447 1024 551 1032 l 1358 1032 b 1382 1013 1375 1032 1382 1025 m 622 847 b 599 826 610 847 604 840 l 446 443 l 682 443 l 754 847 "},"Ç":{"ha":779,"x_min":0,"x_max":0,"o":"m 897 990 l 874 856 b 840 828 871 839 858 828 l 839 828 l 838 828 b 635 839 786 832 711 839 b 421 604 539 839 454 789 l 389 429 b 381 344 383 397 381 369 b 521 194 381 229 442 194 b 728 206 597 194 674 201 l 732 206 b 756 185 746 206 756 199 b 754 178 756 183 754 181 l 729 43 b 693 11 725 24 714 17 b 482 -12 663 1 579 -12 b 139 326 300 -12 139 99 b 149 429 139 358 142 393 l 181 604 b 669 1044 247 969 447 1044 b 872 1021 767 1044 844 1031 b 897 997 889 1015 897 1011 l 897 993 m 588 -57 b 579 -69 588 -60 585 -64 l 379 -239 b 343 -256 365 -250 361 -256 l 194 -256 b 183 -247 186 -256 183 -253 b 192 -232 183 -243 186 -237 l 349 -69 b 390 -49 364 -54 371 -49 l 574 -49 b 588 -57 582 -49 588 -51 "},"È":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1007 b 904 999 906 1004 904 1001 l 881 869 b 849 842 878 854 864 842 l 567 842 b 461 749 510 842 475 831 l 439 621 l 799 621 b 821 597 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 379 286 b 375 250 376 272 375 260 b 451 192 375 206 399 192 l 733 192 b 757 168 747 192 757 182 l 757 164 l 733 35 b 701 6 731 17 721 8 b 432 -12 651 -1 582 -12 b 136 218 288 -12 136 39 b 143 286 136 239 139 263 l 225 747 b 617 1044 272 1017 426 1044 b 881 1026 767 1044 833 1033 b 906 1007 897 1024 906 1019 m 740 1117 b 725 1104 740 1110 735 1104 l 588 1104 b 557 1121 569 1104 567 1110 l 418 1290 b 414 1300 415 1294 414 1297 b 431 1311 414 1307 421 1311 l 603 1311 b 638 1290 622 1311 628 1306 l 736 1128 b 740 1117 739 1124 740 1119 "},"É":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1007 b 904 999 906 1004 904 1001 l 881 869 b 849 842 878 854 864 842 l 567 842 b 461 749 510 842 475 831 l 439 621 l 799 621 b 821 597 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 379 286 b 375 250 376 272 375 260 b 451 192 375 206 399 192 l 733 192 b 757 168 747 192 757 182 l 757 164 l 733 35 b 701 6 731 17 721 8 b 432 -12 651 -1 582 -12 b 136 218 288 -12 136 39 b 143 286 136 239 139 263 l 225 747 b 617 1044 272 1017 426 1044 b 881 1026 767 1044 833 1033 b 906 1007 897 1024 906 1019 m 900 1303 b 892 1290 900 1299 897 1294 l 692 1121 b 656 1104 679 1110 674 1104 l 493 1104 b 482 1113 486 1104 482 1107 b 490 1128 482 1117 485 1122 l 649 1290 b 689 1311 664 1306 669 1311 l 885 1311 b 900 1303 893 1311 900 1308 "},"Ê":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1007 b 904 999 906 1004 904 1001 l 881 869 b 849 842 878 854 864 842 l 567 842 b 461 749 510 842 475 831 l 439 621 l 799 621 b 821 597 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 379 286 b 375 250 376 272 375 260 b 451 192 375 206 399 192 l 733 192 b 757 168 747 192 757 182 l 757 164 l 733 35 b 701 6 731 17 721 8 b 432 -12 651 -1 582 -12 b 136 218 288 -12 136 39 b 143 286 136 239 139 263 l 225 747 b 617 1044 272 1017 426 1044 b 881 1026 767 1044 833 1033 b 906 1007 897 1024 906 1019 m 904 1117 b 890 1104 904 1110 900 1104 l 754 1104 b 724 1121 736 1104 732 1108 l 654 1218 l 547 1121 b 511 1104 533 1108 529 1104 l 361 1104 b 350 1113 354 1104 350 1107 b 358 1128 350 1117 353 1122 l 511 1290 b 551 1311 526 1306 532 1311 l 774 1311 b 808 1290 793 1311 799 1307 l 901 1128 b 904 1117 904 1124 904 1119 "},"Ë":{"ha":807,"x_min":0,"x_max":0,"o":"m 906 1007 b 904 999 906 1004 904 1001 l 881 869 b 849 842 878 854 864 842 l 567 842 b 461 749 510 842 475 831 l 439 621 l 799 621 b 821 597 813 621 821 611 l 821 593 l 799 461 b 765 433 796 446 781 433 l 406 433 l 379 286 b 375 250 376 272 375 260 b 451 192 375 206 399 192 l 733 192 b 757 168 747 192 757 182 l 757 164 l 733 35 b 701 6 731 17 721 8 b 432 -12 651 -1 582 -12 b 136 218 288 -12 136 39 b 143 286 136 239 139 263 l 225 747 b 617 1044 272 1017 426 1044 b 881 1026 767 1044 833 1033 b 906 1007 897 1024 906 1019 m 876 1269 l 854 1140 b 818 1113 851 1125 833 1113 l 688 1113 b 664 1136 674 1113 664 1122 l 664 1140 l 686 1269 b 721 1297 689 1285 706 1297 l 851 1297 b 876 1274 865 1297 876 1288 m 575 1269 l 553 1140 b 518 1113 550 1125 533 1113 l 388 1113 b 363 1136 374 1113 363 1122 l 363 1140 l 385 1269 b 421 1297 388 1285 406 1297 l 551 1297 b 575 1274 565 1297 575 1288 "},"Ì":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 340 28 b 308 0 338 13 324 0 l 122 0 b 103 21 110 0 103 10 l 103 28 l 275 1006 b 304 1032 278 1021 289 1032 l 490 1032 b 513 1011 504 1032 513 1024 m 546 1117 b 531 1104 546 1110 540 1104 l 393 1104 b 363 1121 375 1104 372 1110 l 224 1290 b 219 1300 221 1294 219 1297 b 236 1311 219 1307 226 1311 l 408 1311 b 443 1290 428 1311 433 1306 l 542 1128 b 546 1117 544 1124 546 1119 "},"Í":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 340 28 b 308 0 338 13 324 0 l 122 0 b 103 21 110 0 103 10 l 103 28 l 275 1006 b 304 1032 278 1021 289 1032 l 490 1032 b 513 1011 504 1032 513 1024 m 692 1303 b 683 1290 692 1299 689 1294 l 483 1121 b 447 1104 471 1110 465 1104 l 285 1104 b 274 1113 278 1104 274 1107 b 282 1128 274 1117 276 1122 l 440 1290 b 481 1311 456 1306 461 1311 l 676 1311 b 692 1303 685 1311 692 1308 "},"Î":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 340 28 b 308 0 338 13 324 0 l 122 0 b 103 21 110 0 103 10 l 103 28 l 275 1006 b 304 1032 278 1021 289 1032 l 490 1032 b 513 1011 504 1032 513 1024 m 690 1115 b 676 1103 690 1108 686 1103 l 540 1103 b 510 1119 522 1103 518 1107 l 440 1217 l 333 1119 b 297 1103 319 1107 315 1103 l 147 1103 b 136 1111 140 1103 136 1106 b 144 1126 136 1115 139 1121 l 297 1289 b 338 1310 313 1304 318 1310 l 560 1310 b 594 1289 579 1310 585 1306 l 688 1126 b 690 1115 690 1122 690 1118 "},"Ï":{"ha":432,"x_min":0,"x_max":0,"o":"m 513 1006 l 340 28 b 308 0 338 13 324 0 l 122 0 b 103 21 110 0 103 10 l 103 28 l 275 1006 b 304 1032 278 1021 289 1032 l 490 1032 b 513 1011 504 1032 513 1024 m 685 1269 l 663 1140 b 626 1113 660 1125 642 1113 l 496 1113 b 472 1136 482 1113 472 1122 l 472 1140 l 494 1269 b 529 1297 497 1285 514 1297 l 660 1297 b 685 1274 674 1297 685 1288 m 383 1269 l 361 1140 b 326 1113 358 1125 342 1113 l 196 1113 b 171 1136 182 1113 171 1122 l 171 1140 l 193 1269 b 229 1297 196 1285 214 1297 l 360 1297 b 383 1274 374 1297 383 1288 "},"Ñ":{"ha":1013,"x_min":0,"x_max":0,"o":"m 1093 1006 l 925 53 b 864 0 919 24 893 0 l 747 0 b 671 43 718 0 686 6 l 440 590 b 429 601 436 599 433 601 b 421 590 425 601 422 599 l 322 28 b 289 0 319 13 304 0 l 125 0 b 103 24 111 0 103 10 l 103 28 l 269 979 b 332 1032 275 1008 303 1032 l 438 1032 b 513 989 465 1032 499 1024 l 751 417 b 760 406 756 408 756 406 b 769 418 763 406 768 408 l 874 1006 b 906 1032 876 1021 890 1032 l 1069 1032 b 1093 1010 1083 1032 1093 1022 m 1003 1288 l 999 1260 b 808 1090 981 1135 919 1090 b 706 1124 781 1090 731 1104 l 654 1164 b 603 1189 633 1181 618 1189 b 564 1151 585 1189 571 1185 l 558 1125 b 533 1101 556 1110 547 1101 l 435 1101 b 417 1118 424 1101 417 1107 b 418 1125 417 1119 418 1122 l 424 1151 b 617 1319 449 1272 503 1319 b 715 1288 644 1319 689 1307 l 768 1249 b 819 1224 789 1233 804 1224 b 858 1261 840 1224 853 1226 l 863 1288 b 889 1310 865 1303 875 1310 l 986 1310 b 1003 1294 997 1310 1003 1304 "},"Ò":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 m 800 1115 b 785 1103 800 1108 794 1103 l 647 1103 b 617 1119 629 1103 626 1108 l 478 1289 b 474 1299 475 1293 474 1296 b 490 1310 474 1306 481 1310 l 663 1310 b 697 1289 682 1310 688 1304 l 796 1126 b 800 1115 799 1122 800 1118 "},"Ó":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 m 953 1303 b 944 1290 953 1299 950 1294 l 744 1121 b 708 1104 732 1110 726 1104 l 546 1104 b 535 1113 539 1104 535 1107 b 543 1128 535 1117 538 1122 l 701 1290 b 742 1311 717 1306 722 1311 l 938 1311 b 953 1303 946 1311 953 1308 "},"Ô":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 m 951 1117 b 938 1104 951 1110 947 1104 l 801 1104 b 771 1121 783 1104 779 1108 l 701 1218 l 594 1121 b 558 1104 581 1108 576 1104 l 408 1104 b 397 1113 401 1104 397 1107 b 406 1128 397 1117 400 1122 l 558 1290 b 599 1311 574 1306 579 1311 l 821 1311 b 856 1290 840 1311 846 1307 l 949 1128 b 951 1117 951 1124 951 1119 "},"Õ":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 m 996 1289 l 992 1261 b 801 1092 974 1136 913 1092 b 699 1125 774 1092 724 1106 l 647 1165 b 596 1190 626 1182 611 1190 b 557 1153 578 1190 564 1186 l 551 1126 b 526 1103 549 1111 540 1103 l 428 1103 b 410 1119 417 1103 410 1108 b 411 1126 410 1121 411 1124 l 417 1153 b 610 1321 442 1274 496 1321 b 708 1289 638 1321 682 1308 l 761 1250 b 813 1225 782 1235 797 1225 b 851 1263 833 1225 846 1228 l 856 1289 b 882 1311 858 1304 868 1311 l 979 1311 b 996 1296 990 1311 996 1306 "},"Ö":{"ha":969,"x_min":0,"x_max":0,"o":"m 1011 707 b 1001 599 1011 674 1008 638 l 972 433 b 482 -12 915 108 743 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 1011 707 856 1044 1011 943 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 m 944 1269 l 922 1140 b 886 1113 919 1125 901 1113 l 756 1113 b 732 1136 742 1113 732 1122 l 732 1140 l 754 1269 b 789 1297 757 1285 774 1297 l 919 1297 b 944 1274 933 1297 944 1288 m 643 1269 l 621 1140 b 586 1113 618 1125 601 1113 l 456 1113 b 431 1136 442 1113 431 1122 l 431 1140 l 453 1269 b 489 1297 456 1285 474 1297 l 619 1297 b 643 1274 633 1297 643 1288 "},"Ù":{"ha":988,"x_min":0,"x_max":0,"o":"m 1072 1006 l 963 388 b 490 -12 900 39 711 -12 b 153 289 296 -12 153 78 b 161 388 153 319 154 351 l 271 1006 b 303 1032 274 1021 288 1032 l 485 1032 b 508 1010 499 1032 508 1022 l 508 1006 l 399 388 b 390 306 393 357 390 329 b 526 186 390 222 429 186 b 725 388 651 186 700 246 l 835 1006 b 867 1032 838 1021 851 1032 l 1047 1032 b 1072 1010 1061 1032 1072 1024 m 831 1115 b 815 1103 831 1108 825 1103 l 678 1103 b 647 1119 660 1103 657 1108 l 508 1289 b 504 1299 506 1293 504 1296 b 521 1310 504 1306 511 1310 l 693 1310 b 728 1289 713 1310 718 1304 l 826 1126 b 831 1115 829 1122 831 1118 "},"Ú":{"ha":988,"x_min":0,"x_max":0,"o":"m 1072 1006 l 963 388 b 490 -12 900 39 711 -12 b 153 289 296 -12 153 78 b 161 388 153 319 154 351 l 271 1006 b 303 1032 274 1021 288 1032 l 485 1032 b 508 1010 499 1032 508 1022 l 508 1006 l 399 388 b 390 306 393 357 390 329 b 526 186 390 222 429 186 b 725 388 651 186 700 246 l 835 1006 b 867 1032 838 1021 851 1032 l 1047 1032 b 1072 1010 1061 1032 1072 1024 m 979 1301 b 971 1289 979 1297 976 1293 l 771 1119 b 735 1103 758 1108 753 1103 l 572 1103 b 561 1111 565 1103 561 1106 b 569 1126 561 1115 564 1121 l 728 1289 b 768 1310 743 1304 749 1310 l 964 1310 b 979 1301 972 1310 979 1307 "},"Û":{"ha":988,"x_min":0,"x_max":0,"o":"m 1072 1006 l 963 388 b 490 -12 900 39 711 -12 b 153 289 296 -12 153 78 b 161 388 153 319 154 351 l 271 1006 b 303 1032 274 1021 288 1032 l 485 1032 b 508 1010 499 1032 508 1022 l 508 1006 l 399 388 b 390 306 393 357 390 329 b 526 186 390 222 429 186 b 725 388 651 186 700 246 l 835 1006 b 867 1032 838 1021 851 1032 l 1047 1032 b 1072 1010 1061 1032 1072 1024 m 971 1117 b 957 1104 971 1110 967 1104 l 821 1104 b 790 1121 803 1104 799 1108 l 721 1218 l 614 1121 b 578 1104 600 1108 596 1104 l 428 1104 b 417 1113 421 1104 417 1107 b 425 1128 417 1117 419 1122 l 578 1290 b 618 1311 593 1306 599 1311 l 840 1311 b 875 1290 860 1311 865 1307 l 968 1128 b 971 1117 971 1124 971 1119 "},"Ü":{"ha":988,"x_min":0,"x_max":0,"o":"m 1072 1006 l 963 388 b 490 -12 900 39 711 -12 b 153 289 296 -12 153 78 b 161 388 153 319 154 351 l 271 1006 b 303 1032 274 1021 288 1032 l 485 1032 b 508 1010 499 1032 508 1022 l 508 1006 l 399 388 b 390 306 393 357 390 329 b 526 186 390 222 429 186 b 725 388 651 186 700 246 l 835 1006 b 867 1032 838 1021 851 1032 l 1047 1032 b 1072 1010 1061 1032 1072 1024 m 960 1269 l 938 1140 b 901 1113 935 1125 917 1113 l 771 1113 b 747 1136 757 1113 747 1122 l 747 1140 l 769 1269 b 804 1297 772 1285 789 1297 l 935 1297 b 960 1274 949 1297 960 1288 m 658 1269 l 636 1140 b 601 1113 633 1125 617 1113 l 471 1113 b 446 1136 457 1113 446 1122 l 446 1140 l 468 1269 b 504 1297 471 1285 489 1297 l 635 1297 b 658 1274 649 1297 658 1288 "},"ß":{"ha":906,"x_min":0,"x_max":0,"o":"m 958 818 b 788 551 958 713 894 596 b 892 368 868 504 892 425 b 490 -12 892 124 733 -12 b 407 -4 467 -12 435 -10 b 385 22 393 -1 382 6 l 408 156 b 428 178 411 171 417 178 l 429 178 b 479 176 446 176 463 176 b 665 365 607 176 665 238 b 538 464 665 424 631 464 l 494 464 b 471 486 481 464 471 472 l 471 490 l 490 600 b 524 626 493 615 508 626 l 567 626 b 732 786 675 626 732 697 b 613 882 732 853 694 882 b 432 715 492 882 451 828 l 311 29 b 279 0 308 14 294 0 l 107 0 b 85 24 93 0 85 11 l 85 29 l 206 715 b 628 1075 254 992 383 1075 b 958 818 843 1075 958 979 "},"à":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 690 888 b 675 875 690 881 685 875 l 538 875 b 507 892 519 875 517 881 l 368 1061 b 364 1071 365 1065 364 1068 b 381 1082 364 1078 371 1082 l 553 1082 b 588 1061 572 1082 578 1076 l 686 899 b 690 888 689 894 690 890 "},"á":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 874 1074 b 865 1061 874 1069 871 1065 l 665 892 b 629 875 653 881 647 875 l 467 875 b 456 883 460 875 456 878 b 464 899 456 888 458 893 l 622 1061 b 663 1082 638 1076 643 1082 l 858 1082 b 874 1074 867 1082 874 1079 "},"â":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 844 888 b 831 875 844 881 840 875 l 694 875 b 664 892 676 875 672 879 l 594 989 l 488 892 b 451 875 474 879 469 875 l 301 875 b 290 883 294 875 290 878 b 299 899 290 888 293 893 l 451 1061 b 492 1082 467 1076 472 1082 l 714 1082 b 749 1061 733 1082 739 1078 l 842 899 b 844 888 844 894 844 890 "},"ã":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 868 1064 l 864 1036 b 674 867 846 911 785 867 b 571 900 646 867 596 881 l 519 940 b 468 965 499 957 483 965 b 429 928 450 965 436 961 l 424 901 b 399 878 421 886 413 878 l 300 878 b 282 894 289 878 282 883 b 283 901 282 896 283 899 l 289 928 b 482 1096 314 1049 368 1096 b 581 1064 510 1096 554 1083 l 633 1025 b 685 1000 654 1010 669 1000 b 724 1038 706 1000 718 1003 l 728 1064 b 754 1086 731 1079 740 1086 l 851 1086 b 868 1071 863 1086 868 1081 "},"ä":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 844 1046 l 822 917 b 786 889 819 901 801 889 l 656 889 b 632 913 642 889 632 899 l 632 917 l 654 1046 b 689 1074 657 1061 674 1074 l 819 1074 b 844 1050 833 1074 844 1064 m 543 1046 l 521 917 b 486 889 518 901 501 889 l 356 889 b 331 913 342 889 331 899 l 331 917 l 353 1046 b 389 1074 356 1061 374 1074 l 519 1074 b 543 1050 533 1074 543 1064 "},"å":{"ha":807,"x_min":0,"x_max":0,"o":"m 865 742 b 864 731 865 739 865 735 l 742 28 b 710 0 739 13 725 0 l 568 0 b 544 24 554 0 544 11 l 544 28 l 550 68 b 335 -12 475 10 408 -12 b 101 254 168 -12 101 115 b 108 332 101 281 104 306 b 131 463 108 332 126 436 b 540 807 172 704 322 807 b 828 772 635 807 738 793 b 865 742 851 767 865 763 m 618 614 b 511 622 593 618 550 622 b 353 451 413 622 372 564 l 328 306 b 324 260 325 290 324 275 b 403 175 324 214 340 175 b 550 224 450 175 504 197 l 618 614 m 747 1029 b 586 868 747 940 675 868 b 424 1029 497 868 424 940 b 586 1192 424 1118 497 1192 b 747 1029 675 1192 747 1118 m 649 1031 b 586 1092 649 1064 619 1092 b 526 1031 553 1092 526 1065 b 586 969 526 996 553 969 b 649 1031 619 969 649 997 "},"æ":{"ha":1224,"x_min":0,"x_max":0,"o":"m 1247 533 b 1240 457 1247 508 1244 483 l 1225 368 b 1190 339 1222 353 1206 339 l 760 339 l 750 282 b 747 260 749 274 747 267 b 892 175 747 199 801 175 b 1135 186 944 175 1081 181 l 1142 186 b 1160 171 1153 186 1160 183 l 1160 164 l 1142 64 b 1110 28 1138 43 1132 35 b 826 -12 1028 1 917 -12 b 633 51 747 -12 675 10 b 364 -12 553 11 461 -12 b 96 194 221 -12 96 57 b 100 239 96 208 97 224 l 103 254 b 501 474 135 432 278 474 l 560 474 l 563 486 b 568 542 567 507 568 526 b 478 619 568 600 540 619 b 249 610 392 619 288 614 l 244 610 b 226 628 233 610 226 617 l 226 635 l 246 744 b 279 778 249 760 261 774 b 510 807 329 790 426 807 b 724 724 613 807 679 778 b 965 807 785 782 869 807 b 1247 533 1161 807 1247 683 m 1035 533 b 933 633 1035 596 1004 633 b 786 486 849 633 801 576 l 782 461 l 1026 461 l 1031 486 b 1035 533 1033 503 1035 519 m 481 351 b 317 254 383 351 329 326 l 314 239 b 313 219 313 232 313 225 b 408 147 313 167 357 147 b 513 165 444 147 482 153 l 546 351 "},"ç":{"ha":658,"x_min":0,"x_max":0,"o":"m 735 764 b 733 754 735 761 733 757 l 711 631 b 681 607 708 617 694 607 l 678 607 b 510 617 628 613 589 617 b 368 456 442 617 392 585 l 347 339 b 340 272 343 313 340 290 b 433 178 340 197 375 178 b 604 188 513 178 551 182 l 607 188 b 629 168 619 188 629 181 l 629 164 l 607 40 b 572 8 603 19 594 14 b 388 -12 532 -1 471 -12 b 114 257 225 -12 114 85 b 122 339 114 283 117 310 l 143 456 b 528 807 189 715 326 807 b 710 786 611 807 672 796 b 735 764 726 782 735 776 m 469 -57 b 461 -69 469 -60 467 -64 l 261 -239 b 225 -256 247 -250 243 -256 l 76 -256 b 65 -247 68 -256 65 -253 b 74 -232 65 -243 68 -237 l 231 -69 b 272 -49 244 -54 253 -49 l 456 -49 b 469 -57 464 -49 469 -51 "},"è":{"ha":819,"x_min":0,"x_max":0,"o":"m 842 517 b 835 442 842 493 839 467 l 821 361 b 786 328 817 340 804 328 l 340 328 b 335 271 338 307 335 288 b 458 174 335 199 369 174 b 728 186 546 174 671 181 l 732 186 b 754 168 744 186 754 181 l 754 164 l 735 58 b 700 21 731 36 725 26 b 408 -12 607 -1 529 -12 b 117 267 258 -12 117 74 b 124 344 117 290 119 317 l 140 442 b 556 807 182 683 328 807 b 842 517 743 807 842 679 m 632 528 b 524 626 632 592 601 626 b 364 467 429 626 385 563 l 625 467 b 632 528 629 489 632 510 m 718 888 b 703 875 718 881 713 875 l 565 875 b 535 892 547 875 544 881 l 396 1061 b 392 1071 393 1065 392 1068 b 408 1082 392 1078 399 1082 l 581 1082 b 615 1061 600 1082 606 1076 l 714 899 b 718 888 717 894 718 890 "},"é":{"ha":819,"x_min":0,"x_max":0,"o":"m 842 517 b 835 442 842 493 839 467 l 821 361 b 786 328 817 340 804 328 l 340 328 b 335 271 338 307 335 288 b 458 174 335 199 369 174 b 728 186 546 174 671 181 l 732 186 b 754 168 744 186 754 181 l 754 164 l 735 58 b 700 21 731 36 725 26 b 408 -12 607 -1 529 -12 b 117 267 258 -12 117 74 b 124 344 117 290 119 317 l 140 442 b 556 807 182 683 328 807 b 842 517 743 807 842 679 m 632 528 b 524 626 632 592 601 626 b 364 467 429 626 385 563 l 625 467 b 632 528 629 489 632 510 m 849 1074 b 840 1061 849 1069 846 1065 l 640 892 b 604 875 628 881 622 875 l 442 875 b 431 883 435 875 431 878 b 439 899 431 888 433 893 l 597 1061 b 638 1082 613 1076 618 1082 l 833 1082 b 849 1074 842 1082 849 1079 "},"ê":{"ha":819,"x_min":0,"x_max":0,"o":"m 842 517 b 835 442 842 493 839 467 l 821 361 b 786 328 817 340 804 328 l 340 328 b 335 271 338 307 335 288 b 458 174 335 199 369 174 b 728 186 546 174 671 181 l 732 186 b 754 168 744 186 754 181 l 754 164 l 735 58 b 700 21 731 36 725 26 b 408 -12 607 -1 529 -12 b 117 267 258 -12 117 74 b 124 344 117 290 119 317 l 140 442 b 556 807 182 683 328 807 b 842 517 743 807 842 679 m 632 528 b 524 626 632 592 601 626 b 364 467 429 626 385 563 l 625 467 b 632 528 629 489 632 510 m 842 888 b 828 875 842 881 838 875 l 692 875 b 661 892 674 875 669 879 l 592 989 l 485 892 b 449 875 471 879 467 875 l 299 875 b 288 883 292 875 288 878 b 296 899 288 888 290 893 l 449 1061 b 489 1082 464 1076 469 1082 l 711 1082 b 746 1061 731 1082 736 1078 l 839 899 b 842 888 842 894 842 890 "},"ë":{"ha":819,"x_min":0,"x_max":0,"o":"m 842 517 b 835 442 842 493 839 467 l 821 361 b 786 328 817 340 804 328 l 340 328 b 335 271 338 307 335 288 b 458 174 335 199 369 174 b 728 186 546 174 671 181 l 732 186 b 754 168 744 186 754 181 l 754 164 l 735 58 b 700 21 731 36 725 26 b 408 -12 607 -1 529 -12 b 117 267 258 -12 117 74 b 124 344 117 290 119 317 l 140 442 b 556 807 182 683 328 807 b 842 517 743 807 842 679 m 632 528 b 524 626 632 592 601 626 b 364 467 429 626 385 563 l 625 467 b 632 528 629 489 632 510 m 836 1043 l 814 914 b 778 886 811 899 793 886 l 647 886 b 624 910 633 886 624 896 l 624 914 l 646 1043 b 681 1071 649 1058 665 1071 l 811 1071 b 836 1047 825 1071 836 1061 m 535 1043 l 513 914 b 478 886 510 899 493 886 l 347 886 b 322 910 333 886 322 896 l 322 914 l 344 1043 b 381 1071 347 1058 365 1071 l 511 1071 b 535 1047 525 1071 535 1061 "},"ì":{"ha":403,"x_min":0,"x_max":0,"o":"m 450 768 l 319 28 b 286 0 317 13 301 0 l 117 0 b 94 22 103 0 94 10 l 94 28 l 225 768 b 257 796 228 783 242 796 l 426 796 b 450 772 440 796 450 786 m 474 888 b 458 875 474 881 468 875 l 321 875 b 290 892 303 875 300 881 l 151 1061 b 147 1071 149 1065 147 1068 b 164 1082 147 1078 154 1082 l 336 1082 b 371 1061 356 1082 361 1076 l 469 899 b 474 888 472 894 474 890 "},"í":{"ha":403,"x_min":0,"x_max":0,"o":"m 450 768 l 319 28 b 286 0 317 13 301 0 l 117 0 b 94 22 103 0 94 10 l 94 28 l 225 768 b 257 796 228 783 242 796 l 426 796 b 450 772 440 796 450 786 m 654 1074 b 646 1061 654 1069 651 1065 l 446 892 b 410 875 433 881 428 875 l 247 875 b 236 883 240 875 236 878 b 244 899 236 888 239 893 l 403 1061 b 443 1082 418 1076 424 1082 l 639 1082 b 654 1074 647 1082 654 1079 "},"î":{"ha":403,"x_min":0,"x_max":0,"o":"m 450 768 l 319 28 b 286 0 317 13 301 0 l 117 0 b 94 22 103 0 94 10 l 94 28 l 225 768 b 257 796 228 783 242 796 l 426 796 b 450 772 440 796 450 786 m 635 888 b 621 875 635 881 631 875 l 485 875 b 454 892 467 875 463 879 l 385 989 l 278 892 b 242 875 264 879 260 875 l 92 875 b 81 883 85 875 81 878 b 89 899 81 888 83 893 l 242 1061 b 282 1082 257 1076 263 1082 l 504 1082 b 539 1061 524 1082 529 1078 l 632 899 b 635 888 635 894 635 890 "},"ï":{"ha":403,"x_min":0,"x_max":0,"o":"m 450 768 l 319 28 b 286 0 317 13 301 0 l 117 0 b 94 22 103 0 94 10 l 94 28 l 225 768 b 257 796 228 783 242 796 l 426 796 b 450 772 440 796 450 786 m 631 1043 l 608 914 b 572 886 606 899 588 886 l 442 886 b 418 910 428 886 418 896 l 418 914 l 440 1043 b 475 1071 443 1058 460 1071 l 606 1071 b 631 1047 619 1071 631 1061 m 329 1043 l 307 914 b 272 886 304 899 288 886 l 142 886 b 117 910 128 886 117 896 l 117 914 l 139 1043 b 175 1071 142 1058 160 1071 l 306 1071 b 329 1047 319 1071 329 1061 "},"ñ":{"ha":850,"x_min":0,"x_max":0,"o":"m 861 576 b 853 492 861 550 858 522 l 772 29 b 738 0 769 14 753 0 l 569 0 b 547 24 556 0 547 11 l 547 29 l 628 492 b 635 553 632 515 635 536 b 560 621 635 604 601 621 b 410 576 507 621 440 594 l 314 29 b 281 0 311 14 296 0 l 113 0 b 89 25 99 0 89 11 l 89 29 l 219 768 b 251 796 222 783 236 796 l 403 796 b 426 772 417 796 426 786 l 426 768 l 421 735 b 638 807 483 782 564 807 b 861 576 757 807 861 740 m 886 1064 l 882 1036 b 692 867 864 911 803 867 b 589 900 664 867 614 881 l 538 940 b 486 965 517 957 501 965 b 447 928 468 965 454 961 l 442 901 b 417 878 439 886 431 878 l 318 878 b 300 894 307 878 300 883 b 301 901 300 896 301 899 l 307 928 b 500 1096 332 1049 386 1096 b 599 1064 528 1096 572 1083 l 651 1025 b 703 1000 672 1010 688 1000 b 742 1038 724 1000 736 1003 l 746 1064 b 772 1086 749 1079 758 1086 l 869 1086 b 886 1071 881 1086 886 1081 "},"ò":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 m 688 888 b 672 875 688 881 682 875 l 535 875 b 504 892 517 875 514 881 l 365 1061 b 361 1071 363 1065 361 1068 b 378 1082 361 1078 368 1082 l 550 1082 b 585 1061 569 1082 575 1076 l 683 899 b 688 888 686 894 688 890 "},"ó":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 m 843 1074 b 835 1061 843 1069 840 1065 l 635 892 b 599 875 622 881 617 875 l 436 875 b 425 883 429 875 425 878 b 433 899 425 888 428 893 l 592 1061 b 632 1082 607 1076 613 1082 l 828 1082 b 843 1074 836 1082 843 1079 "},"ô":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 m 842 888 b 828 875 842 881 838 875 l 692 875 b 661 892 674 875 669 879 l 592 989 l 485 892 b 449 875 471 879 467 875 l 299 875 b 288 883 292 875 288 878 b 296 899 288 888 290 893 l 449 1061 b 489 1082 464 1076 469 1082 l 711 1082 b 746 1061 731 1082 736 1078 l 839 899 b 842 888 842 894 842 890 "},"õ":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 m 872 1064 l 868 1036 b 678 867 850 911 789 867 b 575 900 650 867 600 881 l 524 940 b 472 965 503 957 488 965 b 433 928 454 965 440 961 l 428 901 b 403 878 425 886 417 878 l 304 878 b 286 894 293 878 286 883 b 288 901 286 896 288 899 l 293 928 b 486 1096 318 1049 372 1096 b 585 1064 514 1096 558 1083 l 638 1025 b 689 1000 658 1010 674 1000 b 728 1038 710 1000 722 1003 l 732 1064 b 758 1086 735 1079 744 1086 l 856 1086 b 872 1071 867 1086 872 1081 "},"ö":{"ha":819,"x_min":0,"x_max":0,"o":"m 844 526 b 836 446 844 500 839 463 l 818 349 b 407 -12 774 113 653 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 844 526 739 807 844 696 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 m 836 1043 l 814 914 b 778 886 811 899 793 886 l 647 886 b 624 910 633 886 624 896 l 624 914 l 646 1043 b 681 1071 649 1058 665 1071 l 811 1071 b 836 1047 825 1071 836 1061 m 535 1043 l 513 914 b 478 886 510 899 493 886 l 347 886 b 322 910 333 886 322 896 l 322 914 l 344 1043 b 381 1071 347 1058 365 1071 l 511 1071 b 535 1047 525 1071 535 1061 "},"ù":{"ha":850,"x_min":0,"x_max":0,"o":"m 901 767 l 771 28 b 739 0 768 13 754 0 l 583 0 b 560 22 569 0 560 10 l 560 28 l 567 61 b 346 -12 501 18 442 -12 b 129 219 208 -12 129 74 b 138 304 129 246 132 274 l 218 767 b 253 796 221 782 238 796 l 421 796 b 443 772 435 796 443 785 l 443 767 l 363 304 b 356 240 358 281 356 257 b 442 174 356 193 376 174 b 581 219 469 174 538 194 l 676 767 b 710 796 679 782 694 796 l 878 796 b 901 771 892 796 901 785 m 703 888 b 688 875 703 881 697 875 l 550 875 b 519 892 532 875 529 881 l 381 1061 b 376 1071 378 1065 376 1068 b 393 1082 376 1078 383 1082 l 565 1082 b 600 1061 585 1082 590 1076 l 699 899 b 703 888 701 894 703 890 "},"ú":{"ha":850,"x_min":0,"x_max":0,"o":"m 901 767 l 771 28 b 739 0 768 13 754 0 l 583 0 b 560 22 569 0 560 10 l 560 28 l 567 61 b 346 -12 501 18 442 -12 b 129 219 208 -12 129 74 b 138 304 129 246 132 274 l 218 767 b 253 796 221 782 238 796 l 421 796 b 443 772 435 796 443 785 l 443 767 l 363 304 b 356 240 358 281 356 257 b 442 174 356 193 376 174 b 581 219 469 174 538 194 l 676 767 b 710 796 679 782 694 796 l 878 796 b 901 771 892 796 901 785 m 876 1074 b 868 1061 876 1069 874 1065 l 668 892 b 632 875 656 881 650 875 l 469 875 b 458 883 463 875 458 878 b 467 899 458 888 461 893 l 625 1061 b 665 1082 640 1076 646 1082 l 861 1082 b 876 1074 869 1082 876 1079 "},"û":{"ha":850,"x_min":0,"x_max":0,"o":"m 901 767 l 771 28 b 739 0 768 13 754 0 l 583 0 b 560 22 569 0 560 10 l 560 28 l 567 61 b 346 -12 501 18 442 -12 b 129 219 208 -12 129 74 b 138 304 129 246 132 274 l 218 767 b 253 796 221 782 238 796 l 421 796 b 443 772 435 796 443 785 l 443 767 l 363 304 b 356 240 358 281 356 257 b 442 174 356 193 376 174 b 581 219 469 174 538 194 l 676 767 b 710 796 679 782 694 796 l 878 796 b 901 771 892 796 901 785 m 857 888 b 843 875 857 881 853 875 l 707 875 b 676 892 689 875 685 879 l 607 989 l 500 892 b 464 875 486 879 482 875 l 314 875 b 303 883 307 875 303 878 b 311 899 303 888 306 893 l 464 1061 b 504 1082 479 1076 485 1082 l 726 1082 b 761 1061 746 1082 751 1078 l 854 899 b 857 888 857 894 857 890 "},"ü":{"ha":850,"x_min":0,"x_max":0,"o":"m 901 767 l 771 28 b 739 0 768 13 754 0 l 583 0 b 560 22 569 0 560 10 l 560 28 l 567 61 b 346 -12 501 18 442 -12 b 129 219 208 -12 129 74 b 138 304 129 246 132 274 l 218 767 b 253 796 221 782 238 796 l 421 796 b 443 772 435 796 443 785 l 443 767 l 363 304 b 356 240 358 281 356 257 b 442 174 356 193 376 174 b 581 219 469 174 538 194 l 676 767 b 710 796 679 782 694 796 l 878 796 b 901 771 892 796 901 785 m 854 1043 l 832 914 b 796 886 829 899 811 886 l 665 886 b 642 910 651 886 642 896 l 642 914 l 664 1043 b 699 1071 667 1058 683 1071 l 829 1071 b 854 1047 843 1071 854 1061 m 553 1043 l 531 914 b 496 886 528 899 511 886 l 365 886 b 340 910 351 886 340 896 l 340 914 l 363 1043 b 399 1071 365 1058 383 1071 l 529 1071 b 553 1047 543 1071 553 1061 "},"ÿ":{"ha":822,"x_min":0,"x_max":0,"o":"m 928 775 b 925 764 928 771 926 768 l 547 -54 b 208 -281 471 -218 413 -281 b 39 -258 157 -281 72 -269 b 14 -237 25 -254 14 -249 l 14 -233 l 35 -121 b 67 -94 38 -106 51 -94 l 69 -94 b 242 -106 114 -97 196 -106 b 346 -33 292 -106 321 -89 l 365 10 l 358 10 b 239 139 303 10 251 31 l 165 764 l 165 768 b 197 796 165 785 175 796 l 379 796 b 401 769 393 796 400 783 l 433 239 b 447 221 435 222 439 221 l 458 221 l 685 769 b 718 796 690 783 703 796 l 906 796 b 928 775 918 796 928 786 m 847 1043 l 825 914 b 789 886 822 899 804 886 l 658 886 b 635 910 644 886 635 896 l 635 914 l 657 1043 b 692 1071 660 1058 676 1071 l 822 1071 b 847 1047 836 1071 847 1061 m 546 1043 l 524 914 b 489 886 521 899 504 886 l 358 886 b 333 910 344 886 333 896 l 333 914 l 356 1043 b 392 1071 358 1058 376 1071 l 522 1071 b 546 1047 536 1071 546 1061 "},"Œ":{"ha":1374,"x_min":0,"x_max":0,"o":"m 1471 1006 b 1469 999 1471 1003 1469 1001 l 1446 869 b 1414 842 1443 854 1429 842 l 1132 842 b 1026 749 1075 842 1040 831 l 1007 632 l 1006 621 l 1364 621 b 1386 597 1378 621 1386 611 l 1386 593 l 1364 461 b 1331 433 1361 446 1346 433 l 972 433 b 963 383 969 417 965 400 l 944 286 b 940 250 942 272 940 260 b 1017 192 940 206 964 192 l 1299 192 b 1322 168 1313 192 1322 182 l 1322 164 l 1299 35 b 1267 6 1296 17 1286 8 b 997 -12 1217 -1 1147 -12 b 764 60 911 -12 821 7 b 482 -12 688 10 593 -12 b 140 328 292 -12 140 100 b 150 433 140 361 143 396 l 179 599 b 669 1044 240 943 438 1044 b 903 969 760 1044 842 1021 b 1182 1044 972 1035 1069 1044 b 1446 1026 1332 1044 1399 1033 b 1471 1006 1463 1024 1471 1018 m 772 690 b 632 836 772 794 725 836 b 419 599 515 836 450 772 l 390 433 b 381 336 383 396 381 364 b 519 196 381 232 428 196 b 733 433 636 196 704 267 l 763 599 b 772 690 768 633 772 664 "},"œ":{"ha":1296,"x_min":0,"x_max":0,"o":"m 1318 517 b 1311 442 1318 493 1315 467 l 1297 361 b 1263 328 1293 340 1281 328 l 814 328 b 808 271 811 307 808 288 b 935 174 808 199 857 174 b 1204 186 1022 174 1147 181 l 1208 186 b 1231 168 1221 186 1231 181 l 1231 164 l 1211 58 b 1176 21 1207 36 1201 26 b 885 -12 1083 -1 1006 -12 b 679 71 801 -12 728 14 b 407 -12 614 15 524 -12 b 115 271 218 -12 115 107 b 122 349 115 296 117 322 l 140 446 b 551 807 188 697 321 807 b 775 724 650 807 725 776 b 1032 807 839 779 924 807 b 1318 517 1219 807 1318 679 m 1108 528 b 1000 626 1108 592 1078 626 b 840 467 906 626 861 563 l 1101 467 b 1108 528 1106 489 1108 510 m 619 510 b 518 615 619 582 586 615 b 364 446 438 615 386 568 l 346 349 b 339 282 342 324 339 301 b 442 178 339 210 372 178 b 594 349 532 178 574 236 l 613 446 b 619 510 617 469 619 492 "},"Ÿ":{"ha":901,"x_min":0,"x_max":0,"o":"m 1049 1015 b 1044 1001 1049 1011 1047 1006 l 750 521 b 642 414 711 457 678 428 l 574 28 b 540 0 571 13 556 0 l 358 0 b 336 24 344 0 336 10 l 336 28 l 404 414 b 331 521 372 428 347 457 l 206 1001 b 204 1007 206 1003 204 1006 b 232 1032 204 1021 217 1032 l 426 1032 b 450 1008 440 1032 447 1021 l 531 617 b 549 596 535 599 539 596 b 572 617 558 596 563 599 l 792 1008 b 824 1032 799 1021 810 1032 l 1029 1032 b 1049 1015 1042 1032 1049 1025 m 932 1265 l 910 1136 b 874 1108 907 1121 889 1108 l 743 1108 b 719 1132 729 1108 719 1118 l 719 1136 l 742 1265 b 776 1293 744 1281 761 1293 l 907 1293 b 932 1269 921 1293 932 1283 m 631 1265 l 608 1136 b 574 1108 606 1121 589 1108 l 443 1108 b 418 1132 429 1108 418 1118 l 418 1136 l 440 1265 b 476 1293 443 1281 461 1293 l 607 1293 b 631 1269 621 1293 631 1283 "},"˜":{"ha":690,"x_min":0,"x_max":0,"o":"m 804 1064 l 800 1036 b 610 867 782 911 721 867 b 507 900 582 867 532 881 l 456 940 b 404 965 435 957 419 965 b 365 928 386 965 372 961 l 360 901 b 335 878 357 886 349 878 l 236 878 b 218 894 225 878 218 883 b 219 901 218 896 219 899 l 225 928 b 418 1096 250 1049 304 1096 b 517 1064 446 1096 490 1083 l 569 1025 b 621 1000 590 1010 606 1000 b 660 1038 642 1000 654 1003 l 664 1064 b 690 1086 667 1079 676 1086 l 788 1086 b 804 1071 799 1086 804 1081 "},"–":{"ha":429,"x_min":0,"x_max":0,"o":"m 511 349 b 478 322 508 333 493 322 l 61 322 b 40 349 46 322 38 333 l 60 458 b 90 486 63 474 75 486 l 507 486 b 531 458 522 486 533 474 l 511 349 "},"—":{"ha":832,"x_min":0,"x_max":0,"o":"m 914 349 b 881 322 911 333 896 322 l 61 322 b 40 349 46 322 38 333 l 60 458 b 90 486 63 474 75 486 l 910 486 b 933 458 925 486 936 474 l 914 349 "},"‘":{"ha":351,"x_min":0,"x_max":0,"o":"m 504 1056 b 500 1039 504 1051 503 1046 l 371 735 b 339 708 363 715 353 708 l 174 708 b 160 719 164 708 160 713 b 164 735 160 724 161 729 l 322 1039 b 353 1065 332 1057 339 1065 l 493 1065 b 504 1056 501 1065 504 1061 "},"’":{"ha":351,"x_min":0,"x_max":0,"o":"m 504 1054 b 500 1039 504 1050 503 1044 l 342 735 b 311 708 332 717 325 708 l 171 708 b 160 718 163 708 160 713 b 164 735 160 722 161 728 l 293 1039 b 325 1065 301 1058 311 1065 l 490 1065 b 504 1054 500 1065 504 1061 "},"“":{"ha":657,"x_min":0,"x_max":0,"o":"m 810 1056 b 806 1039 810 1051 808 1046 l 676 735 b 644 708 668 715 658 708 l 479 708 b 465 719 469 708 465 713 b 469 735 465 724 467 729 l 626 1039 b 657 1065 636 1057 643 1065 l 799 1065 b 810 1056 807 1065 810 1061 m 504 1056 b 500 1039 504 1051 503 1046 l 371 735 b 339 708 363 715 353 708 l 174 708 b 160 719 164 708 160 713 b 164 735 160 724 161 729 l 322 1039 b 353 1065 332 1057 339 1065 l 493 1065 b 504 1056 501 1065 504 1061 "},"”":{"ha":657,"x_min":0,"x_max":0,"o":"m 810 1054 b 806 1039 810 1050 808 1044 l 647 735 b 617 708 638 717 631 708 l 476 708 b 465 718 468 708 465 713 b 469 735 465 722 467 728 l 599 1039 b 631 1065 607 1058 617 1065 l 796 1065 b 810 1054 806 1065 810 1061 m 504 1054 b 500 1039 504 1050 503 1044 l 343 735 b 313 708 333 717 326 708 l 171 708 b 160 718 163 708 160 713 b 164 735 160 722 161 728 l 294 1039 b 326 1065 303 1058 313 1065 l 490 1065 b 504 1054 500 1065 504 1061 "},"„":{"ha":657,"x_min":0,"x_max":0,"o":"m 676 215 b 672 203 676 211 675 207 l 483 -108 b 453 -136 474 -124 468 -136 l 331 -136 b 310 -118 318 -136 310 -129 b 313 -108 310 -115 311 -111 l 457 203 b 489 229 465 219 474 229 l 658 229 b 676 215 669 229 676 224 m 358 215 b 354 203 358 211 357 207 l 165 -108 b 135 -136 156 -124 150 -136 l 13 -136 b -8 -118 0 -136 -8 -129 b -6 -108 -8 -115 -7 -111 l 139 203 b 171 229 147 219 156 229 l 340 229 b 358 215 351 229 358 224 "},"•":{"ha":581,"x_min":0,"x_max":0,"o":"m 617 510 b 385 278 617 382 513 278 b 153 510 257 278 153 382 b 385 742 153 638 257 742 b 617 510 513 742 617 638 "},"…":{"ha":1065,"x_min":0,"x_max":0,"o":"m 1032 203 l 1001 28 b 968 0 999 13 983 0 l 804 0 b 782 22 790 0 782 10 l 782 28 l 813 203 b 844 229 815 218 829 229 l 1008 229 b 1032 207 1022 229 1032 221 m 679 203 l 649 28 b 615 0 646 13 631 0 l 451 0 b 429 22 438 0 429 10 l 429 28 l 460 203 b 492 229 463 218 476 229 l 656 229 b 679 207 669 229 679 221 m 326 203 l 296 28 b 263 0 293 13 278 0 l 99 0 b 76 22 85 0 76 10 l 76 28 l 107 203 b 139 229 110 218 124 229 l 303 229 b 326 207 317 229 326 221 "},"‹":{"ha":574,"x_min":0,"x_max":0,"o":"m 650 694 b 642 679 650 689 647 683 l 331 397 l 526 115 b 529 106 529 113 529 108 b 507 88 529 96 519 88 l 356 88 b 317 104 335 88 325 92 l 140 361 b 126 401 131 375 126 389 b 146 443 126 418 135 432 l 404 690 b 449 707 417 703 428 707 l 633 707 b 650 694 644 707 650 701 "},"›":{"ha":574,"x_min":0,"x_max":0,"o":"m 594 393 b 575 351 594 376 586 363 l 317 104 b 272 88 304 92 293 88 l 88 88 b 71 100 76 88 71 93 b 79 115 71 106 74 111 l 390 397 l 194 679 b 192 689 192 682 192 686 b 214 707 192 699 201 707 l 365 707 b 404 690 386 707 396 703 l 581 433 b 594 393 590 419 594 406 "},"€":{"ha":896,"x_min":0,"x_max":0,"o":"m 986 989 l 961 854 b 931 826 958 836 947 826 l 926 826 b 736 838 874 829 813 838 b 528 678 639 838 565 794 l 824 678 b 844 661 838 678 844 671 b 842 650 844 657 843 654 l 814 589 b 781 561 806 571 796 561 l 501 561 l 486 475 l 740 475 b 758 460 750 475 758 468 b 757 454 758 458 758 456 l 721 371 b 699 358 718 363 708 358 l 471 358 l 471 351 l 471 338 b 624 194 471 221 538 194 b 817 206 700 194 763 203 l 821 206 b 844 185 835 206 844 199 b 843 178 844 183 843 181 l 818 43 b 782 11 814 24 803 17 b 585 -12 751 1 682 -12 b 231 336 404 -12 231 93 l 231 351 l 231 358 l 174 358 b 151 381 160 358 151 368 l 151 386 l 163 447 b 194 475 165 463 179 475 l 243 475 l 258 561 l 210 561 b 188 583 196 561 188 571 l 188 589 l 199 650 b 231 678 201 665 215 678 l 282 678 b 763 1044 347 968 564 1044 b 960 1019 860 1044 932 1029 b 986 996 975 1014 986 1010 "}},"familyName":"Neo Sans W1G","ascender":1440,"descender":-397,"underlinePosition":-54,"underlineThickness":111,"boundingBox":{"yMin":-300,"xMin":-126,"yMax":1406,"xMax":1935},"resolution":1000,"original_font_information":{"format":0,"copyright":"Copyright 2004, 2010 Monotype Imaging Inc. All rights reserved. Neo Sans is designed by Sebastian Lester.","fontFamily":"Neo Sans W1G","fontSubfamily":"Regular","uniqueID":"fb4a7211494de0950a8ea98d7ea00241","fullName":"Neo Sans W1G","version":"Version 1.000","postScriptName":"NeoSansW1G-BoldItalic","licenceURL":"https://fonts.adobe.com/eulas/00000000000000007735bb45"},"cssFontWeight":"normal","cssFontStyle":"normal"};
    
    function createResultPageObserver(){
        const callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === "childList") {
                    let el = mutation.addedNodes[0];
                    if (el && /result.overlay/i.test(el.className)){
                        observer.disconnect();
                        event.trigger('end of game');
                        return;

                    }
                }
            }
        };

        const targetNode = document.body;
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        return observer;
    }

    class make3DCounter {

        constructor(fallbackCounter){
            this.appendTHREEJSscript()
                .then(()=>{
                //extrudeIt(window.THREE);
                if (document.getElementById('3D_Streak_Counter')) {
                    return;
                }
                this.init();
                this.animate();
            }).catch((e)=>{
                console.log(e);
                alert("AWWWWWW GEEEEEZZZZZ the 3D counter didn't load for some unkown reason!");
                if (fallbackCounter)
                    fallbackCounter();
            });

            unsafeWindow.cod3 = this;

            this.events = [];

        }

        init(){
            unsafeWindow.explode = this.explodeAnimation.bind(this);

            let _this = this;

            this.gameInfo = gameInfo;

            this.THREE = unsafeWindow.THREE;

            this.THREE.Cache.enabled = true;

            this.FontLoader = unsafeWindow.THREE.FontLoader;
            this.font = undefined;

            this.TextGeometry = unsafeWindow.THREE.TextGeometry;

            this.rayMeshes = [];

            this.mainScoreNum = this.gameInfo.score + ''; //app.getCurStreak().num + '';

            this.mainScore = null;

            this.resizeOldWH = {
               width: unsafeWindow.innerWidth,
               height: unsafeWindow.innerHeight 
            };

            this.targetRotationY = 0;
            this.targetRotationX = 0;

            this.container = document.createElement( 'div' );
            this.container.id = '3D_Streak_Counter';

            this.appendToDOM();

            this.HSLColor = {
                h: 0.107, /*0.1 == gold */
                s: 0.5,
                l: 1
            };

            this.renderer = new this.THREE.WebGLRenderer( { antialias: true, alpha: true, } );
            this.renderer.setPixelRatio( unsafeWindow.devicePixelRatio );
            this.renderer.setSize(unsafeWindow.innerWidth, unsafeWindow.innerHeight);

            // CAMERA

            this.makeCamera();

            // SCENE

            this.scene = new this.THREE.Scene();
            this.scene.background = null; //new THREE.Color( 0x000000 );


            this.dirLight = new this.THREE.DirectionalLight( 0xffffff, 1 );
            this.dirLight.position.set( 0, 350, 0 ); //.normalize();
            this.scene.add( this.dirLight );

            this.materials = [
                new this.THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
                new this.THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
            ];

            this.loadFont();

            this.makeNormalState1();

            // LINE FOR DRAWING ON SCREEN
            this.makeLine();

            // RENDERER

            this.container.appendChild( this.renderer.domElement );
            this.container.style.position = 'absolute';
            this.container.style.top = '0px';
            this.container.style.left = '0px';
            this.container.style.zIndex = '9999999';
            this.container.style.userSelect = 'none';
            this.container.style.display = 'none';

            // EVENTS

            this.makeRayEvents();

            this.container.style.touchAction = 'none';

            let resizefn = (c)=> {
                let _this = this;
                removeEventListener('resize', resizefn);

                setTimeout(function(){
                    _this.resetScene();
                },1_000);
            };

            addEventListener('resize', resizefn);

            this.events.push(unsafeWindow._evt.on('update streak', (obj)=>{
                
                obj._score = this.mainScoreNum;

                this.makeState2(obj, this.mainScoreNum);

                let num = obj.score;
                
               // if (fetchWasModified === false){
               //     alert("window.fetch was not modified. Refreshing the page should fix the problem.")
               // }

                this.makeGuessText(obj);

                this.mainScoreNum = num + '';

            }));

            this.events.push(unsafeWindow._evt.on('wait for end of round', (obj)=>{
                if (this.guessText) {
                    if (this?.guessText?.isCorrectCountry === false) {
                        this.clearRotateScoreContinuous();
                        this._updateAnimation();
                    }

                    this?.guessText?.remove();

                    this.makeNormalState1();
                }
            }));

            this.events.push(unsafeWindow._evt.on('end of game', (obj)=>{
                if (this.guessText){
                    if (this?.guessText?.isCorrectCountry === false){
                        this.clearRotateScoreContinuous();
                        this._updateAnimation();
                    }

                    setTimeout(this?.guessText?.remove(), 1_000);;
                    
                    this.makeNormalState1();

                }
            }));
            
            this.events.push(unsafeWindow._evt.on('reload counter', (obj)=>{
                this.unload();
                _3dCounter = new make3DCounter(); 
            }));

            this.resetLocalStorage();
        }

        makeCamera(){
            const frustumSize = unsafeWindow.innerHeight;
            const aspect = unsafeWindow.innerWidth / unsafeWindow.innerHeight;

            this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2,
                                                       frustumSize * aspect / 2,
                                                       frustumSize / 2,
                                                       frustumSize / - 2,
                                                       -1_000,
                                                       2_000 );

            this.camera.position.set(0, 0, 200);

            this.cameraTarget = new this.THREE.Vector3( 0, 0, 0 );
        }

        appendTODOMInterval = null;

        appendToDOM(){
            this.appendTODOMInterval = setInterval(()=>{
                let el = true; //document.querySelector('[data-qa="undo-move"]');
                let isDuels = true; ///geoguessr.com.(duels)/i.test(location.href);

                if (this.unloaded){
                    clearInterval(this.appendTODOMInterval);
                    return;
                }

                if (!el || !isDuels){
                    this.container.style.display = 'none';
                } else {
                    if (this.container.style.display === 'none'){
                        document.body.appendChild(this.container);
                        this.container.style.display = '';
                    }
                }
            }, 1_000);
        }

        makeRayEvents(){

            let _this = this;
            this.raycaster = new this.THREE.Raycaster();

            this.INTERSECTED = null;

            this.pointer = new this.THREE.Vector2();

            document.body.addEventListener( 'mousemove', onPointerMove );

            function onPointerMove( event ) {
                   if (event.ctrlKey){
                       // DRAW A LINE ON SCREEN
                
                        let p = _this.screenToWorldCoords(event.clientX,event.clientY);
                
                        _this.linePoints.push(new _this.THREE.Vector3(p.x, p.y, 0));
                
                       _this.line.geometry.setFromPoints(_this.linePoints);
                
                    }

                _this.pointer.x = (event.clientX / unsafeWindow.innerWidth) * 2 - 1;
                _this.pointer.y = -(event.clientY/ unsafeWindow.innerHeight) * 2 + 1;
            };
        }

        setRayEvents(obj){
            let _this = this;

            this.mouseIsDown = null;
            this.groupIsDragging = null;

            document.body.addEventListener( 'mousedown', onMouseDown );

            obj.group.removeRayEvents = function(){

                document.body.removeEventListener( 'mousedown', onMouseDown );

            }

            let el = null; 
            let rect = null;
            let textBBox = null;
            let md = {x:null, y:null};
            let lastX = 0;
            let lastY = 0;

            this.container.style.pointerEvents = 'none';

            function onPointerMove( event ) {
                if (_this.groupCanDrag || _this.groupIsDragging){
                    _this.groupCanDrag = false;

                    _this.groupIsDragging = true;

                    let _x = md._x + (event.clientX - md.x);
                    let _y = md._y - (event.clientY - md.y);

                   obj.group.position.x = _x ;
                   obj.group.position.y = _y ;

                   obj.group.spotLight.target._trackText();
                   obj.group.spotLight._trackText();

                }
            }

            function onMouseDown(event){
                _this.mouseIsDown = true;
                
                // reset line
                _this.linePoints = [];
                _this.line.geometry.setFromPoints([]);

                if (obj.group.mouseOver){
                    document.body.addEventListener('mousemove', onPointerMove);

                    _this.triggerMouseEvent(document.body, 'mouseup');

                    document.body.addEventListener('mouseup', mup);

                    _this.container.style.pointerEvents = '';

                    _this.groupCanDrag = true;

                    _this.spinEvents(event);
                    _this.flickEvents(event);

                    md.x = event.clientX;
                    md.y = event.clientY;
                    md._x = obj.group.position.x;
                    md._y = obj.group.position.y;

                }

                function mup(event){
                    _this.container.style.pointerEvents = 'none';

                    document.body.removeEventListener('mouseup', mup);
                    document.body.removeEventListener( 'mousemove', onPointerMove );

                    if (_this.groupIsDragging)  {
                        obj.setXY(obj.group.position.x, obj.group.position.y);
                    }

                    _this.mouseIsDown = false;
                    _this.groupCanDrag = false;
                    _this.groupIsDragging = false;
                }
            }

        }

        rotateScoreContinuous(){
            let hue = this.HSLColor.h;

            this.rotateScoreContinuousTimer = setInterval(()=>{
                hue += 0.01;

                this.mainScore.spotLight.color.setHSL(hue % 1 , this.HSLColor.l, this.HSLColor.s);

                this.targetRotationY += 0.055;
            }, 50);
        }

        rotateScoreContinuousTimer = null;

        clearRotateScoreContinuous(){
            clearInterval(this.rotateScoreContinuousTimer);
            this.mainScore.spotLight.color.setHSL( this.HSLColor.h , this.HSLColor.l, this.HSLColor.s );
        }

        appendTHREEJSscript(){
            return new Promise(function(callConstructor, didntload){
                let script = document.createElement('script');
                //script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.js';
                script.addEventListener('load', callConstructor);
                script.addEventListener('error', didntload);
                document.body.appendChild(script);
            });
        }

        loadFont(fontName, fontWeight) {
            this.font = new this.THREE.Font(neoSans_Italic);
        }

        makeLine(){

            this.line_clock = new this.THREE.Clock();

            this.line_uniformData = {
                u_time: {
                    type: 'f',
                    value: this.line_clock.getElapsedTime(),
                },
            };

            this.lineShaderMaterial = new this.THREE.ShaderMaterial({
                // wireframe: true,
                linewidth: 4,
                // wireframe: true,
                uniforms: this.line_uniformData,
                vertexShader: `
                  // chandler
                  uniform float u_time;
                  varying vec4 pos;

                  void main()	{
                      vec4 result;

                      result = vec4(position.x+ (sin(position.y + u_time)*6.0), position.y + (cos(position.x + u_time)*5.0), position.z, 1.0);

                      gl_Position = projectionMatrix
                          * modelViewMatrix
                          * result;

                  }
              `,
                fragmentShader: `
              // chandler
              varying vec4 pos;
              uniform float u_time;
              void main() {

                gl_FragColor = vec4(abs(acos(pos.x + u_time)),abs( atan(pos.y + u_time)), abs(asin(pos.y +u_time)), 1.0);

              }
              `,
            });

            this.linegeometry = new THREE.BufferGeometry();
            this.line = new THREE.Line( this.linegeometry, this.lineShaderMaterial );
            this.linePoints = [];

           this.scene.add( this.line );
        }

        createText(text, textStyle, dontAddGroupToScene, doRotateAni) {
            const _this = this;
            let tarray = Array.from(text);

            return new function(){
                let __this = this;

                this.group = new _this.THREE.Group();

                this.group._width = 0;
                this.group._height = 0;
                this.group._spaces = 0;

                if (!dontAddGroupToScene) _this.scene.add( this.group );

                __this.textArray = [];

                tarray.forEach(function(letter, idx) {
                    if (letter == ' '){
                        __this.group._spaces += 1;
                    }
                    
                    const textGeo = new _this.TextGeometry( letter, {
                        font: textStyle.font,
                        size: textStyle.size ,
                        height: textStyle.size < 20? textStyle.size * 0.07: textStyle.size*0.25,
                        curveSegments: textStyle.curveSegments * 4,
                        bevelThickness: textStyle.bevelThickness,
                        bevelSize: 15 * (textStyle.size / unsafeWindow.innerHeight), //_this.bevelSize * (unsafeWindow.innerHeighth),
                        bevelEnabled: textStyle.bevelEnabled,
                    } );

                    textGeo.letter = letter;

                    __this.textArray.push(textGeo);

                    textGeo.attributes.position._array = new Float32Array(textGeo.attributes.position.array);

                    textGeo.computeBoundingBox();

                    let centerOffsetX = -0.5 * ( textGeo.boundingBox.max.x + textGeo.boundingBox.min.x );
                    let centerOffsetY = -0.5 * ( textGeo.boundingBox.max.y + textGeo.boundingBox.min.y );

                    let xy = new _this.THREE.Vector2();
                    _this.renderer.getSize(xy);

                    const materials = [
                        new _this.THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
                        new _this.THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
                    ];

                    const textMesh = new _this.THREE.Mesh( textGeo, materials );

                    textGeo._textMesh = textMesh;

                    textMesh._offSetX = centerOffsetX;
                    textMesh._offSetY = centerOffsetY;

                    textMesh.position.x = textStyle.size/2; //-50 + 1 * 40 * idx - 2 * idx * idx; //centerOffsetX;

                    const code = letter.charCodeAt(0);
                    textMesh.position.y = (code > 64 && code < 91) || (code > 96 && code < 123) || (code > 32 && code < 65) ||(letter >= '0' && letter <= '9') ? centerOffsetY : -10;

                    textMesh.position._y =  textMesh.position.y;//// (code > 64 && code < 91) || (code > 96 && code < 123) ? centerOffsetY : -10;

                    textMesh.position.z = 0;//-(this.textStyle.size * 0.2 * 0.5);

                    textMesh.rotation.x = 0;
                    textMesh.rotation.y = 0;//Math.PI * 2;
                     
                    textMesh._width = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

                    if (textMesh._width == -Infinity){
                        textMesh._width = 0;
                    }

                    textMesh._height = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
                    if (textMesh._height == -Infinity){
                        textMesh._height = 0;
                    }

                    _this.rayMeshes.push(textMesh);

                    textMesh._group = __this.group;

                    __this.group.add(textMesh );
                    __this.group._width  += textMesh._width; 
                    __this.group._height +=  textMesh._height;

                });

                let spaceWidth = this.group._width / tarray.length * 0.9;
                let offsetHeight = this.group._height / tarray.length * 0.9;

                this.group._width += this.group._spaces * spaceWidth;
                this.group._width += (this.group.children.length * (spaceWidth * 0.10));

                let x = -(this.group._width / 2) *1.1;

                this.group.children.forEach(function(letter, idx){
                    if (letter._width == 0){
                        letter._width = spaceWidth;
                    }

                    if (letter._height == 0){
                        letter._height = offsetHeight;
                    }
                    letter.position.x = x;
                    x += letter._width + (letter._width * .10);
                })

            }
        }

        makeMainScore(stateObj, dontAddGroupToScene){

            let textStyle = {
                size : stateObj.size, //100, //+localStorage['3dTextSize'] || 200,
                height: null,
                curveSegments: 4,
                bevelThickness : 2,
                bevelSize : 1.5,
                bevelEnabled : true,
                font : this.font,
                //fontName : 'helvetiker',//'droid/droid_sans';//'optimer', // helvetiker, optimer, gentilis, droid sans, droid serif
                // fontWeight : 'bold', // normal bold
            };

            let score = stateObj.score !== undefined? stateObj.score: this.mainScoreNum;
            
            this.mainScore = this.createText(this.mainScoreNum, textStyle, dontAddGroupToScene);//"You guessed 'United States', unfortunately it was Russian Federation", textStyle);

            this.mainScore.textStyle = textStyle;

            this.mainScore.stateObj = {...stateObj};
            this.mainScore.rayName = 'mainScoreState'+stateObj.state;
            this.mainScore.setXY = stateObj.setXY;

            this.mainScore.remove = ()=>{
                this.scene.remove(this.mainScore.group);
                this.scene.remove(this.mainScore.spotLight);
                this.scene.remove(this.mainScore.spotLight.target);

                this.mainScore.group.removeRayEvents();

                for (let n =this.rayMeshes.length-1; n > 0 ; n--){
                    if (this.rayMeshes[n]._group === this.mainScore.group){
                        this.rayMeshes.splice(n, 1);
                       // this.rayMeshes = this.rayMeshes.splice(n, 1);
                    }
                }

                if (this.mainScore._particlePoints){
                    this.scene.remove( this.mainScore._particlePoints);
                }

                this.mainScore = null;
            };

            this.mainScore.spotLight =new this.THREE.SpotLight(
                /*color*/ 0xffffff,
                /*intensity*/ 1.0,
                /*distance*/ 0.0,
                /*angle*/ stateObj.spotLightAngle,
                /*penumbra*/ 1.0,
                /*decay*/ 1.0 );

            this.mainScore.spotLight.position.set(this.mainScore.group._width / 2, -120, textStyle.size * 1.5);

            this.mainScore.spotLight.color.setHSL( this.HSLColor.h , this.HSLColor.l, this.HSLColor.s );

            this.scene.add( this.mainScore.spotLight );
            this.scene.add( this.mainScore.spotLight.target );

            this.mainScore.spotLight.target._trackText = ()=>{
                this.mainScore.spotLight.target.position.x = this.mainScore.group.position.x;
                this.mainScore.spotLight.target.position.y = this.mainScore.group.position.y;
                this.mainScore.spotLight.target.position.z = this.mainScore.group.position.z;
            };

            this.mainScore.spotLight._trackText = () => {
                this.mainScore.spotLight.position.x = this.mainScore.group.position.x;
                this.mainScore.spotLight.position.y = this.mainScore.group.position.y;
                this.mainScore.spotLight.position.z = 200 * 1.5; //textStyle.size * 4.5;
            };

            this.mainScore.group.position.x = stateObj.x;
            this.mainScore.group.position.y = stateObj.y;

            this.mainScore.spotLight.target._trackText();

            this.mainScore.spotLight._trackText();

            this.mainScore.group.spotLight = this.mainScore.spotLight;

            this.setRayEvents(this.mainScore);

            if (!this.gameInfo.particlesDisabled){
                this.makeParticles(this.mainScore);
            }
        }
        
        makeNormalState1(){
            this.targetRotationY = 0;
            this.targetRotationX = 0;

            this.makeState1("don't add to scene");

            this.smoothLandingAnimation(this.mainScore.group, this.mainScore.spotLight, 5, "add to scene");
        }

        makeState1(dontAddGroupToScene){
            let _this = this;
            this.mainScore?.remove();

            let state1_Obj = {};

            state1_Obj.state = 1;

            let _size = this?.gameInfo?.state1Size === undefined? 100: this?.gameInfo?.state1Size;
            let spotLightAngle = this?.gameInfo?.state1SpotLightAngle || (Math.PI/2.5);

            state1_Obj.size = _size <= 0? 0: _size;
            state1_Obj.spotLightAngle = +spotLightAngle;
            state1_Obj.x = this?.gameInfo?.state1XY?.x || 10;
            state1_Obj.y = this?.gameInfo?.state1XY?.y || 10;
            
            if (state1_Obj.x > unsafeWindow.innerWidth/2 || state1_Obj.x < -(unsafeWindow.innerWidth/2)){
                state1_Obj.x = 0;
            }

            if (state1_Obj.y > unsafeWindow.innerHeight/2 || state1_Obj.y < -(unsafeWindow.innerHeight/2)){
                state1_Obj.y = 0;
            }
            
            state1_Obj._obj = state1_Obj;

            state1_Obj.setXY = function(x, y) {
                _this.gameInfo.state1XY = {x, y};
                this.stateObj.x = x;
                this.stateObj.y = y;

                localStorage.setItem("d3StreakCounter",JSON.stringify(this.gameInfo));
            }

            this.makeMainScore(state1_Obj, dontAddGroupToScene);
        }

        makeState2(obj, prevScore){

            this.mainScore?.remove();

            let state2_Obj = {};

            state2_Obj.state = 2;

            let _size = this?.gameInfo?.state2Size === undefined? 50: this?.gameInfo?.state2Size;

            state2_Obj.size = _size <= 0? 0: _size;
            state2_Obj.spotLightAngle = +this?.gameInfo?.state2SpotLightAngle == undefined ? (Math.PI/4.5) : +this?.gameInfo?.state2SpotLightAngle;
            state2_Obj.x = this?.gameInfo?.state2XY?.x || 10;
            state2_Obj.y = this?.gameInfo?.state2XY?.y || 10;

            if (state2_Obj.x > unsafeWindow.innerWidth/2 || state2_Obj.x < -(unsafeWindow.innerWidth/2)){
                state2_Obj.x = 0;
            }

            if (state2_Obj.y > unsafeWindow.innerHeight/2 || state2_Obj.y < -(unsafeWindow.innerHeight/2)){
                state2_Obj.y = 0;
            }

            state2_Obj.setXY = (x, y) =>{
                this.gameInfo.state2XY = {x, y};
                localStorage.setItem("d3StreakCounter",JSON.stringify(this.gameInfo));
            }

            if (obj.curRound.isCorrectCountry == false){
                state2_Obj.score = prevScore;
                this.makeMainScore(state2_Obj);
                this.rotateScoreContinuous();
                //this.smoothLandingAnimation(this.mainScore.group, this.mainScore.spotLight, 100);
            } else{

                state2_Obj.score = obj.score;

                setTimeout(()=>{
                    this._updateAnimation(state2_Obj);
                    this.smoothLandingAnimation(this.mainScore.group, this.mainScore.spotLight, 100);
                }, 100);
                
            }
        }
        
        rotateJam(textArray){
            let t = 0;
            let l = 1500 /*milliseconds*/ / textArray.length;
            let PI2 = Math.PI * 2;

            textArray.forEach((letter)=>{
                let textMesh = letter._textMesh;
                
                if (true){
                    let pos = textMesh.position;
                    let rot = textMesh.rotation;
                    let rotNum = 0;

                    setTimeout(()=>{
                        let inter = setInterval(()=>{
                             rotNum += 0.01;
                             rot.y = this.easeOutCubic(rotNum) * PI2; 

                            if (rot.y > PI2){
                                rot.y = 0;
                                clearInterval(inter);
                            }
                        }, 10);
                    }, t);

                    t += l;

                }
            });
        }

      //  letterJam(textArray){
      //      let t = 0;

      //      textArray.forEach((letter)=>{
      //          let textMesh = letter._textMesh;
      //          if (true){
      //              let pos = textMesh.position;
      //              let rot = textMesh.rotation;
      //              let rotNum = 1;

      //              setTimeout(()=>{
      //                  let inter = setInterval(()=>{
      //                     if (pos.y - pos._y > 2){
      //                         pos.y = pos._y;
      //                         return;
      //                     }

      //                     pos.y += 0.3;
      //                  }, 10);
      //              }, t + Math.random() * 2000);

      //              t += 30;
      //          }
      //      });
      //  }


        smoothLandingAnimation(group, spotLight, offSetY, addToScene){
            const zy = group.position.y + offSetY;
            let zi = 0;

            group.position.y = zy

            if (addToScene) this.scene.add(group); 
            //spotLight.intensity = 0.7;

            let p = setInterval(()=>{
                         // Ease down animation because it looks good.
                         let ease = this.easeOutCubic(zi) ;
                      
                         group.position.y = zy - (ease * offSetY);

                         spotLight.target.position.y = group.position.y;
                         spotLight.position.y = group.position.y;
             //            spotLight.intensity = 0.8 + (ease * 0.2);

                         if (zi >= 1) {
                             clearInterval(p);
                             return;
                         }

                         zi += 0.01; 
                     }, 10);
        }
        
        easeOutCubic(x) {
            return 1 - Math.pow(1 - x, 3);
        }

        makeGuessText(obj){
            let _this = this;

            let textStyle = {
                size : +this.gameInfo.guessFontSize || 30, 
                height: null,
                curveSegments: 4,
                bevelThickness : 2,
                bevelSize : 1.5,
                bevelEnabled : true,
                font : this.font,
            };
 
            let text = null;

            let pinIdx = null;
            let spawnIdx = null;
            let pin = '';
            let spawn = '';

            if (obj.curRound.isCorrectCountry){

                text = this.gameInfo.guessCorrectText || "YAY! $2!"; //"Message not set by player.";

            } else {

                text = this.gameInfo.guessIncorrectText || "Spawn: $2. You clicked on: $1. Old score: $3"; //"Message not set by player.";

            }

            pin = obj?.curRound?.pinLocation?.country?.country_name || 'Nope';
            spawn = obj?.curRound?.spawnLocation?.country?.country_name || 'Uh-Uh';

            text = text.replace(/\$1/, pin).replace(/\$2/, spawn).replace(/\$3/, obj._score)

            pinIdx = text.indexOf(pin);
            spawnIdx = text.indexOf(spawn);

            this.guessText = this.createText(text, textStyle, false);//"You guessed 'United States', unfortunately it was Russian Federation", textStyle);
          
            if (obj.guessAnimation){
               if (obj.curRound.isCorrectCountry){
                   this.rotateJam(this.guessText.textArray);
               } else {
                   this.rotateJam(this.guessText.textArray);
                   //this.letterJam(this.guessText.textArray);
               }
            }

            this.guessText.textStyle = textStyle;
            this.guessText.stateObj = {...obj};
            this.guessText.rayName = 'guessText';

            this.guessText.setXY = function(x, y){

                 _this.gameInfo.answerTextXY = {x, y};

                localStorage.setItem("d3StreakCounter",JSON.stringify(_this.gameInfo));
            }

            this.guessText.isCorrectCountry = obj.curRound.isCorrectCountry;

            if (obj.curRound.isCorrectCountry === false){
                if (pinIdx > 0){
                    for (let n = pinIdx; n < pinIdx + pin.length; n++){
                        this.guessText.group.children[n].material[0].color.r = 1;
                        this.guessText.group.children[n].material[0].color.g = 0;
                        this.guessText.group.children[n].material[0].color.b = 0;
                    }
                }
            }

            if (spawnIdx > 0){
                for (let n = spawnIdx; n < spawnIdx + spawn.length; n++){
                    this.guessText.group.children[n].material[0].color.r = 0;
                }
            }


            this.guessText.remove = ()=>{
                this.scene.remove(this.guessText.group);
                this.scene.remove(this.guessText.spotLight);
                this.scene.remove(this.guessText.spotLight.target);

                this.guessText.group.removeRayEvents();

                for (let n =this.rayMeshes.length-1; n > 0 ; n--){
                    if (this.rayMeshes[n]._group === this.guessText.group){
                        this.rayMeshes.splice(n, 1);
                        // this.rayMeshes = this.rayMeshes.splice(n, 1);
                    }
                }

                this.guessText = null;
            };

            this.guessText.spotLight = new this.THREE.SpotLight(
                /*color*/ 0xffffff,
                /*intensity*/ 1.0,
                /*distance*/ 0.0,
                /*angle*/ +this.gameInfo.guessSpotLightAngle || Math.PI/2.5,
                /*penumbra*/ 1.0,
                /*decay*/ 1.0 );
            this.guessText.spotLight.position.set(this.guessText.group._width / 2, -120, textStyle.size * 4.5);

            this.guessText.spotLight.color.setHSL( this.HSLColor.h , this.HSLColor.l, this.HSLColor.s );

            this.scene.add( this.guessText.spotLight );

            this.guessText.spotLight.target._trackText = ()=>{
                this.guessText.spotLight.target.position.x = this.guessText.group.position.x;
                this.guessText.spotLight.target.position.y = this.guessText.group.position.y;
                this.guessText.spotLight.target.position.z = this.guessText.group.position.z;
            };

            this.guessText.spotLight._trackText = () => {
                this.guessText.spotLight.position.x = this.guessText.group.position.x;
                this.guessText.spotLight.position.y = this.guessText.group.position.y + 120;
                this.guessText.spotLight.position.z = unsafeWindow.innerWidth; //textStyle.size * 4.5; //textStyle.size * 4.5;
            };

            this.scene.add( this.guessText.spotLight.target);

            let x = this.gameInfo?.answerTextXY?.x || 10;
            let y = this.gameInfo?.answerTextXY?.y || 10;

            if (x > unsafeWindow.innerWidth/2 || x < -(unsafeWindow.innerWidth/2)){
                x = 0;
            }

            if (y > unsafeWindow.innerHeight/2 || y < -(unsafeWindow.innerHeight/2)){
                y = 0;
            }

            this.guessText.group.position.x = x;//_this.pointer.x * (_this.w/2) ;
            this.guessText.group.position.y = y;//_this.pointer.y * (_this.h/2) ;

            this.guessText.spotLight.target._trackText();

            this.guessText.spotLight._trackText();

            this.guessText.group.spotLight = this.guessText.spotLight;

            this.setRayEvents(this.guessText);
            //setTimeout(this.guessText.remove, 5_000);
        }

        refreshMainScore(stateObj) {
            this?.mainScore?.remove();
            this.makeMainScore(stateObj || this.state1_Obj);
        }

        resetTextPos(){

            let fn = Math.abs(this.targetRotationX) % (Math.PI * 2) >= 3.14? Math.ceil: Math.floor;
            fn = this.targetRotationX < 0?
                fn === Math.ceil ? Math.floor : Math.ceil
            : fn;
            this.targetRotationX = fn( this.targetRotationX / (Math.PI * 2)) * 2 * Math.PI;

            fn = Math.abs(this.targetRotationY) % (Math.PI * 2) >= 3.14? Math.ceil: Math.floor;
            fn = this.targetRotationY < 0?
                fn === Math.ceil ? Math.floor : Math.ceil
            : fn;
            this.targetRotationY = fn( this.targetRotationY/ (Math.PI * 2)) * 2 * Math.PI;
        }

        async _updateAnimation(stateObj){
            this.targetRotationY  = 0;
            this.targetRotationX = 0;
            this._flickAnimation();

            if (stateObj){
                this.refreshMainScore(stateObj);
            }
            
            if (this.mainScoreNum == '0') return;

            if (this.gameInfo?.doExplodeScore){
                let p = await this.explodeAnimation();
            }
        }

        _flickAnimation(){
            // Updating round number.
            let fn = Math.abs(this.targetRotationX) % (Math.PI * 2) >= 3.14? Math.ceil: Math.floor;
            fn = this.targetRotationX < 0?
                fn === Math.ceil? Math.floor : Math.ceil
            : fn;

            this.targetRotationX = fn( this.targetRotationX/ (Math.PI * 2)) * 2 * Math.PI + (Math.PI * 2) * 2;

            fn = Math.abs(this.targetRotationY) % (Math.PI * 2) >= 3.14? Math.ceil: Math.floor;
            fn = this.targetRotationY < 0?
                fn === Math.ceil? Math.floor : Math.ceil
            : fn;
            this.targetRotationY = fn( this.targetRotationY/ (Math.PI * 2)) * 2 * Math.PI + (Math.PI * 2) *1;
            return true;
        }

        spinEvents(mainEvent){
            let _this = this;

            let resetTimer = 0;

            let targetRotationOnPointerDown = 0;
            let targetRotationOnPointerDownX = 0;

            let pointerXOnPointerDown = 0;
            let pointerYOnPointerDown = 0;

            let onPointerDown =  function () {

                if ( mainEvent.isPrimary === false ) return;

                clearTimeout(resetTimer);

                pointerXOnPointerDown = mainEvent.clientX - unsafeWindow.innerWidth/2;
                pointerYOnPointerDown = mainEvent.clientY - unsafeWindow.innerHeight/2;

                targetRotationOnPointerDown = _this.targetRotationY;
                targetRotationOnPointerDownX = _this.targetRotationX;

                document.addEventListener( 'pointermove', onPointerMove );
                document.addEventListener( 'pointerup', onPointerUp );
            };

            let onPointerMove = function ( event ) {

                if ( event.isPrimary === false ) return;

                let pointerX = event.clientX - unsafeWindow.innerWidth/2;
                let pointerY = event.clientY - unsafeWindow.innerHeight/2;

                if (pointerX != pointerXOnPointerDown || pointerY != pointerYOnPointerDown) {
                    _this.mouseIsMoving = true;
                }

                _this.targetRotationY = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;
                _this.targetRotationX = targetRotationOnPointerDownX + ( pointerY - pointerYOnPointerDown) * 0.02;
            };

            let onPointerUp = function(event) {

                if ( event.isPrimary === false ) return;

                let pointerX = event.clientX - unsafeWindow.innerWidth/2;
                let pointerY = event.clientY - unsafeWindow.innerHeight/2;

                document.removeEventListener( 'pointermove', onPointerMove );
                document.removeEventListener( 'pointerup', onPointerUp );
                resetTimer = setTimeout(_this.resetTextPos.bind(_this), 1_000);
                setTimeout(()=> _this.mouseIsMoving = false , 500);
            };

            onPointerDown();
        }

        flickEvents (mainEvent){
            let _this = this;


            let pointerXOnPointerDown = mainEvent.clientX - unsafeWindow.innerWidth/2;
            let pointerYOnPointerDown = mainEvent.clientY - unsafeWindow.innerHeight/2;


            let onPointerUp = function(event) {

                if ( event.isPrimary === false ) return;

                let pointerX = event.clientX - unsafeWindow.innerWidth/2;
                let pointerY = event.clientY - unsafeWindow.innerHeight/2;

                if (pointerX === pointerXOnPointerDown || pointerY == pointerYOnPointerDown) {
                    _this._flickAnimation();
                    _this._flickAnimation();
                }

                document.removeEventListener( 'pointerup', onPointerUp );
            };

            document.addEventListener( 'pointerup', onPointerUp );
        }

        screenToWorldCoords(X,Y){
            // used for line
            let w = unsafeWindow.innerWidth;
            let h = unsafeWindow.innerHeight;

            let ret = {
                x: ((X / w) * 2 - 1) * (w/2),
                y: (-(Y /h) * 2 + 1) * (h/2),
            };

            return ret;
        }

        unload() {
            if (this.container.parentElement)
                this.container.parentElement.removeChild(this.container);
            if (this.clonedEl){
                this.clonedEl.parentElement.removeChild(this.clonedEl);
            }

            this.events.forEach((evt)=>{
                unsafeWindow._evt.off(evt);
            });
            
            this.unloaded = true;
        }

        triggerMouseEvent (node, eventType) {
            //https://stackoverflow.com/questions/24025165/simulating-a-mousedown-click-mouseup-sequence-in-tampermonkey
            var clickEvent = document.createEvent ('MouseEvents');
            clickEvent.initEvent (eventType, true, true);
            node.dispatchEvent (clickEvent);
        }

        async explodeAnimation (){
            // This animation causes stuttering, the promises help most of the time.
            return new Promise(async (res,b) =>{
                let textGeo = this.mainScore.textGeo;

                let attribPosArray = textGeo.attributes.position.array;
                let len = attribPosArray.length;
                let original = new Float32Array(attribPosArray);
                let exploded = new Float32Array(attribPosArray.length);
                let percentFinished = 0;
                let incrementer = 0.19;
                let frames = 0;
                let _this = this;

                let explode = async ()=>{
                    return new Promise(function(res,b){
                        setTimeout(()=>{
                            for (let n = 0, r = 0; n < len; n+=9, r += 0.01){
                                let x = Math.sin(n) * _this.mainScore.group._width/4 + _this.mainScore.group._width/2;
                                let y = Math.cos(n) * _this.mainScore.group._width/4 + _this.mainScore.group._height/2;//(this.group._width/this.group._height);
                                let z = Math.random() * (300);

                                let rand = Math.random();
                                exploded[n+0] = (x + rand * 5) - original[n+0];
                                exploded[n+1] = (y + rand * 5) - original[n+1];
                                exploded[n+2] = (z + rand * 5) - original[n+2];

                                rand = Math.random();
                                exploded[n+3] = (x + rand * 5) - original[n+3];
                                exploded[n+4] = (y + rand * 5) - original[n+4];
                                exploded[n+5] = (z + rand * 5) - original[n+5];

                                rand = Math.random();
                                exploded[n+6] = (x + rand * 5) - original[n+6];
                                exploded[n+7] = (y + rand * 5) - original[n+7];
                                exploded[n+8] = (z + rand * 5) - original[n+8];
                            }

                            res();

                        }, 5);
                    });
                };

                let t = await explode();

                let p = setInterval(()=>{
                    let ease =  this.easeOutCubic(percentFinished);

                   if (frames > 40){

                        incrementer = -0.15

                        if (percentFinished < 0){

                            clearInterval(p);

                            textGeo.attributes.position.array = original;

                            textGeo.attributes.position.needsUpdate = true;

                            res();

                            return;
                        }
                    }

                    let attribPosArray = textGeo.attributes.position.array;

                    for (let n = 0; n < len; n+=9){

                        attribPosArray[n+0] = exploded[n+0] * ease + textGeo.attributes.position._array[n+0];
                        attribPosArray[n+1] = exploded[n+1] * ease + textGeo.attributes.position._array[n+1];
                        attribPosArray[n+2] = exploded[n+2] * ease + textGeo.attributes.position._array[n+2];

                        attribPosArray[n+3] = exploded[n+3] * ease + textGeo.attributes.position._array[n+3];
                        attribPosArray[n+4] = exploded[n+4] * ease + textGeo.attributes.position._array[n+4];
                        attribPosArray[n+5] = exploded[n+5] * ease + textGeo.attributes.position._array[n+5];

                        attribPosArray[n+6] = exploded[n+6] * ease + textGeo.attributes.position._array[n+6];
                        attribPosArray[n+7] = exploded[n+7] * ease + textGeo.attributes.position._array[n+7];
                        attribPosArray[n+8] = exploded[n+8] * ease + textGeo.attributes.position._array[n+8];
                    }

                    percentFinished += incrementer;

                    frames += 1;

                    textGeo.attributes.position.needsUpdate = true;

                }, 10);
            });
        }

        makeParticles(obj3d){
            // https://github.com/simondevyoutube/ThreeJS_Tutorial_BlendModes/blob/master/main.js
            const _VS = `
        uniform float pointMultiplier;

        attribute float size;
        attribute float angle;
        attribute float blend;
        attribute vec4 colour;

        varying vec4 vColour;
        varying vec2 vAngle;
        varying float vBlend;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * pointMultiplier / gl_Position.w;

          vAngle = vec2(cos(angle), sin(angle));
          vColour = colour;
          vBlend = blend;
        }`;

            const _FS = `

        uniform sampler2D diffuseTexture;

        varying vec4 vColour;
        varying vec2 vAngle;
        varying float vBlend;

        void main() {
          vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
          gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
          gl_FragColor.xyz *= gl_FragColor.w;
          gl_FragColor.w *= vBlend;
        }`;

            const loader = new THREE.TextureLoader();
            this.texture = loader.load('https://i.imgur.com/IovTnzu.png'); // Bluefire1 particle 75% smaller.

            const uniforms = {
                diffuseTexture: {
                    value: this.texture, 
                },
                pointMultiplier: {
                    value: unsafeWindow.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
                }
            };

            this._material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: _VS,
                fragmentShader: _FS,
                blending: THREE.CustomBlending,
                blendEquation: THREE.AddEquation,
                blendSrc: THREE.OneFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor,
                depthTest: true,
                depthWrite: false,
                transparent: true,
                vertexColors: true
            });

            obj3d._geometry = new THREE.BufferGeometry();

            let particles = [];

            let particlesAmount = this.gameInfo.particlesAmount;
            obj3d.particle_amount = particlesAmount === undefined? 30: +particlesAmount;

            let tempAdditionalAmount = 0;
            let cosOffset = 0;

            const particlePoints = new THREE.Points(obj3d._geometry, this._material);

            obj3d._particlePoints = particlePoints;

            this.scene.add(particlePoints);

            obj3d.particlesPaused = false;

            obj3d.backGroundPulsing = ()=>{
                particles = particles.filter( p => {
                    if (p.x !== obj3d.group.position.x && !p.unload){
                        tempAdditionalAmount += 1;
                        p.unload = true;
                    }

                    if (p.unload){
                        p.life -= 0.23; // Some random number that seemed to work good.
                        p.alphaInc = 0.05; // Some random number that seemed to work good.
                    }

                    let d = Math.sin(p.colour.a);

                    return p.life > 0.00 || d > 0.0;
                });

                if (particles.length < obj3d.particle_amount + tempAdditionalAmount && !obj3d.particlesPaused){

                    let nn = obj3d.particle_amount + tempAdditionalAmount - particles.length;

                    for (let n = 0; n < nn; n++){
                        let ran = Math.random();
                        particles.push({
                            x: obj3d.group.position.x,
                            y: obj3d.group.position.y,
                            position: {
                                x: this.THREE.Math.randFloatSpread(obj3d.group._width) + obj3d.group.position.x, //(ran * 2 - 1) * (this.group._width/2) + this.group.position.x, //- (this.textStyle.size * 0.09),
                                y: this.THREE.Math.randFloatSpread(obj3d.group._height) + obj3d.group.position.y,//(ran * 2 - 1) * 10 + this.group.position.y,// + (this.textStyle.size * 0.09),
                                z: -(ran * 1_000),
                            },
                            life: Math.abs(Math.sin(cosOffset++)) * (n % 2 == 0?3: 5),
                            colour: { r:0.5, g: 0.5, b: 0.9, a: 0 },
                            alphaInc: ran * 0.03 + 0.01, // n % 2 ? 0.01: 0.02,
                            size: Math.abs(Math.sin(cosOffset++)) * ((obj3d.textStyle.size/unsafeWindow.innerHeight) * 4), //Math.sin(this.textStyle.size), //0.3,
                            angle: 0,
                        });
                    }
                }

                const positionArray = [];
                const sizes = [];
                const colours = [];
                const angles = [];
                const blends = [];

                for (let p of particles){
                    p.life -= 0.05;

                    positionArray.push(p.position.x, p.position.y, p.position.z);

                    sizes.push(p.size *= 1.001); // Make particle grow.

                    colours.push(p.colour.r, p.colour.g, p.colour.b, Math.sin(p.colour.a += p.alphaInc) * 0.07);

                    angles.push(p.angle -= 0.003); // Make particle spin.

                    blends.push(1.0);// Bigger number == darker.
                }

                obj3d._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
                obj3d._geometry.setAttribute('size',     new THREE.Float32BufferAttribute(sizes, 1));
                obj3d._geometry.setAttribute('colour',   new THREE.Float32BufferAttribute(colours, 4));
                obj3d._geometry.setAttribute('angle',    new THREE.Float32BufferAttribute(angles, 1));
                obj3d._geometry.setAttribute('blend',    new THREE.Float32BufferAttribute(blends, 1));

                obj3d._geometry.attributes.position.needsUpdate = true;
                obj3d._geometry.attributes.size.needsUpdate     = true;
                obj3d._geometry.attributes.colour.needsUpdate   = true;
                obj3d._geometry.attributes.angle.needsUpdate    = true;
                obj3d._geometry.attributes.blend.needsUpdate    = true;

                tempAdditionalAmount = 0;
            };
        }

        animate() {
            requestAnimationFrame( this.animate.bind(this) );
            this.line_uniformData.u_time.value += this.line_clock.getDelta();
            this.render();
        }

        render() {
            this.mainScore.group.rotation.y += ( this.targetRotationY -  this.mainScore.group.rotation.y ) * 0.05;
            this.mainScore.group.rotation.x += ( this.targetRotationX - this.mainScore.group.rotation.x ) * 0.05;

            this.raycaster.setFromCamera(this.pointer, this.camera );

            const intersects = this.raycaster.intersectObjects( this.rayMeshes);

            if ( intersects.length > 0 ) {
                if ( this.INTERSECTED != intersects[ 0 ].object ) {
                    this.INTERSECTED = intersects[ 0 ].object;
                    this.INTERSECTED._group.mouseOver = true;
                }
            } else {
                if ( this.INTERSECTED ){
                    this.INTERSECTED._group.mouseOver = false;
                }
                this.INTERSECTED = null;
            }

            this.renderer.autoClear = true;

            this.renderer.render( this.scene, this.camera );

            if (this.correctGuessAnimation){

                this.renderer.autoClear = false;

                this.correctGuessAnimation.update();

                this.renderer.render( this.correctGuessAnimation.scene, this.correctGuessAnimation.camera );
            }

            if (this?.mainScore?.backGroundPulsing){
                this.mainScore.backGroundPulsing();
            }
        }

        resetScene(){

            let x = this.gameInfo.state1XY.x + this.resizeOldWH.width / 2;
            let percentx = x / this.resizeOldWH.width;

            this.gameInfo.state1XY.x = (percentx * unsafeWindow.innerWidth) - (unsafeWindow.innerWidth / 2);

            let y = this.gameInfo.state1XY.y + this.resizeOldWH.height / 2;
            let percenty = y / this.resizeOldWH.height;

            this.gameInfo.state1XY.y = (percenty * unsafeWindow.innerHeight) - (unsafeWindow.innerHeight / 2);

            localStorage.setItem("d3StreakCounter", JSON.stringify(this.gameInfo));

            this.unload();

            new make3DCounter();
        }

        easeOutCubic(x) {
            return 1 - Math.pow(1 - x, 3);
        }
        
        resetLocalStorage(){
            if (unsafeWindow._resetLS) return;
            unsafeWindow._resetLS = true;

            document.addEventListener('keypress', function(evt){
                if (evt.key === '!'){

                    if (confirm('Do you want to delete your setting for 3D Duels Streak Counter?')){

                        delete localStorage['d3StreakCounter'];
                    
                    }
                }
           });
        }
}

    unsafeWindow.make3DCounter = make3DCounter;

async function getSGS(){
    let version = localStorage["sgs"];
    let sgsCode = localStorage["SGSCode"];
    let lastCheckTime =  +localStorage["3dDuelsSGSLastCheckTime"];
    let now = Date.now();
    let halfDayMilliseconds = 43200000;

    if(!sgsCode || !version || now - lastCheckTime > halfDayMilliseconds) {
        await downloadSGS();
        localStorage["3dDuelsSGSLastCheckTime"] = now;
        return;
    }

    if (sgsCode) eval(sgsCode);
}

async function downloadSGS(){
    let code = "";
    let url = "https://raw.githubusercontent.com/echandler/Simple-Reverse-Geocoding-Script/main/reverseGeocodingScript.user.js";

    async function* makeTextFileLineIterator(fileURL) {
      //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

      const utf8Decoder = new TextDecoder("utf-8");
      const response = await fetch(fileURL);
      const reader = response.body.getReader();
      let { value: chunk, done: readerDone } = await reader.read();
      chunk = chunk ? utf8Decoder.decode(chunk) : "";
    
      const newline = /\r?\n/gm;
      let startIndex = 0;
      let result;
    
      while (true) {
        const result = newline.exec(chunk);
        if (!result) {
          if (readerDone) break;
          const remainder = chunk.substr(startIndex);
          ({ value: chunk, done: readerDone } = await reader.read());
          chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "");
          startIndex = newline.lastIndex = 0;
          continue;
        }
        yield chunk.substring(startIndex, result.index);
        startIndex = newline.lastIndex;
      }
    
      if (startIndex < chunk.length) {
        // Last line didn't end in a newline char
         yield chunk.substr(startIndex);
      }
    }
        
    async function run() {
    	for await (const line of makeTextFileLineIterator(url)) {
    		code += line +"\n";
    	}
        localStorage['SGSCode'] = code;
        eval(code);
    }
     
    run();
}

    setInterval(()=>{
      let container = document.querySelector("#mwgtm-settings-buttons");
        if (!container) return;    
        if (container && document.querySelector("#d3CountryStreakNonDuels")) return;

        const div = document.createElement('div');
        div.classList.add("mwgtm-settings-option");
        div.id = "d3CountryStreakNonDuels"; 
        div.innerHTML = "Show/Hide 3d Country Streak Menu";
        div.style.color = "white";
        div.addEventListener('click', ()=>{
            menu.opened? menu.close() : menu.open();
        });
         
        container.appendChild(div);
    }, 1000);
}
