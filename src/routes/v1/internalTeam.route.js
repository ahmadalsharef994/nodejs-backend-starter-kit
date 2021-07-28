const express = require('express');
const validate = require('../../middlewares/validate');
const InternalTeamValidator = require('../../validations/internalTeam.validator');
const InternalTeamController = require('../../controllers/internalTeam.controller');
const authAdmin = require('../../middlewares/authAdmin');

const router = express.Router();

router.route('/verifydoctor').post(authAdmin(), validate(InternalTeamValidator.verifydoctor), InternalTeamController.verifydoctor);
router.post('/restricted/adminsignup', validate(InternalTeamValidator.registeradmin), InternalTeamController.registeradmin);
router.post('/restricted/adminsignin', validate(InternalTeamValidator.loginadmin), InternalTeamController.loginadmin);


module.exports = router;