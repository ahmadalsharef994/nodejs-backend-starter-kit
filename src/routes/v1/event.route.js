import express from 'express';
import { auth } from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as eventValidation from '../../validations/event.validation.js';
import * as eventController from '../../controllers/event.controller.js';

// route to create event
const router = express.Router();
router.route('/').post(auth(), validate(eventValidation.createEvent), eventController.createEvent);

// route to update event
router.route('/:eventId').patch(auth(), validate(eventValidation.updateEvent), eventController.updateEvent);

// route to delete event
router.route('/:eventId').delete(auth(), validate(eventValidation.deleteEvent), eventController.deleteEvent);

// route to get all events
router.route('/').get(validate(eventValidation.getAllEvents), eventController.getAllEvents);

// route to get event by id
router.route('/:eventId').get(validate(eventValidation.getEventById), eventController.getEventById);

// route to get events by title
router.route('/search').get(validate(eventValidation.getEventsByTitle), eventController.getEventsByTitle);

export default router;
