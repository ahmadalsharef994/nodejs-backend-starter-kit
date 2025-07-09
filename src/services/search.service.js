import { Client } from '@elastic/elasticsearch';
import config from '../config/config.js';
import logger from '../config/appLogger.js';

class SearchService {
  constructor() {
    this.client = null;
    this.isMockMode = false;
    this.initializeService();
  }

  initializeService() {
    try {
      // Check if Elasticsearch configuration is provided
      if (!config.elasticsearch?.url || !config.elasticsearch?.username || !config.elasticsearch?.password) {
        logger.warn('Elasticsearch configuration not provided. Using mock search service.');
        this.isMockMode = true;
        return;
      }

      this.client = new Client({
        node: config.elasticsearch.url,
        auth: {
          username: config.elasticsearch.username,
          password: config.elasticsearch.password,
        },
      });

      logger.info('Search service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize search service, falling back to mock mode:', error);
      this.isMockMode = true;
    }
  }

  async indexDocument(index, id, document) {
    try {
      if (this.isMockMode) {
        logger.info('Mock document indexed:', { index, id, document });
        return {
          success: true,
          _id: id,
          _index: index,
          result: 'created',
        };
      }

      const response = await this.client.index({
        index,
        id,
        body: document,
      });

      logger.info('Document indexed successfully:', { index, id });
      return response.body;
    } catch (error) {
      logger.error('Failed to index document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async searchUsers(query, options = {}) {
    try {
      if (this.isMockMode) {
        logger.info('Mock user search:', { query, options });
        return {
          hits: {
            total: { value: 0 },
            hits: [],
          },
        };
      }

      const searchParams = {
        index: 'users',
        body: {
          query: {
            multi_match: {
              query: query.q,
              fields: ['name', 'email', 'role'],
            },
          },
          from: (options.page - 1) * options.limit || 0,
          size: options.limit || 10,
        },
      };

      if (query.role) {
        searchParams.body.query = {
          bool: {
            must: [searchParams.body.query],
            filter: [{ term: { role: query.role } }],
          },
        };
      }

      const response = await this.client.search(searchParams);
      logger.info('User search completed:', { query, total: response.body.hits.total.value });
      return response.body;
    } catch (error) {
      logger.error('Failed to search users:', error);
      return {
        hits: {
          total: { value: 0 },
          hits: [],
        },
      };
    }
  }

  async searchEvents(query, options = {}) {
    try {
      if (this.isMockMode) {
        logger.info('Mock event search:', { query, options });
        return {
          hits: {
            total: { value: 0 },
            hits: [],
          },
        };
      }

      const searchParams = {
        index: 'events',
        body: {
          query: {
            multi_match: {
              query: query.q,
              fields: ['title', 'description', 'category'],
            },
          },
          from: (options.page - 1) * options.limit || 0,
          size: options.limit || 10,
        },
      };

      if (query.category) {
        searchParams.body.query = {
          bool: {
            must: [searchParams.body.query],
            filter: [{ term: { category: query.category } }],
          },
        };
      }

      if (query.date) {
        searchParams.body.query = {
          bool: {
            must: [searchParams.body.query],
            filter: [
              { range: { date: { gte: query.date } } },
              ...(query.category ? [{ term: { category: query.category } }] : []),
            ],
          },
        };
      }

      const response = await this.client.search(searchParams);
      logger.info('Event search completed:', { query, total: response.body.hits.total.value });
      return response.body;
    } catch (error) {
      logger.error('Failed to search events:', error);
      return {
        hits: {
          total: { value: 0 },
          hits: [],
        },
      };
    }
  }

  async globalSearch(query, options = {}) {
    try {
      if (this.isMockMode) {
        logger.info('Mock global search:', { query, options });
        return {
          users: { hits: { total: { value: 0 }, hits: [] } },
          events: { hits: { total: { value: 0 }, hits: [] } },
        };
      }

      const [usersResult, eventsResult] = await Promise.all([
        this.searchUsers(query, options),
        this.searchEvents(query, options),
      ]);

      logger.info('Global search completed:', { query });
      return {
        users: usersResult,
        events: eventsResult,
      };
    } catch (error) {
      logger.error('Failed to perform global search:', error);
      return {
        users: { hits: { total: { value: 0 }, hits: [] } },
        events: { hits: { total: { value: 0 }, hits: [] } },
      };
    }
  }

  async getSearchSuggestions(query) {
    try {
      if (this.isMockMode) {
        logger.info('Mock search suggestions:', { query });
        return {
          suggestions: [],
        };
      }

      const searchParams = {
        index: query.type === 'users' ? 'users' : query.type === 'events' ? 'events' : 'users,events',
        body: {
          suggest: {
            text: query.q,
            simple_phrase: {
              phrase: {
                field: query.type === 'users' ? 'name' : 'title',
                size: 5,
              },
            },
          },
        },
      };

      const response = await this.client.search(searchParams);
      logger.info('Search suggestions completed:', { query });
      return response.body.suggest;
    } catch (error) {
      logger.error('Failed to get search suggestions:', error);
      return {
        suggestions: [],
      };
    }
  }
}

export const searchService = new SearchService();
export default searchService;
