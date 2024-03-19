const setData = require("../data/setData");
const themeData = require("../data/themeData");
let sets = [];

// Function of Initialize
function initialize() {
  return new Promise((resolve, reject) => {
    try {
      sets = setData.map((setItem) => {
        const themeObject = themeData.find(
          (themeItem) => themeItem.id === setItem.theme_id
        );
        let themeName = themeObject ? themeObject.name : "Unknown Theme";
        return {
          ...setItem,
          theme: themeName
        };
      });
      resolve();
    } catch (err) {
      reject("Error message" + err);
    }
  });
}

// Function of getAllSets
function getAllSets() {
  return new Promise((resolve, reject) => {
    if (sets.length > 0) {
      resolve(sets);
    } else {
      reject("Sorry, we are unable to find requested set data.");
    }
  });
}

// Function of getSetByNum
function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    let findSet = sets.find(findItem => findItem.set_num === setNum)
    if (findSet) {
      resolve(findSet);
    } else {
      reject("Sorry, we are unable to find requested set data.");
    }
  });
}

// Function getSetsByTheme
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    // let themeLowerCase = theme.toLowerCase();
    let filterSets = sets.filter((setItem) =>
      // setItem.theme.toLowerCase().includes(themeLowerCase));
      setItem.theme.toLowerCase().includes(theme.toLowerCase()));
    if (filterSets.length > 0) {
      resolve(filterSets);
    } else {
      // reject(`No sets found for theme ${theme}.`);
      reject("Sorry, we are unable to find requested theme data.");
    }
  });
}

// Using PROMISE to pack function as an object
module.exports = { initialize, 
                   getAllSets, 
                   getSetByNum, 
                   getSetsByTheme };