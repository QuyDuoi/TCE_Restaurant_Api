const mongoose = require("mongoose");
let local =
  "mongodb+srv://tcerestaurantmb33:BestServiceWithUsMb33@tcerestaurant.m5qeb.mongodb.net/";
const connect = async () => {
  try {
    await mongoose.connect(local, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connect success");
  } catch (error) {
    console.log(error);
    console.log("connect fail");
  }
};
module.exports = { mongoose, connect };
