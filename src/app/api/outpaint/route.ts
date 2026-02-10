import { NextResponse } from 'next/server';

const DEFAULT_PROMPT =
  "seamless horizontal extension of the same scene, natural continuation left and right, no visible seams or borders, single continuous image, consistent art style and lighting, fantasy map, tabletop game map, high quality";

function fileToDataUri(buffer: ArrayBuffer, mime: string): string {
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${mime};base64,${base64}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const maskFile = formData.get('mask') as File;
    const prompt = (formData.get('prompt') as string)?.trim() || DEFAULT_PROMPT;
    const strengthRaw = formData.get('strength') as string | null;
    const strength = strengthRaw != null ? Math.min(1, Math.max(0.1, parseFloat(strengthRaw))) : 0.88;
    const provider = ((formData.get('provider') as string) || 'cloudflare').toLowerCase();
    const width = parseInt((formData.get('width') as string) || '0', 10) || 1920;
    const height = parseInt((formData.get('height') as string) || '0', 10) || 1080;

    if (!imageFile || !maskFile) {
      return NextResponse.json({ error: 'Imagem ou máscara faltando.' }, { status: 400 });
    }

    const imageBuffer = await imageFile.arrayBuffer();
    const maskBuffer = await maskFile.arrayBuffer();

    // --- fal.ai (SDXL, melhor qualidade) ---
    if (provider === 'fal') {
      const FAL_KEY = process.env.FAL_KEY;
      if (!FAL_KEY) {
        return NextResponse.json(
          { error: 'fal.ai requer FAL_KEY no servidor. Configure em .env.local ou use Cloudflare.' },
          { status: 400 }
        );
      }

      const imageDataUri = fileToDataUri(imageBuffer, imageFile.type || 'image/png');
      const maskDataUri = fileToDataUri(maskBuffer, maskFile.type || 'image/png');

      const falRes = await fetch('https://fal.run/fal-ai/fast-sdxl/inpainting', {
        method: 'POST',
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            image_url: imageDataUri,
            mask_url: maskDataUri,
            prompt,
            negative_prompt: 'blurry, low resolution, distorted, duplicate, text, watermark',
            image_size: { width, height },
            strength: Math.min(0.95, Math.max(0.5, strength)),
            guidance_scale: 7.5,
            num_inference_steps: 25,
            format: 'png',
          },
        }),
      });

      if (!falRes.ok) {
        const errText = await falRes.text();
        console.error('fal.ai error:', falRes.status, errText);
        return NextResponse.json(
          { error: `fal.ai: ${errText || falRes.statusText}` },
          { status: falRes.status }
        );
      }

      const data = await falRes.json();
      const imageUrl = data.data?.images?.[0]?.url ?? data.images?.[0]?.url;
      if (!imageUrl) {
        return NextResponse.json({ error: 'fal.ai não retornou imagem.' }, { status: 502 });
      }

      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return NextResponse.json({ error: 'Falha ao baixar imagem do fal.ai.' }, { status: 502 });
      }
      const resultBlob = await imgRes.blob();
      return new NextResponse(resultBlob, {
        headers: { 'Content-Type': resultBlob.type || 'image/png' },
      });
    }

    // --- Cloudflare (padrão) ---
    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    if (!ACCOUNT_ID || !API_TOKEN) {
      return NextResponse.json(
        { error: 'Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN em .env.local' },
        { status: 500 }
      );
    }

    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const maskArray = Array.from(new Uint8Array(maskBuffer));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image: imageArray,
          mask: maskArray,
          strength,
          num_steps: 20,
          guidance: 7.5,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare error:', response.status, errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const resultBlob = await response.blob();
    return new NextResponse(resultBlob, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error: unknown) {
    console.error('Outpaint error:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
