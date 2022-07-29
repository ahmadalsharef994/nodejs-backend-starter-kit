const express = require('express');
const authAdmin = require('../../middlewares/authAdmin');

const validate = require('../../middlewares/validate');
const { eventValidation } = require('../../validations');
const { eventController } = require('../../controllers');

// route to create event
const router = express.Router();
router.route('/event').post(authAdmin(), validate(eventValidation.createEvent), eventController.createEvent);

// route to update event
router.route('/event').patch(authAdmin(), validate(eventValidation.updateEvent), eventController.updateEvent);

// route to delete event
router.route('/event').delete(authAdmin(), validate(eventValidation.deleteEvent), eventController.deleteEvent);

// route to get all events
router.route('/').get(validate(eventValidation.getAllEvents), eventController.getAllEvents);

// route to get event by id
router.route('/id').get(validate(eventValidation.getEventById), eventController.getEventById);

// route to get events by title
router.route('/title').get(validate(eventValidation.getEventsByTitle), eventController.getEventsByTitle);

// export
module.exports = router;
