GM_addStyle(`
 ._img:hover { width: auto !important; }
 ._divImg:hover { z-index: 1000 !important; }

`);

let __int = setInterval(()=>{
        if (!MWGTM_M) return;

        clearInterval(__int);

        //console.log(MWGTM_SV, MWGTM_SVC, MWGTM_M);

       // let _data_ = [{"pos":{"lat":-23.542874439295087,"lng":-46.640889860869144},"num":11},{"pos":{"lat":-23.222010762926587,"lng":-45.438881960761854},"num":12},{"pos":{"lat":-24.57794659724267,"lng":-47.636147585761854},"num":13},{"pos":{"lat":-22.480705083622574,"lng":-49.31278643234018},"num":14},{"pos":{"lat":-23.92462693660213,"lng":-48.35697588546518},"num":15},{"pos":{"lat":-21.113834724606875,"lng":-48.25809893234018},"num":16},{"pos":{"lat":-20.549088993403945,"lng":-49.78519854171518},"num":17},{"pos":{"lat":-21.911064104726474,"lng":-51.52103838546518},"num":18},{"pos":{"lat":-22.114772320069637,"lng":-47.34623369796518},"num":19},{"pos":{"lat":-22.883736390088206,"lng":-43.174825675250496},"num":21},{"pos":{"lat":-22.25806785705695,"lng":-41.82517664885884},"num":22},{"pos":{"lat":-22.395264482253697,"lng":-43.86863368010884},"num":24},{"pos":{"lat":-21.132549771700944,"lng":-41.05042478433147},"num":28},{"pos":{"lat":-20.228060057513183,"lng":-40.55604001870647},"num":27},{"pos":{"lat":-19.883547780913972,"lng":-43.97212421160874},"num":31},{"pos":{"lat":-21.287967272666712,"lng":-43.799622715679206},"num":32},{"pos":{"lat":-17.998195387207737,"lng":-41.6084864080513},"num":33},{"pos":{"lat":-19.028797751150634,"lng":-47.8267481268013},"num":34},{"pos":{"lat":-21.74716816965603,"lng":-45.5855371893013},"num":35},{"pos":{"lat":-19.236387053830775,"lng":-45.8931543768013},"num":37},{"pos":{"lat":-16.20192526131874,"lng":-44.4869043768013},"num":38},{"pos":{"lat":-25.43884873727725,"lng":-49.287681447973156},"num":41},{"pos":{"lat":-25.120955123237906,"lng":-51.441001760473156},"num":42},{"pos":{"lat":-23.52927940926478,"lng":-50.649986135473156},"num":43},{"pos":{"lat":-23.549423632574864,"lng":-52.946128713598156},"num":44},{"pos":{"lat":-25.101059162442382,"lng":-54.011802541723156},"num":45},{"pos":{"lat":-25.850787836273653,"lng":-53.330650197973156},"num":46},{"pos":{"lat":-26.886263144374652,"lng":-49.461282374550926},"num":47},{"pos":{"lat":-28.22063158963385,"lng":-49.021829249550926},"num":48},{"pos":{"lat":-27.218928883139487,"lng":-51.241067530800926},"num":49},{"pos":{"lat":-29.911065630761303,"lng":-51.23382810068637},"num":51},{"pos":{"lat":-31.55412576708923,"lng":-52.81585935068637},"num":53},{"pos":{"lat":-28.375861324053268,"lng":-52.11273435068637},"num":54},{"pos":{"lat":-29.127138520764063,"lng":-54.70550778818637},"num":55},{"pos":{"lat":-15.800162528320032,"lng":-47.89581036199103},"num":61},{"pos":{"lat":-14.50646560784001,"lng":-49.98321270574103},"num":62},{"pos":{"lat":-10.258148060901531,"lng":-48.26934551824103},"num":63},{"pos":{"lat":-17.61743877472177,"lng":-50.841532782565},"num":64},{"pos":{"lat":-15.384432258475998,"lng":-57.0644696273558},"num":65},{"pos":{"lat":-12.505890316169774,"lng":-54.1201336898558},"num":66},{"pos":{"lat":-20.455659860343,"lng":-54.611285922517936},"num":67},{"pos":{"lat":-10.76943996346674,"lng":-63.09281100354144},"num":69},{"pos":{"lat":-12.931189430258087,"lng":-38.470548641175796},"num":71},{"pos":{"lat":-15.656331542695654,"lng":-39.305509578675796},"num":73},{"pos":{"lat":-10.537260173191607,"lng":-40.722745906800796},"num":74},{"pos":{"lat":-10.742411464570326,"lng":-38.569425594300796},"num":75},{"pos":{"lat":-13.449225289468,"lng":-43.55869443124104},"num":77},{"pos":{"lat":-10.591260714975357,"lng":-37.18662411874104},"num":79},{"pos":{"lat":-8.030010048514221,"lng":-35.64049076834555},"num":81},{"pos":{"lat":-9.614982786827492,"lng":-36.12388920584555},"num":82},{"pos":{"lat":-7.049802077614197,"lng":-36.06895756522055},"num":83},{"pos":{"lat":-5.663150740057879,"lng":-36.23375248709555},"num":84},{"pos":{"lat":-4.032099198780388,"lng":-38.81553959647055},"num":85},{"pos":{"lat":-4.196469375172888,"lng":-40.69420170584555},"num":86},{"pos":{"lat":-8.258395963684123,"lng":-38.45299076834555},"num":87},{"pos":{"lat":-5.280382126779516,"lng":-39.35386967459555},"num":88},{"pos":{"lat":-7.442150498132251,"lng":-41.77086186209555},"num":89},{"pos":{"lat":-4.0260278815005455,"lng":-49.50160856877288},"num":91},{"pos":{"lat":-3.148852509717535,"lng":-60.13637419377288},"num":92},{"pos":{"lat":-5.514950064103183,"lng":-54.33559294377288},"num":93},{"pos":{"lat":-7.087373284965548,"lng":-50.46840544377288},"num":94},{"pos":{"lat":2.1225130506504946,"lng":-61.23500700627288},"num":95},{"pos":{"lat":1.2439946800133443,"lng":-51.43520231877288},"num":96},{"pos":{"lat":-4.420460977555801,"lng":-65.49770231877288},"num":97}]; 
        let _data_ = [{"pos":{"lat":32.97335227715507,"lng":-87.56213292840152},"name":"Alabama license plate.JPG"},{"pos":{"lat":32.99178373721068,"lng":-86.22180089715152},"name":"Alabama license plate 1.JPG"},{"pos":{"lat":35.748550925279574,"lng":-112.95638974949027},"name":"Arizona license plate.JPG"},{"pos":{"lat":34.59910920988688,"lng":-111.33041318699027},"name":"Arizona license plate 1.JPG"},{"pos":{"lat":33.04761336882644,"lng":-111.04476865574027},"name":"Arizona license plate 2.JPG"},{"pos":{"lat":35.80059615678394,"lng":-92.68451508691949},"name":"Arkansas license plate.JPG"},{"pos":{"lat":34.597652728881215,"lng":-92.64056977441949},"name":"Arkansas license plate 1.JPG"},{"pos":{"lat":33.72495722500976,"lng":-92.68451508691949},"name":"Arkansas license plate 2.JPG"},{"pos":{"lat":36.63897722191986,"lng":-119.81858507308563},"name":"California license plate.JPG"},{"pos":{"lat":38.949658252354084,"lng":-105.6936509221151},"name":"Colorado license plate.JPG"},{"pos":{"lat":41.72254918713193,"lng":-73.03047651260135},"name":"Connecticut license plate.JPG"},{"pos":{"lat":41.726649023896606,"lng":-72.25044721572635},"name":"Connecticut license plate 2.JPG"},{"pos":{"lat":39.13872376224059,"lng":-75.51846557084336},"name":"Delaware license plate 1.JPG"},{"pos":{"lat":38.7028019525778,"lng":-75.38113646928086},"name":"Delaware license plate 2.JPG"},{"pos":{"lat":33.893759540922666,"lng":-84.06078727739155},"name":"Georgia license plate.JPG"},{"pos":{"lat":32.681546178187325,"lng":-83.26977165239155},"name":"Georgia license plate 1.JPG"},{"pos":{"lat":31.43390755678137,"lng":-82.50072868364155},"name":"Georgia license plate 2.JPG"},{"pos":{"lat":20.76812421926896,"lng":-156.2592974300283},"name":"Hawaii license plate 1.JPG"},{"pos":{"lat":19.582244149336706,"lng":-155.5067339534658},"name":"Hawaii license plate.JPG"},{"pos":{"lat":43.61731823160895,"lng":-114.30813092698318},"name":"Idaho license plate.JPG"},{"pos":{"lat":41.78694639103516,"lng":-89.00762946278265},"name":"Illinois license plate.JPG"},{"pos":{"lat":41.02059558921674,"lng":-89.01861579090765},"name":"Illinois license plate 4.JPG"},{"pos":{"lat":40.25360830783073,"lng":-88.97467047840765},"name":"Illinois license plate 1.JPG"},{"pos":{"lat":39.163360513666156,"lng":-89.06256110340765},"name":"Illinois license plate 2.JPG"},{"pos":{"lat":38.08189715048224,"lng":-89.08453375965765},"name":"Illinois license plate 5.JPG"},{"pos":{"lat":41.30574051961823,"lng":-86.2277840146047},"name":"Indiana license plate 1.JPG"},{"pos":{"lat":40.52535804655252,"lng":-86.2277840146047},"name":"Indiana license plate.JPG"},{"pos":{"lat":39.735782518720335,"lng":-86.1838387021047},"name":"Indiana license plate 2.JPG"},{"pos":{"lat":39.03953002723187,"lng":-86.2277840146047},"name":"Indiana license plate 3.JPG"},{"pos":{"lat":38.40525536611601,"lng":-86.9968269833547},"name":"Indiana license plate 4.JPG"},{"pos":{"lat":42.98717151062252,"lng":-95.17189720797823},"name":"Iowa license plate.JPG"},{"pos":{"lat":43.05143043952721,"lng":-91.94191673922823},"name":"Iowa license plate 1.JPG"},{"pos":{"lat":42.145690430661205,"lng":-93.43605736422823},"name":"Iowa license plate 5.JPG"},{"pos":{"lat":41.094464622938,"lng":-95.10597923922823},"name":"Iowa license plate 2.JPG"},{"pos":{"lat":41.144123392271226,"lng":-91.94191673922823},"name":"Iowa license plate 3.JPG"},{"pos":{"lat":38.62149489554893,"lng":-100.30114006518447},"name":"Kansas license plate 2.JPG"},{"pos":{"lat":38.63865977758181,"lng":-96.71959709643447},"name":"Kansas license plate 5.JPG"},{"pos":{"lat":37.23991399846884,"lng":-87.36624784432576},"name":"Kentucky license plate.JPG"},{"pos":{"lat":37.388454540628686,"lng":-85.15799589120076},"name":"Kentucky license plate 1.JPG"},{"pos":{"lat":37.745490159106886,"lng":-83.26834745370076},"name":"Kentucky license plate 2.JPG"},{"pos":{"lat":32.247373541595714,"lng":-92.58770442641605},"name":"Louisiana license plate.JPG"},{"pos":{"lat":30.44602246821916,"lng":-92.28008723891605},"name":"Louisiana license plate 1.JPG"},{"pos":{"lat":46.72663763361911,"lng":-68.92041432576643},"name":"Maine license plate.JPG"},{"pos":{"lat":46.044596011756674,"lng":-68.94238698201643},"name":"Maine license plate 4.JPG"},{"pos":{"lat":45.45430437818128,"lng":-69.03027760701643},"name":"Maine license plate 1.JPG"},{"pos":{"lat":44.9200371661382,"lng":-69.41479909139143},"name":"Maine license plate 2.JPG"},{"pos":{"lat":44.30218257583069,"lng":-70.31567799764143},"name":"Maine license plate 7.JPG"},{"pos":{"lat":39.593195086221165,"lng":-77.62022414599218},"name":"Maryland license plate.JPG"},{"pos":{"lat":39.57626113114982,"lng":-77.02146926317968},"name":"Maryland license plate 1.JPG"},{"pos":{"lat":39.55932303815752,"lng":-76.52708449755468},"name":"Maryland license plate 2.JPG"},{"pos":{"lat":39.406694072774805,"lng":-76.18650832567968},"name":"Maryland license plate 3.JPG"},{"pos":{"lat":39.002316730176055,"lng":-75.97776809130468},"name":"Maryland license plate 4.JPG"},{"pos":{"lat":38.544076937265245,"lng":-75.91185012255468},"name":"Maryland license plate 5.JPG"},{"pos":{"lat":38.22975912161622,"lng":-75.56578078661718},"name":"Maryland license plate 6.JPG"},{"pos":{"lat":42.36515624162882,"lng":-72.0269650029546},"name":"Massachusetts license plate.JPG"},{"pos":{"lat":46.56197351702908,"lng":-88.20062971698941},"name":"Michigan license plate.JPG"},{"pos":{"lat":46.03062542121548,"lng":-85.08051252948941},"name":"Michigan license plate 4.JPG"},{"pos":{"lat":44.74994885520125,"lng":-84.48725081073941},"name":"Michigan license plate 1.JPG"},{"pos":{"lat":43.790226927371535,"lng":-84.59711409198941},"name":"Michigan license plate 2.JPG"},{"pos":{"lat":42.57259877032677,"lng":-84.81684065448941},"name":"Michigan license plate 3.JPG"},{"pos":{"lat":47.684562931058586,"lng":-94.10572661300785},"name":"Minnesota license plate.JPG"},{"pos":{"lat":46.27553442820726,"lng":-94.50123442550785},"name":"Minnesota license plate 1.JPG"},{"pos":{"lat":44.54814185029781,"lng":-94.45728911300785},"name":"Minnesota license plate 2.JPG"},{"pos":{"lat":34.61677835432681,"lng":-89.65657797268113},"name":"Mississippi license plate.JPG"},{"pos":{"lat":33.267927941597016,"lng":-89.67855062893113},"name":"Mississippi license plate 3.JPG"},{"pos":{"lat":32.19590702703696,"lng":-89.70052328518113},"name":"Mississippi license plate 1.JPG"},{"pos":{"lat":31.336585234092478,"lng":-89.26107016018113},"name":"Mississippi license plate 2.JPG"},{"pos":{"lat":39.684049902361586,"lng":-92.96477776563991},"name":"Missouri license plate 1.JPG"},{"pos":{"lat":38.50745271482503,"lng":-92.63518792188991},"name":"Missouri license plate 2.JPG"},{"pos":{"lat":37.41609552087159,"lng":-92.23968010938991},"name":"Missouri license plate 3.JPG"},{"pos":{"lat":47.78013343806993,"lng":-114.06223236208453},"name":"Montana license plate 4.JPG"},{"pos":{"lat":47.27569396900009,"lng":-111.16184173708453},"name":"Montana license plate 1.JPG"},{"pos":{"lat":47.171236333160195,"lng":-107.58029876833453},"name":"Montana license plate 2.JPG"},{"pos":{"lat":47.156297010664325,"lng":-105.18527923708453},"name":"Montana license plate 3.JPG"},{"pos":{"lat":42.08849237364494,"lng":-102.37611906995978},"name":"Nebraska license plate.JPG"},{"pos":{"lat":42.07218413951003,"lng":-100.11293547620978},"name":"Nebraska license plate 4.JPG"},{"pos":{"lat":41.712343057189074,"lng":-97.91566985120978},"name":"Nebraska license plate 2.JPG"},{"pos":{"lat":40.68735697013008,"lng":-97.27846281995978},"name":"Nebraska license plate 3.JPG"},{"pos":{"lat":41.16472189741368,"lng":-117.22957206902146},"name":"Nevada license plate.JPG"},{"pos":{"lat":39.82807354153254,"lng":-117.00984550652146},"name":"Nevada license plate 1.JPG"},{"pos":{"lat":38.61957710498631,"lng":-116.26277519402146},"name":"Nevada license plate 4.JPG"},{"pos":{"lat":37.23308655216497,"lng":-115.49373222527146},"name":"Nevada license plate 3.JPG"},{"pos":{"lat":43.899219418273816,"lng":-71.49646460235063},"name":"New Hampshire license plate.JPG"},{"pos":{"lat":43.186495318104164,"lng":-71.59534155547563},"name":"New Hampshire license plate 1.JPG"},{"pos":{"lat":40.12684802743234,"lng":-74.37517036776852},"name":"New Jersey license plate.JPG"},{"pos":{"lat":36.195850817876675,"lng":-106.3816601859529},"name":"New Mexico license plate.JPG"},{"pos":{"lat":34.67420813090759,"lng":-106.2278515922029},"name":"New Mexico license plate 1.JPG"},{"pos":{"lat":33.28954920005138,"lng":-106.2278515922029},"name":"New Mexico license plate 2.JPG"},{"pos":{"lat":44.06034715877876,"lng":-74.78854633198745},"name":"New York license plate.JPG"},{"pos":{"lat":42.767574879063794,"lng":-75.46969867573745},"name":"New York license plate 1.JPG"},{"pos":{"lat":42.75144233860479,"lng":-77.38131976948745},"name":"New York license plate 2.JPG"},{"pos":{"lat":35.749000581186884,"lng":-82.05164186318822},"name":"North Carolina license plate.JPG"},{"pos":{"lat":35.73116592355727,"lng":-79.70056764443822},"name":"North Carolina license plate 1.JPG"},{"pos":{"lat":35.740083751749324,"lng":-77.38245241006322},"name":"North Carolina license plate 2.JPG"},{"pos":{"lat":47.501231103923864,"lng":-102.22722424704975},"name":"North Dakota license plate 1.JPG"},{"pos":{"lat":47.545744707510785,"lng":-98.99724377829975},"name":"North Dakota license plate 2.JPG"},{"pos":{"lat":40.94685615898955,"lng":-84.01084177448384},"name":"Ohio license plate.JPG"},{"pos":{"lat":40.93025773570365,"lng":-82.60459177448384},"name":"Ohio license plate 1.JPG"},{"pos":{"lat":41.038072919361696,"lng":-81.18735544635884},"name":"Ohio license plate 3.JPG"},{"pos":{"lat":39.68197119929873,"lng":-84.19760935260884},"name":"Ohio license plate 4.JPG"},{"pos":{"lat":39.67351559794643,"lng":-82.64853708698384},"name":"Ohio license plate 5.JPG"},{"pos":{"lat":39.73268306611179,"lng":-81.41806833698384},"name":"Ohio license plate 6.JPG"},{"pos":{"lat":35.68365039369639,"lng":-98.4305739202885},"name":"Oklahoma license plate 1.JPG"},{"pos":{"lat":35.68365039369639,"lng":-95.7718825140385},"name":"Oklahoma license plate 2.JPG"},{"pos":{"lat":43.917587858490556,"lng":-121.03904494357404},"name":"Oregon license plate.JPG"},{"pos":{"lat":41.03076297169961,"lng":-77.55243146023079},"name":"Pennsylvania license plate.JPG"},{"pos":{"lat":41.83442974202616,"lng":-71.5831951332038},"name":"Rhode Island license plate 2.JPG"},{"pos":{"lat":41.57400812628189,"lng":-71.47058526992255},"name":"Rhode Island license plate 3.JPG"},{"pos":{"lat":34.35196210073613,"lng":-81.45014011612312},"name":"South Carolina license plate 1.JPG"},{"pos":{"lat":33.61406997617931,"lng":-80.27460300674812},"name":"South Carolina license plate 2.JPG"},{"pos":{"lat":44.63046578416973,"lng":-102.19745967959555},"name":"South Dakota license plate 2.JPG"},{"pos":{"lat":44.55222863542217,"lng":-98.68183467959555},"name":"South Dakota license plate 3.JPG"},{"pos":{"lat":35.77313326039533,"lng":-86.50757816614933},"name":"Tennessee license plate.JPG"},{"pos":{"lat":31.388916778970177,"lng":-101.76362788239426},"name":"Texas license plate.JPG"},{"pos":{"lat":31.388916778970177,"lng":-99.63228022614426},"name":"Texas license plate 4.JPG"},{"pos":{"lat":31.370157913517815,"lng":-97.23726069489426},"name":"Texas license plate 1.JPG"},{"pos":{"lat":31.426423268972446,"lng":-95.36958491364426},"name":"Texas license plate 3.JPG"},{"pos":{"lat":40.737547569577885,"lng":-111.96765259576357},"name":"Utah license plate.JPG"},{"pos":{"lat":39.58734792771042,"lng":-111.73693970513857},"name":"Utah license plate 2.JPG"},{"pos":{"lat":38.3143661148013,"lng":-111.60510376763857},"name":"Utah license plate 3.JPG"},{"pos":{"lat":44.35020372320063,"lng":-72.76205627572767},"name":"Vermont license plate.JPG"},{"pos":{"lat":37.2829719850294,"lng":-79.38189656244822},"name":"Virginia license plate.JPG"},{"pos":{"lat":37.405250797557756,"lng":-77.31646687494822},"name":"Virginia license plate 1.JPG"},{"pos":{"lat":47.55664537897844,"lng":-120.75088431565315},"name":"Washington license plate.JPG"},{"pos":{"lat":38.91904406234585,"lng":-77.02498913198112},"name":"Washington DC license plate 1.JPG"},{"pos":{"lat":39.300461213392566,"lng":-80.5261197462818},"name":"West Virginia license plate.JPG"},{"pos":{"lat":38.53973644576048,"lng":-80.7128873244068},"name":"West Virginia license plate 2.JPG"},{"pos":{"lat":37.97901008307381,"lng":-81.4489713087818},"name":"West Virginia license plate 1.JPG"},{"pos":{"lat":45.79592369495541,"lng":-90.97358450041577},"name":"Wisconsin license plate.JPG"},{"pos":{"lat":44.68198706949412,"lng":-89.94086965666577},"name":"Wisconsin license plate 1.JPG"},{"pos":{"lat":43.354796071256054,"lng":-89.08393606291577},"name":"Wisconsin license plate 2.JPG"},{"pos":{"lat":44.205325223028424,"lng":-109.7554334702174},"name":"Wyoming license plate.JPG"},{"pos":{"lat":44.110743377751284,"lng":-105.8003553452174},"name":"Wyoming license plate 1.JPG"},{"pos":{"lat":43.0603417872028,"lng":-107.6021131577174},"name":"Wyoming license plate 2.JPG"},{"pos":{"lat":41.958961277829516,"lng":-109.4917615952174},"name":"Wyoming license plate 3.JPG"},{"pos":{"lat":42.040605866378165,"lng":-106.2837537827174},"name":"Wyoming license plate 4.JPG"}]; 
        let phoneCode = 91; 

        /* Used to make the codes initially
        
        MWGTM_M.addListener("click", doMarker);

        function doMarker(e){
            console.log(e.latLng.lat(),e.latLng.lng());

        //    let m =  makeNewMarker({lat: e.latLng.lat(),lng: e.latLng.lng()}, phoneCode);

            _data_.push({
                pos:{lat: e.latLng.lat(),lng: e.latLng.lng()},
                name: "",
            });

         //   phoneCode++;

            console.log(JSON.stringify(_data_));
         }
          
        */

          function makeNewMarker(latLng, phoneCode){
            let marker = makeMarker(MWGTM_M, phoneCode);

            marker.phoneCode = phoneCode;

            marker._setPos(latLng);

            marker._infowindow._setContent(`<div style="color:black">${phoneCode}</div>`);

            marker.addListener("dragend", (event) => {
                const position = marker.position;

               _data_.forEach(x =>{
                   if (x.num !== marker.phoneCode) return;

                   x.pos.lat = position.lat();
                   x.pos.lng = position.lng();

                   console.log(JSON.stringify(_data_));
               });
           });

          return marker;
        };

         function makeMarker(_this, content) { 
            let marker = new google.maps.Marker({
                title: "This is a marker",
                draggable:true,
            });

            marker._setPos = function (latLng) {
                marker.setPosition(latLng);
                marker.setMap(_this);
            }

            marker._infowindow = new google.maps.InfoWindow({
                content: '',
                ariaLabel: "Uluru",
                anchor: marker,
                map: _this 
            });

            marker._infowindow._setContent = function (content) {
                marker._infowindow.setContent(content);
                setTimeout(() => {
                    let d = document.querySelector("[aria-label='Close']");
                    if (d) {
                        d.style.display = "none";
                    }
                }, 1000);
            }
            return marker;
        }

        function imageOverlay(pos, name, cls,backgroundColor, map) {

            // Now initialize all properties.
            this.pos = pos;
            this.name_ = name;
            this.cls_ = cls;
            this.map_ = map;
            this.backgroundColor_ = backgroundColor;

            // We define a property to hold the image's
            // div. We'll actually create this div
            // upon receipt of the add() method so we'll
            // leave it null for now.
            this.div_ = null;

            // Explicitly call setMap() on this overlay
            this.setMap(map);
        }

        imageOverlay.prototype = new google.maps.OverlayView();

        imageOverlay.prototype.onAdd = function() {

            // Note: an overlay's receipt of onAdd() indicates that
            // the map's panes are now available for attaching
            // the overlay to the map via the DOM.

            // Create the DIV and set some basic attributes.
            var div = document.createElement('DIV');
            div.className = "_divImg"; //this.cls_;

            let image = new Image();
            image.src = `https://echandler.github.io/test-geo-noob-script/${this.name_}`, 
            image.classList.add('_img');
            image.style.cssText = `
                display: inline-block;
                width: 20px; 
            `;
           
           // div.innerHTML = this.txt_;
           div.appendChild(image);
            // Set the overlay's div_ property to this DIV
            this.div_ = div;
            var overlayProjection = this.getProjection();
            var position = overlayProjection.fromLatLngToDivPixel(this.pos);
            
            div.style.cssText = `
                border: 1px solid rgb(200,200,200); 
                color: black; 
                position: absolute;
                background-color: white;
                font-size: 10px;
                translate: -50% -50%;
          `;
           div.style.backgroundColor = this.backgroundColor_;
          // We add an overlay to a map via one of the map's panes.
          var panes = this.getPanes();
          
           panes.floatPane.appendChild(div);
          //panes.overlayLayer.appendChild(div);
        }

        imageOverlay.prototype.draw = function() {
            var overlayProjection = this.getProjection();

            // Retrieve the southwest and northeast coordinates of this overlay
            // in latlngs and convert them to pixels coordinates.
            // We'll use these coordinates to resize the DIV.
            var position = overlayProjection.fromLatLngToDivPixel(this.pos);


            var div = this.div_;
            //console.log(this.pos.lat(), this.pos.lng(), position);

            div.style.left = position.x + 'px';
            div.style.top = position.y + 'px';
        }
        
        //Optional: helper methods for removing and toggling the text overlay.  
        imageOverlay.prototype.onRemove = function() {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        }

        imageOverlay.prototype.hide = function() {
            if (this.div_) {
                this.div_.style.visibility = "hidden";
            }
        }

        imageOverlay.prototype.show = function() {
            if (this.div_) {
                this.div_.style.visibility = "visible";
            }
        }

        imageOverlay.prototype.toggle = function() {
            if (this.div_) {
                if (this.div_.style.visibility == "hidden") {
                    this.show();
                } else {
                    this.hide();
                }
            }
        }

        imageOverlay.prototype.toggleDOM = function() {
            if (this.getMap()) {
                this.setMap(null);
            } else {
                this.setMap(this.map_);
            }
        }

        let backgroundColors = [null, "rgb(216 159 207)", "rgb(238 216 149)", "beige", "rgb(14 205 204)", "rgb(105 254 201)", "rgb(255 252 77)", "rgb(255 169 250)","rgb(255 129 130)", "rgb(0 252 85)"];
        let overLays = [];

        function showCodes(){
            _data_.forEach((x)=>{
//                let color =backgroundColors[+(x.num+'')[0]];
                txt = new imageOverlay(x.pos, x.name, "customBox",'black', MWGTM_M);
 //               makeMarker(x.pos, x.name, MWGTM_M)             
                //
                //
                // Enable this to show markers to make adjustments.
                //let m =  makeNewMarker(x.pos, x.num);
                //
                //

                overLays.push(txt);
             });
        } 

        function hideCodes(){
            overLays.forEach((x)=>{
                 x.setMap(null);
             });

            overLays = [];
        } 

        setInterval(()=>{
            let container = document.querySelector("#mwgtm-settings-buttons");
            if (!container) return;    
            if (container && document.querySelector("#brazilPhoneCodes")) return;

            const div = document.createElement('div');
            div.classList.add("mwgtm-settings-option");
            div.id = "brazilPhoneCodes"; 
            div.innerHTML = "Show/Hide USA licence plates";
            div.style.color = "white";
            div.addEventListener('click', ()=>{
                overLays.length? hideCodes(): showCodes();
            });
             
            container.appendChild(div);
        }, 1000);

}, 1000);
