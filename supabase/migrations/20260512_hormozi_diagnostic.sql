-- Hormozi Diagnostic Agent — BlueJays-internal dashboard tool
--
-- Two tables:
--   · hormozi_kb_chunks    knowledge base — framework summaries +
--                          ingested YouTube transcript chunks, tagged
--                          by topic so the agent can select relevant
--                          context per prospect (no embeddings yet —
--                          tag filtering + 1M cache window is enough)
--   · hormozi_diagnostics  one row per diagnosis run, links to a
--                          prospect optionally, stores structured JSON
--                          output for replay / sales-script merge

create table if not exists hormozi_kb_chunks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_kind text not null check (source_kind in ('framework', 'youtube', 'book', 'note')),
  source_url text,
  topic_tags text[] not null default '{}',
  content text not null,
  word_count int generated always as (array_length(regexp_split_to_array(content, '\s+'), 1)) stored,
  created_at timestamptz not null default now()
);

create index if not exists hormozi_kb_chunks_tags_idx on hormozi_kb_chunks using gin (topic_tags);

create table if not exists hormozi_diagnostics (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete set null,
  business_input jsonb not null,
  diagnosis jsonb,
  model text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10, 6),
  duration_ms int,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists hormozi_diagnostics_prospect_idx on hormozi_diagnostics(prospect_id);
create index if not exists hormozi_diagnostics_created_idx on hormozi_diagnostics(created_at desc);

-- ─────────────────────────── SEED ────────────────────────────
-- Five framework summaries so the tool produces useful diagnoses
-- before any YouTube ingestion happens. Tags drive selection.

insert into hormozi_kb_chunks (title, source_kind, topic_tags, content) values
(
  'Value Equation ($100M Offers)',
  'framework',
  array['offer', 'pricing', 'value-equation'],
  'Hormozi value equation: perceived value = (dream outcome × perceived likelihood of achievement) / (time delay × effort and sacrifice). To increase value, increase the numerator (bigger outcome, more believable) or shrink the denominator (faster, easier). A weak offer almost always has one variable broken — usually time delay is too long or perceived likelihood is too low. The diagnostic question is: which of the four levers is the biggest drag, and what specific change collapses it? Most service businesses fix value by removing risk (guarantees), shortening time-to-result (done-for-you, fast onboarding), or stacking bonuses that raise dream outcome.'
),
(
  'Core Four Lead Generation',
  'framework',
  array['leads', 'lead-gen', 'core-four'],
  'Hormozi Core Four lead sources: (1) warm outreach to people you know, (2) post free content where prospects gather, (3) cold outreach to strangers, (4) paid ads. Most businesses under $1M revenue are doing zero or one of these. The diagnostic is: which channel is the prospect doing at all, which is producing leads, and which is the obvious next add. Order of addition usually goes 1→2→3→4. Volume math: leads per day × conversion rate = customers per day; if either is below the floor (e.g. <3 leads/day for a service business), the business is bottlenecked there before anything else matters.'
),
(
  'Grand Slam Offer Construction',
  'framework',
  array['offer', 'grand-slam', 'pricing'],
  'Grand Slam Offer = an offer so good people feel stupid saying no. Five components: (1) dream outcome stated plainly with a number, (2) increase perceived likelihood with proof/guarantees, (3) decrease time delay (give a fast win in week 1), (4) decrease effort/sacrifice (done-for-you, simple), (5) bonus stack with stated dollar values that compound the core offer. Common diagnostic finding: prospects pitch a service ("I build websites") instead of an outcome ("you will get 10 booked jobs in 90 days or I work free"). Reframing the headline outcome alone often doubles conversion.'
),
(
  'Churn and LTV',
  'framework',
  array['churn', 'ltv', 'retention'],
  'Most businesses overestimate churn tolerance. If monthly churn is 10%, average customer lifespan is only 10 months — a $200/mo product has $2k LTV, which means CAC must stay below ~$500 for the business to compound. Cut churn in half and LTV doubles instantly. Top churn levers: onboarding speed (do they get a win in week 1?), perceived progress (do they see a metric move?), community/identity (do they belong to something?). Diagnostic question: what is the customer experiencing at day 7, day 30, day 60 — and where do they drop off? Fix the drop-off cliff before adding more leads.'
),
(
  'Pricing Power',
  'framework',
  array['pricing', 'offer', 'positioning'],
  'Price is a signal of value. Charging more forces you to deliver more, attracts a better customer (less price-sensitive, more committed), and funds the marketing math that lets you outbid competitors on ads. The diagnostic: if you raised price 2x tomorrow and lost half your customers, you would make the same revenue with half the operational load — and the customers who stayed are the ones worth keeping. Most service businesses are underpriced by 2-5x relative to outcomes delivered. The fix is not a price hike alone — it is repackaging into a tiered offer (good/better/best) with the middle tier 2-3x the old single price, anchored against a premium tier 5-10x higher.'
);
