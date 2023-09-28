const connectToMongo = require("./db.js");
const express = require("express");
connectToMongo();
const app = express();
const cors=require('cors')
const port = 5000;
app.use(cors())
app.use(express.json())
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/notes", require("./routes/notes.js"));

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
