const express = require('express');
const pusherController = require('../../controllers/pusher.controller.js');

const router = express.Router();

router.route('/auth').post(pusherController.pusherAuthenticate);

module.exports = router;
