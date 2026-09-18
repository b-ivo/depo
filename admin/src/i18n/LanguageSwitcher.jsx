import { useLanguage } from "./context";

const languageOptions = [
  { code: "en", labelKey: "common.languages.en" },
  { code: "fr", labelKey: "common.languages.fr" },
  { code: "rw", labelKey: "common.languages.rw" },
];

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span>{t("common.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-slate-400"
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;