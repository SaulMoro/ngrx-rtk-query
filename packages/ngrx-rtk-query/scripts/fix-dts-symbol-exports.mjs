#!/usr/bin/env node
// Promote local `declare const X: unique symbol;` declarations to
// `export declare const X: unique symbol;` inside the bundled `.d.ts` files
// emitted by ng-packagr.
//
// Why: ng-packagr (rollup-plugin-dts) bundles symbols as `declare const` plus a
// grouped `export { ... }` clause at the bottom of the file. TypeScript's
// declaration emitter cannot reach a `unique symbol` through a grouped
// re-export when serializing inferred types in consumer code, and fails with:
//   TS2527: The inferred type of '...' references an inaccessible
//   'unique symbol' type. A type annotation is necessary.
// Promote every `declare const X: unique symbol;` — including symbols that are
// only used as property keys inside exported type members (e.g. registry keys
// in signal-store features). Those keys are not present in the grouped value
// export but still leak through inferred consumer types.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distTypesDir = resolve(here, '../../../dist/packages/ngrx-rtk-query/types');
const files = readdirSync(distTypesDir).filter((file) => file.endsWith('.d.ts'));
const UNIQUE_SYMBOL_RE = /^declare const (\w+): unique symbol;$/gm;
const GROUPED_EXPORT_RE = /^export \{([^}]+)\};$/gm;
const requiredCoreSymbols = ['UNINITIALIZED_VALUE', 'angularHooksModuleName'];

if (files.length === 0) {
  console.error(`[fix-dts-symbol-exports] no .d.ts files found in ${distTypesDir}`);
  process.exit(1);
}

let totalPromoted = 0;

for (const file of files) {
  const path = resolve(distTypesDir, file);
  const original = readFileSync(path, 'utf8');
  const promotedNames = new Set([...original.matchAll(UNIQUE_SYMBOL_RE)].map((match) => match[1]));

  if (promotedNames.size === 0) continue;

  let next = original.replace(UNIQUE_SYMBOL_RE, (_match, name) => {
    return `export declare const ${name}: unique symbol;`;
  });

  // Remove now-duplicated value-export entries from grouped `export { ... };`
  // lines so TypeScript does not error with "Cannot redeclare exported variable".
  next = next.replace(GROUPED_EXPORT_RE, (_match, body) => {
    const kept = body
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => {
        if (!entry) return false;
        const bareName = entry
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/i)[0]
          .trim();
        return !promotedNames.has(bareName);
      });
    return kept.length > 0 ? `export { ${kept.join(', ')} };` : '';
  });

  writeFileSync(path, next);
  totalPromoted += promotedNames.size;
  console.log(`[fix-dts-symbol-exports] ${file}: promoted ${[...promotedNames].join(', ')}`);
}

const coreTypesPath = resolve(distTypesDir, 'ngrx-rtk-query-core.d.ts');
const coreTypes = readFileSync(coreTypesPath, 'utf8');

for (const symbolName of requiredCoreSymbols) {
  if (!coreTypes.includes(`export declare const ${symbolName}: unique symbol;`)) {
    console.error(`[fix-dts-symbol-exports] expected ${symbolName} to be exported inline in ${coreTypesPath}`);
    process.exit(1);
  }
}

console.log(`[fix-dts-symbol-exports] done (${totalPromoted} symbol(s) promoted)`);
