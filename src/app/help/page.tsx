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
import { ArrowLeft, HelpCircle, Eraser, Crop, FileImage, Maximize2, Sparkles } from 'lucide-react';

const faqs = [
  {
    question: 'Como funciona a remoção de fundo?',
    answer: `O Asset Studio usa a API remove.bg para remover o fundo da imagem. Basta carregar a imagem no Studio e clicar em "Remover Fundo". O resultado é uma imagem PNG com fundo transparente.\n\nNota: a remoção de fundo requer uma API key do remove.bg (os primeiros 50 usos/mês são gratuitos).`,
  },
  {
    question: 'Como faço para rotacionar uma imagem vertical para horizontal?',
    answer: `No Studio, abra a seção "Rotação e Flip" e clique no botão de 90° na direção desejada. Para imagens verticais que precisam ficar horizontais, basta rotacionar 90° para a esquerda ou direita.`,
  },
  {
    question: 'Posso recortar a imagem livremente?',
    answer: `Sim! Na seção "Recorte", clique em "Abrir Recorte". Um editor interativo permite selecionar exatamente a área que deseja manter. Use o zoom para detalhes e confirme quando estiver satisfeito.`,
  },
  {
    question: 'Quais formatos posso exportar?',
    answer: `O Asset Studio suporta: PNG (sem perda, ideal para transparência), JPG (menor tamanho com controle de qualidade), WebP (moderno e eficiente), AVIF (alta compressão), BMP (compatibilidade) e ICO (ícones).`,
  },
  {
    question: 'Como altero a resolução e a qualidade?',
    answer: `Na seção "Resolução", escolha um preset (HD, Full HD, 4K, etc.) ou digite as dimensões manualmente. Na seção "Formato e Qualidade", use o slider para ajustar a qualidade (disponível para JPG, WebP e AVIF).`,
  },
];

const quickTopics = [
  {
    icon: Eraser,
    title: 'Remoção de fundo',
    description: 'Remove o fundo automaticamente usando a API remove.bg. Resultado profissional em segundos.',
  },
  {
    icon: Crop,
    title: 'Recorte e Rotação',
    description: 'Recorte livre, rotação em 90°, flip horizontal e vertical. Tudo interativo.',
  },
  {
    icon: FileImage,
    title: 'Formato e Qualidade',
    description: 'PNG, JPG, WebP, AVIF, BMP, ICO. Resolução personalizável com presets prontos.',
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
                  Dúvidas sobre as ferramentas do Asset Studio.
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
            <p className="text-sm font-medium text-foreground">Pronto para editar?</p>
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
