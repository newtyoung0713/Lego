/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Sheng-Lin Yang Student ID: 160443222 Date: Mar 19th, 2024
*
*  Published URL: https://dull-lime-betta-hose.cyclic.app/
*
********************************************************************************/


const express = require('express'); // "require" the Express module
const path = require('path');
const app = express(); // obtain the "app" object
const legoData = require('./modules/legoSets');

app.use(express.static(path.join(__dirname, '/public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

legoData.initialize().then(() => {});

// Add your routes here
// e.g. app.get() { ... }
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about', {page: '/about'});
});

app.get('/lego/sets', (req, res) => {
  const themes = req.query.theme;
  legoData.getAllSets()
          .then(sets => {
            if (themes) {
              sets = sets.filter(set => set.theme === themes);
              if (!sets.length) {
                res.status(404).render("404", { message: `No sets found for theme: ${themes}` });
                return;
              }
            }
            res.render("sets", {sets: sets, theme: themes});
          })
          .catch(error => {
            res.status(404).send({ error: 'Internal Server Error', message: error.message });
            res.status(500).render("404", { message: "404." });
          });
});

app.get('/lego/sets/:set_num', (req, res) => {
  const numOfLego = req.params.set_num;
  legoData.getSetByNum(numOfLego)
          .then(set => {
            if (set) {
              res.render("setDetail", {set: set})
            } else {
              res.status(404).render('404', { message: `Unable to find requested sets.` });
            }
          })
          .catch(error => res.status(404).render('404', { message: `Unable to find requested sets.` }));
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Something broke!")
});

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
// and assign a port
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
// Initialize the lego set data first
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
});