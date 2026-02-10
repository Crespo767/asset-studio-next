'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  Eraser,
  RotateCw,
  FileImage,
  Maximize2,
  Crop,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Eraser,
    title: 'Remoção de Fundo',
    description: 'Remova o fundo de qualquer imagem automaticamente. Powered by remove.bg — resultado profissional em segundos.',
  },
  {
    icon: RotateCw,
    title: 'Rotação e Flip',
    description: 'Gire imagens em 90°, 180° ou 270°. Espelhe horizontal e verticalmente. Converta vertical para horizontal.',
  },
  {
    icon: Crop,
    title: 'Recorte Livre',
    description: 'Recorte imagens de forma interativa. Selecione exatamente a área que deseja manter, sem restrições.',
  },
  {
    icon: Maximize2,
    title: 'Resolução e Qualidade',
    description: 'Redimensione para qualquer resolução. Controle fino de qualidade. Presets de HD até 4K disponíveis.',
  },
  {
    icon: FileImage,
    title: 'Conversão de Formato',
    description: 'Converta entre PNG, JPG, WebP, AVIF, BMP e ICO. Exporte no formato ideal para cada uso.',
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
                Ferramentas de imagem simples e poderosas
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Edite suas imagens em segundos.
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Remova fundos, redimensione, recorte, converta formatos e muito mais.
                Tudo direto no navegador — rápido, simples e seguro.
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
              Cinco ferramentas essenciais para editar imagens. Sem complicação.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                Processamento seguro
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary/80" />
                Rápido e simples
              </span>
              <span>PNG • JPG • WebP • AVIF • ICO • BMP</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
