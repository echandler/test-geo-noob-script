/ ==UserScript==
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

    const defaultMaps = "6029991c5048850001d572a9,61816f7a5912780001b67092,6690658d3d507f8e401dbb32,6084944217a48e00012ea121,65c0df20363a6fc9f51657b0,6677d4471536a2df6b9846d1,6441a874895797077a027d5e,62f667473b7c34a9e9d44549,66915dfd404d6390c331ed02,62c401670a427aba1e3f79b6,66c77c6b24008c6727599fed,66c24075290ceb1901230ef5,6681071d7116c23d8c0011d7,66cdf29e06082dc5af2bb3f7,66d899009b21529963082f20,658447aecf12db5dbe627858,64c690837300eb4ceb4e69d9,62945e1a391564acaee57c3d,66ca4fa6095a4f41baf7b414,65a95ae79f00f2ccdb91d2e8,662fd576670b0cb42fc9a000,60496c604aa8c3000187082f,61bcf6b06d95ab000186b94b,66f061310b443a16eca522db,65cbae773813012df05d623f,65234123e0567b10c2543e66,668c72519c4d9744029f2243,622a13d50ee24e0001de25d9,66f061310b443a16eca522db,66270998be739b205bb2f1e5,6676492d944223b0e6ded634,63541f3669223f6c25f61f96,62aa2ffef45be669a0cc9e89,645fa86dbc1a923693bcc381,66b8d35f8931540bc3b6fb88,65f58c961657435a2a828dc8,63541f3669223f6c25f61f96,631df4b39427b26d568dc488,63304ccb30749c30b9a83a89,6070f3e98ae57c0001b18dbb,64162adfd46f82c177976b12,60304bd7098571000133784d,636faf98203246c00bbd8a7e,636faf98203246c00bbd8a7e,6318b89d582546245c55a96c,6318c09a13168ddbc4157853,63035cd66b380e63172efa8d,609448e812905400018a76e1,61325442eadbec00018b6385,629138039f28f66570f68d0e,62dd30d95b5fa539b12e84f6,607aab7325a52a0001e271c5,6054a87bb2a413000194dafc,61bc82f26d1aed000177f9e7,667dab025a1e617dd25198c4,65f882b9b66c5517ad3f0cea,65c49d5b573d429803e00575,6496fbc01a06b3888f6f9114,6609c8e34b1ee0493b4efe26,6496fbc01a06b3888f6f9114,64eb1f467062c0907a1097b6,63ddbefd9b6fc8d9ea0d1ce9,644a6393b63dd126dc47392b,603c2d3cd19ba40001ec5860,634266c98f0f00a7e457f4e9,6009b57e0fe74c0001edd646,58b0a9b2f45b68aa6436aac2,636b2478534d763e695bd2bc,6170e44f9f365e0001b3f433,621e98dc8228a30001a228fd,6127f8764dcea10001c8bfa1,6303294f6b380e63172ef0ec,66528075742cee9b1fded493,5ebd51c6de3c4c5aec1c3bb7,5eee076e62df1243a0cf38fd,6021d4b55607e700011b2065,636b0a491c56a9bc11a1c9e1,606f76d8a26eca0001bf0f86,5fb6f5a192d5620001e1d374,5ffb291f1ec970000114c6ec,66312f45f53f47463378d76a,6604a030ff7ef86636142ff6,66be75c2cd71e8258739153e,666733e83a19ce2ccd346d12,5f30df6cef21b000019da6f9,6266017e7e047a2bef7b3de0,5f14b18e41f84798102b3b81,63006ce02c21ff6a7029bbf5,574dd9c877abe9cba8d27747,5cf5685ab741f81464ba63d4,605a5868efdc350001bcc45d,605d4d6394ce8600016b7ba8,618ab71bac92f6000170d02b,661e91332c6f38f2b34a8b7c,661e91332c6f38f2b34a8b7c,661fe80a7c5feac0fb84dc9d,66c8dc058376528e05b49bc0,6180335e1b07e300011e2d7b,64a2519fa24fe38c8804b3b8,6057908eb67eb80001a32495,5e7ed178cd30753eb4beae48,5719e00cbfac4281a4f85d2d,5a2439d439372529f01197d1,66a7294b784f155ddbcb050e,62d7730ab23e02592161b943,6048f236fbd27b00019257f2,66927d02404d6390c3339a24,66c6bdb7773a22e231802dda,5a29d64139372579687799b3,652ee66d4f139fc2dccec6ed,6587d10e6e6f08b2da40e185,5919eb9252e6ca6cac1992c8,62d89711b118768fddc67d3b,60e36b1740bac50001d79641,6583cc50c83871cdb1311ccb,65cfc6305357ce14ed980603,63a8ef61fa09549be219e379,65bdf71aab0e57053216d2ea,66c0fc8e515ebf2ff7a754ad,617410c0ad49250001afdfe8,66ee2de49613657c200844a8,667eefb4202c6fba706688ff,626a9cf2a77fbfb27f4155c2,633c5f432b4b415f2b86bdbc,63f131bc7f7dec3d5f9fc2e2,6127e264284e3100011dd608,6371873ae517528567dfcb75,6380a574c71bd2443872f90f,637d672fe410b09115a0ad5c,62e8795830325f6815a8a347,60b9809134dce100010c5feb,615b806fe2d91f0001f7aca5,66a717ea4d69c0a3a2ca0afa,5ecd9050e2b67a34646fe7ea,5ff23b055de5560001f40f12,6081da577c5dec00015e29a6,6060f63712c7b700012b0608,6041445d0297940001bb3c67,63505cd93e6614ba63d2d06b,634c242da066a780efe1ae01,62aa604ca8692c7ef27418c8,62811662711417dae0ce59f9,62d17b569335196c3972a73e,61065f72dd0ee100010a14a1,611042955e6d8d00011ac2d9,63af3b87e01e5822a3ab3aaf,634c242da066a780efe1ae01,62d17b569335196c3972a73e,621bae379ee1a1000129f579,62aa604ca8692c7ef27418c8,62811662711417dae0ce59f9,63af3b87e01e5822a3ab3aaf,61b72312dce769000130e997,62391fafbe687aa87fdcf631,64d02ecb8d2b82e1f8660421,63f1e4427f7dec3d5f9ff755,650866cbd3667d095b84a430,5efdcc8fbcbd7940c4d06ebd,5d8529351d19ab1da042c4b6,5d7ec783df1dd6456c2c04da,5dcdb64444d2a413708bf03a,585164ee0eac724b6cd3b5ad,587eec140eac728794219b6f,5c035c96b5b94b0df0294d22,5edeb4f990e08883902c4ad8,5f35af70bb43ba000132bfbf,5f6cb2c5dbf8e900012d25e8,62bf04c2cd67f02e3ae2f4c6,60be64f70709db00011e030f,647b787e912f0924282a47e1,6477dbdb0c5e47767168e59c,64bfde19f228b13a66e4ffc5,664fe9ddcf0033f23836f562,5be60f5bfdd598641cb778ac,59644dc09a4f706a2c9cc769,619c394daf75bd00017e13e2,5e988593eb473f3bd8eabdb6,60502e965f66f500015845ad,6046d69ea796d40001724005,60b6444a9fc4230001a230ad,628684631a66eea9ea025d57,61ae58afaf98410001cf12ea,613b56d76d19c400017f4ef7,5e9d1cfdd502e1387417ebea,5f4931cc0088410001ca21cd,600369ff31b2eb0001269c7e,60054f9731b2eb000127c34b,604197652f5455000122ced7,62fbbc70a93a03ec5925997f,613ba155210d2e00019aa444,614a53f7f308970001c606ff,647a58523e4f048682498023,60aedf3960d1f000019f2ad2,60ec7758edfbcc0001d75122,61dfa4a936a8b60001fecf2d,5979dc90f8017993f0eea166,5edfd15590e08883902c88e5,5fea89e75de5560001f0ddbf,60651167720a6300017ffbec,62d339292f4fdd8413a2b2bc,60ff96085d6e040001bf95f7,635aad0d2b05738d22cd4fd9,622f76dd10c44100010b3b1b,6243d6e19f2907aa27df220c,60495ad84d15500001b58164,61c07dd6548e300001f1693e,5e48721b8fd6cf2f4c9c347a,5eed4e2cc40eff35508c6e1f,5f05b3211d50903ed032698d,5f1732bfd6ca438f2401ab1c,5fee1ced892bf00001aadb99,6420b65e792d13379ef5946c,6229d8b0008f0400015e2a50,629e533dff582447c001a393,6207ace7d1c2be000162e98d,62393d02476885f223a8e6d5,5f31ee5a62c16a0001d0b7d7,6051675e7c11e2000111c551,60563029ebef540001848930,60106edac4a6d500010ea290,60106edac4a6d500010ea290,634df614c32f815098b8c8e2,62d4d5a6640e5a876fd31c96,617a5903b3fe9d00015fa39f,619a62b36cf4a600017b42ff,609424539796420001f7d93f,63d1639931007b86543d1092,638e1da6791c11c930ddc638,63e1573558300fd915d02c76,64f51c077c3224c6995532a4,61da0fee11f4f70001170017,637f9cc7a01a4b1ad074df69,6034108874c30f0001898a31,579e5cd9873337667455ea50,5cec8dbf81148c711c2a0914,5edd7fac88a0411870432a1a,60622544f93f570001132fab,62a30e695a1af5da35101eae,5c5aba6998004e1e0c4816a7,5c96a2d262aa6e9bfc40fae5,60623594578a37000152812a,608390faeb35e60001f9bb71,607f176591e5dd0001bec66f,603f95fd5dae140001e5f42f,603e86ae5dae140001e5581e,628e459d6062f9ddfc668c48,627fd25072725629d8018ae0,60ccca021ab8d3000126ba4a,61b57335dce76900013061ac,64ff251f2b78cef34b37cbf5,5f94d18e64681500012a1f8d,6262f254a37c8bc48cd83d6b,60a3e81e90564e00010c8e25,623a3fafb901c5dc8b83b9f6,5fd7fff307f9fe0001facfab,609b303912082a00017655e3,6249c8c6875cb7e468764b05,627942c3f92a6e2f8b58796f";

    let isHandlingEOR = false;
    let _eorBtn = null;
    let observer = new MutationObserver(mutationRecords => {
        // Trying to detect the end of the round.
        // This is a backup of the monkey patched fetch hack, which is faster and doesn't require an extra fetch request.
        setTimeout(async () => {
            if (handleEndOfGameIsHandling || isHandlingEOR) return;

            const eorBtn = document.querySelector('[data-qa="close-round-result"');

           // if (!eorBtn || _eorBtn === eorBtn || eorBtn.textContent.toLowerCase() === "next") return;
            if (!eorBtn || _eorBtn === eorBtn) return;

            _eorBtn = eorBtn;
            isHandlingEOR = true;

            setTimeout(()=>{
                isHandlingEOR = false;
            }, 2000);

            const id = location.pathname.replace(/\/.*\/(.*)/, "$1");

            //if (curEorJSON && (curEorJSON.state !== 'finished' || curEorJSON.token === id)) return;
            //if (curEorJSON && (curEorJSON.token === id)) return;

            let info = await fetchGameInfo(id);
            
            if (handleEndOfGameIsHandling) return; // Check second time after fetch.

            info._mutationObserved = true;

            //curEorJSON = info;
            
            if (eorBtn.textContent.toLowerCase() !== "next"){
                // "Next" is between rounds not end of game.
                handleEndOfGame(info);
            }

            if(info.player.totalScore.amount >= ls.minMapScore){
                handleEndOfGame(info);
            }
        }, 100);
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
                    if (confirm("Click 'Ok' if you want to use a skip? Click 'Cancel' if map is broken, doesn't fit your game plan, ect.")){
                        ls.skipsUsed += 1;
                    }
                    jumpToWikiXplore();
                });
                
                function jumpToWikiXplore(){
                    ls.currentMap = {
                        id: "66a46adc321fb0b8f5eeb270",
                        n: "Exact locations [WikiXplore]" 
                    };
                    
                    localStorage["RandomMapChallenge"] = JSON.stringify(ls);
                    
                    window.open(`https://www.geoguessr.com/maps/${ls.currentMap.id}`,"_self");
                    return;
                };

                const pauseBtn = document.getElementById('_pauseBtn');
                pauseBtn.addEventListener('click', ()=>{
                    if (!ls.isPaused){
                        pauseBtn.innerText = "Unpause";
                        ls.isPaused = ls.challengeEndTime - Date.now();
                    } else {
                        pauseBtn.innerText = "Pause";
                        ls.challengeEndTime = Date.now() + ls.isPaused;
                        ls.isPaused = null;
                    }
                    
                    localStorage["RandomMapChallenge"] = JSON.stringify(ls);
                    
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
                    <button id="_skipMapBtn" class="swal2-confirm swal2-styled _disabled _styledBtn" ${(!ls.challengeEndTime || (ls.skipsUsed < ls.numOfSkips)) ? "": "disabled"} >Skip map</button>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_pauseBtn" class="swal2-confirm swal2-styled _disabled _styledBtn" ${(!ls.challengeEndTime || !ls.challengeStartedTime) ? "disabled": ""} >${(ls.isPaused) ? "Unpause": "Pause"}</button>
                </div>
                <div style="margin-top: 1em;" >
                    <button id="_endGameBtn" class="swal2-confirm swal2-styled _styledBtn" >End game</button>
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
            handleMainPopup(p);
        },
        html: `
            <div class="_rmc_header">Random Map Challenge</div>
            
            <div class="_challengeSpecs">
                <div class="_inputs" style="display: grid; grid-template-columns: max-content min-content; column-gap: 1em; align-items: center; text-align:left; width: fit-content; margin: 0px auto;">
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

                <div class="_stuff" style="display: grid; grid-template-columns: max-content min-content; column-gap: 1em; align-items: center; text-align:left; width: fit-content; margin: 0px auto;">
                    <div id="_mapSearch"> 
                        Map search
                        <div class="__popupMsg">
                            Searching for a word such as "diverse" will return a list of maps containing the word "diverse", much better than GeoGuessr's random map generator.
                        </div>
                    </div> 
                    <input id="_searchByTerms" style="" type="text" placeholder="Enter search terms here.">
                    <div> Maps made by player </div> 
                    <input id="_searchByPlayerId" style="" type="text" placeholder="Enter player id# here.">
                    <div id="_listOfMapsLink" class="_hover"> 
                        List of maps 
                        <div class="__popupMsg">
                            GeoGuessr's random map generator returns a lot of lame maps, it is highly recommended that you use your own custom list of comma seperated map id's or choose one from the link above!
                        </div>
                    </div> 
                    <input id="_listOfCustomMaps" style="" type="text" value="${defaultMaps}" placeholder="Enter a list of maps here.">
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

function handleMainPopup(p){
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
    const listOfCustomMapIds = document.getElementById('_listOfCustomMaps');
    const listOfMapIdsLink =  document.getElementById('_listOfMapsLink');

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
    
    listOfMapIdsLink.addEventListener('click', (e)=>{
        window.open(`https://echandler.github.io/test-geo-noob-script/misc/randomMapIds.html`,"");
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
            listOfCustomMapIds: listOfCustomMapIds.value,
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
        
        if (obj.listOfCustomMapIds){
            formatListOfCustomMaps(obj.listOfCustomMapIds, obj);
        }

debugger;

        if (obj.mapsList.length !== 0){
            let filteredMaps = [];

            for (let n = 0; n < 200; n++){
                // Build list of maps that haven't been played recently.
                filteredMaps = filterNumOfTimesPlayed(n, obj.mapsList);
                if (filteredMaps.length !== 0){
                    break;
                }
            }

            let randomMap = filteredMaps[Math.floor(Math.random() * filteredMaps.length)];

            randomMap._numOfTimesPlayed += 1;

            obj.currentMap = randomMap;
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

    return json?.props?.pageProps?.map;
}

async function nextRandomMap(min, max){
    let mapInfo = await fetchRandomMap(min, max);
    if (mapInfo === null) return null;

    let coordCount = parseInt(mapInfo.coordinateCount.replace(/\+/, ''));

    if (mapInfo.coordinateCount.toLowerCase().indexOf("k") !== -1){
        coordCount *= 1000;
    }

    if (coordCount < 50) return null;
    
    if (min && mapInfo.maxErrorDistance < min) return null;
    if (max && mapInfo.maxErrorDistance > max) return null;

    return mapInfo;
}

async function fetchGameInfo(id){
    const gameInfo = await fetch(`https://www.geoguessr.com/api/v3/games/${id}`).then(res => res.json());
    return gameInfo;
}

function formatListOfCustomMaps(strListOfMapIds, obj){
   let arrayOfMapIds = strListOfMapIds.split(",");
   
   let arrayOfMapObjs = arrayOfMapIds.map(id =>{
        return {
            id: id.replace(/"|'/g, ''),
            name: "",
            _numOfTimesPlayed: 0,
        };
   });

   obj.mapsList = arrayOfMapObjs;
}

function filterNumOfTimesPlayed(num, arrayOfMapIds){
   return arrayOfMapIds.filter(map =>{
        return map._numOfTimesPlayed == num;
   });
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
    
    obj.mapsList.forEach( map=> { 
        map._numOfTimesPlayed = 0;
        map.n = map.name;
     });
} 
 
window.sdfe = async function(){
    let ret = [];
    let min = 10000 * 1000;
    let max = 19000 * 1000;

    for (let n = 0; n < ls.mapsList.length ; n++){
        let map = ls.mapsList[n];

    //ls.mapsList.forEach( async(map) =>{
        let mapInfo = await fetch(`https://www.geoguessr.com/api/maps/${map.id}`).then(res => res.json());

        if (mapInfo === null) continue; 

        let coordCount = parseInt(mapInfo.coordinateCount.replace(/\+/, ''));
        
        if (mapInfo.coordinateCount.toLowerCase().indexOf("k") !== -1){
            coordCount *= 1000;
        }

        if (coordCount < 50) continue;
        
        if (min && mapInfo.maxErrorDistance < min) continue;
        if (max && mapInfo.maxErrorDistance > max) continue;

        ret.push(mapInfo);
    };
    
    return ret;
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
        
        if (!ls?.mapsList?.length && (!ls._finishedGame || (ls._finishedGame.idx +1 >= ls._finishedGame.obj.maps.length))){
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
    
    //curEorJSON = json;

    handleEndOfGameIsHandling = true;

    let p = new window.Sweetalert2({
        willClose: function(){
            handleEndOfGameIsHandling = false;
            const btn = document.getElementById('_nextGameBtn');
            if (!btn) return;
            // Show next game button if player clicked out of alert.
            btn.style.display = "";
        },
        didOpen: function(e){ 
            const _alert = document.getElementById('_alert');
            const _greenAlert = document.getElementById('_greenAlert');
            const startNextGameBtn = document.getElementById('_startNextGameBtn');
            startNextGameBtn.disabled = false;

            if (json.player.totalScore.amount < ls.minMapScore){
                const score = parseInt(json.player.totalScore.amount).toLocaleString();
                _alert.style.display = "";
                const _alertExplanation = document.getElementById('_alertExplanation');
                _alertExplanation.innerHTML = `Your score is <span style="font-weight:bold; ${json._mutationObserved? `text-decoration: underline;`: ''}">${score}</span>; the number to beat is <span style="font-weight:bold;">${ls.minMapScore.toLocaleString()}</span>!`;
                _alertExplanation.style.color = "#b92828";
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
            
            localStorage["RandomMapChallenge"] = JSON.stringify(ls);

            const _currentMap = ls.currentMap;
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
                    let filteredMaps = [];

                    for (let n = 0; n < 500; n++){
                        // Build list of maps that haven't been played recently.
                        filteredMaps = filterNumOfTimesPlayed(n, ls.mapsList);
                        if (filteredMaps.length !== 0){
                            break;
                        }
                    }
 
                    if (ls.mapsList.length > 1){
                        // Make sure it wasn't previous map played.
                        filteredMaps = filteredMaps.filter(map => map.id !== _currentMap.id);
                    }

                    ls.currentMap = filteredMaps[Math.floor(Math.random() * filteredMaps.length)];

                    ls.currentMap._numOfTimesPlayed += 1;
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
                    alert(`Searched 20 maps and couldn't find one, press the button to try again.\n\nMay need to refresh page and verfiy you are a human?`);
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
                <img style="width: 30%;margin-bottom: 0.6em;" src="https://www.svgrepo.com/show/436410/exclamation.svg">
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
        
let sp = setInterval(()=>{
    // Main loop
    let _ls = localStorage["RandomMapChallenge"];
    if (!_ls) return;
    
    if (ls && ls.isPaused) return;

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
            document.getElementById("swal2-html-container").style.overflow = "visible";

            let startedTime = new Date(_ls.challengeStartedTime);
            startedTime = `${startedTime.getHours()}: ${startedTime.getMinutes()}: ${startedTime.getSeconds()}`;
            document.getElementById('_timeStart').innerText = startedTime;

            let endTime = new Date(_ls.challengeEndTime);
            endTime = `${endTime.getHours()}: ${endTime.getMinutes()}: ${endTime.getSeconds()}`;
            document.getElementById('_timeEnd').innerText = endTime;

        },
        html: `
            <div style=" position: absolute; left: 0%; top: 0px; width: 100%; height: 100%; overflow: hidden;z-index: -5; ">
                <div class="_rotatingStripes" style=""></div>
            </div>
            <div class="_rmc_header"  >Random Map Challenge Final Score!</div>
            <div id="_alert" class="_finalScore" >
              <!--  
                    Challenge has ended! Your score is <span style="font-weight:bold">${_ls.maps.length}</span><div class="_aniMark" style="display:inline-block">!</div>
              -->
                 <span style="font-weight: bold;">Good Job</span><div class="_aniMark" style="display:inline-block">!</div>
                <div style="height: 5em; margin-top: 1em;line-height: 1;">
                    <img style="    height: 5em; opacity: 0.5; position: absolute; width: 100%; left: 0px; z-index: -1;" src="https://www.svgrepo.com/show/452120/trophy.svg">
                    <div class="___score _aniMark" style="position: relative;">
                        <span style="font-weight:bold; font-size: 5em;">${_ls.maps.length}</span>
                    </div>
                </div>
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
    document.body.insertAdjacentHTML('beforeend', `
        <style id="_swalOverride">

            /* Fix the SweetAlert backdrop from being black. */

            body.swal2-height-auto  {
                height: 100% !important;  
            }         
            
            .swal2-show {
                --color: white;
                opacity: 0;
                animation: world-cup-signed-in-start-page_popIn__xoXsd .6s cubic-bezier(0.34,1.56,0.64,1) .2s forwards;
           /*     
                backdrop-filter: blur(20px) saturate(400%) brightness(0.9);
                color: var(--color);
                background: transparent; 
            */
            }
            
            /*
                .swal2-show input{
                    color: var(--color);
                }
            */

            @keyframes world-cup-signed-in-start-page_popIn__xoXsd {
                0% {
                    opacity: 0;
                    transform: scale(.5)
                }

                to {
                    opacity: 1;
                    transform: scale(1)
                }
            }
    </style>
    `);
}, 0);
//font-family: "Neo Sans", var(--default-font);
//
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .swal2-popup {
            font-family: "hp", "Neo Sans", var(--default-font);
            pointer-events: all; 
        }
         
        .swal2-popup button {
            font-family: "hp", "Neo Sans", var(--default-font);
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
            padding:1em;
            color: #00a127;
            font-size: 1.2em;
            margin: 1em 0em;
         /* 
            background-color: #6BDA6730;
            background-image: url(https://www.svgrepo.com/show/452120/trophy.svg);
            background-size: 100% 90%;
            background-repeat: no-repeat;
            background-position: center;
            */
        }

        .body.swal2-height-auto  {
            height: 100% !important;  
        }         
        
        ._rotatingStripes {
            height: 200%;
            width: 200%;
            animation:spin 70s linear infinite;
            background-image: url( 'https://beamtic.com/Examples/radial-stripes.svg');
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: 60%;
            z-index: -3;
            translate: -25% -25%;
            z-index: -1;
            opacity: 0.1 ;
        }

        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } } 
        
        #_listOfMapsLink, #_mapSearch{
            font-weight: bold;
            color: #5eb741;
        }

        #_listOfMapsLink:hover > .__popupMsg, #_mapSearch:hover > .__popupMsg{
            color: #b92828;
            display: block !important;
        }

        .__popupMsg {
            position: absolute;
            height: fit-content;
            /* top: 0px; */
            background: white;
            outline: 1px solid #b92828;
            padding: 1em;
            display: none;
            margin-top: 1em;
            width: 50%;
            line-height: 1.5em;
            font-size: 0.8em;
            border-radius: 10px;
        }
        
        #_searchByTerms::placeholder, #_listOfCustomMaps::placeholder {
            color: #5eb741;
            opacity: 1; /* Firefox */
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
    // <style>
        //  @font-face {
        //  font-family: "hp";
        //  src:
        //  local("hp"),
        //  url('https://support.hp.com/wcc-assets/fonts/FormaDJRUI.woff') format("woff");
        //  }
    //     @font-face {
    //     font-family: "hp";
    //     src:
    //     local("hp"),
    //     url('https://www8.hp.com/etc.clientlibs/HPIT-AEM-GLOBALNAV/clientlibs-globalnav/clientlibs-fonts/clientlib-hf-fontface-core/resources/fonts/HpSimplifiedLight.woff') format("woff");
    //     }
    // </style>


    function loadSweetAlert(){
        const sw = document.createElement( 'script' );
        sw.id = "_sweetAlert";
        sw.setAttribute( 'src', `https://cdn.jsdelivr.net/npm/sweetalert2@11` );
        document.body.appendChild( sw );
    }
