import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import { validateFile } from '@/lib/security/fileValidation';

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
};

export async function POST(req: Request) {
    try {
        // 1. Rate limiting
        const clientIp = getClientIp(req);
        const rateLimitResult = rateLimit(clientIp, RATE_LIMIT_CONFIG);

        if (!rateLimitResult.success) {
            // Track abuse for persistent offenders
            const { trackAbuse, isAbusive } = await import('@/lib/security/rateLimit');
            trackAbuse(clientIp);

            const isAbusiveIp = isAbusive(clientIp);

            return NextResponse.json(
                {
                    error: isAbusiveIp
                        ? 'IP bloqueado por abuso. Entre em contato com o suporte.'
                        : 'Muitas requisições. Tente novamente em alguns instantes.'
                },
                {
                    status: isAbusiveIp ? 403 : 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
                    },
                }
            );
        }

        // 2. Check API key
        const apiKey = process.env.REMOVEBG_API_KEY;
        if (!apiKey || apiKey === 'INSERT_YOUR_API_KEY_HERE') {
            return NextResponse.json(
                { error: 'Configure REMOVEBG_API_KEY no arquivo .env.local' },
                { status: 500 }
            );
        }

        // 3. Validate request body
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Nenhuma imagem enviada.' },
                { status: 400 }
            );
        }

        // 4. Validate file security
        try {
            await validateFile(imageFile);
        } catch (validationError) {
            const message = validationError instanceof Error
                ? validationError.message
                : 'Arquivo inválido.';
            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }

        // 5. Call remove.bg API
        const removeBgForm = new FormData();
        removeBgForm.append('image_file', imageFile);
        removeBgForm.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: removeBgForm,
        });

        if (!response.ok) {
            // Don't expose detailed error messages to client
            console.error('remove.bg error:', response.status, await response.text());
            return NextResponse.json(
                { error: 'Erro ao processar imagem. Tente novamente.' },
                { status: response.status }
            );
        }

        // 6. Return result
        const resultBlob = await response.blob();
        return new NextResponse(resultBlob, {
            headers: {
                'Content-Type': 'image/png',
                'X-Content-Type-Options': 'nosniff', // Prevent MIME sniffing
                'Cache-Control': 'private, no-cache, no-store, must-revalidate', // No caching
                'Pragma': 'no-cache', // HTTP/1.0 compatibility
                'Expires': '0', // HTTP/1.0 compatibility
                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            },
        });
    } catch (error: unknown) {
        // Generic error - don't expose internals
        console.error('Remove BG error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}
