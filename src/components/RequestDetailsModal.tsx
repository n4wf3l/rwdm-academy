import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  X,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { fr, nl, enGB } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, forwardRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";

/* ======================= TYPES ======================= */

export type RequestStatus =
  | "new"
  | "assigned"
  | "in-progress"
  | "completed"
  | "rejected";

export type RequestType =
  | "registration"
  | "selection-tests"
  | "accident-report"
  | "responsibility-waiver";

export interface RequestDetails {
  // Mêmes interfaces qu'avant
  // ...
  season?: string;
  academy?: string;
  birthPlace?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  currentClub?: string;
  position?: string;
  category?: string;

  // Pour inscription – infos joueur
  lastName?: string;
  firstName?: string;
  birthDate?: string;

  // Pour inscription – responsable principal
  parent1Type?: string;
  parent1LastName?: string;
  parent1FirstName?: string;
  parent1Phone?: string;
  parent1Email?: string;
  parent1Address?: string;
  parent1PostalCode?: string;
  parent1Gsm?: string;

  // Pour inscription – responsable secondaire
  parent2Type?: string;
  parent2LastName?: string;
  parent2FirstName?: string;
  parent2Email?: string;
  parent2Phone?: string;
  parent2Address?: string;
  parent2PostalCode?: string;
  parent2Gsm?: string;

  // Pour "responsibility-waiver"
  parentLastName?: string;
  parentFirstName?: string;
  parentPhone?: string;
  parentEmail?: string;
  // Pour "responsibility-waiver" infos joueur
  playerLastName?: string;
  playerFirstName?: string;
  playerBirthDate?: string;
  previousClub?: string;

  // Pour tests de sélection
  noyau?: string;
  testStartDate?: string;
  testEndDate?: string;

  // Consentement & signature
  imageConsent?: boolean;
  signature?: string;
  signatureDate?: string;
  approvalText?: string;

  // Relation parentale (pour tests de sélection)
  parentRelation?: string;

  // Pour accident-report
  accidentDate?: string;
  description?: string;
  documentUrl?: string;

  [key: string]: any;
}

export interface Request {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  phone?: string;
  date: Date;
  status: RequestStatus;
  assignedTo?: string;
  details: RequestDetails;
  rejectedAt?: Date;
  sent_at?: string | null;
}

export interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

/* ======================= HELPERS ======================= */

const translateRequestType = (
  type: RequestType,
  t: (key: string) => string
): string => {
  switch (type) {
    case "registration":
      return t("request_type.registration");
    case "selection-tests":
      return t("request_type.selection_tests");
    case "accident-report":
      return t("request_type.accident_report");
    case "responsibility-waiver":
      return t("request_type.responsibility_waiver");
    default:
      return type;
  }
};

const getStatusBadge = (status: RequestStatus, t: (key: string) => string) => {
  switch (status) {
    case "new":
      return <Badge className="bg-blue-500">{t("status.new")}</Badge>;
    case "assigned":
      return <Badge className="bg-purple-500">{t("status.assigned")}</Badge>;
    case "in-progress":
      return <Badge className="bg-yellow-500">{t("status.in_progress")}</Badge>;
    case "completed":
      return <Badge className="bg-green-500">{t("status.completed")}</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">{t("status.rejected")}</Badge>;
    default:
      return <Badge>{t("status.unknown")}</Badge>;
  }
};

// Ajouter cette fonction auxiliaire en haut de votre fichier
const interpolate = (text: string, variables: Record<string, any>): string => {
  let result = text;
  Object.keys(variables).forEach((key) => {
    result = result.replace(
      new RegExp(`{${key}}`, "g"),
      String(variables[key] || "…")
    );
  });
  return result;
};

/* ======================= COMPOSANTS UI ======================= */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {title}
    </h3>
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-start mb-2">
    {icon && <div className="mr-2 mt-0.5 text-gray-500">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value || "-"}</p>
    </div>
  </div>
);

/* ======================= RENDERING DES TYPES ======================= */

/* 1) Pour "registration" (Inscription à l'académie) */
const renderRegistrationContent = (
  request: Request,
  t: (key: string) => string,
  locale: string
) => {
  const d = request.details;
  const dateLocale = locale === "fr" ? fr : locale === "nl" ? nl : enGB;

  return (
    <>
      <Section title={t("registration.season_title")}>
        <div className="flex gap-4 flex-wrap">
          <Field
            label={t("registration.season")}
            value={d.season || "-"}
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label={t("registration.academy")}
            value={d.academy || "-"}
            icon={<GraduationCap className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title={t("registration.player_info")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("registration.lastName")}
            value={d.lastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("registration.firstName")}
            value={d.firstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("registration.birthDate")}
            value={
              d.birthDate
                ? format(new Date(d.birthDate), "dd/MM/yyyy", {
                    locale: dateLocale,
                  })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label={t("registration.birthPlace")}
            value={d.birthPlace || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label={t("registration.address")}
            value={d.address || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label={t("registration.postalCode")}
            value={d.postalCode || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label={t("registration.city")}
            value={d.city || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
          <Field
            label={t("registration.currentClub")}
            value={d.currentClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("registration.category")}
            value={d.category || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      {/* Informations du responsable principal */}
      {(d.parent1LastName || d.parent1FirstName || d.parent1Phone) && (
        <Section title={t("registration.primary_guardian")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("registration.guardian_type")}
              value={d.parent1Type || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.lastName")}
              value={d.parent1LastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.firstName")}
              value={d.parent1FirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.phone")}
              value={d.parent1Phone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label={t("registration.email")}
              value={d.parent1Email || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
            <Field
              label={t("registration.address")}
              value={d.parent1Address || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label={t("registration.postalCode")}
              value={d.parent1PostalCode || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label={t("registration.gsm")}
              value={d.parent1Gsm || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </Section>
      )}

      {/* Informations du responsable secondaire */}
      {(d.parent2LastName || d.parent2FirstName || d.parent2Phone) && (
        <Section title={t("registration.secondary_guardian")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("registration.guardian_type")}
              value={d.parent2Type || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.lastName")}
              value={d.parent2LastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.firstName")}
              value={d.parent2FirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("registration.phone")}
              value={d.parent2Phone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label={t("registration.email")}
              value={d.parent2Email || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
            <Field
              label={t("registration.address")}
              value={d.parent2Address || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label={t("registration.postalCode")}
              value={d.parent2PostalCode || "-"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Field
              label={t("registration.gsm")}
              value={d.parent2Gsm || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </Section>
      )}

      <Section title={t("registration.image_consent")}>
        <Field
          label={t("registration.consent")}
          value={
            d.imageConsent
              ? t("registration.consent_accepted")
              : t("registration.consent_declined")
          }
          icon={
            d.imageConsent ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )
          }
        />
      </Section>

      <Section title={t("common.signature")}>
        {d.signature ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img
              src={d.signature}
              alt={t("common.signature_alt")}
              className="w-full"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
        <Field
          label={t("common.signature_date")}
          value={
            d.signatureDate
              ? format(new Date(d.signatureDate), "dd/MM/yyyy", {
                  locale: dateLocale,
                })
              : format(request.date, "dd/MM/yyyy", { locale: dateLocale })
          }
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </Section>
    </>
  );
};

/* 2) Pour "selection-tests" */
const renderSelectionTestsContent = (
  request: Request,
  t: (key: string) => string,
  locale: string
) => {
  const d = request.details;
  const dateLocale = locale === "fr" ? fr : locale === "nl" ? nl : enGB;

  return (
    <>
      <Section title={t("selection.test_info")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("selection.category")}
            value={d.noyau || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("selection.academy")}
            value={d.academy || "-"}
            icon={<GraduationCap className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title={t("selection.player_info")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("selection.lastName")}
            value={d.lastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("selection.firstName")}
            value={d.firstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("selection.birthDate")}
            value={
              d.playerBirthDate
                ? format(new Date(d.playerBirthDate), "dd/MM/yyyy", {
                    locale: dateLocale,
                  })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label={t("selection.phone")}
            value={d.phone || "-"}
            icon={<Phone className="h-4 w-4" />}
          />
          <Field
            label={t("selection.email")}
            value={d.email || "-"}
            icon={<Mail className="h-4 w-4" />}
          />
          <Field
            label={t("selection.currentClub")}
            value={d.currentClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("selection.previousClub")}
            value={d.previousClub || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("selection.position")}
            value={d.position || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title={t("selection.guardian_info")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("selection.lastName")}
            value={d.parentLastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("selection.firstName")}
            value={d.parentFirstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("selection.phone")}
            value={d.parentPhone || "-"}
            icon={<Phone className="h-4 w-4" />}
          />
          <Field
            label={t("selection.email")}
            value={d.parentEmail || "-"}
            icon={<Mail className="h-4 w-4" />}
          />
          <Field
            label={t("selection.relation")}
            value={d.parentRelation || "-"}
            icon={<User className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title={t("common.signature")}>
        {d.signature ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
            <img
              src={d.signature}
              alt={t("common.signature_alt")}
              className="w-full"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
      </Section>
    </>
  );
};

/* 3) Pour "accident-report" */
const renderAccidentReportContent = (
  request: Request,
  t: (key: string) => string,
  locale: string
) => {
  const d = request.details;
  const dateLocale = locale === "fr" ? fr : locale === "nl" ? nl : enGB;

  return (
    <>
      <Section title={t("accident.info_title")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("accident.date")}
            value={
              d.accidentDate
                ? format(new Date(d.accidentDate), "dd/MM/yyyy", {
                    locale: dateLocale,
                  })
                : "-"
            }
            icon={<CalendarIcon className="h-4 w-4" />}
          />
          <Field
            label={t("accident.academy")}
            value={d.academy || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("accident.playerLastName")}
            value={d.playerLastName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("accident.playerFirstName")}
            value={d.playerFirstName || "-"}
            icon={<User className="h-4 w-4" />}
          />
          <Field
            label={t("accident.email")}
            value={d.email || "-"}
            icon={<Mail className="h-4 w-4" />}
          />
          <Field
            label={t("accident.phone")}
            value={d.phone || "-"}
            icon={<Phone className="h-4 w-4" />}
          />
          <Field
            label={t("accident.codeDossier")}
            value={d.codeDossier || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
          <Field
            label={t("accident.documentLabel")}
            value={d.documentLabel || "-"}
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      </Section>

      <Section title={t("accident.description_title")}>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {d.description || t("accident.no_description")}
          </p>
        </div>
      </Section>

      {Array.isArray(d.filePaths) && d.filePaths.length > 0 ? (
        <div data-ignore-pdf>
          <Section title={t("accident.supporting_documents")}>
            <div className="space-y-2">
              {d.filePaths.map((file: string, index: number) => (
                <a
                  key={index}
                  href={`https://daringbrusselsacademy.be/node${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800
               rounded-lg border border-gray-200 dark:border-gray-700
               hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="h-5 w-5 mr-2 text-rwdm-blue" />
                  <span className="text-sm">
                    {t("accident.view_document")} {index + 1}
                  </span>
                </a>
              ))}
            </div>
          </Section>
        </div>
      ) : d.filePath ? (
        <div data-ignore-pdf>
          <Section title={t("accident.supporting_document")}>
            <a
              href={`https://daringbrusselsacademy.be/node${d.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-800
           rounded-lg border border-gray-200 dark:border-gray-700
           hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FileText className="h-5 w-5 mr-2 text-rwdm-blue" />
              <span className="text-sm">{t("accident.view_pdf")}</span>
            </a>
          </Section>
        </div>
      ) : null}

      <Section title={t("common.signature")}>
        {d.signature ? (
          <div
            className="border border-gray-200 dark:border-gray-700 
                          rounded-md p-4 w-full max-w-sm"
          >
            <img
              src={d.signature}
              alt={t("common.signature_alt")}
              className="w-full"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
        )}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>{t("accident.data_consent")}</p>
        </div>
      </Section>
    </>
  );
};

/* 4) Pour "responsibility-waiver" (Décharge de responsabilité) */
const renderResponsibilityWaiverContent = (
  request: Request,
  t: (key: string) => string,
  locale: string,
  pdfRef: React.RefObject<HTMLDivElement>,
  generatePDF: () => Promise<void>
) => {
  const d = request.details;
  const dateLocale = locale === "fr" ? fr : locale === "nl" ? nl : enGB;

  return (
    <div>
      {/* Zone qui sera capturée en PDF */}
      <div ref={pdfRef} className="p-4 bg-white rounded-lg shadow-md">
        <Section title={t("waiver.parent_info")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("waiver.lastName")}
              value={d.parentLastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.firstName")}
              value={d.parentFirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.phone")}
              value={d.parentPhone || "-"}
              icon={<Phone className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.email")}
              value={d.parentEmail || "-"}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title={t("waiver.player_info")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("waiver.lastName")}
              value={d.playerLastName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.firstName")}
              value={d.playerFirstName || "-"}
              icon={<User className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.birthDate")}
              value={
                d.playerBirthDate
                  ? format(new Date(d.playerBirthDate), "dd/MM/yyyy", {
                      locale: dateLocale,
                    })
                  : "-"
              }
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.currentClub")}
              value={d.currentClub || "-"}
              icon={<FileText className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title={t("waiver.waiver_title")}>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {interpolate(t("waiver.waiver_text"), {
                parentFirstName: d.parentFirstName,
                parentLastName: d.parentLastName,
                playerFirstName: d.playerFirstName,
                playerLastName: d.playerLastName,
                playerBirthDate: d.playerBirthDate,
                currentClub: d.currentClub,
              })}
            </p>
          </div>
        </Section>

        <Section title={t("waiver.date_confirmation")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("waiver.signatureDate")}
              value={d.signatureDate || "-"}
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Field
              label={t("waiver.approvalText")}
              value={d.approvalText || "-"}
              icon={<Check className="h-4 w-4" />}
            />
          </div>
        </Section>

        <Section title={t("common.signature")}>
          {d.signature ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full max-w-sm">
              <img
                src={d.signature}
                alt={t("common.signature_alt")}
                className="w-full"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100">-</p>
          )}
        </Section>
      </div>
    </div>
  );
};

/* ======================= COMPOSANT PRINCIPAL ======================= */

const RequestDetailsModal = forwardRef<
  HTMLDivElement,
  RequestDetailsModalProps
>(({ isOpen, onClose, request }, ref) => {
  const { t, lang } = useTranslation();
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !request) return null;

  const generatePDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    // Ajouter le logo
    const logo = new Image();
    logo.src = "/logo.png";
    logo.onload = () => {
      const logoWidth = 30;
      const logoHeight = (logo.height / logo.width) * logoWidth;

      pdf.addImage(
        logo,
        "PNG",
        (210 - logoWidth) / 2,
        10,
        logoWidth,
        logoHeight
      );

      // Ajouter le titre
      pdf.setFontSize(18);
      pdf.text(t("waiver.pdf_title"), 105, logoHeight + 20, {
        align: "center",
      });

      // Ajouter le contenu
      pdf.addImage(imgData, "PNG", 10, logoHeight + 30, 190, 220);

      // Télécharger
      pdf.save(t("waiver.pdf_filename"));
    };
  };

  const renderContent = () => {
    switch (request.type) {
      case "registration":
        return renderRegistrationContent(request, t, lang);
      case "selection-tests":
        return renderSelectionTestsContent(request, t, lang);
      case "accident-report":
        return renderAccidentReportContent(request, t, lang);
      case "responsibility-waiver":
        return renderResponsibilityWaiverContent(
          request,
          t,
          lang,
          pdfRef,
          generatePDF
        );
      default:
        return <p>{t("common.unknown_request_type")}</p>;
    }
  };

  const dateLocale = lang === "fr" ? fr : lang === "nl" ? nl : enGB;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={ref}
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">
              {translateRequestType(request.type, t)}
            </span>
            <div data-ignore-pdf>{getStatusBadge(request.status, t)}</div>
          </DialogTitle>
          <DialogDescription>
            {interpolate(t("request.id_and_date"), {
              id: request.id,
              date: format(request.date, "dd MMMM yyyy", {
                locale: dateLocale,
              }),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{request.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {request.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {(() => {
                        if (request.type === "responsibility-waiver") {
                          return request.details.parentPhone || "-";
                        }
                        if (request.type === "registration") {
                          return request.details.parent1Phone || "-";
                        }
                        if (
                          request.type === "selection-tests" ||
                          request.type === "accident-report"
                        ) {
                          return request.details.phone || "-";
                        }
                        return request.phone || "-";
                      })()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("request.submitted_on")}{" "}
                    {format(request.date, "dd MMMM yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />
          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-ignore-pdf>
            {t("button.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

RequestDetailsModal.displayName = "RequestDetailsModal"; // obligatoire avec forwardRef

export default RequestDetailsModal;
