# Asset Studio

![Asset Studio](public/asset_studio.png)

**Asset Studio** é uma ferramenta web moderna e profissional para manipulação de imagens, focada em 5 funcionalidades essenciais. Processamento rápido, interface intuitiva e 100% no navegador (exceto remoção de fundo).

## 🎯 Funcionalidades

### 1. **Remoção de Fundo**
- Powered by [remove.bg](https://www.remove.bg/)
- Remoção automática de fundo com qualidade profissional
- Resultado em PNG com transparência

### 2. **Rotação e Flip**
- Rotação em incrementos de 90° (esquerda/direita)
- Flip horizontal e vertical
- Ideal para converter orientação de imagens

### 3. **Recorte Livre**
- Editor interativo com zoom
- Seleção de área personalizada
- Sem restrições de proporção

### 4. **Resolução**
- Presets prontos: HD, Full HD, 4K
- Presets para redes sociais (Instagram, Twitter, YouTube)
- **Presets Foundry VTT** (100px/grid):
  - 20×20 grid (2000×2000px)
  - 30×30 grid (3000×3000px)
  - 40×40 grid (4000×4000px)
  - 32×18 grid (3200×1800px) — 16:9
  - 64×32 grid (6400×3200px) — 16:9
- Dimensões personalizadas com trava de proporção

### 5. **Formato e Qualidade**
- **Formatos suportados**: PNG, JPG, WebP, AVIF, BMP, ICO
- Controle de qualidade para JPG, WebP e AVIF
- Otimização automática

## 🚀 Tecnologias

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Notificações**: [Sonner](https://sonner.emilkowal.ski/)
- **Cropper**: [react-easy-crop](https://github.com/ValentinH/react-easy-crop)
- **API Externa**: [remove.bg](https://www.remove.bg/api)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Setup

1. **Clone o repositório**
```bash
git clone <repository-url>
cd asset-studio-next
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
REMOVEBG_API_KEY=your_api_key_here
```

> **Obtenha sua API key**: [remove.bg Dashboard](https://www.remove.bg/dashboard#api-key)  
> **Plano gratuito**: 50 remoções/mês

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── remove-bg/       # Proxy para remove.bg API
│   ├── studio/              # Página principal do editor
│   ├── help/                # Central de ajuda
│   ├── privacy/             # Política de privacidade
│   ├── layout.tsx           # Layout raiz
│   ├── page.tsx             # Landing page
│   └── globals.css          # Estilos globais
├── components/
│   ├── layout/              # Header, Footer
│   ├── studio/              # Componentes do editor
│   │   ├── ControlsPanel.tsx    # Painel de controles
│   │   ├── PreviewPanel.tsx     # Preview em tempo real
│   │   ├── ExportPanel.tsx      # Exportação
│   │   └── CropperModal.tsx     # Modal de recorte
│   ├── uploader/
│   │   └── Dropzone.tsx     # Upload de imagens
│   └── ui/                  # shadcn/ui components
├── lib/
│   └── image/               # Lógica de processamento
│       ├── types.ts         # Tipos TypeScript
│       ├── presets.ts       # Presets de resolução/formato
│       ├── transform.ts     # Transformações Canvas API
│       └── export.ts        # Exportação de imagens
└── hooks/
    └── use-mobile.tsx       # Hook de responsividade
```

### Fluxo de Dados

```mermaid
graph LR
    A[Upload] --> B[ImageFile]
    B --> C[ToolSettings]
    C --> D[transform.ts]
    D --> E[Canvas API]
    E --> F[Preview]
    C --> G[export.ts]
    G --> H[Download]
    
    I[Remove BG Button] --> J[/api/remove-bg]
    J --> K[remove.bg API]
    K --> L[New ImageFile]
```

### Componentes Principais

#### `ControlsPanel.tsx`
- Accordion com 5 seções
- Gerencia `ToolSettings`
- Debounce para performance

#### `PreviewPanel.tsx`
- Renderização Canvas em tempo real
- Debounce de 100ms para evitar lag
- Escala automática para preview

#### `transform.ts`
- `loadImage()`: Carrega File → ImageFile
- `applyTransformations()`: Aplica rotação, flip, crop, resize
- `createPreviewCanvas()`: Versão otimizada para preview

#### `export.ts`
- `exportImage()`: Gera blob final com formato/qualidade
- `downloadBlob()`: Trigger de download

## 🎨 Design System

### Cores (CSS Variables)
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--muted: 210 40% 96.1%;
--border: 214.3 31.8% 91.4%;
```

### Componentes UI
- **Accordion**: Seções expansíveis
- **Button**: Variantes (default, outline, ghost, secondary)
- **Input/Slider**: Controles numéricos
- **Select**: Dropdowns categorizados
- **Dialog**: Modais (ex: Cropper)
- **Card**: Containers de conteúdo

## 📝 Uso

### 1. Upload de Imagem
- Arraste e solte
- Clique para selecionar
- Ctrl+V para colar da área de transferência

### 2. Aplicar Transformações
- **Remover Fundo**: Clique em "Remover Fundo" (requer API key)
- **Rotação**: Use os botões 90° Esq/Dir ou Flip H/V
- **Recorte**: Abra o modal, selecione a área, confirme
- **Resolução**: Escolha um preset ou digite dimensões personalizadas
- **Formato**: Selecione o formato de saída e ajuste a qualidade

### 3. Exportar
- Clique em "Exportar Imagem"
- Ou pressione `Ctrl+S`
- O arquivo será baixado automaticamente

## 🔧 Scripts

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint
```

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure a variável de ambiente `REMOVEBG_API_KEY`
3. Deploy automático!

### Outras plataformas
- Certifique-se de configurar `REMOVEBG_API_KEY` nas variáveis de ambiente
- Build command: `npm run build`
- Output directory: `.next`

## 🔐 Privacidade

- **Processamento Local**: Rotação, crop, resize e conversão de formato rodam 100% no navegador
- **Remoção de Fundo**: A imagem é enviada temporariamente para a API remove.bg e descartada após processamento
- **Sem Rastreamento**: Não armazenamos nem analisamos suas imagens

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Documentação**: Acesse `/help` no app
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Desenvolvido com ❤️ usando Next.js e shadcn/ui**
