import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { API_BASE, fetchConfig } from "@/lib/api-config";

const Cgu: React.FC = () => {
  const [emailClub, setEmailClub] = useState("");
  const { t, lang } = useTranslation();

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`, fetchConfig)
      .then((res) => res.json())
      .then((data) => {
        setEmailClub(data.general.email || "");
      })
      .catch((err) => console.error("Erreur fetch email :", err));
  }, []);

  const displayEmail = emailClub || "contact@rwdmacademy.be";

  return (
    <div className="space-y-6 text-gray-600 dark:text-gray-300">
      <div>
        <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          {t("cgu_title")}
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
          {t("cgu_section1_title")}
        </h3>
        <p>{t("cgu_section1_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section2_title")}
        </h3>
        <p>{t("cgu_section2_intro")}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("cgu_section2_item1")}</li>
          <li>{t("cgu_section2_item2")}</li>
          <li>{t("cgu_section2_item3")}</li>
          <li>{t("cgu_section2_item4")}</li>
        </ul>
        <p>{t("cgu_section2_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section3_title")}
        </h3>
        <p>{t("cgu_section3_intro")}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("cgu_section3_item1")}</li>
          <li>{t("cgu_section3_item2")}</li>
          <li>{t("cgu_section3_item3")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section4_title")}
        </h3>
        <p>{t("cgu_section4_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section5_title")}
        </h3>
        <p>{t("cgu_section5_intro")}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t("cgu_section5_item1")}</li>
          <li>{t("cgu_section5_item2")}</li>
          <li>{t("cgu_section5_item3")}</li>
          <li>{t("cgu_section5_item4")}</li>
          <li>{t("cgu_section5_item5")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section6_title")}
        </h3>
        <p>{t("cgu_section6_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section7_title")}
        </h3>
        <p>{t("cgu_section7_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section8_title")}
        </h3>
        <p>{t("cgu_section8_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section9_title")}
        </h3>
        <p>{t("cgu_section9_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section10_title")}
        </h3>
        <p>{t("cgu_section10_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("cgu_section11_title")}
        </h3>
        <p>
          {t("cgu_section11_contact_intro")}
          <br />
          RWDM Academy
          <br />
          Rue Charles Malis 61
          <br />
          1080 Molenbeek‑Saint‑Jean
          <br />
          <a href={`mailto:${displayEmail}`} className="text-rwdm-blue">
            {displayEmail}
          </a>
        </p>
      </section>
    </div>
  );
};

export default Cgu;