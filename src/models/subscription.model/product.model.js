const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.plugin(toJSON);
ProductSchema.plugin(paginate);

// create product model
const Product = mongoose.model('Product', ProductSchema);
// export product model
module.exports = Product;
