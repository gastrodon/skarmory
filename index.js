import express from "express";

import { ratelimit } from "./middleware.js";

const app = express();
const limiter = ratelimit((it) => it.params.it, 60);

app.get("/is-the-number-100/:it", limiter, async (request, response) => {
  const it = parseInt(request.params.it, 10);

  if (isNaN(it)) {
    response
      .status(400)
      .send("that literally wasn't even a number what's wrong with you\n")
      .end();

    return;
  }

  response
    .send(it === 100 ? "yes :D\n" : "no :$\n")
    .end();
});

app.listen(8000);
