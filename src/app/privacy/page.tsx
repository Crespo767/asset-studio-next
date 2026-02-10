import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ArrowLeft, Server, Eye, Cloud } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        left={
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <main className="flex-1">
        <section className="border-b border-border/50 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Privacidade levada a sério
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Sua arte é sua. Entenda como tratamos seus dados.
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14 space-y-8">
          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Processamento no navegador</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Rotação, recorte, redimensionamento e conversão de formato rodam 100% no seu navegador usando a API Canvas. Nenhuma imagem é enviada para servidores durante essas operações.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Cloud className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Remoção de fundo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Ao usar a função &quot;Remover Fundo&quot;, a imagem é enviada temporariamente à API remove.bg para processamento. A imagem é processada e descartada imediatamente — não é armazenada nem usada para treinamento. Este é o único caso em que dados saem do seu navegador.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Sem rastreamento de imagens</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Não coletamos, armazenamos nem analisamos suas imagens. O uso do site pode envolver cookies mínimos do provedor de hospedagem; o conteúdo das suas imagens nunca é rastreado.
              </CardDescription>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm font-medium text-foreground">Quer começar?</p>
            <p className="mt-1 text-sm text-muted-foreground">Tudo no seu controle, no seu navegador.</p>
            <Button asChild size="lg" className="mt-5">
              <Link href="/studio">Abrir Studio</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
