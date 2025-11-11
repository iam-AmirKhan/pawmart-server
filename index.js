const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri =
  "mongodb+srv://pawmart_db:46rnjUkRrzeW02LM@cluster0.acmy9ks.mongodb.net/?appName=Cluster0";

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
    await client.connect();
    const database = client.db("pawmart-db");
    const listingsCollection = database.collection("data");

    console.log(" MongoDB connected successfully!");

    // ========== GET ALL LISTINGS ==========
    app.get("/api/listings", async (req, res) => {
      try {
        const allListings = await listingsCollection.find({}).toArray();
        res.json(allListings);
      } catch (error) {
        res.status(500).json({ message: "Error fetching listings", error: error.message });
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
        res.status(500).json({ message: "Error fetching by category", error: error.message });
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
        res.status(500).json({ message: "Error fetching recent listings", error: error.message });
      }
    });
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
