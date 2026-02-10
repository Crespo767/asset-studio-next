'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  Sparkles,
  Maximize2,
  FileImage,
  Monitor,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Extensão com IA',
    description: 'Transforme imagens verticais em mapas horizontais para Foundry VTT. A IA preenche as laterais de forma natural, sem duplicar a cena.',
  },
  {
    icon: Maximize2,
    title: 'Layout e wallpapers',
    description: 'Fit com fundo blur, sólido ou gradiente; crop interativo; ou extensão por mirror/stretch. Tudo no navegador.',
  },
  {
    icon: Monitor,
    title: 'Presets prontos',
    description: '1080p, 4K, Ultrawide e presets para Foundry VTT (16:9 e 3:2, 100px/grid). Ideal para mapas de RPG.',
  },
  {
    icon: FileImage,
    title: 'Otimização e formatos',
    description: 'Exporte em PNG, JPG, WebP ou ICO. Controle de qualidade e meta de tamanho. Batch em ZIP.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent),
                radial-gradient(ellipse 60% 40% at 80% 50%, hsl(var(--primary) / 0.08), transparent)
              `,
            }}
          />
          <div className="container mx-auto max-w-6xl px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Ferramentas para mestres e criadores
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Suas imagens, prontas para o jogo.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Remoção de fundo, redimensionamento e extensão com IA. Sem upload, sem espera — 100% no seu controle.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild size="lg" className="h-11 px-6 text-base shadow-lg shadow-primary/25">
                  <Link href="/studio">
                    Abrir Studio
                    <Zap className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6">
                  <Link href="/help">Como funciona</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Tudo o que você precisa
            </h2>
            <p className="mt-3 text-muted-foreground">
              Processamento local e opção de IA para estender cenários. Privado e rápido.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-border/60 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary/80" />
                Processamento local
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary/80" />
                Sem upload obrigatório
              </span>
              <span>Foundry VTT • Mapas • Wallpapers</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
