(function(angular){
	angular.module('folio.main.navbar.directive', [])
	.directive('folioNavbar', ['Auth', '$rootScope', function(Auth, $rootScope){
		return {
			restrict: 'E',
			templateUrl: '/app/main/navbar/navbar.html',
			link: function($scope){
				$scope.logout = function(){
					Auth.logout().then(function(res){
						$rootScope.authenticated = res.data.authenticated;
					});
				};
			}
		};
	}]);
})(window.angular);