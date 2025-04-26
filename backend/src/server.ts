import express from "express";
import cors from "cors";
import { connectDB } from "./db/db";
import campaignRoutes from "./routes/campaign.routes";

const app = express();
app.use(cors());
app.use(express.json());

const port = 8080;

connectDB();

app.get("/", (req, res) => {
  res.send("Campaign API is running!");
});

app.use("/campaigns", campaignRoutes);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
