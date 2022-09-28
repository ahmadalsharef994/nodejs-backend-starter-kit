const mongoose = require('mongoose');
const Product = require('./product.model');
const { toJSON, paginate } = require('./plugins');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // array of products
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: Product,
      default: [],
    },
    // array of labtests
    // array of healthpackages
  },
  { timestamps: true }
);

cartSchema.virtual('price').get(function () {
  try {
    const total =
      this.products.reduce((product) => product.price, 0) + this.packages.reduce((onePackage) => onePackage.price, 0);
    if (total) {
      return total;
    }
  } catch (err) {
    return 0;
  }
});

cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

module.exports = mongoose.model('Cart', cartSchema);
