const db = require('./db');

function postPatient(req, res) {
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const { name, age, gender, disease, address } = JSON.parse(body);

            if (!name || !age || !gender || !disease || !address) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    message: 'Semua field wajib diisi: name, age, gender, disease, address'
                }));
            }

            const sql = `
                INSERT INTO patients (name, age, gender, disease, address)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(sql, [name, age, gender, disease, address], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: err.message }));
                }

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: 'Data pasien berhasil ditambahkan!',
                    patient_id: result.insertId,
                    data: { name, age, gender, disease, address }
                }));
            });

        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Format JSON tidak valid', error: e.message }));
        }
    });
}

module.exports = postPatient;
