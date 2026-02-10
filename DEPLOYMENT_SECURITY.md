# Guia de Deploy Seguro - Asset Studio

Este documento fornece orientações completas para deploy seguro do Asset Studio em produção.

---

## 📋 Checklist Pré-Deploy

### Configuração de Ambiente

- [ ] Variável `REMOVEBG_API_KEY` configurada nas variáveis de ambiente do host
- [ ] Variável `NODE_ENV=production` definida
- [ ] `.env.local` **NÃO** commitado no repositório
- [ ] `.env.example` presente no repositório (sem valores reais)
- [ ] Build de produção testado localmente (`npm run build`)

### Segurança

- [ ] HTTPS configurado e funcionando
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] HSTS header verificado em produção
- [ ] CSP testado e sem violações no console
- [ ] Rate limiting funcionando em produção
- [ ] Headers de segurança validados (securityheaders.com)

### Monitoramento

- [ ] Logging configurado (console.error em produção)
- [ ] Alertas de erro configurados (opcional: Sentry/Datadog)
- [ ] Monitoramento de uptime configurado (opcional)

---

## 🚀 Deploy em Vercel (Recomendado)

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório GitHub do Asset Studio
4. Vercel detectará automaticamente Next.js

### Passo 2: Configurar Variáveis de Ambiente

**CRÍTICO**: Configure as variáveis de ambiente no painel da Vercel:

1. Vá em "Settings" → "Environment Variables"
2. Adicione as seguintes variáveis:

```
REMOVEBG_API_KEY=sua_chave_api_aqui
NODE_ENV=production
```

**Opcional** (para proxies confiáveis):
```
TRUSTED_PROXIES=103.21.244.0,103.22.200.0
```

> **⚠️ IMPORTANTE**: Nunca exponha `REMOVEBG_API_KEY` com prefixo `NEXT_PUBLIC_`. Ela deve ser server-side only.

### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde build completar (~2-3 minutos)
3. Acesse a URL temporária fornecida (.vercel.app)
4. Teste a aplicação completa

### Passo 4: Domínio Personalizado (Opcional)

1. Vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções
4. Aguarde propagação (~5 minutos)

### Passo 5: Validação de Segurança

Após deploy, execute os testes de validação abaixo.

---

## 🌐 Deploy em Outras Plataformas

### Netlify

1. Conecte repositório no [netlify.com](https://netlify.com)
2. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Adicione variáveis de ambiente em "Site settings" → "Environment variables"
4. Deploy

### Railway

1. Conecte repositório no [railway.app](https://railway.app)
2. Railway detecta Next.js automaticamente
3. Adicione variáveis de ambiente no painel
4. Deploy

### VPS (AWS/DigitalOcean/etc.)

**Não recomendado para iniciantes**. Requer configuração manual de:
- Node.js 18+
- PM2 ou similar para process manager
- Nginx reverse proxy
- SSL/TLS certificates (Let's Encrypt)
- Firewall (UFW)
- Atualizações de segurança do SO

---

## ✅ Validação de Segurança Pós-Deploy

### 1. Verificar Headers de Segurança

**Ferramenta**: [securityheaders.com](https://securityheaders.com)

1. Acesse https://securityheaders.com
2. Insira sua URL de produção
3. Verifique score (esperado: **A+**)

**Headers esperados**:
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- ✅ `Content-Security-Policy: ...`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Cross-Origin-Embedder-Policy: require-corp`
- ✅ `Cross-Origin-Opener-Policy: same-origin`

### 2. Validar HSTS Preload (Opcional)

**Ferramenta**: [hstspreload.org](https://hstspreload.org)

> **⚠️ ATENÇÃO**: Submeter para HSTS Preload é **IRREVERSÍVEL**. Siga estas etapas:

#### Etapa 1: Validação Inicial (1 semana)

1. Deploy em produção com `max-age=300` (5 minutos)
2. Teste por 1 semana
3. Verifique que HTTPS funciona perfeitamente

#### Etapa 2: Aumento Gradual (1 mês)

1. Aumente para `max-age=604800` (1 semana)
2. Teste por mais 1 semana
3. Aumente para `max-age=2592000` (1 mês)
4. Teste por mais 2 semanas

#### Etapa 3: Preload (somente se confiante)

1. Configure `max-age=63072000; includeSubDomains; preload`
2. Acesse https://hstspreload.org
3. Insira seu domínio
4. Verifique que todas as validações passam
5. **OPCIONAL**: Clique em "Submit" para adicionar à lista de preload
   - Processo leva 3-6 meses
   - **Irreversível** - remoção é extremamente difícil

### 3. Testar Rate Limiting

**Método Manual**:

1. Abra DevTools → Console
2. Execute:
   ```javascript
   for (let i = 0; i < 15; i++) {
       fetch('/api/remove-bg', { method: 'POST', body: new FormData() })
           .then(r => console.log(`Request ${i+1}: ${r.status}`));
   }
   ```
3. Verifique que requisições 11-15 retornam **429** ou **403** (se IP abusivo)

### 4. Validar CSP (Content Security Policy)

1. Abra DevTools → Console
2. Verifique que **não há** erros de CSP
3. Tente executar script inline (deve ser bloqueado):
   ```javascript
   const script = document.createElement('script');
   script.innerHTML = 'alert("XSS")';
   document.body.appendChild(script);
   ```
4. CSP deve bloquear com erro: `Refused to execute inline script...`

### 5. Testar Upload de Arquivo

**Teste 1: Arquivo Válido**
- Upload PNG/JPG normal → deve funcionar ✅

**Teste 2: Arquivo Malicioso**
- Criar arquivo HTML e renomear para `.jpg`
- Upload → deve ser **rejeitado** com "Arquivo corrompido" ✅

**Teste 3: Arquivo SVG (XSS)**
- Upload SVG → deve ser **rejeitado** (SVG bloqueado) ✅

---

## 🔐 Gestão de Secrets

### Rotação de API Keys

**Frequência Recomendada**: A cada 90 dias

**Processo**:

1. Gerar nova API key no [remove.bg dashboard](https://www.remove.bg/dashboard#api-key)
2. Adicionar nova key nas variáveis de ambiente da plataforma
3. Aguardar deploy automatizado
4. Testar aplicação
5. Revogar API key antiga no dashboard remove.bg

### Auditoria de Secrets

**Mensal**:
- [ ] Verificar que `.env.local` não está commitado
- [ ] Verificar que nenhuma variável usa `NEXT_PUBLIC_` para secrets
- [ ] Verificar logs não expõem secrets

---

## 📊 Monitoramento e Alertas

### Logs Essenciais

**Vercel**: Automático em "Deployments" → "Logs"

**Eventos a Monitorar**:
- ❌ Erros 500 (erro interno)
- ⚠️ Erros 429 (rate limit atingido)
- ⚠️ Erros 403 (IP bloqueado por abuso)
- ℹ️ Erros 400 (validação de arquivo)

### Configurar Alertas (Opcional)

**Opção 1: Sentry** (Recomendado)

1. Criar conta em [sentry.io](https://sentry.io)
2. Instalar SDK:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```
3. Configurar DSN nas variáveis de ambiente
4. Alertas automáticos para erros

**Opção 2: Vercel Monitoring**

- Plano Pro tem integração nativa com monitoramento
- Alertas por email/Slack

---

## 🚨 Resposta a Incidentes

### Vulnerabilidade Descoberta

1. **Não** abra issue pública
2. Envie email para: [security@your-domain.com]
3. Aguarde resposta em até 48h
4. Siga processo de responsible disclosure

### API Key Comprometida

1. **IMEDIATO**: Revogar key no remove.bg dashboard
2. Gerar nova key
3. Atualizar variáveis de ambiente
4. Deploy imediato
5. Investigar logs para uso suspeito

### Ataque DDoS

**Vercel**: Proteção automática contra DDoS (layer 7)

Se necessário:
1. Verificar logs de rate limiting
2. Identificar IPs atacantes
3. Considerar Cloudflare (camada adicional)

---

## 📝 Checklist de Manutenção

### Semanal
- [ ] Revisar logs de erros
- [ ] Verificar uptime (99.9%+)

### Mensal
- [ ] Executar `npm audit`
- [ ] Atualizar dependências minor/patch
- [ ] Revisar alertas de segurança (GitHub/Dependabot)
- [ ] Testar rate limiting

### Trimestral
- [ ] Rotacionar API keys
- [ ] Verificar headers de segurança (securityheaders.com)
- [ ] Testar processo de resposta a incidentes
- [ ] Revisar documentação de segurança

### Anual
- [ ] Auditoria de segurança profissional (recomendado)
- [ ] Atualizar dependências major
- [ ] Revisar SECURITY.md e documentação

---

## 🔗 Recursos Adicionais

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Security](https://vercel.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Headers](https://securityheaders.com/)
- [HSTS Preload](https://hstspreload.org/)

---

**Última Atualização**: 2026-02-10  
**Versão**: 1.0.0
