import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";

const CookiesPolicy: React.FC = () => {
  const [emailClub, setEmailClub] = useState("");
  const { t, lang } = useTranslation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(
          "https://daringbrusselsacademy.be/node/api/settings"
        );
        setEmailClub(data.general.email || "");
      } catch (err) {
        console.error("Erreur fetch email settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const displayEmail = emailClub || "privacy@daringbrussels-academy.be";

  return (
    <div className="space-y-6 text-gray-600 dark:text-gray-300">
      <div>
        <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          {t("cookie_policy_title")}
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
          {t("cookie_section1_title")}
        </h3>
        <p>{t("cookie_section1_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cookie_section2_title")}
        </h3>
        <p>{t("cookie_section2_text")}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("cookie_section2_li1")}</li>
          <li>{t("cookie_section2_li2")}</li>
          <li>{t("cookie_section2_li3")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cookie_section3_title")}
        </h3>
        <p>{t("cookie_section3_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cookie_section4_title")}
        </h3>
        <p>{t("cookie_section4_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cookie_section5_title")}
        </h3>
        <p>
          {t("cookie_section5_text")}{" "}
          <a href={`mailto:${displayEmail}`} className="text-rwdm-blue">
            {displayEmail}
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default CookiesPolicy;
