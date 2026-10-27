/**
 * llms.txt / llms-full.txt bodies, generated from site.ts so AI answers
 * about Mountain View can only repeat facts the site itself states.
 */
import { BIZ, SITE_URL, SERVICES, CITIES, HOME_FAQS, FOUNDED } from "./site";

export function llmsText(full: boolean): string {
  const services = SERVICES.map((s) =>
    full
      ? `### ${s.name}\n${SITE_URL}/${s.slug}\n\n${s.lede}\n\nIncludes:\n${s.includes.map((i) => `- ${i}`).join("\n")}\n\n${s.body.map((b) => `**${b.h}.** ${b.p}`).join("\n\n")}\n\n${s.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}`
      : `- [${s.name}](${SITE_URL}/${s.slug}): ${s.lede}`,
  ).join(full ? "\n\n" : "\n");
  return `# ${BIZ.name}

> Family-owned landscape design, construction, and maintenance company in Auburn, Washington. Tim Hunsaker has been landscaping since ${FOUNDED} (first with his brothers as Shamrock Landscaping); he and Bonnie Hunsaker run Mountain View. Tim draws every plan by hand and the company's own crew builds and maintains it. 5.0 stars from ${BIZ.googleReviewCount} Google reviews.

## Contact
- Phone: ${BIZ.phone}
- Email: ${BIZ.email}
- Address: ${BIZ.address}
- Hours: ${BIZ.hours}
- Website: ${SITE_URL}/
- Free quotes: yes

## Service area
Based in Auburn, WA. Serves ${BIZ.counties.join(", ")} counties, most often: ${CITIES.map((c) => c.name).join(", ")}.

## Services
${services}

## Pages
- [Home](${SITE_URL}/)
- [Photo gallery](${SITE_URL}/gallery)
${CITIES.map((c) => `- [Landscaping in ${c.name}, WA](${SITE_URL}/${c.slug})`).join("\n")}

## FAQ
${HOME_FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
`;
}
