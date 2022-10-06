const mongoose = require('mongoose');
const Item = require('./item.model');
const { toJSON, paginate } = require('./plugins');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // array of items
    items: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: Item,
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
      this.items.reduce((acc, item) => {
        return acc + item.price;
      }, 0) || 0;
    return total;
  } catch (err) {
    return 0;
  }
});

cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

module.exports = mongoose.model('Cart', cartSchema);
