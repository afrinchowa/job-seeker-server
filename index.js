require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// jobs related apis
const jobsCollection = client.db("job-seeker").collection("jobs");

app.get("/jobs", async (req, res) => {
  const cursor = jobsCollection.find();
  const result = await cursor.toArray();
  res.status(200).json(result);
});

app.get("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await jobsCollection.findOne(query);
  res.send(result);
});

// job application apis
const jobAppliationCollection = client
  .db("job-seeker")
  .collection("job_applications");

app.get("/job-applications", async (req, res) => {
  const email = req.query.email;
  const query = { applicant_email: email };
  const result = await jobAppliationCollection.find(query).toArray();
 for(const application of result){
  console.log(application.job_id)
  const query1 ={_id:new ObjectId(application.job_id)};
  const job = await jobsCollection.findOne(query1);
if(job){
  application.title = job.title;
  application.company = job.company;
  application.location = job.location;
  application.salary = job.salary;
  application.job_type = job.job_type;
  application.experience = job.experience;
  application.description = job.description;
  application.requirements = job.requirements;
  application.benefits = job.benefits;
}
 }
 
  res.send(result);
});

app.get("/job-applications/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await jobAppliationCollection.findOne(query);
  res.send(result);
});

app.post("/job-applications", async (req, res) => {
  const application = req.body;
  const result = await jobAppliationCollection.insertOne(application);
  res.send(result);
});

// Test route to check if the server is running
app.get("/", (req, res) => {
  res.send("Job server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
