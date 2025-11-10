const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://pawmart_db:46rnjUkRrzeW02LM@cluster0.acmy9ks.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("pawmart-db"); 
    app.locals.db = database;

  
    router.get("/api/listings/recent", async (req, res) => {
      try {
        const listings = database.collection("data");

        const recentListings = await listings
          .find({})
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray();

        res.json(recentListings);
      } catch (error) {
        res.status(500).json({ message: "Error fetching listings", error });
      }
    });

  
    app.use("/", router);

    await client.db("admin").command({ ping: 1 });
    console.log(" MongoDB connected successfully!");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
