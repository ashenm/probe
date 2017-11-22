/**
 * Probe
 * A Search Engine API
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const compression = require('compression');
const express = require('express');
const router = require('./router');
const app = express();

app.use(compression());
app.use(express.static('public'));
app.use(router);

app.listen(process.env.PORT || 8080);
