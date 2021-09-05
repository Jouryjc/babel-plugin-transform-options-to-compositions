import type { Options } from 'tsup'

export const tsup: Options = {
  sourcemap: false,
  clean: true,
  entryPoints: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  legacyOutput: true,
}
