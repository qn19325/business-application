import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import drizzle from 'eslint-plugin-drizzle';
import importPlugin from 'eslint-plugin-import';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      // Lock in the const-object enum pattern (CLAUDE.md) — TS `enum`
      // declarations have runtime cost and don't round-trip cleanly from a
      // DB or API. Use `as const` objects + derived type aliases instead.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'Use a const object + derived type alias, not a TS enum — see CLAUDE.md §Engineering Conventions.',
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // Forces every branch of a discriminated union / const-object union
      // to be handled in a switch — pairs with the const-object enum
      // pattern so adding a new variant breaks the build.
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // Catches promises silently dropped at boundaries that don't await.
      // Disabled for JSX attributes (`onClick={async () => ...}`) — React
      // tolerates these and handlers should manage their own errors
      // internally; keep the rule on for the real footgun cases.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      // `x ?? y` vs `x || y` — different for 0, '', false.
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      // TS-aware shadowing — base rule must be off so the TS rule wins.
      // `eq` / `and` are allowed because Drizzle's relational query
      // callbacks inject them as params (`where: (t, { eq, and }) => ...`)
      // alongside the top-level `import { eq, and } from 'drizzle-orm'`
      // needed by the builder API. Two APIs, same names, both legitimate.
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error', { allow: ['eq', 'and'] }],
    },
  },
  // Drizzle safety — flags db.delete() / db.update() without a .where()
  // clause. Repos own all writes; this is where the rule earns its keep.
  {
    files: ['src/repo/**/*.ts', 'src/service/**/*.ts', 'src/db/seed.ts'],
    plugins: { drizzle },
    rules: {
      'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['db', 'tx'] }],
      'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: ['db', 'tx'] }],
    },
  },
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
  // Architectural seams — enforces the four-tier layering described in
  // docs/adr/four-tier-layered-architecture.md. Import direction is one-way:
  // app → service → repo → infra. logic/ is leaf and pure.
  // components/, types/, schemas/, config/, hooks/, db/ are intentionally
  // unscoped (shared vocabulary, importable from anywhere).
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'logic', pattern: 'src/logic/*' },
        { type: 'repo', pattern: 'src/repo/*' },
        { type: 'service', pattern: 'src/service/*' },
        { type: 'infra-db', pattern: 'src/infra/db.ts', mode: 'file' },
        { type: 'infra-r2', pattern: 'src/infra/r2.ts', mode: 'file' },
        { type: 'infra-auth', pattern: 'src/infra/auth.ts', mode: 'file' },
        { type: 'app', pattern: 'src/app/**/*' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // logic/ is pure — types/, schemas/, etc. are unscoped, so the
            // only thing it can reach inside the layered tree is itself.
            { from: { type: 'logic' }, allow: { to: { type: 'logic' } } },
            // repo/ talks to the DB and nothing else in the layered tree.
            { from: { type: 'repo' }, allow: { to: { type: ['repo', 'infra-db', 'logic'] } } },
            // service/ orchestrates: its repos, sibling services (read-only
            // by convention; not enforceable here), R2, and pure logic.
            {
              from: { type: 'service' },
              allow: { to: { type: ['service', 'repo', 'infra-r2', 'logic'] } },
            },
            // app/ is the action boundary: services, logic, and auth + db
            // (resolved once per request and passed into service calls —
            // see wiki/decisions/auth-and-demo-architecture.md).
            {
              from: { type: 'app' },
              allow: { to: { type: ['app', 'service', 'logic', 'infra-auth', 'infra-db'] } },
            },
            // infra/* leaves are external-system adapters — they don't
            // import any of our layers.
            {
              from: { type: ['infra-db', 'infra-r2', 'infra-auth'] },
              disallow: { to: { type: '*' } },
            },
          ],
        },
      ],
    },
  },
  {
    // Belt-and-braces: a clearer error than the generic boundaries one when
    // someone tries to grab auth context from inside a pure or repo file.
    // practiceId is a parameter, not implicit context.
    files: ['src/logic/**/*.{ts,tsx}', 'src/repo/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infra/auth', '@/infra/auth'],
              message:
                'logic/ and repo/ must not import infra/auth. practiceId is passed as a parameter — see docs/adr/four-tier-layered-architecture.md.',
            },
          ],
        },
      ],
    },
  },
  // Must be last — disables any ESLint rules that conflict with Prettier.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
