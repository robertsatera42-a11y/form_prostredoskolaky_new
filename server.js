const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const history = require("connect-history-api-fallback");

const portNum = 3000;

let app = express();
const staticFileMiddleware = serveStatic(path.join(__dirname, "dist"));

// comment following

// app.use("*", function (req, res, next) {
//   const host = req.headers.host;
//   // let www = "";
//   // if (!host.match(/^www\..*/i)) {
//   //   www = "www.";
//   // }

//   // if (req.headers["x-forwarded-proto"] !== "https") {
//   //   const secureUrl = "https://" + www + req.headers.host + req.url;
//   //   res.writeHead(301, { Location: secureUrl });
//   //   res.end();
//   // } else if (www) {
//   //   res.writeHead(301, {
//   //     Location: "https://" + www + req.headers.host + req.url,
//   //   });
//   //   res.end();
//   // }
//   next();
// });

// app.use(staticFileMiddleware);
// app.use(history());

// app.get("/", function (req, res) {
//   res.render(path.join(__dirname + "/index.html"));
// });

// comment above
app.get(
  "/.well-known/acme-challenge/drw_qXAroLifgwV6Sg2Odxvt_GzhpU6abwwIzBIj4U8",
  function (req, res) {
    res.send(
      "drw_qXAroLifgwV6Sg2Odxvt_GzhpU6abwwIzBIj4U8.K0kYVkI1RbD_XVfNybqUHTGx0yZB-ShFcv_w5x93nMo"
    );
  }
);

app.use(serveStatic(path.join(__dirname, "dist")));

// end of comment

const port = process.env.PORT || portNum;

app.listen(port);

console.log(`app listening on port ${process.env.PORT}`);
