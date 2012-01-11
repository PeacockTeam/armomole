var mongodb = require("mongodb"),
    config = require("./config.js");

var mongo = new mongodb.Server(
        config.mongo.host,
        config.mongo.port);

var db = new mongodb.Db(
        config.mongo.database,
        mongo);

db.open(function(error) {
    if (error) throw error;
});

exports.saveSamples = function(data) {
    db.collection('tracks', function(err, collection) {
        collection.insert(data);
    });
}

exports.getSamples = function(data, result) {
    db.collection("tracks", function(err, collection) {
        collection.find(data, function(err, cursor) {
            cursor.toArray(function(err, items) {
                if (items.length > 0) {
                    result(items[0].samples);
                } else {
                    result();
                }
            });
        });
    });
}
