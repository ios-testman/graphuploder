//var mongo = require('mongodb');
var mongos = require('mongoose'),
    mongo = mongos.mongo;

//var mongoUri = process.env.MONGOLAB_URI || "mongodb://localhost/photodb?auto_reconnnect";
var mongoUri = process.env.MONGOHQ_URL || "mongodb://localhost/photodb?auto_reconnnect";
var db = null,
    BSON = mongo.BSONPure;

mongo.connect(mongoUri, {}, function(err, database) {
    if(!err) {
        db = database;
        console.log("Connected to 'photodb' database");
        db.collection('photos', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'photos' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving photo: ' + id);
    db.collection('photos', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('photos', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addPhoto = function(req, res) {
    var photo = req.body;
    console.log('Adding photo: ' + JSON.stringify(photo));
    db.collection('photos', function(err, collection) {
        collection.insert(photo, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updatePhoto = function(req, res) {
    var id = req.params.id;
    var photo = req.body;
    delete photo._id;
    console.log('Updating photo: ' + id);
    console.log(JSON.stringify(photo));
    db.collection('photos', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, photo, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating photo: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(photo);
            }
        });
    });
};

exports.deletePhoto = function(req, res) {
    var id = req.params.id;
    console.log('Deleting photo: ' + id);
    db.collection('photos', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
var populateDB = function() {
    // var photos = [
    //     {
    //         description: "Ready to presentation"
    //     }
    // ];

    // db.collection('photos', function(err, collection) {
    //     collection.insert(photos, {safe:true}, function(err, result) {});
    // });
};
