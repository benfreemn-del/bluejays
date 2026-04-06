export default function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
          <span className="font-bold text-lg">BlueJays</span>
        </div>
        <p className="text-muted text-sm">
          &copy; {new Date().getFullYear()} BlueJays. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
