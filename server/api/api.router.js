'use strict';

module.exports = {
	setApiRouter: setApiRouter,
	handleApiResponse: handleApiResponse
};

function setApiRouter(routeName, api, apiHandler, verbs){
	api.post('/' + routeName, function(req, res) {
	  apiHandler.insert(req.body, handleApiResponse(res, 201));
	});

	api.get('/' + routeName, function(req, res) {
	  apiHandler.getAll(handleApiResponse(res, 200));
	});

	api.get('/' + routeName + '/:id', function(req, res) {
	  apiHandler.get(req.params.id, handleApiResponse(res, 200));
	});

	api.patch('/' + routeName + '/:id', function(req, res) {
		console.log('req.body', req.body);
	  apiHandler.update(req.params.id, req.body, handleApiResponse(res, 200));
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