#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const FAST_ATS = new Set([
  "greenhouse",
  "ashby",
  "lever",
  "workable",
  "recruitee",
  "smartrecruiters",
  "pinpoint",
  "rippling",
  "bamboohr",
  "bendingspoons",
]);

const NEW_ROLES = [
  { slug: "operations-manager", name: "Operations Manager", category: "Operations" },
  { slug: "supply-chain-manager", name: "Supply Chain & Logistics Manager", category: "Operations" },
  { slug: "sales-operations", name: "Sales & Revenue Operations", category: "Operations" },
  { slug: "product-operations", name: "Product Operations", category: "Operations" },
  { slug: "finance-operations", name: "Finance & Risk Operations", category: "Operations" },
  { slug: "bizops-manager", name: "BizOps & Strategy", category: "Operations" },
];

const NEW_REGIONS = {
  AR: { en: "Argentina", es: "Argentina" },
  LATAM: { en: "LATAM", es: "Latinoamérica" },
  BR: { en: "Brazil", es: "Brasil" },
  MX: { en: "Mexico", es: "México" },
  CO: { en: "Colombia", es: "Colombia" },
  CL: { en: "Chile", es: "Chile" },
  UY: { en: "Uruguay", es: "Uruguay" },
  PE: { en: "Peru", es: "Perú" },
  CR: { en: "Costa Rica", es: "Costa Rica" },
  US: { en: "United States", es: "Estados Unidos" },
  CA: { en: "Canada", es: "Canadá" },
  GLOBAL: { en: "Global Remote", es: "Remoto Global" },
};

const CURATED_BOARDS = [
  { name: "Flexport", slug: "flexport", ats: "greenhouse", board: "flexport", url: "https://www.flexport.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Samsara", slug: "samsara", ats: "greenhouse", board: "samsara", url: "https://www.samsara.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "DoorDash", slug: "doordash", ats: "greenhouse", board: "doordashusa", url: "https://www.doordash.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Instacart", slug: "instacart", ats: "greenhouse", board: "instacart", url: "https://www.instacart.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Toast", slug: "toast", ats: "greenhouse", board: "toast", url: "https://pos.toasttab.com", cities: ["Boston", "Remote"], tier: "A" },
  { name: "Brex", slug: "brex", ats: "greenhouse", board: "brex", url: "https://www.brex.com", cities: ["San Francisco", "New York", "Remote"], tier: "A" },
  { name: "Ramp", slug: "ramp", ats: "ashby", board: "ramp", url: "https://ramp.com", cities: ["New York", "Remote"], tier: "A" },
  { name: "VTEX", slug: "vtex", ats: "greenhouse", board: "vtex", url: "https://vtex.com", cities: ["São Paulo", "Buenos Aires", "Remote"], tier: "B" },
  { name: "Wildlife Studios", slug: "wildlife-studios", ats: "greenhouse", board: "wildlifestudios", url: "https://wildlifestudios.com", cities: ["São Paulo", "Buenos Aires", "Remote"], tier: "B" },
  { name: "Kavak", slug: "kavak", ats: "lever", board: "kavak", url: "https://www.kavak.com", cities: ["Mexico City", "Buenos Aires", "São Paulo"], tier: "B" },
  { name: "Faire", slug: "faire", ats: "greenhouse", board: "faire", url: "https://www.faire.com", cities: ["San Francisco", "Toronto", "Remote"], tier: "A" },
  { name: "project44", slug: "project44", ats: "greenhouse", board: "project44", url: "https://www.project44.com", cities: ["Chicago", "Remote"], tier: "B" },
  { name: "Motive", slug: "motive", ats: "greenhouse", board: "gomotive", url: "https://gomotive.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Mercury", slug: "mercury", ats: "greenhouse", board: "mercury", url: "https://mercury.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Carta", slug: "carta", ats: "greenhouse", board: "carta", url: "https://carta.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Verkada", slug: "verkada", ats: "greenhouse", board: "verkada", url: "https://www.verkada.com", cities: ["San Mateo", "Remote"], tier: "A" },
  { name: "Coinbase", slug: "coinbase", ats: "greenhouse", board: "coinbase", url: "https://www.coinbase.com", cities: ["Remote"], tier: "A" },
  { name: "Chime", slug: "chime", ats: "greenhouse", board: "chime", url: "https://www.chime.com", cities: ["San Francisco", "Chicago", "Remote"], tier: "A" },
  { name: "Gusto", slug: "gusto", ats: "greenhouse", board: "gusto", url: "https://gusto.com", cities: ["San Francisco", "Denver", "Remote"], tier: "A" },
  { name: "Robinhood", slug: "robinhood", ats: "greenhouse", board: "robinhood", url: "https://robinhood.com", cities: ["Menlo Park", "New York", "Remote"], tier: "A" },
  { name: "Lyft", slug: "lyft", ats: "greenhouse", board: "lyft", url: "https://www.lyft.com", cities: ["San Francisco", "Toronto", "Remote"], tier: "A" },
  { name: "Airbnb", slug: "airbnb", ats: "greenhouse", board: "airbnb", url: "https://www.airbnb.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Pinterest", slug: "pinterest", ats: "greenhouse", board: "pinterest", url: "https://www.pinterest.com", cities: ["San Francisco", "Toronto", "Remote"], tier: "A" },
  { name: "Dropbox", slug: "dropbox", ats: "greenhouse", board: "dropbox", url: "https://www.dropbox.com", cities: ["Remote"], tier: "A" },
  { name: "GitLab", slug: "gitlab", ats: "greenhouse", board: "gitlab", url: "https://about.gitlab.com", cities: ["Remote"], tier: "A" },
  { name: "Notion", slug: "notion", ats: "ashby", board: "notion", url: "https://www.notion.so", cities: ["San Francisco", "New York", "Remote"], tier: "A" },
  { name: "Linear", slug: "linear", ats: "ashby", board: "linear", url: "https://linear.app", cities: ["Remote"], tier: "A" },
  { name: "OpenAI", slug: "openai", ats: "ashby", board: "openai", url: "https://openai.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Anthropic", slug: "anthropic", ats: "greenhouse", board: "anthropic", url: "https://www.anthropic.com", cities: ["San Francisco", "New York", "Remote"], tier: "A" },
  { name: "Scale AI", slug: "scale-ai", ats: "greenhouse", board: "scaleai", url: "https://scale.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Replit", slug: "replit", ats: "ashby", board: "replit", url: "https://replit.com", cities: ["Foster City", "Remote"], tier: "A" },
  { name: "Supabase", slug: "supabase", ats: "ashby", board: "supabase", url: "https://supabase.com", cities: ["Remote"], tier: "A" },
  { name: "PostHog", slug: "posthog", ats: "ashby", board: "posthog", url: "https://posthog.com", cities: ["Remote"], tier: "A" },
  { name: "Figma", slug: "figma", ats: "greenhouse", board: "figma", url: "https://www.figma.com", cities: ["San Francisco", "New York", "Remote"], tier: "A" },
  { name: "Discord", slug: "discord", ats: "greenhouse", board: "discord", url: "https://discord.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Reddit", slug: "reddit", ats: "greenhouse", board: "reddit", url: "https://www.redditinc.com", cities: ["San Francisco", "New York", "Remote"], tier: "A" },
  { name: "Duolingo", slug: "duolingo", ats: "greenhouse", board: "duolingo", url: "https://www.duolingo.com", cities: ["Pittsburgh", "New York", "Remote"], tier: "A" },
  { name: "Airtable", slug: "airtable", ats: "greenhouse", board: "airtable", url: "https://www.airtable.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Asana", slug: "asana", ats: "greenhouse", board: "asana", url: "https://asana.com", cities: ["San Francisco", "Remote"], tier: "A" },
  { name: "Spotify", slug: "spotify", ats: "lever", board: "spotify", url: "https://www.lifeatspotify.com", cities: ["New York", "Stockholm", "Remote"], tier: "A" },
  { name: "Palantir", slug: "palantir", ats: "lever", board: "palantir", url: "https://www.palantir.com", cities: ["New York", "Denver", "Remote"], tier: "A" },
];

function enrichDataJson(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.regions = { ...data.regions, ...NEW_REGIONS };

  const roleSlugs = new Set((data.roles ?? []).map((r) => r.slug));
  for (const r of NEW_ROLES) {
    if (!roleSlugs.has(r.slug)) {
      data.roles.push(r);
      roleSlugs.add(r.slug);
    }
  }

  const companySlugs = new Set((data.companies ?? []).map((c) => c.levels));
  const companyNames = new Set((data.companies ?? []).map((c) => c.name.toLowerCase()));
  for (const c of CURATED_BOARDS) {
    if (!companySlugs.has(c.slug) && !companyNames.has(c.name.toLowerCase())) {
      data.companies.push({
        name: c.name,
        url: c.url,
        web: c.url,
        levels: c.slug,
        linkedin: null,
        cities: c.cities,
        n: 0,
      });
      companySlugs.add(c.slug);
      companyNames.add(c.name.toLowerCase());
    }
  }

  writeFileSync(path, JSON.stringify(data));
  return data;
}

enrichDataJson("data/data.json");
enrichDataJson("_site/api/v1/data.json");

const boardsListPath = "_site/api/v1/boards-list.json";
const boardsList = JSON.parse(readFileSync(boardsListPath, "utf8"));

const seen = new Set();
const kept = [];
for (const b of boardsList.companies ?? []) {
  if (!FAST_ATS.has(b.ats)) continue;
  const key = `${b.ats}:${b.board}`;
  if (seen.has(key)) continue;
  seen.add(key);
  kept.push(b);
}

for (const c of CURATED_BOARDS) {
  const key = `${c.ats}:${c.board}`;
  if (seen.has(key)) continue;
  seen.add(key);
  kept.push({
    name: c.name,
    ats: c.ats,
    board: c.board,
    tier: c.tier,
    tags: ["latam", "us", "remote", ...c.cities.map((x) => x.toLowerCase().replace(/\s+/g, "-"))],
  });
}

kept.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
boardsList.companies = kept;
writeFileSync(boardsListPath, JSON.stringify(boardsList));

console.log(`Enriched data.json and boards-list.json (${kept.length} fast JSON API boards ready to crawl).`);
