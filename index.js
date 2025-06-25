require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8dojk.mongodb.net/job-seeker?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// jobs related apis
const jobsCollection = client.db('job-seeker').collection('jobs');

app.get('/jobs', async (req, res) => {
  try {
    const jobs = await jobsCollection.find({}).toArray();
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get('/', (req, res) => {
  res.send('Job server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
