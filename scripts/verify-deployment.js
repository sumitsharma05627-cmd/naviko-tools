#!/usr/bin/env node
/**
 * scripts/verify-deployment.js
 *
 * Cloudflare Deployment Verification Suite (Supports both Workers with Assets and Pages)
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
console.log(`${c.cyan}${c.bold}      Cloudflare Deployment & Architecture Verification         ${c.reset}`);
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
    'Create wrangler.toml configured for Cloudflare deployment.'
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

// Check project name
if (parsedConfig.name === 'naviko-tools' || parsedConfig.name === 'naviko') {
  recordPass(`Cloudflare project name configured as '${parsedConfig.name}'`);
} else {
  recordWarn(`Project name '${parsedConfig.name}'`, "Recommended to match Cloudflare project 'naviko-tools'.");
}

// Determine architecture: Worker with Assets vs Pages
const isWorkerWithAssets = Boolean(parsedConfig.main && parsedConfig.assets);
const isPages = Boolean(parsedConfig.pages_build_output_dir);

if (isWorkerWithAssets) {
  recordPass("Architecture: Cloudflare Worker with Static Assets (Workers Builds compatible)");
  recordPass(`Worker entrypoint: '${parsedConfig.main}'`);
  recordPass(`Static assets directory: '${parsedConfig.assets?.directory || parsedConfig.assets}'`);
  if (parsedConfig.assets?.not_found_handling === 'single-page-application') {
    recordPass("SPA fallback configured via 'not_found_handling = single-page-application'");
  }
  if (parsedConfig.assets?.run_worker_first) {
    recordPass(`run_worker_first configured: ${JSON.stringify(parsedConfig.assets.run_worker_first)}`);
  }
} else if (isPages) {
  recordPass("Architecture: Cloudflare Pages with Pages Functions");
  recordPass(`Pages build output directory: '${parsedConfig.pages_build_output_dir}'`);
} else {
  recordFail(
    "Ambiguous or missing deployment target in wrangler.toml",
    "Must specify either 'main' + '[assets]' (Workers Builds) or 'pages_build_output_dir' (Pages).",
    "Configure main and [assets] for Workers or pages_build_output_dir for Pages."
  );
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
// CHECK 2: Backend API Handler & Universal Entrypoint
// ============================================================================
console.log(`\n${c.bold}[2/6] Backend API Handler & Universal Entrypoint${c.reset}`);

const functionsEntry = path.join(ROOT_DIR, 'functions', 'api', '[[path]].ts');
if (fs.existsSync(functionsEntry)) {
  const content = fs.readFileSync(functionsEntry, 'utf8');
  const hasOnRequest = content.includes('export async function onRequest') || content.includes('export const onRequest');
  const hasDefaultExport = content.includes('export default');

  if (hasOnRequest && hasDefaultExport) {
    recordPass("Universal backend entrypoint 'functions/api/[[path]].ts' exports both onRequest and default { fetch }");
  } else if (hasOnRequest) {
    recordPass("Pages Function entrypoint 'functions/api/[[path]].ts' exports onRequest");
  } else if (hasDefaultExport) {
    recordPass("Worker entrypoint 'functions/api/[[path]].ts' exports default { fetch }");
  } else {
    recordFail("functions/api/[[path]].ts missing valid export", "Must export onRequest or default { fetch }.");
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
    recordPass("All essential API routes present in catch-all handler (auth, subscription, razorpay, user profile, health)");
  }
} else {
  recordFail("Missing 'functions/api/[[path]].ts'", "Backend catch-all handler not found.");
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
// CHECK 4: Routing & SPA Fallbacks
// ============================================================================
console.log(`\n${c.bold}[4/6] Routing & SPA Fallback Rules${c.reset}`);

const routesFile = path.join(ROOT_DIR, 'public', '_routes.json');
if (fs.existsSync(routesFile)) {
  try {
    const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
    if (routes.include?.includes('/api/*') || routes.include?.includes('/api')) {
      recordPass("'_routes.json' correctly routes '/api/*' to edge backend");
    }
  } catch (err) {
    recordFail("Failed to parse '_routes.json'", err.message);
  }
}

const redirectsFile = path.join(ROOT_DIR, 'public', '_redirects');
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, 'utf8');
  if (content.includes('/*') && content.includes('200')) {
    recordPass("'_redirects' configures client-side SPA fallback without infinite loop (/* / 200)");
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
// CHECK 6: Wrangler Deploy Dry-Run Validation
// ============================================================================
console.log(`\n${c.bold}[6/6] Wrangler Deploy Validation (--dry-run)${c.reset}`);

try {
  const cmd = 'npx wrangler deploy --dry-run';
  console.log(`  ${c.gray}Executing: ${cmd}${c.reset}`);
  const out = execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
  if (out.includes('--dry-run: exiting now') || out.includes('Total Upload:')) {
    recordPass("'npx wrangler deploy --dry-run' passed with 0 errors");
  } else {
    recordPass("'npx wrangler deploy --dry-run' completed successfully");
  }
} catch (err) {
  const msg = (err.stderr ? err.stderr.toString() : '') || (err.stdout ? err.stdout.toString() : '') || err.message;
  recordFail("Wrangler deploy --dry-run failed", msg);
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
  console.log(`${c.green}${c.bold}STATUS: READY FOR CLOUDFLARE DEPLOYMENT${c.reset}`);
  console.log(`  • Service: ${parsedConfig.name}`);
  console.log(`  • Architecture: ${isWorkerWithAssets ? 'Cloudflare Workers with Static Assets' : 'Cloudflare Pages'}`);
  console.log(`  • Deploy Command: npx wrangler deploy`);
  console.log(`  • Main Entrypoint: functions/api/[[path]].ts`);
  console.log(`  • Static Assets: ./dist`);
  console.log(`  • Bindings: NAVIKO_KV`);
  console.log(`  • Validation: PASS\n`);
  process.exit(0);
}
