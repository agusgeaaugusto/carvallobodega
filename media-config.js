/*
  Pegá aquí UNA sola vez la URL de tu Web App de Google Apps Script.
  Después de eso, la página detectará automáticamente nuevas imágenes
  de las carpetas configuradas sin mostrar enlaces a Google Drive al cliente.
*/
window.CARVALLO_MEDIA_API = window.CARVALLO_MEDIA_API || 'https://script.google.com/macros/s/AKfycbzRj4UFvW8uTaAryB6MmsYvcls2aNFOeumX1tTN_FumKSXAATwtTDxAHGSd_3XyCaRmKA/exec';
window.CARVALLO_MEDIA_REFRESH_MS = 300000; // revisa cambios cada 5 minutos, sin bloquear la carga

// Copia liviana de las imágenes actuales. Se muestra al instante mientras
// Google Drive comprueba en segundo plano si existe contenido más reciente.
window.CARVALLO_MEDIA_FALLBACK = {
  success: true,
  hero: [
    { id: '1yfDmB0u6seMVChOQzcMXbX-RTl7L0GDv', modified: 1787358195000, localUrl: 'assets/hero.webp' }
  ],
  products: [
    { id: '1fu36jlpRJkDHKaMarPrnPDz1iuEo3sXk', modified: 1787419302000, localUrl: 'assets/product-1.webp' },
    { id: '1ZCn23YzssxMr6NPBHQGsMCTEF5mfzcO0', modified: 1787407353000, localUrl: 'assets/product-2.webp' }
  ],
  promotions: [
    { id: '1Wqeo97o-9pHaLf3pXxZSiVjv2O28m77A', modified: 1787366777000, localUrl: 'assets/promo-1.webp' },
    { id: '1szr-95Mm6nZmjUpZrq469D1wXAgvccO3', modified: 1787366777000, localUrl: 'assets/promo-2.webp' }
  ],
  gallery: [
    { id: '14w142onCBP_GMKosxVrfaRy8yQ__XlSL', modified: 1787407353000, localUrl: 'assets/product-2.webp' }
  ]
};
