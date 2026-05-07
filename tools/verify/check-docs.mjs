import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspaceRootEntries = new Set(readdirSync(workspaceRoot, { withFileTypes: true }).map((entry) => entry.name));
const fileContentCache = new Map();
const errors = [];

const resolveFromRoot = (...segments) => path.join(workspaceRoot, ...segments);
const readFromRoot = (filePath) => {
  const normalizedPath = path.normalize(filePath);
  const cachedContent = fileContentCache.get(normalizedPath);

  if (cachedContent !== undefined) {
    return cachedContent;
  }

  const content = readFileSync(resolveFromRoot(normalizedPath), 'utf8');
  fileContentCache.set(normalizedPath, content);
  return content;
};
const assert = (condition, message) => {
  if (!condition) {
    errors.push(message);
  }
};

const docsDir = resolveFromRoot('docs');
const allowedDocsDirectories = new Set(['adrs', 'agents', 'specs']);
const ignoredReadmeDirectories = new Set(['.nx', '.vite-temp', 'coverage', 'dist', 'node_modules']);
const durableFiles = [
  ...new Set([
    ...collectRootMarkdownFiles(),
    ...collectFlatMarkdownFiles('docs'),
    ...collectFlatMarkdownFiles('docs/agents'),
    ...collectReadmes('packages'),
    ...collectReadmes('tools'),
  ]),
];
const referenceCheckedFiles = [
  ...new Set([...durableFiles, ...collectFlatMarkdownFiles('docs/adrs'), ...collectFlatMarkdownFiles('docs/specs')]),
];
const markdownAnchorCache = new Map();
const requiredPackageReadmeHeadings = [
  '## Quick Start',
  '## Install',
  '## Version Compatibility',
  '## Core Concepts',
  '## Runtime Choices',
  '## Import Paths',
  '## Define an API',
  '## Cache Tags and Invalidation',
  '## Mount the API',
  '## Use Queries',
  '## Query Options and Refetching',
  '## Use Lazy Queries',
  '## Use Prefetch',
  '## Use Infinite Queries',
  '## Use Mutations',
  '## Use Signal Store Readers',
  '## Use Angular DI in Base Queries',
  '## Code Splitting and Lazy Routes',
  '## Testing',
  '## Examples',
  '## Troubleshooting',
  '## Maintainers',
];

for (const entry of readdirSync(docsDir, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    assert(
      allowedDocsDirectories.has(entry.name),
      `docs/${entry.name}/ is not allowed. Only docs/adrs/, docs/agents/, and docs/specs/ may be directories.`,
    );
    continue;
  }

  assert(entry.isFile() && entry.name.endsWith('.md'), `docs/${entry.name} must be a Markdown file.`);
}

const agentDocsDir = resolveFromRoot('docs/agents');
if (existsSync(agentDocsDir)) {
  for (const entry of readdirSync(agentDocsDir, { withFileTypes: true })) {
    assert(
      entry.isFile() && (entry.name === '.gitkeep' || entry.name.endsWith('.md')),
      `docs/agents/${entry.name} must be a Markdown file or .gitkeep.`,
    );
  }
}

const rootReadme = resolveFromRoot('README.md');
assert(existsSync(rootReadme), 'Missing README.md.');
if (existsSync(rootReadme)) {
  const stat = lstatSync(rootReadme);
  assert(stat.isSymbolicLink(), 'README.md must be a symlink to packages/ngrx-rtk-query/README.md.');
  if (stat.isSymbolicLink()) {
    assert(
      readlinkSync(rootReadme) === './packages/ngrx-rtk-query/README.md',
      'README.md must point to ./packages/ngrx-rtk-query/README.md.',
    );
  }
}

const claudePath = resolveFromRoot('CLAUDE.md');
assert(existsSync(claudePath), 'Missing CLAUDE.md compatibility symlink.');
if (existsSync(claudePath)) {
  const stat = lstatSync(claudePath);
  assert(stat.isSymbolicLink(), 'CLAUDE.md must be a symlink to AGENTS.md.');
  if (stat.isSymbolicLink()) {
    assert(readlinkSync(claudePath) === 'AGENTS.md', 'CLAUDE.md must point to AGENTS.md.');
  }
}

const agents = readFromRoot('AGENTS.md');
assert(agents.split('\n').length <= 120, 'AGENTS.md must stay at or below 120 lines.');
for (const requiredReference of [
  'docs/HARNESS.md',
  'docs/ARCHITECTURE.md',
  'docs/TESTING.md',
  'docs/VALIDATION.md',
  'docs/RELEASE.md',
  'packages/ngrx-rtk-query/README.md',
  'packages/ngrx-rtk-query/core/README.md',
]) {
  assert(agents.includes(requiredReference), `AGENTS.md must reference ${requiredReference}.`);
}

const agentReferences = extractLocalPathReferences(agents);
const agentDocReferences = new Set();
let hasAgentEntrypointReadmeReference = false;

for (const reference of agentReferences) {
  const normalizedReference = normalizeLocalPathReference('AGENTS.md', reference);

  if (normalizedReference === null) {
    continue;
  }

  if (normalizedReference.startsWith('docs/') && normalizedReference.endsWith('.md')) {
    agentDocReferences.add(normalizedReference);
  }

  if (
    normalizedReference.startsWith('packages/ngrx-rtk-query/') &&
    normalizedReference.endsWith('/README.md') &&
    normalizedReference !== 'packages/ngrx-rtk-query/README.md'
  ) {
    hasAgentEntrypointReadmeReference = true;
  }
}

assert(agentDocReferences.size >= 3, 'AGENTS.md should reference multiple repo docs so it stays map-shaped.');
assert(
  hasAgentEntrypointReadmeReference,
  'AGENTS.md should reference at least one entrypoint README so it routes to deeper owner context.',
);

const packageReadme = readFromRoot('packages/ngrx-rtk-query/README.md');
for (const heading of requiredPackageReadmeHeadings) {
  assert(packageReadme.includes(heading), `packages/ngrx-rtk-query/README.md is missing ${heading}.`);
}

for (const entrypointReadme of [
  'packages/ngrx-rtk-query/core/README.md',
  'packages/ngrx-rtk-query/store/README.md',
  'packages/ngrx-rtk-query/noop-store/README.md',
  'packages/ngrx-rtk-query/signal-store/README.md',
]) {
  const content = readFromRoot(entrypointReadme);
  assert(content.includes('## Public Surface'), `${entrypointReadme} must document its public surface.`);
  assert(content.split('\n').length >= 10, `${entrypointReadme} must contain durable entrypoint guidance.`);
}

for (const hookConfigPath of ['.codex/hooks.json', '.claude/settings.json', '.opencode/plugins/verify-on-idle.ts']) {
  assert(existsSync(resolveFromRoot(hookConfigPath)), `Missing agent hook config: ${hookConfigPath}.`);

  if (existsSync(resolveFromRoot(hookConfigPath))) {
    const content = readFromRoot(hookConfigPath);
    assert(
      content.includes('tools/verify/verify-on-stop.sh'),
      `${hookConfigPath} must delegate to tools/verify/verify-on-stop.sh.`,
    );
  }
}

const adrFiles = collectFlatMarkdownFiles('docs/adrs');
assert(
  adrFiles.some((filePath) => filePath.endsWith('XXXX-adr-template.md')),
  'docs/adrs must contain XXXX-adr-template.md.',
);

const adrTemplatePath = adrFiles.find((filePath) => filePath.endsWith('XXXX-adr-template.md')) ?? null;
const adrTemplateContent = adrTemplatePath ? readFromRoot(adrTemplatePath) : '';
const adrTemplateHasFrontmatter = hasFrontmatter(adrTemplateContent);
const requiredAdrSections = getRequiredAdrSections(adrTemplateContent);
const requiredAdrFrontmatterKeys = getRequiredFrontmatterKeys(adrTemplateContent);
const adrOptionHeadingLevel = getAdrOptionHeadingLevel(adrTemplateContent);

for (const adrFile of adrFiles.filter((filePath) => !filePath.endsWith('XXXX-adr-template.md'))) {
  const content = readFromRoot(adrFile);
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (adrTemplateHasFrontmatter) {
    assert(frontmatterMatch, `${adrFile} must start with YAML front matter.`);
  }

  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  for (const key of requiredAdrFrontmatterKeys) {
    assert(new RegExp(`(^|\\n)${key}:\\s`, 'm').test(frontmatter), `${adrFile} front matter must include ${key}.`);
  }

  for (const section of requiredAdrSections) {
    assert(content.includes(section), `${adrFile} must include section ${section}.`);
  }

  if (adrOptionHeadingLevel !== null) {
    assert(
      new RegExp(`## Pros and Cons of the Options[\\s\\S]*^${'#'.repeat(adrOptionHeadingLevel)} `, 'm').test(content),
      `${adrFile} must include at least one option subsection under Pros and Cons of the Options.`,
    );
  }
}

const forbiddenDurablePatterns = [
  { label: 'TODO marker', regex: /\bTODO:/m },
  { label: 'TBD marker', regex: /\bTBD\b/m },
  { label: 'Open Questions heading', regex: /^## Open Questions\b/m },
  { label: 'status marker', regex: /^Status:\s/m },
];

for (const filePath of durableFiles) {
  if (!existsSync(resolveFromRoot(filePath))) {
    continue;
  }

  const content = readFromRoot(filePath);

  for (const pattern of forbiddenDurablePatterns) {
    assert(
      !pattern.regex.test(content),
      `${filePath} contains a forbidden ${pattern.label}. Move active change tracking to docs/specs/.`,
    );
  }
}

for (const filePath of referenceCheckedFiles) {
  if (!existsSync(resolveFromRoot(filePath))) {
    continue;
  }

  const content = readFromRoot(filePath);

  for (const reference of extractLocalPathReferences(content)) {
    const normalizedReference = normalizeLocalPathReference(filePath, reference);
    if (normalizedReference === null) {
      continue;
    }

    assert(existsSync(resolveFromRoot(normalizedReference)), `${filePath} references missing local path: ${reference}`);
  }

  for (const reference of extractMarkdownLinkReferences(content)) {
    const anchorReference = normalizeLocalAnchorReference(filePath, reference);
    if (anchorReference === null) {
      continue;
    }

    if (!existsSync(resolveFromRoot(anchorReference.filePath))) {
      continue;
    }

    assert(
      getMarkdownAnchorsFor(anchorReference.filePath).has(anchorReference.anchor),
      `${filePath} references missing heading anchor: ${reference}`,
    );
  }
}

if (errors.length > 0) {
  console.error('Documentation check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

function collectRootMarkdownFiles() {
  return readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
}

function collectFlatMarkdownFiles(relativeDirectoryPath) {
  const absoluteDirectoryPath = resolveFromRoot(relativeDirectoryPath);
  if (!existsSync(absoluteDirectoryPath)) {
    return [];
  }

  return readdirSync(absoluteDirectoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `${relativeDirectoryPath}/${entry.name}`)
    .sort();
}

function collectReadmes(relativeDirectoryPath) {
  const absoluteDirectoryPath = resolveFromRoot(relativeDirectoryPath);
  if (!existsSync(absoluteDirectoryPath)) {
    return [];
  }

  return collectReadmesFrom(absoluteDirectoryPath, relativeDirectoryPath).sort();
}

function collectReadmesFrom(absoluteDirectoryPath, relativeDirectoryPath) {
  const matches = [];

  for (const entry of readdirSync(absoluteDirectoryPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredReadmeDirectories.has(entry.name)) {
      continue;
    }

    const nextRelativePath = `${relativeDirectoryPath}/${entry.name}`;
    const nextAbsolutePath = path.join(absoluteDirectoryPath, entry.name);

    if (entry.isDirectory()) {
      matches.push(...collectReadmesFrom(nextAbsolutePath, nextRelativePath));
      continue;
    }

    if (entry.isFile() && entry.name === 'README.md') {
      matches.push(nextRelativePath);
    }
  }

  return matches;
}

function extractLocalPathReferences(content) {
  return [
    ...new Set(
      [
        ...[...content.matchAll(/`([^`\n]+)`/g)].map((match) => match[1].trim()),
        ...extractMarkdownLinkTargets(content),
      ].filter(isLocalPathReference),
    ),
  ];
}

function extractMarkdownLinkReferences(content) {
  return [...new Set(extractMarkdownLinkTargets(content))];
}

function extractMarkdownLinkTargets(content) {
  return [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());
}

function isLocalPathReference(token) {
  const sanitizedToken = sanitizeReferenceToken(token);

  if (
    sanitizedToken.length === 0 ||
    sanitizedToken.includes('*') ||
    sanitizedToken.includes(' ') ||
    sanitizedToken.includes('<') ||
    sanitizedToken.includes('>') ||
    sanitizedToken.startsWith('#') ||
    sanitizedToken.startsWith('http://') ||
    sanitizedToken.startsWith('https://') ||
    sanitizedToken.startsWith('mailto:') ||
    sanitizedToken.startsWith('tel:') ||
    sanitizedToken.startsWith('@') ||
    sanitizedToken.startsWith('/')
  ) {
    return false;
  }

  if (sanitizedToken.startsWith('./') || sanitizedToken.startsWith('../')) {
    return true;
  }

  const normalizedToken = sanitizedToken.endsWith('/') ? sanitizedToken.slice(0, -1) : sanitizedToken;
  const [firstSegment] = normalizedToken.split('/');

  return workspaceRootEntries.has(firstSegment);
}

function normalizeLocalPathReference(sourceFilePath, reference) {
  const sanitizedToken = sanitizeReferenceToken(reference);

  if (sanitizedToken.length === 0) {
    return null;
  }

  const normalizedToken = sanitizedToken.endsWith('/') ? sanitizedToken.slice(0, -1) : sanitizedToken;

  if (normalizedToken.startsWith('./') || normalizedToken.startsWith('../')) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(sourceFilePath), normalizedToken));
  }

  return normalizedToken;
}

function normalizeLocalAnchorReference(sourceFilePath, reference) {
  const token = reference.trim().replace(/^<|>$/g, '');
  const hashIndex = token.indexOf('#');

  if (hashIndex === -1) {
    return null;
  }

  const fileReference = token.slice(0, hashIndex);
  const rawAnchor = token.slice(hashIndex + 1);
  const anchor = normalizeAnchor(rawAnchor);

  if (
    anchor === '' ||
    token.startsWith('http://') ||
    token.startsWith('https://') ||
    token.startsWith('mailto:') ||
    token.startsWith('tel:') ||
    fileReference.startsWith('@') ||
    fileReference.startsWith('/')
  ) {
    return null;
  }

  if (fileReference === '') {
    return { filePath: sourceFilePath, anchor };
  }

  const normalizedFileReference = fileReference.endsWith('/') ? fileReference.slice(0, -1) : fileReference;

  if (normalizedFileReference.startsWith('./') || normalizedFileReference.startsWith('../')) {
    return {
      filePath: path.posix.normalize(path.posix.join(path.posix.dirname(sourceFilePath), normalizedFileReference)),
      anchor,
    };
  }

  const [firstSegment] = normalizedFileReference.split('/');

  if (!workspaceRootEntries.has(firstSegment)) {
    return null;
  }

  return { filePath: normalizedFileReference, anchor };
}

function sanitizeReferenceToken(token) {
  return token
    .trim()
    .replace(/^<|>$/g, '')
    .replace(/[?#].*$/, '');
}

function normalizeAnchor(anchor) {
  try {
    return decodeURIComponent(anchor);
  } catch {
    return anchor;
  }
}

function getMarkdownAnchors(content) {
  const anchors = new Set();
  const anchorCounts = new Map();

  for (const match of content.matchAll(/^(#{1,6})\s+(.+)$/gm)) {
    const baseAnchor = slugifyHeading(match[2]);

    if (baseAnchor === '') {
      continue;
    }

    const count = anchorCounts.get(baseAnchor) ?? 0;
    anchorCounts.set(baseAnchor, count + 1);
    anchors.add(count === 0 ? baseAnchor : `${baseAnchor}-${count}`);
  }

  return anchors;
}

function getMarkdownAnchorsFor(filePath) {
  const cachedAnchors = markdownAnchorCache.get(filePath);
  if (cachedAnchors) {
    return cachedAnchors;
  }

  const anchors = getMarkdownAnchors(readFromRoot(filePath));
  markdownAnchorCache.set(filePath, anchors);
  return anchors;
}

function slugifyHeading(heading) {
  return heading
    .replace(/\s+#+\s*$/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function hasFrontmatter(content) {
  return /^---\n[\s\S]*?\n---\n/.test(content);
}

function getRequiredAdrSections(templateContent) {
  const lines = templateContent.split(/\r?\n/);
  const sections = [];
  let nextHeadingIsOptional = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      continue;
    }

    if (/^<!--[\s\S]*optional[\s\S]*-->$/i.test(trimmedLine)) {
      nextHeadingIsOptional = true;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{2,6})\s+(.+)$/);
    if (!headingMatch) {
      continue;
    }

    const heading = `${headingMatch[1]} ${headingMatch[2].trim()}`;
    if (!nextHeadingIsOptional && !heading.includes('{')) {
      sections.push(heading);
    }

    nextHeadingIsOptional = false;
  }

  return [...new Set(sections)];
}

function getRequiredFrontmatterKeys(templateContent) {
  const frontmatterMatch = templateContent.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatterMatch) {
    return [];
  }

  let nextKeysAreOptional = false;
  const keys = [];

  for (const line of frontmatterMatch[1].split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      continue;
    }

    if (trimmedLine.startsWith('#')) {
      nextKeysAreOptional = /optional/i.test(trimmedLine);
      continue;
    }

    const keyMatch = trimmedLine.match(/^([a-zA-Z0-9_-]+):/);
    if (!keyMatch) {
      continue;
    }

    if (!nextKeysAreOptional) {
      keys.push(keyMatch[1]);
    }
  }

  return [...new Set(keys)];
}

function getAdrOptionHeadingLevel(templateContent) {
  const optionHeadingMatch = templateContent.match(/^\s*(#{3,6})\s+\{/m);
  return optionHeadingMatch ? optionHeadingMatch[1].length : null;
}
