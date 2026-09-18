import { useLanguage } from "./context";

export default function LanguageSwitcher({ className = "", id = "language-select" }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`language-switcher ${className}`}>
      <span className="sr-only">{t("common.language")}</span>
      <select
        id={id}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">{t("common.languages.en")}</option>
        <option value="fr">{t("common.languages.fr")}</option>
        <option value="rw">{t("common.languages.rw")}</option>
      </select>
    </label>
  );
}