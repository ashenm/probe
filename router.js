/**
 * Route Handler
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const express = require('express');
const probe = require('./probe');
const path = require('path');

const router = express.Router();
const app = new probe(path.join(__dirname, '.data', 'main.db'));

router.get('/:type(web|images)', (request, response) => {

  // respond last ten queries
  // if no query string present
  if (!Object.keys(request.query).length) {
    app.recent(request.params.type, 10, (error, hits) => {
      error
        ? response.sendStatus(500)
        : response.json(hits);
    });
    return;
  }

  // ignore if search query not present
  if (!request.query.q) {
    response.status(400).send('Missing requisite parameter: q');
    return;
  }

  // ignore if pagination zero or less
  if (request.query.offset &&
    request.query.offset < 1) {
    response.status(400).send('Invalid offset');
    return;
  }

  app.search(request.params.type, request.query.q, request.query.offset || 1, (error, results) => {
    error
      ? response.sendStatus(500)
      : response.json(results);
  });

});

module.exports = router;
