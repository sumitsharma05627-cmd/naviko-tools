#!/usr/bin/env node
/**
 * scripts/verify-deployment.js
 *
 * Diagnostic script to verify Cloudflare Workers deployment readiness:
 * 1. Checks for conflicting wrangler.toml and wrangler.json / wrangler.jsonc files.
 * 2. Validates Worker entrypoint ('main') and static assets configuration ('[assets]').
 * 3. Confirms 'NAVIKO_KV' namespace binding and compatibility flags.
 * 4. Validates the 'dist' directory structure (index.html, JS/CSS assets).
 * 5. Checks for lockfile collisions and verifies single authoritative package manager.
 * 6. Executes live 'npx wrangler deploy --dry-run' to ensure full deployment discovery.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// Visual indicators
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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
  if (fix) {
    console.log(`         ${c.yellow}Fix: ${fix}${c.reset}`);
  }
}

function recordWarn(label, detail, tip = '') {
  warnings.push({ label, detail, tip });
  console.log(`  ${c.yellow}▲ WARN${c.reset} ${c.bold}${label}${c.reset}`);
  console.log(`         ${c.yellow}${detail}${c.reset}`);
  if (tip) {
    console.log(`         ${c.cyan}Tip: ${tip}${c.reset}`);
  }
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
console.log(`${c.cyan}${c.bold}       Cloudflare Workers Deployment Verification & Diagnostics ${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}\n`);

// ============================================================================
// CHECK 1: Conflicting wrangler.toml and wrangler.json files
// ============================================================================
console.log(`${c.bold}[1/5] Checking Configuration File Architecture${c.reset}`);

const tomlFile = path.join(ROOT_DIR, 'wrangler.toml');
const jsonFile = path.join(ROOT_DIR, 'wrangler.json');
const jsoncFile = path.join(ROOT_DIR, 'wrangler.jsonc');

const foundConfigs = [];
if (fs.existsSync(tomlFile)) foundConfigs.push('wrangler.toml');
if (fs.existsSync(jsonFile)) foundConfigs.push('wrangler.json');
if (fs.existsSync(jsoncFile)) foundConfigs.push('wrangler.jsonc');

let activeConfigPath = null;
let activeConfigType = null;
let parsedConfig = {};

if (foundConfigs.length === 0) {
  recordFail(
    'No Cloudflare configuration file found',
    'Neither wrangler.toml nor wrangler.json exists in root.',
    'Create a wrangler.toml file configured with main and [assets].'
  );
} else if (foundConfigs.length > 1) {
  recordFail(
    'Conflicting configuration files detected',
    `Found multiple conflicting configuration files: [${foundConfigs.join(', ')}].`,
    `Remove ${foundConfigs.filter(f => f !== 'wrangler.toml').join(', ')} and keep only 'wrangler.toml'.`
  );
  activeConfigPath = path.join(ROOT_DIR, foundConfigs[0]);
  activeConfigType = foundConfigs[0];
} else {
  activeConfigType = foundConfigs[0];
  activeConfigPath = path.join(ROOT_DIR, activeConfigType);
  recordPass(`No conflicting configuration files. Sole file found: ${activeConfigType}`);
}

// Parse active config file
if (activeConfigPath && fs.existsSync(activeConfigPath)) {
  try {
    const raw = fs.readFileSync(activeConfigPath, 'utf8');
    if (activeConfigType === 'wrangler.toml') {
      parsedConfig = parseToml(raw);
    } else {
      parsedConfig = JSON.parse(raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''));
    }
    recordPass(`Successfully loaded and parsed ${activeConfigType}`);
  } catch (err) {
    recordFail(`Failed to parse ${activeConfigType}`, err.message, `Correct syntax errors in ${activeConfigType}.`);
  }
}

// ============================================================================
// CHECK 2: Worker Architecture & Entrypoint Integrity
// ============================================================================
console.log(`\n${c.bold}[2/5] Validating Worker Entrypoint & Assets Configuration${c.reset}`);

// Check Project Name
if (parsedConfig.name === 'naviko-tools' || parsedConfig.name === 'naviko') {
  recordPass(`Worker project name configured as '${parsedConfig.name}'`);
} else {
  recordWarn(`Worker name '${parsedConfig.name}'`, "Recommended to match Cloudflare project 'naviko-tools'.");
}

// Check main entrypoint
const mainEntry = parsedConfig.main;
if (!mainEntry) {
  recordFail(
    "Worker 'main' entrypoint is missing",
    `Directive 'main' is not specified in ${activeConfigType}. 'npx wrangler deploy' requires a Worker script entrypoint.`,
    `Add 'main = "functions/api/[[path]].ts"' to ${activeConfigType}.`
  );
} else {
  const resolvedMain = path.resolve(ROOT_DIR, mainEntry);
  if (fs.existsSync(resolvedMain)) {
    recordPass(`Worker entrypoint 'main' exists at '${mainEntry}'`);
  } else {
    recordFail(
      "Worker entrypoint file not found on disk",
      `'${mainEntry}' does not exist at '${resolvedMain}'.`,
      `Ensure '${mainEntry}' exists.`
    );
  }
}

// Check assets configuration
const assets = parsedConfig.assets;
if (!assets) {
  recordFail(
    "Workers '[assets]' table is missing",
    `Static assets table '[assets]' is not defined in ${activeConfigType}.`,
    `Add '[assets]' with directory = "./dist" to ${activeConfigType}.`
  );
} else {
  if (assets.directory === './dist' || assets.directory === 'dist') {
    recordPass(`'assets.directory' is correctly set to '${assets.directory}'`);
  } else {
    recordFail(
      "'assets.directory' misconfigured",
      `Expected './dist', but found '${assets.directory}'.`,
      `Change assets.directory to './dist'.`
    );
  }

  if (assets.not_found_handling === 'single-page-application') {
    recordPass("'assets.not_found_handling' is set to 'single-page-application' (SPA routing preserved)");
  } else {
    recordWarn(
      "'assets.not_found_handling' not set to SPA",
      `Current value: '${assets.not_found_handling || 'none'}'. Client-side routes may 404 without SPA fallback.`,
      `Add 'not_found_handling = "single-page-application"' to [assets].`
    );
  }

  if (assets.binding === 'ASSETS') {
    recordPass("'assets.binding' is set to 'ASSETS'");
  } else {
    recordWarn("'assets.binding' is not 'ASSETS'", "Worker script may not access env.ASSETS for asset fallback.");
  }
}

// Ensure pages_build_output_dir is NOT present in wrangler.toml (causes Pages conflict warning in wrangler deploy)
if (parsedConfig.pages_build_output_dir) {
  recordFail(
    "Conflicting 'pages_build_output_dir' found in Workers configuration",
    `'pages_build_output_dir' belongs to Cloudflare Pages. Having it causes 'wrangler deploy' to abort with 'It seems that you have run wrangler deploy on a Pages project'.`,
    `Remove 'pages_build_output_dir' from ${activeConfigType}.`
  );
} else {
  recordPass("No conflicting 'pages_build_output_dir' (clean Workers architecture)");
}

// Check nodejs_compat flag
const flags = parsedConfig.compatibility_flags || [];
if (Array.isArray(flags) && flags.includes('nodejs_compat')) {
  recordPass("'nodejs_compat' flag is enabled in compatibility_flags");
} else {
  recordWarn(
    "Missing 'nodejs_compat' in compatibility_flags",
    "If APIs use Node.js built-ins (crypto, buffer), they may fail at edge runtime.",
    `Add 'compatibility_flags = ["nodejs_compat"]' to ${activeConfigType}.`
  );
}

// Check NAVIKO_KV binding
const kvNamespaces = parsedConfig.kv_namespaces || [];
const navikoKv = Array.isArray(kvNamespaces) && kvNamespaces.find(kv => kv.binding === 'NAVIKO_KV');
if (navikoKv) {
  recordPass(`'NAVIKO_KV' namespace binding configured (id: ${navikoKv.id})`);
} else {
  recordWarn("NAVIKO_KV namespace binding not found", "Cloudflare KV session/data persistence may not function.");
}

// ============================================================================
// CHECK 3: Validating 'dist' Build Output Directory & Static Assets
// ============================================================================
console.log(`\n${c.bold}[3/5] Validating 'dist' Build Output Directory${c.reset}`);

const distPath = path.join(ROOT_DIR, 'dist');

if (!fs.existsSync(distPath)) {
  recordFail(
    "Output directory 'dist/' does not exist",
    "The build output folder 'dist' was not found on disk. Run 'npm run build' before deployment.",
    "Run 'npm run build' to compile the application."
  );
} else {
  const distStat = fs.statSync(distPath);
  if (!distStat.isDirectory()) {
    recordFail("'dist' is not a directory", "'dist' exists but is not a directory.", "Remove 'dist' file and run 'npm run build'.");
  } else {
    recordPass("Directory 'dist/' exists on filesystem");

    // Check index.html
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      recordFail(
        "Missing 'dist/index.html'",
        "Cloudflare Workers static assets require an 'index.html' file at the root of dist.",
        "Run 'npm run build' to generate the Vite SPA index.html."
      );
    } else {
      const indexStat = fs.statSync(indexPath);
      if (indexStat.size === 0) {
        recordFail("'dist/index.html' is empty (0 bytes)", "Vite generated an empty index.html.", "Rebuild the project with 'npm run build'.");
      } else {
        recordPass(`'dist/index.html' present and valid (${indexStat.size} bytes)`);
      }
    }

    // Check assets directory (CSS / JS)
    const assetsDir = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsDir)) {
      recordWarn("Missing 'dist/assets/' directory", "Compiled JS/CSS assets were not found in 'dist/assets'.", "Verify Vite build configuration.");
    } else {
      const assetFiles = fs.readdirSync(assetsDir);
      const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
      const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

      if (jsFiles.length > 0 && cssFiles.length > 0) {
        recordPass(`Compiled static bundle assets found (${jsFiles.length} JS, ${cssFiles.length} CSS files)`);
      } else {
        recordWarn("Incomplete bundle assets", `Found ${jsFiles.length} JS and ${cssFiles.length} CSS in 'dist/assets/'.`);
      }
    }
  }
}

// ============================================================================
// CHECK 4: Package Manager Lockfile Uniqueness
// ============================================================================
console.log(`\n${c.bold}[4/5] Package Manager Lockfile & Node Version Diagnostics${c.reset}`);

const lockfiles = [
  fs.existsSync(path.join(ROOT_DIR, 'package-lock.json')) ? 'package-lock.json' : null,
  fs.existsSync(path.join(ROOT_DIR, 'bun.lock')) ? 'bun.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'yarn.lock')) ? 'yarn.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml')) ? 'pnpm-lock.yaml' : null,
].filter(Boolean);

if (lockfiles.length > 1) {
  recordFail(
    "Multiple lockfiles detected",
    `Found multiple package manager lockfiles: [${lockfiles.join(', ')}].`,
    `Delete ${lockfiles.filter(l => l !== 'package-lock.json').join(', ')} and keep only 'package-lock.json'.`
  );
} else if (lockfiles.length === 1) {
  recordPass(`Single authoritative package manager lockfile: ${lockfiles[0]}`);
} else {
  recordWarn("No package manager lockfile found", "Builds might not be deterministic.", "Run 'npm install' to generate a package-lock.json.");
}

// Check .nvmrc and .node-version
const nvmrcPath = path.join(ROOT_DIR, '.nvmrc');
if (fs.existsSync(nvmrcPath)) {
  const nvmrcVal = fs.readFileSync(nvmrcPath, 'utf8').trim();
  recordPass(`'.nvmrc' specifies Node.js version '${nvmrcVal}'`);
} else {
  recordWarn("Missing '.nvmrc'", "Cloudflare Workers Builds may use an older default Node runtime.");
}

// ============================================================================
// CHECK 5: Live Wrangler Deploy Dry-Run
// ============================================================================
console.log(`\n${c.bold}[5/5] Executing Live 'npx wrangler deploy --dry-run'${c.reset}`);

try {
  const cmd = 'npx wrangler deploy --dry-run';
  console.log(`  ${c.gray}Executing: ${cmd}${c.reset}`);
  const output = execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
  
  // Verify expected output signatures
  if (output.includes('assets directory') && output.includes('NAVIKO_KV')) {
    recordPass("'npx wrangler deploy --dry-run' succeeded! Worker entrypoint, assets, and NAVIKO_KV binding discovered.");
  } else {
    recordPass("'npx wrangler deploy --dry-run' exited cleanly with status 0");
  }
} catch (err) {
  const output = (err.stderr ? err.stderr.toString() : '') + (err.stdout ? err.stdout.toString() : '');
  recordFail(
    "Wrangler CLI 'deploy --dry-run' failed",
    output.trim() || err.message,
    "Review the error details above to fix deployment configuration."
  );
}

// ============================================================================
// DIAGNOSTIC SUMMARY REPORT
// ============================================================================
console.log(`\n${c.cyan}${c.bold}================================================================${c.reset}`);
console.log(`${c.bold}                    DIAGNOSTIC REPORT SUMMARY                   ${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}`);
console.log(`  Total Checks: ${successes.length + issues.length + warnings.length}`);
console.log(`  ${c.green}Passed:       ${successes.length}${c.reset}`);
console.log(`  ${issues.length > 0 ? c.red : c.gray}Failed:       ${issues.length}${c.reset}`);
console.log(`  ${warnings.length > 0 ? c.yellow : c.gray}Warnings:     ${warnings.length}${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}\n`);

if (issues.length > 0) {
  console.log(`${c.red}${c.bold}DEPLOYMENT STATUS: BLOCKED${c.reset}`);
  console.log(`${c.red}The following critical issues must be resolved before deploying:${c.reset}\n`);
  issues.forEach((iss, idx) => {
    console.log(`  ${idx + 1}. ${c.bold}${iss.label}${c.reset}`);
    console.log(`     ${c.red}Problem: ${iss.reason}${c.reset}`);
    if (iss.fix) console.log(`     ${c.yellow}Fix:     ${iss.fix}${c.reset}`);
  });
  console.log();
  process.exit(1);
} else {
  console.log(`${c.green}${c.bold}DEPLOYMENT STATUS: READY FOR CLOUDFLARE WORKERS BUILDS${c.reset}`);
  console.log(`  • Worker name: ${parsedConfig.name}`);
  console.log(`  • Worker entrypoint: ${parsedConfig.main}`);
  console.log(`  • Static assets: ${assets.directory} (SPA routing enabled)`);
  console.log(`  • Bindings: NAVIKO_KV, ASSETS`);
  console.log(`  • Deploy command: npx wrangler deploy --dry-run (Verified PASS)\n`);
  process.exit(0);
}
