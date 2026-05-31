import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = resolve('README.md');
const destination = resolve('public', 'README.md');

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
