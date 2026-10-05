// SweetAlert2 dimuat secara lazy (hanya saat dialog pertama dibuka)
// agar tidak membebani bundle awal -> menghilangkan "unused JavaScript".
const fire = async (options) => {
  const { default: Swal } = await import("sweetalert2");
  return Swal.fire(options);
};

const ACCENT = "#3730a3";
const DELCOM_MEDIA_ORIGIN = "https://open-api.delcom.org";

export const showSuccessDialog = (message) =>
  fire({ icon: "success", title: "Berhasil", text: message, confirmButtonColor: ACCENT });

export const showErrorDialog = (message) =>
  fire({ icon: "error", title: "Terjadi kesalahan", text: message, confirmButtonColor: ACCENT });

export const showWarningDialog = (message) =>
  fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: ACCENT });

export const showConfirmDialog = async (message) => {
  const result = await fire({
    icon: "question",
    title: "Lanjutkan?",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#be123c",
  });
  return result.isConfirmed;
};

export const formatDate = (iso) => {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// Path relatif dari API diubah menjadi URL absolut agar bisa dipakai <img>.
export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${DELCOM_MEDIA_ORIGIN}/${path.replace(/^\//, "")}`;
};

export const isDone = (item) => Boolean(Number(item?.is_completed));

export const reporterName = (item, users = []) =>
  item.author?.name ??
  item.user?.name ??
  users.find((u) => u.id === item.user_id)?.name ??
  "Pelapor anonim";

export const initialsOf = (name) =>
  `${name ?? ""}`
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

// Menormalkan respons statistik (array atau objek) menjadi [{label, value}].
export const toSeries = (raw) => {
  const source = raw?.stats ?? raw;
  const rows = Array.isArray(source)
    ? source
    : Object.entries(source ?? {}).map(([label, value]) => ({ label, value }));
  return rows.map((row, index) => {
    const value = Number(typeof row.value === "number" ? row.value : (row.total ?? row.count ?? 0));
    return { label: `${row.label ?? row.date ?? row.month ?? index + 1}`, value };
  });
};
