import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";

const dist = "dist";

await rm(dist, { force: true, recursive: true });
await mkdir(join(dist, "server"), { recursive: true });
await mkdir(join(dist, "assets"), { recursive: true });

await cp("index.html", join(dist, "index.html"));
await cp("style.css", join(dist, "style.css"));
await cp("script.js", join(dist, "script.js"));
await cp("assets", join(dist, "assets"), { recursive: true });

async function collectFiles(dir) {
  const entries = await readdir(dir);
  const files = [];

  for (const entry of entries) {
    const file = join(dir, entry);
    const info = await stat(file);

    if (info.isDirectory()) {
      files.push(...await collectFiles(file));
    } else {
      files.push(file);
    }
  }

  return files;
}

const files = await collectFiles(dist);
const assets = {};

for (const file of files) {
  if (file === join(dist, "server", "index.js")) continue;
  const route = "/" + relative(dist, file).split(sep).join(posix.sep);
  assets[route] = (await readFile(file)).toString("base64");
}

const server = String.raw`
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

const assets = ${JSON.stringify(assets)};

function contentType(pathname) {
  const ext = pathname.slice(pathname.lastIndexOf(".")).toLowerCase();
  return contentTypes[ext] || "application/octet-stream";
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const body = decodeBase64(assets[pathname] || assets["/index.html"]);

    return new Response(body, {
      headers: {
        "content-type": contentType(pathname),
        "cache-control": pathname === "/index.html" ? "no-cache" : "public, max-age=31536000, immutable"
      }
    });
  }
};
`;

await writeFile(join(dist, "server", "index.js"), server.trimStart());
