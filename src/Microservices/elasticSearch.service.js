const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
require('dotenv').config();
const ApiError = require('../utils/ApiError');

const client = new Client({
  node: process.env.ELASTIC_URL,
});

const createMedicinesIndex = async (index) => {
  const exists = await client.exists({ index, id: 1 });
  if (exists.body) {
    throw new ApiError(400, `index with name ${index} already exists`);
  }
  const result = await client.index({
    index,
    id: 1,
    body: {
      mappings: {
        dynamic: 'strict',
        properties: {
          generic: { type: 'text' },
          brand: { type: 'text' },
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
  const exists = await client.exists({ index, id: 1 });
  if (exists.body) {
    throw new ApiError(400, `index with name ${index} already exists`);
  }
  const result = await client.index({
    index,
    id: 1,
    body: {
      mappings: {
        dynamic: 'strict',
        properties: {
          name: { type: 'text' },
          specializations: { type: 'text' },
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
  const exists = await client.exists({ index, id: 1 });
  if (!exists.body) {
    throw new ApiError(400, 'Index doesnt exist');
  }
  const response = await client.delete({ index, id: 1 });
  return response;
};

const createDocument = async (index, document) => {
  const exists = await client.exists({ index, id: 1 });
  if (!exists.body) {
    throw new ApiError(400, 'Index doeesnt exist');
  }
  const body = JSON.parse(document);
  const response = await client.index({
    index,
    id: body.brand,
    body, // previously, having body: {documentJson} caused an error in searching
  });
  return response; // object having _index, _id, result, etc..
};

const searchDocument = async (index, keyword, value) => {
  const exists = await client.exists({ index, id: 1 });
  if (!exists.body) {
    throw new ApiError(400, 'Index doesnt exist');
  }
  const result = await client.search({
    index,
    body: {
      size: 20,
      query: {
        regexp: {
          [keyword]: {
            value: `.*${value}.*`,
            case_insensitive: true,
          },
        },
      },
    },
  });
  return result.body.hits.hits;
};

const indexJsonDataset = async (index, datasetPath) => {
  // const datasetPath = path.join(__dirname, "medz.json")
  const datasource = JSON.parse(fs.readFileSync(datasetPath));
  // let array = JSON.parse(jstring);
  const result = [];
  datasource.forEach(async (document) => {
    const temp = await createDocument(index, JSON.stringify(document));
    result.push(temp);
  });
  return result;
};

const getClientInfo = async () => {
  const response = await client.info();
  return response;
};

const countDocumentsInIndex = async (index) => {
  const count = await client.count({ index });
  return count.body.count;
};

module.exports = {
  createDocument,
  searchDocument,
  createMedicinesIndex,
  createDoctorsIndex,
  deleteIndex,
  indexJsonDataset,
  getClientInfo,
  countDocumentsInIndex,
};
