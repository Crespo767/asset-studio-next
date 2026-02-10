/**
 * Script de Teste de Rate Limiting
 * 
 * Este script testa se o rate limiting está funcionando corretamente
 * fazendo múltiplas requisições rápidas para a API.
 * 
 * Uso:
 *   node scripts/test-rate-limit.js
 * 
 * Resultado esperado:
 *   - Primeiras 10 requisições: status 400 (sem body válido) ou 500
 *   - Requisições 11-15+: status 429 (rate limited) ou 403 (IP bloqueado)
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api/remove-bg';
const TOTAL_REQUESTS = 20;

async function testRateLimit() {
    console.log('🧪 Testando Rate Limiting...\n');
    console.log(`📍 URL: ${API_URL}`);
    console.log(`📊 Total de requisições: ${TOTAL_REQUESTS}\n`);

    const results = [];
    const startTime = Date.now();

    // Fazer requisições em paralelo para testar rate limiting
    const promises = Array.from({ length: TOTAL_REQUESTS }, async (_, i) => {
        try {
            const reqStartTime = Date.now();
            const response = await fetch(API_URL, {
                method: 'POST',
                body: new FormData(), // Body vazio para simplificar
            });

            const reqEndTime = Date.now();
            const duration = reqEndTime - reqStartTime;

            const result = {
                request: i + 1,
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`,
                headers: {
                    rateLimit: response.headers.get('X-RateLimit-Limit'),
                    remaining: response.headers.get('X-RateLimit-Remaining'),
                    reset: response.headers.get('X-RateLimit-Reset'),
                }
            };

            results.push(result);
            return result;
        } catch (error) {
            results.push({
                request: i + 1,
                status: 'ERROR',
                error: error.message
            });
        }
    });

    await Promise.all(promises);

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Ordenar por número de requisição
    results.sort((a, b) => a.request - b.request);

    // Exibir resultados
    console.log('📝 Resultados:\n');
    results.forEach(result => {
        const emoji = result.status === 429 ? '🚫' :
            result.status === 403 ? '⛔' :
                result.status >= 400 ? '⚠️' : '✅';
        console.log(`${emoji} Request ${result.request}: Status ${result.status} ${result.statusText || ''} (${result.duration})`);

        if (result.headers.rateLimit) {
            console.log(`   └─ Rate Limit: ${result.headers.remaining}/${result.headers.rateLimit} restantes`);
        }
    });

    console.log(`\n⏱️  Tempo total: ${totalDuration}ms`);

    // Análise
    const rateLimited = results.filter(r => r.status === 429).length;
    const blocked = results.filter(r => r.status === 403).length;
    const errors = results.filter(r => r.status >= 400 && r.status < 429).length;
    const success = results.filter(r => r.status < 400).length;

    console.log('\n📊 Análise:');
    console.log(`✅ Sucesso: ${success}`);
    console.log(`⚠️  Erros (4xx/5xx): ${errors}`);
    console.log(`🚫 Rate Limited (429): ${rateLimited}`);
    console.log(`⛔ Bloqueado (403): ${blocked}`);

    // Validação
    console.log('\n🔍 Validação:');

    if (rateLimited >= 5) {
        console.log('✅ Rate limiting está funcionando! (≥5 requisições bloqueadas)');
    } else {
        console.log('❌ FALHA: Rate limiting NÃO está funcionando adequadamente!');
        console.log('   Esperado: pelo menos 5 requisições com status 429');
        console.log(`   Obtido: ${rateLimited} requisições com status 429`);
    }

    if (blocked > 0) {
        console.log(`✅ Abuse tracking detectado! (${blocked} requisições bloqueadas com 403)`);
    }

    console.log('\n💡 Nota: Status 400/500 é esperado para requisições sem arquivo válido.');
    console.log('   O importante é que após ~10 requisições, o status mude para 429 (rate limited).\n');
}

// Executar teste
testRateLimit().catch(error => {
    console.error('❌ Erro ao executar teste:', error);
    process.exit(1);
});
