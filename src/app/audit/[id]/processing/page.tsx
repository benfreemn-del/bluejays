import ProcessingClient from "./ProcessingClient";

export const metadata = {
  title: "Generating your audit — BlueJays",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AuditProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcessingClient auditId={id} />;
}
