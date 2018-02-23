// server.js
// load the things we need
var admin = require("firebase-admin");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var serviceAccount = require("./serviceAccountKey");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://test-ed96a.firebaseio.com"
})

var db = admin.database();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(express.static('public'));


// index page 
app.get('/', function (req, res) {
	var ref = db.ref("employees");
	ref.once("value", function (snapshot) {
		res.render('pages/index', {
			people: Object.keys(snapshot.val()).map(key => Object.assign({ key: key }, snapshot.val()[key]))
		});
	});
});

// Emplyoees
app.get('/employee/:key', function (req, res) {
	db.ref(`employees/${req.params.key}`)
		.once('value')
		.then(snapshot => {
			res.render('pages/employee', {
				employee: snapshot.val(),
				key: req.params.key
			});
		});
});

app.get('/employee/edit/:key', function (req, res) {
	db.ref(`employees/${req.params.key}`)
	.once('value')
	.then(snapshot => {
		res.render('pages/employee-edit', {
			employee: snapshot.val(),
			key: req.params.key
		});
	});
});

// about page 
app.get('/about', function (req, res) {
	res.render('pages/about');
});

// login page 
app.get('/login', function (req, res) {
	res.render('pages/login');
});


app.listen(8080);
console.log('8080 is the magic port');