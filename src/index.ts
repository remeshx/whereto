import config from "./config.json";
import router from "./router";
import express from "express";

const port = process.env.PORT || config.PORT;
const app = express();

app.use(express.json())
app.use('/api', router);

app.listen(port, () => {
  console.log("server listening at port", port)
})

