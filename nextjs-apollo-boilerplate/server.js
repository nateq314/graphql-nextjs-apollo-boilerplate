const express = require("express");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const UI_SERVICE_NAME = process.env.UI_SERVICE_NAME || "";

app.prepare().then(() => {
  const server = express();

  if (UI_SERVICE_NAME) {
    server.get(`/${UI_SERVICE_NAME}/*`, (req, res) => {
      req.url = req.url.slice(UI_SERVICE_NAME.length + 1); // +1 for the slash
      return handle(req, res);
    });

    server.get(`/${UI_SERVICE_NAME}`, (req, res) => {
      res.redirect(`/${UI_SERVICE_NAME}/`);
    });
  }

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
