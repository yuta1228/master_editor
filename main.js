(function() {
  var app, db, fs, mongo, path, server, url;

  app = require("express");

  fs = require("fs");

  path = require('path');

  url = require('url');

  mongo = require('mongodb');

  server = new mongo.Server('localhost', 27017, {
    auto_reconnect: true
  });

  db = new mongo.Db("tinyquest", server);

  server = app.createServer();

  server.get('/', function(req, res) {
    return fs.readFile('./tpl/index.html', function(error, content) {
      if (error) {
        res.writeHead(500);
        return res.end(error);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        return res.end(content, 'utf-8');
      }
    });
  });

  server.get('/static/*', function(req, res) {
    var filePath;
    filePath = '.' + req.url.replace('static', 'htdocs');
    return path.exists(filePath, function(exists) {
      if (exists) {
        return fs.readFile(filePath, function(error, content) {
          var ext;
          if (error) {
            res.writeHead(500);
            return res.end();
          } else {
            ext = path.basename(filePath).split(".").pop();
            if (ext === "js") {
              res.writeHead(200, {
                'Content-Type': 'application/javascript'
              });
              return res.end(content, 'utf-8');
            } else if (ext === "png") {
              res.writeHead(200, {
                'Content-Type': 'image/png'
              });
              return res.end(content, 'utf-8');
            } else {
              res.writeHead(200, {
                'Content-Type': 'text/html'
              });
              return res.end(content, 'utf-8');
            }
          }
        });
      } else {
        res.writeHead(404);
        return res.end();
      }
    });
  });

  db.open(function(err, db) {
    var check_data;
    server.post('/api/*', function(req, res) {
      var body;
      body = '';
      req.on('data', function(data) {
        return body += data;
      });
      return req.on('end', function() {
        var context;
        context = url.parse(req.url)['pathname'].split("/api/")[1];
        if (!err) {
          return db.collection(context, function(err, collection) {
            var i, update_data, _i, _len, _results;
            update_data = function(data) {
              var id;
              if (data._id) {
                id = mongo.ObjectID(data._id);
                delete data._id;
                collection.findOne({
                  _id: id
                }, function(err, item) {});
                return collection.update({
                  '_id': id
                }, data, {
                  upsert: true,
                  safe: true
                }, function(err, result) {});
              } else {
                delete data._id;
                return db.collection("counters", function(err, counter) {
                  return counter.findAndModify({
                    _id: "weapon_id"
                  }, {}, {
                    $inc: {
                      c: 1
                    }
                  }, function(err, new_counter) {
                    data.num_id = new_counter.c;
                    return console.log(data);
                  });
                });
              }
            };
            body = JSON.parse(body);
            if (body.length > 0) {
              _results = [];
              for (_i = 0, _len = body.length; _i < _len; _i++) {
                i = body[_i];
                _results.push(update_data(i));
              }
              return _results;
            } else {
              return update_data(body);
            }
          });
        }
      });
    });
    check_data = function(context, res) {
      var body, d;
      d = context;
      if (d.data !== void 0 && d.reference !== void 0 && d.enums !== void 0 && d.total !== void 0) {
        body = JSON.stringify(d);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8'
        });
        return res.end(body);
      }
    };
    return server.get('/api/*', function(req, res) {
      var context, fields, fl, param, ret_data, _i, _len, _ref;
      context = url.parse(req.url)['pathname'].split("/api/")[1];
      param = req.query;
      if (param.fields) {
        fields = {};
        _ref = param.fields.split(',');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          fl = _ref[_i];
          fields[fl] = 1;
        }
      } else {
        fields = null;
      }
      console.log(context);
      ret_data = {};
      ret_data[context] = {};
      console.log(fields === {});
      if (fields === null) {
        db.collection("reference").findOne({
          name: context
        }, function(err, item) {
          if (!err) {
            console.log('reference', item);
            if (item !== null) {
              ret_data[context].reference = item.data;
            } else {
              ret_data[context].reference = {};
            }
          } else {
            console.trace();
          }
          return check_data(ret_data[context], res);
        });
        db.collection("enums").findOne({}, {
          fields: {
            _id: 0
          }
        }, function(err, item) {
          if (item) {
            console.log(item);
            ret_data[context].enums = item;
          } else {
            console.log(err);
          }
          return check_data(ret_data[context], res);
        });
        db.collection(context).find({}, {
          skip: param.start,
          limit: param.limit,
          sort: "n_id"
        }).toArray(function(err, item) {
          if (!err) {
            ret_data[context].data = item;
          } else {
            console.trace();
          }
          return check_data(ret_data[context], res);
        });
      } else {
        fields['_id'] = 0;
        db.collection(context).find({}, fields).sort("n_id", 1).toArray(function(err, item) {
          if (!err) {
            console.log(item, 'test');
            ret_data[context].data = item;
          } else {
            console.trace();
          }
          return check_data(ret_data[context], res);
        });
      }
      return db.collection(context).count(function(err, count) {
        if (!err) {
          if (count !== null) {
            ret_data[context].total = count;
          } else {
            ret_data[context].total = 0;
          }
        } else {
          console.trace();
        }
        return check_data(ret_data[context], res);
      });
    });
  });

  server.listen(8080);

}).call(this);
