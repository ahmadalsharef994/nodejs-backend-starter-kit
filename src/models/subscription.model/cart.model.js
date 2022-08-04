const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Auth = require('../auth.model');
const Product = require('./product.model');

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
  totalCart: {
    type: Number,
    default() {
      return this.products.reduce((product) => product.price, 0);
    },
  },
});

CartSchema.plugin(toJSON);
CartSchema.plugin(paginate);

// create product model
const Cart = mongoose.model('Cart', CartSchema);
// export product model
module.exports = Cart;
