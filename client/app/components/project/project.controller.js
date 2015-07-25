(function(angular){
	angular.module('folio.components.project.controller', [
		'ui.router',
		'ui.tinymce',
		'folio.components.project.resource',
		'folio.components.tag.resource',
		'folio.components.alert.directive',
		'folio.components.project.thumbUpload',
		'ngFileUpload'
	])
	.controller('ProjectCtrl', [
		'$scope',
		'$state',
		'Project',
		'Tag',
		'Upload',
		'$http',
		'$log',
		'Upload',
		ProjectCtrl]);

	function ProjectCtrl($scope, $state, Project, Tag, Upload, $http, $log, Upload){
		$scope.$state = $state;
		$scope.message = {};
		$scope.project = {};
		$scope.allTags = [];

		$scope.$watch('files', function(newVal){
			if(!newVal) return;

			$scope.thumbToUpload = newVal[0];
		});

		if($state.params.id) {
			Project.get({id: $state.params.id}, function(project){
				$scope.project = project[0];
				$scope.project.date = new Date($scope.project.date);

				Tag.get(function(tags){
					$scope.allTags = tags;
					$scope.project.tags = _.filter($scope.project.tags, function(tag){
						return _.find($scope.allTags, {name: tag});
					});
				});

			}, function(e) {
				if(e.status === 404) {
					$state.go('root.404');
					return;
				}

				if(e.status !== 200) {
					$state.go('root.error');
				}
			});
		}

		$scope.suggestedTags = [];
		$scope.tagSearch = '';

		$scope.addSuggestedTag = function(tag) {
			uniqPushTo($scope.project.tags, tag);
			_.remove($scope.suggestedTags, function(suggestedTag){
				return suggestedTag === tag;
			});
		};

		$scope.removeTag = function(removedTag) {
			_.remove($scope.project.tags, function(tag){
				return removedTag === tag;
			});
		};

		function uniqPushTo(array, value){
			if(_.includes(array, value)) return;

			array.push(value);
		}

		$scope.$watch('tagSearch', function(newVal){

			if(_.isUndefined(newVal)) return;
			if(_.isEmpty(newVal)) {
				$scope.suggestedTags = [];
				return;
			}

			if(newVal.length > 2) {
				$scope.allTags.map(function(tag){
					if(s(tag.name).startsWith(newVal)) {
						uniqPushTo($scope.suggestedTags,tag.name);
						$scope.suggestedTags = _.filter($scope.suggestedTags, function(tag){
							return !_.includes($scope.project.tags, tag);
						});
					}
				});
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

    	$scope.cancelReplaceThumbnail = function(){
    		$scope.thumbToUpload = null;
    	};

    	$scope.submit = function(){

			$scope.project.tags = $scope.project.tags.map(function(tag){
				return tag.trim();
			});

			// If there is a thumb to upload
	    	if($scope.thumbToUpload){
	    		var filename = _.snakeCase($scope.project.title) + '_thumb.' + _.last($scope.thumbToUpload.name.split('.'));

	    		Upload.upload({
	    			url: '/api/upload/thumb',
	    			fields: {
	    				filename: filename
	    			},
	    			file: file
	    		}).success(function(thumbMetadata){
	    			$scope.project.thumbLink = thumbMetadata.data.publicLink;
	    			saveProject();
	    		}).error(function(err){
	    			$log.error(err);
	    		});
	    	}else{
	    		saveProject();
	    	}

    	};

    	function saveProject(){
    		var project = new Project($scope.project);

    		if($state.current.name === 'root.project.create'){
	    		project.$save().then(function(result){
	    			$state.go('root.project.edit', {id: result.id});

	    			$scope.message.success = 'Project successfully created !';
	    		}, function(e) {
	    			$scope.message.error = 'Project not created. ' + e.statusText;
	    		});
    		}

    		if($state.current.name === 'root.project.edit'){
	    		project.$update().then(function(result){
	    			$scope.project = result;
	    			$scope.project.date = new Date(result.date);

	    			$scope.message.success = 'Project successfully updated !';
	    		}, function(e){
	    			$scope.message.error = 'Project not updated. ' + e.statusText;
	    		});
    		}
    	}

	}

})(window.angular);