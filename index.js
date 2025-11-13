require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//MongoDB connection URI from .env
const uri = process.env.MONGODB_URI;


if (!uri) {
  console.error("URI not found in .env file!");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ========== ROUTES ==========
app.get("/", (req, res) => {
  res.send("PawMart Server is running!");
});

async function run() {
  try {
    // Connect to MongoDB 
    await client.connect();
    
    const database = client.db("pawmart-db");
    const listingsCollection = database.collection("data");
    const ordersCollection = database.collection("orders");

    console.log(" MongoDB connected successfully!");

    // ========== GET ALL LISTINGS ==========
    app.get("/api/listings", async (req, res) => {
      try {
        const allListings = await listingsCollection.find({}).toArray();
        res.json(allListings);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching listings", error: error.message });
      }
    });

    // ========== GET BY CATEGORY ==========
    app.get("/api/listings/category/:categoryName", async (req, res) => {
      try {
        const { categoryName } = req.params;
        const query = categoryName === "All" ? {} : { category: categoryName };

        const categoryListings = await listingsCollection.find(query).toArray();
        res.json(categoryListings);
      } catch (error) {
        res.status(500).json({
          message: "Error fetching by category",
          error: error.message,
        });
      }
    });

    // Get single listing
    app.get("/listings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const listing = await listingsCollection.findOne(query);
      res.send(listing);
    });

    // ========== ORDER ==========
    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;
        console.log(" Received order:", order);

        const result = await ordersCollection.insertOne(order);

        res.send({ insertedId: result.insertedId });
      } catch (error) {
        console.error(" Error saving order:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get all listings by user email
    app.get("/api/my-listings", async (req, res) => {
      try {
        const email = req.query.email;
        const listings = await listingsCollection
          .find({ email: email })
          .sort({ createdAt: -1 })
          .toArray();
        res.send(listings);
      } catch (error) {
        console.error("Error fetching user listings:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Delete listing
    app.delete("/api/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await listingsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Delete failed" });
      }
    });

    // Add new listing
    app.post("/api/listings", async (req, res) => {
      try {
        const newListing = req.body;
        const result = await listingsCollection.insertOne(newListing);
        res.send({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error adding listing:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get orders by user email
    app.get("/api/my-orders", async (req, res) => {
      try {
        const email = req.query.email;
        const orders = await ordersCollection.find({ email }).toArray();
        res.send(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // ========== GET RECENT LISTINGS ==========
    app.get("/api/listings/recent", async (req, res) => {
      try {
        const recentListings = await listingsCollection
          .find({})
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray();

        res.json(recentListings);
      } catch (error) {
        res.status(500).json({
          message: "Error fetching recent listings",
          error: error.message,
        });
      }
    });
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});