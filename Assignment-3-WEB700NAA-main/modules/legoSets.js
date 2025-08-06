/********************************************************************************
* WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Zeinab Mohamed Student ID: 123970246 Date: 08-05-2025
*
* Published URL: https://assignment-3-web-700-naa.vercel.app/
*c
********************************************************************************/
require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

class LegoData {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.PGDATABASE,
      process.env.PGUSER,
      process.env.PGPASSWORD,
      {
        host: process.env.PGHOST,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );

    this.Theme = this.sequelize.define('Theme', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: Sequelize.STRING
    }, { timestamps: false });

    this.Set = this.sequelize.define('Set', {
      set_num: { type: Sequelize.STRING, primaryKey: true },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING
    }, { timestamps: false });

    this.Set.belongsTo(this.Theme, { foreignKey: 'theme_id' });
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.sequelize.sync()
        .then(() => resolve())
        .catch(err => reject("Unable to sync database"));
    });
  }

  getAllSets() {
    return this.Set.findAll({ include: [this.Theme] });
  }

  getSetByNum(setNum) {
    return this.Set.findAll({
      where: { set_num: setNum },
      include: [this.Theme]
    }).then(data => {
      if (data.length > 0) return data[0];
      else throw "Unable to find requested set";
    });
  }

  getSetsByTheme(theme) {
    return this.Set.findAll({
      include: [this.Theme],
      where: {
        '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`
        }
      }
    }).then(data => {
      if (data.length > 0) return data;
      else throw "Unable to find requested sets";
    });
  }

  addSet(setData) {
    return this.Set.create(setData)
      .catch(err => {
        throw err.errors[0].message;
      });
  }

  getAllThemes() {
    return this.Theme.findAll();
  }

  deleteSetByNum(setNum) {
    return this.Set.destroy({ where: { set_num: setNum } })
      .then(rows => {
        if (rows === 0) throw "Set not found";
      })
      .catch(err => {
        throw err.errors ? err.errors[0].message : err;
      });
  }
}

module.exports = new LegoData();
