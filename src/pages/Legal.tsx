
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import CookiesPolicy from "./CookiesPolicy";

const Legal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-rwdm-blue">Informations Légales</h1>
      
      <Tabs defaultValue="privacy" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="privacy">Politique de Confidentialité</TabsTrigger>
          <TabsTrigger value="terms">CGU & Mentions Légales</TabsTrigger>
          <TabsTrigger value="cookies">Politique de Cookies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <PrivacyPolicy />
        </TabsContent>
        
        <TabsContent value="terms">
          <TermsOfService />
        </TabsContent>
        
        <TabsContent value="cookies">
          <CookiesPolicy />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Legal;
