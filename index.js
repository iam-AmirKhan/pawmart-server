const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use (express.json());

// 46rnjUkRrzeW02LM
// pawmart_db
const uri = "mongodb+srv://pawmart_db:46rnjUkRrzeW02LM@cluster0.acmy9ks.mongodb.net/?appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();





    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

