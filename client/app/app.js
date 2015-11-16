(function(angular){
	angular.module('folio', [
		'folio.main',
		'folio.components'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		 $locationProvider.html5Mode(true);
	})
	.run(['$rootScope', '$state', 'Auth', function($rootScope, $state, Auth){
		Auth.authenticate().then(function(res){
			var user = res.data;

			if(user.authenticated){
				$rootScope.authenticated = true;
			}
		});

		$rootScope.$watch('authenticated', function(val){
			if(val !== true && $state.current.name !== 'root.login'){
				$state.go('root.login');
			}
		});

		$rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from){
			if(to.name !== 'root.login' && !$rootScope.authenticated){
				$state.go('root.login');
			}

			if(to.name === 'root.login' && $rootScope.authenticated){
				$state.go('root.home');
			}
		});

	}]);
})(window.angular);