import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import ConnectDB from "./db/db.js";

ConnectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
    });
  })
  .catch((err) => {
    console.log("MONGODB connection error", err);
  });
