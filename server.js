/**
  * Server to run the web application on port 4200.
  * All dependencies can be downloaded using npm install.
  */

/* Get packages, start express and set up view engine to use Pug */
const express = require('express');
const request = require('request');
const app = express();
app.set('view engine', 'pug');
app.set('views', './views');

/*
 * Renders first page
 */
app.get('/', (req, res) => {
  res.render('search');
})

/*
 * Generate second or third page depending on the search
 */
app.get('/search', (req, res) => {
  var reference = req.query.client;
  var enquiryNo = req.query.case;

  /* Generate URL using client reference number */
  var url = "https://login.caseblocks.com/case_blocks/search" +
    "?query=client_reference:" + reference + "&auth_token=bDm1bzuz38bpauzzZ_-z";

  /* Create request to get JSON from Caseblocks api */
  request({
    url: url,
    json: true
    }, (error, response, body) => {

      /* If no error and JSON response is not empty */
      if (!error && response.statusCode === 200 && body.length > 0) {

        /* Checks if specific case was requested */
        if (enquiryNo != null) {
          /* Get specific case data then render page */
          var info = {};
          for (var key in body[0].cases[enquiryNo]) {
            /* replace null with blank for nicer formatting */
            if (body[0].cases[enquiryNo][key] == null) {
              info[key] = "";
            } else {
              info[key] = body[0].cases[enquiryNo][key];
            }
          }
          var data = {client: reference};
          data.info = info;
          //var data = {enquiry: body[0].cases[enquiryNo]};
          res.render('enquiry', data);

        /* If not then send index page of Client */
        } else {
          /* Parse through JSON to get required data */
          var data = {name : "Welcome back, " + body[1].cases[0].client_name,
            client: reference};
          var cases = [];
          /* For each case generate key-value pairs then add to cases array */
          for (var i = 0; i < body[0].cases.length; i++) {
            cases.push({date: body[0].cases[i].created_at,
              source : body[0].cases[i].enquiry_source,
              message : body[0].cases[i].message})
          }
          /* Add cases array to data object with key 'cases' */
          data.cases = cases;
          res.render('index', data);
        }

      /* If could not get through to Caseblocks API or response is empty */
      } else {
        /* Render search page with an error message */
        res.render('search', {failedSearch : "We could not retrieve " +
        "information on this client"})
      }
    })
})

/*
 * Listen on port 4200
 */
app.listen(4200, () => {
  console.log("Server is listening on port 4200");
})
