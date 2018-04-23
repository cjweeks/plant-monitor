const express = require('express');
const router = express.Router();
const data = require('../data.js');

router.get('/current-values', (req, res, next) => {
    data.getCurrentValues(entries => {
        res.json(entries);
    });
});

router.get('/time-last-modified', (req, res, next) => {
    data.getTimeLastModified(entries => {
        res.json(entries);
    });
});

router.get('/all-data', (req, res, next) => {
    data.getAllData(entries => {
        res.json(entries);
    });
});

router.post('/add-values', (req, res) => {
    data.addValues(req.body, status => {
        res.sendStatus(status);
    });
});

module.exports = router;
