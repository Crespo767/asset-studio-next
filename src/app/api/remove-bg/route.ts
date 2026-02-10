import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.REMOVEBG_API_KEY;
        if (!apiKey || apiKey === 'INSERT_YOUR_API_KEY_HERE') {
            return NextResponse.json(
                { error: 'Configure REMOVEBG_API_KEY no arquivo .env.local' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Nenhuma imagem enviada.' },
                { status: 400 }
            );
        }

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
            const errorText = await response.text();
            console.error('remove.bg error:', response.status, errorText);
            return NextResponse.json(
                { error: `remove.bg: ${errorText || response.statusText}` },
                { status: response.status }
            );
        }

        const resultBlob = await response.blob();
        return new NextResponse(resultBlob, {
            headers: { 'Content-Type': 'image/png' },
        });
    } catch (error: unknown) {
        console.error('Remove BG error:', error);
        const message = error instanceof Error ? error.message : 'Erro ao processar.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
