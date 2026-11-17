#!/usr/bin/env node
// Standalone HTTP server for the MCP endpoint (/mcp) and static JSON API (/api/v1/*).
// Run locally or deploy on Render, Railway, Fly.io, or any Node.js host:
//     PORT=8787 node scripts/mcp-http.mjs
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { respond } from "../api/mcp.js";

const PORT = Number(process.env.PORT || 8787);
const BUILT = new URL("../_site/api/v1/data.json", import.meta.url);
const FALLBACK = "https://raw.githubusercontent.com/ramatogg/latam-ops-tech-companies/main/_site/api/v1/data.json";
const source = process.argv[2] ?? process.env.TECH_PAY_DATA ?? (existsSync(BUILT) ? BUILT : FALLBACK);
const jobsSource = process.argv[3] ?? process.env.TECH_PAY_JOBS ?? String(source).replace(/data\.json$/, "jobs.json");
const companiesSource = process.argv[4] ?? process.env.TECH_PAY_COMPANIES ?? String(source).replace(/data\.json$/, "company-cells.json");

const readJson = async (from) =>
  /^https?:/.test(String(from))
    ? (await fetch(from)).json()
    : JSON.parse(readFileSync(/^file:/.test(String(from)) ? fileURLToPath(String(from)) : String(from), "utf8"));

const data = await readJson(source);
let jobs, companies;
const env = {
  jobs: async () => (jobs ??= await readJson(jobsSource)),
  companies: async () => (companies ??= await readJson(companiesSource)),
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
};

const sendJson = (res, status, obj, extraHeaders = {}) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...CORS, ...extraHeaders });
  res.end(JSON.stringify(obj));
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    return sendJson(res, 200, { ok: true, mcp: "/mcp", server: "latam-ops-tech-companies" });
  }
  if (req.method === "GET" && url.pathname === "/api/v1/data.json") {
    return sendJson(res, 200, data);
  }
  if (req.method === "GET" && url.pathname === "/api/v1/jobs.json") {
    return sendJson(res, 200, await env.jobs());
  }
  if (req.method === "GET" && url.pathname === "/api/v1/company-cells.json") {
    return sendJson(res, 200, await env.companies());
  }
  if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
    if (req.method !== "POST") {
      return sendJson(res, 405, { error: "POST JSON-RPC to /mcp" }, { Allow: "POST, OPTIONS" });
    }
    let raw = "";
    for await (const chunk of req) raw += chunk;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
    }
    try {
      const reply = await respond(data, msg, env);
      return sendJson(res, 200, reply ?? {});
    } catch (err) {
      return sendJson(res, 500, { jsonrpc: "2.0", id: msg?.id ?? null, error: { code: -32603, message: String(err?.message ?? err) } });
    }
  }
  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`latam-ops-tech-companies HTTP MCP listening on http://localhost:${PORT}/mcp`);
});
