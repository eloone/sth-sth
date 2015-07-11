(function(angular){
	angular.module('folio.components.project.controller', [
		'ui.router',
		'ui.tinymce',
		'folio.components.project.resource',
		'folio.components.alert.directive'
	])
	.controller('ProjectCtrl', ['$scope', '$state', 'Project', ProjectCtrl]);

	function ProjectCtrl($scope, $state, Project){
		$scope.$state = $state;
		$scope.project = {};

		Project.get({id: $state.params.id}, function(project){
			$scope.project = project[0];
			$scope.project.date = new Date($scope.project.date);
		}, function(e) {
			if(e.status === 404) {
				$state.go('root.404');
			}

			if(e.status !== 200) {
				$state.go('root.error');
			}
		});

		$scope.tinymceOptions = {
	        theme: "modern",
	        plugins: [
	            "advlist autolink lists link image charmap preview hr anchor pagebreak",
	            "searchreplace wordcount visualblocks visualchars code fullscreen",
	            "insertdatetime media nonbreaking save table contextmenu directionality",
	            "emoticons template paste textcolor"
	        ],
	        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
	        toolbar2: "print preview media | forecolor backcolor emoticons",
	        image_advtab: true,
	        height: "200px"
    	};

    	$scope.submit = function(){
    		var project = new Project($scope.project);

    		if($state.current.name === 'root.project.create'){
	    		project.$save().then(function(result){
	    			$state.go('root.project.edit', {id: result.id});
	    		}, function(e) {
	    			$scope.message.error = 'Project not created. ' + e.statusText;
	    		});
    		}

    		if($state.current.name === 'root.project.edit'){
	    		project.$update().then(function(result){
	    			$scope.project = result;
	    			$scope.project.date = new Date(result.date);
	    		}, function(e){
	    			$scope.message.error = 'Project not updated. ' + e.statusText;
	    		});
    		}

    	};

	}

})(window.angular);