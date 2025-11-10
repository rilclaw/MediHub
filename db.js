const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'medihub',
  port: '3307'

});

db.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database MediHub:', err.message);
  } else {
    console.log('Koneksi ke database MediHub berhasil');
  }
});

module.exports = db;
