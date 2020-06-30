const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.SK_KEY);
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("It works");
});
app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("PRODUCT: ", product);
  console.log("PRODUCT PRICE: ", product.price);
  const idempotencyKey = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customerData) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customerData.id,
          receipt_email: token.email,
          description: `Purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((response) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

//listen
app.listen(8282, () => console.log("LISTENING AT PORT 8282"));
