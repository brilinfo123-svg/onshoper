import session from "express-session";
import MongoDBStore from "connect-mongodb-session";

// MongoDB session store
const MongoDBStoreFactory = MongoDBStore(session);
const store = new MongoDBStoreFactory({
  uri: process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test",
  collection: "sessions",
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

export default store;