const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Auth = require('../auth.model');
const Product = require('./product.model');
const Package = require('./package.model');

const CartSchema = new mongoose.Schema({
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Auth,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Product,
    },
  ],
  packages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Package,
    },
  ],
  totalCart: {
    type: Number,
    default() {
      return this.products.reduce((product) => product.price, 0) + this.packages.reduce((onePackage) => onePackage.price, 0); // package is reserved keyword
    },
  },
});

CartSchema.plugin(toJSON);
CartSchema.plugin(paginate);

// create product model
const Cart = mongoose.model('Cart', CartSchema);
// export product model
module.exports = Cart;
