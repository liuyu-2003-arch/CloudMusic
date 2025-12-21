/**
 * MinIO Upload Service with S3 Signature V4
 * Handles authenticated file uploads and deletions to MinIO.
 */

const MINIO_CONFIG = {
  endpoint: 'https://oss.324893.xyz/',
  bucket: 'homepage',
  accessKey: 'upload-bot',
  secretKey: 'bot-password-123',
  region: 'us-east-1', // MinIO default
  cfHeaders: {
    'CF-Access-Client-Id': '8ec0c818745300416b1c691a74440427.access',
    'CF-Access-Client-Secret': '3f6e2e7972cf2f30bb6f96f00fa45f676b1fc3a1c86dc86ffe198f92e57272a6'
  }
};

/**
 * Basic HMAC-SHA256 implementation using Web Crypto API for SigV4
 */
async function hmac(key: string | Uint8Array, data: string | Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? encoder.encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    typeof data === 'string' ? encoder.encode(data) : data
  );
  return new Uint8Array(signature);
}

function hex(buffer: Uint8Array): string {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', typeof data === 'string' ? encoder.encode(data) : data);
  return hex(new Uint8Array(hash));
}

/**
 * Helper to perform S3 SigV4 signed requests
 */
async function signedS3Request(method: 'PUT' | 'DELETE', fileUrl: string, body?: File): Promise<Response> {
  const urlObj = new URL(fileUrl);
  const host = urlObj.host;
  // Path needs to include the bucket if not using virtual-host style
  // Our URLs are https://endpoint/bucket/path
  const path = urlObj.pathname;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    'host': host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    ...MINIO_CONFIG.cfHeaders
  };

  if (method === 'PUT' && body) {
    headers['content-type'] = body.type || 'application/octet-stream';
  }

  // 1. Canonical Request
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(k => `${k.toLowerCase()}:${headers[k].trim()}`)
    .join('\n') + '\n';
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(k => k.toLowerCase())
    .join(';');

  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n');

  // 2. String to Sign
  const credentialScope = `${dateStamp}/${MINIO_CONFIG.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256(canonicalRequest)
  ].join('\n');

  // 3. Signature
  const kDate = await hmac(`AWS4${MINIO_CONFIG.secretKey}`, dateStamp);
  const kRegion = await hmac(kDate, MINIO_CONFIG.region);
  const kService = await hmac(kRegion, 's3');
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = hex(await hmac(kSigning, stringToSign));

  // 4. Final headers (excluding 'host' which browser prohibits)
  const finalHeaders = { ...headers };
  delete finalHeaders['host'];
  finalHeaders['Authorization'] = `AWS4-HMAC-SHA256 Credential=${MINIO_CONFIG.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(fileUrl, {
    method,
    headers: finalHeaders,
    body
  });
}

export const uploadFile = async (file: File, folder: string = 'music'): Promise<string> => {
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${folder}/${timestamp}_${cleanFileName}`;
  const uploadUrl = `${MINIO_CONFIG.endpoint}${MINIO_CONFIG.bucket}/${fileName}`;

  try {
    const response = await signedS3Request('PUT', uploadUrl, file);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MinIO Upload Error:', errorText);
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    return uploadUrl;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  // Only attempt deletion if it's our own MinIO URL
  if (!fileUrl.startsWith(MINIO_CONFIG.endpoint)) return;

  try {
    const response = await signedS3Request('DELETE', fileUrl);
    if (!response.ok && response.status !== 404) { // 404 is fine for deletion
      const errorText = await response.text();
      console.error('MinIO Delete Error:', errorText);
    }
  } catch (error) {
    console.error('Error deleting from MinIO:', error);
  }
};
