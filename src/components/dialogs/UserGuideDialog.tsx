import React from "react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rwdm-blue dark:text-blue-400">
            {t("user_guide")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="client" className="w-full mt-4">
          <TabsList className="mb-4 grid grid-cols-4">
            <TabsTrigger value="client">{t("guide.client")}</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="superadmin">Superadmin</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
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

              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 mx-auto text-rwdm-blue dark:text-blue-400" />
                  <p className="mt-2 font-medium">
                    {t("guide.video_placeholder")}
                  </p>
                </div>
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

            <TabsContent value="admin" className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md">
                <h3 className="text-xl font-semibold mb-2 text-rwdm-blue dark:text-blue-400">
                  {t("guide.admin_intro")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t("guide.admin_desc")}
                </p>
              </div>

              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 mx-auto text-rwdm-blue dark:text-blue-400" />
                  <p className="mt-2 font-medium">{t("guide.admin_video")}</p>
                </div>
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

            <TabsContent value="superadmin" className="space-y-6">
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

            <TabsContent value="owner" className="space-y-6">
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
                  <h5 className="font-medium mb-2">{t("guide.analytics")}</h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("guide.analytics_desc")}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                  <h5 className="font-medium mb-2">{t("guide.branding")}</h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("guide.branding_desc")}
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
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuideDialog;
