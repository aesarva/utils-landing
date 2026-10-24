// Снимок релизов как статический JSON.
import snapshot from '../data/releases.json';
import { releasesFileSchema } from '../lib/schema';
import { serializeReleases } from '../lib/releases';

export function GET() {
  return new Response(serializeReleases(releasesFileSchema.parse(snapshot)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
