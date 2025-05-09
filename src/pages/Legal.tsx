import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Shield, FileText, BookOpen, Cookie } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Confidentiality from "@/components/legal/confidentiality";
import Cgu from "@/components/legal/cgu";
import LegalInfo from "@/components/legal/Legal";
import CookiesPolicy from "@/components/legal/Cookie";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

const tabVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Legal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["privacy", "terms", "legal", "cookies"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rwdm-lightblue/30 dark:from-rwdm-darkblue dark:to-rwdm-blue/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-12 pt-32 flex-grow">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="mr-4 p-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">
                {t("btn_back_home")}
              </span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
            {t("page_legal_title")}
          </h1>
        </div>

        <div className="bg-white dark:bg-rwdm-darkblue/80 rounded-xl shadow-md p-6 mb-8">
          <Tabs
            defaultValue="privacy"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger
                value="privacy"
                className="flex items-center justify-center gap-0 md:gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">
                  {t("tab_confidentiality")}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="terms"
                className="flex items-center justify-center gap-0 md:gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">{t("tab_terms")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="legal"
                className="flex items-center justify-center gap-0 md:gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">{t("tab_legal")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="cookies"
                className="flex items-center justify-center gap-0 md:gap-2"
              >
                <Cookie className="h-4 w-4" />
                <span className="hidden md:inline">{t("tab_cookies")}</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === "privacy" && (
                <motion.div
                  key="privacy"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-6"
                >
                  <Confidentiality />
                </motion.div>
              )}
              {activeTab === "terms" && (
                <motion.div
                  key="terms"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-6"
                >
                  <Cgu />
                </motion.div>
              )}
              {activeTab === "legal" && (
                <motion.div
                  key="legal"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-6"
                >
                  <LegalInfo />
                </motion.div>
              )}
              {activeTab === "cookies" && (
                <motion.div
                  key="cookies"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-6"
                >
                  <CookiesPolicy />
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
