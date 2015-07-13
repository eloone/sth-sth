(function(angular){
	angular.module('folio.main.navbar.directive', [])
	.directive('folioNavbar', function(){
		return {
			restrict: 'E',
			templateUrl: '/app/main/navbar/navbar.html'
		};
	});
})(window.angular);