/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Sheng-Lin Yang Student ID: 160443222 Date: Apr 19th, 2024
*
* GitHub Repository URL: https://github.com/newtyoung0713/Lego
* Deployed Application URL: https://dull-lime-betta-hose.cyclic.app/
*
********************************************************************************/
const express = require('express'); // "require" the Express module
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: ".env" });
const app = express(); // obtain the "app" object
const path = require('path');
const legoData = require('./modules/legoSets');

const { Theme, Set } = require('./modules/legoSets');

app.use(express.static(path.join(__dirname, '/public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true })); //application will be using urlencoded form data

let warningMsg = "I'm sorry, we're unable to find what you're looking for";
let unableSets = "Unable to find requested sets.";
let errorEncountered = "I'm sorry, but we have encountered the following error: ";

// Add your routes here
// e.g. app.get() { ... }
app.get('/', (req, res) => {
  res.render('home', { page: '/' });
});

app.get('/about', (req, res) => {
  res.render('about', { page: '/about' });
});

app.get('/lego/sets', (req, res) => {
  let query = {};
  const { theme } = req.query;

  if (theme) {
    Theme.findOne({ name: theme })
    .then((themeDoc) => {
      if (themeDoc) {
        query.theme = themeDoc._id;
        Set.find(query).populate('theme')
        .then((sets) => {
          res.render("sets", { sets, theme: theme || null });
        })
        .catch((err) => {
          console.error('Error fetching sets:', err);
          res.status(500).render('404', { message: warningMsg });
        });
      } else {
        res.status(404).render('404', { message: warningMsg });
      }
    })
    .catch((err) => {
      console.error('Error fetching theme:', err);
      res.status(500).render('404', { message: warningMsg });
    });
  } else {
    Set.find(query).populate('theme')
    .then((sets) => {
      res.render("sets", { sets, theme: null });
    })
    .catch((err) => {
      console.error('Error fetching sets:', err);
      res.status(500).render('404', { message: warningMsg });
    });
  }
});

app.get('/lego/sets/:set_num', (req, res) => {
  const numOfLego = req.params.set_num;
  legoData.getSetByNum(numOfLego)
  .then((set) => {
    if (!set) res.status(404).render('404', { message: unableSets });
    res.render('setDetail', { set });
  })
  .catch (err => {
    console.error('Error fetching set:', err);
    res.status(404).render('404', { message: unableSets });
  });
});

app.get('/lego/addSet', (req, res) => {
  Theme.find()
  .then((themes) => {
    res.render('addSet', { themes });
  })
  .catch (error => {
    console.error('Error adding set:', err);
    res.render('500', { message: `Error: ${error.message}` });
  });
});

app.post('/lego/addSet', (req, res) => {
  const { name, year, num_parts, img_url, theme_id, set_num } = req.body;
  Theme.findOne({ id: parseInt(theme_id) })
  .then((theme) => {
    if (!theme) return res.status(404).send('Theme can NOT be found');
    const newSet = new Set({ name, year, num_parts, img_url, theme: theme._id, set_num });
    newSet.save()
    .then(setSaved => {
      console.log(`(server) Created a set document for: ${setSaved.name}`);
      res.redirect('sets');
    })
    .catch(error => {
      console.log('Could NOT create a set document for: ' + name + '\n' + error);
      res.redirect('sets');
    });
  })
  .catch (err => {
    console.error('Error adding set:', err);
    res.render('500', { message: `${errorEncountered} ${err}` });
  });
});

app.get('/lego/editSet/:set_num',  (req, res) => {
  legoData.getSetByNum(req.params.set_num)
  .then((set) => {
    return legoData.getAllThemes()
    .then((themes) => {
      res.render('editSet', { themes, set });
    });
  })
  .catch (err => {
    res.status(404).render('404', { message: err });
  });
});

app.post('/lego/editSet',  (req, res) => {
  const { name, year, num_parts, theme_id, set_num } = req.body;
  Theme.findOne({ id: theme_id })
  .then((theme) => {
    if (!theme) return res.status(500).send('Theme did NOT found');
    legoData.editSet(set_num, { name, year, num_parts, theme: theme._id })
    .then(() => {
      console.log('(server) Updated successful');
      res.redirect("/lego/sets");
    })
    .catch (err => {
      res.status(500).render("500", {
        message: `${errorEncountered} ${err}`,
      });
    });
  })
  .catch (err => {
    res.status(500).render("500", {
      message: `${errorEncountered} ${err}`,
    });
  });
});

app.get('/lego/deleteSet/:set_num', (req, res) => {
  const setNum = req.params.set_num;
  Set.findOneAndDelete({ set_num: setNum })
  .then(() => {
    console.log('(server) Deleted successful');
    res.redirect('/lego/sets');
  })
  .catch (err => {
    res.render('500', { message: `${errorEncountered} ${err}` });
  });
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
  res.status(404).render('404', {message: warningMsg});
});

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
// Connect MongoDB Atlas
mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(() => { 
  legoData.initialize();
  console.log('Connected to MongoDB');
  app.listen(HTTP_PORT, onHttpStart);
})
.catch((err) => {
  console.error('Failed to connect to MongoDB: ' + err);
});