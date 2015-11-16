'use strict';

var projectId = process.env.GAE_LONG_APP_ID || process.env.DATASET_ID || 'portfolio-997';
var appEnv = process.env.APP_ENV || 'development';
var _ = require('lodash');

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

  this.delete = function(id, callback) {
    ds.delete(ds.key({ namespace: appEnv, path:[settings.kind, settings.kindName, settings.entity, id]}), function(err) {
      callback(err || null);
    });
  };

  this.getAll = function(callback) {
    var q = ds.createQuery(appEnv, settings.entity)
      .hasAncestor(ds.key({namespace: appEnv, path: [settings.kind, settings.kindName]}));
    ds.runQuery(q, function(err, items) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, items.map(formatItem));
    });
  };

  this.get = function(id, callback) {
    ds.get(ds.key({namespace: appEnv, path: [settings.kind, settings.kindName, settings.entity, id]}), function(err, item) {
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
      callback(null, [formatItem(item)]);
    });
  };

  this.insert = function(data, callback) {
    var key = [settings.kind, settings.kindName, settings.entity];
    var name = data.ENTITY_NAME;

    if(data.data){
      data = data.data;
    }

    if(data.ENTITY_NAME) {
      key.push(data.ENTITY_NAME);

      delete data.ENTITY_NAME;
    }

    var savedKey = ds.key({namespace: appEnv, path: key});

    ds.save({
      key: savedKey,
      data: data
    }, function(err) {
      if (err) {
        callback(err);
        return;
      }

      if(_.isArray(data)){
        data.push({
          name: 'id',
          value: savedKey.path.pop()
        });
      } else {
        data.id = savedKey.path.pop();
      }

      callback(null, data);
    });
  };

  this.update =  function(id, data, callback) {
    if(data.data){
      data = data.data;
    }

    ds.save({
      key: ds.key({namespace: appEnv, path: [settings.kind, settings.kindName, settings.entity, id]}),
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