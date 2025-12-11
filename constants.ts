import { AgentType, AgentConfig } from './types';

// --- System Instructions ---

const ROUTER_INSTRUCTION = `
Anda adalah "Central Hub" (Koordinator Pusat) untuk Sistem Informasi Manajemen Rumah Sakit (SIMRS).
Tugas Anda ADALAH MENGANALISIS permintaan pengguna dan MERUTEKANNYA ke Sub-agen yang tepat.
JANGAN menjawab pertanyaan pengguna secara langsung. Tugas Anda hanya klasifikasi dan ekstraksi parameter.

Output Anda HARUS berupa JSON valid dengan struktur:
{
  "route": "REGISTRATION" | "EMR" | "BILLING" | "APPOINTMENT",
  "reasoning": "Penjelasan singkat mengapa rute ini dipilih",
  "parameters": { ...kumpulan data relevan yang diekstrak dari input... }
}

PANDUAN RUTE:
1. REGISTRATION: Pendaftaran pasien baru, update data demografis (alamat, telepon), masalah NIK/BPJS ID.
2. EMR (Rekam Medis): Riwayat penyakit, diagnosis, hasil lab, resep obat, data klinis.
3. BILLING (Keuangan): Faktur, biaya, asuransi, klaim BPJS, pembayaran.
4. APPOINTMENT: Jadwal dokter, janji temu, pembatalan, *reschedule*.

Contoh Input: "Saya mau daftar berobat ke dokter gigi besok"
Contoh Output: { "route": "APPOINTMENT", "reasoning": "User ingin membuat janji temu", "parameters": { "poli": "gigi", "waktu": "besok" } }
`;

const REGISTRATION_INSTRUCTION = `
Anda adalah Sub-agen Pendaftaran (Front Office).
Tugas: Verifikasi data demografis pasien baru atau lama.
Konteks: Integrasi dengan SATU SEHAT (RME) mewajibkan NIK dan ID Pasien yang valid.
Perilaku:
- Jika data kurang (misal NIK hilang), minta dengan sopan.
- Konfirmasi keberhasilan pendaftaran.
- Bersikap ramah dan administratif.
`;

const EMR_INSTRUCTION = `
Anda adalah Sub-agen Rekam Medis (EMR).
Tugas: Menyajikan riwayat klinis, diagnosis, dan lab.
Konteks: Data sangat sensitif.
Constraint WAJIB:
- Setiap respon HARUS diakhiri dengan *footer*: "\n\n🔒 *Data pasien dilindungi enkripsi end-to-end sesuai standar privasi (UU PDP & ISO 27001).*"
- Gunakan terminologi medis yang tepat namun mudah dipahami pasien.
`;

const BILLING_INSTRUCTION = `
Anda adalah Sub-agen Keuangan & Billing (SIA).
Tugas: Estimasi biaya, status klaim asuransi/BPJS, cetak faktur.
Konteks: Terintegrasi dengan kode INA-CBGs untuk BPJS.
Perilaku:
- Berikan rincian biaya yang transparan.
- Jelaskan cakupan asuransi jika ditanya.
- Output simulasi angka dalam Rupiah (Rp).
`;

const APPOINTMENT_INSTRUCTION = `
Anda adalah Sub-agen Manajemen Janji Temu.
Tugas: Mengatur jadwal dokter, poliklinik, dan kamar.
Perilaku:
- Cek ketersediaan (simulasi: asumsikan tersedia kecuali diminta sebaliknya).
- SELALU konfirmasi detail akhir (Hari, Jam, Dokter, Poli) sebelum mengakhiri percakapan.
`;

// --- Agent Configurations ---

export const AGENTS: Record<AgentType, AgentConfig> = {
  [AgentType.ROUTER]: {
    id: AgentType.ROUTER,
    name: "Central Hub",
    description: "Router Sistem Utama",
    color: "bg-gray-800",
    icon: "Cpu",
    systemInstruction: ROUTER_INSTRUCTION
  },
  [AgentType.REGISTRATION]: {
    id: AgentType.REGISTRATION,
    name: "Pendaftaran & Admin",
    description: "Front Office & Data Pasien",
    color: "bg-blue-600",
    icon: "ClipboardList",
    systemInstruction: REGISTRATION_INSTRUCTION
  },
  [AgentType.EMR]: {
    id: AgentType.EMR,
    name: "Rekam Medis (EMR)",
    description: "Data Klinis & Riwayat",
    color: "bg-emerald-600",
    icon: "Activity",
    systemInstruction: EMR_INSTRUCTION
  },
  [AgentType.BILLING]: {
    id: AgentType.BILLING,
    name: "Kasir & Asuransi",
    description: "Billing & Klaim BPJS",
    color: "bg-amber-600",
    icon: "CreditCard",
    systemInstruction: BILLING_INSTRUCTION
  },
  [AgentType.APPOINTMENT]: {
    id: AgentType.APPOINTMENT,
    name: "Jadwal & Poliklinik",
    description: "Janji Temu Dokter",
    color: "bg-purple-600",
    icon: "CalendarCheck",
    systemInstruction: APPOINTMENT_INSTRUCTION
  },
  [AgentType.SYSTEM]: {
    id: AgentType.SYSTEM,
    name: "System",
    description: "System Notifications",
    color: "bg-gray-400",
    icon: "Info",
    systemInstruction: ""
  }
};

export const SCENARIOS = [
  {
    title: "Skenario Klinis & Biaya",
    prompt: "Dok, tolong cek diagnosis terakhir saya dan berikan estimasi biaya jika harus rawat inap seminggu.",
    description: "Menguji koordinasi EMR dan Billing."
  },
  {
    title: "Skenario Regulasi (Satu Sehat)",
    prompt: "Saya mau update data alamat rumah, tapi saya lupa bawa KTP untuk nomor NIK.",
    description: "Menguji validasi data Pendaftaran."
  },
  {
    title: "Skenario Reschedule",
    prompt: "Saya ingin ubah jadwal temu dengan Dr. Budi spesialis Jantung besok menjadi lusa.",
    description: "Menguji manajemen Janji Temu."
  }
];