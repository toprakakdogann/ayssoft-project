import { FiGrid, FiList } from "react-icons/fi";

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`flex items-center gap-2 px-3 py-2 text-sm ${
          value === "table"
            ? "bg-gray-100 text-gray-900"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
        aria-pressed={value === "table"}
        title="Tablo Görünümü"
      >
        <FiList className="text-base" />
        Tablo
      </button>
      <button
        type="button"
        onClick={() => onChange("card")}
        className={`flex items-center gap-2 px-3 py-2 text-sm border-l border-gray-200 ${
          value === "card"
            ? "bg-gray-100 text-gray-900"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
        aria-pressed={value === "card"}
        title="Kart Görünümü"
      >
        <FiGrid className="text-base" />
        Kart
      </button>
    </div>
  );
}
