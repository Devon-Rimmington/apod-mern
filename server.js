const express = require('express');
const mongoClient = require('mongodb').MongoClient();
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//require('babel-polyfill');
const https = require('https');
const Cookies = require('cookies');
// const session = require('client-sessions');
const jwt = require('jsonwebtoken');
const googleAuth = require('google-auth-library');
const auth = new googleAuth;


const apodBuilder = require('./bin/build-apod-list.js');

let mongo;

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(cookieParser());

const domain = 'https://api.nasa.gov/planetary/apod';
const api_key = '**********';

// gets the data from apod api at a specific date
app.get('/api/apod/:date', (req, res) => {
  // collect the date from the url
  let date = req.params.date;

  // https request to the apod api at the date
  https.get(domain + '?api_key=' + api_key + '&date=' + date, (response) => {

    const { statusCode } = response;
    const contentType = response.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      response.resume();
      res.status(statusCode).json({error: error.message});
      return;
    }

    response.setEncoding('utf8');

    // collect the data from the request
    let rawdata = '';
    response.on('data', (chunk) => {
      rawdata += chunk;
    });
    // when the stream is closed return the data
    response.on('end', () => {
      let item = JSON.parse(rawdata);
      res.json(item);
    });

  });

});

// gets the data from apod api over a number of dates
app.get('/api/apod/:startdate/:limit', (req, res) => {

  // collect the start date for the requests
  let date = req.params.startdate;

  // function to be looped over until the 'limit' is reached
  function getData(data) {

    //perform the https request to the apod api
    https.get(domain + '?api_key=' + api_key + '&date=' + date, (response) => {

      const { statusCode } = response;
      const contentType = response.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        response.resume();
        res.status(statusCode).json({error: error.message});
        return;
      }

      response.setEncoding('utf8');

      // collect the data while the stream is open
      let rawdata = '';
      response.on('data', (chunk) => {
        rawdata += chunk;
      });

      // when the stream is closed determine whether more data should be collected or return the data
      response.on('end', () => {

        let item = JSON.parse(rawdata) ;
        // get the number of votes (likes that an image has in aggregate)
        mongo.collection('apod').aggregate([{$match:{date:date}}, {$group:{'_id':'$date', votes:{$sum:'$votes'}}}]).toArray((err, voteCount) => {
          // get if the votes exist
          if(!voteCount[0]) {
            item.votes = 0;
          }else { // if they do add them to the item
            item.votes = voteCount[0].votes;
          }

          // push the item into the return data
          data.push(item);

          // if the limit of items has not been reached run the function again
          if(data.length < req.params.limit) {
            // update the date to be the previous date and prepare it for the next api call
            date = new Date(date);
            date.setDate(date.getDate() - 1);
            date = date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '');

            // call the promise again while passing in the data from the previous results
            getData(data);
          }else {
            // return the array of entries when the loop has been finished
            res.json({data: data});
          }
        });
      });
    });
  }

  // call the getData function initially with an empty array
  getData([]);

});

// gets the signin status of a user
app.get('/api/status', (req, res) => {

  // get the cookies
  let cookie = new Cookies(req, res, {key: 'demo-secret-cookie'});

  // get the apodapi auth cookie setup when a user is signed in
  if(cookie.get('apodapi')) {
    let jsonwebtoken = cookie.get('apodapi');
    // verify that the webtoken exists in the cookie and is correct
    jwt.verify(jsonwebtoken, 'demo-secret-token', (error, result) => {
      if(!error) {
        // if the status is signed in return the username
        res.status(200).json({usersname: result.usersname});
      }
      else {
        // otherwise return an error status code indicating that the user is not signed in yet
        res.status(401).json({error: error});
      }
    });
  }
  else { // if no cookie is found at all indicate this to the broswer
    res.status(401).json({error: 'no cookie present'});
  }
});

// handle every other route with index.html, which will contain
app.get('*', (req, res) => {
  res.sendFile(path.resolve('static/index.html'));
})

// log the user in to the application
app.post('/api/login', (req, res) => {

  // check if the signin token is present from the google signin
  if(!req.body.id_token) {res.send('no body ' + req.body)}// throw 400 error
  else{
    let client = new auth.OAuth2('906357840720-15omrini6c7k1kmr6su2kgqh61dopp8f.apps.googleusercontent.com', '', '');
    // verify the token using google oauth
    client.verifyIdToken(req.body.id_token, '906357840720-15omrini6c7k1kmr6su2kgqh61dopp8f.apps.googleusercontent.com', (error, login) => {
      if(error) {res.status(401).json({error: error})}
      else {
        // create a json web token with the token id number and the username
        // set it to expire in an hour
        jwt.sign({token: login.getPayload()['sub'], usersname: req.body.usersname}, 'demo-secret-token', {expiresIn:(60*60*1000)}, (err, result) => {
          // console.log('token!' + result  + err);
          // create a cookie and send back the cookie and username to the maker of the request
          let cookie = new Cookies(req, res, {key:'demo-secret-cookie'})
          cookie.set('apodapi', result, {maxAge:10*60*1000});
          res.json({usersname: req.body.usersname});
        });
      }
    });
  }
});

// logout the user
app.post('/api/logout', (req, res) => {
  // get the cookie
  let cookie = new Cookies(req, res, {key:'demo-secret-cookie'});
  // if there cookie is still active
  if(cookie.get('apodapi')) {
    // if the cookie can be verified
    jwt.verify(cookie.get('apodapi'), 'demo-secret-token', (error, result) => {
      if(!error) {
        // set the cookies expiration date to be in the past
        let date = new Date();
        date.setDate(date.getDate() - 1);

        // additionally set the token to be something that will fail and not contain any personal information
        cookie.set('apodapi', 'loggedout', {expires: date});
        res.redirect('/');
      }else {
        res.status(401).json({})
      }
    });
  }else {
    res.status(401).json({})
  }

});

// update a rank of an image/date in the mongo database
app.post('/api/apod/vote', (req, res, next) => {
  // get the date for which to add a vote
  let date = req.body.date;
  // get the cookie
  let cookie = new Cookies(req, res, {key: 'demo-secret-cookie'});
  // verify that the user attempting to vote has a cookie
  console.log(cookie.get('apodapi'));
  if(cookie.get('apodapi')) {
    let jsonwebtoken = cookie.get('apodapi');
    console.log('cookie! '+jsonwebtoken);
    // get the decoded payload of the jsonwebtoken (clients id)
    jwt.verify(jsonwebtoken + '', 'demo-secret-token', (error, result) => {
      console.log('webtoken! ' + error);
      if(!error) {
        // if there is not error add a vote for the date from this id
        mongo.collection('apod').findOne({u_id: result.token, date: date}, function(err, user) {

          // if no user for that date
          if(!user) { // hasn't yet voted for that date
            mongo.collection('apod').insert({u_id: result.token, date: date, votes: 1});
            // res.end(200);
            res.status(200).json({result:'test'});
            res.end();
          }
          else { // already voted for that date therefor down vote
            mongo.collection('apod').updateOne({u_id: result.token, date: date}, {
              $set: {votes: (user.votes === 0)? 1 : 0}, // if the user has voted undo the vote otherwise redo the vote
              $currentDate: {'lastModified': true}
            });
            // res.end(200);
            res.status((user.votes === 0)? 200 : 201).json({});
            res.end();
          }
        });
        // res.end(421);
      }
      else {
        // incorrect token
        res.status(401).json({});
        res.end();
      }
    });
  }
  else {
    // res.end(500);
    // not logged in
    res.status(401).json({});
    res.end();
  }
});

// connect to the mongodb server
mongoClient.connect('mongodb://localhost:27017/test', (err, db) => {
  if(!err){
    // set the mongo db as an variable
    mongo = db;
    // start the server listening on port 3000
    app.listen(3000, () => {
      console.log('server has been started');
      // apodBuilder.loadData(1);
    });
  }
});
