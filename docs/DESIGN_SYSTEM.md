# BlueJays Design System

Operator-facing dashboards + admin pages share a tight visual vocabulary
so the next thing we ship slots in instead of inventing its own palette.

**Source of truth:** [`src/components/ui/index.tsx`](../src/components/ui/index.tsx).
Read that file first — every primitive is documented at the top of the
file with a usage example.

This doc covers the **why** (tokens, patterns, when to break them).

## Tokens

### Colors

| Role | Class | Where |
|---|---|---|
| Page background | `bg-slate-950` | `<Page>` wrapper |
| Page text | `text-slate-100` | `<Page>` wrapper |
| Primary surface | `bg-slate-900/60 border-white/10` | `<Card>` |
| Subtle surface | `bg-slate-900/30 border-white/5` | `<CardSubtle>` |
| Input field | `bg-slate-950 border-white/10` | `<Input>`, `<Textarea>` |
| Primary action | `bg-sky-500 → hover:bg-sky-400` | `<Button variant="primary">` (default) |
| Success / publish | `bg-emerald-500 → hover:bg-emerald-400` | `<Button variant="success">` |
| Danger / destructive | `border-rose-500/40 text-rose-300` | `<Button variant="danger">` |
| Eyebrow / accent | `text-sky-400` | `<PageHeader eyebrow>` |
| Section label | `text-slate-400 uppercase tracking-wider` | `<SectionLabel>` |
| Hint text | `text-slate-500` | inline hints |
| Disabled | `disabled:bg-slate-700 disabled:cursor-not-allowed` | button disabled state |

### Tones (status colors)

There's exactly one tone scale used across pills + status dots:

| Tone | When |
|---|---|
| `emerald` | Success, healthy, complete, paid, won |
| `amber` | In progress, warning, pending review |
| `rose` | Failed, error, lost, stale |
| `sky` | Informational, link, accent |
| `slate` | Neutral, archived, inactive |
| `violet` | Special / hyperloop-flavored |

Same six tones across `<Pill>`, `<StatusDot>`, button accents. Don't
invent new ones — pick the closest existing tone.

### Radii

| Class | When |
|---|---|
| `rounded-lg` | Buttons, inputs, small chips |
| `rounded-xl` | Subtle cards, list rows |
| `rounded-2xl` | Primary cards, prominent surfaces |
| `rounded-full` | Pills, status dots, badges |

### Spacing

- Page padding: `px-6 py-10` (built into `<Page>`)
- Card padding: `p-5` (built into `<Card>`) — override with `!p-4` for denser rows
- Vertical stack: `<Stack gap={4}>` family (1, 2, 3, 4, 5, 6, 8, 10)
- Section spacing: `mb-8` between header + content; `mb-10` between major sections

### Typography

| Element | Class |
|---|---|
| Page h1 | `text-3xl font-bold mb-2` (built into `<PageHeader>`) |
| Section h2 | `text-sm font-semibold uppercase tracking-wider text-slate-400` → use `<SectionLabel>` |
| Card title | `text-sm font-semibold text-white` |
| Body | `text-sm text-slate-200/300/400` (denser → lighter for hierarchy) |
| Hint | `text-xs text-slate-500` |
| Eyebrow | `text-xs uppercase tracking-wider text-sky-400 font-semibold` |
| Stat number | `tabular-nums` |

## Patterns

### Standard dashboard page

```tsx
import { Page, PageHeader, Card, Button, SectionLabel, ErrorHint } from "@/components/ui";

export default function MyPage() {
  return (
    <Page max="4xl">
      <PageHeader
        eyebrow="BlueJays internal · operator"
        title="Page name"
        description="One-line description of what this page is for."
        actions={<Button>Primary action</Button>}
      />

      {err && <div className="mb-4"><ErrorHint>{err}</ErrorHint></div>}

      <SectionLabel className="mb-2">Section title</SectionLabel>
      <Card>
        Section content
      </Card>
    </Page>
  );
}
```

### Status pill + dot together

```tsx
<div className="flex items-center gap-3">
  <StatusDot tone="emerald" />
  <span className="text-sm text-white">Name</span>
  <Pill tone="emerald">active</Pill>
</div>
```

### List of rows

```tsx
<Stack gap={2}>
  {rows.map(r => (
    <Card key={r.id} className="!p-4 flex items-center gap-4">
      {/* row contents */}
    </Card>
  ))}
</Stack>
```

### Empty state

```tsx
{rows.length === 0 && (
  <EmptyState
    icon="📝"
    title="No rows yet"
    description="One sentence about how to get the first row."
    action={<Button>Create first</Button>}
  />
)}
```

### Form field

```tsx
<Field label="Email" required hint="Used for sign-in + alerts.">
  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</Field>
```

## When to break the rules

Three legitimate reasons:

1. **Public-facing marketing pages** — `/`, `/audit`, `/clients/[slug]` showcase
   sites have their own per-tenant brand. The system above is for **operator** /
   **admin** surfaces. Don't apply it to marketing.

2. **A surface that needs to communicate something specific the system doesn't
   support** — e.g., the hyperloop kanban with track-colored columns
   (sky for Website, violet for AI System). That's encoded info, not decoration.
   Document the exception in a code comment.

3. **A page that's already heavily customized + works** — don't refactor for
   its own sake. The rule is "consistency forward," not "rewrite history."

## Adding a new primitive

If you find yourself writing the same Tailwind classes 3+ times across
pages, lift it into `src/components/ui/`. Two-line process:

1. Add it to `src/components/ui/index.tsx` with a doc comment + types.
2. Add a row to the cheat sheet at the top of that file + this doc.

## Cheat sheet (one-line reminders)

```tsx
<Page max="4xl">                                    // page wrapper
<PageHeader eyebrow title description actions />    // top
<Card>{...}</Card>                                  // primary surface
<CardSubtle>{...}</CardSubtle>                      // secondary surface
<Pill tone="emerald">active</Pill>                  // status pill
<StatusDot tone="rose" />                           // 2.5px dot
<Button variant="primary" size="md">Click</Button>  // primary action
<Button variant="success">Publish</Button>          // success action
<Button variant="secondary">Cancel</Button>         // neutral
<Button variant="ghost" size="sm">Refresh</Button>  // text-only
<Button variant="danger">Delete</Button>            // destructive
<EmptyState icon title description action />        // zero-data
<SectionLabel>Section</SectionLabel>                // uppercase section h2
<Label required>Email</Label>                       // form-field label
<Field label hint required>{children}</Field>       // form-field wrapper
<Input /> <Textarea /> <Select />                   // styled form controls
<Stack gap={4}>{...}</Stack>                        // vertical layout
<ErrorHint>{msg}</ErrorHint>                        // rose error text
```

## Reference implementations

These pages are the canonical examples — copy from them when stuck:

- **[/dashboard/backend-audit](../src/app/dashboard/backend-audit/page.tsx)** — page header + status list + section
- **[/dashboard/blog](../src/app/dashboard/blog/page.tsx)** — page header with action + empty state + row list with pills
- **[/dashboard/team](../src/app/dashboard/team/page.tsx)** — admin list + add-row form + per-row actions
