const express = require('express');
const router = express.Router();
const db = require('../db'); 
const axios = require('axios'); 
require('dotenv').config();

const http = require('http');

const ipv4Agent = new http.Agent({ family: 4 });

// Definisikan URL untuk service eksternal (sesuaikan dengan port Anda)
const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL; 
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL; 

// Fungsi Helper untuk Verifikasi Data Eksternal
const verifyEntities = async (patientId, doctorId) => {
    // --- DEBUGGING URL ---
    const patientUrl = `${PATIENT_SERVICE_URL}/api/patients/${patientId}`;
    const doctorUrl = `${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`;

    console.log(`[DEBUG] Verifying Patient URL: ${patientUrl}`);
    console.log(`[DEBUG] Verifying Doctor URL: ${doctorUrl}`);
    // --- END DEBUGGING URL ---

    // 1. Verifikasi Pasien
    await axios.get(patientUrl, { httpAgent: ipv4Agent });
    
    // 2. Verifikasi Dokter
    await axios.get(doctorUrl, { httpAgent: ipv4Agent });
};


// --- C R U D FUNCTIONS ---

// POST /api/appointments - Membuat Janji Temu Baru
router.post('/', async (req, res) => {
    const { patient_id, doctor_id, appointment_date, reason } = req.body;
    
    if (!patient_id || !doctor_id || !appointment_date || !reason) {
        return res.status(400).json({ message: 'Semua field wajib diisi: patient_id, doctor_id, appointment_date, reason' });
    }

    try {
        // Verifikasi keberadaan Pasien dan Dokter sebelum menyimpan
        await verifyEntities(patient_id, doctor_id);
    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message); 
        
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Gagal: Patient ID atau Doctor ID tidak ditemukan (Verifikasi API Gagal).' });
        }
        return res.status(500).json({ message: 'Error komunikasi dengan Patient/Doctor Service.' });
    }

    // Simpan Janji Temu
    const sql = 'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, ?, ?)';
    db.query(sql, [patient_id, doctor_id, appointment_date, reason], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Janji temu berhasil dibuat!', appointment_id: result.insertId });
    });
});

// GET /api/appointments - Mendapatkan Semua Janji Temu (Read All)
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM appointments ORDER BY appointment_date DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET /api/appointments/:id - Mendapatkan Detail Janji Temu (Read Detail)
router.get('/:id', (req, res) => {
    const appointmentId = req.params.id; 
    db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Janji temu tidak ditemukan' });
        }
        res.json(results[0]); 
    });
});

// PUT /api/appointments/:id - Mengubah Janji Temu (Update)
router.put('/:id', async (req, res) => {
    const appointmentId = req.params.id;
    const body = req.body || {}; 

    // Ambil data lama untuk partial update dan verifikasi ID
    let oldAppointment;
    try {
        const results = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Janji temu tidak ditemukan.' });
        }
        oldAppointment = results[0];
    } catch (err) {
        console.error('DB ERROR:', err.message);
        return res.status(500).json({ error: 'Gagal mengambil data lama.' });
    }

    // Tentukan nilai update (menggunakan nilai lama sebagai default)
    const patient_id = body.patient_id || oldAppointment.patient_id;
    const doctor_id = body.doctor_id || oldAppointment.doctor_id;
    const appointment_date = body.appointment_date || oldAppointment.appointment_date;
    const reason = body.reason || oldAppointment.reason;
    const status = body.status || oldAppointment.status;

    // Lakukan verifikasi jika patient_id atau doctor_id diubah
    if (body.patient_id || body.doctor_id) {
        try {
            await verifyEntities(patient_id, doctor_id);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ message: 'Gagal: Patient ID atau Doctor ID baru tidak valid.' });
            }
            return res.status(500).json({ message: 'Error komunikasi saat memverifikasi ID baru.' });
        }
    }

    const sql = `
        UPDATE appointments 
        SET patient_id = ?, doctor_id = ?, appointment_date = ?, reason = ?, status = ?
        WHERE id = ?
    `;
    const values = [patient_id, doctor_id, appointment_date, reason, status, appointmentId];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Janji temu tidak ditemukan untuk diubah.' });
        }

        // Ambil data terbaru
        db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId], (err2, results) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.status(200).json({
                message: 'Janji temu berhasil diperbarui!',
                appointment: results[0]
            });
        });
    });
});

// DELETE /api/appointments/:id - Menghapus Janji Temu (Delete)
router.delete('/:id', (req, res) => {
    const appointmentId = req.params.id;
    const sql = 'DELETE FROM appointments WHERE id = ?';

    db.query(sql, [appointmentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Janji temu tidak ditemukan.' });
        }

        res.status(200).json({ 
            message: 'Janji temu berhasil dihapus!',
            deleted_id: appointmentId
        });
    });
});

module.exports = router;