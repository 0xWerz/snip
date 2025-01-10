import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "..") });
});

app.post("/save", async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    console.log("body: ", body);
    if (!body) {
      res.status(400).send("No body");
    }
    const id = Math.random().toString(36).substring(2, 8);
    await put(id, body, {
      access: "public",
      contentType: "text/plain",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    res.status(200).json({ key: id });
  });
});

app.get("/:key", async (req, res) => {
  const key = req.params.key;
  const blobs = await list({ prefix: key });
  if (blobs.blobs.length > 0) {
    const blob = blobs.blobs[0];
    const code = await (await fetch(blob.url)).text();
    const indexHtml = fs.readFileSync(
      path.join(process.cwd(), "index.html"),
      "utf8"
    );
    const html = indexHtml
      .replace(
        '<pre><code id="editor" contenteditable="true" spellcheck="false"></code></pre>',
        `<pre><code id="editor" contenteditable="false" spellcheck="false">${code}</code></pre>`
      )
      .replace("</head>", "<script>hljs.highlightAll();</script></head>")
      .replace('<div id="chevron">> </div>', "");
    res.status(200).send(html);
  } else {
    res.status(404).send("Not found");
  }
});

app.get("/detroit.png", (req, res) => {
  res.sendFile("detroit.png", { root: process.cwd() });
});

app.listen(3001, () => {
  console.log("Server is running on port 3000");
});

export default app;
