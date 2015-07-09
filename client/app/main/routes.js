(function(angular){
	angular.module('folio.main.routes', ['ui.router'])
	.config(function($stateProvider){

	$stateProvider
	    .state('root', {
	      abstract: true,
	      templateUrl: '/app/index.html'
	    })
	    .state('root.home', {
	    	url: '/',
	    	templateUrl: '/app/main/main.html'
	    })
	    .state('root.project', {
	    	url: '/project',
	    	abstract: true,
	    	templateUrl: '/app/components/project/project.html',
	    	controller: 'ProjectCtrl'
	    })
	    .state('root.project.create', {
	    	url: '/create',
	    	templateUrl: '/app/components/project/project.html'
	    })
	    .state('root.project.edit', {
	    	url: '/edit/:id',
	    	templateUrl: '/app/components/project/project.html'
	    });
	});

})(window.angular);