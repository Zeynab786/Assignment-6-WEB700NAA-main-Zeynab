/********************************************************************************
* WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Harmon Tuazon Student ID: 165229220 Date: 07-29-2025
*
* Published URL: https://assignment-3-web-700-naa.vercel.app/
*c
********************************************************************************/
require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');


class legoData {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.PGDATABASE,
      process.env.PGUSER,
      process.env.PGPASSWORD,
      {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: 5432, 
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
      }
    );

  this.Theme = this.sequelize.define('Theme', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true, 
            autoIncrement: true, 
        },
        name: Sequelize.STRING,
    }, { timestamps: false }
  );

  this.Set = this.sequelize.define('Set', {
      set_num: {
              type: Sequelize.STRING,
              primaryKey: true 
            },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING,
    }, { timestamps: false });

  this.Set.belongsTo(this.Theme, { foreignKey: 'theme_id' });
  }

  initialize() {
  return new Promise((resolve, reject) => {
    this.sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to sync with the database: " + err.message);
      });
  });
  }
  

  getAllSets() {
  return new Promise((resolve, reject) => {
    this.Set.findAll({ include: [this.Theme] })
      .then((sets) => {
        resolve(sets);
      })
      .catch((err) => {
        reject("Unable to retrieve sets: " + err.message);
      });
  });
}


  getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
      this.Set.findAll({
        where: { set_num: setNum },
        include: [this.Theme]
      })
      .then((sets) => {
        if (sets.length > 0) {
          resolve(sets[0]);
        } else {
          reject("Unable to find requested set");
        }
      })
      .catch((err) => {
        reject("Error retrieving set: " + err.message);
      });
    });
}



getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    this.Set.findAll({
      include: [this.Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`
        }
      }
    })
    .then((sets) => {
      if (sets.length > 0) {
        resolve(sets);
      } else {
        reject("Unable to find requested sets");
      }
    })
    .catch((err) => {
      reject("Error retrieving sets by theme: " + err.message);
    });
  });
}

  addSet(newSet) {
    return new Promise((resolve, reject) => {
      this.Set.create(newSet)
        .then((createdSet) => {
          resolve(createdSet);  // Resolve with no data on success
        })
        .catch((err) => {
          // Reject with first validation error message if available
          if (err.errors && err.errors.length > 0) {
            reject(err.errors[0].message);
          } else {
            reject(err.message);
          }
        });
    });
  }

  deleteSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    this.Set.destroy({ where: { set_num: setNum } })
      .then((deletedCount) => {
        if (deletedCount === 0) {
          reject(`No set found with set_num '${setNum}' to delete.`);
        } else {
          resolve(); // Successfully deleted
        }
      })
      .catch((err) => {
        if (err.errors && err.errors.length > 0) {
          reject(err.errors[0].message);
        } else {
          reject(err.message);
        }
      });
  });
}

  getAllThemes() {
  return new Promise((resolve, reject) => {
    this.Theme.findAll()
      .then((themes) => {
        resolve(themes);
      })
      .catch((err) => {
        reject("Unable to retrieve themes: " + err.message);
      });
  });
}

}


module.exports = legoData;
