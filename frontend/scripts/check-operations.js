// Validates every gql`...` document in the app against priv/graphql/schema.graphql.
// Fails when a query uses a field, argument or type the backend no longer has.
const fs = require('fs');
const path = require('path');
const { buildSchema, parse, validate, specifiedRules, Kind } = require('graphql');

const root = path.join(__dirname, '..');
const schemaPath = path.join(root, '..', 'priv', 'graphql', 'schema.graphql');
const schema = buildSchema(fs.readFileSync(schemaPath, 'utf8'));

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'web-build', '.expo', 'scripts', '__tests__'].includes(entry.name))
      return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? jsFiles(full) : full.endsWith('.js') ? [full] : [];
  });
}

// Collect documents. `${name}` interpolations refer to other gql constants, so
// they are replaced with those constants' fragment definitions.
const documents = [];
const constants = new Map();
for (const file of jsFiles(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const pattern = /(?:(?:export\s+)?const\s+(\w+)\s*=\s*)?gql`([\s\S]*?)`/g;
  let match;
  while ((match = pattern.exec(source))) {
    const doc = { file: path.relative(root, file), name: match[1], body: match[2] };
    documents.push(doc);
    if (match[1]) constants.set(match[1], doc);
  }
}

function resolve(body, seen = new Set()) {
  return body.replace(/\$\{(\w+)\}/g, (_, name) => {
    const other = constants.get(name);
    if (!other) throw new Error(`unknown interpolation \${${name}}`);
    if (seen.has(name)) return '';
    seen.add(name);
    return resolve(other.body, seen);
  });
}

const skippedRules = ['OverlappingFieldsCanBeMergedRule'];
const rules = specifiedRules.filter((rule) => !skippedRules.includes(rule.name));
let failures = 0;
for (const doc of documents) {
  let ast;
  try {
    ast = parse(resolve(doc.body));
  } catch (error) {
    failures += 1;
    console.log(`${doc.file} ${doc.name || ''}: ${error.message}`);
    continue;
  }
  if (!ast.definitions.some((d) => d.kind === Kind.OPERATION_DEFINITION)) continue;
  for (const error of validate(schema, ast, rules)) {
    failures += 1;
    console.log(`${doc.file} ${doc.name || ''}: ${error.message}`);
  }
}

const operations = documents.length;
console.log(`graphql check: ${operations} documents, ${failures} problems`);
process.exit(failures ? 1 : 0);
