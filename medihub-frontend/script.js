// script.js — MediHub Frontend + Backend Integration (with EDIT)

// 🔧 Konfigurasi API
const API_BASE = {
  patients: 'http://localhost:3001/api/patients',
  records: 'http://localhost:3002/api/records',
  doctors: 'http://localhost:3003/api/doctors',
  appointments: 'http://localhost:3004/api/appointments'
};

// 🌐 Helper: Tampilkan notifikasi (mirip toast)
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

// 📥 Ambil data pasien dari backend
async function fetchPatients() {
  const tableView = document.getElementById('tableView')?.querySelector('tbody');
  const cardView = document.getElementById('cardView');
  const statsCard = document.querySelector('.stat-card .value');

  if (!tableView && !cardView) return;

  try {
    const res = await fetch(API_BASE.patients);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const patients = await res.json();

    if (statsCard) statsCard.textContent = patients.length;

    // Render tabel
    if (tableView) {
      tableView.innerHTML = patients.length === 0 
        ? '<tr><td colspan="4" class="text-center py-4">Tidak ada data pasien</td></tr>'
        : patients.map(p => `
          <tr>
            <td>${p.name || '–'}</td>
            <td>${p.age || '–'}</td>
            <td>${p.disease || '–'}</td>
            <td>
              <button class="action-btn edit-btn" data-id="${p.id}" onclick="handleEdit(${p.id})">Edit</button>
              <button class="action-btn delete-btn" data-id="${p.id}" onclick="handleDelete(${p.id})">Hapus</button>
            </td>
          </tr>
        `).join('');
    }

    // Render card
    if (cardView) {
      cardView.innerHTML = patients.length === 0
        ? '<div class="text-center py-4 text-gray-500">Tidak ada data pasien</div>'
        : patients.map(p => `
          <div class="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 class="font-bold text-lg text-gray-800">${p.name || '–'}</h3>
            <p>Usia: ${p.age || '–'}</p>
            <p>Penyakit: ${p.disease || '–'}</p>
            <div class="mt-2">
              <button class="action-btn edit-btn" data-id="${p.id}" onclick="handleEdit(${p.id})">Edit</button>
              <button class="action-btn delete-btn" data-id="${p.id}" onclick="handleDelete(${p.id})">Hapus</button>
            </div>
          </div>
        `).join('');
    }

  } catch (err) {
    console.error('Gagal fetch pasien:', err);
    showNotification('❌ Gagal memuat data pasien: ' + err.message, 'error');
  }
}

// 🗑️ Hapus pasien
async function handleDelete(id) {
  if (!id || !confirm('Yakin ingin menghapus pasien ini?')) return;

  try {
    const res = await fetch(`${API_BASE.patients}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    showNotification('✅ Pasien berhasil dihapus');
    fetchPatients();

  } catch (err) {
    console.error('Gagal hapus pasien:', err);
    showNotification('❌ Gagal menghapus pasien', 'error');
  }
}

// ✏️ Edit pasien — redirect ke halaman edit dengan ID
function handleEdit(id) {
  if (!id) return;
  window.location.href = `edit-patient.html?id=${id}`;
}

// 🔍 Ambil parameter URL (misal: ?id=5)
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 📥 Muat data pasien untuk edit (prefill form)
async function loadPatientForEdit() {
  const id = getUrlParam('id');
  if (!id) return;

  try {
    const res = await fetch(`${API_BASE.patients}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const patient = await res.json();

    // Isi form
    document.getElementById('patientId').value = patient.id;
    document.getElementById('name').value = patient.name || '';
    document.getElementById('age').value = patient.age || '';
    document.getElementById('disease').value = patient.disease || '';
    document.getElementById('phone').value = patient.phone || '';
    document.getElementById('address').value = patient.address || '';

  } catch (err) {
    console.error('Gagal muat data pasien:', err);
    showNotification('❌ Gagal memuat data pasien untuk edit', 'error');
    setTimeout(() => window.history.back(), 2000);
  }
}

// 📤 Kirim edit pasien (PUT)
async function updatePatient(data) {
  const id = data.id;
  if (!id) throw new Error('ID pasien tidak ditemukan');

  const res = await fetch(`${API_BASE.patients}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// 📤 Handle form edit submit
async function handleEditFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('.submit-btn');

  const data = {
    id: parseInt(document.getElementById('patientId').value),
    name: document.getElementById('name').value,
    age: parseInt(document.getElementById('age').value) || null,
    disease: document.getElementById('disease').value,
    phone: document.getElementById('phone').value || '',
    address: document.getElementById('address').value || ''
  };

  if (!data.name || !data.disease) {
    showNotification('⚠️ Nama dan Penyakit wajib diisi', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan...';

  try {
    await updatePatient(data);
    showNotification('✅ Data pasien berhasil diperbarui!');
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (err) {
    console.error('Gagal update pasien:', err);
    showNotification('❌ ' + (err.message || 'Gagal menyimpan perubahan'), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Simpan Perubahan';
  }
}

// 📤 Handle form tambah pasien (POST)
async function addPatient(data) {
  const res = await fetch(API_BASE.patients, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

async function handleAddFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('.submit-btn');

  const data = {
    name: form.name.value,
    age: parseInt(form.age.value) || null,
    disease: form.disease.value,
    phone: form.phone.value || '',
    address: form.address.value || ''
  };

  if (!data.name || !data.disease) {
    showNotification('⚠️ Nama dan Penyakit wajib diisi', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Menyimpan...';

  try {
    await addPatient(data);
    showNotification('✅ Pasien berhasil ditambahkan!');
    form.reset();
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (err) {
    console.error('Gagal tambah pasien:', err);
    showNotification('❌ ' + (err.message || 'Gagal menyimpan data'), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Simpan Pasien';
  }
}

// 🔁 Inisialisasi halaman
document.addEventListener('DOMContentLoaded', function() {
  // Toggle view (tabel/card)
  const tableBtn = document.getElementById('viewTable');
  const cardBtn = document.getElementById('viewCard');
  const tableView = document.getElementById('tableView');
  const cardView = document.getElementById('cardView');

  if (tableBtn && cardBtn && tableView && cardView) {
    tableBtn.addEventListener('click', () => {
      tableView.style.display = 'block';
      cardView.style.display = 'none';
      tableBtn.classList.add('active');
      cardBtn.classList.remove('active');
    });
    cardBtn.addEventListener('click', () => {
      tableView.style.display = 'none';
      cardView.style.display = 'block';
      cardBtn.classList.add('active');
      tableBtn.classList.remove('active');
    });
  }

  // Halaman Dashboard
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    fetchPatients();
  }

  // Halaman Edit: muat data pasien
  if (window.location.pathname.includes('edit-patient.html')) {
    loadPatientForEdit();
    document.getElementById('editPatientForm')?.addEventListener('submit', handleEditFormSubmit);
  }

  // Halaman Tambah
  if (window.location.pathname.includes('add-patient.html')) {
    document.getElementById('patientForm')?.addEventListener('submit', handleAddFormSubmit);
  }

  // Search (client-side)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const term = this.value.toLowerCase();
      document.querySelectorAll('#tableView tbody tr, #cardView > div').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }
});