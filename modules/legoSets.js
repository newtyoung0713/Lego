const mongoose = require('mongoose');
// Use constructor to get Schema Functions
let Schema = mongoose.Schema;

const setData = require("../data/setData");
const themeData = require("../data/themeData");

const themeSchema = new Schema({
  id: { type: Number, unique: true, require: true},
  name: { type: String, unique: true, }
});

const setSchema = new Schema({
  set_num: { type: String, unique: true, },
  name: String,
  year: Number,
  theme_id: Number,
  num_parts: Number,
  img_url: String,
  theme: { type: Schema.Types.ObjectId, ref: 'Theme' }
});

const Theme = mongoose.model('Theme', themeSchema);
const Set = mongoose.model('Set', setSchema);

function initialize() {
  Theme.countDocuments()
  .then(count => {
    if (count === 0) {
      console.log('Themes inserted successfully.');
      return Theme.insertMany(themeData);
    } else {
      console.log('Themes already exist.');
    }
    return Theme.find();
  })
  .then(themes => {
    const themeMap = themes.reduce((map, theme) => {
      map[theme.id] = theme._id;
      return map;
    }, {});

    const updatedSets = setData.map(set => ({
      ...set,
      theme: themeMap[set.theme_id]
    }));
    Set.countDocuments()
    .then(count => {
      if (count === 0) {
        console.log('Sets inserted successfully.');
        return Set.insertMany(updatedSets);
      } else {
        console.log('Sets already exist.');
      }
    })
  })
  .catch(error => {
    console.error('Failed to insert data:', error);
  });
}

// Function of getAllThemes
function getAllThemes() {
  return Theme.find()
  .then(themes => {
    return themes;
  })
  .catch(error => {
    console.error('Error fetching themes: ', error);
    throw error;
  })
}

// Function of getSetByNum
function getSetByNum(setNum) {
  return Set.findOne({ set_num: setNum }).populate('theme')
    .then(set => {
      return set;
    })
    .catch(error => {
      console.error(`Error finding set by number ${setNum}:`, error);
      throw error;
    });
}

function editSet(setNum, newData) {
  console.log('(legoSets) Successfully to update set'); // Logging for debugging
  return Set.findOneAndUpdate({ set_num: setNum }, newData, { new: true }).populate('theme')
    .then(updatedSet => {
      // Update succeeded
      return updatedSet;
    })
    .catch(error => {
      // Update failed
      console.error(`Error updating set with set_num ${setNum}:`, error);
      throw error;
    });
};

module.exports = {
  initialize,
  getAllThemes,
  getSetByNum,
  editSet,
  Theme, Set
};