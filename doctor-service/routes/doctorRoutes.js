const express = require('express');
const router = express.Router();
const db = require('../db'); 

// post
router.post('/', (req, res) => {
    const { name, specialty, contact } = req.body;
    if (!name || !specialty) {
        return res.status(400).json({ message: 'Name and specialty are required' });
    }
    const sql = 'INSERT INTO doctors (name, specialty, contact) VALUES (?, ?, ?)';
    db.query(sql, [name, specialty, contact], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Doctor added successfully', id: result.insertId });
    });
});

// get all
router.get('/', (req, res) => {
    db.query('SELECT * FROM doctors', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// get by id
router.get('/:id', (req, res) => {
    const doctorId = req.params.id;
    db.query('SELECT * FROM doctors WHERE id = ?', [doctorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(results[0]);
    });
});

// update
router.put('/:id', (req, res) => {
    const doctorId = req.params.id;
    const { name, specialty, contact } = req.body;

    // 1. Validasi input
    if (!name || !specialty) {
        return res.status(400).json({ message: 'Name and specialty are required' });
    }

    // 2. Query UPDATE
    const sql = `
        UPDATE doctors
        SET name = ?, specialty = ?, contact = ?
        WHERE id = ?
    `;

    db.query(sql, [name, specialty, contact, doctorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Cek apakah ada baris yang terpengaruh (artinya ID ditemukan dan diupdate)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found or data unchanged.' });
        }

        res.json({ 
            message: 'Doctor data updated successfully.', 
            updated_id: doctorId
        });
    });
});

// delete
router.delete('/:id', (req, res) => {
    const doctorId = req.params.id;

    // 1. Query DELETE
    db.query('DELETE FROM doctors WHERE id = ?', [doctorId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Cek apakah ada baris yang terhapus
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        res.json({ 
            message: 'Doctor deleted successfully.', 
            deleted_id: doctorId
        });
    });
});


module.exports = router;