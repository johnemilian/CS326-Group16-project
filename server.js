import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Group 16</h1>");
});

app.get("/info", (req, res) => {
  res.send(`
    <h1>Product Information</h1>
    <p>Group 16 is building a web app for the Cape Abilities Farm greenhouses.</p>
    <p>It allows for employees and managers to see updated information on seeds.</p>
`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
