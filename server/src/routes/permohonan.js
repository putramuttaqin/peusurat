const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const csv = require('csv-parser');
const { storage } = require('../config/server-config');

const DOCUMENTS_CSV = path.join(storage.documents.directory, storage.documents.filename);

// Initialize document storage
const initDocumentStorage = () => {
  try {
    if (!fs.existsSync(storage.documents.directory)) {
      fs.mkdirSync(storage.documents.directory, { recursive: true });
      console.log(`Created storage directory: ${storage.documents.directory}`);
    }

    if (!fs.existsSync(DOCUMENTS_CSV)) {
      fs.writeFileSync(DOCUMENTS_CSV, 
        'Tanggal,Jam,Perihal Surat,Ruang Pemohon,Pemohon,Tanggal Surat,Nomor Surat\n'
      );
      console.log(`Initialized new CSV file: ${DOCUMENTS_CSV}`);
    }
  } catch (err) {
    console.error('Document storage initialization failed:', err);
    throw err; // Fail fast during startup
  }
};

// Stream processor for prepending records
const prependDocumentRecord = async (newRecord) => {
  const tempFile = `${DOCUMENTS_CSV}.tmp`;
  
  try {
    // 1. Write new record to temp file
    const headers = Object.keys(newRecord).join(',');
    fs.writeFileSync(tempFile, `${headers}\n${Object.values(newRecord).join(',')}\n`);

    // 2. Stream existing content (skip header)
    if (fs.existsSync(DOCUMENTS_CSV)) {
      await new Promise((resolve, reject) => {
        const headerRemover = new Transform({
          transform(chunk, _, callback) {
            if (!this._headerSkipped) {
              this._headerSkipped = true;
              const str = chunk.toString();
              const newlinePos = str.indexOf('\n');
              callback(null, newlinePos >= 0 ? str.slice(newlinePos + 1) : '');
            } else {
              callback(null, chunk);
            }
          }
        });

        fs.createReadStream(DOCUMENTS_CSV)
          .pipe(headerRemover)
          .pipe(fs.createWriteStream(tempFile, { flags: 'a' }))
          .on('finish', resolve)
          .on('error', reject);
      });
    }

    // 3. Atomic replacement
    fs.renameSync(tempFile, DOCUMENTS_CSV);
  } catch (err) {
    // Clean up temp file on failure
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile).catch(() => {});
    }
    throw err;
  }
};

// Initialize on module load
initDocumentStorage();

/**
 * @api {post} /api/documents Submit new document
 * @apiName SubmitDocument
 */
router.post('/submit', async (req, res) => {
  try {
    const now = new Date();
    const document = {
      Tanggal: now.toLocaleDateString('en-US'),
      Jam: now.toLocaleTimeString('en-US', { hour12: false }),
      'Perihal Surat': req.body.perihalSurat,
      'Ruang Pemohon': req.body.ruangPemohon,
      Pemohon: req.body.pemohon,
      'Tanggal Surat': req.body.tanggalSurat,
      'Nomor Surat': req.body.nomorSurat || 'TEMP-' + Date.now()
    };

    await prependDocumentRecord(document);
    res.status(201).json({ 
      success: true,
      document: {
        ...document,
        _links: {
          view: `/api/documents/${encodeURIComponent(document['Nomor Surat'])}`
        }
      }
    });
  } catch (err) {
    console.error('Document submission failed:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save document',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @api {get} /api/documents List all documents
 * @apiName GetDocuments
 */
router.get('/entries', (req, res) => {
  const documents = [];
  let hasError = false;

  fs.createReadStream(DOCUMENTS_CSV)
    .pipe(csv())
    .on('data', (data) => documents.push(data))
    .on('end', () => {
      if (!hasError) {
        res.json({
          count: documents.length,
          documents: documents.map(doc => ({
            ...doc,
            _links: {
              download: `/api/documents/download/${encodeURIComponent(doc['Nomor Surat'])}`
            }
          }))
        });
      }
    })
    .on('error', (err) => {
      hasError = true;
      console.error('Document read error:', err);
      res.status(500).json({ 
        success: false,
        error: 'Failed to retrieve documents'
      });
    });
});

/**
 * @api {get} /api/documents/download Download CSV
 * @apiName DownloadDocuments
 */
router.get('/download', (req, res) => {
  const downloadName = `permohonan-${new Date().toISOString().split('T')[0]}.csv`;
  
  res.download(DOCUMENTS_CSV, downloadName, (err) => {
    if (err) {
      console.error('Download failed:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    }
  });
});

module.exports = router;