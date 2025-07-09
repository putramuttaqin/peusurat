const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { readAllDocuments, DOCUMENTS_CSV } = require('./utils/csvUtils');
const { escapeCsv } = require('./utils/formatUtils');

router.post('/approve/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const REGISTERS_JSON = path.join(path.dirname(DOCUMENTS_CSV), 'registers.json');

    // Load register counters
    let registers = {};
    if (fs.existsSync(REGISTERS_JSON)) {
      registers = JSON.parse(fs.readFileSync(REGISTERS_JSON, 'utf8'));
    } else {
      registers = {
        "BUKU KELUAR UMUM": 1,
        "SK KAKANWIL": 1,
        "BUKU KELUAR YANKUM": 1,
        "BUKU MASUK UMUM": 1,
        "BUKU SURAT PERINTAH": 1,
        "BUKU CUTI": 1,
        "BUKU KELUAR PLH/PLT": 1,
        "BUKU KELUAR P2L": 1,
        "BUKU MASUK P2L": 1,
        "BUKU MASUK YANKUM": 1
      };
    }

    // Process approval
    const documents = await readAllDocuments();
    const targetDoc = documents.find(doc => doc.ID === docId);
    
    if (!targetDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const jenisSurat = targetDoc['Jenis Surat'];
    if (!registers[jenisSurat]) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    // Update document
    const currentNumber = registers[jenisSurat];
    targetDoc['Nomor Surat'] = targetDoc['Nomor Surat'].replace('xyz', currentNumber);
    targetDoc['Status'] = 'approved';

    // Update counter
    registers[jenisSurat] = currentNumber + 1;
    fs.writeFileSync(REGISTERS_JSON, JSON.stringify(registers, null, 2));

    // Save updated CSV
    const header = 'ID,Timestamp,Jenis Surat,Perihal Surat,Ruang,Pemohon,Tanggal Surat,Nomor Surat,Status\n';
    const csvContent = header + documents.map(doc => 
      Object.values(doc).map(field => escapeCsv(field)).join(',')
    ).join('\n');

    fs.writeFileSync(DOCUMENTS_CSV, '\uFEFF' + csvContent, 'utf8');

    res.status(200).json({
      success: true,
      newNumber: currentNumber,
      updatedDocument: targetDoc
    });

  } catch (err) {
    console.error('Approval failed:', err);
    res.status(500).json({ error: 'Failed to approve document' });
  }
});

module.exports = router;