angular.module('app.events',[])

    .controller('EventCtrl', ['$scope', '$http', '$q', '$stateParams','$state', function($scope, $http, $q, $stateParams, $state) {
        console.log("Inside Events Ctrl")
        console.log("stateParams: ",$stateParams);
        $scope.eventData = {};
        $scope.jsonId={};
        window.scrollTo(0, 0);
        
        var addFeedbackData=function(requestTHData){
            var deferred=$q.defer();
            $http.get('assets/feedback.json').then(
                function(response) {
                    var feedbackDataOfTH = response.data.body;
                    console.log(response.data.body);
                    console.log("Feedback Data: ",feedbackDataOfTH);
                    for(var i=0;i<feedbackDataOfTH.feedback.length;i++){
                        if(requestTHData.treasureHuntId==feedbackDataOfTH.feedback[i].treasureHuntId){
                            requestTHData.feedback = feedbackDataOfTH.feedback[i];
                            console.log("feedbackData of current th:",requestTHData.feedback);
                            deferred.resolve(requestTHData);
                        }else{
                            deferred.reject(requestTHData);
                        }
                    }
                },
                function(error) {
                    console.log("Error: ", error);
                    deferred.reject(requestTHData);
                }
            )
            return deferred.promise; 
        }

        var addAdditionalTHDetails=function(requestTHData){
            var deferred=$q.defer();
            $http.get('assets/thadd.json').then(
                function(response) {
                    console.log("Additional data response: ", response.data.body,requestTHData);
                    var additionalData=response.data.body;
                    for(var j=0;j<additionalData.treasureHunts.length;j++){
                        if(requestTHData.treasureHuntId==additionalData.treasureHunts[j].treasureHuntId){
                            //add data to thData
                            requestTHData.rate=additionalData.treasureHunts[j].rate;
                            if(additionalData.treasureHunts[j].treasureHuntDetails!=null){
                                requestTHData.treasureHuntDetails=additionalData.treasureHunts[j].treasureHuntDetails;  
                            }else{
                                requestTHData.treasureHuntDetails=requestTHData.treasureHuntDescription;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntWeather!=null){
                                requestTHData.treasureHuntWeather=additionalData.treasureHunts[j].treasureHuntWeather;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntHistory!=null){
                                requestTHData.treasureHuntHistory=additionalData.treasureHunts[j].treasureHuntHistory;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntTravel!=null){
                                requestTHData.treasureHuntTravel=additionalData.treasureHunts[j].treasureHuntTravel;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntFAQ!=null){
                                requestTHData.treasureHuntFAQ=additionalData.treasureHunts[j].treasureHuntFAQ;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntThings!=null){
                                requestTHData.treasureHuntThings=additionalData.treasureHunts[j].treasureHuntThings;
                            }else{
                                requestTHData.treasureHuntThings=null;
                            }
                            if(additionalData.treasureHunts[j].howtoPlayInstructions!=null){
                                requestTHData.howtoPlayInstructions=additionalData.treasureHunts[j].howtoPlayInstructions;
                            }else{
                                requestTHData.howtoPlayInstructions=null;
                            }
                            if(additionalData.treasureHunts[j].aggregateRatings!=null){
                                requestTHData.aggregateRatings=additionalData.treasureHunts[j].aggregateRatings;
                            }else{
                                requestTHData.aggregateRatings={
                                    reviewCount:"0",
                                    ratingValue:"0"
                                }
                            }
                            if(additionalData.treasureHunts[j].thRank!=null){
                                requestTHData.thRank=additionalData.treasureHunts[j].thRank;
                            }else{
                                requestTHData.thRank=-1;
                            }
                            requestTHData.galleryImages=additionalData.treasureHunts[j].galleryImages;
                            requestTHData.eventTimings=additionalData.treasureHunts[j].eventTimings;
                            requestTHData.eventDate=additionalData.treasureHunts[j].eventDate;
                            requestTHData.treasureHuntPrice=additionalData.treasureHunts[j].treasureHuntPrice; 
                            requestTHData.eventId=additionalData.treasureHunts[j].eventId;
                            if(additionalData.treasureHunts[j].treasureHuntIcons!=null){
                                requestTHData.treasureHuntIcons=additionalData.treasureHunts[j].treasureHuntIcons;
                            }
                            deferred.resolve(requestTHData);
                        }else{
                            console.log("Add additional details else part:",requestTHData)
                            if(requestTHData.treasureHuntDetails==null ||requestTHData.treasureHuntDetails==undefined){
                                requestTHData.thRank=-1;
                                requestTHData.treasureHuntDetails=requestTHData.treasureHuntDescription;
                                requestTHData.aggregateRatings={
                                    reviewCount:"0",
                                    ratingValue:"0"
                                }  
                                deferred.reject(requestTHData);
                            }else{
                                deferred.reject(requestTHData);
                            } 
                        }
                    }
                },
                function(error) {
                    console.log("Error: ", error);
                    console.log("Nothing found");
                    deferred.reject(requestTHData);
                }
            )
            return deferred.promise; 
        }
         
        var getTHSpecificData=function(thIdentifier){
            var specificData = null;
            for(var i=0;i<$scope.thData.treasureHunts.length;i++){
                if($scope.thData.treasureHunts[i].thShortName.toLowerCase() == thIdentifier.toLowerCase() || $scope.thData.treasureHunts[i].treasureHuntId==thIdentifier){
                     specificData = $scope.thData.treasureHunts[i];
                }
            }
            return specificData;
        }

        var getAllTHData=function(){
            var deferred=$q.defer();
            var formData = {
                "header": {
                    clientId: "SPARROWZ_WEBSITE",
                    apiVersion: apiVersion
                },
                body: {}
            }
            console.log('form data to get treasureHunts: ', formData);
            var req = {
                method: 'POST',
                url: URL + "/services/guest/getTreasureHunts",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: formData
            }
            $http(req).then(
                function(response) {
                    $scope.thData = response.data.body;
                    for(var i=0;i<$scope.thData.treasureHunts.length;i++){
                        if(!$scope.thData.treasureHunts[i].thShortName){
                            $scope.thData.treasureHunts[i].thShortName = $scope.generateThShortName($scope.thData.treasureHunts[i].treasureHuntName);
                        }
                    }
                    console.log(response.data.body);
                    console.log("TH Data: ", $scope.thData);
                    deferred.resolve($scope.thData);
                },
                function(error) {
                    console.log("Error: ", error);
                    $scope.setErrorMessage();
                    $http.get('assets/thlist_all.json').then(
                        function(response) {
                            $scope.thData = response.data.body;
                            for(var i=0;i<$scope.thData.treasureHunts.length;i++){
                                if(!$scope.thData.treasureHunts[i].thShortName){
                                    $scope.thData.treasureHunts[i].thShortName = $scope.generateThShortName($scope.thData.treasureHunts[i].treasureHuntName);
                                }
                            }
                            console.log(response.data.body);
                            console.log("TH Data: ", $scope.thData);
                            deferred.resolve($scope.thData);
                        },
                        function(error) {
                            console.log("Error: ", error);
                            deferred.reject(error);
                        }
                    )
                }
            )
            return deferred.promise;
        }

        var getRequestedTHDetails=function(thId){
            var deferred=$q.defer();
            if(!$scope.thData.treasureHunts){
                getAllTHData().then(function(th_Data){
                    console.log("fetched data: ",th_Data);
                    var specificData=getTHSpecificData(thId);
                    if(specificData){
                        console.log("TH Specific data: ",specificData);
                        deferred.resolve(specificData);
                    }else{
                        deferred.reject();
                    }
                    
                },function(error){
                    console.log("Nothing found. 404");
                    deferred.reject(error);
                });
            }else{
                var specificData=getTHSpecificData(thId);
                if(specificData){
                    console.log("TH Specific data: ",specificData);
                    deferred.resolve(specificData);
                }else{
                    console.log("Not able to proceed with specificData",specificData);
                    deferred.reject();
                }
            }
            return deferred.promise;
        }

        var getTHId=function(){
            console.log("State Params: ",$stateParams.thIdentifier);
            return $stateParams.thIdentifier;
        }
        var getLocationInfo=function(lat,lng){
            var position={
                coords:{
                    latitude:lat,
                    longitude:lng
                }
            };
            $scope.getGeoCoderData(position).then(function(geoCoderData){
                console.log("geoCoderData:",geoCoderData);
                var indice = 0;
                for (var j = 0; j < geoCoderData.address_components.length; j++) {
                    if (geoCoderData.address_components[j].types[0] == "locality") {
                        indice = j;
                        console.log('index found at: ', j)
                    }
                }
                var locality=geoCoderData.address_components[indice].long_name;
                $scope.eventData.locationInfo={
                    address:geoCoderData.formatted_address,
                    placeName:locality
                };
                setMarupJson();
            },function(error){
                console.log("Not able to get location Info.")
            });
        }

        var showTHInMap=function(){
            if (typeof google === 'object' && typeof google.maps === 'object'){
                var myLatLng = {lat:parseFloat($scope.eventData.geoLocationDetails.latitude), lng: parseFloat($scope.eventData.geoLocationDetails.longitude)};
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: myLatLng
                });
                map.setOptions({scrollwheel: false});
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: $scope.eventData.treasureHuntName
                });
            }else{
                console.log("Google api not defined");
            } 
        }
        $scope.ticketModal=function(eventId){
            if (window.screen.width < 800) {
                window.location = 'https://ticketing.eventshigh.com/checkout3.jsp?eid='+eventId;
                return;
            }

            var iframeId = Math.random().toString(36).substring(7);
            var closeButtonId = Math.random().toString(36).substring(7);

            var backdrop = document.createElement("div");
            backdrop.setAttribute("style", "position: fixed; z-index: 1100; top: 0; left: 0; bottom: 0; right: 0; background-color: rgba(0,0,0,0.5);");
            backdrop.innerHTML ="<div style='position: absolute; top: 50%; left: 50%; transform: translateY(-50%) translateX(-50%);'>"+ "  <h1 style='color:white;'>Loading ...</h1>"+ "</div>";

            var offset = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            offset += 50;
            var modalParent = document.createElement("div");
            modalParent.setAttribute("style", "position: absolute; z-index: 1200; top: "+offset+"px; left: 0; width: 100%;");
            modalParent.innerHTML ="<div style='margin:0 auto; width: 80%; max-width: 800px; background: white; box-shadow: 0 5px 15px rgba(0,0,0,.5); border-radius: 6px; border: 1px solid rgba(0,0,0,.2); outline: 0; background-clip: padding-box;'>"+ "  <iframe id='" + iframeId + "' style='width: 100%; border: 0px;' src='https://ticketing.eventshigh.com/checkout3.jsp?eid="+eventId+"'>Your browser does not support iframe. Still living in an old age browser?</iframe>"+ "  <a id='" + closeButtonId + "' href='#' style='float: right; color: black; font-size: 34px; font-weight: bold; margin-left:75%; top:8px; margin-right: 12px; position:absolute; border-bottom'>&times;</a>"+"</div>";
            modalParent.style.display = 'none';

            window.document.body.insertBefore(modalParent, window.document.body.firstChild);
            window.document.body.insertBefore(backdrop, window.document.body.firstChild);

            window.addEventListener('message', function(e) {
                if (e.origin === 'https://ticketing.eventshigh.com') {
                    if (e.data.indexOf('height:') === 0) {
                        var elem = document.getElementById(iframeId);
                        if (elem) {
                            elem.height = '';
                            elem.height = e.data.substring(7) + 'px';
                        }
                    }
                }
            }, false);

            document.getElementById(iframeId).onload = function() {
                backdrop.innerHTML = '';
                modalParent.style.display = 'block';
            };

            var selfDestruct = function(event) {
                backdrop.outerHTML = '';
                modalParent.outerHTML = '';
                event.stopPropagation();
                return false;
            }

            document.getElementById(closeButtonId).onclick = selfDestruct;
            modalParent.onclick = selfDestruct;
            document.onkeydown = function(evt) {
                evt = evt || window.event;
                var isEscape = false;
                if ("key" in evt) {
                    isEscape = (evt.key == "Escape" || evt.key == "Esc");
                } else {
                    isEscape = (evt.keyCode == 27);
                }
                if (isEscape) {
                    selfDestruct(evt);
                }
            }; 
        }

        $scope.triggerBookingModal=function(eventId){
            $scope.ticketModal(eventId);
            getTicket();
        }
        var setMarupJson=function(){
            var currentDate = new Date();
            var currentDateinISOformat = currentDate.toISOString();

            $scope.jsonId={
                "@context": "http://schema.org",
                "@type": "Event",
                "name":$scope.eventData.treasureHuntName,
                "url": "http://www.sparrowzapp.com/"+$scope.selectedCity.cityCode+"/"+$scope.eventData.thShortName,
                "image":$scope.eventData.treasureHuntImgUrl[0],
                "startDate":currentDateinISOformat,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": $scope.eventData.aggregateRatings.ratingValue,
                    "reviewCount": $scope.eventData.aggregateRatings.reviewCount
                },
                "location":{
                    "@type": "Place",
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": $scope.eventData.geoLocationDetails.latitude,
                        "longitude": $scope.eventData.geoLocationDetails.longitude
                    },
                    "address":$scope.eventData.locationInfo.address,
                    "name":$scope.eventData.locationInfo.placeName
                }
            };
        }
        var setTags=function(questData){
            console.log("Setting tags");
            var pageTitle=questData.treasureHuntName;
            pageTitle = pageTitle + ' - Play treasure hunts, quests, walks, tours - all using your mobile device'
            if($scope.selectedCity.cityCode=='BLR'){
                pageTitle = pageTitle+' - in '+$scope.selectedCity.cityName + ' / Bangalore - ';
            }else{
                pageTitle = pageTitle+' - in '+$scope.selectedCity.cityName + ' - ';
            }
            document.title=pageTitle;
            getLocationInfo($scope.eventData.geoLocationDetails.latitude,$scope.eventData.geoLocationDetails.longitude);
            $scope.setMetaDescription($scope.eventData.treasureHuntDetails);
        }

        var onload=function(){
            $scope.setCityChangeEventListener(null);
            var thId = getTHId();
            console.log("Treasure hunt id: ",thId);
            if(thId){
                getRequestedTHDetails(thId).then(function(requestedTHData){
                    console.log("requestedTHData:",requestedTHData);
                    var requestedTHDetails=requestedTHData;
                    addAdditionalTHDetails(requestedTHDetails).then(function(enrichedTHData){
                        console.log("enrichedTHData:",enrichedTHData);
                        addFeedbackData(enrichedTHData).then(function(enrichedTHDataWithFeedback){
                            $scope.eventData=enrichedTHDataWithFeedback;
                            setTags($scope.eventData);
                            console.log("enrichedTHDataWithFeedback:",enrichedTHDataWithFeedback);
                            showTHInMap();
                            setTimeout(function(){
                                $('.carousel').carousel({
                                        interval: 4000
                                }) 
                                }, 1000
                            );   
                        },function(thDataWithoutFeedback){
                            $scope.eventData=thDataWithoutFeedback;
                            setTags($scope.eventData);
                            console.log("thDataWithoutFeedback:",thDataWithoutFeedback);
                            showTHInMap();
                            setTimeout(function(){
                                $('.carousel').carousel({
                                        interval: 4000
                                }) 
                                }, 1000
                            );   
                        });
                    },function(thDataWithoutAdditionalDetails){
                        addFeedbackData(thDataWithoutAdditionalDetails).then(function(THDataWithFeedback){
                            $scope.eventData=THDataWithFeedback;
                            setTags($scope.eventData);
                            console.log("THDataWithFeedback:",THDataWithFeedback);
                            showTHInMap();
                            setTimeout(function(){
                                $('.carousel').carousel({
                                        interval: 4000
                                }) 
                                }, 1000
                            );   
                        },function(thDataWithoutFeedback){
                            $scope.eventData=thDataWithoutFeedback;
                            setTags($scope.eventData);
                            console.log("thDataWithoutFeedback:",thDataWithoutFeedback);
                            showTHInMap();
                            setTimeout(function(){
                                $('.carousel').carousel({
                                        interval: 4000
                                }) 
                                }, 1000
                            );   
                        });
                    });
                },function(error){
                    console.log("Unable to fetch TH:",error);
                    $state.go('app.ERR404');
                });
            }else{
                $state.go('app.home',{cityCode:'BLR'});
            }
        }
        onload();
    }]);
    
