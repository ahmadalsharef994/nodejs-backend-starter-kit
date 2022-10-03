const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productReviewSchema = mongoose.Schema(
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

const productSchema = new mongoose.Schema(
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
      type: Boolean,
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
      type: [productReviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

productSchema.virtual('averageRating').get(function () {
  return this.reviews ? this.reviews.reduce((acc, review) => acc + review.score, 0) / this.reviews.length : 0;
});

productSchema.virtual('reviewCount').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

productSchema.virtual('isAvailable').get(function () {
  return this.stock_on_hand > 0;
});

productSchema.set('toJSON', { virtuals: true });

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
