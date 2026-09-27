#!/usr/bin/env node
// Copies the WorkHorse plugin into resources/plugin so the app can bundle it. The plugin lives in
// its own repository: set WORKHORSE_PLUGIN_DIR to a checkout of it (default: the parent folder,
// which is where it lived when Paddock was the WorkHorse repository's desk/ folder).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = process.env.WORKHORSE_PLUGIN_DIR
  ? path.resolve(process.env.WORKHORSE_PLUGIN_DIR)
  : path.resolve(__dirname, '..', '..');
if (!fs.existsSync(path.join(ROOT, '.claude-plugin', 'plugin.json'))) {
  console.error(`sync-plugin: no WorkHorse plugin at ${ROOT}; set WORKHORSE_PLUGIN_DIR to a checkout of it`);
  process.exit(1);
}
const DEST = path.resolve(__dirname, '..', 'resources', 'plugin');
const INCLUDE = ['.claude-plugin', 'agents', 'skills', 'hooks', 'scripts', 'templates', 'vendor', 'README.md'];
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });
for (const entry of INCLUDE) {
  const src = path.join(ROOT, entry);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(DEST, entry), { recursive: true, filter: (p) => !/[\\/](node_modules|tests)[\\/]?/.test(p) });
}
const manifest = JSON.parse(fs.readFileSync(path.join(DEST, '.claude-plugin', 'plugin.json'), 'utf8'));
fs.writeFileSync(path.join(DEST, 'VERSION'), manifest.version + '\n');
console.log(`synced plugin ${manifest.version} -> ${path.relative(process.cwd(), DEST)}`);
