// /medical-record-service/routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Koneksi ke DB lokal (untuk tabel medical_records)
const axios = require('axios'); 
require('dotenv').config();

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL; 

router.post('/', async (req, res) => {
    const { patient_id, diagnosis, treatment, visit_date } = req.body;
    if (!patient_id || !diagnosis || !treatment || !visit_date) {
        return res.status(400).json({ message: 'Semua field wajib diisi: patient_id, diagnosis, treatment, visit_date' });
    }

    try {
        await axios.get(`${PATIENT_SERVICE_URL}/api/patients/${patient_id}`);
        

    } catch (error) {
        console.error('AXIOS INTEGRATION FAILED:', error.message); 
        console.error('Request URL:', `${PATIENT_SERVICE_URL}/api/patients/${patient_id}`);
        
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Gagal: Patient ID tidak ditemukan (Verifikasi API Gagal).' });
        }
        
        return res.status(500).json({ message: 'Error komunikasi dengan Patient Service.' });
    }

    const sql = `
        INSERT INTO medical_records (patient_id, diagnosis, treatment, visit_date)
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(sql, [patient_id, diagnosis, treatment, visit_date], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({ 
            message: 'Riwayat pasien berhasil ditambahkan melalui integrasi API!', 
            record_id: result.insertId 
        });
    });
});

router.get('/', (req, res) => {
    const sql = `SELECT * FROM medical_records ORDER BY visit_date DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server Error: Gagal mengambil semua rekam medis.' });
        }
        
        if (results.length === 0) {
            return res.status(200).json({ message: 'Tidak ada rekam medis ditemukan.', data: [] });
        }
        
        res.json(results);
    });
});

router.get('/:id', (req, res) => {
    const recordId = req.params.id;
    
    db.query('SELECT * FROM medical_records WHERE id = ?', [recordId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Rekam Medis tidak ditemukan.' });
        }
        
        res.json(results[0]);
    });
});

// --- GET BY PATIENT ID: /api/records/patient/:patientId ---
// (Endpoint untuk mengambil semua riwayat satu pasien)
router.get('/patient/:patientId', async (req, res) => {
    const patientId = req.params.patientId;
    
    const sql = `
        SELECT * FROM medical_records 
        WHERE patient_id = ? 
        ORDER BY visit_date DESC
    `;
    
    db.query(sql, [patientId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server Error: Gagal mengambil riwayat medis.' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: `Tidak ada rekam medis ditemukan untuk Patient ID ${patientId}.` });
        }
        
        res.json(results);
    });
});

// --- PUT /api/records/:id (Hanya Update Detail Medis) ---
router.put('/:id', async (req, res) => {
    const recordId = parseInt(req.params.id); // Pastikan konversi ke integer
    const body = req.body || {};
    
    // 1. Ambil data lama untuk digunakan sebagai fallback dan verifikasi keberadaan record
    let oldRecord;
    try {
        const results = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM medical_records WHERE id = ?', [recordId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Rekam Medis tidak ditemukan.' });
        }
        oldRecord = results[0];
    } catch (err) {
        console.error('DATABASE ERROR during record retrieval:', err.message);
        return res.status(500).json({ error: 'Gagal mengambil data lama dari database.' });
    }
    
    // 2. Tentukan Nilai Update (Partial Update)
    // patient_id selalu menggunakan nilai LAMA (oldRecord.patient_id)
    const patient_id = oldRecord.patient_id; 
    
    // Field lain menggunakan nilai BARU (body) atau nilai LAMA
    const diagnosis = body.diagnosis || oldRecord.diagnosis;
    const treatment = body.treatment || oldRecord.treatment;
    const visit_date = body.visit_date || oldRecord.visit_date;

    // VALIDASI SEDERHANA: Pastikan setidaknya ada data untuk di-update
    // Kita tidak perlu validasi patient_id, karena kita menggunakan yang lama.
    if (!body.diagnosis && !body.treatment && !body.visit_date) {
        return res.status(400).json({ message: 'Minimal salah satu field (diagnosis, treatment, atau visit_date) wajib diisi untuk update.' });
    }

    // 3. Lakukan Update di DB lokal (Gunakan semua data, lama dan baru)
    const sql = `
        UPDATE medical_records 
        SET patient_id = ?, diagnosis = ?, treatment = ?, visit_date = ?
        WHERE id = ?
    `;
    const values = [patient_id, diagnosis, treatment, visit_date, recordId];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error during update:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
            // Seharusnya tidak terjadi jika sudah melewati SELECT, tapi untuk keamanan
            return res.status(404).json({ message: 'Rekam Medis tidak ditemukan (setelah SELECT).' }); 
        }

        // Ambil data terbaru untuk response
        db.query('SELECT * FROM medical_records WHERE id = ?', [recordId], (err2, results) => {
             if (err2) return res.status(500).json({ error: err2.message });
             res.status(200).json({
                 message: 'Detail Rekam Medis berhasil diperbarui tanpa memverifikasi Patient Service!',
                 record: results[0]
             });
         });
    });
});

// --- DELETE /api/records/:id (Hapus Rekam Medis) ---
router.delete('/:id', (req, res) => {
    const recordId = req.params.id;
    const sql = 'DELETE FROM medical_records WHERE id = ?';

    db.query(sql, [recordId], (err, result) => {
        if (err) {
            console.error('Database error during delete:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rekam Medis tidak ditemukan.' });
        }

        res.status(200).json({ 
            message: 'Rekam Medis berhasil dihapus!',
            deleted_record_id: recordId
        });
    });
});

module.exports = router;