import { Metadata } from "next";
import DiagnosisClientView from "./DiagnosisClientView";

export const metadata: Metadata = {
  title: "Your Business Health Check — BlueJays",
  description: "Fill in the missing numbers to see your business health score.",
  robots: { index: false, follow: false },
};

// URL-as-secret pattern (CLAUDE.md auth model). The page renders even
// for invalid tokens; the API tells us if the token is valid/expired
// and the UI surfaces the right state.
export default async function DiagnosisTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <DiagnosisClientView token={token} />;
}
