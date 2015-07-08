'use strict';

var projectId = process.env.GAE_LONG_APP_ID || process.env.DATASET_ID || 'portfolio-997';

if (!projectId) {
  var MISSING_ID = [
    'Cannot find your project ID. Please set an environment variable named ',
    '"DATASET_ID", holding the ID of your project.'
  ].join('');
  throw new Error(MISSING_ID);
}

var gcloud = require('gcloud')({
  projectId: projectId,
  credentials: require('../../key.json')
});

var ds = gcloud.datastore.dataset();

module.exports = function(settings){
	return new documentApi(settings);
};

function formatItem(result) {
  var item = result.data;
  item.id = result.key.path.pop();
  return item;
}

function documentApi(settings){

  this.getAll = function(callback) {
    var q = ds.createQuery(settings.entity)
      .hasAncestor(ds.key([settings.kind, settings.kindName]));
    ds.runQuery(q, function(err, items) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, items.map(formatItem));
    });
  };

  this.get = function(id, callback) {
    ds.get(ds.key([settings.kind, settings.kindName, settings.entity, id]), function(err, item) {
      if (err) {
        callback(err);
        return;
      }

      if (!item) {
        callback({
          code: 404,
          message: 'No matching entity was found.'
        });
        return;
      }
      callback(null, formatItem(item));
    });
  };

  this.insert = function(data, callback) {
    ds.save({
      key: ds.key([settings.kind, settings.kindName, settings.entity]),
      data: data
    }, function(err, key) {
      if (err) {
        callback(err);
        return;
      }
      data.id = key.path.pop();
      callback(null, data);
    });
  };

  this.update =  function(id, data, callback) {
    ds.save({
      key: ds.key([settings.kind, settings.kindName, settings.entity, id]),
      data: data
    }, function(err) {
      if (err) {
        callback(err);
        return;
      }
      data.id = id;
      callback(null, data);
    });
  };

}