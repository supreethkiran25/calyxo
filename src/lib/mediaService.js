import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { isMockFirebase } from "./dbService";

/**
 * Compresses an image file on the client side using Canvas API.
 * Preserves EXIF orientation implicitly by drawing to canvas if needed (browser handles most).
 * @param {File} file 
 * @param {number} maxWidth 
 * @returns {Promise<File|Blob>}
 */
export const compressImage = async (file, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file); // Don't compress non-images
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality 0.8 is standard for high quality web compression
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob failed'));
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type, 0.8);
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Converts a file to base64 for local mocking when Firebase isn't available.
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Uploads a file to Firebase Storage (or mocks it) and reports progress.
 * @param {File} file - The file to upload
 * @param {string} userId - ID of the user uploading
 * @param {Function} onProgress - Callback(progress: number) 0-100
 * @returns {Promise<string>} - Download URL
 */
export const uploadMedia = async (file, userId, onProgress) => {
  if (!file || !userId) throw new Error("Missing file or userId");

  // 1. Mock Environment
  if (isMockFirebase) {
    return new Promise(async (resolve, reject) => {
      try {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (onProgress) onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 100);

        // Compress and convert to base64
        const compressed = await compressImage(file);
        const base64 = await fileToBase64(compressed);
        
        setTimeout(() => resolve(base64), 600); // Wait for animation
      } catch (e) {
        reject(e);
      }
    });
  }

  // 2. Production Firebase Upload
  return new Promise(async (resolve, reject) => {
    try {
      const compressed = await compressImage(file);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, `users/${userId}/uploads/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressed);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        }, 
        (error) => {
          console.error("Upload failed", error);
          reject(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};
