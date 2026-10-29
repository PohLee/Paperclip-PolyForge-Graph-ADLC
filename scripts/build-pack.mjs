import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { packCatalog } from '../index.mjs';

const id = process.argv[2];
const pack = packCatalog[id];
if (!pack) throw new Error(`Unknown pack ${id}; choose ${Object.keys(packCatalog).join(', ')}`);
const { release, ...payload } = pack;
const bytes = Buffer.from(JSON.stringify(payload));
const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
if (release.digest !== digest) throw new Error(`Release digest mismatch for ${id}@${pack.version}`);
const dir = resolve('dist', id, pack.version);
mkdirSync(dir, { recursive:true });
writeFileSync(resolve(dir, 'pack.json'), bytes);
writeFileSync(resolve(dir, 'release.json'), JSON.stringify({ packId:id, version:pack.version, ...release },null,2) + '\n');
process.stdout.write(`${id}@${pack.version} ${digest}\n`);
