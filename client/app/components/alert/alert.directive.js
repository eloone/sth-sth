(function(angular){

	angular.module('folio.components.alert.directive', [])
	.directive('folioAlert', function(){
		return {
			restrict: 'E',
			scope: {
				message: '='
			},
			templateUrl: '/app/components/alert/alert.html'
		};
	});

})(window.angular);