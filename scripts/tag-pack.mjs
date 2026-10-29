import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { packCatalog } from '../index.mjs';

const id = process.argv[2], pack = packCatalog[id];
if (!pack) throw new Error(`Unknown pack ${id}`);
if (execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()) throw new Error('Commit and review the package before tagging');
const artifact = resolve('dist',id,pack.version,'pack.json');
if (!existsSync(artifact)) throw new Error(`Build ${id}@${pack.version} first`);
execFileSync(process.execPath,[resolve('scripts/build-pack.mjs'),id],{stdio:'inherit'});
const tag = `${id}/v${pack.version}`;
if (execFileSync('git',['tag','--list',tag],{encoding:'utf8'}).trim()) throw new Error(`Tag ${tag} already exists`);
execFileSync('git',['tag','-a',tag,'-m',`${id}@${pack.version} ${pack.release.digest}`],{stdio:'inherit'});
process.stdout.write(`Created ${tag}; push the tag when release is approved.\n`);
