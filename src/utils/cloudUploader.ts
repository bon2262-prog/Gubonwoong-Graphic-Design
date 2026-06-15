export interface StorageSettings {
  provider: 'cloudinary' | 'supabase' | 'catbox' | 'local';
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryFolder: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseBucket: string;
  supabaseFolder: string;
}

export const LOCAL_SETTINGS_KEY = 'portfolio_cloud_storage_settings';

// Load default settings from environment variables or localStorage overrides
export function getStorageSettings(): StorageSettings {
  const metaEnv = (import.meta as any).env || {};

  // Check localStorage for user overrides
  try {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.provider) {
        return {
          provider: parsed.provider || 'local',
          cloudinaryCloudName: parsed.cloudinaryCloudName || metaEnv.VITE_CLOUDINARY_CLOUD_NAME || '',
          cloudinaryUploadPreset: parsed.cloudinaryUploadPreset || metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || '',
          cloudinaryFolder: parsed.cloudinaryFolder || '',
          supabaseUrl: parsed.supabaseUrl || metaEnv.VITE_SUPABASE_URL || '',
          supabaseAnonKey: parsed.supabaseAnonKey || metaEnv.VITE_SUPABASE_ANON_KEY || '',
          supabaseBucket: parsed.supabaseBucket || metaEnv.VITE_SUPABASE_BUCKET || 'portfolio-assets',
          supabaseFolder: parsed.supabaseFolder || 'uploads'
        };
      }
    }
  } catch (e) {
    console.error('Failed to load storage settings from localStorage:', e);
  }

  // Fallback to pure environment variables
  return {
    provider: (metaEnv.VITE_CLOUDINARY_CLOUD_NAME && metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET) 
      ? 'cloudinary' 
      : (metaEnv.VITE_SUPABASE_URL && metaEnv.VITE_SUPABASE_ANON_KEY)
      ? 'supabase'
      : 'catbox', // default to direct browser CDN upload if env vars are empty
    cloudinaryCloudName: metaEnv.VITE_CLOUDINARY_CLOUD_NAME || '',
    cloudinaryUploadPreset: metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    cloudinaryFolder: 'portfolio',
    supabaseUrl: metaEnv.VITE_SUPABASE_URL || '',
    supabaseAnonKey: metaEnv.VITE_SUPABASE_ANON_KEY || '',
    supabaseBucket: metaEnv.VITE_SUPABASE_BUCKET || 'portfolio-assets',
    supabaseFolder: 'uploads'
  };
}

export function saveStorageSettings(settings: StorageSettings): void {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save storage settings to localStorage:', e);
  }
}

/**
 * Uploads a base64 asset directly to Cloudinary or Supabase Storage from the browser.
 * Perfect for static hosting platforms like Netlify.
 */
export async function uploadToCloudProvider(
  base64: string,
  filename: string,
  settings: StorageSettings
): Promise<string> {
  const provider = settings.provider;

  if (provider === 'cloudinary') {
    if (!settings.cloudinaryCloudName || !settings.cloudinaryUploadPreset) {
      throw new Error('Cloudinary Cloud Name and Upload Preset must be configured.');
    }

    let mimeType = 'image/jpeg';
    let dataString = base64;
    if (base64.startsWith('data:')) {
      const parts = base64.split(';base64,');
      if (parts.length > 1) {
        dataString = parts[1];
      }
      const match = base64.match(/^data:(.*?);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    const formData = new FormData();
    // Cloudinary upload API accepts the full base64 string with data URI scheme in the 'file' field
    const filePayload = base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${dataString}`;
    formData.append('file', filePayload);
    formData.append('upload_preset', settings.cloudinaryUploadPreset);
    if (settings.cloudinaryFolder) {
      formData.append('folder', settings.cloudinaryFolder);
    }

    console.log(`[Cloudinary Direct] Uploading ${filename} to Cloudinary...`);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/auto/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.secure_url) {
      console.log(`[Cloudinary Direct] Success! URL: ${data.secure_url}`);
      return data.secure_url;
    }
    if (data.url) {
      console.log(`[Cloudinary Direct] Success! URL: ${data.url}`);
      return data.url;
    }
    throw new Error('Cloudinary response did not contain secure_url or url.');
  }

  else if (provider === 'supabase') {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey || !settings.supabaseBucket) {
      throw new Error('Supabase URL, Anon Key, and Bucket Name must be configured.');
    }

    let mimeType = 'image/jpeg';
    let dataString = base64;
    if (base64.startsWith('data:')) {
      const parts = base64.split(';base64,');
      if (parts.length > 1) {
        dataString = parts[1];
      }
      const match = base64.match(/^data:(.*?);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    // Convert Base64 back to binary data array
    const byteCharacters = atob(dataString);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Build a unique and clean filename
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    const folderPath = settings.supabaseFolder ? `${settings.supabaseFolder}/` : '';
    const fullPath = `${folderPath}${uniqueName}`;

    // Clean up base URL
    const cleanBaseUrl = settings.supabaseUrl.replace(/\/$/, '');
    const uploadUrl = `${cleanBaseUrl}/storage/v1/object/${settings.supabaseBucket}/${fullPath}`;

    console.log(`[Supabase Direct] Uploading ${filename} to Supabase bucket: ${settings.supabaseBucket}...`);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.supabaseAnonKey}`,
        'apikey': settings.supabaseAnonKey,
        'Content-Type': mimeType
      },
      body: blob
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase upload failed: ${response.status} - ${errText}`);
    }

    const publicUrl = `${cleanBaseUrl}/storage/v1/object/public/${settings.supabaseBucket}/${fullPath}`;
    console.log(`[Supabase Direct] Success! Public URL: ${publicUrl}`);
    return publicUrl;
  }

  else if (provider === 'catbox') {
    // Already defined logic for direct Catbox.moe
    let mimeType = 'image/jpeg';
    let dataString = base64;
    if (base64.startsWith('data:')) {
      const parts = base64.split(';base64,');
      if (parts.length > 1) {
        dataString = parts[1];
      }
      const match = base64.match(/^data:(.*?);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    let cleanFilename = filename;
    if (mimeType.startsWith('video/')) {
      if (!filename.endsWith('.mp4') && !filename.endsWith('.mov') && !filename.endsWith('.avi') && !filename.endsWith('.webm')) {
        cleanFilename = `${filename}.mp4`;
      }
    }

    const byteCharacters = atob(dataString);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', blob, cleanFilename);

    console.log(`[Catbox Direct] Uploading ${cleanFilename} to Catbox CDN...`);
    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm,
    });

    if (catboxRes.ok) {
      const textStr = await catboxRes.text();
      const finalUrl = textStr.trim();
      if (finalUrl && finalUrl.startsWith('http')) {
        console.log(`[Catbox Direct] Success! URL: ${finalUrl}`);
        return finalUrl;
      }
    }
    throw new Error(`Catbox upload failed with response: ${catboxRes.status}`);
  }

  // Local/Dev API fallback
  throw new Error('Local server fallback required.');
}
