// ==UserScript==
// @name          Random Map Challenge
// @version       0.1
// @match         https://www.geoguessr.com/*
// @run-at        document-start
// @license       MIT
// @namespace     Random Map Challenge
// @grant         none
// @downloadURL
// @updateURL
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// ==/UserScript==

const menuButton = document.createElement('button');
menuButton.id = "RMC_menu_button";
menuButton.innerHTML = "Start new Random Map Challenge!";
menuButton.style.cssText = "position: absolute; bottom: 5px; padding: 0.625em 1.1em; left: 1em; cursor: pointer; z-index: 999999999; background: #DAD667; border-radius: 5px;"
menuButton.addEventListener('click', menuBtnClickHandler);
document.body.appendChild(menuButton);

const ls = localStorage["RandomMapChallenge"] ? JSON.parse(localStorage["RandomMapChallenge"]): null;

const progressBtn = document.createElement('button');

if (ls) {
    progressBtn.innerHTML = "Random Map Challenge Progress!";
    progressBtn.style.cssText = "position: absolute; bottom: 5px; left: 20em; cursor: pointer; z-index: 999999999; background: #ffcaa8; padding: 0.625em 1.1em; border-radius: 5px;"
    progressBtn.addEventListener('click', progBtnClickHandler);
    document.body.appendChild(progressBtn);
    
    function progBtnClickHandler(){

        if (ls === null) {
            alert("Error with random map challenge, no saved info found.");
            return;
        }

        if (window.Sweetalert2.isVisible()) {
            return;
        }

        let p = new window.Sweetalert2({
            didOpen: function (e) {
                // Make sure the player can end the game.
                const endGameBtn = document.getElementById('_endGameBtn');
                endGameBtn.addEventListener('click', ()=>{
                    if(!confirm("Do you want to end this game??")){
                        return;
                    }
                    delete localStorage["RandomMapChallenge"];
                    location.reload();
                    return;
                });

                if (!ls.challengeStartedTime) {
                    document.getElementById('_alert').style.display = "";
                    return;
                }

                let startedTime = new Date(ls.challengeStartedTime);
                startedTime = `${startedTime.getHours()}: ${startedTime.getMinutes()}: ${startedTime.getSeconds()}`;
                document.getElementById('_timeStart').innerText = startedTime;

                let endTime = new Date(ls.challengeEndTime);
                endTime = `${endTime.getHours()}: ${endTime.getMinutes()}: ${endTime.getSeconds()}`;
                document.getElementById('_timeEnd').innerText = endTime;

                if (Date.now() > ls.challengeEndTime) {
                    document.getElementById('_greenAlert').style.display = "";
                }
                
                const skipMapBtn = document.getElementById('_skipMapBtn');
                skipMapBtn.addEventListener('click', ()=>{
                    skipMapBtn.disabled = true;

                    ls.currentMap = {
                        id: "66a46adc321fb0b8f5eeb270",
                        n: "Exact locations [WikiXplore]" 
                    }
                    
                    ls.skipsUsed += 1;
                    localStorage["RandomMapChallenge"] = JSON.stringify(ls);
                    
                    window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
                    return;
                });
            },
            html: `
            <div class="_rmc_header" >Random Map Challenge Progress</div>
            <div id="_alert" style="color: red; display: none;">
                Challenge doesn't start until you start playing your first game!
            </div>
            <div id="_greenAlert" style="color: green; display: none; font-size: 1.2em; margin: 1em 0em;">
                Challenge has ended! Your score is ${ls.maps.length}!
            </div>
            <div id="_container">
                <div>
                    Finished maps: <span id="_finishedMaps">${ls.maps.length}</span>
                </div>
                
                <div>
                    Challenge started at: <span id="_timeStart">---</span>
                </div>
                <div>
                    Challenge will end at: <span id="_timeEnd">${ls.challengeEndTime || "---"}</span>
                </div>
                <div>
                    Challenge time (minutes): <span id="_challengeTime">${ls.challengeTime / 1000 / 60}</span> 
                </div>
                <div>
                    Min map time (minutes): <span id="_mapTime">${ls.mapPlayTime / 60}</span> 
                </div>
                <div>
                    Min map size (km): <span id="_minMapSize">${ls.minMapSize.toLocaleString()}</span>
                </div>
                <div>
                    Max map size (km): <span id="_maxMapSize">${ls.maxMapSize.toLocaleString()}</span>
                </div>
                <div>
                    Min map score: <span id="_mapScore">${ls.minMapScore.toLocaleString()}</span>
                </div>
                <div>
                    Skips: <span id="_mapScore">${ls.skipsUsed} / ${ls.numOfSkips}</span>
                </div>
                <div style="margin-top: 1em;">
                    <input type="checkbox" id="_fMoving" ${ls.fMoving ? "checked" : ""}><label for="_fMoving">No Moving?</label>
                    <input type="checkbox" id="_fRotating"${ls.fRotating ? "checked" : ""}><label for="_fMoving">No Rotating?</label>
                    <input type="checkbox" id="_fZooming"${ls.fZooming ? "checked" : ""}><label for="_fMoving">No Zooming?</label>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_skipMapBtn" class="swal2-confirm swal2-styled _disabled" ${(!ls.challengeEndTime || (ls.skipsUsed < ls.numOfSkips)) ? "": "disabled"}>Skip map</button>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_endGameBtn" class="swal2-confirm swal2-styled" }>End game.</button>
                </div>
            </div>
        `,
            allowOutsideClick: false,
        });
    }
}

function menuBtnClickHandler(){

    if (window.Sweetalert2.isVisible()){
        return;
    }

    let p = new window.Sweetalert2({
        didOpen: function(e){ 
            handlerPopup(p);
        },
        html: `
            <div class="_rmc_header">Random Map Challenge</div>
            
            <div class="_challengeSpecs">
                <div>
                    Challenge time (minutes) <input id="_challengeTime" type="number" value="60">
                </div>
                <div>
                    Min game play time (minutes) <input id="_mapPlayTime" type="number" value="15" title="">
                </div>
                <div>
                    Min map size (km) <input id="_minMapSize" type="number" value="1">
                </div>
                <div>
                    Max map size (km) <input id="_maxMapSize" type="number" value="40075" title="The equatorial circumference of Earth is 40,075 km.">
                </div>
                <div>
                    Min map score <input id="_minMapScore" type="number" max="25000" value="15000">
                </div>
                <div>
                    Skips <input id="_skips" type="number" max="25000" value="1">
                </div>
                <div style="margin-top: 1em;">
                    <input type="checkbox" id="_fMoving"><label for="_fMoving">No Moving?</label>
                    <input type="checkbox" id="_fRotating"><label for="_fRotating">No Rotating?</label>
                    <input type="checkbox" id="_fZooming"><label for="_fZooming">No Zooming?</label>
                </div>
                <div id="_viewGames" class="_hover" style="margin-top: 1em;">
                    View previous finished games. 
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_startChallengeBtn" class="swal2-confirm swal2-styled">Start Challenge</button>
                </div>
            <div>
        `,
        allowOutsideClick: false, 
    });
}

function handlerPopup(p){
    const startChallengBtn = document.getElementById('_startChallengeBtn');
    const minMapSize = document.getElementById('_minMapSize');
    const maxMapSize = document.getElementById('_maxMapSize');
    const minMapTime = document.getElementById('_mapPlayTime');
    const minMapScore = document.getElementById('_minMapScore');
    const challengeTime = document.getElementById('_challengeTime');
    const skips = document.getElementById('_skips');
    
    document.getElementById('_viewGames').addEventListener('click', viewPreviousGames);

    startChallengBtn.addEventListener('click',async ()=>{
        if (parseInt(minMapScore.value) >= 25001){
            minMapScore.value = 25000;
        }

        if (parseInt(minMapSize.value) >= parseInt(maxMapSize.value)){
            alert(`Min map size can't be greater than max map size.`);
            minMapSize.value = 1;
            return;
        }

        const obj = {
            challengeStartedTime: null,
            challengeEndTime: null,
            maps: [],
            challengeTime: challengeTime.value * 60 * 1000,
            mapPlayTime: minMapTime.value * 60,
            minMapScore: parseInt(minMapScore.value),
            minMapSize: parseInt(minMapSize.value),
            maxMapSize: parseInt(maxMapSize.value),
            fMoving: document.getElementById('_fMoving').checked,
            fRotating: document.getElementById('_fRotating').checked,
            fZooming: document.getElementById('_fZooming').checked,
            numOfSkips: parseInt(skips.value),
            skipsUsed: 0,  
        };

        startChallengBtn.disabled = true;

        window.Sweetalert2.showLoading();
        
        for (let n = 0; n < 20; n++) {
            const nextMap = await nextRandomMap(minMapSize.value * 1000, maxMapSize.value * 1000);
            if (nextMap === null){
                continue;
            }

            obj.currentMap = {n: nextMap.name, id: nextMap.id};

            break;
        }
        

        if (!obj.currentMap){
            alert(`Searched 20 maps and couldn't find one, press the button to try again.`);
            window.Sweetalert2.hideLoading();
            startChallengBtn.disabled = false;
            return;
        }
        
        localStorage["RandomMapChallenge"] = JSON.stringify(obj);
        
        const menuButton = document.createElement('button');
        menuButton.innerHTML = "Message in steps";
        menuButton.style.cssText = "position: absolute; bottom: 5px; left: 20px; cursor: pointer; z-index: 999999999; background: #ffcaa8; padding: 5px; border-radius: 5px;"
        menuButton.addEventListener('click', menuBtnClickHandler);
        document.body.appendChild(menuButton);

        window.open(`https://www.geoguessr.com/maps/${obj.currentMap.id}`,"_self");
    });
}

async function fetchRandomMap(min, max){  
    const randomMap = await fetch("https://www.geoguessr.com/maps/random").then(res => res.text());
    const __NEXT_DATA__ = randomMap.match(/<script id="__NEXT_DATA__" type="application.json">(.*?)<\/script>/);

    if (__NEXT_DATA__ === null || __NEXT_DATA__.length < 2) return null;
    if (__NEXT_DATA__[1][0] !== "{") return null; 
    
    const json = JSON.parse(__NEXT_DATA__[1]);
    if (!json?.props?.pageProps?.map) return null;
    console.log(json)
    return json?.props?.pageProps?.map;
}

async function nextRandomMap(min, max){
    let mapInfo = await fetchRandomMap(min, max);
    if (mapInfo === null) return null;

    const coordCount = parseInt(mapInfo.coordinateCount.replace(/\+/, ''));

    if (coordCount < 50) return null;
    
    if (min && mapInfo.maxErrorDistance < min) return null;
    if (max && mapInfo.maxErrorDistance > max) return null;

    return mapInfo;
}

async function fetchGameInfo(id){
    const gameInfo = await fetch(`https://www.geoguessr.com/api/v3/games/${id}`).then(res => res.json());
    return gameInfo;
}


async function checkGameInfo(id, minTime, minScore, forbidMoving = false, forbidZooming = false, forbidRotating = false){
    const gameInfo = await fetchGameInfo(id);

    if (gameInfo.state !== "finished") return {error: "Game is not finished."};
    
    if (forbidMoving === true && gameInfo.forBidMoving !== forbidMoving) return {error: "Moving not alowed"};
    if (forbidZooming === true && gameInfo.forbidZooming !== forbidZoomgin) return {error: "Zooming not alowed"};
    if (forbidRotating === true && gameInfo.forBidRotating !== forbidRotating) return {error: "Rotating not alowed"};
    
    if (minScore && parseInt(gameInfo.player.totalScore.amount) < minScore) return {error: "Score to low."};
    if (minTime && parseInt(gameInfo.player.totalTime) > minTime) return {error: "Too much time."};
    
    return gameInfo;
}

document.body.addEventListener('keyup', (e)=>{
    // Fix for round 5 not being detected unless the guess button is clicked with mouse.
    if (e.code != "Space") return;
    const guessBtn = document.querySelector(`button[data-qa="perform-guess"]`);
    if (!guessBtn.disabled){
        guessBtn.click();
    }
});

function listenForApiFetch(json){
    console.log(json);
    if (!localStorage["RandomMapChallenge"]) return;

    if (ls && ls.currentMap && json.map && ls.currentMap.id != json.map){
        debugger;
        delete localStorage["RandomMapChallenge"];
        alert("Random Map Challenge has ended.");
        return;
    } 

    if (ls && json.round === 1){
        if (ls.challengeStartedTime === null){
            ls.challengeStartedTime = Date.now();
            ls.challengeEndTime = Date.now() + ls.challengeTime;

            localStorage["RandomMapChallenge"] = JSON.stringify(ls);
        }
        
        ls.scoreAdder = 0;

        if (ls.fMoving && json.forbidMoving === false){
            alert('Random Map Challenge requires no moving games! Game will be restarted!');
            
            window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
        }
        if (ls.fRotating && json.forbidRotating === false){
            alert('Random Map Challenge requires no rotating games! Game will be restarted!');
            
            window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
        }
        if (ls.fZooming && json.forbidZooming === false){
            alert('Random Map Challenge requires no moving games! Game will be restarted!');
            
            window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
        }
        
    }         
    
    if (ls && json.state === 'finished'){
        handleEndOfGame(json);
    }

    if (ls && json.round === 5){
        const i = setInterval(()=>{
            const guessBtn = document.querySelector(`[data-qa="perform-guess"]`);

            if (!guessBtn) return;

            clearInterval(i);

            if(guessBtn._isClicky) return;

            guessBtn._isClicky = true;

            guessBtn.addEventListener("click", ()=>{
                setTimeout(async ()=>{
                    const info = await fetchGameInfo(json.token);
                    console.log("rsfsdfsd", info);
                    handleEndOfGame(info);
                }, 500);
            });
        }, 10)
    }
}

let handleEndOfGameIsHandling = false;
function handleEndOfGame(json){
    if (!localStorage["RandomMapChallenge"]){
        progressBtn.click();
        return;
    }
          
    if (handleEndOfGameIsHandling) return;

    let p = new window.Sweetalert2({
        willClose: function(){
            handleEndOfGameIsHandling = false;
            const btn = document.getElementById('_nextGameBtn');
            if (!btn) return;
            // Show next game button if player clicked out of alert.
            btn.style.display = "";
        },
        didOpen: function(e){ 
            handleEndOfGameIsHandling = true;
            const _alert = document.getElementById('_alert');
            const _greenAlert = document.getElementById('_greenAlert');

            if (json.player.totalScore.amount < ls.minMapScore){
                _alert.style.display = "";
                    document.getElementById('_alertExplanation').innerText = `Score not high enough! Need to be above ${ls.minMapScore}!`;
                return;
            }  

            if (json.player.totalTime > ls.mapPlayTime){
                _alert.style.display = "";
                    document.getElementById('_alertExplanation').innerText = `Total time was too long! Keep total time under ${ls.mapPlayTime / 60} minutes.`;
                return;
            }  
            
            if(ls.currentMap) ls.maps.push(ls.currentMap);
            ls.currentMap = null;

            localStorage["RandomMapChallenge"] = JSON.stringify(ls);

            _greenAlert.style.display = "";

            const btn = document.getElementById('_startNextGameBtn');
            btn.disabled = false;
            btn.addEventListener('click', btnClickHandler);

            const _btn = document.createElement('button');

            _btn.style.cssText = "display: none; position: absolute; top: 5px; left: 50vw; cursor: pointer; z-index: 999999999; background: #ffcaa8; padding: 0.625em 1.1em; border-radius: 5px;"
            _btn.id = "_nextGameBtn";
            _btn.className = 'swal2-confirm swal2-styled';
            _btn.innerText = "Start next RMC game!";
            _btn.addEventListener('click', btnClickHandler );
            document.body.appendChild(_btn);

            ls.scoreAdder = 1;

            async function btnClickHandler (){
                if (ls._finishedGame){
                    ls._finishedGame.idx += 1;
                    if (!(ls._finishedGame.idx >= ls._finishedGame.obj.maps.length)){
                        btn.disabled = true;
                        _btn.disabled = true;

                        ls.currentMap = ls._finishedGame.obj.maps[ls._finishedGame.idx];

                        localStorage["RandomMapChallenge"] = JSON.stringify(ls);

                        window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}` ,"_self");
                        return;
                    }
                }

                btn.disabled = true;
                _btn.disabled = true;

                window.Sweetalert2.showLoading();
                
                ls.currentMap = null; 

                for (let n = 0; n < 20; n++) {
                    const nextMap = await nextRandomMap(ls.minMapSize * 1000, ls.maxMapSize * 1000);
                    if (nextMap === null){
                        continue;
                    }

                    ls.currentMap = {n: nextMap.name, id: nextMap.id};
                    break;
                }
                 
                if (ls.currentMap === null){
                    alert(`Searched 20 maps and couldn't find one, press the button to try again.`);
                    window.Sweetalert2.hideLoading();
                    btn.disabled = false;
                    _btn.disabled = false;
                    return;
                }
                 
                localStorage["RandomMapChallenge"] = JSON.stringify(ls);
        
                window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}` ,"_self");
           };

        },
        html: `
            <div class="_rmc_header">Random Map Challenge</div>
            <div id="_alert" style="color: red; display: none;">
                Need to replay map to continue!
                <div id="_alertExplanation">
                </div>                
            </div>
            
            <div id="_greenAlert" style="color: green; display: none;">
                <div id="_greenMainMsg">
                    Everything looks good, on to the next game!
                </div>
                <div id="_greenExplanation">
                </div>                
            </div>

            <div style="margin-top: 1em;" >
                <button id="_startNextGameBtn" class="swal2-confirm swal2-styled _disabled" disabled>Start Next Game</button>
            </div>
        `,
        allowOutsideClick: false, 
    });
}
        
setInterval(()=>{
    let ls = localStorage["RandomMapChallenge"];
    if (!ls) return;

    ls = JSON.parse(ls);

    if (!ls.challengeEndTime) return;

    if (Date.now() < ls.challengeEndTime) return;

    delete localStorage["RandomMapChallenge"];

    let ls1 = localStorage[`RandomMapChallenge_saveInfo`] ? JSON.parse(localStorage[`RandomMapChallenge_saveInfo`]) : [];
    ls1.push(ls);

    localStorage[`RandomMapChallenge_saveInfo`] = JSON.stringify(ls1);
    
    let p = new window.Sweetalert2({
        didOpen: function(e){

            let startedTime = new Date(ls.challengeStartedTime);
            startedTime = `${startedTime.getHours()}: ${startedTime.getMinutes()}: ${startedTime.getSeconds()}`;
            document.getElementById('_timeStart').innerText = startedTime;

            let endTime = new Date(ls.challengeEndTime);
            endTime = `${endTime.getHours()}: ${endTime.getMinutes()}: ${endTime.getSeconds()}`;
            document.getElementById('_timeEnd').innerText = endTime;

        },
        html: `
            <div class="_rmc_header"  >Random Map Challenge Final Score!</div>
            <div id="_alert" style="background-color: #00800030; padding:1em; color: green; font-size: 1.2em; margin: 1em 0em;">
                Challenge has ended! Your score is ${ls.maps.length}!
            </div>
            <div>
                Finished maps: <span id="_finishedMaps">${ls.maps.length}</span>
            </div>
            
            <div>
                Challenge started at: <span id="_timeStart">${ls.challengeEndTime}</span>
            </div>
            <div>
                Challenge will end at: <span id="_timeEnd">${ls.challengeEndTime}</span>
            </div>
            <div>
                Challenge time (minutes): <span id="_challengeTime">${ls.challengeTime / 1000 / 60}</span> 
            </div>
            <div>
                Min map time (minutes): <span id="_mapTime">${ls.mapPlayTime / 60}</span> 
            </div>
            <div>
                Min map size (km): <span id="_minMapSize">${ls.minMapSize}</span>
            </div>
            <div>
                Max map size (km): <span id="_maxMapSize">${ls.maxMapSize}</span>
            </div>
            <div>
                Min map score: <span id="_mapScore">${ls.minMapScore}</span>
            </div>
            <div>
                Skips: <span id="_mapScore">${ls.skipsUsed} / ${ls.numOfSkips}</span>
            </div>
            <div style="margin-top: 1em;">
                <input type="checkbox" id="_fMoving" ${ls.fMoving? "checked": ""}><label for="_fMoving">No Moving?</label>
                <input type="checkbox" id="_fRotating"${ls.fRotating? "checked": ""}><label for="_fMoving">No Rotating?</label>
                <input type="checkbox" id="_fZooming"${ls.fZooming? "checked": ""}><label for="_fMoving">No Zooming?</label>
            </div>

        `,
        allowOutsideClick: false, 

        })
    }, 1000);

        window.fetch = (function () {
            let _fetch = window.fetch;
            return async function (...args) {
                if (!/geoguessr.com.(challenge|game)/i.test(location.href)) {
                    return _fetch.apply(window, args);
                }

                if (/geoguessr.com.api.v3.(challenge|game)/i.test(args[0])) {


                    let v3APIRes = await _fetch.apply(window, args);

                    let resJSON = await v3APIRes.clone().json();
                    
                    listenForApiFetch(resJSON);

                    return new Promise((res) => {
                        res(v3APIRes);
                    });
                }

                return _fetch.apply(window, args);
            };
        })();

function viewPreviousGames(){
    let prevGames = localStorage[`RandomMapChallenge_saveInfo`];

    if (!prevGames) {
        alert("No finished games found.");
        return;
    }
    
    prevGames = JSON.parse(prevGames);

    let _html = ``;
    prevGames.forEach((game)=>{
        _html += `
            <div>
            <div class="_prevChalGame _hover" style='margin-bottom:1em;cursor: pointer;'>
            ${(new Date(game.challengeEndTime).toString()).replace(/ \w+-.*/, '')}
            </div>
            <div class="_prevChalMaps" style="display: none;">
               <div>
                   <textarea title="This is what your game looks like to a computer." style="border: 1px solid #d3d3d3;">${JSON.stringify(game)}</textarea>
               </div>
               ${(()=>{
                    let str = ``;
                    if (game.maps.length === 0){
                        if (game?.currentMap?.id){
                            str += `<div><a href="https://www.geoguessr.com/maps/${game.currentMap.id}" style="color: #794141;" class="_prevChalMap _hover" title="Challenge ended in middle of this game.">${game.currentMap.n}</a></div>`;
                        } else {
                            str += `<div>No finished maps found</div>`
                        }
                        return str;
                    }
                    game.maps.forEach(map =>{
                        str += `<div><a href="https://www.geoguessr.com/maps/${map.id}"class="_prevChalMap _hover">${map.n}</a></div>`;
                    });

                    if (game?.currentMap?.id){
                        str += `<div><a href="https://www.geoguessr.com/maps/${game.currentMap.id}" style="color: #794141;" class="_prevChalMap _hover" title="Challenge ended in middle of this game.">${game.currentMap.n}</a></div>`;
                    }
                    return str;
                })()} 
            </div> 
            </div>
        ` 
    });

    let p = new window.Sweetalert2({
        didOpen: function(e){ 
            let prevChalGames = document.querySelectorAll('._prevChalGame');
            let prevChalMaps = document.querySelectorAll('._prevChalMap');

            prevChalGames.forEach((game)=>{
                game.addEventListener('click', ()=>{
                    const sibling = game.nextElementSibling;
                    if (sibling.style.display === ""){
                        sibling.style.display = "none";
                    } else {
                        sibling.style.display = "";
                    }
                })
            })
        },
        html: `
            <div class="_rmc_header">Previous Finished Games</div>
            
            <div class="_challengeSpecs" style="max-height: 40vh;overflow-y: scroll;">
                ${_html}
            <div>
        `,
        allowOutsideClick: false, 
    });
}

//playFinishedGame({
//   "challengeStartedTime": 1723671037239,
//   "challengeEndTime": 1723671097239,
//   "maps": [
//       {
//           "n": "great lakes",
//           "id": "56f042948be465821877ce0a"
//       }
//   ],
//   "challengeTime": 60000,
//   "mapPlayTime": 60,
//   "minMapScore": 1,
//   "minMapSize": 1,
//   "maxMapSize": 40075,
//   "fMoving": false,
//   "fRotating": false,
//   "fZooming": false,
//   "currentMap": {
//       "n": "Flags",
//       "id": "5ea35789d502e14468139fc8"
//   },
//   "scoreAdder": 1
//});

window.playFinishedGame = function (finishedGame){
    if (finishedGame.maps.length === 0){
        alert("No maps found.");
        return;
    }

    let obj = {
            challengeStartedTime: null,
            challengeEndTime: null,
            maps: [],
            challengeTime: finishedGame.challengeTime,
            mapPlayTime: finishedGame.mapPlayTime, 
            minMapScore: finishedGame.minMapScore, 
            minMapSize: finishedGame.minMapSize, 
            maxMapSize: finishedGame.maxMapSize, 
            fMoving: finishedGame.fMoving,
            fRotating: finishedGame.fRotating, 
            fZooming: finishedGame.fZooming, 
            _finishedGame: {idx:0, obj: finishedGame},
            currentMap: finishedGame.maps[0],
            numOfSkips: finishedGame.numOfSkips,
            skipsUsed: 0,
        };
        debugger;

        if (finishedGame.currentMap){
            finishedGame.maps.push(finishedGame.currentMap);
        }

        localStorage["RandomMapChallenge"] = JSON.stringify(obj);
        
        alert("Starting a new Random Map Challenge!\n\nThis page will reload and the first map in the challenge will be available.\n\nChallenge will start when you start playing a game, Good Luck!");

        window.open(`https://www.geoguessr.com/maps/${obj.currentMap.id}`,"_self");
}

document.head.insertAdjacentHTML('beforeend', `
    <style>
        ._challengeSpecs input[type=number] {
            width: 6em; 
            border-radius: 5px;
            background: #7066e017;
        }
        ._rmc_header {
            font-family: var(--default-font);
            font-weight: 500;
            margin-bottom: 1em;
            background: #676bda;
            padding: 5px;
            color: white;
        }
        ._hover:hover {
            cursor: pointer;
            color: blue !important;
        }
        ._prevChalMaps {
            max-height: 7em;
            margin-bottom: 1em;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            overflow-y: scroll;

        }

        ._disabled:disabled{
            background-color: grey;
        }
    </style>`);
