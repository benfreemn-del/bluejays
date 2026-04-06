export default function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 100 100" fill="white">
              <path d="M62 12C58 8 52 10 50 14L46 10C44 9 43 11 45 13L48 16C44 18 40 22 38 28C30 26 22 30 20 36C18 38 16 44 18 48C14 50 12 56 16 60C14 64 16 68 20 70C22 76 28 80 36 82L32 88C30 92 34 94 38 92L40 86C44 88 48 88 52 86L54 92C58 94 62 92 60 88L56 82C64 80 70 76 74 70C80 66 82 58 78 52C82 48 80 42 76 38C78 30 74 24 68 20C66 18 64 14 62 12ZM42 36C44 32 48 32 48 36C48 40 44 42 42 40C40 38 40 36 42 36Z"/>
              <path d="M56 16C58 10 64 6 68 8C66 12 62 14 58 16Z"/>
              <path d="M52 14C52 8 56 4 60 5C58 9 56 12 52 14Z"/>
            </svg>
          </div>
          <span className="font-bold text-lg">BlueJays</span>
        </div>
        <p className="text-muted text-sm">
          &copy; {new Date().getFullYear()} BlueJays. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
