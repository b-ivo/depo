import { useLanguage } from "./context";

export default function LanguageSwitcher({
  className = "",
  id = "language-select",
  dark = false,
}) {
  const { language, setLanguage, t } = useLanguage();

  const tone = dark
    ? "border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100";

  return (
    <label className={`inline-flex ${className}`}>
      <span className="sr-only">{t("common.language")}</span>
      <select
        id={id}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${tone}`}
      >
        <option value="en">{t("common.languages.en")}</option>
        <option value="fr">{t("common.languages.fr")}</option>
        <option value="rw">{t("common.languages.rw")}</option>
      </select>
    </label>
  );
}
