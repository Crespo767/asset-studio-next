import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SiteHeaderProps {
  /** Conteúdo à esquerda (ex.: botão voltar). */
  left?: React.ReactNode;
  /** Título alternativo ao lado do logo (ex.: "Central de Ajuda"). */
  title?: string;
  /** Se true, mostra Ajuda + Abrir Studio no canto direito. */
  showNav?: boolean;
}

export function SiteHeader({ left, title, showNav = true }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          {left}
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
              <img src="/asset_studio.png" alt="" className="h-full w-full object-contain scale-[2.2]" />
            </div>
            <span className="font-semibold text-foreground">{title ?? 'Asset Studio'}</span>
          </Link>
        </div>
        {showNav && (
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/help">Ajuda</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/studio">Abrir Studio</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
