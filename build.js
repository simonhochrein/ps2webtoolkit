import * as esbuild from "esbuild";
import httpProxy from "http-proxy";
import { readFileSync } from "node:fs";

let context = await esbuild.context({
  entryPoints: ["src/index.tsx"],
  outdir: "docs",
  bundle: true,
  sourcemap: true,
});

context.serve({
  port: 8000,
  servedir: "docs",
});

httpProxy
  .createServer({
    target: {
      host: "localhost",
      port: 8000,
    },
    ssl: {
      key: readFileSync("key.pem", "utf8"),
      cert: readFileSync("cert.pem", "utf8"),
    },
  })
  .listen(8001);
