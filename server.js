const express = require('express');
const app = express();
const port = 3000;
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const mongodbUrl = "mongodb://localhost:27017/";
const dbName = "expressjs-crud-mongodb";

let notices = [];

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	MongoClient.connect(mongodbUrl, function(err, db) {
		if (err) throw err;
		let dbo = db.db(dbName);
		dbo.collection("users").find({}).toArray(function(err, results) {
			if (err) throw err;
			res.render('pages/index', {
				users: results
			});
			db.close();
		});
	});
});

app.get('/user-add', (req, res) => {
	res.render('pages/user-add');
});

app.post('/user-add', function (req, res) {
	notices = [];
	let fName = req.body.txtFName || '';
	let lName = req.body.txtLName || '';
	if(fName != '' && lName != '') {
		MongoClient.connect(mongodbUrl, function(err, db) {
			if (err) throw err;
			let dbo = db.db(dbName);
			let o_query = { first_name: fName, last_name: lName };
			dbo.collection("users").find(o_query).toArray(function(err, results) {
				if (err) throw err;
				if(results.length >= 1) {
					notices.push('User already exist');
					res.render('pages/user-add', {
						notices: notices
					});
					db.close();
				}
				else {
					let o_insert = { first_name: fName, last_name: lName };
					dbo.collection("users").insertOne(o_insert, function(err, results) {
						if (err) throw err;
						notices.push('User Added');
						res.render('pages/user-add', {
							notices: notices
						});
						db.close();
					});
				}
			});
		});
	}
	else {
		res.render('pages/user-add');
	}
});

app.get('/user-edit/:userId', function (req, res) {
	notices = [];
	let userId = req.params.userId || '';
	if(userId != '') {
		MongoClient.connect(mongodbUrl, function(err, db) {
			if (err) throw err;
			let dbo = db.db(dbName);
			let o_id = new mongodb.ObjectID(userId);
			let o_query = { _id: o_id };
			dbo.collection("users").find(o_query).toArray(function(err, results) {
				if (err) throw err;
				if(results.length >= 1) {
					res.render('pages/user-edit', {
						result: results[0]
					});
					db.close();
				}
				else {
					notices.push('User NOT Found');
					res.render('pages/user-edit', {
						result: [],
						notices: notices
					});
					db.close();
				}
			});
		});
	}
	else {
		res.redirect('/');
	}
});

app.post('/user-edit/:userId', function (req, res) {
	notices = [];
	let fName = req.body.txtFName || '';
	let lName = req.body.txtLName || '';
	let userId = req.params.userId || '';
	if (fName != '' && lName != '' && userId != '') {
		MongoClient.connect(mongodbUrl, function(err, db) {
			if (err) throw err;
			let dbo = db.db(dbName);
			let o_id = new mongodb.ObjectID(userId);
			let o_query = { _id: o_id };
			let o_newvalues = { $set: { first_name: fName, last_name: lName } };
			dbo.collection("users").updateOne(o_query, o_newvalues, function(err, results) {
				if (err) throw err;
				notices.push('User Updated');
				res.render('pages/user-edit', {
					notices: notices,
					result: {_id: userId, first_name: fName, last_name: lName}
				});
				db.close();
			});
		});
	}
	else {
		res.redirect('/');
	}
});

app.post('/user-delete/:userId', function (req, res) {
	notices = [];
	let userId = req.params.userId || '';
	if (userId != '') {
		MongoClient.connect(mongodbUrl, function(err, db) {
			if (err) throw err;
			let dbo = db.db(dbName);
			let o_id = new mongodb.ObjectID(userId);
			let o_query = { _id: o_id };
			dbo.collection("users").deleteOne(o_query, function(err, obj) {
				if (err) throw err;
				notices.push('User Deleted');
				res.render('pages/user-deleted', {
					notices: notices
				});
				db.close();
			});
		});
	}
	else {
		res.redirect('/');
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});