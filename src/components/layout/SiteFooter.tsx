import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/20">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          Asset Studio
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/studio" className="text-muted-foreground transition-colors hover:text-foreground">
            Studio
          </Link>
          <Link href="/help" className="text-muted-foreground transition-colors hover:text-foreground">
            Ajuda
          </Link>
          <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
            Privacidade
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Asset Studio</p>
      </div>
    </footer>
  );
}
