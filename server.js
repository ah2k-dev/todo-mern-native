import { app } from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
//env config
config({
  path: "./config/config.env",
});
//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})
//call database connection
connectDB();
// server
app.listen(process.env.PORT, () => {
  console.log(`server up port: ${process.env.PORT}`);
});
