// Pemilih penyimpanan data:
//  - env Supabase terisi  -> database sungguhan
//  - belum terisi         -> mode demo (data contoh, lihat demo-store.js)
import * as demo from "./demo-store";
import * as supa from "./supabase-store";

const pakaiSupabase = Boolean(
  supa.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const mode = pakaiSupabase ? "supabase" : "demo";

const impl = pakaiSupabase ? supa : demo;

export const getSettings = impl.getSettings;
export const getStats = impl.getStats;
export const listWarga = impl.listWarga;
export const cariWarga = impl.cariWarga;
export const tambahWargaBatch = impl.tambahWargaBatch;
export const hapusWarga = impl.hapusWarga;
export const tandaiLunas = impl.tandaiLunas;
export const listTransaksi = impl.listTransaksi;
export const tambahTransaksi = impl.tambahTransaksi;
export const simpanBerkas = impl.simpanBerkas;
export const listDokumentasi = impl.listDokumentasi;
export const tambahDokumentasi = impl.tambahDokumentasi;
export const hapusDokumentasi = impl.hapusDokumentasi;
export const simpanPengaturan = impl.simpanPengaturan;
export const simpanAgenda = impl.simpanAgenda;
export const getKonten = impl.getKonten;
export const simpanKonten = impl.simpanKonten;
export const kirimSaran = impl.kirimSaran;
export const listSaran = impl.listSaran;
export const setSaranStatus = impl.setSaranStatus;
export const listAgenda = impl.listAgenda;
export const kirimRsvp = impl.kirimRsvp;
export const listRsvp = impl.listRsvp;
export const getRsvpStats = impl.getRsvpStats;
export const hapusRsvp = impl.hapusRsvp;
export const perbaikiKupon = impl.perbaikiKupon;
