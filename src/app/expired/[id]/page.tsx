import Link from "next/link";
import { getProspect } from "@/lib/store";

export default async function ExpiredPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await getProspect(id).catch(() => null);
  const businessName = prospect?.businessName || "your business";
  const category = prospect?.category || "your industry";
  const portfolioUrl = `https://bluejayportfolio.com/v2/${category}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mx-auto">
          <svg
            className="w-10 h-10 text-sky-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
            />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-3">
            This preview has expired
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            The custom site we built for <strong className="text-white">{businessName}</strong> was
            available for 30 days. That window has passed.
          </p>
        </div>

        {/* Still interested card */}
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 space-y-4 text-left">
          <p className="text-white/80 text-sm leading-relaxed">
            Still interested? We can rebuild it — just reach out and we&apos;ll
            send you a fresh preview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:bluejaycontactme@gmail.com?subject=Interested in my website preview"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
            >
              Email Ben
            </a>
            <a
              href="https://calendly.com/bluejaycontactme/website-walkthrough"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm border border-white/10"
            >
              Book a Call
            </a>
          </div>
        </div>

        {/* Portfolio link */}
        <p className="text-white/40 text-sm">
          Want to see what we build?{" "}
          <Link
            href={portfolioUrl}
            target="_blank"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
          >
            View examples for your industry
          </Link>
        </p>
      </div>
    </div>
  );
}
