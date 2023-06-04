import { MongoClient } from "mongodb";

let documents = [];
const url = "mongodb://localhost:27017";
const dbName = "twitter-bot";
const mongoClient = new MongoClient(url);
mongoClient
  .connect()
  .then(() => console.log("connected"))
  .catch(([error]) => console.log(error));
const db = mongoClient.db(dbName);
const collection = db.collection("bot-accounts");
const fetchAccounts = async () => {
  try {
    documents = await collection.find({}).toArray();
    return documents;
  } catch (error) {
    console.error("Error:", error);
  }
};

export default fetchAccounts;
