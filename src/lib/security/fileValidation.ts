/**
 * File validation utilities for secure file uploads
 * Implements OWASP file upload security best practices
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Allowed MIME types for image uploads
 * Explicitly excludes SVG, HTML, XML to prevent XSS
 */
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/avif',
    'image/bmp',
] as const;

/**
 * Magic bytes (file signatures) for validation
 * Used to verify actual file type, not just MIME type header
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
    'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    'image/jpeg': [
        [0xff, 0xd8, 0xff, 0xe0], // JFIF
        [0xff, 0xd8, 0xff, 0xe1], // EXIF
        [0xff, 0xd8, 0xff, 0xe2], // Canon
        [0xff, 0xd8, 0xff, 0xe3], // Samsung
    ],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // "RIFF" header
    'image/avif': [[0x00, 0x00, 0x00]], // ftyp box (partial)
    'image/bmp': [[0x42, 0x4d]], // "BM"
};

/**
 * Blocked file extensions that could execute code
 */
const BLOCKED_EXTENSIONS = [
    '.svg',
    '.html',
    '.htm',
    '.xml',
    '.js',
    '.mjs',
    '.cjs',
    '.php',
    '.exe',
    '.sh',
    '.bat',
    '.cmd',
];

/**
 * Validates file against security criteria
 * @throws Error with user-friendly message if validation fails
 */
export async function validateFile(file: File): Promise<void> {
    // 1. Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
    }

    if (file.size === 0) {
        throw new Error('Arquivo vazio.');
    }

    // 2. Check file extension
    const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (extension && BLOCKED_EXTENSIONS.includes(extension)) {
        throw new Error(
            `Tipo de arquivo não permitido por motivos de segurança: ${extension}`
        );
    }

    // 3. Validate MIME type (first pass)
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        throw new Error(
            'Formato não suportado. Use PNG, JPG, WebP, AVIF ou BMP.'
        );
    }

    // 4. Validate magic bytes (prevents MIME spoofing)
    await validateMagicBytes(file);
}

/**
 * Validates file magic bytes against expected signatures
 * This prevents MIME type spoofing attacks
 */
async function validateMagicBytes(file: File): Promise<void> {
    const signatures = FILE_SIGNATURES[file.type];
    if (!signatures) {
        throw new Error('Tipo de arquivo não suportado.');
    }

    // Read first 16 bytes
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check if any signature matches
    const isValid = signatures.some((signature) =>
        signature.every((byte, index) => bytes[index] === byte)
    );

    if (!isValid) {
        throw new Error(
            'Arquivo corrompido ou tipo de arquivo não corresponde à extensão.'
        );
    }
}

/**
 * Sanitizes filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
        .replace(/\.{2,}/g, '.') // Remove multiple dots
        .replace(/^\.+/, '') // Remove leading dots
        .slice(0, 255); // Limit length
}
