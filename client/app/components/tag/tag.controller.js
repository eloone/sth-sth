(function(angular){
	angular.module('folio.components.tag.controller', [
		'ui.router',
		'ui.tinymce',
		'folio.components.tag.resource',
		'folio.components.alert.directive'
	])
	.controller('TagCtrl', ['$scope', '$state', 'Tag', TagCtrl]);

	function TagCtrl($scope, $state, Tag){
		$scope.$state = $state;
		$scope.tag = {};
		$scope.message = {};
		$scope.tagTypes = [
			'context',
			'skill',
			'category',
			'app-type'
		];

		$scope.$watchGroup(['tag.title', 'tag.type'], function(newVals, oldVals) {

			if(angular.equals(newVals, oldVals)) return;
			if(oldVals[0] === undefined && oldVals[1] === undefined) return;

			$scope.tag.name = s.slugify(newVals[0]) + '-' + s.slugify(newVals[1]);
		});

		if($state.params.id) {
			Tag.get({id: $state.params.id}, function(tag){
				$scope.tag = tag[0];
			}, function(e){
				if(e.status === 404) {
					$state.go('root.404');
				}

				if(e.status !== 200) {
					$state.go('root.error');
				}
			});
		}

		$scope.tinymceOptions = {
	        theme: "modern",
	        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
	        toolbar2: "print preview media | forecolor backcolor emoticons",
	        image_advtab: true,
	        height: "100px"
    	};

    	$scope.submit = function(){
    		var tag = new Tag($scope.tag);

    		if($state.current.name === 'root.tag.create'){
	    		tag.$save().then(function(result){
	    			$state.go('root.tag.edit', {
	    				id: result.id
	    			});

	    			$scope.message.success = 'Tag successfully created !';
	    		}, function(e) {
	    			$scope.message.error = 'Tag not created. ' + e.statusText;
	    		});
    		}

    		if($state.current.name === 'root.tag.edit'){
	    		tag.$update().then(function(result){
	    			$scope.tag = result;
	    			$scope.message.success = 'Tag successfully updated !';
	    		}, function(e){
	    			$scope.message.error = 'Tag not updated. ' + e.statusText;
	    		});
    		}

    	};

	}

})(window.angular);