// src/lib/i18n.ts
export const translations = {
  fr: {
    welcome:
      "Bienvenue sur la plateforme officielle d'inscription de la RWDM Academy. Veuillez sélectionner le type de formulaire que vous souhaitez compléter.",
    contact: "Contact",
    about: "À propos",
    home: "Accueil",
    logout: "Déconnexion",
    submit: "Soumettre",
    approved: "Lu et approuvé",
    admin_space: "Espace Admin",
    champ: "* : Champ obligatoire",
    champ2: "Icône information (survol de la souris)",

    academy_registration: "Demande d'inscription à l'académie",
    academy_registration_desc:
      "Formulaire d'inscription pour rejoindre l'académie RWDM",
    selection_tests: "Tests de sélection",
    selection_tests_desc: "Inscription aux tests de sélection pour l'académie",
    accident_report: "Déclaration d'accident",
    accident_report_desc: "Formulaire pour déclarer un accident survenu",
    liability_waiver: "Décharge de responsabilité",
    liability_waiver_desc: "Formulaire de décharge de responsabilité",
    admin_dashboard: "Tableau de bord",
    admin_documents: "Documents",
    admin_planning: "Planning",
    admin_members: "Membres",
    admin_graphics: "Graphiques",
    admin_settings: "Paramètres",
    admin_logout: "Déconnexion",
    admin_panel: "Panneau d'administration",
    admin_rwdm: "Admin RWDM",
    privacy_policy: "Politique de confidentialité",
    terms_and_conditions: "Conditions générales d'utilisation",
    legal_notice: "Mentions légales",
    cookie_policy: "Politique de cookies",
    email_unavailable: "Email indisponible",
    legal_info: "Informations légales",
    all_rights_reserved: "Tous droits réservés.",
    footer_description:
      "La RWDM Academy est dédiée à la formation des jeunes talents du football belge. Nous nous engageons à offrir un environnement d'apprentissage de qualité.",
    about_title: "À propos de RWDM Academy",
    about_subtitle:
      "Découvrez notre histoire, notre mission et notre équipe dédiée au développement des jeunes talents.",
    players_trained: "Joueurs professionnels formés",
    years_experience: "Années d'expérience",
    national_trophies: "Trophées nationaux",
    young_talents: "Jeunes talents",
    tab_history: "Histoire",
    tab_mission: "Mission",
    tab_approach: "Approche",
    history_title: "Histoire",
    mission_title: "Notre mission",
    approach_title: "Notre approche",
    academies_title: "Nos académies",
    rwdm_academy: "RWDM Aca.",
    bef_academy: "BEF Aca.",
    rfe_academy: "RFE Aca.",
    values_title: "Nos valeurs",
    team_title: "Notre équipe",
    no_team_members:
      "Il n'y a actuellement aucun membre enregistré dans la base de donnée de la plateforme.",
    contact_title: "Contactez-nous",
    contact_description:
      "Vous avez des questions ? N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.",
    send_us_message: "Envoyez-nous un message",
    contact_name: "Nom",
    contact_email: "Email",
    contact_subject: "Sujet",
    contact_message: "Message",
    contact_submit: "Envoyer le message",
    contact_office_hours: "Heures d'ouverture secrétariat",
    contact_address_title: "Notre adresse",
    contact_email_title: "Email",
    contact_info_title: "Informations",
    contact_account_name: "Nom de compte",
    contact_vat_number: "N° TVA",
    contact_company_number: "N° d'entreprise",
    contact_closed: "Fermé",
    how_to_find_us: "Comment nous trouver",
    day_lundi: "Lundi",
    day_mardi: "Mardi",
    day_mercredi: "Mercredi",
    day_jeudi: "Jeudi",
    day_vendredi: "Vendredi",
    day_samedi: "Samedi",
    day_dimanche: "Dimanche",
    closed: "Fermé",
    contact_select_subject: "Choisissez un sujet",
    contact_subject_registration:
      "Question à propos d'une demande d'inscription",
    contact_subject_selection: "Question sur les tests de sélection",
    contact_subject_waiver: "Question sur une décharge de responsabilité",
    contact_subject_accident: "Déclaration d'accident",
    contact_subject_recruitment: "Recrutement",
    contact_subject_incident: "Incident",
    contact_subject_technical: "Problème technique",
    contact_subject_other: "Autre",
    inbox: "Boîte de réception",
    auth_title: "Authentification",
    auth_subtitle: "Accès réservé au personnel autorisé",
    auth_email_label: "Email",
    auth_email_placeholder: "votre.email@rwdm.be",
    auth_password_label: "Mot de passe",
    auth_forgot_password: "Mot de passe oublié ?",
    auth_login_button: "Se connecter",
    auth_logging_in: "Connexion en cours...",
    auth_admin_note:
      "Cette page est réservée aux administrateurs de l'Académie RWDM.",
    auth_login_success: "Connexion réussie",
    auth_login_success_desc: "Bienvenue sur le panneau d'administration",
    auth_login_error: "Erreur de connexion",
    auth_login_error_desc: "Veuillez vérifier vos identifiants.",
    season_selection: "Saison d'inscription",
    season_selection_desc:
      "Veuillez sélectionner la saison pour laquelle vous souhaitez inscrire le joueur",
    select_season_placeholder: "Sélectionnez une saison",

    // Académie
    academy_selection: "Académie",
    academy_selection_desc:
      "Veuillez sélectionner l'académie souhaitée pour l'inscription du joueur",
    select_academy_placeholder: "Sélectionnez une académie",

    // Informations joueur
    player_info: "Informations du joueur",
    player_info_desc:
      "Veuillez remplir toutes les informations concernant le joueur",
    label_last_name: "Nom *",
    label_first_name: "Prénom *",
    label_birth_date: "Date de naissance *",
    label_birth_place: "Lieu de naissance *",
    label_address: "Adresse *",
    label_postal_code: "Code postal *",
    label_city: "Ville *",
    label_current_club: "Club actuel",
    tooltip_current_club:
      "Si le joueur n'a pas de club, vous pouvez laisser vide.",
    label_category: "Catégorie *",
    select_category_placeholder: "Sélectionnez une catégorie",

    // Responsables légaux
    legal_info_desc:
      "Veuillez remplir les informations concernant les responsables légaux du joueur",
    primary_guardian: "Responsable principal",
    label_guardian_type: "Type *",
    select_type_placeholder: "Sélectionnez le type",
    option_father: "Père",
    option_mother: "Mère",
    option_legal_guardian: "Tuteur légal",
    label_parent_last_name: "Nom *",
    label_parent_first_name: "Prénom *",
    label_parent_phone: "Téléphone *",
    label_parent_email: "Email *",
    label_parent_address: "Adresse *",
    label_parent_postal_code: "Code postal *",
    label_parent_gsm: "GSM",
    secondary_guardian_button: "Responsable secondaire (optionnel)",

    // Consentement image
    consent_image: "Consentement à l'image",
    consent_image_desc:
      "Veuillez donner votre consentement pour l'utilisation d'images",
    consent_image_label:
      "J'accepte que des photos de mon enfant soient prises et utilisées à des fins promotionnelles.",

    // Signature
    signature: "Signature",
    signature_desc: "Veuillez signer ci-dessous",
    signature_reminder_html:
      "<strong>Pour rappel :</strong> ce formulaire concerne une <u>demande d'inscription</u> à la RWDM Academy et ne constitue en aucun cas une inscription définitive. Vous recevrez une réponse dans les prochaines heures ou jours de la part de la direction, via l'adresse email que vous avez fournie.",
    label_date: "Date :",

    // FR
    accept_policy_html:
      'J\'accepte la <a href="/legal" class="underline text-rwdm-blue" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.',

    // Bouton & cooldown
    button_submit: "Soumettre la demande d'inscription",
    button_submit_loading: "Veuillez patienter...",
    cooldown_message:
      "Vous pourrez renvoyer une demande d'inscription dans {{time}}",

    // Vérification orthographique
    spellcheck_title: "Vérification des informations d'inscription",
    spellcheck_field_player_last_name: "Nom du joueur",
    spellcheck_field_player_first_name: "Prénom du joueur",
    spellcheck_field_parent1_last_name: "Nom du parent principal",
    spellcheck_field_parent1_first_name: "Prénom du parent principal",
    spellcheck_field_parent1_email: "Email du parent principal",
    spellcheck_field_parent2_last_name: "Nom du parent secondaire",
    spellcheck_field_parent2_first_name: "Prénom du parent secondaire",
    spellcheck_field_parent2_email: "Email du parent secondaire",
    signature_placeholder: "Signez ici",
    clear: "Effacer",
    academy_info_html:
      'Plus d\'informations sur nos académies sur la page <a href="/about?tab=histoire#academies" class="underline text-rwdm-blue hover:text-rwdm-red transition-colors">À propos</a>.',
    spellcheck_description:
      "Veuillez vérifier et confirmer chaque champ en cochant la case.",
    spellcheck_not_provided: "Non renseigné",
    spellcheck_modify: "Modifier",
    spellcheck_confirm_submit: "Confirmer et soumettre",
    select_date_placeholder: "Sélectionnez une date",
    toast_success_title: "Formulaire soumis",
    toast_success_description:
      "Votre demande d'inscription a été envoyée avec succès.",
    toast_error_title: "Erreur",
    toast_error_description:
      "Une erreur est survenue lors de l'envoi du formulaire.",
    toast_birthdate_missing_title: "Erreur",
    toast_birthdate_missing_desc:
      "Veuillez sélectionner la date de naissance du joueur.",
    toast_age_invalid_title: "Âge non valide",
    toast_age_invalid_desc:
      "Le joueur doit avoir entre 4 ans et 9 ans pour pouvoir s'inscrire.",
    formType_registration: "d'inscription",
    formType_selectionTests: "de tests de sélection",
    formType_accidentReport: "de déclaration d'accident",
    formType_responsibilityWaiver: "de décharge de responsabilité",

    // Titre & descriptions
    form_submission_success: "Formulaire {{formType}} envoyé avec succès !",
    form_submission_desc1:
      "Votre demande a été enregistrée et est en cours de traitement par notre équipe.",
    form_submission_desc2:
      "Vous recevrez un email de confirmation et serez tenu informé des mises à jour concernant votre demande.",

    // Avertissement 10 minutes
    form_submission_warning_title: "Attention",
    form_submission_warning_text:
      "Pour des raisons de sécurité, veuillez attendre au moins 10 minutes avant de soumettre un nouveau formulaire.",

    // Bouton retour
    return_home: "Retour à l'accueil",
  },

  nl: {
    welcome:
      "Welkom op de officiële RWDM Academy registratie platform. Selecteer het type formulier dat u wilt invullen.",
    contact: "Contact",
    about: "Over ons",
    home: "Startpagina",
    logout: "Afmelden",
    submit: "Verzenden",
    approved: "Gelezen en goedgekeurd",
    admin_space: "Beheerdersgebied",
    champ: "* : Verplicht veld",
    champ2: "Informatiepictogram (muis erover)",

    academy_registration: "Inschrijvingsaanvraag voor de academie",
    academy_registration_desc:
      "Inschrijvingsformulier om lid te worden van de RWDM Academy",
    selection_tests: "Selectietesten",
    selection_tests_desc: "Inschrijving voor de selectietesten van de academie",
    accident_report: "Ongevallenverklaring",
    accident_report_desc: "Formulier om een ongeval te melden",
    liability_waiver: "Aansprakelijkheidsontheffing",
    liability_waiver_desc: "Formulier voor aansprakelijkheidsontheffing",
    admin_dashboard: "Dashboard",
    admin_documents: "Documenten",
    admin_planning: "Planning",
    admin_members: "Leden",
    admin_graphics: "Grafieken",
    admin_settings: "Instellingen",
    admin_logout: "Afmelden",
    admin_panel: "Beheer",
    admin_rwdm: "RWDM Beheer",
    privacy_policy: "Privacybeleid",
    terms_and_conditions: "Algemene gebruiksvoorwaarden",
    legal_notice: "Wettelijke vermeldingen",
    cookie_policy: "Cookiebeleid",
    email_unavailable: "E-mail niet beschikbaar",
    legal_info: "Wettelijke informatie",
    all_rights_reserved: "Alle rechten voorbehouden.",
    footer_description:
      "De RWDM Academy is toegewijd aan de opleiding van jong Belgisch voetbaltalent. Wij engageren ons om een kwaliteitsvolle leeromgeving te bieden.",
    about_title: "Over RWDM Academy",
    about_subtitle:
      "Ontdek ons verhaal, onze missie en ons team dat zich inzet voor de ontwikkeling van jong talent.",
    players_trained: "Opgeleide profspelers",
    years_experience: "Jaren ervaring",
    national_trophies: "Nationale trofeeën",
    young_talents: "Jonge talenten",
    tab_history: "Geschiedenis",
    tab_mission: "Missie",
    tab_approach: "Aanpak",
    history_title: "Geschiedenis",
    mission_title: "Onze missie",
    approach_title: "Onze aanpak",
    academies_title: "Onze academies",
    rwdm_academy: "RWDM Aca.",
    bef_academy: "BEF Aca.",
    rfe_academy: "RFE Aca.",
    values_title: "Onze waarden",
    team_title: "Ons team",
    no_team_members:
      "Er zijn momenteel geen teamleden geregistreerd in het platform.",
    contact_title: "Neem contact met ons op",
    contact_description:
      "Heb je vragen? Aarzel niet om ons te contacteren. Ons team staat klaar om je te helpen.",
    send_us_message: "Stuur ons een bericht",
    contact_name: "Naam",
    contact_email: "E-mail",
    contact_subject: "Onderwerp",
    contact_message: "Bericht",
    contact_submit: "Bericht verzenden",
    contact_office_hours: "Openingsuren secretariaat",
    contact_address_title: "Ons adres",
    contact_email_title: "E-mail",
    contact_info_title: "Informatie",
    contact_account_name: "Rekeningnaam",
    contact_vat_number: "BTW-nummer",
    contact_company_number: "Ondernemingsnummer",
    contact_closed: "Gesloten",
    how_to_find_us: "Hoe ons te vinden",
    day_lundi: "Maandag",
    day_mardi: "Dinsdag",
    day_mercredi: "Woensdag",
    day_jeudi: "Donderdag",
    day_vendredi: "Vrijdag",
    day_samedi: "Zaterdag",
    day_dimanche: "Zondag",
    closed: "Gesloten",
    contact_select_subject: "Kies een onderwerp",
    contact_subject_registration: "Vraag over een inschrijvingsaanvraag",
    contact_subject_selection: "Vraag over de selectietesten",
    contact_subject_waiver: "Vraag over een aansprakelijkheidsontheffing",
    contact_subject_accident: "Ongevallenverklaring",
    contact_subject_recruitment: "Werving",
    contact_subject_incident: "Incident",
    contact_subject_technical: "Technisch probleem",
    contact_subject_other: "Anders",
    inbox: "Inbox",
    auth_title: "Authenticatie",
    auth_subtitle: "Toegang voorbehouden aan gemachtigd personeel",
    auth_email_label: "E-mail",
    auth_email_placeholder: "jouw.email@rwdm.be",
    auth_password_label: "Wachtwoord",
    auth_forgot_password: "Wachtwoord vergeten?",
    auth_login_button: "Inloggen",
    auth_logging_in: "Bezig met inloggen...",
    auth_admin_note:
      "Deze pagina is alleen toegankelijk voor RWDM Academy beheerders.",
    auth_login_success: "Succesvol ingelogd",
    auth_login_success_desc: "Welkom op het beheerderspaneel",
    auth_login_error: "Inlogfout",
    auth_login_error_desc: "Controleer je inloggegevens.",
    // Saison
    season_selection: "Inschrijvingsseizoen",
    season_selection_desc:
      "Selecteer het seizoen waarvoor u de speler wilt inschrijven",
    select_season_placeholder: "Selecteer een seizoen",

    // Académie
    academy_selection: "Academie",
    academy_selection_desc:
      "Selecteer de gewenste academie voor de inschrijving van de speler",
    select_academy_placeholder: "Selecteer een academie",

    // Informations joueur
    player_info: "Spelerinformatie",
    player_info_desc: "Vul alle informatie in over de speler",
    label_last_name: "Achternaam *",
    label_first_name: "Voornaam *",
    label_birth_date: "Geboortedatum *",
    label_birth_place: "Geboorteplaats *",
    label_address: "Adres *",
    label_postal_code: "Postcode *",
    label_city: "Stad *",
    label_current_club: "Huidige club",
    tooltip_current_club:
      "Als de speler geen club heeft, kunt u het leeg laten.",
    label_category: "Categorie *",
    select_category_placeholder: "Selecteer een categorie",

    // Responsables légaux
    legal_info_desc:
      "Vul de gegevens in van de wettelijke vertegenwoordigers van de speler",
    primary_guardian: "Hoofdverantwoordelijke",
    label_guardian_type: "Type *",
    select_type_placeholder: "Selecteer het type",
    option_father: "Vader",
    option_mother: "Moeder",
    option_legal_guardian: "Wettelijke voogd",
    label_parent_last_name: "Achternaam *",
    label_parent_first_name: "Voornaam *",
    label_parent_phone: "Telefoon *",
    label_parent_email: "E-mail *",
    label_parent_address: "Adres *",
    label_parent_postal_code: "Postcode *",
    label_parent_gsm: "GSM",
    secondary_guardian_button: "Tweede verantwoordelijke (optioneel)",

    // Consentement image
    consent_image: "Beeldtoestemming",
    consent_image_desc: "Geef uw toestemming voor het gebruik van afbeeldingen",
    consent_image_label:
      "Ik geef toestemming dat er foto's van mijn kind worden genomen en gebruikt voor promotionele doeleinden.",

    // Signature
    signature: "Handtekening",
    signature_desc: "Onderteken hieronder",
    signature_reminder_html:
      "<strong>Ter herinnering :</strong> dit formulier betreft een <u>inschrijvingsaanvraag</u> bij de RWDM Academy en vormt op geen enkele wijze een definitieve inschrijving. U ontvangt binnen enkele uren of dagen een reactie van de directie via het e-mailadres dat u hebt opgegeven.",
    label_date: "Datum :",

    // Politique
    accept_policy_html:
      'Ik ga akkoord met het <a href="/legal" class="underline text-rwdm-blue" target="_blank" rel="noopener noreferrer">privacybeleid</a>.',

    // Bouton & cooldown
    button_submit: "Verzend de inschrijvingsaanvraag",
    button_submit_loading: "Even geduld aub...",
    cooldown_message: "U kunt een nieuwe inschrijving versturen in {{time}}",

    // Vérification orthographique
    spellcheck_title: "Controle van inschrijvingsgegevens",
    spellcheck_field_player_last_name: "Achternaam van de speler",
    spellcheck_field_player_first_name: "Voornaam van de speler",
    spellcheck_field_parent1_last_name: "Achternaam hoofdverantwoordelijke",
    spellcheck_field_parent1_first_name: "Voornaam hoofdverantwoordelijke",
    spellcheck_field_parent1_email: "E-mailadres hoofdverantwoordelijke",
    spellcheck_field_parent2_last_name: "Achternaam tweede verantwoordelijke",
    spellcheck_field_parent2_first_name: "Voornaam tweede verantwoordelijke",
    spellcheck_field_parent2_email: "E-mailadres tweede verantwoordelijke",
    signature_placeholder: "Hier tekenen",
    clear: "Wissen",
    academy_info_html:
      'Meer informatie over onze academies vind je op de pagina <a href="/about?tab=histoire#academies" class="underline text-rwdm-blue hover:text-rwdm-red transition-colors">Over ons</a>.',
    spellcheck_description:
      "Controleer en bevestig elk veld door het vakje aan te vinken.",
    spellcheck_not_provided: "Niet ingevuld",
    spellcheck_modify: "Wijzigen",
    spellcheck_confirm_submit: "Bevestigen en verzenden",
    select_date_placeholder: "Selecteer een datum",
    toast_success_title: "Formulier verzonden",
    toast_success_description:
      "Je inschrijvingsaanvraag is met succes verzonden.",
    toast_error_title: "Fout",
    toast_error_description:
      "Er is een fout opgetreden bij het verzenden van het formulier.",
    toast_birthdate_missing_title: "Fout",
    toast_birthdate_missing_desc: "Selecteer de geboortedatum van de speler.",
    toast_age_invalid_title: "Ongeldige leeftijd",
    toast_age_invalid_desc:
      "De speler moet tussen 4 en 9 jaar oud zijn om zich in te schrijven.",
    // NL
    formType_registration: "inschrijving",
    formType_selectionTests: "selectietesten",
    formType_accidentReport: "ongevallenmelding",
    formType_responsibilityWaiver: "aansprakelijkheidsformulier",

    form_submission_success: "Formulier {{formType}} succesvol verzonden!",
    form_submission_desc1:
      "Uw aanvraag is geregistreerd en wordt door ons team verwerkt.",
    form_submission_desc2:
      "U ontvangt een bevestigingsmail en wordt op de hoogte gehouden van de updates.",

    form_submission_warning_title: "Let op",
    form_submission_warning_text:
      "Om veiligheidsredenen dient u ten minste 10 minuten te wachten voordat u een nieuw formulier indient.",

    return_home: "Terug naar startpagina",
  },
  en: {
    welcome:
      "Welcome to the official RWDM Academy registration platform. Please select the type of form you wish to complete.",
    contact: "Contact",
    about: "About",
    home: "Home",
    logout: "Logout",
    submit: "Submit",
    approved: "Read and approved",
    admin_space: "Admin area",
    champ: "* : Required field",
    champ2: "Information icon (mouse over)",

    academy_registration: "Academy Registration Request",
    academy_registration_desc: "Form to register and join the RWDM Academy",
    selection_tests: "Selection Tests",
    selection_tests_desc:
      "Form to register for the RWDM Academy's selection tests",
    accident_report: "Accident Report",
    accident_report_desc: "Form to report an accident that occurred",
    liability_waiver: "Liability Waiver",
    liability_waiver_desc: "Form to waive liability responsibility",
    admin_dashboard: "Dashboard",
    admin_documents: "Documents",
    admin_planning: "Planning",
    admin_members: "Members",
    admin_graphics: "Charts",
    admin_settings: "Settings",
    admin_logout: "Logout",
    admin_panel: "Admin Panel",
    admin_rwdm: "RWDM Admin",
    privacy_policy: "Privacy Policy",
    terms_and_conditions: "Terms and Conditions",
    legal_notice: "Legal Notice",
    cookie_policy: "Cookie Policy",
    email_unavailable: "Email unavailable",
    legal_info: "Legal Information",
    all_rights_reserved: "All rights reserved.",
    footer_description:
      "The RWDM Academy is dedicated to developing young Belgian football talents. We are committed to providing a high-quality learning environment.",
    about_title: "About RWDM Academy",
    about_subtitle:
      "Discover our story, mission, and the team dedicated to developing young talents.",
    players_trained: "Professional players trained",
    years_experience: "Years of experience",
    national_trophies: "National trophies",
    young_talents: "Young talents",
    tab_history: "History",
    tab_mission: "Mission",
    tab_approach: "Approach",
    history_title: "History",
    mission_title: "Our mission",
    approach_title: "Our approach",
    academies_title: "Our academies",
    rwdm_academy: "RWDM Aca.",
    bef_academy: "BEF Aca.",
    rfe_academy: "RFE Aca.",
    values_title: "Our values",
    team_title: "Our team",
    no_team_members:
      "There are currently no team members registered on the platform.",
    contact_title: "Contact Us",
    contact_description:
      "Have questions? Don't hesitate to get in touch. Our team is here to help.",
    send_us_message: "Send us a message",
    contact_name: "Name",
    contact_email: "Email",
    contact_subject: "Subject",
    contact_message: "Message",
    contact_submit: "Send Message",
    contact_office_hours: "Office Opening Hours",
    contact_address_title: "Our Address",
    contact_email_title: "Email",
    contact_info_title: "Information",
    contact_account_name: "Account Name",
    contact_vat_number: "VAT Number",
    contact_company_number: "Company Number",
    contact_closed: "Closed",
    how_to_find_us: "How to find us",
    day_lundi: "Monday",
    day_mardi: "Tuesday",
    day_mercredi: "Wednesday",
    day_jeudi: "Thursday",
    day_vendredi: "Friday",
    day_samedi: "Saturday",
    day_dimanche: "Sunday",
    closed: "Closed",
    contact_select_subject: "Choose a subject",
    contact_subject_registration: "Question about a registration request",
    contact_subject_selection: "Question about the selection tests",
    contact_subject_waiver: "Question about a liability waiver",
    contact_subject_accident: "Accident report",
    contact_subject_recruitment: "Recruitment",
    contact_subject_incident: "Incident",
    contact_subject_technical: "Technical issue",
    contact_subject_other: "Other",
    inbox: "Inbox",
    auth_title: "Authentication",
    auth_subtitle: "Access restricted to authorized personnel",
    auth_email_label: "Email",
    auth_email_placeholder: "your.email@rwdm.be",
    auth_password_label: "Password",
    auth_forgot_password: "Forgot password?",
    auth_login_button: "Log in",
    auth_logging_in: "Logging in...",
    auth_admin_note: "This page is reserved for RWDM Academy administrators.",
    auth_login_success: "Login successful",
    auth_login_success_desc: "Welcome to the admin panel",
    auth_login_error: "Login error",
    auth_login_error_desc: "Please check your credentials.",
    season_selection: "Registration season",
    season_selection_desc:
      "Please select the season you want to register the player for",
    select_season_placeholder: "Select a season",

    // Académie
    academy_selection: "Academy",
    academy_selection_desc:
      "Please select the desired academy for the player's registration",
    select_academy_placeholder: "Select an academy",

    // Informations joueur
    player_info: "Player information",
    player_info_desc: "Please fill out all the information about the player",
    label_last_name: "Last Name *",
    label_first_name: "First Name *",
    label_birth_date: "Birth Date *",
    label_birth_place: "Birth Place *",
    label_address: "Address *",
    label_postal_code: "Postal Code *",
    label_city: "City *",
    label_current_club: "Current Club",
    tooltip_current_club:
      "If the player does not have a club, you can leave it blank.",
    label_category: "Category *",
    select_category_placeholder: "Select a category",

    // Responsables légaux
    legal_info_desc:
      "Please fill in the legal guardians' information for the player",
    primary_guardian: "Primary guardian",
    label_guardian_type: "Type *",
    select_type_placeholder: "Select type",
    option_father: "Father",
    option_mother: "Mother",
    option_legal_guardian: "Legal guardian",
    label_parent_last_name: "Last Name *",
    label_parent_first_name: "First Name *",
    label_parent_phone: "Phone *",
    label_parent_email: "Email *",
    label_parent_address: "Address *",
    label_parent_postal_code: "Postal Code *",
    label_parent_gsm: "Cell Phone",
    secondary_guardian_button: "Secondary guardian (optional)",

    // Consentement image
    consent_image: "Image consent",
    consent_image_desc: "Please provide your consent for the use of images",
    consent_image_label:
      "I agree that photos of my child may be taken and used for promotional purposes.",

    // Signature
    signature: "Signature",
    signature_desc: "Please sign below",
    signature_reminder_html:
      "<strong>Reminder:</strong> this form is a registration request to the RWDM Academy and does not constitute a definitive enrollment. You will receive a response within hours or days from management at the email address you provided.",
    label_date: "Date:",

    // Politique
    accept_policy_html:
      'I accept the <a href="/legal" class="underline text-rwdm-blue" target="_blank" rel="noopener noreferrer">privacy policy</a>.',

    // Bouton & cooldown
    button_submit: "Submit registration request",
    button_submit_loading: "Please wait...",
    cooldown_message: "You can resend a registration request in {{time}}",

    // Vérification orthographique
    spellcheck_title: "Registration information verification",
    spellcheck_field_player_last_name: "Player's last name",
    spellcheck_field_player_first_name: "Player's first name",
    spellcheck_field_parent1_last_name: "Primary guardian's last name",
    spellcheck_field_parent1_first_name: "Primary guardian's first name",
    spellcheck_field_parent1_email: "Primary guardian's email",
    spellcheck_field_parent2_last_name: "Secondary guardian's last name",
    spellcheck_field_parent2_first_name: "Secondary guardian's first name",
    spellcheck_field_parent2_email: "Secondary guardian's email",
    signature_placeholder: "Sign here",
    clear: "Clear",
    academy_info_html:
      'More information about our academies is available on the <a href="/about?tab=histoire#academies" class="underline text-rwdm-blue hover:text-rwdm-red transition-colors">About</a> page.',
    spellcheck_description:
      "Please review and confirm each field by ticking the checkbox.",
    spellcheck_not_provided: "Not provided",
    spellcheck_modify: "Modify",
    spellcheck_confirm_submit: "Confirm and submit",
    select_date_placeholder: "Select a date",
    toast_success_title: "Form Submitted",
    toast_success_description:
      "Your registration request has been sent successfully.",
    toast_error_title: "Error",
    toast_error_description: "An error occurred while sending the form.",
    toast_birthdate_missing_title: "Error",
    toast_birthdate_missing_desc: "Please select the player's birth date.",
    toast_age_invalid_title: "Invalid Age",
    toast_age_invalid_desc:
      "Player must be between 4 and 9 years old to register.",
    formType_registration: "registration",
    formType_selectionTests: "selection tests",
    formType_accidentReport: "accident report",
    formType_responsibilityWaiver: "liability waiver",

    form_submission_success: "Form {{formType}} submitted successfully!",
    form_submission_desc1:
      "Your request has been recorded and is being processed by our team.",
    form_submission_desc2:
      "You’ll receive a confirmation email and be kept up to date on any progress.",

    form_submission_warning_title: "Attention",
    form_submission_warning_text:
      "For security reasons, please wait at least 10 minutes before submitting another form.",

    return_home: "Back to home",
  },
};
