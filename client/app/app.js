(function(angular){
	angular.module('folio', [
		'folio.main',
		'folio.components'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		 $locationProvider.html5Mode(true);
	});
})(window.angular);