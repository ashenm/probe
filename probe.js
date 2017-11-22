/**
 * ProbeJS
 * A SQLite Search Engine API Wrapper
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const https = require('https');
const sqlite = require('sqlite3');

const endpoint = `https://www.googleapis.com/customsearch/v1`;

// properties object for
// default query string
const cParameters = {

  // custom search engine ID
  cx: {
    enumerable: true,
    value: process.env.SEID,
    writable: true
  },

  // API key
  key: {
    enumerable: true,
    value: process.env.APIKEY,
    writable: true
  },

  // constrict returning data fields
  fields: {
    configurable: true,
    enumerable: true,
    value: 'items(title,link,image/contextLink)',
    writable: true
  },

  // index of the first
  // result to return
  start: {
    configurable: true,
    enumerable: true,
    value: 1,
    writable: true
  },

  // number of search
  // results to return
  num: {
    configurable: true,
    enumerable: true,
    value: 10,
    writable: true
  }

};

class Probe {

  constructor(database) {
    Probe.initialise(this, database);
  }

  /**
   * Execute callback with an array of recent
   * search queries union with specified type
   */
  recent(type, limit, callback) {
    this.__db__.all(`SELECT query, timestamp FROM history WHERE type=? ORDER BY id DESC LIMIT ?`, [type, limit], callback);
  }

  /**
   * Populates history and execute callback with an array
   * of JSON objects each object corresponding to a search hit
   */
  search(type, query, pagination, callback) {

    // query parameters
    const parameters = Object.create(null, cParameters);

    // add search expression
    parameters.q = encodeURIComponent(query);

    // override starting index
    parameters.start = pagination * parameters.num - parameters.num + 1;

    // add query type
    // if searching images
    if (type === 'images')
      parameters.searchType = 'image';

    https.get(endpoint + Probe.encodeQuery(parameters), function(response) {

      if (response.statusCode !== 200) {
        response.resume();
        callback(new Error());
        return;
      }

      let raw = '';

      response.setEncoding('utf8');

      response.on('data', function(chunk) {
        raw += chunk;
      });

      response.on('end', function() {
        try {
          callback(null, JSON.parse(raw).items);
        } catch(e) {
          callback(new Error());
        }
      });

      response.on('error', callback);

    });

    // populate history
    this.__db__.run(`INSERT INTO history (type, query) VALUES (?, ?)`, [type, query], function(error) {
      if (error)
        console.error(error.message);
    });

  }

  /**
   * Initialise SQLite database
   */
  static initialise(probe, database) {
    probe.__db__ = new sqlite.cached.Database(database, function(error) {
      if (error)
        new Error(`${database} initiation failed!`);
      this.run(`CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, type TEXT NOT NULL, query TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    });
  }

  /**
   * Returns a query string
   * constructed from an object
   */
  static encodeQuery(queryObject) {
    return Object.keys(queryObject).reduce(function(accumulator, key) {
      return `${accumulator}${key}=${queryObject[key]}&`;
    }, '?');
  }

}

module.exports = Probe;
