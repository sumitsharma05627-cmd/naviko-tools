#!/usr/bin/env node
/**
 * scripts/verify-deployment.js
 *
 * Diagnostic script to verify Cloudflare Pages deployment readiness:
 * 1. Checks for conflicting wrangler.toml and wrangler.json / wrangler.jsonc files.
 * 2. Ensures 'pages_build_output_dir' is correctly defined and set to 'dist'.
 * 3. Validates the 'dist' directory structure (index.html, JS/CSS assets, routing files).
 * 4. Checks for conflicting Worker entrypoints (main, [assets], [site]) incompatible with Pages.
 * 5. Checks for lockfile collisions and runs 'wrangler pages project validate'.
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
console.log(`${c.cyan}${c.bold}       Cloudflare Pages Deployment Verification & Diagnostics   ${c.reset}`);
console.log(`${c.cyan}${c.bold}================================================================${c.reset}\n`);

// ============================================================================
// CHECK 1: Conflicting wrangler.toml and wrangler.json files
// ============================================================================
console.log(`${c.bold}[1/4] Checking for Conflicting Configuration Files${c.reset}`);

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
    'Create a wrangler.toml file configured with pages_build_output_dir = "dist".'
  );
} else if (foundConfigs.length > 1) {
  recordFail(
    'Conflicting configuration files detected',
    `Found multiple conflicting configuration files: [${foundConfigs.join(', ')}]. Cloudflare Pages and Wrangler CLI can exhibit non-deterministic behavior or fail builds when multiple config formats co-exist.`,
    `Remove ${foundConfigs.filter(f => f !== 'wrangler.toml').join(', ')} and keep only 'wrangler.toml' as the single source of truth.`
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
// CHECK 2: 'pages_build_output_dir' and Worker Entrypoint Conflict Analysis
// ============================================================================
console.log(`\n${c.bold}[2/4] Validating 'pages_build_output_dir' & Architecture Integrity${c.reset}`);

const buildOutputDir = parsedConfig.pages_build_output_dir;

if (!buildOutputDir) {
  recordFail(
    "'pages_build_output_dir' is missing",
    `Directive 'pages_build_output_dir' is not specified in ${activeConfigType || 'config'}. Cloudflare Pages requires this directive to locate the static web assets.`,
    `Add 'pages_build_output_dir = "dist"' to ${activeConfigType || 'wrangler.toml'}.`
  );
} else {
  const normalized = String(buildOutputDir).replace(/^\.\//, '').replace(/\/+$/, '');
  if (normalized === 'dist') {
    recordPass(`'pages_build_output_dir' is correctly set to '${buildOutputDir}'`);
  } else {
    recordFail(
      `'pages_build_output_dir' misconfigured`,
      `Expected 'dist', but found '${buildOutputDir}'. Vite builds into 'dist', so Pages will fail to locate assets.`,
      `Change 'pages_build_output_dir' to 'dist' in ${activeConfigType}.`
    );
  }
}

// Ensure no conflicting Worker entrypoints exist (main, site, assets)
if (parsedConfig.main) {
  recordFail(
    "Worker entrypoint 'main' conflicts with Pages static architecture",
    `Found 'main = "${parsedConfig.main}"' in ${activeConfigType}. Cloudflare Pages projects serve dynamic API endpoints via the 'functions/' directory. Defining 'main' forces Wrangler to treat the project as a Cloudflare Worker, bypassing static page deployment and causing routing failures.`,
    `Remove 'main' from ${activeConfigType}. Serverless edge routes must be placed in 'functions/api/'.`
  );
} else {
  recordPass("No conflicting 'main' Worker entrypoint present (clean Pages architecture)");
}

if (parsedConfig.assets) {
  recordFail(
    "Worker 'assets' block conflicts with Pages",
    `Found 'assets' in ${activeConfigType}. This is for Cloudflare Workers, not Cloudflare Pages.`,
    `Remove the '[assets]' block and retain 'pages_build_output_dir = "dist"'.`
  );
} else {
  recordPass("No conflicting Workers '[assets]' directive");
}

if (parsedConfig.site) {
  recordFail(
    "Legacy Workers Sites '[site]' block conflicts with Pages",
    `Found '[site]' in ${activeConfigType}.`,
    `Remove '[site]' from ${activeConfigType}.`
  );
} else {
  recordPass("No legacy Workers Sites '[site]' directive");
}

// Check nodejs_compat flag
const flags = parsedConfig.compatibility_flags || [];
if (Array.isArray(flags) && flags.includes('nodejs_compat')) {
  recordPass("'nodejs_compat' flag is enabled in compatibility_flags");
} else {
  recordWarn(
    "Missing 'nodejs_compat' in compatibility_flags",
    "If your Pages Functions use Node.js built-in APIs (crypto, buffer, stream), they may fail at edge runtime.",
    `Add 'compatibility_flags = ["nodejs_compat"]' to ${activeConfigType}.`
  );
}

// ============================================================================
// CHECK 3: Validating 'dist' Output Directory & Static Assets
// ============================================================================
console.log(`\n${c.bold}[3/4] Validating 'dist' Build Output Directory${c.reset}`);

const distPath = path.join(ROOT_DIR, 'dist');

if (!fs.existsSync(distPath)) {
  recordFail(
    "Output directory 'dist/' does not exist",
    "The build output folder 'dist' was not found on disk. Cloudflare Pages cannot deploy without built assets.",
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
        "Cloudflare Pages SPA serving requires an 'index.html' file at the root of the output directory.",
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

    // Check critical Cloudflare Pages control files
    const controlFiles = [
      { name: '_routes.json', critical: true, desc: 'API / Static edge routing rules' },
      { name: '_headers', critical: false, desc: 'Security headers & caching policies' },
      { name: '_redirects', critical: false, desc: 'SPA fallback redirects' },
    ];

    for (const file of controlFiles) {
      const filePath = path.join(distPath, file.name);
      if (fs.existsSync(filePath)) {
        recordPass(`Pages control file 'dist/${file.name}' present (${file.desc})`);
      } else {
        if (file.critical) {
          recordWarn(`Missing 'dist/${file.name}'`, `Pages will use default routing behavior.`, `Place ${file.name} in public/ so Vite copies it to dist/.`);
        }
      }
    }
  }
}

// ============================================================================
// CHECK 4: Functions & Live Wrangler Project Validation
// ============================================================================
console.log(`\n${c.bold}[4/4] Live Cloudflare Pages & Lockfile Diagnostics${c.reset}`);

// Check package manager lockfile uniqueness
const lockfiles = [
  fs.existsSync(path.join(ROOT_DIR, 'package-lock.json')) ? 'package-lock.json' : null,
  fs.existsSync(path.join(ROOT_DIR, 'bun.lock')) ? 'bun.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'yarn.lock')) ? 'yarn.lock' : null,
  fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml')) ? 'pnpm-lock.yaml' : null,
].filter(Boolean);

if (lockfiles.length > 1) {
  recordFail(
    "Multiple lockfiles detected (causes Cloudflare build image failures)",
    `Found multiple package manager lockfiles: [${lockfiles.join(', ')}]. Cloudflare Pages auto-detects package managers based on lockfiles, leading to failed builds.`,
    `Delete ${lockfiles.filter(l => l !== 'package-lock.json').join(', ')} and keep only 'package-lock.json'.`
  );
} else if (lockfiles.length === 1) {
  recordPass(`Single authoritative package manager lockfile: ${lockfiles[0]}`);
} else {
  recordWarn("No package manager lockfile found", "Builds might not be deterministic.", "Run 'npm install' to generate a package-lock.json.");
}

// Check Pages Functions
const functionsApi = path.join(ROOT_DIR, 'functions', 'api', '[[path]].ts');
if (fs.existsSync(functionsApi)) {
  recordPass("Cloudflare Pages Functions API entrypoint found at functions/api/[[path]].ts");
} else {
  recordWarn("functions/api/[[path]].ts not found", "Dynamic API endpoints may not be served at edge.");
}

// Run wrangler pages project validate
if (fs.existsSync(distPath)) {
  try {
    const cmd = 'npx wrangler pages project validate dist';
    console.log(`  ${c.gray}Executing: ${cmd}${c.reset}`);
    execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' });
    recordPass("'npx wrangler pages project validate dist' exited cleanly with status 0");
  } catch (err) {
    const output = (err.stderr ? err.stderr.toString() : '') + (err.stdout ? err.stdout.toString() : '');
    recordFail(
      "Wrangler CLI 'pages project validate dist' failed",
      output.trim() || err.message,
      "Review the error details above to fix static asset validation issues."
    );
  }
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
  console.log(`${c.green}${c.bold}DEPLOYMENT STATUS: READY FOR CLOUDFLARE PAGES${c.reset}`);
  console.log(`  • Configuration file: ${activeConfigType} (no conflicting files)`);
  console.log(`  • pages_build_output_dir: dist (valid)`);
  console.log(`  • Worker conflicts: None (clean static + functions architecture)`);
  console.log(`  • Static output: dist/index.html and assets verified`);
  console.log(`  • Cloudflare project validation: Passed\n`);
  process.exit(0);
}
