import type { Options } from 'tsup'

export const tsup: Options = {
  splitting: false,
  sourcemap: true,
  clean: true,
  entryPoints: ['lib/index.ts'],
  format: ['cjs', 'esm'],
  legacyOutput: true,
}
