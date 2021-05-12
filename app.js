require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const productSchema = {
  title: String,
  price: Number,
  des: String,
  inCart: Boolean
};

const cartIndexSchema = {
  cartIndex: Number
};

const Product = mongoose.model("Product", productSchema);
const Index = mongoose.model("Index", cartIndexSchema);

const currIndex = new Index({cartIndex: 0});

Index.find({}, (err, foundIndex) => {
  if(foundIndex.length === 0){
    currIndex.save(function (err) {
      if (err) return console.log(err);
    });
  }
});

app.get("/", (req, res) => {
  Index.findOne({}, (err, foundIndex) => {
    res.render("home", {index: foundIndex.cartIndex});
  });
});

app.get("/products", (req, res) => {
  Index.findOne({}, (err, foundIndex) => {
    Product.find({}, (err, foundProducts) => {
      res.render("products", {index: foundIndex.cartIndex, productsList: foundProducts});
    });
  });
});

app.get("/addProduct", (req, res) => {
  Index.findOne({}, (err, foundIndex) => {
    res.render("addProduct", {index: foundIndex.cartIndex});
  });
});

app.get("/cart", (req, res) => {
  Index.findOne({}, (err, foundIndex) => {
    Product.find({inCart: true}, (err, foundProducts) => {
      res.render("cart", {index: foundIndex.cartIndex, productsList: foundProducts});
    })
  });
});

app.get("/product/:productTitle", (req, res) => {

  let productTitle = req.params.productTitle;

  Index.findOne({}, (err, foundIndex) => {
    Product.findOne({title: productTitle}, (err, foundProduct) => {
      res.render("indiProduct", {index: foundIndex.cartIndex, product: foundProduct})
    })
  })
});

app.post("/addproduct", (req, res) => {

  let newProduct = new Product({
    title: req.body.productTitle,
    price: req.body.productPrice,
    des: req.body.productDes,
    inCart: false
  });
  newProduct.save();

  res.redirect("/products");

});

app.post("/addtocart", (req, res) => {
    let productID = req.body.id;

    Product.findOne({_id: productID}, (err, foundProduct) => {
      foundProduct.inCart = true;
      foundProduct.save();
    });
    Index.findOne({}, (err, foundIndex) => {
      foundIndex.cartIndex++;
      foundIndex.save();
    });

    res.redirect("/products");
});

app.post("/rmProduct", (req, res) => {
  let productID = req.body.id;

  Product.findOne({_id: productID}, (err, foundProduct) => {
    foundProduct.inCart = false;
    foundProduct.save();
  });

  Index.findOne({}, (err, foundIndex) => {
    foundIndex.cartIndex--;
    foundIndex.save();
  });

  res.redirect("/cart");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running SuccesFully");
});
