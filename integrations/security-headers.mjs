// Writes dist/_headers, which Cloudflare's static assets read, with the site's
// security headers -- and a Content-Security-Policy whose script-src is exact.
//
// The inline scripts are the reason this is a build step and not a file in
// public/: the theme bootstrap in Base.astro (and anything Astro chooses to
// inline) has to be allowed, and 'unsafe-inline' would allow any script at
// all. So after the build this hashes every inline script in every page and
// names exactly those. A script edited later gets a new hash on the next
// build, with nothing to keep in step by hand.
//
// Styles keep 'unsafe-inline': the declarative shadow DOM arc-dsd renders
// carries each component's <style>, and the pages set custom properties in
// style attributes, which a hash cannot cover. Nothing on this site takes
// user input, so the script and connect rules are the ones that matter.
//
// Run after arc-dsd, which rewrites the HTML this reads.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BEACON } from '../src/data/site.ts';

// A script tag with no src whose type runs as script. JSON-LD and other data
// blocks are not executed, so CSP does not apply to them.
const INLINE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const runs = (attrs) => {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
  return !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript';
};

// Cloudflare ignores a _headers line longer than this.
const MAX_LINE = 2000;

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

export default function securityHeaders() {
  return {
    name: 'pulsar:security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const hashes = new Set();
        for (const file of await htmlFiles(root)) {
          const html = await readFile(file, 'utf8');
          // An inline handler (onclick=...) would need 'unsafe-hashes'; there
          // are none, and this keeps it that way.
          if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html.replace(/<script\b[\s\S]*?<\/script>/gi, ''))) {
            throw new Error(`security-headers: inline event handler in ${file}; CSP would block it`);
          }
          for (const [, attrs, body] of html.matchAll(INLINE)) {
            if (runs(attrs) && body.length) hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
          }
        }

        const csp = [
          "default-src 'self'",
          `script-src 'self' ${[...hashes].sort().join(' ')}`.trimEnd(),
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          // the build beacon: src/scripts/beacon.ts asks it about last night
          `connect-src 'self' ${new URL(BEACON).origin}`,
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        const headers = [
          '# Written by integrations/security-headers.mjs at build time. Do not edit.',
          '/*',
          `  Content-Security-Policy: ${csp}`,
          '  X-Content-Type-Options: nosniff',
          '  Referrer-Policy: strict-origin-when-cross-origin',
          '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
          '  X-Frame-Options: DENY',
          '  Cross-Origin-Opener-Policy: same-origin',
          '',
        ];
        const long = headers.find((l) => l.length > MAX_LINE);
        if (long) throw new Error(`security-headers: a line is ${long.length} characters; Cloudflare drops lines over ${MAX_LINE}`);
        await writeFile(join(root, '_headers'), headers.join('\n'));
        logger.info(`_headers written, ${hashes.size} inline script hash${hashes.size === 1 ? '' : 'es'}`);
      },
    },
  };
}
