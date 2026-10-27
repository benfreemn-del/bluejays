import { llmsText } from "../_lib/llms";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(llmsText(true), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
