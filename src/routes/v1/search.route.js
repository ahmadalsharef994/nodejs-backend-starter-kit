import express from 'express';
import validate from '../../middlewares/validate.js';
import * as searchValidation from '../../validations/search.validation.js';
import * as searchController from '../../controllers/search.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/users')
  .get(auth(), validate(searchValidation.searchUsers), searchController.searchUsers);

router
  .route('/events')
  .get(auth(), validate(searchValidation.searchEvents), searchController.searchEvents);

router
  .route('/global')
  .get(auth(), validate(searchValidation.globalSearch), searchController.globalSearch);

router
  .route('/suggestions')
  .get(auth(), validate(searchValidation.getSearchSuggestions), searchController.getSearchSuggestions);

export default router;
