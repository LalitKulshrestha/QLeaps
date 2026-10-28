// Build-time only: publish static HTML/assets, never backend source or internal notes.
process.env.ASTRO_TELEMETRY_DISABLED = '1';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
async function main() {
  const { build } = await import('astro');
  await build({ root });
  const output = path.join(root, 'dist');
  // Preserve the existing public privacy URL while using a shared Astro layout.
  const privacy = path.join(output, 'privacy', 'index.html');
  if (fs.existsSync(privacy)) {
    fs.renameSync(privacy, path.join(output, 'privacy.html'));
    fs.rmSync(path.join(output, 'privacy'), { recursive: true, force: true });
  }
  fs.rmSync(path.join(output, 'assets/video/handshake-offer.mp4'), {
    force: true,
  });
  const routes = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
        const relative = path.relative(output, file).split(path.sep).join('/');
        routes.push(
          'https://qleaps.in/' +
            (relative === 'index.html'
              ? ''
              : relative.replace(/index\.html$/, '')),
        );
      }
    }
  }
  visit(output);
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes
      .sort()
      .map((url) => `  <url><loc>${url}</loc></url>`)
      .join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(output, 'sitemap.xml'), sitemap);
  console.log(
    `Published ${routes.length + 1} static pages. Internal files excluded.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
