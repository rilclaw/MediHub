const express = require('express');
const router = express.Router();
const db = require('../db'); 

// POST: /api/patients (Adaptasi dari postPatient.js)
router.post('/', (req, res) => {
    const { name, age, gender, disease, address } = req.body;
    const sql = 'INSERT INTO patients (name, age, gender, disease, address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, age, gender, disease, address], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Data pasien berhasil ditambahkan!', patient_id: result.insertId });
    });
});

// GET ALL: /api/patients 
router.get('/', (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET DETAIL: /api/patients/:id 
router.get('/:id', (req, res) => {
    const patientId = req.params.id; 
    db.query('SELECT * FROM patients WHERE id = ?', [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(results[0]); 
    });
});

// PUT: /api/patients/:id (Update data pasien)
router.put('/:id', (req, res) => {
    const patientId = req.params.id;
    const { name, age, gender, disease, address } = req.body;

    // Validasi input sederhana
    if (!name || !age || !gender) {
        return res.status(400).json({ error: 'Field name, age, dan gender wajib diisi.' });
    }

    const sql = `
        UPDATE patients 
        SET name = ?, age = ?, gender = ?, disease = ?, address = ?
        WHERE id = ?
    `;
    const values = [name, age, gender, disease, address, patientId];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
        }

        // Ambil data terbaru setelah update
        db.query('SELECT * FROM patients WHERE id = ?', [patientId], (err2, results) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.status(200).json({
                message: 'Data pasien berhasil diperbarui!',
                patient: results[0]
            });
        });
    });
});

router.delete('/:id', (req, res) => {
    const patientId = req.params.id;
    const sql = `DELETE FROM patients WHERE id = ?`;

    db.query(sql, [patientId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Periksa apakah ada baris yang terhapus (affectedRows > 0)
        if (result.affectedRows === 0) {
            // Jika affectedRows 0, berarti pasien dengan ID tersebut tidak ditemukan
            return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
        }

        // Jika berhasil dihapus
        res.status(200).json({ 
            message: 'Data pasien berhasil dihapus!',
            deleted_id: patientId 
        });
    });
});

module.exports = router;