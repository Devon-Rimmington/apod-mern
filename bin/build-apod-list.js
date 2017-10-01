const request = require('request');
const query = '?api_key=nCOFtfQQFN1qWu5dHiLN7lTZDLrxbMsCoAGvb3zs&date=';
const mongo = require('mongodb').MongoClient();
let database = true;
const hourInMilliseconds = (3.6 * 1000000);

let currentDate = new Date();

console.log(currentDate.getDate());

// reads from apod api and writes to the mongo database
// setInterval(loadData, hourInMilliseconds);

// apod api caller
// takes in a date and wether or not the returned url should be the HD version of the image
exports.loadData  = (...args) => {

};



// creates options for the request to the apod api
const createOptions = () =>{
  let options = {
    url: 'https://api.nasa.gov/planetary/apod',
    headers:[{
      name: 'Content-Type',
      value: 'application/json'
    }],
    qs:{api_key:'nCOFtfQQFN1qWu5dHiLN7lTZDLrxbMsCoAGvb3zs', date:parseDate(currentDate.toISOString())}
  }

  return options;
}

// takes in a date object and parse the ISO string to be in the correct format for YYYY-MM-DD
const parseDate = (date) => {
  let dateString = date.replace(/T[0-9]{2,}:[0-9]{2,}:[0-9]{2,}.[0-9]{3,}Z/, '');
  return dateString;
};

const apodEntry = (input) => {
  entry = {};
  Object.keys(input).forEach(key => {
    console.log(key);
    // entry[key] = input[key];
  });
  return entry;
};
