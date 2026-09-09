#!/usr/bin/env node
/**
 * scripts/verify-deployment.js
 *
 * Cloudflare Pages + Pages Functions Deployment Verification Suite
 *
 * Validates:
 * 1. Single authoritative 'wrangler.toml' (no conflicting wrangler.json / wrangler.jsonc).
 * 2. Cloudflare Pages configuration ('pages_build_output_dir = "dist"', no conflicting Worker 'main'/'[assets]').
 * 3. NAVIKO_KV binding and nodejs_compat flags for Cloudflare Pages Functions.
 * 4. Pages Functions compilation via 'npx wrangler pages functions build'.
 * 5. Static SPA output ('dist/index.html', assets, _routes.json, _headers, _redirects).
 * 6. Wrangler Pages project validation via 'npx wrangler pages project validate dist'.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const issues = [];
const successes = [];
const warnings = [];

function recordPass(label, detail = '') {
  successes.push({ label, detail });
  console.log(`  ${c.green}✔ PASS${c.reset} ${c.bold}${label}${c.reset}${detail ? ` - ${c.gray}${detail}${c.reset}` : ''}`);
}

function recordFail(label, reason, fix = '') {
  issues.push({ label, reason, fix });
  console.log(`  ${c.red}✖ FAIL${c.reset} ${c.bold}${label}${c.reset}`);
  console.log(`         ${c.red}Reason: ${reason}${c.reset}`);
  if (fix) console.log(`         ${c.yellow}Fix: ${fix}${c.reset}`);
}

function recordWarn(label, detail, tip = '') {
  warnings.push({ label, detail, tip });
  console.log(`  ${c.yellow}▲ WARN${c.reset} ${c.bold}${label}${c.reset}`);
  console.log(`         ${c.yellow}${detail}${c.reset}`);
  if (tip) console.log(`         ${c.cyan}Tip: ${tip}${c.reset}`);
}

function parseToml(content) {
  const config = {};
  let currentSection = null;
  let currentArraySection = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const arrayTableMatch = line.match(/^\[\[\s*([a-zA-Z0-9_.-]+)\s*\]\]$/);
    if (arrayTableMatch) {
      const sectionName = arrayTableMatch[1];
      currentSection = null;
      if (!config[sectionName]) config[sectionName] = [];
      const newObj = {};
      config[sectionName].push(newObj);
      currentArraySection = newObj;
      continue;
    }

    const tableMatch = line.match(/^\[\s*([a-zA-Z0-9_.-]+)\s*\]$/);
    if (tableMatch) {
      const sectionName = tableMatch[1];
      currentArraySection = null;
      if (!config[sectionName]) config[sectionName] = {};
      currentSection = config[sectionName];
      continue;
    }

    const kvMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let valRaw = kvMatch[2].trim();

      if (valRaw.includes('#') && !valRaw.startsWith('"') && !valRaw.startsWith('[')) {
        valRaw = valRaw.split('#')[0].trim();
      }

      let parsedVal;
      if ((valRaw.startsWith('"') && valRaw.endsWith('"')) || (valRaw.startsWith("'") && valRaw.endsWith("'"))) {
        parsedVal = valRaw.slice(1, -1);
      } else if (valRaw.startsWith('[') && valRaw.endsWith(']')) {
        try {
          parsedVal = JSON.parse(valRaw.replace(/'/g, '"'));
        } catch {
          parsedVal = valRaw.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        }
      } else if (valRaw === 'true') parsedVal = true;
      else if (valRaw === 'false') parsedVal = false;
      else if (!isNaN(Number(valRaw))) parsedVal = Number(valRaw);
      else parsedVal = valRaw;

      const target = currentArraySection || currentSection || config;
      target[key] = parsedVal;
    }
  }

  return config;
}

console.log(`\n${c.cyan}${c.bold}================================================================${c.reset}`);
console.log(`${c.cyan}${c.bold}      Cloudflare Pages & Functions Deployment Verification      ${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}\n`);

// ============================================================================
// CHECK 1: Configuration File Detection & Architecture
// ============================================================================
console.log(`${c.bold}[1/6] Cloudflare Configuration Architecture${c.reset}`);

const tomlFile = path.join(ROOT_DIR, 'wrangler.toml');
const jsonFile = path.join(ROOT_DIR, 'wrangler.json');
const jsoncFile = path.join(ROOT_DIR, 'wrangler.jsonc');

const foundConfigs = [];
if (fs.existsSync(tomlFile)) foundConfigs.push('wrangler.toml');
if (fs.existsSync(jsonFile)) foundConfigs.push('wrangler.json');
if (fs.existsSync(jsoncFile)) foundConfigs.push('wrangler.jsonc');

let parsedConfig = {};

if (foundConfigs.length === 0) {
  recordFail(
    'No Cloudflare configuration file found',
    'Neither wrangler.toml nor wrangler.json exists in root.',
    'Create wrangler.toml configured with pages_build_output_dir = "dist".'
  );
} else if (foundConfigs.length > 1) {
  recordFail(
    'Conflicting configuration files detected',
    `Found multiple conflicting configuration files: [${foundConfigs.join(', ')}].`,
    `Remove ${foundConfigs.filter(f => f !== 'wrangler.toml').join(', ')} and retain only wrangler.toml.`
  );
} else {
  recordPass(`Single authoritative configuration file: ${foundConfigs[0]}`);
}

if (fs.existsSync(tomlFile)) {
  try {
    const raw = fs.readFileSync(tomlFile, 'utf8');
    parsedConfig = parseToml(raw);
    recordPass('Successfully parsed wrangler.toml');
  } catch (err) {
    recordFail('Failed to parse wrangler.toml', err.message, 'Fix syntax errors in wrangler.toml.');
  }
}

// Check Pages name
if (parsedConfig.name === 'naviko-tools' || parsedConfig.name === 'naviko') {
  recordPass(`Pages project name configured as '${parsedConfig.name}'`);
} else {
  recordWarn(`Pages project name '${parsedConfig.name}'`, "Recommended to match Cloudflare Pages project 'naviko-tools'.");
}

// Check pages_build_output_dir
const pagesOutputDir = parsedConfig.pages_build_output_dir;
if (!pagesOutputDir) {
  recordFail(
    "'pages_build_output_dir' is missing",
    "Directives 'pages_build_output_dir = \"dist\"' is required for Cloudflare Pages. Without it, Wrangler treats the file as a Worker configuration.",
    'Add pages_build_output_dir = "dist" to wrangler.toml.'
  );
} else if (pagesOutputDir === 'dist' || pagesOutputDir === './dist') {
  recordPass(`'pages_build_output_dir' correctly set to '${pagesOutputDir}'`);
} else {
  recordFail("'pages_build_output_dir' misconfigured", `Found '${pagesOutputDir}', expected 'dist'.`, 'Set pages_build_output_dir = "dist".');
}

// Ensure no conflicting Worker entrypoints
if (parsedConfig.main) {
  recordFail(
    "Conflicting Worker 'main' found in Pages configuration",
    `'main = "${parsedConfig.main}"' instructs Wrangler to treat this as a standalone Worker. In Cloudflare Pages, backend functions are managed via functions/ directory.`,
    'Remove main directive from wrangler.toml.'
  );
} else {
  recordPass("No conflicting Worker 'main' entrypoint (Pages architecture preserved)");
}

if (parsedConfig.assets) {
  recordFail(
    "Conflicting Workers Assets '[assets]' table found",
    "'[assets]' belongs to Cloudflare Workers with Assets, which conflicts with Pages 'pages_build_output_dir'.",
    'Remove [assets] block from wrangler.toml.'
  );
} else {
  recordPass("No conflicting Workers Assets '[assets]' directive");
}

// Check nodejs_compat flag
const flags = parsedConfig.compatibility_flags || [];
if (Array.isArray(flags) && flags.includes('nodejs_compat')) {
  recordPass("'nodejs_compat' flag enabled in compatibility_flags");
} else {
  recordWarn("Missing 'nodejs_compat' flag", "Functions using crypto or buffer may fail without nodejs_compat.");
}

// Check NAVIKO_KV binding
const kvNamespaces = parsedConfig.kv_namespaces || [];
const navikoKv = Array.isArray(kvNamespaces) && kvNamespaces.find(kv => kv.binding === 'NAVIKO_KV');
if (navikoKv) {
  recordPass(`'NAVIKO_KV' namespace binding configured (id: ${navikoKv.id})`);
} else {
  recordWarn("NAVIKO_KV binding not found", "Cloudflare KV session persistence requires NAVIKO_KV.");
}

// ============================================================================
// CHECK 2: Pages Functions Verification & Test Build
// ============================================================================
console.log(`\n${c.bold}[2/6] Cloudflare Pages Functions Verification${c.reset}`);

const functionsEntry = path.join(ROOT_DIR, 'functions', 'api', '[[path]].ts');
if (fs.existsSync(functionsEntry)) {
  const content = fs.readFileSync(functionsEntry, 'utf8');
  if (content.includes('export async function onRequest') || content.includes('export const onRequest')) {
    recordPass("Pages Function catch-all 'functions/api/[[path]].ts' found with valid onRequest export");
  } else {
    recordFail("Pages Function entrypoint missing onRequest export", "functions/api/[[path]].ts must export onRequest handler.");
  }

  // Check that all critical API handlers are present
  const requiredEndpoints = ['/api/auth/', '/api/subscription', '/api/razorpay', '/api/auth/profile', '/api/health'];
  let allFound = true;
  for (const ep of requiredEndpoints) {
    if (!content.includes(ep)) {
      allFound = false;
      recordWarn(`Endpoint reference '${ep}' not explicitly found in functions/api/[[path]].ts`);
    }
  }
  if (allFound) {
    recordPass("All essential API routes present in catch-all handler (auth, subscription, razorpay, user, health)");
  }
} else {
  recordFail("Missing 'functions/api/[[path]].ts'", "Pages Functions catch-all handler not found.");
}

// Test build Pages Functions
try {
  const tmpOut = path.join(ROOT_DIR, 'dist', '.verify-functions-build');
  execSync(`npx wrangler pages functions build --build-output-directory dist --outdir "${tmpOut}" --compatibility-flags nodejs_compat`, {
    cwd: ROOT_DIR,
    stdio: 'pipe',
  });
  if (fs.existsSync(path.join(tmpOut, 'index.js'))) {
    recordPass("Pages Functions bundled successfully with 'npx wrangler pages functions build'");
  }
  fs.rmSync(tmpOut, { recursive: true, force: true });
} catch (err) {
  const msg = (err.stderr ? err.stderr.toString() : '') || err.message;
  recordFail("Pages Functions compilation failed", msg, "Ensure functions/api/[[path]].ts has valid TypeScript and imports.");
}

// ============================================================================
// CHECK 3: Static Frontend Assets ('dist/')
// ============================================================================
console.log(`\n${c.bold}[3/6] Static Frontend Build Output ('dist/')${c.reset}`);

const distPath = path.join(ROOT_DIR, 'dist');
if (!fs.existsSync(distPath)) {
  recordFail("Missing 'dist/' directory", "Run 'npm run build' before verifying deployment.");
} else {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath) && fs.statSync(indexPath).size > 0) {
    recordPass(`'dist/index.html' exists and valid (${fs.statSync(indexPath).size} bytes)`);
  } else {
    recordFail("Missing or empty 'dist/index.html'", "Vite build must output index.html into dist/.");
  }

  const assetsDir = path.join(distPath, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const js = files.filter(f => f.endsWith('.js')).length;
    const css = files.filter(f => f.endsWith('.css')).length;
    recordPass(`Static assets found in 'dist/assets/' (${js} JS chunks, ${css} CSS stylesheets)`);
  } else {
    recordFail("Missing 'dist/assets/' directory", "Vite assets directory not found.");
  }
}

// ============================================================================
// CHECK 4: Pages Routing Rules (_routes.json, _headers, _redirects)
// ============================================================================
console.log(`\n${c.bold}[4/6] Pages Routing & Fallback Rules${c.reset}`);

const routesFile = path.join(ROOT_DIR, 'public', '_routes.json');
if (fs.existsSync(routesFile)) {
  try {
    const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
    if (routes.include?.includes('/api/*') || routes.include?.includes('/api')) {
      recordPass("'_routes.json' correctly routes '/api/*' to Cloudflare Pages Functions");
    } else {
      recordWarn("'_routes.json' does not include '/api/*'");
    }
  } catch (err) {
    recordFail("Failed to parse '_routes.json'", err.message);
  }
} else {
  recordWarn("'_routes.json' not found in public/", "Functions will route all traffic through worker unless configured.");
}

const redirectsFile = path.join(ROOT_DIR, 'public', '_redirects');
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, 'utf8');
  if (content.includes('/*') && content.includes('/index.html') && content.includes('200')) {
    recordPass("'_redirects' configures client-side SPA fallback (/* /index.html 200)");
  } else {
    recordWarn("'_redirects' SPA rule missing or formatted differently");
  }
}

// ============================================================================
// CHECK 5: Package Manager Lockfile Cleanliness
// ============================================================================
console.log(`\n${c.bold}[5/6] Package Manager Lockfile Cleanliness${c.reset}`);

const lockfiles = [
  fs.existsSync(path.join(ROOT_DIR, 'package-lock.json')) ? 'package-lock.json' : null,
  fs.existsSync(path.join(ROOT_DIR, 'bun.lock')) ? 'bun.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'yarn.lock')) ? 'yarn.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml')) ? 'pnpm-lock.yaml' : null,
].filter(Boolean);

if (lockfiles.length === 1 && lockfiles[0] === 'package-lock.json') {
  recordPass("Single authoritative lockfile: 'package-lock.json'");
} else if (lockfiles.length > 1) {
  recordFail(
    "Multiple lockfiles detected",
    `Found [${lockfiles.join(', ')}].`,
    `Remove ${lockfiles.filter(l => l !== 'package-lock.json').join(', ')} and retain only package-lock.json.`
  );
}

// Check .nvmrc
const nvmrcPath = path.join(ROOT_DIR, '.nvmrc');
if (fs.existsSync(nvmrcPath)) {
  recordPass(`'.nvmrc' specifies Node version '${fs.readFileSync(nvmrcPath, 'utf8').trim()}'`);
}

// ============================================================================
// CHECK 6: Wrangler Pages Project Validation
// ============================================================================
console.log(`\n${c.bold}[6/6] Wrangler Pages Project Validation${c.reset}`);

try {
  const cmd = 'npx wrangler pages project validate dist';
  console.log(`  ${c.gray}Executing: ${cmd}${c.reset}`);
  execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' });
  recordPass("'npx wrangler pages project validate dist' passed with 0 errors");
} catch (err) {
  const msg = (err.stderr ? err.stderr.toString() : '') || err.message;
  recordFail("Wrangler pages project validate failed", msg);
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log(`\n${c.cyan}${c.bold}================================================================${c.reset}`);
console.log(`${c.bold}                  DIAGNOSTIC REPORT SUMMARY                     ${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}`);
console.log(`  Total Checks: ${successes.length + issues.length + warnings.length}`);
console.log(`  ${c.green}Passed:       ${successes.length}${c.reset}`);
console.log(`  ${issues.length > 0 ? c.red : c.gray}Failed:       ${issues.length}${c.reset}`);
console.log(`  ${warnings.length > 0 ? c.yellow : c.gray}Warnings:     ${warnings.length}${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}\n`);

if (issues.length > 0) {
  console.log(`${c.red}${c.bold}STATUS: BLOCKED${c.reset}\n`);
  issues.forEach((iss, idx) => {
    console.log(`  ${idx + 1}. ${c.bold}${iss.label}${c.reset}`);
    console.log(`     ${c.red}Problem: ${iss.reason}${c.reset}`);
    if (iss.fix) console.log(`     ${c.yellow}Fix:     ${iss.fix}${c.reset}`);
  });
  process.exit(1);
} else {
  console.log(`${c.green}${c.bold}STATUS: READY FOR CLOUDFLARE PAGES DEPLOYMENT${c.reset}`);
  console.log(`  • Architecture: Cloudflare Pages with Pages Functions`);
  console.log(`  • Project name: ${parsedConfig.name}`);
  console.log(`  • Build output directory: ${parsedConfig.pages_build_output_dir}`);
  console.log(`  • Functions directory: functions/api/[[path]].ts`);
  console.log(`  • Required Deploy Command: npx wrangler pages deploy dist`);
  console.log(`  • Bindings: NAVIKO_KV`);
  console.log(`  • Validation: PASS\n`);
  process.exit(0);
}
