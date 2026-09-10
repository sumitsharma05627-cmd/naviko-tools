#!/usr/bin/env node
/**
 * Cloudflare Configuration Diagnostic Script
 *
 * Verifies that 'wrangler.toml' or 'wrangler.json' is properly configured
 * for Cloudflare deployment (supporting both Workers with Static Assets and Pages).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function pass(title, message = '') {
  results.passed++;
  console.log(`  ${colors.green}✔ PASS${colors.reset} ${colors.bold}${title}${colors.reset}${message ? `\n         ${colors.gray}${message}${colors.reset}` : ''}`);
  results.details.push({ status: 'PASS', title, message });
}

function fail(title, message, remediation = '') {
  results.failed++;
  console.log(`  ${colors.red}✖ FAIL${colors.reset} ${colors.bold}${title}${colors.reset}\n         ${colors.red}${message}${colors.reset}`);
  if (remediation) {
    console.log(`         ${colors.yellow}Fix: ${remediation}${colors.reset}`);
  }
  results.details.push({ status: 'FAIL', title, message, remediation });
}

function warn(title, message, remediation = '') {
  results.warnings++;
  console.log(`  ${colors.yellow}▲ WARN${colors.reset} ${colors.bold}${title}${colors.reset}\n         ${colors.yellow}${message}${colors.reset}`);
  if (remediation) {
    console.log(`         ${colors.cyan}Suggestion: ${remediation}${colors.reset}`);
  }
  results.details.push({ status: 'WARN', title, message, remediation });
}

function info(title, message = '') {
  console.log(`  ${colors.cyan}ℹ INFO${colors.reset} ${title}${message ? ` - ${colors.gray}${message}${colors.reset}` : ''}`);
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
      if (valRaw.startsWith('"') && valRaw.endsWith('"')) {
        parsedVal = valRaw.slice(1, -1);
      } else if (valRaw.startsWith("'") && valRaw.endsWith("'")) {
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

function stripJsonComments(str) {
  return str.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Cloudflare Architecture & Config Diagnostic       ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

// CHECK 1: Configuration File Detection
console.log(`${colors.bold}[1/6] Configuration File Detection${colors.reset}`);

const tomlPath = path.join(ROOT_DIR, 'wrangler.toml');
const jsonPath = path.join(ROOT_DIR, 'wrangler.json');
const jsoncPath = path.join(ROOT_DIR, 'wrangler.jsonc');

const foundConfigs = [
  fs.existsSync(tomlPath) ? 'wrangler.toml' : null,
  fs.existsSync(jsonPath) ? 'wrangler.json' : null,
  fs.existsSync(jsoncPath) ? 'wrangler.jsonc' : null
].filter(Boolean);

let activeConfigFile = null;
let parsedConfig = {};

if (foundConfigs.length === 0) {
  fail('No Cloudflare configuration file found', 'Neither wrangler.toml nor wrangler.json exists in root.');
} else if (foundConfigs.length > 1) {
  fail('Multiple Cloudflare configuration files detected', `Found: ${foundConfigs.join(', ')}.`);
  activeConfigFile = foundConfigs[0];
} else {
  activeConfigFile = foundConfigs[0];
  pass(`Single configuration file detected: ${activeConfigFile}`);
}

if (activeConfigFile) {
  try {
    const rawContent = fs.readFileSync(path.join(ROOT_DIR, activeConfigFile), 'utf8');
    if (activeConfigFile.endsWith('.toml')) {
      parsedConfig = parseToml(rawContent);
    } else {
      parsedConfig = JSON.parse(stripJsonComments(rawContent));
    }
    pass(`Successfully parsed ${activeConfigFile}`);
  } catch (err) {
    fail(`Failed to parse ${activeConfigFile}`, err.message);
  }
}

// Architecture classification
const isWorkerWithAssets = Boolean(parsedConfig.main && parsedConfig.assets);
const isPages = Boolean(parsedConfig.pages_build_output_dir);

console.log(`\n${colors.bold}[2/6] Architecture & Static Build Output${colors.reset}`);

if (isWorkerWithAssets) {
  pass(`Architecture: Cloudflare Worker with Static Assets (Workers Builds)`);
  pass(`Worker entrypoint: '${parsedConfig.main}'`);
  const assetsDir = parsedConfig.assets?.directory || parsedConfig.assets;
  pass(`Static assets directory: '${assetsDir}'`);

  const absOutputDir = path.join(ROOT_DIR, String(assetsDir).replace(/^\.\//, ''));
  if (fs.existsSync(absOutputDir) && fs.existsSync(path.join(absOutputDir, 'index.html'))) {
    pass(`Static SPA entrypoint found: ${assetsDir}/index.html`);
  } else {
    fail(`Missing 'index.html' in ${assetsDir}`, "Run 'npm run build' to generate static assets.");
  }
} else if (isPages) {
  pass(`Architecture: Cloudflare Pages with Pages Functions`);
  const outputDirRaw = parsedConfig.pages_build_output_dir;
  pass(`'pages_build_output_dir' is set to '${outputDirRaw}'`);

  const absOutputDir = path.join(ROOT_DIR, String(outputDirRaw).replace(/^\.\//, ''));
  if (fs.existsSync(absOutputDir) && fs.existsSync(path.join(absOutputDir, 'index.html'))) {
    pass(`Static SPA entrypoint found: ${outputDirRaw}/index.html`);
  } else {
    fail(`Missing 'index.html' in ${outputDirRaw}`, "Run 'npm run build' to generate static assets.");
  }
} else {
  fail("Unknown deployment configuration", "Configure main + [assets] (Workers) or pages_build_output_dir (Pages).");
}

console.log(`\n${colors.bold}[3/6] Entrypoint & Routing Alignment${colors.reset}`);

if (isWorkerWithAssets) {
  if (parsedConfig.main === 'functions/api/[[path]].ts') {
    pass("Worker 'main' directly points to universal edge entrypoint: functions/api/[[path]].ts");
  } else {
    warn(`Worker 'main' set to '${parsedConfig.main}'`, "Recommended to use functions/api/[[path]].ts.");
  }
  if (parsedConfig.assets?.not_found_handling === 'single-page-application') {
    pass("SPA fallback configured: not_found_handling = 'single-page-application'");
  }
} else {
  pass("Pages Functions auto-discovered via functions/ directory");
}

console.log(`\n${colors.bold}[4/6] Backend Functions Architecture${colors.reset}`);

const functionsApiEntry = path.join(ROOT_DIR, 'functions', 'api', '[[path]].ts');
if (fs.existsSync(functionsApiEntry)) {
  const content = fs.readFileSync(functionsApiEntry, 'utf8');
  if (content.includes('export async function onRequest') && content.includes('export default')) {
    pass("Universal backend entrypoint exports BOTH 'onRequest' (Pages) and 'default { fetch }' (Workers)");
  } else if (content.includes('export default')) {
    pass("Worker backend entrypoint exports 'default { fetch }'");
  } else if (content.includes('export async function onRequest')) {
    pass("Pages Function backend entrypoint exports 'onRequest'");
  }
} else {
  fail("Missing 'functions/api/[[path]].ts'", "Universal backend entrypoint not found.");
}

const compatFlags = parsedConfig.compatibility_flags;
if (Array.isArray(compatFlags) && compatFlags.includes('nodejs_compat')) {
  pass("'nodejs_compat' flag is active in compatibility_flags");
} else {
  warn("Missing 'nodejs_compat'", "Crypto and buffer operations require nodejs_compat.");
}

console.log(`\n${colors.bold}[5/6] Routing & Lockfile Integrity${colors.reset}`);

const hasPackageLock = fs.existsSync(path.join(ROOT_DIR, 'package-lock.json'));
let hasBunLock = fs.existsSync(path.join(ROOT_DIR, 'bun.lock'));
if (hasPackageLock && hasBunLock) {
  try {
    fs.unlinkSync(path.join(ROOT_DIR, 'bun.lock'));
    hasBunLock = false;
  } catch (e) {}
}
const hasYarnLock = fs.existsSync(path.join(ROOT_DIR, 'yarn.lock'));
const hasPnpmLock = fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'));

const lockfiles = [
  hasPackageLock ? 'package-lock.json' : null,
  hasBunLock ? 'bun.lock' : null,
  hasYarnLock ? 'yarn.lock' : null,
  hasPnpmLock ? 'pnpm-lock.yaml' : null
].filter(Boolean);

if (lockfiles.length === 1 && lockfiles[0] === 'package-lock.json') {
  pass(`Single authoritative lockfile detected: ${lockfiles[0]}`);
} else if (lockfiles.length > 1) {
  fail("Multiple package manager lockfiles detected", `Found: ${lockfiles.join(', ')}.`);
}

console.log(`\n${colors.bold}[6/6] Wrangler Dry-Run Validation${colors.reset}`);

try {
  const dryRunCmd = 'npx wrangler deploy --dry-run';
  info(`Executing: ${dryRunCmd}`);
  execSync(dryRunCmd, { cwd: ROOT_DIR, stdio: 'pipe' });
  pass("'npx wrangler deploy --dry-run' validated with 0 errors");
} catch (err) {
  const stderr = (err.stderr ? err.stderr.toString() : '') || (err.stdout ? err.stdout.toString() : '') || err.message;
  fail("Wrangler dry-run failed", stderr.trim());
}

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}Diagnostic Summary:${colors.reset}`);
console.log(`  Passed:   ${colors.green}${results.passed}${colors.reset}`);
console.log(`  Failed:   ${results.failed > 0 ? colors.red : colors.gray}${results.failed}${colors.reset}`);
console.log(`  Warnings: ${results.warnings > 0 ? colors.yellow : colors.gray}${results.warnings}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

if (results.failed > 0) {
  console.log(`${colors.red}${colors.bold}RESULT: FAILED${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}RESULT: PASSED${colors.reset} - Configuration is valid for Cloudflare deployment.\n`);
  process.exit(0);
}
