const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const authJwt = require("./helpers/jwt");

//importing environment variables
require("dotenv/config");

//importing routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");

//importing models
const Product = require("./models/product");
const Category = require("./models/category");
const User = require("./models/user");
const Address = require("./models/address");
const Order = require("./models/order");

const app = express();

//api prefix
const api = process.env.API_URL;

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(authJwt());
app.use((err, req, res, next) => {
	res.send(err);
});
//using routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/addresses`, addressRoutes);
app.use(`${api}/orders`, orderRoutes);

//connecting to the database
mongoose
	.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log("Connected to db successfully ...");
	})
	.catch((err) => {
		console.log(err);
	});

//starting the server
app.listen(3000, () => {
	console.log("Server is up and running at http://localhost:3000/");
});
