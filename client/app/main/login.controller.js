(function(angular){
	angular.module('folio.main.login', [])
	.controller('LoginCtrl', ['$scope', '$http', '$rootScope', '$state', '$log', Controller]);

	function Controller($scope, $http, $rootScope, $state, $log) {
		$scope.user = {};
		$scope.submit = function(){
			$http({
				method: 'POST',
				url: '/api/login',
				data: {
					username: $scope.user.username,
					password: $scope.user.password
				}
			}).then(function(res){
				$rootScope.authenticated = res.data.authenticated;
				if(res.data.authenticated){
					$state.go('root.home');
				}
			}, function(err){
				$log.error(err);
			});
		};
	}

})(window.angular);