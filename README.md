# Comparatif modes de garde

French childcare cost comparison engine (see [`docs/INITIAL_SPEC.md`](docs/INITIAL_SPEC.md)).

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run ci
```

Scripts: `typecheck`, `test`, `lint`, `format`, `format:write`.

Rule packs (barèmes / plafonds, versioned JSON) validate against `src/config/schema.ts`; see `config/rules.example.json`.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CHANGELOG.md`](CHANGELOG.md).
