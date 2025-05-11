import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useTranslation } from "@/hooks/useTranslation";
import { Trans } from "react-i18next";

const LegalInfo: React.FC = () => {
  const [general, setGeneral] = useState<any>(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/settings");
        setGeneral(data.general);
      } catch (err) {
        console.error("Erreur fetch settings general:", err);
      }
    };
    fetchGeneral();
  }, []);

  if (!general) {
    return <p>Chargement des informations...</p>;
  }

  // Helper to display either a localized object or a string
  const display = (val: any) =>
    typeof val === "object" && val !== null
      ? val.FR || val[Object.keys(val)[0]]
      : val;

  const clubAddress = display(general.clubAddress);
  const commune = display(general.commune);
  const postalCode = general.postalCode || "";
  const emailClub = general.email || "";
  const country = display(general.country);
  const name = display(general.name);
  const legalForm = display(general.legalForm);
  const companyNumber = general.companyNumber || "";
  const phone = general.phone || "";
  const updatedAt = general.updatedAt;

  const publicationResponsible = display(general.publicationResponsible);
  const publicationTitle = display(general.publicationTitle);
  const hostingProvider = display(general.hosting?.provider);
  const hostingAddress = display(general.hosting?.address);
  const hostingWebsite = display(general.hosting?.website);

  return (
    <div className="space-y-6 text-gray-600 dark:text-gray-300">
      <div>
        <h2 className="text-2xl font-bold text-rwdm-blue dark:text-white mb-2">
          {t("page_legal_title")}
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
          {t("legal_section1_title")}
        </h3>
        <p>{t("legal_section1_intro")}</p>
        <p className="font-medium">
          {name}
          <br />
          {t("legal_section1_address_label")}: {clubAddress} {postalCode}{" "}
          {commune}
          <br />
          {t("legal_section1_country_label")}: {country}
          <br />
          {t("legal_section1_email_label")}: {emailClub}
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section2_title")}
        </h3>
        <p
          dangerouslySetInnerHTML={{
            __html: t("legal_section2_text"),
          }}
        />
        <h4 className="text-lg font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section2_subtitle")}
        </h4>
        <p>{t("legal_section2_dev_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section3_title")}
        </h3>
        <p>{t("legal_section3_intro")}</p>
        <p className="font-medium">
          {t("legal_section3_provider")}
          <br />
          {t("legal_section3_address")}
          <br />
          {t("legal_section3_website")}
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section4_title")}
        </h3>
        <p>{t("legal_section4_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section5_title")}
        </h3>
        <p>{t("legal_section5_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section6_title")}
        </h3>
        <p>{t("legal_section6_text")}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-rwdm-blue dark:text-white">
          {t("legal_section7_title")}
        </h3>
        <p>{t("legal_section7_text")}</p>
      </section>
    </div>
  );
};

export default LegalInfo;
