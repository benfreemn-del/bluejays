import { listOnboardDocs } from "@/lib/onboard-docs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

import DocsClient from "./DocsClient";

/**
 * /dashboard/clients/[slug]/docs — admin Docs tab.
 *
 * Three sections:
 *   1. Credentials — per-client password vault (CRUD).
 *      Backed by client_credentials table, AES-256-GCM at rest.
 *   2. Signed acknowledgments — recent rows from onboarding_acks.
 *   3. Registered onboarding docs — sign URLs from onboard-docs.ts
 *      so Ben can copy the link to share with a client.
 *
 * Pattern: see CLAUDE.md "Per-Client Docs + Credentials Pattern".
 */

export const dynamic = "force-dynamic";

type SignedAck = {
  id: string;
  doc_key: string;
  signer_name: string;
  signer_email: string | null;
  signer_role: string | null;
  notes: string | null;
  signed_at: string;
  replies: Record<string, string>;
};

async function getSignedAcks(slug: string): Promise<SignedAck[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("onboarding_acks")
      .select(
        "id, doc_key, signer_name, signer_email, signer_role, notes, signed_at, replies",
      )
      .eq("client_slug", slug)
      .order("signed_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data as SignedAck[];
  } catch {
    return [];
  }
}

export default async function ClientDocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [signedAcks] = await Promise.all([getSignedAcks(slug)]);
  const registeredDocs = listOnboardDocs(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <DocsClient
        slug={slug}
        initialSignedAcks={signedAcks}
        registeredDocs={registeredDocs}
      />
    </div>
  );
}
