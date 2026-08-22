const FOLDERS = {
  hero: '1zJZHuwFVwl7MJFzFOV7qbDhpYsoRHLEK',
  products: '1_-lG2xz2Wx3p65Np-zBOy-QcpjKHIdao',
  promotions: '1-VMly5Nc-u0eWAFoOy1AKSlBk54eim0O',
  gallery: '1KIJffYi8T6m5krsmLolyxhMIwEXtpfPt',
  logos: '1uB9c5sl2PTctLTBw0MjrBkec3vFfjNSy'
};

function doGet() {
  const payload = {updatedAt: new Date().toISOString()};
  Object.keys(FOLDERS).forEach(key => payload[key] = listImages_(FOLDERS[key]));
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function listImages_(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const rows = [];
  while (files.hasNext()) {
    const f = files.next();
    if (!/^image\//i.test(f.getMimeType())) continue;
    rows.push({
      id: f.getId(),
      name: f.getName(),
      modified: f.getLastUpdated().getTime(),
      url: 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w2200'
    });
  }
  rows.sort((a,b) => b.modified - a.modified);
  return rows;
}
