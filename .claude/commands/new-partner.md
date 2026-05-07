---
description: Onboard a new BlueJays sales partner — IC agreement, partners row, W-9 self-serve link.
argument-hint: "<full legal name> [email] [venmo-or-zelle-handle]"
---

# /new-partner $ARGUMENTS

Onboard a new sales partner end-to-end. Order matters — companion docs
must exist before partner can be paid (see CLAUDE.md "Partner First-
Payout Gate").

## Steps

1. **Generate IC agreement** at
   `docs/contracts/<First Last> - Independent Contractor Agreement.md`
   by copying `docs/contracts/Madie - Independent Contractor Agreement.md`
   and replacing:
   - `[Madie's full legal name]` → partner's full legal name
   - `[DATE — fill before signing]` → today's date
   - `[Madie's mailing address — for 1099-NEC]` → leave blank, partner fills
   - Commission table: keep $200/$1000 unless Ben overrides
   - Section heading "Madie" references → partner's first name

2. **Generate the SQL** to create the `partners` row. Drop it inline
   in chat (Inline-SQL rule) for Ben to paste into Supabase SQL Editor:

   ```sql
   insert into public.partners (code, name, email, phone, payout_handle, status, client_slug)
   values (
     '<slugified-first-last>',
     '<Full Legal Name>',
     '<email-from-args-or-blank>',
     null,
     '<venmo-or-zelle-from-args-or-blank>',
     'approved',  -- skip the pending review since Ben is onboarding manually
     'bluejays'
   );
   ```

3. **Print the W-9 upload link** for Ben to text/email the partner:
   `https://bluejayportfolio.com/partners/<slugified-code>/w9`

4. **Print the partner dashboard link** so the partner can verify their
   record + grab their `?ref=` link:
   `https://bluejayportfolio.com/partners/<slugified-code>`

5. **Print the next-steps checklist** for Ben in chat:
   - [ ] Sign + countersign the IC agreement (file as PDF)
   - [ ] Send W-9 upload link to partner
   - [ ] Confirm `payout_handle` once partner confirms Venmo/Zelle
   - [ ] First payout blocked until all three are filled

## Don't

- Don't create the partner_documents row — partner uploads via
  `/partners/[code]/w9` themselves (URL-as-secret pattern).
- Don't email the partner from Claude — print the message draft for
  Ben to send from his own inbox so the relationship is human-to-human.
- Don't commit the IC agreement until Ben says "looks good" — it's
  a personalized legal doc, review-then-ship.

## When this is useful

- Adding partner #2, #3, ... onward
- Re-onboarding a paused partner with a fresh agreement
