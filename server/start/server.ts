import { createServer } from "http";
import { parse } from "url";
import next from "next";
import watchDatabase from "./dbsync";

const dev = process.argv[2] === "dev";
const hostname = "localhost";
const port = 782; // 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

if (process.argv[2] === "start") {
  //To hide your console just call:
  import("node-hide-console-window").then((mod) => mod.hideConsole());
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

watchDatabase().catch(console.error);
