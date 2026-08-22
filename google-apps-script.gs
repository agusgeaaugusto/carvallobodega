const FOLDERS = {
  hero: '1zJZHuwFVwl7MJFzFOV7qbDhpYsoRHLEK',
  products: '1_-lG2xz2Wx3p65Np-zBOy-QcpjKHIdao',
  promotions: '1-VMly5Nc-u0eWAFoOy1AKSlBk54eim0O',
  gallery: '1KIJffYi8T6m5krsmLolyxhMIwEXtpfPt',
  logos: '1uB9c5sl2PTctLTBw0MjrBkec3vFfjNSy'
};

function doGet() {
  try {
    const payload = {
      success: true,
      updatedAt: new Date().toISOString()
    };

    Object.keys(FOLDERS).forEach(function (key) {
      payload[key] = listImages(FOLDERS[key]);
    });

    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function listImages(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const images = [];

  while (files.hasNext()) {
    const file = files.next();

    if (!file.getMimeType().startsWith('image/')) {
      continue;
    }

    images.push({
      id: file.getId(),
      name: file.getName(),
      modified: file.getLastUpdated().getTime(),
      url: 'https://drive.google.com/thumbnail?id=' +
           file.getId() +
           '&sz=w2200'
    });
  }

  images.sort(function (a, b) {
    return b.modified - a.modified;
  });

  return images;
}
