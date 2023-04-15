// // const httpStatus = require('http-status');
// const Cart = require('../models/cart.model');
// const orderService = require('./order.service');

// const addToCart = async (userId, productId, packageId) => {
//   let cart;
//   cart = await Cart.findOne({ userId });
//   if (!cart) {
//     cart = await new Cart({
//       userId,
//     });
//   }
//   if (productId) {
//     cart.products.push(productId);
//   }
//   if (packageId) {
//     cart.packages.push(packageId);
//   }
//   const newCart = await cart.save();
//   return newCart;
// };

// const removeFromCart = async (userId, productId, packageId) => {
//   const cart = await Cart.findOne({ userId });
//   const productIndex = cart.products.indexOf(productId);
//   const packageIndex = cart.packages.indexOf(packageId);
//   // remove product from cart
//   if (productIndex !== -1) {
//     // cart.products = cart.products.filter(id => id !== productId);
//     cart.products.splice(productIndex, 1);
//   }
//   // remove package from cart
//   if (packageIndex !== -1) {
//     // cart.packages = cart.packages.filter(id => id !== packageId);
//     cart.packages.splice(packageIndex, 1);
//   }
//   const newCart = await cart.save();
//   return newCart;
// };

// const getCart = async (userId) => {
//   const cart = await Cart.findOne({ userId });
//   if (!cart) {
//     return;
//   }
//   return cart;
// };

// // const applyOffer = async (userId, offerCode) => {
// //   const cart = await Cart.findOne({ userId });
// //   const offer = await Offer.findOne({ offerCode });
// //   if (offer.type === 'discount') {
// //     cart.price *= 1 - offer.value / 100;
// //   }
// //   if (offer.type === 'cashback') {
// //     cart.cashback = offer.value;
// //     offer.status = 'USED';
// //   }
// //   if (offer.type === 'voucher') {
// //     if (offer.value > cart.price) {
// //       cart.price = 0;
// //       offer.value -= cart.price;
// //     } else {
// //       cart.price -= offer.value;
// //       offer.value = 0;
// //     }
// //   }
// //   offer.status = 'USED';
// //   return [cart, offer];
// // };

// const checkout = async (cart, orderBody) => {
//   const { userId } = cart;
//   // const { offerCode } = offer;
//   // create order
//   const order = await orderService.createOrder(userId, orderBody);
//   // remove cart
//   // eslint-disable-next-line no-param-reassign
//   cart = {
//     userId,
//     products: [],
//     packages: [],
//   };
//   await Cart.findOneAndUpdate({ userId }, cart);
//   // await Offer.findOneAndUpdate({ offerCode }, offer);

//   return order;
// };

// module.exports = {
//   addToCart,
//   removeFromCart,
//   getCart,
//   checkout,
// };
