import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UserGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserGuideDialog: React.FC<UserGuideDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminVideoPlaying, setIsAdminVideoPlaying] = useState(false);

  // Récupérer le rôle de l'utilisateur au chargement du composant
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      setIsLoading(true);

      if (!token) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchUserRole();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rwdm-blue dark:text-blue-400">
            {t("user_guide")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="client" className="w-full mt-4">
          <TabsList
            className={`mb-4 grid ${
              isLoading
                ? "grid-cols-1"
                : !userRole
                ? "grid-cols-1"
                : userRole === "owner"
                ? "grid-cols-4"
                : userRole === "superadmin"
                ? "grid-cols-3"
                : "grid-cols-2"
            }`}
          >
            <TabsTrigger value="client">{t("guide.client")}</TabsTrigger>

            {userRole && (
              <>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                {["owner", "superadmin"].includes(userRole) && (
                  <TabsTrigger value="superadmin">Superadmin</TabsTrigger>
                )}
                {userRole === "owner" && (
                  <TabsTrigger value="owner">Owner</TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="client" className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h3 className="text-xl font-semibold mb-2 text-rwdm-blue dark:text-blue-400">
                  {t("guide.client_intro")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t("guide.client_desc")}
                </p>
              </div>

              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/85KjWtbbR4o" // Remplacer watch?v= par embed/
                  title="Tutorial Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-rwdm-blue dark:text-blue-400">
                  {t("guide.client_features")}
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                  <h5 className="font-medium mb-2">{t("guide.dashboard")}</h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("guide.dashboard_desc")}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                  <h5 className="font-medium mb-2">{t("guide.requests")}</h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("guide.requests_desc")}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                  <h5 className="font-medium mb-2">
                    {t("guide.appointments")}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("guide.appointments_desc")}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Le reste du contenu reste inchangé mais ne sera affiché que si l'utilisateur a un rôle approprié */}
            {userRole && (
              <TabsContent value="admin" className="space-y-6">
                {/* Contenu admin inchangé */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md">
                  <h3 className="text-xl font-semibold mb-2 text-rwdm-blue dark:text-blue-400">
                    {t("guide.admin_intro")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("guide.admin_desc")}
                  </p>
                </div>

                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden relative">
                  {!isAdminVideoPlaying ? (
                    <div
                      className="w-full h-full cursor-pointer relative"
                      onClick={() => setIsAdminVideoPlaying(true)}
                    >
                      <img
                        src="/admin.jpg"
                        alt="Admin tutorial preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
                        <PlayCircle className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src="https://drive.google.com/file/d/1L1RqSyVrEJvRnVOHUNWXZcm6IBsS-W5f/preview"
                      title="Admin Tutorial Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-rwdm-blue dark:text-blue-400">
                    {t("guide.admin_features")}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.request_management")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.request_management_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.planning")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.planning_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.documents")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.documents_desc")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}

            {["owner", "superadmin"].includes(userRole || "") && (
              <TabsContent value="superadmin" className="space-y-6">
                {/* Contenu superadmin inchangé */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
                  <h3 className="text-xl font-semibold mb-2 text-rwdm-blue dark:text-blue-400">
                    {t("guide.superadmin_intro")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("guide.superadmin_desc")}
                  </p>
                </div>

                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 mx-auto text-rwdm-blue dark:text-blue-400" />
                    <p className="mt-2 font-medium">
                      {t("guide.superadmin_video")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-rwdm-blue dark:text-blue-400">
                    {t("guide.superadmin_features")}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.request_assignment")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.request_assignment_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.archives")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.archives_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.email_management")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.email_management_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.user_management")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.user_management_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.settings")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.settings_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.database")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.database_desc")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}

            {userRole === "owner" && (
              <TabsContent value="owner" className="space-y-6">
                {/* Contenu owner inchangé */}
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
                  <h3 className="text-xl font-semibold mb-2 text-rwdm-blue dark:text-blue-400">
                    {t("guide.owner_intro")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("guide.owner_desc")}
                  </p>
                </div>

                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 mx-auto text-rwdm-blue dark:text-blue-400" />
                    <p className="mt-2 font-medium">{t("guide.owner_video")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-rwdm-blue dark:text-blue-400">
                    {t("guide.owner_features")}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.branding")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.branding_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.rights_management")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.rights_management_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.integrations")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.integrations_desc")}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.analytics")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.analytics_desc")}
                    </p>
                  </div>

                  {/* Nouvelle section Accès développeur */}
                  <h4 className="text-lg font-semibold text-rwdm-blue dark:text-blue-400 mt-6">
                    {t("guide.developer_access")}
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.github_repo")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      <a
                        href="https://github.com/n4wf3l/rwdm-academy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {t("guide.github_repo_link")}
                      </a>
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">
                      {t("guide.tech_stack")}
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.tech_stack_desc")}
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>React + TypeScript</li>
                      <li>Next.js</li>
                      <li>Tailwind CSS</li>
                      <li>shadcn/ui</li>
                      <li>Node.js + Express</li>
                      <li>MySQL</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <h5 className="font-medium mb-2">{t("guide.api_docs")}</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t("guide.api_docs_desc")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuideDialog;
