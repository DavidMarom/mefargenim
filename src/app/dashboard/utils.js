/**
 * Share website URL via WhatsApp
 * @param {Function} setCopied - Callback function to set copied state
 */
export async function handleShare(setCopied) {
  const url = window.location.origin;
  
  try {
    // Copy URL to clipboard
    await navigator.clipboard.writeText(url);
    if (setCopied) {
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        if (setCopied) {
          setCopied(false);
        }
      }, 2000);
    }
    
    // Open WhatsApp web with the URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error sharing:', error);
    // Fallback: try to open WhatsApp directly
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
    window.open(whatsappUrl, '_blank');
  }
}
