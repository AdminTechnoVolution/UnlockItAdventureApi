const MIME_TO_EXTENSIONS = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};

const SHARP_FORMAT_TO_MIME = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

module.exports = {
    MIME_TO_EXTENSIONS,
    SHARP_FORMAT_TO_MIME,
};
