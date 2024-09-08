// ==UserScript==
// @name          Random Map Challenge
// @description   Random Map Challenge 
// @version       0.1
// @match         https://www.geoguessr.com/*
// @run-at        document-start
// @license       MIT
// @namespace     Random Map Challenge
// @grant         none
// @downloadURL
// @updateURL
// ==/UserScript==
    
    let curEorJSON = null; 
    
    let isHandlingEOR = false;
    let _eorBtn = null;
    let observer = new MutationObserver(mutationRecords => {
        // Trying to detect the end of the round.
        setTimeout(async () => {
            if (handleEndOfGameIsHandling || isHandlingEOR) return;

            const eorBtn = document.querySelector('[data-qa="close-round-result"');

            if (!eorBtn || _eorBtn === eorBtn || eorBtn.textContent.toLowerCase() === "next") return;

            _eorBtn = eorBtn;
            isHandlingEOR = true;

            setTimeout(()=>{
                isHandlingEOR = false;
            }, 2000);

            const id = location.pathname.replace(/\/.*\/(.*)/, "$1");

            //if (curEorJSON && (curEorJSON.state !== 'finished' || curEorJSON.token === id)) return;
            if (curEorJSON && (curEorJSON.token === id)) return;

            let info = await fetchGameInfo(id);
            
            info._mutationObserved = true;

            curEorJSON = info;

            handleEndOfGame(info);
        }, 500);
    });

    const __interval = setInterval(()=>{
        // Act of desperation.
        const __next = document.getElementById("__next");
        if (!__next) return;
        clearInterval(__interval);

        observer.observe(__next, {
            childList: true,
            subtree: true, // and lower descendants too
        });
    });

patch_fetch();
loadSweetAlert();

const menuButton = document.createElement('button');
menuButton.id = "RMC_menu_button";
menuButton.title = "Start new Random Map Challenge!";
menuButton.className = '_menu_button';
//menuButton.style.cssText = "position: absolute; bottom: 5px; padding: 0.625em 1.1em; left: 1em; cursor: pointer; z-index: 999999999; background: #DAD667; border-radius: 5px;"
menuButton.addEventListener('click', mainMenuBtnClickHandler);
document.body.appendChild(menuButton);

const ls = localStorage["RandomMapChallenge"] ? JSON.parse(localStorage["RandomMapChallenge"]): null;

const progressBtn = document.createElement('button');

if (ls) {
//    progressBtn.innerHTML = "Random Map Challenge Progress!";
    progressBtn.className = `_menu_button _stats_button`;
    //progressBtn.style.cssText = "position: absolute; bottom: 5px; left: 20em; cursor: pointer; z-index: 999999999; background: #ffcaa8; padding: 0.625em 1.1em; border-radius: 5px;"
    progressBtn.addEventListener('click', progBtnClickHandler);
    document.body.appendChild(progressBtn);
    
    // progressBtn.innerHTML = `
    // <div style="display: grid; grid-auto-template: auto auto;>
    // <div style="display:inline-block; margin-right:0.5em;">
    //     <span style="display: inline-block; position: absolute; top: 0.2em; font-size: 0.5em; opacity: 0.5;">SCORE</span>
    //     <span id='_score' >---</span>
    // </div> 
    // <div style="display:inline-block">
    //     <span style="display: inline-block; position: absolute; top: 0.2em; font-size: 0.5em; opacity: 0.5;">TIME</span>
    //     <span id="_hours">---</span> : <span id="_minutes">---</span> : <span id="_seconds">---</span>
    // </div>
    // </div>
    // `;
    progressBtn.innerHTML = `
    <div class="_progBtn" >
        <div style="position: relative; top: 0.2em; font-size: 0.5em; opacity: 0.5;">TIME</div>
        <div style="position: relative; top: 0.2em; font-size: 0.5em; opacity: 0.5;">SCORE</div>
        <div style='width: 5em;'>
            <span id="_hours">--- : </span><span id="_minutes">--- : </span><span id="_seconds">---</span>
        </div>
        <div id='_score' >---</div>
    </div>
    `;

            //<path d="L20 0 L20 10 L0 10 Z"></path>
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
                    if(!confirm("Do you want to end this Random Map Challenge??")){
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
            <div class="_rmc_header" >Random Map Challenge Stats</div>
            <div id="_alert" style="color: #b92828; display: none;">
                Challenge doesn't start until you start playing your first game! <a style="color: #676bda; text-decoration: underline;"href="https://www.geoguessr.com/maps/${ls?.currentMap?.id?ls?.currentMap?.id: null}">Link</a>
            </div>
            <div id="_greenAlert" style="color: green; display: none; font-size: 1.2em; margin: 1em 0em;">
                Challenge has ended! Your score is <span style="font-weight:bold;">${ls.maps.length}</span><div class="_aniMark" style="display:inline-block">!</div>
            </div>
            <div id="_container" style="margin-top: 1em;">
                <div id="_infoContainer">
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
                        Max map time (minutes): <span id="_mapTime">${ls.mapPlayTime > 0? _ls.mapPlayTime / 60 : "---"}</span> 
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
                    <div>
                        Search terms: <span id="_searchTerms">${ls.searchByTerms || `""`}</span>
                    </div>
                    <div>
                        Search player #: <span id="_searchByPlayerId">${ls.searchByPlayerId || `""`}</span>
                    </div>
                    ${ ls.mapsList.length > 0 ? 
                        `<div>
                            Amount of search results: <span id="_numOfMaps">${ls.mapsList.length}</span>
                        </div>`
                        : ""
                    }
                </div>
                <div style="margin-top: 1em;">
                    <input type="checkbox" disabled id="_fMoving" ${ls.fMoving ? "checked" : ""}><label for="_fMoving">No Moving?</label>
                    <input type="checkbox" disabled id="_fRotating"${ls.fRotating ? "checked" : ""}><label for="_fMoving">No Rotating?</label>
                    <input type="checkbox" disabled id="_fZooming"${ls.fZooming ? "checked" : ""}><label for="_fMoving">No Zooming?</label>
                </div>
                <div id="_miscStuff" style="margin: 1em 0em;">
                    <input type="checkbox" disabled id="_autoNextMap" ${ls.autoNextMap ? "checked" : ""}><label for="_autoNextMap">Auto next map?</label>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_skipMapBtn" class="swal2-confirm swal2-styled _disabled _styledBtn" ${(!ls.challengeEndTime || (ls.skipsUsed < ls.numOfSkips)) ? "": "disabled"}>Skip map</button>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_endGameBtn" class="swal2-confirm swal2-styled _styledBtn" >End game.</button>
                </div>
            </div>
        `,
            allowOutsideClick: false,
            confirmButtonText: "Close",
        });
    }
}

function mainMenuBtnClickHandler(){

    if (window.Sweetalert2.isVisible()){
        return;
    }

    let p = new window.Sweetalert2({
        didOpen: function(e){ 
            handlePopup(p);
        },
        html: `
            <div class="_rmc_header">Random Map Challenge</div>
            
            <div class="_challengeSpecs">
                <div class="_inputs" style="display: grid; grid-template-columns: max-content min-content; column-gap: 1em; width: fit-content; margin: 0px auto;">
                    <div>
                        Challenge time (minutes) 
                    </div>
                        <input id="_challengeTime" type="number" value="60" onfocus="this.select()">
                    <div>
                        Max game time (minutes)
                    </div>
                        <input id="_mapPlayTime" type="number" value="" title="" onfocus="this.select()">
                    <div>
                        Min map size (km)
                    </div>
                        <input id="_minMapSize" type="number" value="10000" onfocus="this.select()">
                    <div>
                        Max map size (km)
                    </div>
                        <input id="_maxMapSize" type="number" value="19000" title="Community World is 18534.781 km" onfocus="this.select()">
                    <div>
                        Min map score
                    </div>
                        <input id="_minMapScore" type="number" max="25000" value="10000" onfocus="this.select()">
                    <div>
                        Skips
                    </div>
                        <input id="_skips" type="number" max="25000" value="5"  onfocus="this.select()">
                </div>
                <div style="margin: 1em 0em;">
                    <input type="checkbox" id="_fMoving"><label for="_fMoving">No Moving?</label>
                    <input type="checkbox" id="_fRotating"><label for="_fRotating">No Rotating?</label>
                    <input type="checkbox" id="_fZooming"><label for="_fZooming">No Zooming?</label>
                </div>
                <div id="_miscStuff" style="margin: 1em 0em;">
                    <input type="checkbox" id="_autoNextMap"><label for="_autoNextMap">Auto next map?</label>
                </div>
                <div>
                    Map search <input id="_searchByTerms" style="margin-left: 1em;" type="text" placeholder="Enter search terms here.">
                </div>
                <div>
                    Maps made by player <input id="_searchByPlayerId" style="margin-left: 1em;" type="text" placeholder="Enter player id# here.">
                </div>
                <div id="_viewGames" class="_hover" style="margin-top: 1em;">
                    View previous finished games. 
                </div>
                <div id="_playAgainstSomeoneElse" class="_hover" style="margin-top: 1em;">
                    Play against someone else. 
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_startChallengeBtn" class="swal2-confirm swal2-styled _disabled _styledBtn">Start Challenge</button>
                </div>
            <div>
        `,
        allowOutsideClick: false, 
        confirmButtonText: "Close",
    });
}

function handlePopup(p){
    const startChallengBtn = document.getElementById('_startChallengeBtn');
    const playAgainstSomeone = document.getElementById('_playAgainstSomeoneElse');
    const minMapSize = document.getElementById('_minMapSize');
    const maxMapSize = document.getElementById('_maxMapSize');
    const maxMapTime = document.getElementById('_mapPlayTime');
    const minMapScore = document.getElementById('_minMapScore');
    const challengeTime = document.getElementById('_challengeTime');
    const skips = document.getElementById('_skips');
    const searchByTerms = document.getElementById("_searchByTerms");
    const searchByPlayerId = document.getElementById('_searchByPlayerId');
    
    document.getElementById('_viewGames').addEventListener('click', viewPreviousGames);
    
    playAgainstSomeone.addEventListener('click', ()=>{
        let p = new window.Sweetalert2({
            didOpen: function(e){ 
               document.getElementById('_startChallengeBtn').addEventListener('click', ()=>{
                    const ta = document.getElementById('_gameInfo');
                    if (!ta.value || ta.value === '') return;
                    
                    try {
                        window.playFinishedGame( JSON.parse(ta.value));
                    } catch(e){
                        alert("The script doesn't like the info. that you pasted in.");
                    }
               }) 
            },
            html: `
                <div class="_rmc_header">Play Against Someone</div>
                
                <div class="_challengeSpecs">
                    <div>
                    <textarea id="_gameInfo" style="border: 1px solid #d3d3d3;" rows="4" cols="35" placeholder="Enter game info. here!"></textarea>
                    </div> 
                    <div style="margin-top: 1em;" >
                        <button id="_startChallengeBtn" class="swal2-confirm swal2-styled _styledBtn">Start Challenge</button>
                    </div>
                <div>
            `,
            allowOutsideClick: false, 
            confirmButtonText: "Close",
        });

    });

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
            mapPlayTime: maxMapTime.value * 60,
            minMapScore: parseInt(minMapScore.value),
            minMapSize: parseInt(minMapSize.value),
            maxMapSize: parseInt(maxMapSize.value),
            fMoving: document.getElementById('_fMoving').checked,
            fRotating: document.getElementById('_fRotating').checked,
            fZooming: document.getElementById('_fZooming').checked,
            autoNextMap: document.getElementById('_autoNextMap').checked,
            numOfSkips: parseInt(skips.value),
            searchByPlayerId: searchByPlayerId.value,
            searchByTerms: searchByTerms.value,
            skipsUsed: 0,  
            mapsList: [],
        };

        startChallengBtn.disabled = true;

        window.Sweetalert2.showLoading();
        
        if (obj.searchByPlayerId !== "" || obj.searchByTerms !== ""){
            await searchByTermOrId(obj);

            if (obj.mapsList.length == 0){
                alert("Couldn't find any maps for that search!");
                window.Sweetalert2.hideLoading();
                startChallengBtn.disabled = false;

                getSwalCloseBtn((el)=>{
                    if (el.innerText === "Close") el.style.display = '';
                });

                return;
            }
        }

        if (obj.mapsList.length !== 0){
            obj.currentMap = obj.mapsList[Math.floor(Math.random() * obj.mapsList.length)];
        }

        if (obj.mapsList.length === 0){
           for (let n = 0; n < 20; n++) {
                const nextMap = await nextRandomMap(minMapSize.value * 1000, maxMapSize.value * 1000);
                if (nextMap === null){
                    continue;
                }

                obj.currentMap = {n: nextMap.name, id: nextMap.id};

                break;
            }
        }
        
        if (!obj.currentMap){
            alert(`Searched 20 maps and couldn't find one. Press the button and try again.\n\nMay need to refresh page and verfiy you are a human?`);
            window.Sweetalert2.hideLoading();
            startChallengBtn.disabled = false;

            getSwalCloseBtn((el)=>{
                if (el.innerText === "Close") el.style.display = '';
            });

            return;
        }
        
        localStorage["RandomMapChallenge"] = JSON.stringify(obj);
        
        window.open(`https://www.geoguessr.com/maps/${obj.currentMap.id}`,"_self");
    });
}

async function fetchRandomMap(min, max){  
    // https://www.geoguessr.com/api/v3/social/maps/browse/popular/random?count=1&minCoords=20
    // https://www.geoguessr.com/api/v3/social/maps/browse/random?count=1&minCoords=20
    // not sure what the query parameters are. ?count=1 works, but ?minCoords=20 doesn't work.
    // getting repeats fairly often with popular maps.
    // not getting any satellite maps or unity maps.
    
    const randomMap = await fetch("https://www.geoguessr.com/maps/random").then(res => res.text());
    const __NEXT_DATA__ = randomMap.match(/<script id="__NEXT_DATA__" type="application.json">(.*?)<\/script>/);

    if (__NEXT_DATA__ === null || __NEXT_DATA__.length < 2) return null;
    if (__NEXT_DATA__[1][0] !== "{") return null; 
    
    const json = JSON.parse(__NEXT_DATA__[1]);
    if (!json?.props?.pageProps?.map) return null;

    //console.log("Random __NEXT_DATA__",json?.props?.pageProps?.map?.name,json?.props?.pageProps?.map?.maxErrorDistance, json);

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


async function searchByTermOrId(obj){
    if (obj.searchByPlayerId !== ""){
        for (let n = 0; n < 100 ; n++) {
            let maps = await fetch(`https://www.geoguessr.com/api/maps?createdBy=${obj.searchByPlayerId}&page=${n}`).then(res => res.json());
            if (maps.length == 0) break; 
            obj.mapsList = obj.mapsList.concat(maps);
        }
    }
    
    if (obj.mapsList.length == 0 && obj.searchByTerms !== ""){
        for (let n = 0; n < 100; n++){
            let maps = await fetch(`https://www.geoguessr.com/api/v3/search/map?page=${n}&count=25&q=${obj.searchByTerms}`).then(res=> res.json());
            if (maps.length == 0) break;
            obj.mapsList = obj.mapsList.concat(maps);
        }
    } 
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
    if (guessBtn && !guessBtn.disabled){
        guessBtn.click();
    }
    const clickyBtn = document.querySelector('.clickyBtn');
    if (clickyBtn && !clickyBtn.disabled){
        clickyBtn.click();
    }

});

function listenForApiFetch(json){
    if (!localStorage["RandomMapChallenge"]) return;

    if (ls && ls.currentMap && json.map && ls.currentMap.id != json.map){
        setTimeout(()=>{
            delete localStorage["RandomMapChallenge"];
            console.log("Random Map Challenge has ended!!!!!!.", ls.currentMap, json.map)
            alert("Random Map Challenge has ended!!!!!!.");
        }, 1000);
        return;
    } 

    if (ls && json.round === 1){
        if (ls.challengeStartedTime === null){
            ls.challengeStartedTime = Date.now();
            ls.challengeEndTime = Date.now() + ls.challengeTime;

            localStorage["RandomMapChallenge"] = JSON.stringify(ls);
        }
        
        if (json.type === "challenge"){
            alert(`Sorry, this mode doesn't support challenges yet! Game will be restarted!`);
            
            window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
        }

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
        
        if (!ls._finishedGame || (ls._finishedGame.idx +1 >= ls._finishedGame.obj.maps.length)){
            cacheNextGame();
        }
    }         
    
    if (ls && (json.state === 'finished' || (json.player.totalScore.amount >= ls.minMapScore))){
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
                    handleEndOfGame(info);
                }, 500);
            });
        }, 10)
    }
}

async function cacheNextGame(){
    if (ls._cachedMap) return;

    for (let n = 0; n < 20; n++) {
        if (ls._cachedMap) return;// A random map may have been found already.

        const nextMap = await nextRandomMap(ls.minMapSize * 1000, ls.maxMapSize * 1000);

        if (nextMap === null){
            continue;
        }

        ls._cachedMap = {n: nextMap.name, id: nextMap.id};
        break;
    }
}

let handleEndOfGameIsHandling = false;
function handleEndOfGame(json){
    if (!localStorage["RandomMapChallenge"]){
        progressBtn.click();
        return;
    }
    
    if (json.player.totalTime === 0){
        return;
    }

    if (handleEndOfGameIsHandling) return;
    
    curEorJSON = json;

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
            const startNextGameBtn = document.getElementById('_startNextGameBtn');
            startNextGameBtn.disabled = false;

            if (json.player.totalScore.amount < ls.minMapScore){
                const score = parseInt(json.player.totalScore.amount).toLocaleString();
                _alert.style.display = "";
                document.getElementById('_alertExplanation').innerHTML = `Your score is <span style="font-weight:bold; ${json._mutationObserved? `text-decoration: underline;`: ''}">${score}</span>; the number to beat is <span style="font-weight:bold;">${ls.minMapScore.toLocaleString()}</span>!`;
                startNextGameBtn.innerText = "Retry Map";
                startNextGameBtn.style.backgroundColor = "#b92828";
                startNextGameBtn.addEventListener('click', ()=>{
                    window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}/play` ,"_self");
                }); 
                return;
            }  

            if (ls.mapPlayTime > 0 && json.player.totalTime > ls.mapPlayTime){
                _alert.style.display = "";
                let time = json.player.totalTime;
                let min = Math.floor(time / 60);
                let sec = (time - (min * 60));
                time = `${min? `${min} minute${min > 1?'s':''}`: ""}` + ` ${sec + ` second${sec > 1? "s":""}`}`;

                let minTime = ls.mapPlayTime;
                min = Math.floor(minTime / 60);
                sec = (ls.mapPlayTime - (min * 60));
                minTime = `${min? `${min} minute${min > 1?'s':''}`: ""}` + ` ${sec + ` second${sec > 1? "s":""}`}`;

                document.getElementById('_alertExplanation').innerText = `Your time was ${time};
                 ${minTime} is the time to beat!`;
                startNextGameBtn.innerText = "Retry Map";
                startNextGameBtn.addEventListener('click', ()=>{
                    window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}/play` ,"_self");
                }); 
                return;
            }  

            if (ls.currentMap && ls?._token !== json.token){
                ls._token = json.token;
            }
            
            if (ls.currentMap && json.state === 'finished'){
                ls.currentMap.token = json.token;
            }

            ls.maps.push(ls.currentMap);
            
            debugger;
            localStorage["RandomMapChallenge"] = JSON.stringify(ls);

            ls.currentMap = null;

            _greenAlert.style.display = "";
            
            if (ls.autoNextMap){
                setTimeout(()=>{
                  startNextGameBtn.click();  
                }, 1000);
            }

            startNextGameBtn.addEventListener('click', btnClickHandler);

            const _btn = document.createElement('button');
            _btn.style.cssText = "display: none; position: absolute; top: 5px; left: 50vw; cursor: pointer; z-index: 999999999; background: #ffcaa8; padding: 0.625em 1.1em; border-radius: 5px;"
            _btn.id = "_nextGameBtn";
            _btn.className = 'swal2-confirm swal2-styled';
            _btn.innerText = "Start next RMC game!";
            _btn.addEventListener('click', btnClickHandler );
            document.body.appendChild(_btn);
            
            async function btnClickHandler (){
                if (ls._finishedGame){

                    ls._finishedGame.idx += 1;

                    if (!(ls._finishedGame.idx >= ls._finishedGame.obj.maps.length)){
                        startNextGameBtn.disabled = true;
                        _btn.disabled = true;

                        ls.currentMap = ls._finishedGame.obj.maps[ls._finishedGame.idx];

                        localStorage["RandomMapChallenge"] = JSON.stringify(ls);

                        window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}` ,"_self");
                        return;
                    }
                }

                if (ls._cachedMap){
                    startNextGameBtn.disabled = true;
                    _btn.disabled = true;

                    ls.currentMap = ls._cachedMap;

                    ls._cachedMap = null;

                    localStorage["RandomMapChallenge"] = JSON.stringify(ls);

                    window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`, "_self");
                    return;
                }

                startNextGameBtn.disabled = true;
                _btn.disabled = true;

                window.Sweetalert2.showLoading();
                
                if (ls._finishedGame && ls.maps.length === 0 && (ls.searchByPlayerId !== "" || ls.searchByTerms !== "")){
                    await searchByTermOrId(ls);
                }

                if (ls.mapsList.length !== 0){
                    ls.currentMap = ls.mapsList[Math.floor(Math.random() * ls.mapsList.length)];
                }

                if (ls.mapsList.length === 0){
                    for (let n = 0; n < 20; n++) {
                        const nextMap = await nextRandomMap(ls.minMapSize * 1000, ls.maxMapSize * 1000);
                        if (nextMap === null){
                            continue;
                        }

                        ls.currentMap = {n: nextMap.name, id: nextMap.id};
                        break;
                    }
                } 

                if (ls.currentMap === null){
                    alert(`Searched 20 maps and couldn't find one, press the button to try again.\n\nMay need to refresh page and verfiy you are a human?n`);
                    window.Sweetalert2.hideLoading();
                    startNextGameBtn.disabled = false;
                    _btn.disabled = false;

                    getSwalCloseBtn((el)=>{
                        if (el.innerText === "Close") el.style.display = '';
                    });

                    return;
                }
                 
                localStorage["RandomMapChallenge"] = JSON.stringify(ls);
        
                window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}` ,"_self");
           };
           
        },
        html: `
            <div class="_rmc_header">Random Map Challenge</div>

            <div id="_alert" style="color: red; display: none; line-height: 1.5em;">
                Need to replay map to continue!
                <div id="_alertExplanation"> </div>                
            </div>
            
            <div id="_greenAlert" style="color: green; line-height: 1.5em; display: none; overflow:hidden;">
                <div id="_greenMainMsg">
                    Everything looks good!
                </div>
                <div id="_greenExplanation" style=""> 
                   <div class="_greenCheck _aniMark"></div>
                   <div> Score:  <span style="font-weight:bold;">${parseInt(json.player.totalScore.amount).toLocaleString()}</span> </div>
                   <div> Time: <span style="font-weight:bold;">${formatTime(json.player.totalTime)}</span> </div>
                </div>                
            </div>

            <div style="margin-top: 1em;" >
                <button id="_startNextGameBtn" class="swal2-confirm swal2-styled _styledBtn _disabled clickyBtn" >Start Next Game</button>
            </div>
        `,
        allowOutsideClick: false, 
        confirmButtonText: "Close",
    }) ;

    function formatTime(time){
        //let time = json.player.totalTime;
        let min = Math.floor(time / 60);
        let sec = (time - (min * 60));
        return `${min? `${min} minute${min > 1?'s':''}`: ""}` + ` ${sec + ` second${sec > 1? "s":""}`}`;
    }
}
        
setInterval(()=>{
    // Main loop
    let _ls = localStorage["RandomMapChallenge"];
    if (!_ls) return;

    if (ls && ls.challengeEndTime){
        const hours = document.getElementById('_hours');
        const minutes = document.getElementById('_minutes');
        const seconds = document.getElementById('_seconds');
        const score = document.getElementById('_score');

        const timeLeft = ls.challengeEndTime - Date.now();
        let __hours = Math.trunc(timeLeft / (1*60*60*1000));
        let __minutes = Math.trunc((timeLeft - (__hours*60*60*1000)) / (60*1000));
        let __seconds = Math.trunc(((timeLeft - (__hours*60*60*1000)) - (__minutes*60*1000)) / 1000);

        hours.style.opacity = __hours === 0 ? "0.5": '';
        minutes.style.opacity = (__minutes === 0 && __hours === 0) ? "0.5" : '';
        seconds.style.opacity = (__seconds <= 0 && __minutes === 0) ? "0.5" : '';

        hours.innerText = __hours +" : ";
        minutes.innerText = __minutes > 9? __minutes +" : " : `0${__minutes} : `;
        seconds.innerText = __seconds > 9? __seconds : `0${__seconds}`;

        score.innerText = ls.maps.length;
    }

    _ls = JSON.parse(_ls);

    if (!_ls.challengeEndTime) return;

    if (Date.now() < _ls.challengeEndTime) return;

    delete localStorage["RandomMapChallenge"];

    let ls1 = localStorage[`RandomMapChallenge_saveInfo`] ? JSON.parse(localStorage[`RandomMapChallenge_saveInfo`]) : [];

    // Delete potentially large maps list from search results.
    _ls.mapsList = [];

    // Only save the last 100 challenges.
    if (ls1.length > 100){
        ls1.splice(0, ls1.length % 100);
    }
    
    debugger;
    let token = location.pathname.match(/\/.*\/(.*)/)[1]; 
    if (!ls._token || ls?._token !== token){
        _ls.currentMap.token = token;
    } else {
        _ls.currentMap = null;
    }

    ls1.push(_ls);

    localStorage[`RandomMapChallenge_saveInfo`] = JSON.stringify(ls1);
    
    let p = new window.Sweetalert2({
        didOpen: function(e){

            let startedTime = new Date(_ls.challengeStartedTime);
            startedTime = `${startedTime.getHours()}: ${startedTime.getMinutes()}: ${startedTime.getSeconds()}`;
            document.getElementById('_timeStart').innerText = startedTime;

            let endTime = new Date(_ls.challengeEndTime);
            endTime = `${endTime.getHours()}: ${endTime.getMinutes()}: ${endTime.getSeconds()}`;
            document.getElementById('_timeEnd').innerText = endTime;

        },
        html: `
            <div class="_rmc_header"  >Random Map Challenge Final Score!</div>
            <div id="_alert" class="_finalScore" >
                Challenge has ended! Your score is <span style="font-weight:bold">${_ls.maps.length}</span><div class="_aniMark" style="display:inline-block">!</div>
            </div>
            <details>
                <summary class="_prevChalGame _hover" style='margin-bottom: 0.5em; cursor: pointer;'>
                    Game Info.
                </summary>
                <div id="_infoContainer">
                    <div>
                        Finished maps: <span id="_finishedMaps">${_ls.maps.length}</span>
                    </div>
                    <div>
                        Challenge started at: <span id="_timeStart">${_ls.challengeEndTime}</span>
                    </div>
                    <div>
                        Challenge will end at: <span id="_timeEnd">${_ls.challengeEndTime}</span>
                    </div>
                    <div>
                        Challenge time (minutes): <span id="_challengeTime">${_ls.challengeTime / 1000 / 60}</span> 
                    </div>
                    <div>
                        Max map time (minutes): <span id="_mapTime">${_ls.mapPlayTime > 0? _ls.mapPlayTime / 60 : "---"}</span> 
                    </div>
                    <div>
                        Min map size (km): <span id="_minMapSize">${_ls.minMapSize.toLocaleString()}</span>
                    </div>
                    <div>
                        Max map size (km): <span id="_maxMapSize">${_ls.maxMapSize.toLocaleString()}</span>
                    </div>
                    <div>
                        Min map score: <span id="_mapScore">${_ls.minMapScore.toLocaleString()}</span>
                    </div>
                    <div>
                        Skips: <span id="_mapScore">${_ls.skipsUsed} / ${_ls.numOfSkips}</span>
                    </div>
                </div>
                <div style="margin-top: 1em;">
                    <input type="checkbox" disabled id="_fMoving" ${_ls.fMoving? "checked": ""}><label for="_fMoving">No Moving?</label>
                    <input type="checkbox" disabled id="_fRotating"${_ls.fRotating? "checked": ""}><label for="_fMoving">No Rotating?</label>
                    <input type="checkbox" disabled id="_fZooming"${_ls.fZooming? "checked": ""}><label for="_fMoving">No Zooming?</label>
                </div>
            </details>
        `,
        allowOutsideClick: false, 
        confirmButtonText: "Close",
        })
    }, 1000);
    
function patch_fetch(){

    if (window._unity_fetch_){

        window._unity_fetch_ = (function () {
            let _fetch = window._unity_fetch_;
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
    } else {
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
    }
}

function viewPreviousGames(){
    let prevGames = localStorage[`RandomMapChallenge_saveInfo`];

    if (!prevGames) {
        alert("No finished games found.");
        return;
    }
    
    prevGames = JSON.parse(prevGames);

    let _html = ``;
    prevGames.findLast((game)=>{
        // Use findLast to iterate backwards. https://stackoverflow.com/a/54261027
        _html += `
            <details>
                <summary class="_prevChalGame _hover" style='margin-bottom: 0.5em; cursor: pointer;'>
                ${(new Date(game.challengeEndTime).toString()).replace(/ \w+-.*/, '')}
                </summary>
                <div class="_prevChalMaps">
                    ${(()=>{
                            let str = ``;
                            if (game.maps.length === 0){
                                if (game?.currentMap?.id){
                                    // Send to map instead of game results because game might not have been finished.
                                    str += `<div><a href="https://www.geoguessr.com/maps/${game.currentMap.id}" style="color: #9ca1a3;" class="_prevChalMap _hover" title="Challenge ended in middle of this game.">${game.currentMap.n}</a></div>`;
                                } else {
                                    str += `<div>No finished maps found</div>`
                                }
                                return str;
                            }

                            game.maps.forEach(map =>{
                                if (!map?.token){
                                    // Send to map instead of game results because game might not have been finished.
                                    str += `<div><a href="https://www.geoguessr.com/maps/${map.id}" style="color: #9ca1a3;" class="_prevChalMap _hover" title="Challenge ended in middle of this game.">${map.n}</a></div>`;
                                    return;
                                }
                                str += `<div><a href="https://www.geoguessr.com/results/${map.token}"class="_prevChalMap _hover">${map.n}</a></div>`;
                            });

                            if (game?.currentMap?.id){
                                // Send to map instead of game results because game might not have been finished.
                                str += `<div><a href="https://www.geoguessr.com/maps/${game.currentMap.id}" style="color: #9ca1a3;" class="_prevChalMap _hover" title="Challenge ended in middle of this game.">${game.currentMap.n}</a></div>`;
                            }
                            return str;
                        })()} 
                    <div>
                        <textarea class="_prevGameTa" title="This is what your game looks like to a computer." rows="1" >${JSON.stringify(game)}</textarea>
                    </div>
                </div>
            </details>
        ` 
    });

    let p = new window.Sweetalert2({
        didOpen: function(e){ 
        },
        html: `
            <div class="_rmc_header">Previous Finished Games</div>
            
            <div class="_challengePrevSpecs" >
                ${_html}
            <div>
        `,
        allowOutsideClick: false, 
        confirmButtonText: "Close",
    }) ;
}

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
            autoNextMap: finishedGame.autoNextMap, 
            _finishedGame: {idx:0, obj: finishedGame},
            currentMap: finishedGame.maps[0],
            numOfSkips: finishedGame.numOfSkips,
            skipsUsed: 0,
            searchByPlayerId: finishedGame.searchByPlayerId,
            searchByTerms: finishedGame.searchByTerms,
            mapsList: [], 
        };

        if (finishedGame.currentMap){
            finishedGame.maps.push(finishedGame.currentMap);
        }

        localStorage["RandomMapChallenge"] = JSON.stringify(obj);
        
        alert("Starting a new Random Map Challenge!\n\nThis page will reload and the first map in the challenge will be available.\n\nChallenge will start when you start playing a game, Good Luck!");

        window.open(`https://www.geoguessr.com/maps/${obj.currentMap.id}`,"_self");
}

function getSwalCloseBtn(fn){
    document.querySelectorAll('.swal2-confirm').forEach((el) => {
        if (el.innerText === "Close") {
            fn(el);
        }
    });
}

setTimeout(()=>{
    document.head.insertAdjacentHTML('beforeend', `
        <style id="_swalOverride">

            /* Fix the SweetAlert backdrop from being black. */

            body.swal2-height-auto  {
                height: 100% !important;  
            }         
    </style>
    `);
}, 2000);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        .swal2-popup {
            font-family: "Neo Sans", var(--default-font);
            pointer-events: all; 
        }
         
        .swal2-popup button {
            font-family: "Neo Sans", var(--default-font);
            font-weight: 700;
        }
        
        .swal2-container {
            pointer-events: none; 
        }
        
        ._greenCheck{
            display: block;
            background-image: url("https://www.svgrepo.com/show/434030/check-mark.svg");
            background-repeat: no-repeat;
            background-size: 23%;
            background-position: 50% 50%;
            height: 5em;
        }

        ._challengePrevSpecs {
            max-height: 40vh;
            overflow-y: auto;
            scrollbar-color: #676bda transparent;
            scrollbar-width: thin;
        }

        ._challengePrevSpecs summary::marker {
            color: #5b6fd4;
        }

        ._challengeSpecs input[type=number], ._challengeSpecs input[type=text]{
            width: 6em; 
            border-radius: 5px;
            background: #7066e017;
        }

        ._challengeSpecs input[type=text]{
            width: 16em; 
        }

        ._rmc_header {
            font-weight: bold;
            margin-bottom: 1em;
            padding: 5px;
            color: white;
            background: #676bda;
            background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='50px' width='50px'><text x='0' y='20' fill='%23D4C05B' fill-opacity='0.5' font-size='20'>beta</text></svg>");
            background-position: -1% -11%; 
        }
        
        ._progBtn {
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            display: grid;
            grid-template-columns: 5.8em 1fr;
            grid-template-rows: auto auto;
        }

        ._hover:hover {
            cursor: pointer;
            color: blue !important;
        }

        ._styledBtn{
            background-color:#6cb928;
        }

        ._styledBtn:hover{
         background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));  
        }

        ._prevChalMaps {
            max-height: 7em;
            margin-bottom: 1em;
            line-height: 1.5em;
            overflow-y: auto;
            scrollbar-width: thin;
            background-color: aliceblue;
        }

        ._disabled:disabled{
            background-color: grey;
        }
        
        ._menu_button {
            font-size: 16px;
            color: white;
            right: calc(4em);
            top: calc(6em);
            box-shadow: rgba(0, 0, 0, 0.1) 0px 8px 15px;
            position: absolute;
            padding: 0.625em 1.1em;
            cursor: pointer;
            z-index: 999999999;
            background-color: rgb(255, 153, 153, 0.8);
            background-image: url("https://www.svgrepo.com/show/326034/question-circle.svg");
            background-repeat: no-repeat;
            background-origin: content-box;
            background-size: 1.8em;
            background-position: 50% 50%;
            border-radius: 25px;
            height: 2.5em;
            width: 3em;
        }

        ._menu_button:hover {
           scale:0.95; 
        }

        ._stats_button {
            font-weight: 500;
            right: calc(7.5em);
            width: fit-content;
            background: rgba(186, 85, 211, 0.8); 
            background-position: 17.5em;
            text-align: left;
        }

        #_infoContainer span{
            font-weight: bold; 
        }
        
        ._aniMark{
            animation: mymove 1s;
        }

        @keyframes mymove {
            40% {scale:1}
            60%   {scale: 2;}
            100% {scale: 1;}
        }

        ._prevGameTa{
            border: 1px solid #d3d3d3; 
            opacity:0.2;
            margin-top: 1em;
        }

        ._prevGameTa:hover{
            opacity: 1; 
        }
        
        ._finalScore {
            background-color: #6BDA6730;
            padding:1em;
            color: green;
            font-size: 1.2em;
            margin: 1em 0em;
            background-image: url(https://www.svgrepo.com/show/452120/trophy.svg);
            background-size: 100% 90%;
            background-repeat: no-repeat;
            background-position: center;
        }

        .body.swal2-height-auto  {
            height: 100% !important;  
        }         
    </style>
    
    <style>
        @font-face {
        font-family: "Neo Sans";
        src:
        local("Neo Sans"),
        url('https://echandler.github.io/test-geo-noob-script/misc/Neo%20Sans%20Std%20Regular.otf') format("opentype");
        }
    </style>
    
    `);


    function loadSweetAlert(){
        const sw = document.createElement( 'script' );
        sw.id = "_sweetAlert";
        sw.setAttribute( 'src', `https://cdn.jsdelivr.net/npm/sweetalert2@11` );
        document.body.appendChild( sw );
    }
