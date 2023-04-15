// /* eslint-disable camelcase */
// const axios = require('axios');
// const Pickrr = require('../models/pickrr.model');

// const placeOrder = async (orderBody) => {
//   const {
//     item_name,
//     item_list,
//     from_name,
//     from_phone_number,
//     from_address,
//     from_pincode,
//     to_name,
//     to_phone_number,
//     to_pincode,
//     to_address,
//     invoice_value,
//     cod_amount,
//   } = orderBody;
//   const response = await axios
//     .post(`https://www.pickrr.com/api/place-order/`, {
//       auth_token: process.env.PICKRR_TOKEN,
//       item_name,
//       item_list,
//       from_name,
//       from_phone_number,
//       from_address,
//       from_pincode,
//       to_name,
//       to_phone_number,
//       to_pincode,
//       to_address,
//       invoice_value,
//       cod_amount,
//     })
//     .then((res) => {
//       return res.data;
//     })
//     .catch((err) => {
//       return err.response.data;
//     });
//   await Pickrr.create(orderBody);
//   return response;
// };

// const checkPincodeService = async (from_pincode, to_pincode) => {
//   const response = await axios.get(
//     `https://www.pickrr.com/api/check-pincode-service/?from_pincode=${from_pincode}&to_pincode=${to_pincode}&auth_token=${process.env.PICKRR_TOKEN}`
//   );
//   return response.data;
// };

// const cancelOrder = async (orderId) => {
//   const response = await axios
//     .post(`https://www.pickrr.com/api/order-cancellation/?tracking_id=${orderId}&auth_token=${process.env.PICKRR_TOKEN}`)
//     .then((res) => {
//       return res.data;
//     })
//     .catch((err) => {
//       return err.response.data;
//     });
//   return response;
// };

// module.exports = {
//   placeOrder,
//   checkPincodeService,
//   cancelOrder,
// };
