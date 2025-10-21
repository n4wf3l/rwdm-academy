import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SplashPublicationService } from "@/lib/splash-publication";
import {
  type SplashPublication,
  SplashPublicationForm,
  SplashPublicationListResponse,
} from "@/types";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  Search,
  ChevronLeft,
  ChevronRight,
  File,
} from "lucide-react";
import { format } from "date-fns";
import { API_BASE } from "@/lib/api-config";

// 👇 replace the whole toImageUrl with this version
const toImageUrl = (raw?: string | null) => {
  if (!raw) return "/placeholder-logo.png";
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/")) {
    // ✅ same-origin request through Vite proxy
    return `/api/image/${raw.replace("/uploads/", "")}`;
  }
  return `/api/image/${raw}`;
};

const SplashPublication: React.FC = () => {
  const { t, lang: currentLanguage } = useTranslation();
  const { toast } = useToast();

  // State
  const [publications, setPublications] = useState<SplashPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<SplashPublication | null>(null);

  // Form state
  const [formData, setFormData] = useState<SplashPublicationForm>({
    title: { fr: "", en: "", nl: "" },
    description: { fr: "", en: "", nl: "" },
    image: undefined,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load publications
  const loadPublications = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const response: SplashPublicationListResponse =
        await SplashPublicationService.getList(page, 10, search);
      setPublications(response.publications);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading publications:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les publications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications(1, searchQuery);
  }, [searchQuery]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Selected image file:', selectedImageFile);
    console.log('Selected publication (for edit):', selectedPublication);

    if (!selectedImageFile && !selectedPublication) {
      console.log('Validation failed: no image file for creation');
      toast({
        title: "Erreur",
        description: t("image_required_error"),
        variant: "destructive",
      });
      return;
    }

    // Validate title in French
    if (!formData.title.fr || formData.title.fr.trim() === '') {
      console.log('Validation failed: missing French title');
      toast({
        title: "Erreur",
        description: "Le titre en français est requis",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSend: SplashPublicationForm = {
        title: formData.title,
        description: formData.description,
        image: selectedImageFile || undefined,
      };

      console.log('Data to send:', dataToSend);

      if (selectedPublication) {
        // Update
        console.log('Updating publication:', selectedPublication.id);
        await SplashPublicationService.update(selectedPublication.id, dataToSend);
        toast({
          title: "Succès",
          description: "Publication mise à jour avec succès",
        });
        setEditDialogOpen(false);
      } else {
        // Create
        console.log('Creating new publication');
        await SplashPublicationService.create(dataToSend);
        toast({
          title: "Succès",
          description: "Publication créée avec succès (inactive)",
        });
        setCreateDialogOpen(false);
      }

      // Reset form
      setFormData({
        title: { fr: "", en: "", nl: "" },
        description: { fr: "", en: "", nl: "" },
        image: undefined,
      });
      setSelectedImageFile(null);
      setImagePreview(null);
      setSelectedPublication(null);

      // Reload publications
      loadPublications(pagination.page, searchQuery);
    } catch (error) {
      console.error("Error saving publication:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await SplashPublicationService.delete(id);
      toast({
        title: "Succès",
        description: "Publication supprimée avec succès",
      });
      loadPublications(pagination.page, searchQuery);
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la publication",
        variant: "destructive",
      });
    }
  };

  // Handle toggle active
  const handleToggleActive = async (publication: SplashPublication) => {
    try {
      const result = await SplashPublicationService.toggleActive(
        publication.id
      );

      // Update local state
      setPublications((prev) =>
        prev.map((pub) =>
          pub.id === publication.id
            ? { ...pub, is_active: result.is_active }
            : result.is_active && pub.is_active
            ? { ...pub, is_active: false }
            : pub
        )
      );

      toast({
        title: "Succès",
        description: result.is_active
          ? "Publication activée"
          : "Publication désactivée",
      });
    } catch (error) {
      console.error("Error toggling publication:", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de la publication",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = async (publication: SplashPublication) => {
    // Parse title and description if they are JSON strings
    const rawTitle = publication.title;
    let parsedTitle: any = rawTitle;

    if (typeof rawTitle === 'string') {
      try {
        parsedTitle = JSON.parse(rawTitle);
      } catch (e) {
        parsedTitle = { fr: rawTitle, en: '', nl: '' };
      }
    } else if (typeof parsedTitle === 'object' && parsedTitle) {
      // Ensure all language keys exist
      parsedTitle = {
        fr: parsedTitle.fr || '',
        en: parsedTitle.en || '',
        nl: parsedTitle.nl || ''
      };
    } else {
      parsedTitle = { fr: '', en: '', nl: '' };
    }

    const rawDescription = publication.description;
    let parsedDescription: any = rawDescription;

    if (typeof rawDescription === 'string') {
      try {
        parsedDescription = JSON.parse(rawDescription);
      } catch (e) {
        parsedDescription = { fr: rawDescription || '', en: '', nl: '' };
      }
    } else if (typeof parsedDescription === 'object' && parsedDescription) {
      // Ensure all language keys exist
      parsedDescription = {
        fr: parsedDescription.fr || '',
        en: parsedDescription.en || '',
        nl: parsedDescription.nl || ''
      };
    } else {
      parsedDescription = { fr: '', en: '', nl: '' };
    }

    setSelectedPublication(publication);
    setFormData({
      title: parsedTitle as { fr: string; en: string; nl: string },
      description: parsedDescription as { fr: string; en: string; nl: string },
      image: undefined, // On ne pré-remplit pas l'image pour l'édition
    });
    setSelectedImageFile(null);
    setImagePreview(publication.image);
    setEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (publication: SplashPublication) => {
    setSelectedPublication(publication);
    setViewDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setSelectedPublication(null);
    setFormData({
      title: { fr: "", en: "", nl: "" },
      description: { fr: "", en: "", nl: "" },
      image: undefined,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setCreateDialogOpen(true);
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 20 * 1024 * 1024; // 20MB
      const recommendedSize = 5 * 1024 * 1024; // 5MB recommandé

      if (file.size > maxSize) {
        toast({
          title: "Image trop volumineuse",
          description: `L'image sélectionnée fait ${(file.size / 1024 / 1024).toFixed(1)}MB. La taille maximum autorisée est de 20MB.`,
          variant: "destructive",
        });
        // Reset le input file
        e.target.value = '';
        return;
      }

      if (file.size > recommendedSize) {
        toast({
          title: "Image volumineuse",
          description: `L'image fait ${(file.size / 1024 / 1024).toFixed(1)}MB. Pour de meilleures performances, privilégiez des images de moins de 5MB.`,
          variant: "default",
        });
      }

      console.log(`Image sélectionnée: ${file.name}, taille: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    loadPublications(newPage, searchQuery);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-rwdm-blue dark:text-white">
              {t("splash_publications")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("splash_publications_desc")}
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-rwdm-blue">
            <Plus className="mr-2 h-4 w-4" />
            {t("new_publication")}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>{t("publications_count").replace("{{count}}", pagination.total.toString())}</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("search_publications")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rwdm-blue"></div>
                </div>
              ) : publications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {t("no_publications_found")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? t("no_publications_match")
                        : t("no_publications_created")}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={openCreateDialog} className="bg-rwdm-blue">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("create_first_publication")}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("title_required").replace(" *", "")}</TableHead>
                        <TableHead>{t("status").replace(":", "")}</TableHead>
                        <TableHead>{t("author").replace(":", "")}</TableHead>
                        <TableHead>{t("published_at").replace(":", "")}</TableHead>
                        <TableHead>{t("updated_at").replace(":", "")}</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publications.map((publication) => (
                        <TableRow key={publication.id}>
                          <TableCell className="font-medium">
                            {(() => {
                              const rawTitle = publication.title;
                              let parsedTitle: any = rawTitle;

                              if (typeof rawTitle === 'string') {
                                try {
                                  parsedTitle = JSON.parse(rawTitle);
                                } catch (e) {
                                  return rawTitle;
                                }
                              }

                              if (typeof parsedTitle === 'object' && parsedTitle) {
                                return String(parsedTitle[currentLanguage] || parsedTitle.fr || '');
                              }

                              return String(parsedTitle || '');
                            })()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {publication.is_active ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {t("active")}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1 cursor-pointer hover:bg-orange-200 transition-colors" onClick={() => handleToggleActive(publication)}>
                                  <Power className="h-3 w-3 text-orange-600" />
                                  {t("inactive")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-rwdm-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {publication.firstName?.[0]}{publication.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {publication.firstName} {publication.lastName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(
                                  new Date(publication.publishedAt),
                                  "dd/MM/yyyy"
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(
                                  new Date(publication.publishedAt),
                                  "HH:mm"
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(
                                  new Date(publication.updatedAt),
                                  "dd/MM/yyyy"
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(
                                  new Date(publication.updatedAt),
                                  "HH:mm"
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewDialog(publication)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(publication)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(publication)}
                              >
                                <Power
                                  className={`h-4 w-4 ${
                                    publication.is_active
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmer la suppression
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cette
                                      publication ? Cette action est
                                      irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(publication.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {pagination.page} sur {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("new_publication")}</DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La nouvelle publication sera créée inactive. Utilisez le bouton toggle pour l'activer.
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="fr" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="nl">Nederlands</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fr" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (FR)</label>
                  <Input
                    value={formData.title.fr}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (FR)
                  </label>
                  <Textarea
                    value={formData.description.fr}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (EN)</label>
                  <Input
                    value={formData.title.en}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (EN)
                  </label>
                  <Textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="nl" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (NL)</label>
                  <Input
                    value={formData.title.nl}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, nl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (NL)
                  </label>
                  <Textarea
                    value={formData.description.nl}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, nl: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t("image_required")}</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!selectedPublication}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rwdm-blue file:text-white hover:file:bg-rwdm-blue/90 mb-4"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={toImageUrl(imagePreview)}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      console.error("Erreur de chargement de l'aperçu:", imagePreview);
                      e.currentTarget.src = "/placeholder-logo.png";
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="bg-rwdm-blue">
                {t("create_publication")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("edit_publication_title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="fr" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fr">Français</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="nl">Nederlands</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fr" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (FR)</label>
                  <Input
                    value={formData.title.fr}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (FR)
                  </label>
                  <Textarea
                    value={formData.description.fr}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (EN)</label>
                  <Input
                    value={formData.title.en}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (EN)
                  </label>
                  <Textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="nl" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("title_required")} (NL)</label>
                  <Input
                    value={formData.title.nl}
                    onChange={(e) =>
                      setFormData({ ...formData, title: { ...formData.title, nl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("publication_description")} (NL)
                  </label>
                  <Textarea
                    value={formData.description.nl}
                    onChange={(e) =>
                      setFormData({ ...formData, description: { ...formData.description, nl: e.target.value } })
                    }
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rwdm-blue file:text-white hover:file:bg-rwdm-blue/90 mb-4"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={toImageUrl(imagePreview)}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      console.error("Erreur de chargement de l'aperçu:", imagePreview);
                      e.currentTarget.src = "/placeholder-logo.png";
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t("keep_current_image")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="bg-rwdm-blue">
                {t("update_publication")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const rawTitle = selectedPublication?.title;
                let parsedTitle: any = rawTitle;

                if (typeof rawTitle === 'string') {
                  try {
                    parsedTitle = JSON.parse(rawTitle);
                  } catch (e) {
                    return rawTitle;
                  }
                }

                if (typeof parsedTitle === 'object' && parsedTitle) {
                  return String(parsedTitle[currentLanguage] || parsedTitle.fr || '');
                }

                return String(parsedTitle || '');
              })()}
            </DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-4">
              <div>
                <img
                  src={toImageUrl(selectedPublication.image)}
                  alt={(() => {
                    const rawTitle = selectedPublication.title;
                    let parsedTitle: any = rawTitle;

                    if (typeof rawTitle === 'string') {
                      try {
                        parsedTitle = JSON.parse(rawTitle);
                      } catch (e) {
                        return rawTitle;
                      }
                    }

                    if (typeof parsedTitle === 'object' && parsedTitle) {
                      return String(parsedTitle[currentLanguage] || parsedTitle.fr || 'Publication');
                    }

                    return String(parsedTitle || 'Publication');
                  })()}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    console.error("Erreur de chargement de l'image:", selectedPublication.image);
                    e.currentTarget.src = "/placeholder-logo.png";
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold">{t("publication_description")}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {(() => {
                    const rawDescription = selectedPublication.description;
                    let parsedDescription: any = rawDescription;

                    if (typeof rawDescription === 'string') {
                      try {
                        parsedDescription = JSON.parse(rawDescription);
                      } catch (e) {
                        return rawDescription;
                      }
                    }

                    if (typeof parsedDescription === 'object' && parsedDescription) {
                      return String(parsedDescription[currentLanguage] || parsedDescription.fr || t("no_description"));
                    }

                    return parsedDescription || t("no_description");
                  })()}
                </p>
              </div>

              {/* Publication Info Card */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
                  Informations de publication
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rwdm-blue rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {selectedPublication.firstName?.[0]}{selectedPublication.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedPublication.firstName} {selectedPublication.lastName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        selectedPublication.is_active ? "default" : "secondary"
                      }
                      className="flex-shrink-0"
                    >
                      {selectedPublication.is_active ? t("active") : t("inactive")}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {selectedPublication.is_active ? "Visible aux utilisateurs" : "Masquée aux utilisateurs"}
                    </span>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Créée le</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {format(
                        new Date(selectedPublication.publishedAt),
                        "dd/MM/yyyy 'à' HH:mm"
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Modifiée le</div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {format(
                        new Date(selectedPublication.updatedAt),
                        "dd/MM/yyyy 'à' HH:mm"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SplashPublication;