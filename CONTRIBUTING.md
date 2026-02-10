# Contribuindo para o Asset Studio

Obrigado por considerar contribuir para o Asset Studio! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/asset-studio-next.git
cd asset-studio-next

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-repo/asset-studio-next.git
```

### 2. Crie uma Branch
```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch para sua feature
git checkout -b feature/nome-da-feature
```

### 3. Desenvolva
```bash
# Instale as dependências
npm install

# Configure o .env.local (se necessário)
cp .env.local.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

### 4. Teste
```bash
# Verifique o lint
npm run lint

# Teste o build
npm run build
```

### 5. Commit
```bash
# Adicione suas mudanças
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade X"
```

**Convenção de commits:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Tarefas de manutenção

### 6. Push e Pull Request
```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Abra um Pull Request no GitHub
```

## 📋 Diretrizes de Código

### TypeScript
- Use tipos explícitos sempre que possível
- Evite `any`, prefira `unknown` se necessário
- Documente funções complexas com JSDoc

### React
- Use componentes funcionais com hooks
- Prefira `const` para componentes
- Mantenha componentes pequenos e focados
- Use `'use client'` apenas quando necessário

### Estilização
- Use Tailwind CSS para estilos
- Siga as convenções do shadcn/ui
- Mantenha classes organizadas (layout → spacing → colors → typography)

### Performance
- Evite re-renders desnecessários
- Use `useMemo` e `useCallback` quando apropriado
- Otimize imagens e assets

## 🏗️ Estrutura do Projeto

```
src/
├── app/              # Next.js App Router (páginas e API routes)
├── components/       # Componentes React
│   ├── layout/      # Componentes de layout
│   ├── studio/      # Componentes do editor
│   ├── uploader/    # Upload de imagens
│   └── ui/          # shadcn/ui components
├── lib/             # Lógica de negócio
│   └── image/       # Processamento de imagens
└── hooks/           # Custom hooks
```

## 🐛 Reportando Bugs

Ao reportar um bug, inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Versão do navegador e sistema operacional

## 💡 Sugerindo Features

Ao sugerir uma feature:
- Descreva o problema que ela resolve
- Explique como ela funcionaria
- Considere alternativas
- Mencione se você pode implementá-la

## 📝 Documentação

- Atualize o README.md se necessário
- Documente novas funcionalidades
- Adicione comentários em código complexo
- Atualize o `/help` se a UI mudar

## ✅ Checklist do Pull Request

- [ ] O código segue as diretrizes de estilo
- [ ] Testei localmente (`npm run dev`)
- [ ] O build passa sem erros (`npm run build`)
- [ ] Atualizei a documentação (se necessário)
- [ ] Meu PR tem uma descrição clara
- [ ] Adicionei screenshots (se mudanças visuais)

## 🤝 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros contribuidores

## 📞 Dúvidas?

- Abra uma [Issue](https://github.com/your-repo/issues) com a tag `question`
- Consulte a documentação em `/help`

---

**Obrigado por contribuir! 🎉**
