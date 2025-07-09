import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { searchService } from '../services/search.service.js';
import pick from '../utils/pick.js';

const searchUsers = catchAsync(async (req, res) => {
  const query = pick(req.query, ['q', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await searchService.searchUsers(query, options);
  res.send(result);
});

const searchEvents = catchAsync(async (req, res) => {
  const query = pick(req.query, ['q', 'category', 'date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await searchService.searchEvents(query, options);
  res.send(result);
});

const globalSearch = catchAsync(async (req, res) => {
  const query = pick(req.query, ['q']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await searchService.globalSearch(query, options);
  res.send(result);
});

const getSearchSuggestions = catchAsync(async (req, res) => {
  const query = pick(req.query, ['q', 'type']);
  const result = await searchService.getSearchSuggestions(query);
  res.send(result);
});

export {
  searchUsers,
  searchEvents,
  globalSearch,
  getSearchSuggestions,
};
