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
    productId: {
      type: String,
      required: true,
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

productSchema.set('toJSON', { virtuals: true });

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
