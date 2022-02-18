import express from "express";

const app = express();

app.get("/match/:first/:last", async (request, response) => {
  const first = request.params.first;
  const last = request.params.last;

  response
    .send(last === first)
    .end();
});

app.listen(8000);
