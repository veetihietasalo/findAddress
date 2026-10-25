// Runs after `expo export --platform web`. Expo SDK 49 writes absolute paths ("/bundles/...",
// "/assets/...") and has no baseUrl option, so the site would only work from the domain root.
// This rewrites them to relative paths, so the export also works from a subfolder like
// https://<user>.github.io/<repo>/. It also writes .nojekyll, because GitHub Pages' Jekyll
// drops folders such as assets/node_modules.
const fs = require('fs');
const path = require('path');

const dist = path.resolve(process.argv[2] || 'dist');
let changed = 0;

function rewrite(file, edit) {
  const before = fs.readFileSync(file, 'utf8');
  const after = edit(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

// index.html: src="/..." and href="/..." (but not protocol-relative "//...").
rewrite(path.join(dist, 'index.html'), (html) => html.replace(/(src|href)="\/(?!\/)/g, '$1="./'));

for (const file of walk(dist)) {
  if (file.endsWith('.js')) {
    // Asset registry entries. A relative location resolves against the page URL.
    rewrite(file, (js) => js.replace(/(["']?httpServerLocation["']?\s*:\s*["'])\/(?!\/)/g, '$1./'));
  } else if (file.endsWith('.css')) {
    // url(/...) in CSS resolves against the CSS file, so point it back to the export root.
    const toRoot = path.relative(path.dirname(file), dist).split(path.sep).join('/') || '.';
    rewrite(file, (css) => css.replace(/url\((["']?)\/(?!\/)/g, `url($1${toRoot}/`));
  }
}

fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log(`web-relative-paths: rewrote ${changed} file(s) in ${path.relative(process.cwd(), dist) || '.'}, wrote .nojekyll`);
