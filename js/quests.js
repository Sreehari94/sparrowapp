angular.module('app.corporates.quests',[])
	.controller('CorporatesCtrl', ['$scope', '$http', '$q', '$stateParams','$state', function($scope, $http, $q, $stateParams, $state) {
		console.log("Inside Corporates Ctrl");
		document.title='Corporates - Sparrowz';
        window.scrollTo(0, 0);
        $scope.setCityChangeEventListener(null);
        if(!$scope.corporateData){
        	$http.get('assets/corporates.json').then(
                function(response) {
                    console.log("Corporates response: ", response);
                    $scope.corporateData=response.data.body;
                },
                function(error) {
                    console.log("Error: ", error);
                }
            )
        }
	}])
	.controller('QuestsCtrl', ['$scope', '$http', '$q', '$stateParams','$state', function($scope, $http, $q, $stateParams, $state) {
		console.log("Inside Quests Ctrl");
		console.log("stateParams: ",$stateParams.pageName);
		$scope.setCityChangeEventListener(null);
        window.scrollTo(0, 0);

        /*$scope.toggleDiv=function(indexId) {
            console.log("Index Id of card: ",indexId);
            var infoId='catInfo'+indexId;
            if(document.getElementById(infoId)){
                var ele = document.getElementById(infoId);
                if(ele.style.display == "block") {
                    ele.style.display = "none";
                }
                else {
                    ele.style.display = "block";
                }
            }
        } */

        var getCorporateData=function(){
            var deferred= $q.defer();
            if(!$scope.corporateData){
                console.log("Inside corporateData if part");
                $http.get('assets/corporates.json').then(
                    function(response) {
                        console.log("Corporates response: ", response);
                        $scope.corporateData=response.data.body;
                        for(var i=0;i<$scope.corporateData.corporateList.length;i++){
                            if($scope.corporateData.corporateList[i].pageName==$stateParams.pageName){
                                document.title = $scope.corporateData.corporateList[i].pageTitle+' - Sparrowz';
                                deferred.resolve($scope.corporateData.corporateList[i]);
                                break;
                            }else{
                                if(i==$scope.corporateData.corporateList.length-1){
                                    $state.go('app.ERR404');
                                }  
                            }
                        }
                    },
                    function(error) {
                        console.log("Error: ", error);
                        deferred.reject();
                    }
                )
            }else{
                console.log("Inside corporateData else part");
                for(var i=0;i<$scope.corporateData.corporateList.length;i++){
                    if($scope.corporateData.corporateList[i].pageName==$stateParams.pageName){
                        document.title = $scope.corporateData.corporateList[i].pageTitle+' - Sparrowz';
                        deferred.resolve($scope.corporateData.corporateList[i]);
                        break;
                    }else{
                        if(i==$scope.corporateData.corporateList.length-1){
                            $state.go('app.ERR404');
                        }  
                    }
                }
            } 
            return deferred.promise;  
        }

        var showSelectedCorporateData=function(){
            getCorporateData().then(function(response){
                $scope.corporalData=response;
            },function(error){
                $state.go('app.ERR404');
            });
        }
		
        showSelectedCorporateData();
	}]);