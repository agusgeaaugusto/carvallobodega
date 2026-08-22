const FOLDERS = {
  hero: '1xeSge-gbTnnxZ95YHsLbP7Px0ba75bAa',
  products: '1j_7G3-rRiKGNWoT4FMuacOK7TYMe1o6P',
  promotions: '1aWpSm5kUZKq5jMQj1BX-84b88h6T5OAm',
  gallery: '1k2G6hXziDsq-x-lvTIKuQX-fPehr85YM',
  logos: '1AQctc6l8Ms5pLbih97RuLBNF2O-CCUD2'
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
