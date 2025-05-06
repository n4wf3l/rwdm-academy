import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";

const Confidentiality: React.FC = () => {
  const [emailClub, setEmailClub] = useState("");
  const { t, lang } = useTranslation();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/settings")
      .then(({ data }) => setEmailClub(data.general.email || ""))
      .catch((err) => console.error("Erreur fetch email :", err));
  }, []);

  const displayEmail = emailClub || "privacy@rwdm-academy.be";

  return (
    <div className="space-y-6 text-gray-600 dark:text-gray-300">
      <div>
        <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          {t("confidentiality_title")}
        </h2>
        <p className="text-sm mb-4">
          {t("last_updated")}:{" "}
          {new Date().toLocaleDateString(
            lang === "fr" ? "fr-BE" : lang === "nl" ? "nl-BE" : "en-US"
          )}
        </p>
        <Separator className="my-4" />
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section1_title")}
        </h3>
        <p>{t("confidentiality_section1_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section2_title")}
        </h3>
        <p>{t("confidentiality_section2_intro")}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_li_name")}</li>
          <li>{t("confidentiality_li_contact")}</li>
          <li>{t("confidentiality_li_sport")}</li>
          <li>{t("confidentiality_li_club")}</li>
          <li>{t("confidentiality_li_responsible")}</li>
          <li>{t("confidentiality_li_consent")}</li>
          <li>{t("confidentiality_li_accident")}</li>
          <li>{t("confidentiality_li_navigation")}</li>
          <li className="font-medium text-red-600 dark:text-red-400">
            {t("confidentiality_li_minors")}
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section3_title")}
        </h3>
        <p>
          {t("confidentiality_section3_intro") ||
            t("confidentiality_section3_text")}
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_section3_li1")}</li>
          <li>{t("confidentiality_section3_li2")}</li>
          <li>{t("confidentiality_section3_li3")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section4_title")}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_section4_li1")}</li>
          <li>{t("confidentiality_section4_li2")}</li>
          <li>{t("confidentiality_section4_li3")}</li>
          <li>{t("confidentiality_section4_li4")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section5_title")}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_section5_li1")}</li>
          <li>{t("confidentiality_section5_li2")}</li>
          <li>{t("confidentiality_section5_li3")}</li>
        </ul>
        <p>{t("confidentiality_section5_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section6_title")}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_section6_li1")}</li>
          <li>{t("confidentiality_section6_li2")}</li>
          <li>{t("confidentiality_section6_li3")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section7_title")}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("confidentiality_section7_li1")}</li>
          <li>{t("confidentiality_section7_li2")}</li>
          <li>{t("confidentiality_section7_li3")}</li>
        </ul>
        <p>
          {t("confidentiality_section7_contact")}{" "}
          <a href={`mailto:${displayEmail}`} className="text-rwdm-blue">
            {displayEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section8_title")}
        </h3>
        <p>{t("confidentiality_section8_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section9_title")}
        </h3>
        <p>{t("confidentiality_section9_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("confidentiality_section10_title")}
        </h3>
        <p>
          {t("confidentiality_section10_text")}{" "}
          <a href={`mailto:${displayEmail}`} className="text-rwdm-blue">
            {displayEmail}
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default Confidentiality;
