/* For assignment-4
let sets = []; */
require('dotenv').config();
const Sequelize = require("sequelize");
const setData = require("../data/setData");
const themeData = require("../data/themeData");


let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres', // Specify the dialect (postgres in this case)
  port: 5432,
  dialectOptions: {
    ssl: {rejectUnauthorized: false, },
  }
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    })

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING
},
{
  timestamps: false // disable createdAt and updatedAt fields
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING
},
{
  timestamps: false // disable createdAt and updatedAt fields
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

sequelize.sync()
.then(() => {
  console.log('Database created successfully.');
})
.catch(error => {
  console.error('Failed to create database:', error);
});

// function initialize() {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await sequelize.sync();
//       /*** check for default themes in the DB ***/
//       // get all of the themes from the database
//       const existingThemes = await Theme.findAll();
//       // if the themes length is === 0, then the DB doesn't have any data.
//         // loop through the themeData from the JSON file
//           // insert each them individually.
//       if (existingThemes === 0) {
//         for (const theme of themeData) await Theme.create({ name: theme.name });
//         console.log('Themes from the JSON file have been inserted into the database.');
//       } else {
//         console.log('Database already contains themes. No need to insert default themes from the JSON file.');
//       }
//       /*** check for default sets in the DB ***/
//       // same as above, but with sets.
//       for (const set of setData) 
//         await Set.findOrCreate({
//           where: { set_num: set.set_num },
//           defaults: { ...set }
//         });
//       console.log('LEGO sets from the JSON file have been inserted into the database.');
//       resolve();
//     } catch (err) {
//       console.error('Failed to import LEGO sets:', err);
//       reject("Error message" + err.message);
//     }
//   });
// }

// Create and insert all the data from the theme json into the database
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
    .then(() => {
      console.log("Initialization successful");
      resolve();
    })
    .catch((error) => {
      console.log("Initialization failed: " + error);
      reject(error);
    });
  });
}

// Function of getAllSets
function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme]
    })
    .then(sets => {
      resolve(sets);
    })
    .catch(error => {
      console.log("Error finding all sets: ", error); // Log an error message
      reject("Failed to retrieve all sets.") // Reject with an error message
    });
  });
}

// async function getAllSets() {
//   try {
//     const sets = await Set.findAll({ include: [Theme] });
//     return sets;
//   } catch (error) {
//     console.error("Get the error: ", error);
//     throw error;
//   }
// }

// Function of getSetByNum
function getSetByNum(setNum) {
  // try {
  //   const set = await Set.findOne({
  //     where: {set_num: setNum},
  //     include: [Theme],
  //   });
  //   if (set) {
  //     return set;
  //   } else {
  //     throw `Unable to find the set number: ${setNum}`;
  //   }
  // } catch (error) {
  //   console.error('You got an error by set number: ', error);
  // }
  return new Promise((resolve, reject) => {
    // let findSet = sets.find(findItem => findItem.set_num === setNum)
    // if (findSet) {
    //   resolve(findSet);
    // } else {
    //   reject("Sorry, we are unable to find requested set data.");
    // }
    Set.findOne({
      where: { set_num: setNum },
      include: [{
        model: Theme,
        attributes: ['id', 'name']
      }]
    })
    .then(set => {
      if (set) {
        console.log(`Found Set: ${set.name}`);
        resolve(set.get({ plain: true }));
      } else {
        reject(new Error(`Did NOT found the Set number: ${setNum}`));
      }
    })
    .catch(error => {
      console.error(`Error finding SET number: ${setNum}, `, error);
      reject(error);
    });
  });
}

// Function getSetsByTheme
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [{
        model: Theme,
        where: {
          name: {
            [Sequelize.Op.iLike]: `%${theme}%`
          }
        }
      }]
    })
    .then(sets => {

      if (sets && sets.length > 0) {
        resolve(sets);
      } else {
        // reject(`No sets found for theme ${theme}.`);
        reject("Sorry, we are unable to find requested set data.");
      }
    })
    .catch(error => {
      console.log("Error finding sets by theme: ", error);
      reject("Failed to retrieve sets by theme.");
    });
  });
}

async function addSet (setData) {
  try {
    console.log(setData);
    await Set.create(setData);
  } catch (error) {
    throw error.errors[0].message;
  }
}

const getAllThemes = async () =>{
  try {
    const themes = await Theme.findAll();
    return themes;
  } catch (error) {
    throw error;
  }
}

const editSet = async (setNum, setData) => {
  try {
    await Set.update(setData, { where: { set_num: setNum } });
  } catch (err) {
    throw err.errors[0].message;
  }
};


//remove (delete)
const deleteSet = async (setNum) =>{
  try {
    await Set.destroy({where: {set_num: setNum}});
  } catch (error) {
    throw error.errors[0].message; 
  }
}

// Using PROMISE to pack function as an object
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
  Theme,
  Set
};