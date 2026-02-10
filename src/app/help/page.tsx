import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowLeft, HelpCircle, FileImage, Maximize2, Wand2, Sparkles } from 'lucide-react';

const faqs = [
  {
    question: 'Por que a remoção de fundo demora na primeira vez?',
    answer: `Para garantir sua privacidade, não enviamos sua imagem para a nuvem. O Asset Studio baixa um modelo de IA (~40MB) para rodar no seu navegador.\n\n• Primeira vez: o download pode levar alguns segundos.\n• Depois: o processamento fica bem mais rápido, pois o modelo já está no seu computador.`,
  },
  {
    question: 'Como funcionam os modos de layout?',
    answer: `Há três formas de adaptar uma imagem vertical para formato horizontal:\n\n1. Fit: mantém a imagem inteira no centro e preenche as laterais com fundo (blur, sólido ou gradiente).\n2. Crop: recorte interativo para escolher a área que vai preencher a tela.\n3. Estender bordas: Mirror ou Stretch para preencher lateralmente; ou IA para expandir o cenário de forma natural (ideal para mapas Foundry VTT).`,
  },
  {
    question: 'A extensão com IA às vezes sai cinza ou com costuras. O que fazer?',
    answer: `O modelo usa aleatoriedade, então cada geração é diferente. Se o resultado não ficar bom:\n\n• Gere novamente — a próxima tentativa pode sair melhor.\n• Use orientação Horizontal, proporção 16:9 ou 3:2 e um preset Foundry (ex.: 3200×1800).\n• Quando ficar bom, clique em 👍 (Gostei) para que as próximas gerações usem as mesmas preferências.`,
  },
  {
    question: 'Quais formatos posso exportar?',
    answer: `PNG (sem perda), JPG e WebP (com controle de qualidade) e ICO para ícones. Para mapas grandes (ex.: Foundry VTT), WebP é recomendado para manter o arquivo menor e carregamento rápido.`,
  },
];

const quickTopics = [
  {
    icon: Wand2,
    title: 'IA local',
    description: 'Remoção de fundo e modelos rodam no navegador. Zero upload das suas imagens.',
  },
  {
    icon: Maximize2,
    title: 'Layout',
    description: 'Fit, crop ou estender (mirror, stretch ou IA) para wallpapers e mapas.',
  },
  {
    icon: FileImage,
    title: 'Exportação',
    description: 'PNG, JPG, WebP, ICO. Batch em ZIP com vários tamanhos.',
  },
];

export default function Help() {
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
        title="Central de Ajuda"
      />

      <main className="flex-1">
        <section className="border-b border-border/50 bg-muted/10">
          <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Central de Ajuda
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Dúvidas sobre remoção de fundo, layout e extensão com IA.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-3">
            {quickTopics.map((topic, i) => (
              <Card key={i} className="border-border/60 bg-card/50">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <topic.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14">
            <h2 className="text-lg font-semibold text-foreground mb-4">Perguntas frequentes</h2>
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border/60 px-6">
                      <AccordionTrigger className="py-5 text-left font-medium hover:text-primary hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="whitespace-pre-wrap pb-5 text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 p-8 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-primary/80" />
            <p className="text-sm font-medium text-foreground">Pronto para criar?</p>
            <p className="mt-1 text-sm text-muted-foreground">Abra o Studio e carregue sua primeira imagem.</p>
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
