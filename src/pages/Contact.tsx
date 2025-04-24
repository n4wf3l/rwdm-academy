import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";
import { translations } from "@/lib/i18n";

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [clubAddress, setClubAddress] = useState<{ [key: string]: string }>({});
  const [commune, setCommune] = useState<{ [key: string]: string }>({});
  const [postalCode, setPostalCode] = useState("");
  const [emailClub, setEmailClub] = useState("");
  const [country, setCountry] = useState<{ [key: string]: string }>({});
  const getLocalizedValue = (
    field: { [key: string]: string } | undefined,
    lang: string
  ): string => {
    if (!field) return "";
    return (
      field[lang] ||
      field["FR"] ||
      Object.entries(field).find(([key]) => isNaN(Number(key)))?.[1] ||
      ""
    );
  };
  const { t, lang } = useTranslation();
  const currentLang = lang.toUpperCase();
  const [openingHours, setOpeningHours] = useState({});
  const [vatNumber, setVatNumber] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const mapQuery = useMemo(() => {
    return encodeURIComponent(
      `${getLocalizedValue(
        clubAddress,
        currentLang
      )} ${postalCode} ${getLocalizedValue(commune, currentLang)} Belgique`
    );
  }, [clubAddress, commune, postalCode, currentLang]);
  const daysOfWeek = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ] as const;

  type Day = (typeof daysOfWeek)[number]; // "Lundi" | "Mardi" | ...
  const translateDay = (
    day: Day,
    t: (key: keyof typeof translations.fr) => string
  ): string => {
    return t(`day_${day.toLowerCase()}` as keyof typeof translations.fr);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/settings");
        updateFromGeneral(data.general);
        updateFromContact(data.contact); // ✅ ajoute ceci
      } catch (err) {
        console.error("Erreur fetch settings avec axios:", err);
      }
    };

    fetchSettings();

    const onLanguageChange = () => {
      fetchSettings(); // refetch à chaque changement de langue
    };

    window.addEventListener("language-changed", onLanguageChange);
    return () =>
      window.removeEventListener("language-changed", onLanguageChange);
  }, []);

  const updateFromGeneral = (general: any) => {
    setCommune(
      Object.fromEntries(
        Object.entries(general.commune || {}).filter(([key]) =>
          isNaN(Number(key))
        )
      ) as { [key: string]: string }
    );

    setCountry(
      Object.fromEntries(
        Object.entries(general.country || {}).filter(([key]) =>
          isNaN(Number(key))
        )
      ) as { [key: string]: string }
    );
    setClubAddress(general.clubAddress || {});
    setPostalCode(general.postalCode || "");
    setEmailClub(general.email || "");
    setOpeningHours(general.openingHours || {});
    setVatNumber(general.vatNumber || "");
    setCompanyNumber(general.companyNumber || "");
    setAccountName(general.accountName || "");
  };

  const updateFromContact = (contact: any) => {
    setOpeningHours(contact.openingHours || {});
    setVatNumber(contact.vatNumber || "");
    setCompanyNumber(contact.companyNumber || "");
    setAccountName(contact.accountName || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3">
            {t("contact_title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("contact_description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full glass-panel">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {t("send_us_message")}
                </h2>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    const lastSent = localStorage.getItem("lastContactTime");
                    const now = Date.now();

                    if (lastSent && now - parseInt(lastSent) < 10 * 60 * 1000) {
                      const remaining =
                        10 * 60 * 1000 - (now - parseInt(lastSent));
                      const minutes = Math.floor(remaining / 60000);
                      const seconds = Math.floor((remaining % 60000) / 1000);
                      toast({
                        title: "⏳ Attendez avant de réessayer",
                        description: `Veuillez patienter encore ${minutes}m${
                          seconds < 10 ? "0" : ""
                        }${seconds}s avant de pouvoir renvoyer un message.`,
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!name || !email || !subject || !message) {
                      toast({
                        title: "Champs manquants",
                        description: "Merci de compléter tous les champs.",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      setIsSending(true);
                      const res = await fetch(
                        "http://localhost:5000/api/form-mail/send-contact-message",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name,
                            email,
                            subject,
                            message,
                          }),
                        }
                      );

                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data.error || "Erreur inconnue");

                      toast({
                        title: "Message envoyé",
                        description:
                          "Merci, votre message a bien été transmis à l'administration.",
                      });

                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                      localStorage.setItem(
                        "lastContactTime",
                        Date.now().toString()
                      ); // ⏱️ on enregistre l’heure
                    } catch (error) {
                      console.error(error);
                      toast({
                        title: "Erreur",
                        description:
                          "Impossible d'envoyer le message pour l'instant.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                      >
                        {t("contact_name")}
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-input-base"
                        placeholder="Votre nom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                      >
                        {t("contact_email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-input-base"
                        placeholder="Votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("contact_subject")}
                    </label>
                    <select
                      id="subject"
                      className="form-input-base"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="">{t("contact_select_subject")}</option>
                      <option value="registration">
                        {t("contact_subject_registration")}
                      </option>
                      <option value="selection_tests">
                        {t("contact_subject_selection")}
                      </option>
                      <option value="liability_waiver">
                        {t("contact_subject_waiver")}
                      </option>
                      <option value="accident_report">
                        {t("contact_subject_accident")}
                      </option>
                      <option value="recruitment">
                        {t("contact_subject_recruitment")}
                      </option>
                      <option value="incident">
                        {t("contact_subject_incident")}
                      </option>
                      <option value="technical">
                        {t("contact_subject_technical")}
                      </option>
                      <option value="other">
                        {t("contact_subject_other")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-1"
                    >
                      {t("contact_message")}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="form-input-base resize-none"
                      placeholder="Votre message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full md:w-auto button-transition bg-rwdm-red hover:bg-rwdm-red/90"
                  >
                    {isSending ? "Envoi en cours..." : t("contact_submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full glass-panel">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {t("contact_info_title")}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        {t("contact_address_title")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {getLocalizedValue(clubAddress, currentLang)}
                        <br />
                        {postalCode} {getLocalizedValue(commune, currentLang)}
                        <br />
                        {getLocalizedValue(country, currentLang)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        {t("contact_email_title")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {emailClub}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        {t("contact_office_hours")}
                      </h3>
                      <div className="text-gray-600 dark:text-gray-300">
                        {Object.entries(openingHours || {}).map(
                          ([day, times]: any) => {
                            const isClosed =
                              times.open === "00:00" && times.close === "00:00";
                            return (
                              <div key={day}>
                                {translateDay(day as Day, t)} :{" "}
                                {isClosed
                                  ? t("closed")
                                  : `${times.open || "--:--"} - ${
                                      times.close || "--:--"
                                    }`}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-rwdm-red mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        {t("contact_info_title")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {accountName && (
                          <>
                            {t("contact_account_name")}: {accountName}
                            <br />
                          </>
                        )}
                        {t("contact_vat_number")}:{" "}
                        {vatNumber || t("email_unavailable")}
                        <br />
                        {t("contact_company_number")}:{" "}
                        {companyNumber || t("email_unavailable")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-panel">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">
                {t("how_to_find_us")}
              </h2>
              <div className="rounded-lg overflow-hidden h-96 bg-gray-200">
                <iframe
                  src={`https://www.google.com/maps?q=${mapQuery}&t=&z=17&ie=UTF8&iwloc=near&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
