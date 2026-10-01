/**
 * API service for communicating with the backend PDF compression server.
 * All compression and processing logic is performed on the backend.
 */

export const DEFAULT_BACKEND_URL = 'http://localhost:8080/api/compress';

/**
 * Sends a PDF file and compression settings to the backend.
 *
 * @param {File} file - The PDF file to compress
 * @param {Object} settings - Compression parameters (quality, dpi, grayscale, etc.)
 * @param {string} endpointUrl - Backend API endpoint
 * @returns {Promise<{name: string, originalSize: number, compressedSize: number, blob: Blob}>}
 */
export async function compressPdfWithBackend(file, settings, endpointUrl = DEFAULT_BACKEND_URL) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('preset', settings.preset);
  formData.append('quality', String(settings.quality));
  formData.append('dpi', String(settings.dpi));
  formData.append('stripMetadata', String(settings.stripMetadata));
  formData.append('grayscale', String(settings.grayscale));

  const response = await fetch(endpointUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Backend returned status ${response.status}: ${errorText || response.statusText || 'Compression failed'}`
    );
  }

  const compressedBlob = await response.blob();

  return {
    name: file.name,
    originalSize: file.size,
    compressedSize: compressedBlob.size,
    blob: compressedBlob,
  };
}
