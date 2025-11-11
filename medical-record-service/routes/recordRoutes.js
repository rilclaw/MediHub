// /medical-record-service/routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Koneksi ke DB lokal (untuk tabel medical_records)
const axios = require('axios'); 
require('dotenv').config();

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL; 

// POST /api/records - Membuat rekam medis dengan verifikasi Patient Service
router.post('/', async (req, res) => {
    // 1. Ambil data dari req.body (Express style)
    const { patient_id, diagnosis, treatment, visit_date } = req.body;
    
    // Validasi input dasar
    if (!patient_id || !diagnosis || !treatment || !visit_date) {
        return res.status(400).json({ message: 'Semua field wajib diisi: patient_id, diagnosis, treatment, visit_date' });
    }

    try {
        // Panggil endpoint GET /api/patients/:id di Patient Service (Port 3001)
        await axios.get(`${PATIENT_SERVICE_URL}/api/patients/${patient_id}`);
        

    } catch (error) {
        // Tampilkan error di terminal Medical Record Service
        console.error('AXIOS INTEGRATION FAILED:', error.message); 
        console.error('Request URL:', `${PATIENT_SERVICE_URL}/api/patients/${patient_id}`);
        
        // ... Logika 404
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Gagal: Patient ID tidak ditemukan (Verifikasi API Gagal).' });
        }
        
        // Error koneksi/lainnya
        return res.status(500).json({ message: 'Error komunikasi dengan Patient Service.' });
    }

    // --- 3. Simpan Rekam Medis ke DB lokal setelah verifikasi sukses ---
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

// get all
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

// get detail by record id
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

module.exports = router;