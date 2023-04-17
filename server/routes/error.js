// External imports
const express = require('express');
const router = express.Router();

// Internal imports
const { resError } = require('../controllers/error.js');

router.all('*', resError);

module.exports = router;