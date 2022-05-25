const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const split = require('split2');
require('dotenv').config();
const ApiError = require('../utils/ApiError');

const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const createMedicinesIndex = async (index) => {
  const exists = await client.indices.exists({ index });
  if (exists) {
    throw new ApiError(400, `index with name ${index} already exists`);
  }
  const result = await client.indices.create({
    index,
    body: {
      mappings: {
        dynamic: 'strict',
        properties: {
          generic: { type: 'keyword' },
          brand: { type: 'keyword' },
          packing: { type: 'text', index: false }, // not available for querying
          price: { type: 'text' },
          company: { type: 'text' },
        },
      },
    },
  });
  return result;
};

const createDoctorsIndex = async (index) => {
  const exists = await client.indices.exists({ index });
  if (exists) {
    throw new ApiError(400, `index with name ${index} already exists`);
  }
  const result = await client.indices.create({
    index,
    body: {
      mappings: {
        dynamic: 'strict',
        properties: {
          name: { type: 'keyword' },
          specializations: { type: 'keyword' },
          doctorClinicAddress: { type: 'text' },
          appointmentPrice: { type: 'integer' },
          Experience: { type: 'integer' },
        },
      },
    },
  });
  return result;
};

const deleteIndex = async (index) => {
  const exists = await client.indices.exists({ index });
  if (!exists) {
    throw new ApiError(400, 'Index doesnt exist');
  }
  const response = await client.indices.delete({ index });
  return response;
};

const createDocument = async (index, document) => {
  const exists = await client.indices.exists({ index });
  if (!exists) {
    throw new ApiError(400, 'Index doeesnt exist');
  }
  const documentJson = JSON.parse(document);
  const response = await client.index({
    index,
    document: documentJson,
  });
  return response; // object having _index, _id, result, etc..
};

const searchDocument = async (index, keyword, value) => {
  const exists = await client.indices.exists({ index });
  if (!exists) {
    throw new ApiError(400, 'Index doesnt exist');
  }
  const result = await client.search({
    index,
    query: {
      wildcard: {
        [keyword]: {
          value: `*${value}*`,
          case_insensitive: true,
        },
      },
    },
  });
  return result.hits.hits;
};

const indexJsonDataset = async (index, datasetPath) => {
  // const datasetPath = path.join(__dirname, "medz.json")
  const datasource = fs.createReadStream(datasetPath).pipe(split());
  const result = await client.helpers.bulk({
    datasource,
    onDocument() {
      return {
        index: { _index: index },
      };
    },
    onDrop() {
      // eslint-disable-next-line no-console
      console.log(`can't index document`);
    },
    refreshOnCompletion: index,
  });
  return result;
};

const getJsonFile = (filepath) => {
  const response = fs.readFileSync(filepath);
  const json = response
    .toString()
    .split('\n')
    .map((s) => JSON.parse(s));
  return json;
};

const getClientInfo = async () => {
  const response = await client.info();
  return response;
};

module.exports = {
  createDocument,
  searchDocument,
  createMedicinesIndex,
  createDoctorsIndex,
  deleteIndex,
  indexJsonDataset,
  getJsonFile,
  getClientInfo,
};
