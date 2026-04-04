# Token Extension Guidance

Use this when adding a new product theme, brand layer, or density mode.

## Extension order
1. Override semantic tokens first.
2. If needed, introduce new base tokens (rare).
3. Add component tokens only when a component requires unique styling.

## Theme safety checks
- Verify contrast and focus states at all breakpoints.
- Ensure text styles remain aligned to the type scale.
- Preserve spacing rhythm even in compact density.

## Recommended additions
- `aliases.json` for brand naming.
- `components.json` for component-specific tokens.

