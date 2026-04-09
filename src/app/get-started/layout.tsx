// Server component layout — exports metadata for the /get-started route.
// The actual page is a "use client" component and cannot export metadata directly.
export { metadata } from "./metadata";

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
