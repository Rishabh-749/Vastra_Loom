/**
 * Helper to safely extract and optimize image URLs, especially for ImageKit.
 * ImageKit free tier requires explicit transformation width for high-resolution images (>25MP),
 * preventing 400 Bad Request errors on massive uploads and optimizing page speed.
 */
export const getImageUrl = (imageItem, width = 1200) => {
  if (!imageItem) return '';
  let url = typeof imageItem === 'string' ? imageItem : (imageItem.url || '');
  if (!url) return '';
  
  if (url.includes('ik.imagekit.io') && !url.includes('tr=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tr=w-${width},q-85`;
  }
  return url;
};

export default getImageUrl;
