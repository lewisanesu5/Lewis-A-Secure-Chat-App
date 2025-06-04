const keyStr = 'your-32-char-password-for-aes!!'; // Must be 32 chars for AES-256

export async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyStr),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(message) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const encoded = new TextEncoder().encode(message);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
}

export async function decrypt(encrypted) {
  const iv = new Uint8Array(encrypted.iv);
  const key = await getKey();
  const ciphertext = new Uint8Array(encrypted.data);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}