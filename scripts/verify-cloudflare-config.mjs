#!/usr/bin/env node
/**
 * Cloudflare Pages Configuration Diagnostic Script
 *
 * Verifies that 'wrangler.toml' or 'wrangler.json' is properly configured
 * for the Cloudflare Pages static + functions architecture:
 * 1. Ensures 'pages_build_output_dir' is explicitly set to 'dist'.
 * 2. Ensures no Worker entrypoint ('main', '[site]', or '[assets]') conflicts
 *    with Cloudflare Pages static hosting.
 * 3. Validates Pages Functions structure in 'functions/'.
 * 4. Validates routing rules in '_routes.json'.
 * 5. Validates package manager lockfile uniqueness to prevent Cloudflare build image collisions.
 * 6. Executes 'wrangler pages project validate' against the build output directory.
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

/**
 * Basic TOML Parser for wrangler.toml
 */
function parseToml(content) {
  const config = {};
  let currentSection = null;
  let currentArraySection = null;

  const lines = content.split(/\r?\n/);

  for (let rawLine of lines) {
    const line = rawLine.trim();

    // Skip blank lines and comments
    if (!line || line.startsWith('#')) continue;

    // Array of tables: [[section]]
    const arrayTableMatch = line.match(/^\[\[\s*([a-zA-Z0-9_.-]+)\s*\]\]$/);
    if (arrayTableMatch) {
      const sectionName = arrayTableMatch[1];
      currentSection = null;
      if (!config[sectionName]) {
        config[sectionName] = [];
      }
      const newObj = {};
      config[sectionName].push(newObj);
      currentArraySection = newObj;
      continue;
    }

    // Table: [section]
    const tableMatch = line.match(/^\[\s*([a-zA-Z0-9_.-]+)\s*\]$/);
    if (tableMatch) {
      const sectionName = tableMatch[1];
      currentArraySection = null;
      if (!config[sectionName]) {
        config[sectionName] = {};
      }
      currentSection = config[sectionName];
      continue;
    }

    // Key-Value: key = value
    const kvMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let valRaw = kvMatch[2].trim();

      // Remove trailing comments if any
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
          parsedVal = valRaw
            .slice(1, -1)
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
      } else if (valRaw === 'true') {
        parsedVal = true;
      } else if (valRaw === 'false') {
        parsedVal = false;
      } else if (!isNaN(Number(valRaw))) {
        parsedVal = Number(valRaw);
      } else {
        parsedVal = valRaw;
      }

      const target = currentArraySection || currentSection || config;
      target[key] = parsedVal;
    }
  }

  return config;
}

/**
 * Strips JSON comments (JSONC support)
 */
function stripJsonComments(str) {
  return str.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Cloudflare Pages Architecture & Config Diagnostic ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

// -------------------------------------------------------------
// CHECK 1: Configuration File Discovery & Collision Detection
// -------------------------------------------------------------
console.log(`${colors.bold}[1/6] Configuration File Detection${colors.reset}`);

const tomlPath = path.join(ROOT_DIR, 'wrangler.toml');
const jsonPath = path.join(ROOT_DIR, 'wrangler.json');
const jsoncPath = path.join(ROOT_DIR, 'wrangler.jsonc');

const hasToml = fs.existsSync(tomlPath);
const hasJson = fs.existsSync(jsonPath);
const hasJsonc = fs.existsSync(jsoncPath);

const foundConfigs = [
  hasToml ? 'wrangler.toml' : null,
  hasJson ? 'wrangler.json' : null,
  hasJsonc ? 'wrangler.jsonc' : null
].filter(Boolean);

let activeConfigFile = null;
let parsedConfig = {};

if (foundConfigs.length === 0) {
  fail(
    'No Cloudflare configuration file found',
    'Neither wrangler.toml nor wrangler.json exists in the project root.',
    'Create a wrangler.toml containing pages_build_output_dir = "dist".'
  );
} else if (foundConfigs.length > 1) {
  fail(
    'Multiple Cloudflare configuration files detected',
    `Found multiple conflicting configuration files: ${foundConfigs.join(', ')}. Wrangler will encounter ambiguity or emit build warnings.`,
    `Keep only one configuration file. Standardize on wrangler.toml and delete ${foundConfigs.filter(f => f !== 'wrangler.toml').join(', ')}.`
  );
  activeConfigFile = foundConfigs[0];
} else {
  activeConfigFile = foundConfigs[0];
  pass(`Single configuration file detected: ${activeConfigFile}`);
}

// Parse configuration
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
    fail(`Failed to parse ${activeConfigFile}`, err.message, `Fix syntax errors in ${activeConfigFile}.`);
  }
}

// -------------------------------------------------------------
// CHECK 2: pages_build_output_dir Verification
// -------------------------------------------------------------
console.log(`\n${colors.bold}[2/6] Pages Build Output Directory Verification${colors.reset}`);

const outputDirRaw = parsedConfig.pages_build_output_dir;

if (!outputDirRaw) {
  fail(
    "'pages_build_output_dir' is missing",
    `'pages_build_output_dir' is not set in ${activeConfigFile}. Cloudflare Pages requires this directive to identify static assets. Without it, Wrangler treats the file as a Worker configuration.`,
    `Add 'pages_build_output_dir = "dist"' to ${activeConfigFile}.`
  );
} else {
  // Normalize path (strip ./ and trailing slashes)
  const normalizedOutputDir = outputDirRaw.replace(/^\.\//, '').replace(/\/+$/, '');

  if (normalizedOutputDir !== 'dist') {
    fail(
      `'pages_build_output_dir' points to '${outputDirRaw}'`,
      `Expected 'dist', but found '${outputDirRaw}'. Vite and esbuild are configured to output to 'dist'.`,
      `Set pages_build_output_dir = "dist" in ${activeConfigFile}.`
    );
  } else {
    pass(`'pages_build_output_dir' is correctly set to '${outputDirRaw}'`);
  }

  // Verify that the build output directory actually exists
  const absOutputDir = path.join(ROOT_DIR, normalizedOutputDir);
  if (!fs.existsSync(absOutputDir)) {
    warn(
      `Build output directory '${normalizedOutputDir}' does not exist on disk`,
      'The directory has not been created yet or needs to be rebuilt.',
      'Run `npm run build` to generate the static assets in dist/.'
    );
  } else {
    pass(`Directory '${normalizedOutputDir}/' exists on filesystem`);

    // Verify index.html in output directory
    const indexPath = path.join(absOutputDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      pass(`Static SPA entrypoint found: ${normalizedOutputDir}/index.html`);
    } else {
      fail(
        `Missing 'index.html' in ${normalizedOutputDir}/`,
        `Cloudflare Pages SPA serving requires an index.html file in '${normalizedOutputDir}'.`,
        'Run `npm run build` to build your Vite frontend.'
      );
    }
  }
}

// -------------------------------------------------------------
// CHECK 3: Worker Entrypoint Conflict Analysis
// -------------------------------------------------------------
console.log(`\n${colors.bold}[3/6] Cloudflare Worker Entrypoint Conflict Analysis${colors.reset}`);

/**
 * Cloudflare Pages architecture rules:
 * - Pages uses `functions/` for serverless API endpoints.
 * - Pages serves static files from `pages_build_output_dir`.
 * - Specifying a Worker `main` entrypoint (e.g. `main = "server.ts"` or `main = "dist/server.cjs"`)
 *   causes Wrangler to treat the project as a Cloudflare Worker instead of Cloudflare Pages,
 *   which breaks static asset serving and causes conflicting upload behavior.
 * - Similarly, legacy `[site]` or Workers `[assets]` can collide with Pages.
 */

let workerConflictFound = false;

// Check 'main' entrypoint
if (parsedConfig.main !== undefined) {
  workerConflictFound = true;
  fail(
    "Conflicting Worker entrypoint 'main' found",
    `Found 'main = "${parsedConfig.main}"' in ${activeConfigFile}. In Cloudflare Pages, backend logic is managed exclusively via the 'functions/' directory. Specifying 'main' converts the project into a Cloudflare Worker and conflicts with the Pages static build architecture.`,
    `Remove 'main' from ${activeConfigFile}. Keep server.ts for Node.js/Docker and use functions/api/[[path]].ts for Cloudflare Pages.`
  );
} else {
  pass("No conflicting 'main' Worker entrypoint specified (Pages mode enforced)");
}

// Check Workers Assets syntax: [assets] or assets.directory
if (parsedConfig.assets !== undefined) {
  workerConflictFound = true;
  fail(
    "Conflicting Workers Assets '[assets]' configuration found",
    `Found 'assets' in ${activeConfigFile}. This is Cloudflare Workers Assets syntax, which conflicts with Cloudflare Pages 'pages_build_output_dir'.`,
    `Remove the '[assets]' block and retain only 'pages_build_output_dir = "dist"'.`
  );
} else {
  pass("No conflicting Workers Assets '[assets]' directive present");
}

// Check legacy Workers Sites syntax: [site]
if (parsedConfig.site !== undefined) {
  workerConflictFound = true;
  fail(
    "Conflicting legacy Workers Sites '[site]' configuration found",
    `Found '[site]' in ${activeConfigFile}. Workers Sites is incompatible with Cloudflare Pages.`,
    `Remove the '[site]' block.`
  );
} else {
  pass("No conflicting legacy Workers Sites '[site]' directive present");
}

// Check for worker-only flags
if (parsedConfig.workers_dev !== undefined) {
  warn(
    "Worker-specific flag 'workers_dev' found",
    "'workers_dev' has no effect in Cloudflare Pages and indicates a Worker config file.",
    `Remove 'workers_dev' from ${activeConfigFile}.`
  );
}

// -------------------------------------------------------------
// CHECK 4: Cloudflare Pages Functions Architecture
// -------------------------------------------------------------
console.log(`\n${colors.bold}[4/6] Pages Functions Architecture Validation${colors.reset}`);

const functionsDir = path.join(ROOT_DIR, 'functions');
const functionsApiEntry = path.join(ROOT_DIR, 'functions', 'api', '[[path]].ts');
const functionsApiJsEntry = path.join(ROOT_DIR, 'functions', 'api', '[[path]].js');

if (!fs.existsSync(functionsDir)) {
  warn(
    "No 'functions/' directory found",
    "Cloudflare Pages Functions are not present. Only static files will be served.",
    "Create a 'functions/' directory if API routes are required."
  );
} else {
  pass("'functions/' directory found for serverless edge routing");

  if (fs.existsSync(functionsApiEntry) || fs.existsSync(functionsApiJsEntry)) {
    const entryFile = fs.existsSync(functionsApiEntry) ? 'functions/api/[[path]].ts' : 'functions/api/[[path]].js';
    pass(`Catch-all Pages Functions API entrypoint found: ${entryFile}`);
  } else {
    info("Custom Functions routes detected in 'functions/'");
  }

  // Check compatibility flags for Node.js modules
  const compatFlags = parsedConfig.compatibility_flags;
  const hasNodeCompat = Array.isArray(compatFlags) && compatFlags.includes('nodejs_compat');

  if (hasNodeCompat) {
    pass("'nodejs_compat' flag is active in compatibility_flags");
  } else {
    warn(
      "Missing 'nodejs_compat' compatibility flag",
      "Functions using Node.js built-ins (e.g., node:crypto) require 'nodejs_compat'.",
      `Add 'compatibility_flags = ["nodejs_compat"]' to ${activeConfigFile}.`
    );
  }

  if (parsedConfig.compatibility_date) {
    pass(`'compatibility_date' is set to: ${parsedConfig.compatibility_date}`);
  } else {
    warn(
      "Missing 'compatibility_date'",
      "Cloudflare recommends specifying a compatibility_date for deterministic Workers runtime behavior.",
      `Add 'compatibility_date = "${new Date().toISOString().split('T')[0]}"' to ${activeConfigFile}.`
    );
  }
}

// -------------------------------------------------------------
// CHECK 5: Routing & Package Manager Integrity
// -------------------------------------------------------------
console.log(`\n${colors.bold}[5/6] Routing & Lockfile Integrity Validation${colors.reset}`);

// 5a. _routes.json validation
const publicRoutesPath = path.join(ROOT_DIR, 'public', '_routes.json');
const distRoutesPath = path.join(ROOT_DIR, 'dist', '_routes.json');
const routesPath = fs.existsSync(publicRoutesPath) ? publicRoutesPath : (fs.existsSync(distRoutesPath) ? distRoutesPath : null);

if (routesPath) {
  try {
    const routesContent = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    if (routesContent.version === 1 && Array.isArray(routesContent.include) && Array.isArray(routesContent.exclude)) {
      pass(`Valid '_routes.json' format (${path.relative(ROOT_DIR, routesPath)})`);
      info(`Routing rules`, `Include: [${routesContent.include.join(', ')}] | Exclude: [${routesContent.exclude.join(', ')}]`);
    } else {
      warn(
        "Invalid '_routes.json' schema",
        "Schema should contain 'version: 1', 'include: []', and 'exclude: []'.",
        "Fix '_routes.json' structure in public/."
      );
    }
  } catch (err) {
    fail("Failed to parse '_routes.json'", err.message, "Ensure public/_routes.json contains valid JSON.");
  }
} else {
  info("No explicit '_routes.json' found", "Pages will route all requests to functions or default fallback.");
}

// 5b. Package manager lockfile check
const hasPackageLock = fs.existsSync(path.join(ROOT_DIR, 'package-lock.json'));
const hasBunLock = fs.existsSync(path.join(ROOT_DIR, 'bun.lock'));
const hasYarnLock = fs.existsSync(path.join(ROOT_DIR, 'yarn.lock'));
const hasPnpmLock = fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'));

const lockfiles = [
  hasPackageLock ? 'package-lock.json' : null,
  hasBunLock ? 'bun.lock' : null,
  hasYarnLock ? 'yarn.lock' : null,
  hasPnpmLock ? 'pnpm-lock.yaml' : null
].filter(Boolean);

if (lockfiles.length > 1) {
  fail(
    "Multiple package manager lockfiles detected",
    `Found multiple lockfiles: ${lockfiles.join(', ')}. Cloudflare Pages build image detection may select the wrong package manager or fail during install.`,
    `Keep only 'package-lock.json' and delete ${lockfiles.filter(l => l !== 'package-lock.json').join(', ')}.`
  );
} else if (lockfiles.length === 1) {
  pass(`Single authoritative lockfile detected: ${lockfiles[0]}`);
} else {
  warn("No lockfile found", "Deployments without a lockfile may experience non-deterministic builds.");
}

// -------------------------------------------------------------
// CHECK 6: Wrangler CLI Dry-Run Project Validation
// -------------------------------------------------------------
console.log(`\n${colors.bold}[6/6] Wrangler Pages Project Validation${colors.reset}`);

const targetValidateDir = parsedConfig.pages_build_output_dir || 'dist';
const normalizedDir = targetValidateDir.replace(/^\.\//, '').replace(/\/+$/, '');

if (fs.existsSync(path.join(ROOT_DIR, normalizedDir))) {
  try {
    // Run wrangler pages project validate
    const validateCmd = `npx wrangler pages project validate ${normalizedDir}`;
    info(`Running: ${validateCmd}`);
    execSync(validateCmd, { cwd: ROOT_DIR, stdio: 'pipe' });
    pass(`'${validateCmd}' succeeded without errors`);
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    fail(
      "Wrangler project validation failed",
      stderr.trim(),
      "Review the error output above to correct Pages project structure issues."
    );
  }
} else {
  info(
    "Skipping 'wrangler pages project validate'",
    `Directory '${normalizedDir}' does not exist yet. Run 'npm run build' first.`
  );
}

// -------------------------------------------------------------
// SUMMARY & EXIT CODE
// -------------------------------------------------------------
console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}Diagnostic Summary:${colors.reset}`);
console.log(`  Passed:   ${colors.green}${results.passed}${colors.reset}`);
console.log(`  Failed:   ${results.failed > 0 ? colors.red : colors.gray}${results.failed}${colors.reset}`);
console.log(`  Warnings: ${results.warnings > 0 ? colors.yellow : colors.gray}${results.warnings}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

if (results.failed > 0) {
  console.log(`${colors.red}${colors.bold}RESULT: FAILED${colors.reset} - ${results.failed} critical issue(s) must be addressed before Cloudflare Pages deployment.\n`);
  process.exit(1);
} else if (results.warnings > 0) {
  console.log(`${colors.green}${colors.bold}RESULT: PASSED (WITH WARNINGS)${colors.reset} - Configuration is valid for Cloudflare Pages static + functions architecture.\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}${colors.bold}RESULT: PASSED${colors.reset} - Configuration perfectly aligns with Cloudflare Pages static + functions architecture.\n`);
  process.exit(0);
}
