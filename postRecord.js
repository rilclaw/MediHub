const db = require('./db');

function postRecord(req, res) {
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const { patient_id, diagnosis, treatment, visit_date } = JSON.parse(body);

            if (!patient_id || !diagnosis || !treatment || !visit_date) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    message: 'Semua field wajib diisi: patient_id, diagnosis, treatment, visit_date'
                }));
            }

            db.query('SELECT * FROM patients WHERE id = ?', [patient_id], (err, rows) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: err.message }));
                }

                if (rows.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Pasien tidak ditemukan' }));
                }

                const sql = `
                    INSERT INTO medical_records (patient_id, diagnosis, treatment, visit_date)
                    VALUES (?, ?, ?, ?)
                `;
                db.query(sql, [patient_id, diagnosis, treatment, visit_date], (err2, result) => {
                    if (err2) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: err2.message }));
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        message: 'Riwayat pasien berhasil ditambahkan!',
                        record_id: result.insertId,
                        data: { patient_id, diagnosis, treatment, visit_date }
                    }));
                });
            });

        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON tidak valid', error: e.message }));
        }
    });
}

module.exports = postRecord;
