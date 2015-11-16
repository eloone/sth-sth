(function(angular){
	angular.module('folio.main.routes', ['ui.router'])
	.config(function($stateProvider){

	$stateProvider
	    .state('root', {
	      abstract: true,
	      templateUrl: '/app/main/main.html'
	    })
	    .state('root.login', {
	      url: '/login',
	      templateUrl: '/app/main/login.html',
	      controller: 'LoginCtrl'
	    })
	    .state('root.404', {
	      url: '/404',
	      templateUrl: '/app/components/404.html'
	    })
	    .state('root.error', {
	      url: '/server-error',
	      templateUrl: '/app/components/server-error.html'
	    })
	    .state('root.home', {
	    	url: '/',
	    	templateUrl: '/app/components/home.html'
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
	    })
	    .state('root.projects', {
	    	url: '/projects',
	    	templateUrl: '/app/components/project/list.html',
	    	controller: 'ProjectListCtrl'
	    })
	    .state('root.tag', {
	    	url: '/tag',
	    	abstract: true,
	    	templateUrl: '/app/components/tag/tag.html',
	    	controller: 'TagCtrl'
	    })
	    .state('root.tag.create', {
	    	url: '/create',
	    	templateUrl: '/app/components/tag/tag.html'
	    })
	    .state('root.tag.edit', {
	    	url: '/edit/:id',
	    	templateUrl: '/app/components/tag/tag.html'
	    })
	    .state('root.tags', {
	    	url: '/tags',
	    	templateUrl: '/app/components/tag/list.html',
	    	controller: 'TagListCtrl'
	    });
	});

})(window.angular);