// const httpStatus = require('http-status');
// const axios = require('axios');
// const ApiError = require('../utils/ApiError');
const Item = require('../models/item.model');

// getting Items from ZOHO inventory:
const getItems = async () => {
  // const zohoToken = await axios
  //   .post(
  //     `https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}`
  //   )
  //   .then((response) => {
  //     return response.data.access_token;
  //   })
  //   .catch((err) => {
  //     return err;
  //   });

  // const products = await axios({
  //   method: 'get',
  //   url: `https://inventory.zoho.in/api/v1/items?organization_id=${process.env.ORGANIZATION_ID}`,
  //   headers: { Authorization: `Zoho-oauthtoken ${zohoToken}` },
  // })
  //   .then((response) => {
  //     // console.log(response.data);
  //     return response.data.items;
  //   })
  //   .catch((err) => {
  //     // console.log(err);
  //     return err;
  //   });
  // if (!products) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Products not found');
  // }
  // //   console.log(items);

  // products.forEach(async (zohoItem) => {
  //   await Item.create({
  //     item_id: zohoItem.item_id,
  //     sku: zohoItem.sku,
  //     category_name: zohoItem.category_name,
  //     cf_mrp: zohoItem.cf_mrp,
  //     cf_therapeutic_class: zohoItem.cf_therapeutic_class,
  //     cf_action_class: zohoItem.cf_action_class,
  //     cf_salt: zohoItem.cf_salt,
  //     cf_side_effects: zohoItem.cf_side_effects,
  //     cf_habit_forming: zohoItem.cf_habit_forming,
  //     cf_prescription: zohoItem.cf_prescription,
  //     cf_type_of_sell: zohoItem.cf_type_of_sell,
  //     image: zohoItem.image,
  //     unit: zohoItem.unit,
  //     stock_on_hand: zohoItem.stock_on_hand,
  //     manufacturer: zohoItem.manufacturer,
  //     brand: zohoItem.brand,
  //     name: zohoItem.name,
  //     description: zohoItem.description,
  //   });
  // });

  const items = Item.find();

  return items;
};

// get Item By item_id from zoho inventory
const getItemBySKU = async (sku) => {
  const item = Item.findOne({ sku });
  return item;
};

const addItemReview = async (sku, reviewBody) => {
  const item = await Item.findOne({ sku });
  if (!item.reviews) {
    item.reviews = [];
  }
  item.reviews.push(reviewBody);
  await item.save();
  return item;
};

const getItemProperty = async (sku, property) => {
  const item = await Item.findOne({ sku });
  return item[property];
};

const syncItems = async (zohoItem) => {
  const dbItem = await Item.findOne({ sku: zohoItem.sku });
  if (!dbItem) {
    const item = await Item.create({
      item_id: zohoItem.item_id,
      sku: zohoItem.sku,
      category_name: zohoItem.category_name,
      cf_mrp: zohoItem.cf_mrp,
      cf_therapeutic_class: zohoItem.cf_therapeutic_class,
      cf_action_class: zohoItem.cf_action_class,
      cf_salt: zohoItem.cf_salt,
      cf_side_effects: zohoItem.cf_side_effects,
      cf_habit_forming: zohoItem.cf_habit_forming,
      cf_prescription: zohoItem.cf_prescription,
      cf_type_of_sell: zohoItem.cf_type_of_sell,
      image: zohoItem.image,
      unit: zohoItem.unit,
      stock_on_hand: zohoItem.stock_on_hand,
      manufacturer: zohoItem.manufacturer,
      brand: zohoItem.brand,
      name: zohoItem.name,
    });
    return item;
  }
  dbItem.stock_on_hand = zohoItem.stock_on_hand;
  dbItem.cf_mrp = zohoItem.cf_mrp;
  await dbItem.save();
  return dbItem;
};

module.exports = {
  getItems,
  getItemBySKU,
  addItemReview,
  getItemProperty,
  syncItems,
};
