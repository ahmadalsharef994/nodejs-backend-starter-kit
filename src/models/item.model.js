const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const itemReviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
      enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    },
    description: {
      type: String,
      default: '',
    },
    isPurchaseVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const itemSchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    category_name: {
      type: String,
    },
    cf_mrp: {
      type: Number,
      required: true,
    },
    cf_therapeutic_class: {
      type: String,
    },
    cf_action_class: {
      type: String,
    },
    cf_salt: {
      type: String,
    },
    cf_side_effects: {
      type: String,
    },
    cf_habit_forming: {
      type: Boolean,
    },
    cf_prescription: {
      type: String,
    },
    cf_type_of_sell: {
      type: String,
    },
    image: {
      // image_name in Zoho
      type: String,
    },
    unit: {
      type: String,
    },
    stock_on_hand: {
      type: Number,
    },
    manufacturer: {
      type: String,
    },
    brand: {
      type: String,
    },
    name: {
      type: String,
    },
    reviews: {
      type: [itemReviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.virtual('averageRating').get(function () {
  return this.reviews ? this.reviews.reduce((acc, review) => acc + review.score, 0) / this.reviews.length : 0;
});

itemSchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

itemSchema.virtual('isAvailable').get(function () {
  return this.stock_on_hand > 0;
});

itemSchema.set('toJSON', { virtuals: true });

itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
