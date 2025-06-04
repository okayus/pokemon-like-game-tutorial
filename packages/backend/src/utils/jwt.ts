// Simple JWT implementation for demo purposes
// In production, use a proper JWT library

interface JWTPayload {
  userId: number;
  exp?: number;
}

export async function generateToken(payload: JWTPayload, secret?: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: payload.exp || now + 86400, // 24 hours
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await createSignature(message, secret || 'default-secret');
  
  return `${message}.${signature}`;
}

export async function verifyToken(token: string, secret?: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  const [encodedHeader, encodedPayload, signature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const expectedSignature = await createSignature(message, secret || 'default-secret');
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }
  
  const payload = JSON.parse(atob(encodedPayload)) as JWTPayload & { exp: number };
  
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }
  
  return payload;
}

async function createSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const key = encoder.encode(secret);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}