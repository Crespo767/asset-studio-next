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
              Sua arte é sua. Nós não queremos vê-la, muito menos guardá-la.
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
                <CardTitle className="text-lg">Processamento local</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                O Asset Studio não possui backend para armazenar imagens. Remoção de fundo, redimensionamento, crop e efeitos de layout rodam no seu navegador, usando apenas as APIs do dispositivo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Cloud className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Extensão com IA (opcional)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Quando você usa a função &quot;Gerar extensão com IA&quot;, a imagem é enviada de forma temporária a um serviço de IA (Cloudflare Workers AI) para gerar as laterais. A imagem não é armazenada nem usada para treinamento; é processada e descartada. Esse é o único caso em que dados saem do seu navegador.
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
                Não coletamos, armazenamos nem analisamos suas imagens para fins de analytics ou histórico. O uso do site pode envolver cookies ou métricas mínimas do provedor de hospedagem; o conteúdo das suas imagens não é rastreado.
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
