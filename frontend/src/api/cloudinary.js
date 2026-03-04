const CLOUD_NAME    = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error('Missing Cloudinary env vars. Check REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in .env');
}

/**
 * Upload a file directly to Cloudinary (unsigned preset, auto resource type).
 * Cloudinary auto-detects pdf → raw, video → video, etc.
 * @param {File}     file        - The File object from an <input type="file">
 * @param {Function} onProgress  - Optional callback(percent: number)
 * @returns {Promise<string>}    - Resolves with the secure download URL
 */
export const uploadToCloudinary = (file, onProgress) =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', 'auto');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        const msg = JSON.parse(xhr.responseText)?.error?.message || 'Cloudinary upload failed.';
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(formData);
  });
