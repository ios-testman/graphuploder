var express = require('express'),
    path = require('path'),
    http = require('http'),
    photo = require('./routes/photos');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, 'public/build/PS/production')));
    } else {
        app.use(express.static(path.join(__dirname, 'public')));
    }
});

app.get('/photos', photo.findAll);
app.get('/photos/:id', photo.findById);
app.post('/photos', photo.addPhoto);
app.put('/photos/:id', photo.updatePhoto);
app.delete('/photos/:id', photo.deletePhoto);

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

