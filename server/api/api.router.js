'use strict';

module.exports = setApiRouter;

function setApiRouter(resourceName, api, documentApi){
	api.post('/' + resourceName, function(req, res) {
	  documentApi.insert(req.body, handleApiResponse(res, 201));
	});

	api.get('/' + resourceName, function(req, res) {
	  documentApi.getAll(handleApiResponse(res, 200));
	});

	api.get('/' + resourceName + '/:id', function(req, res) {
	  documentApi.get(req.params.id, handleApiResponse(res, 200));
	});

	api.patch('/' + resourceName + '/:id', function(req, res) {
	  documentApi.update(req.params.id, req.body, handleApiResponse(res, 200));
	});
}

function handleApiResponse(res, successStatus) {
  return function(err, payload) {
    if (err) {
      console.error(err);
      res.status(err.code).send(err.message);
      return;
    }

    if (successStatus) {
      res.status(successStatus);
    }

    res.json(payload);
  };
}