// api/boot.js — Vercel serverless entry point
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Re-export your bundled boot.js as a Vercel handler
export { default } from '../dist/boot.js';