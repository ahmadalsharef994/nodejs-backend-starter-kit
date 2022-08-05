const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Product = require('./product.model');

const PackageSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default() {
        return this.products.reduce((product) => product.price, 0);
      },
    },
  },
  {
    timestamps: true,
  }
);

PackageSchema.plugin(toJSON);
PackageSchema.plugin(paginate);

// create Package model
const Package = mongoose.model('Package', PackageSchema);
// export Package model
module.exports = Package;
