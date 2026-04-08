import fs from "fs";
import path from "path";

const repoRoot = "/home/ubuntu/bluejays";
const targetFiles = [
  path.join(repoRoot, "src/components/templates/TemplateLayout.tsx"),
  ...fs.readdirSync(path.join(repoRoot, "src/components/templates"))
    .filter((name) => /^V2.*Preview\.tsx$/.test(name))
    .map((name) => path.join(repoRoot, "src/components/templates", name)),
  path.join(repoRoot, "src/app/api/social-proof/route.ts"),
];

for (const file of targetFiles) {
  const original = fs.readFileSync(file, "utf8");
  let updated = original;

  updated = updated.replaceAll(
    "47 businesses in your area upgraded their website this month",
    "Custom-built preview for this business"
  );

  updated = updated.replace(
    /message:\s*`\$\{generated\} businesses upgraded their website this month`,/g,
    'message: "Custom-built preview sites generated from real prospect records",'
  );

  if (updated !== original) {
    fs.writeFileSync(file, updated);
    console.log(`Updated ${path.relative(repoRoot, file)}`);
  }
}
