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



module.exports = router;