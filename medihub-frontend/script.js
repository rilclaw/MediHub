// script.js — MediHub: Full Integration (Patients + Doctors + Appointments)

const API_BASE = {
  patients: 'http://localhost:3001/api/patients',
  records: 'http://localhost:3002/api/records',
  doctors: 'http://localhost:3003/api/doctors',
  appointments: 'http://localhost:3004/api/appointments'
};

// === NOTIFIKASI ===
function showNotification(message, type = 'success') {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s forwards;
  `;
  notif.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => notif.remove(), 300);
  }, 3000);

  if (!document.querySelector('#notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }
}

// === HELPER: GET URL PARAM ===
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// === PASIEN ===
async function fetchPatients() {
  const tableView = document.getElementById('tableView')?.querySelector('tbody');
  const cardView = document.getElementById('cardView');
  const statsCard = document.querySelector('.stat-card .value');

  if (!tableView && !cardView) return;

  try {
    const res = await fetch(API_BASE.patients);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const patients = await res.json();

    if (statsCard) statsCard.textContent = patients.length;

    const renderRow = (p) => `
      <tr>
        <td>${p.name || '–'}</td>
        <td>${p.age || '–'}</td>
        <td>${p.disease || '–'}</td>
        <td>
          <button class="action-btn edit-btn" onclick="handleEdit('patient', ${p.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="handleDelete('patient', ${p.id})">Hapus</button>
        </td>
      </tr>
    `;

    const renderCard = (p) => `
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 class="font-bold text-lg">${p.name || '–'}</h3>
        <p>Usia: ${p.age || '–'}</p>
        <p>Penyakit: ${p.disease || '–'}</p>
        <div class="mt-2">
          <button class="action-btn edit-btn" onclick="handleEdit('patient', ${p.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="handleDelete('patient', ${p.id})">Hapus</button>
        </div>
      </div>
    `;

    if (tableView) tableView.innerHTML = patients.length ? patients.map(renderRow).join('') : '<tr><td colspan="4" class="text-center py-4">Tidak ada data</td></tr>';
    if (cardView) cardView.innerHTML = patients.length ? patients.map(renderCard).join('') : '<div class="text-center py-4">Tidak ada data</div>';

  } catch (err) {
    console.error('Fetch pasien gagal:', err);
    showNotification('❌ Gagal muat pasien', 'error');
  }
}

// === DOKTER ===
async function fetchDoctors() {
  const tableView = document.getElementById('tableView')?.querySelector('tbody');
  const cardView = document.getElementById('cardView');
  const list = document.getElementById('appointmentsList'); // for select options

  if (!tableView && !cardView && !list) return;

  try {
    const res = await fetch(API_BASE.doctors);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doctors = await res.json();

    // Render tabel/card
    if (tableView || cardView) {
      const renderRow = (d) => `
        <tr>
          <td>${d.name || '–'}</td>
          <td>${d.specialization || '–'}</td>
          <td>${d.strNumber || '–'}</td>
          <td>
            <button class="action-btn edit-btn" onclick="handleEdit('doctor', ${d.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="handleDelete('doctor', ${d.id})">Hapus</button>
          </td>
        </tr>
      `;

      const renderCard = (d) => `
        <div class="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 class="font-bold text-lg">${d.name || '–'}</h3>
          <p>Spesialisasi: ${d.specialization || '–'}</p>
          <p>STR: ${d.strNumber || '–'}</p>
          <div class="mt-2">
            <button class="action-btn edit-btn" onclick="handleEdit('doctor', ${d.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="handleDelete('doctor', ${d.id})">Hapus</button>
          </div>
        </div>
      `;

      if (tableView) tableView.innerHTML = doctors.length ? doctors.map(renderRow).join('') : '<tr><td colspan="4" class="text-center py-4">Tidak ada data</td></tr>';
      if (cardView) cardView.innerHTML = doctors.length ? doctors.map(renderCard).join('') : '<div class="text-center py-4">Tidak ada data</div>';
    }

    // Isi dropdown (untuk form janji temu)
    if (list || document.getElementById('doctorId')) {
      const select = document.getElementById('doctorId');
      if (select) {
        select.innerHTML = '<option value="">-- Pilih Dokter --</option>' + 
          doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialization})</option>`).join('');
      }
    }

  } catch (err) {
    console.error('Fetch dokter gagal:', err);
    showNotification('❌ Gagal muat dokter', 'error');
  }
}

// === JANJI TEMU ===
async function fetchAppointments() {
  const list = document.getElementById('appointmentsList');
  if (!list) return;

  try {
    const [aptRes, patRes, docRes] = await Promise.all([
      fetch(API_BASE.appointments),
      fetch(API_BASE.patients),
      fetch(API_BASE.doctors)
    ]);

    if (!aptRes.ok) throw new Error(`Appointments: HTTP ${aptRes.status}`);
    if (!patRes.ok) throw new Error(`Patients: HTTP ${patRes.status}`);
    if (!docRes.ok) throw new Error(`Doctors: HTTP ${docRes.status}`);

    const appointments = await aptRes.json();
    const patients = await patRes.json();
    const doctors = await docRes.json();

    // Buat peta untuk lookup cepat
    const patMap = Object.fromEntries(patients.map(p => [p.id, p]));
    const docMap = Object.fromEntries(doctors.map(d => [d.id, d]));

    list.innerHTML = appointments.length ? appointments.map(a => {
      const pat = patMap[a.patientId] || { name: 'Pasien Tidak Ditemukan' };
      const doc = docMap[a.doctorId] || { name: 'Dokter Tidak Ditemukan' };
      const dt = new Date(a.appointmentDate);
      const statusClass = a.status === 'confirmed' ? 'status-confirmed' : a.status === 'cancelled' ? 'status-cancelled' : 'status-pending';

      return `
        <tr>
          <td>${pat.name}</td>
          <td>${doc.name}</td>
          <td>${dt.toLocaleDateString('id-ID')} ${a.appointmentTime}</td>
          <td><span class="status-badge ${statusClass}">${a.status}</span></td>
          <td>
            <button class="action-btn delete-btn" onclick="cancelAppointment(${a.id})">Batalkan</button>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="5" class="text-center py-4">Belum ada janji temu</td></tr>';

  } catch (err) {
    console.error('Fetch janji gagal:', err);
    showNotification('❌ Gagal muat janji temu', 'error');
  }
}

// === CRUD: DELETE ===
async function handleDelete(type, id) {
  if (!confirm(`Yakin hapus ${type === 'patient' ? 'pasien' : 'dokter'} ini?`)) return;

  const url = type === 'patient' 
    ? `${API_BASE.patients}/${id}`
    : `${API_BASE.doctors}/${id}`;

  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    showNotification(`✅ ${type === 'patient' ? 'Pasien' : 'Dokter'} berhasil dihapus`);
    location.reload();

  } catch (err) {
    showNotification(`❌ Gagal hapus ${type}`, 'error');
  }
}

// === CRUD: EDIT ===
function handleEdit(type, id) {
  const page = type === 'patient' ? 'edit-patient.html' : 'edit-doctor.html';
  window.location.href = `${page}?id=${id}`;
}

// === CRUD: LOAD DATA FOR EDIT ===
async function loadForEdit(type) {
  const id = getUrlParam('id');
  if (!id) return;

  const url = type === 'patient' 
    ? `${API_BASE.patients}/${id}`
    : `${API_BASE.doctors}/${id}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    Object.keys(data).forEach(key => {
      const el = document.getElementById(key);
      if (el) el.value = data[key] ?? '';
    });

    if (type === 'patient') document.getElementById('patientId').value = data.id;
    if (type === 'doctor') document.getElementById('doctorId').value = data.id;

  } catch (err) {
    showNotification(`❌ Gagal muat data ${type}`, 'error');
    setTimeout(() => history.back(), 2000);
  }
}

// === CRUD: SUBMIT EDIT ===
async function submitEdit(type, event) {
  event.preventDefault();
  const id = type === 'patient' 
    ? document.getElementById('patientId').value
    : document.getElementById('doctorId').value;

  if (!id) return showNotification('ID tidak ditemukan', 'error');

  const url = type === 'patient' 
    ? `${API_BASE.patients}/${id}`
    : `${API_BASE.doctors}/${id}`;

  const data = {};
  const form = event.target;
  for (let [key, field] of Object.entries({
    name: form.name,
    age: form.age,
    disease: form.disease,
    phone: form.phone,
    address: form.address,
    specialization: form.specialization,
    strNumber: form.strNumber,
    email: form.email
  })) {
    if (field) {
      data[key] = field.type === 'number' ? (field.value ? parseInt(field.value) : null) : field.value;
    }
  }

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    showNotification(`✅ ${type === 'patient' ? 'Pasien' : 'Dokter'} berhasil diperbarui!`);
    setTimeout(() => window.location.href = type === 'patient' ? 'index.html' : 'doctors.html', 1500);

  } catch (err) {
    showNotification(`❌ Gagal update ${type}`, 'error');
  }
}

// === CRUD: ADD PATIENT/DOCTOR ===
async function submitAdd(type, event) {
  event.preventDefault();
  const url = type === 'patient' ? API_BASE.patients : API_BASE.doctors;

  const data = {};
  const form = event.target;
  for (let [key, field] of Object.entries({
    name: form.name,
    age: form.age,
    disease: form.disease,
    phone: form.phone,
    address: form.address,
    specialization: form.specialization,
    strNumber: form.strNumber,
    email: form.email
  })) {
    if (field) {
      data[key] = field.type === 'number' ? (field.value ? parseInt(field.value) : null) : field.value;
    }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    showNotification(`✅ ${type === 'patient' ? 'Pasien' : 'Dokter'} berhasil ditambahkan!`);
    setTimeout(() => {
      window.location.href = type === 'patient' ? 'index.html' : 'doctors.html';
    }, 1500);

  } catch (err) {
    showNotification(`❌ Gagal tambah ${type}`, 'error');
  }
}

// === APPOINTMENT: LOAD OPTIONS ===
async function loadAppointmentOptions() {
  try {
    const [patRes, docRes] = await Promise.all([
      fetch(API_BASE.patients),
      fetch(API_BASE.doctors)
    ]);

    if (!patRes.ok) throw new Error('Gagal muat pasien');
    if (!docRes.ok) throw new Error('Gagal muat dokter');

    const patients = await patRes.json();
    const doctors = await docRes.json();

    // Isi dropdown
    const patSelect = document.getElementById('patientId');
    const docSelect = document.getElementById('doctorId');

    if (patSelect) {
      patSelect.innerHTML = '<option value="">-- Pilih Pasien --</option>' +
        patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    if (docSelect) {
      docSelect.innerHTML = '<option value="">-- Pilih Dokter --</option>' +
        doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialization})</option>`).join('');
    }

  } catch (err) {
    showNotification('❌ Gagal muat daftar pasien/dokter', 'error');
  }
}

// === APPOINTMENT: CREATE ===
async function submitAppointment(event) {
  event.preventDefault();

  const data = {
    patientId: parseInt(document.getElementById('patientId').value),
    doctorId: parseInt(document.getElementById('doctorId').value),
    appointmentDate: document.getElementById('appointmentDate').value,
    appointmentTime: document.getElementById('appointmentTime').value,
    reason: document.getElementById('reason').value,
    status: 'pending' // default
  };

  if (!data.patientId || !data.doctorId || !data.appointmentDate || !data.appointmentTime) {
    return showNotification('⚠️ Semua kolom wajib diisi', 'error');
  }

  try {
    const res = await fetch(API_BASE.appointments, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    showNotification('✅ Janji temu berhasil dibuat!');
    setTimeout(() => window.location.href = 'appointments.html', 1500);

  } catch (err) {
    showNotification(`❌ Gagal buat janji: ${err.message}`, 'error');
  }
}

// === APPOINTMENT: CANCEL ===
async function cancelAppointment(id) {
  if (!confirm('Batalkan janji temu ini?')) return;

  try {
    const res = await fetch(`${API_BASE.appointments}/${id}`, {
      method: 'PATCH', // atau PUT, tergantung backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    showNotification('✅ Janji temu dibatalkan');
    fetchAppointments();

  } catch (err) {
    showNotification('❌ Gagal membatalkan', 'error');
  }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
  // Toggle view
  const tableBtn = document.getElementById('viewTable');
  const cardBtn = document.getElementById('viewCard');
  if (tableBtn && cardBtn) {
    tableBtn.onclick = () => {
      document.getElementById('tableView').style.display = 'block';
      document.getElementById('cardView').style.display = 'none';
      tableBtn.classList.add('active');
      cardBtn.classList.remove('active');
    };
    cardBtn.onclick = () => {
      document.getElementById('tableView').style.display = 'none';
      document.getElementById('cardView').style.display = 'block';
      cardBtn.classList.add('active');
      tableBtn.classList.remove('active');
    };
  }

  // SEARCH
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const term = this.value.toLowerCase();
      document.querySelectorAll('#tableView tbody tr, #cardView > div, #appointmentsList tr').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  // PAGE-SPECIFIC LOGIC
  const path = window.location.pathname;

  if (path.includes('index.html')) {
    fetchPatients();
  } 
  else if (path.includes('doctors.html')) {
    fetchDoctors();
  } 
  else if (path.includes('appointments.html')) {
    fetchAppointments();
  } 
  else if (path.includes('edit-patient.html')) {
    loadForEdit('patient');
    document.getElementById('editPatientForm')?.addEventListener('submit', e => submitEdit('patient', e));
  } 
  else if (path.includes('edit-doctor.html')) {
    loadForEdit('doctor');
    document.getElementById('editDoctorForm')?.addEventListener('submit', e => submitEdit('doctor', e));
  } 
  else if (path.includes('add-patient.html')) {
    document.getElementById('patientForm')?.addEventListener('submit', e => submitAdd('patient', e));
  } 
  else if (path.includes('add-doctor.html')) {
    document.getElementById('doctorForm')?.addEventListener('submit', e => submitAdd('doctor', e));
  } 
  else if (path.includes('book-appointment.html')) {
    loadAppointmentOptions();
    document.getElementById('appointmentForm')?.addEventListener('submit', submitAppointment);
  }
  else if (path.includes('add-doctor.html')) {
  document.getElementById('doctorForm')?.addEventListener('submit', e => submitAdd('doctor', e));
  } 
  else if (path.includes('book-appointment.html')) {
    loadAppointmentOptions();
    document.getElementById('appointmentForm')?.addEventListener('submit', submitAppointment);
  }
});