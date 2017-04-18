angular.module('Sparrowz', ['ui.router','ngSanitize','app.events','app.corporates.quests'])
    .directive('ellipsis', [function () {
        return {
            required: 'ng-bind-html',
            restrict: 'A',
            priority: 100,
            link: function ($scope, element, attrs, ctrl) {
                $scope.hasEllipsis = false;
                $scope.$watch(element.html(), function(value) {
                   if (!$scope.hasEllipsis) {
                       // apply this code ONCE
                       $scope.hasEllipsis = true;
                       console.log("Truncation on data");
                       $(element).trunk8({
                            fill: '&hellip; <a id="read-more" href="#">Read more</a>', /*(Default: '&hellip;') The string to insert in place of the omitted text. This value may include HTML.*/
                            lines: 3, /*(Default: 1) The number of lines of text-wrap to tolerate before truncating. This value must be an integer greater than or equal to 1.*/
                            //side: 'right', /*(Default: 'right') The side of the text from which to truncate. Valid values include 'center', 'left', and 'right'.*/
                            tooltip: false, /*(Default: true) When true, the title attribute of the targeted HTML element will be set to the original, untruncated string. Valid values include true and false.*/
                            //width: 'auto', /*(Default: 'auto') The width, in characters, of the desired text. When set to 'auto', trunk8 will maximize the amount of text without spilling over.*/
                            parseHTML: true /*(Default: 'false') When true, parse and save html structure and restore structure in the truncated text.*/
                            //onTruncate /*(Callback): Called after truncation is completed.*/
                       });
                       $(element).on('click', '#read-more', function (event) {
                            $(element).trunk8('revert').append(' <a id="read-less" href="#">Read less</a>');
                       });
                       $(element).on('click', '#read-less', function (event) {
                            $(element).trunk8();
                       });
                    }
                });
            }
        };
    }])
    
    .directive('jsonld', ['$filter', '$sce', function($filter, $sce) {
        return {
            restrict: 'E',
            template: function() {
                return '<script type="application/ld+json" ng-bind-html="onGetJson()"></script>';
            },
            scope: {
                json: '=json'
            },
            link: function(scope, element, attrs) {
                scope.onGetJson = function() {
                    return $sce.trustAsHtml($filter('json')(scope.json));
                }
            },
            replace: true
        };
    }])
    .controller('AppCtrl', ['$scope', '$http', '$q','$state','$stateParams','$sce', function($scope, $http, $q,$state,$stateParams,$sce) {
        console.log("Inside AppCtrl");
        $scope.thData = {};
        $scope.selectedChoice = {
            value: ''
        }
        $scope.message = {
            data: ""
        }
        $scope.videoQueries={};
        window.scrollTo(0, 0);

        var getCityList = function() {
            var deferred = $q.defer();
            if($scope.cityData){
                deferred.resolve($scope.cityData);
            }else{
                var formData = {
                    "header": {
                        clientId: "SPARROWZ_WEBSITE",
                        apiVersion: apiVersion
                    },
                    body: {}
                }
                console.log('form data to get cities: ', formData);
                var req = {
                    method: 'POST',
                    url: URL + "/services/guest/getCities",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: formData
                }
                $http(req).then(
                    function(response) {
                        console.log("getCityList response: ", response);
                        $scope.cityData = response.data.body;
                        deferred.resolve(response.data.body);
                    },
                    function(error) {
                        console.log("Error: ", error);
                        $http.get('assets/city.json').then(
                            function(response) {
                                console.log("getCityList response: ", response);
                                deferred.resolve(response.data.body);
                            },
                            function(error) {
                                console.log("Error: ", error)
                                deferred.reject("error");
                            }
                        )
                    }
                )
            }
            
            return deferred.promise;
        }

        var getMediaQueries=function(){
            $http.get('assets/media.json').then(
                function(response) {
                    console.log("Media Query response data: ",response.data.body);
                    $scope.mediaData=response.data.body;
                },
                function(error) {
                    console.log("Error: ", error);
                }
            )
        }

        var getCurrentPosition = function() {
                var deferred = $q.defer();

                if (!navigator.geolocation) {
                    deferred.reject('Geolocation not supported.');
                } else {
                    navigator.geolocation.getCurrentPosition(
                        function(position) {
                            deferred.resolve(position);
                        },
                        function(err) {
                            deferred.reject(err);
                        });
                }

                return deferred.promise;
            }
            /*getGeoCordinates*/
        var getCityName = function(position) {
                var deferred = $q.defer();
                //$scope.geolat = position.coords.latitude;
                //$scope.geolng = position.coords.longitude;
                $scope.getGeoCoderData(position).then(function(geocoderData) {
                    console.log("GeoCoder Data about your place: ",geocoderData);
                    var cityName = extractCityFromGeocoderData(geocoderData);
                    deferred.resolve(cityName);
                }, function(error) {
                    console.log('error getting current position: ', error);
                    deferred.reject("error");
                });
                return deferred.promise;
            }
            /*geocoderData*/
        $scope.getGeoCoderData = function(position) {
                var deferred = $q.defer();
                if (!google) {
                    console.log("google not defined");
                    deferred.reject('google not defined');
                } else {
                    var geocoder = new google.maps.Geocoder();
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    geocoder.geocode({
                            'latLng': latlng
                        },
                        function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0] && results[1]) {
                                    console.log('geocoder data: ', results[1]);
                                    deferred.resolve(results[1]);
                                } else {
                                    console.log("address not found");
                                    deferred.reject(results);
                                }
                            } else {
                                console.log("address not found");
                                deferred.reject(results);
                            }
                        });
                }
                return deferred.promise;
            }
            /*extractGeocoderData*/
        var extractCityFromGeocoderData = function(geocoderData) {
            var city = {
                long_name: null
            }
            var indice = 0;
            for (var j = 0; j < geocoderData.address_components.length; j++) {
                if (geocoderData.address_components[j].types[0] == 'locality') {
                    indice = j;
                    console.log('index found at: ', j)
                }
            }
            city = geocoderData.address_components[indice];
            console.log('cityName by new method: ', city.long_name)

            return city.long_name;
        }

        

        

        var loadCityAndTHList = function(cityInfo){
            $scope.selectedCity = cityInfo;
            loadTHAndLoapMap(cityInfo.cityId);
        }

        var loadDefaultCityAndTHList = function(){
            var defaultCityCode = "MYS"; // Default to city index 1 i.e. Bangalore
            var cityList = $scope.cityData.cityList;
            
            for (var i = 0; i < cityList.length; i++) {
                var cityInfo = cityList[i];
                if (defaultCityCode.toLowerCase() == cityInfo.cityCode.toLowerCase()) {
                    loadCityAndTHList(cityInfo);
                    break;
                }
            }
        }

        $scope.changeCityData = function(cityCode){
            getCityList().then(function(cityData) {
                var cityList = cityData.cityList;
                console.log("got city list", cityList);

                if(cityCode){
                    for (var i = 0; i < cityList.length; i++) {
                        var cityInfo = cityList[i];
                        if (cityCode.toLowerCase() == cityInfo.cityCode.toLowerCase()) {
                            loadCityAndTHList(cityInfo);
                            break;
                        }
                    }
                }else{
                    getCurrentPosition().then(function(position) {
                        console.log("got position", position);

                        getCityName(position).then(function(cityName) {
                            var matchedCityInfo=null;
                            for (var i = 0; i < cityList.length; i++) {
                                if (cityName == cityList[i].cityName) {
                                    matchedCityInfo = cityList[i];
                                    break;
                                }
                            }

                            if (matchedCityInfo) {
                                loadCityAndTHList(matchedCityInfo);
                            }else{
                                loadDefaultCityAndTHList(); 
                            }
                        
                        }, function(err) {
                            console.log(err);
                            loadDefaultCityAndTHList();
                        }); /*getCityName*/
                    }, function(err) {
                        console.log(err);
                        loadDefaultCityAndTHList();
                    }); /*getCurrentPosition*/
                }
                
            }, function(error) {
                console.log(error);
            }); /*getCityList*/
        }

        $scope.onCityChange = function(cityCode){
            $scope.changeCityData(cityCode);
            if(onCityChangeEventListener){
                onCityChangeEventListener(cityCode);
            }

        }
        var onCityChangeEventListener;
        $scope.setCityChangeEventListener = function(callback){
            onCityChangeEventListener = callback;
        }


        var onloadPage = function() {
            $scope.changeCityData('BLR');
            getMediaQueries();
        }

        onloadPage();
        
        $scope.setErrorMessage = function() {
                $scope.message = {
                    data: "We’ll be back in a while..."
                }
            }
            //Select city
        var loadTHAndLoapMap = function(city_id) {
            var formData = {
                "header": {
                    clientId: "SPARROWZ_WEBSITE",
                    apiVersion: apiVersion
                },
                body: {
                    "cityId": city_id
                }
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
                    if($scope.thData.treasureHunts==null || $scope.thData.treasureHunts[0].cityId!=city_id){
                        $scope.thData = response.data.body;
                        console.log(response.data.body);
                        console.log("TH Data: ", $scope.thData);
                        for (var i = 0; i < $scope.thData.treasureHunts.length; i++) {
                            $scope.addData($scope.thData, i);
                        }
                    }
                },
                function(error) {
                    console.log("Error: ", error);
                    $scope.setErrorMessage();
                    $http.get('assets/thlist_' + city_id + '.json').then(
                        function(response) {
                            if($scope.thData.treasureHunts==null || $scope.thData.treasureHunts[0].cityId!=city_id){
                                $scope.thData = response.data.body;
                                console.log(response.data.body);
                                console.log("TH Data: ", $scope.thData);
                                for (var i = 0; i < $scope.thData.treasureHunts.length; i++) {
                                    $scope.addData($scope.thData, i);
                                }
                            }
                        },
                        function(error) {
                            console.log("Error: ", error);
                        }
                    )
                }
            )
        }

        
        
        //functions for weburl	
        var SplitTheStringForDot = function(ResultStr) {
            var DtlStr = [];
            if (ResultStr != null) {
                var SplitChars = '.';
                if (ResultStr.indexOf(SplitChars) >= 0) {
                    DtlStr = ResultStr.split(SplitChars);
                    return DtlStr;
                } else {
                    DtlStr[0] = ResultStr;
                    return DtlStr;
                }
            }
        };
        var SplitTheStringForSlash = function(ResultStr) {
            var DtlStr = [];
            if (ResultStr != null) {
                var SplitChars = '/';
                if (ResultStr.indexOf(SplitChars) >= 0) {
                    DtlStr = ResultStr.split(SplitChars);
                    return DtlStr;
                } else {
                    DtlStr[0] = ResultStr;
                    return DtlStr;
                }
            }
        };

        var cocncatString = function(name_array) {
            var newFile_name = name_array[0] + "_web_small." + name_array[1];
            return newFile_name;
        }

        var getWebImageUrl = function(img_url) {
            var url_array = SplitTheStringForSlash(img_url);
            var len = url_array.length;
            var filename_array = SplitTheStringForDot(url_array[len - 1]);
            url_array[len - 1] = cocncatString(filename_array);
            var newPathname = "";
            for (i = 1; i < url_array.length; i++) {
                newPathname += "/";
                newPathname += url_array[i];
            }
            newPathname = window.location.protocol + newPathname;
            console.log("Path name: ", newPathname);
            return newPathname;
        }
        /*angular ga event*/
        $scope.goToEventPage=function(thName,thId){
            ga("send",{
                hitType:"event",
                eventCategory:"BuyTickets",
                eventAction:"User clicked on "+thName+" event buy tickets button",
                eventLabel:"USER_CLICKED_ON_BUY_TICKETS_BUTTON",
                eventValue:0
            });
            $scope.showTreasureHuntDetail(thId);
        }

        $scope.showTreasureHuntDetail=function(th_Id){
            console.log("User clicked on treasureHuntId: ",th_Id);
            console.log("The values needed: ",$scope.thData);
            for(var i=0;i<$scope.thData.treasureHunts.length;i++){
                console.log("Inside for loop")
                if(th_Id==$scope.thData.treasureHunts[i].treasureHuntId){
                    $scope.eventData=$scope.thData.treasureHunts[i];
                    console.log("Copied events data: ",$scope.eventData)
                    
                    var thIdentifier = $scope.thData.treasureHunts[i].thShortName?$scope.thData.treasureHunts[i].thShortName:$scope.thData.treasureHunts[i].treasureHuntId;
                    $state.go('app.detail', {'cityCode':$scope.selectedCity.cityCode, 'thIdentifier':thIdentifier});
                }
            }
        } 
        $scope.generateThShortName = function(thName){
            var thShortName = thName.replace(/[ &'@_//]+/g,'-');
            return thShortName;

        }
        /*function for adding data to json*/
        $scope.addData = function(thData, index) {
            if(!$scope.thData.treasureHunts[index].thShortName){
                $scope.thData.treasureHunts[index].thShortName = $scope.generateThShortName($scope.thData.treasureHunts[index].treasureHuntName);
            }

            if (typeof $scope.thData.treasureHunts[index].treasureHuntImgUrl !== 'undefined') {
                $scope.thData.treasureHunts[index].treasureHuntImgUrl[1] = getWebImageUrl($scope.thData.treasureHunts[index].treasureHuntImgUrl[0]);
            } else {
                $scope.thData.treasureHunts[index].treasureHuntImgUrl = ["img/no image.jpg"];
            } 
            $http.get('assets/thadd.json').then(
                function(response) {
                    //console.log("Additional data response: ", response.data.body);
                    var additionalData=response.data.body;
                    console.log("Adding more info for th:",$scope.thData.treasureHunts[index].treasureHuntName);
                    for(var j=0;j<additionalData.treasureHunts.length;j++){
                        if($scope.thData.treasureHunts[index].treasureHuntId==additionalData.treasureHunts[j].treasureHuntId){
                            //add data to thData
                            $scope.thData.treasureHunts[index].rate=additionalData.treasureHunts[j].rate;
                            if(additionalData.treasureHunts[j].treasureHuntDetails!=null){
                                $scope.thData.treasureHunts[index].treasureHuntDetails=additionalData.treasureHunts[j].treasureHuntDetails;  
                            }else{
                                $scope.thData.treasureHunts[index].treasureHuntDetails=$scope.thData.treasureHunts[index].treasureHuntDescription;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntWeather!=null){
                                $scope.thData.treasureHunts[index].treasureHuntWeather=additionalData.treasureHunts[j].treasureHuntWeather;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntHistory!=null){
                                $scope.thData.treasureHunts[index].treasureHuntHistory=additionalData.treasureHunts[j].treasureHuntHistory;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntTravel!=null){
                                $scope.thData.treasureHunts[index].treasureHuntTravel=additionalData.treasureHunts[j].treasureHuntTravel;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntFAQ!=null){
                                $scope.thData.treasureHunts[index].treasureHuntFAQ=additionalData.treasureHunts[j].treasureHuntFAQ;
                            }
                            if(additionalData.treasureHunts[j].treasureHuntThings!=null){
                                $scope.thData.treasureHunts[index].treasureHuntThings=additionalData.treasureHunts[j].treasureHuntThings;
                            }else{
                                $scope.thData.treasureHunts[index].treasureHuntThings=null;
                            }
                            if(additionalData.treasureHunts[j].howtoPlayInstructions!=null){
                                $scope.thData.treasureHunts[index].howtoPlayInstructions=additionalData.treasureHunts[j].howtoPlayInstructions;
                            }else{
                                $scope.thData.treasureHunts[index].howtoPlayInstructions=null;
                            }
                            if(additionalData.treasureHunts[j].aggregateRatings!=null){
                                $scope.thData.treasureHunts[index].aggregateRatings=additionalData.treasureHunts[j].aggregateRatings;
                            }else{
                                $scope.thData.treasureHunts[index].aggregateRatings={
                                        reviewCount:"0",
                                        ratingValue:"0"
                                }
                            }
                            if(additionalData.treasureHunts[j].thRank){
                                console.log("If part- TH rank for th id:",$scope.thData.treasureHunts[index].treasureHuntId,$scope.thData.treasureHunts[index].treasureHuntName,additionalData.treasureHunts[j].thRank);
                                $scope.thData.treasureHunts[index].thRank=additionalData.treasureHunts[j].thRank;
                            }else{
                                $scope.thData.treasureHunts[index].thRank=-1;
                                console.log("Else part-TH rank for th id:",$scope.thData.treasureHunts[index].treasureHuntId,$scope.thData.treasureHunts[index].treasureHuntName,additionalData.treasureHunts[j].thRank)
                            }
                            $scope.thData.treasureHunts[index].galleryImages=additionalData.treasureHunts[j].galleryImages;
                            $scope.thData.treasureHunts[index].eventTimings=additionalData.treasureHunts[j].eventTimings;
                            $scope.thData.treasureHunts[index].eventDate=additionalData.treasureHunts[j].eventDate;
                            $scope.thData.treasureHunts[index].treasureHuntPrice=additionalData.treasureHunts[j].treasureHuntPrice; 
                            $scope.thData.treasureHunts[index].eventId=additionalData.treasureHunts[j].eventId; 
                            if(additionalData.treasureHunts[j].treasureHuntIcons!=null){
                                $scope.thData.treasureHunts[index].treasureHuntIcons=additionalData.treasureHunts[j].treasureHuntIcons;
                            }
                        }else{
                            if($scope.thData.treasureHunts[index].thRank==undefined){
                                $scope.thData.treasureHunts[index].thRank=-1;
                                $scope.thData.treasureHunts[index].treasureHuntDetails=$scope.thData.treasureHunts[index].treasureHuntDescription;
                                $scope.thData.treasureHunts[index].aggregateRatings={
                                        reviewCount:"0",
                                        ratingValue:"0"
                                }
                            }
                        }
                    }
                },
                function(error) {
                    console.log("Error: ", error);
                    console.log("Nothing found");
                }
            )

            
        }

        $scope.showVideo=function(title,videoUrl){
            console.log("Video details:",title,videoUrl);
            $scope.videoQueries.videoTitle=title;
            var trustedUrl = $sce.trustAs('resourceUrl',videoUrl)
            console.log('trusted url : ',trustedUrl);
            $scope.videoQueries.youtubeUrl=trustedUrl;
            $('div.modal-body').html('<iframe style="position:relative;" width="100%;" height="300px;" src="'+$scope.videoQueries.youtubeUrl+'" frameborder="0" allowfullscreen></iframe>');  
        }

        $scope.setMetaDescription = function(desc){
            var meta=document.getElementsByTagName("meta");
            for (var i=0; i<meta.length; i++) {
                if (meta[i].name.toLowerCase()=="description") {
                    meta[i].content=desc;
                }
            }
        }
    }])

    .controller('HomeCtrl', ['$scope', '$state','$stateParams', function($scope, $state,$stateParams) {
        console.log("Inside HomeCtrl");
        window.scrollTo(0, 0);
        var onload = function(){
            var cityCode= $stateParams.cityCode;
            document.title='Sparrowz - Discover places around you by playing treasure hunts, quests, walks, tours - all from your mobile device';

            $scope.setMetaDescription("Sparrowz App helps in discovering places in a fun and engaging way. Buy tickets for curated events/quests/treasure hunts across cities and play with your friends and family using mobile device. Anyone can setup their own treasure hunt game for personal events in few simple steps and play from mobile. Corporate teams can use it for team-building activities in resorts, parks or office locations.");
                
            if(cityCode){
                $scope.changeCityData(cityCode);
                $scope.setCityChangeEventListener(function(cityCode){ // This is called when user changes city
                    $state.go('app.home',{cityCode:cityCode});
                })
            }else{
                $state.go('app.home',{cityCode:'BLR'});
            }
        };

        onload();
    }])

    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/BLR/ourQuests');
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('app',{
                url:'',
                templateUrl:'app.html',
                abstract:true,
                controller: 'AppCtrl'
            })
            .state('app.home', {
                url: '/:cityCode/ourQuests',
                templateUrl: 'home.html',
                controller: 'HomeCtrl'
            })
            .state('app.ERR404', {
                url: '/error/404',
                templateUrl: '404.html',
                controller:function($scope){
                    document.title='404 - Sparrowz';
                    $scope.setCityChangeEventListener(null);
                    window.scrollTo(0, 0);
                }
            })
            .state('app.contact', {
                url: '/contact',
                templateUrl: 'contact_us.html',
                controller:function($scope){
                    document.title='Contact - Sparrowz';
                    $scope.setCityChangeEventListener(null);
                    window.scrollTo(0, 0);
                }
            })
            .state('app.corporates',{
                url:'/yourQuests',
                templateUrl:'corporates.html',
                controller:'CorporatesCtrl'
            })

            .state('app.corporatesDetail', {
                url: '/yourQuests/:pageName',
                templateUrl: 'quests.html',
                controller:'QuestsCtrl'
            })

            .state('app.contest', {
                url: '/contest',
                templateUrl: 'contest.html',
                controller:function($scope){
                    document.title='Contest and Offers - Sparrowz';
                    $scope.setCityChangeEventListener(null);
                    window.scrollTo(0, 0);
                }
            })

           .state('app.asSeen', {
                url: '/asSeen',
                templateUrl: 'media.html',
                controller:function($scope){
                    document.title='As Seen On - Sparrowz';
                    $scope.setCityChangeEventListener(null);
                    window.scrollTo(0, 0);
                }
            })
            .state('app.detail', {
                url: '/:cityCode/:thIdentifier',
                templateUrl: 'events.html',
                controller:'EventCtrl'
            })
    })