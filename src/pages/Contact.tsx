import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { API_BASE, fetchConfig } from "@/lib/api-config";

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
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

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
        const response = await fetch(`${API_BASE}/api/settings`, fetchConfig);
        const data = await response.json();
        updateFromGeneral(data.general);
        updateFromContact(data.contact); // ✅ ajoute ceci
      } catch (err) {
        console.error("Erreur fetch settings:", err);
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
      <Helmet>
        {/* SEO général */}
        <title>
          {lang === "fr"
            ? "Contactez RWDM Academy – Coordonnées et formulaire"
            : lang === "nl"
            ? "Contacteer RWDM Academy – Contactgegevens en formulier"
            : "Contact RWDM Academy – Contact form and details"}
        </title>
        <meta
          name="description"
          content={
            lang === "fr"
              ? "Contactez-nous pour toute question sur l'académie RWDM, les inscriptions, ou les événements."
              : lang === "nl"
              ? "Neem contact op met RWDM Academy voor vragen over inschrijvingen of evenementen."
              : "Get in touch with RWDM Academy for any inquiries about registration or events."
          }
        />
        <meta
          name="keywords"
          content={
            lang === "fr"
              ? "RWDM, contact, académie, formulaire, football, inscription, test, Bruxelles"
              : lang === "nl"
              ? "RWDM, contact, academie, formulier, voetbal, inschrijving, test, Brussel"
              : "RWDM, contact, academy, form, football, registration, test, Brussels"
          }
        />
        <meta name="author" content="RWDM Academy" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rwdmacademy.be/contact" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://rwdmacademy.be/contact"
        />
        <meta
          property="og:title"
          content={
            lang === "fr"
              ? "Contactez RWDM Academy"
              : lang === "nl"
              ? "Contacteer RWDM Academy"
              : "Contact RWDM Academy"
          }
        />
        <meta
          property="og:description"
          content={
            lang === "fr"
              ? "Formulaire de contact et coordonnées officielles de l'académie RWDM."
              : lang === "nl"
              ? "Contactformulier en officiële gegevens van RWDM Academy."
              : "Official contact form and details of RWDM Academy."
          }
        />
        <meta
          property="og:image"
          content="https://rwdmacademy.be/images/og-image.jpg"
        />
        <meta property="og:site_name" content="RWDM Academy" />
        <meta
          property="og:locale"
          content={lang === "nl" ? "nl_BE" : lang === "en" ? "en_US" : "fr_BE"}
        />
        <meta
          property="article:publisher"
          content="https://www.facebook.com/RWDMAcademy/"
        />
        <meta
          property="article:author"
          content="https://www.instagram.com/rwdm_academy/"
        />
      </Helmet>

      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-rwdm-blue dark:text-white mb-3 relative inline-block">
            {t("contact_title")}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, \
      black 0%, black 50%, \
      red 50%, red 100%)",
              }}
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </h1>

          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
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
                        title: t("toast.missingFieldsTitle"),
                        description: t("toast.missingFieldsDescription"),
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!captchaToken) {
                      toast({
                        title: t("toast.captchaRequiredTitle"),
                        description: t("toast.captchaRequiredDescription"),
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      setIsSending(true);
                      const res = await fetch(
                        `${API_BASE}/api/form-mail/send-contact-message`,
                        {
                          method: "POST",
                          ...fetchConfig,
                          body: JSON.stringify({
                            name,
                            email,
                            subject,
                            message,
                            captcha: captchaToken,
                          }),
                        }
                      );

                      const data = await res.json();
                      if (!res.ok)
                        throw new Error(data.error || "Erreur inconnue");

                      toast({
                        title: t("toast.messageSentTitle"),
                        description: t("toast.messageSentDescription"),
                      });

                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                      setCaptchaToken(null);
                      recaptchaRef.current?.reset();
                      localStorage.setItem(
                        "lastContactTime",
                        Date.now().toString()
                      );
                    } catch (error) {
                      console.error(error);
                      toast({
                        title: t("toast.sendErrorTitle"),
                        description: t("toast.sendErrorDescription"),
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
                    <Select
                      value={subject}
                      onValueChange={(value) => setSubject(value)}
                    >
                      <SelectTrigger id="subject" className="form-input-base">
                        <SelectValue
                          placeholder={t("contact_select_subject")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">
                          {t("contact_subject_registration")}
                        </SelectItem>
                        <SelectItem value="selection_tests">
                          {t("contact_subject_selection")}
                        </SelectItem>
                        <SelectItem value="liability_waiver">
                          {t("contact_subject_waiver")}
                        </SelectItem>
                        <SelectItem value="accident_report">
                          {t("contact_subject_accident")}
                        </SelectItem>
                        <SelectItem value="recruitment">
                          {t("contact_subject_recruitment")}
                        </SelectItem>
                        <SelectItem value="incident">
                          {t("contact_subject_incident")}
                        </SelectItem>
                        <SelectItem value="technical">
                          {t("contact_subject_technical")}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("contact_subject_other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="flex justify-center">
                    <ReCAPTCHA
                      sitekey="6Ld_u1srAAAAAK05RnFiRpCGRTTVNQiMRHMWew9v"
                      onChange={handleCaptchaChange}
                      ref={recaptchaRef}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSending}
                      className="w-full md:w-auto button-transition bg-rwdm-red hover:bg-rwdm-red/90"
                    >
                      {isSending ? "Envoi en cours..." : t("contact_submit")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
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
                        {daysOfWeek.map((day) => {
                          const times = openingHours?.[day];
                          const isClosed =
                            times?.open === "00:00" && times?.close === "00:00";
                          return (
                            <div key={day}>
                              {translateDay(day, t)} :{" "}
                              {isClosed
                                ? t("closed")
                                : `${times?.open || "--:--"} - ${
                                    times?.close || "--:--"
                                  }`}
                            </div>
                          );
                        })}
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
                  src="https://www.google.com/maps?q=50.855638154278545,4.3111228865063325&z=17&output=embed"
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
