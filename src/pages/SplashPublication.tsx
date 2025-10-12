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
  const { t } = useTranslation();
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
    title: "",
    description: "",
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

    if (!selectedImageFile && !selectedPublication) {
      toast({
        title: "Erreur",
        description: "Une image est requise",
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

      if (selectedPublication) {
        // Update
        await SplashPublicationService.update(selectedPublication.id, dataToSend);
        toast({
          title: "Succès",
          description: "Publication mise à jour avec succès",
        });
        setEditDialogOpen(false);
      } else {
        // Create
        await SplashPublicationService.create(dataToSend);
        toast({
          title: "Succès",
          description: "Publication créée avec succès",
        });
        setCreateDialogOpen(false);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
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
    setSelectedPublication(publication);
    setFormData({
      title: publication.title,
      description: publication.description || "",
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
      title: "",
      description: "",
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
              Splash Publications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez les publications qui s'affichent au lancement du site
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-rwdm-blue">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Publication
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
                <CardTitle>Publications ({pagination.total})</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par titre..."
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
                      Aucune publication trouvée
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? "Aucune publication ne correspond à votre recherche."
                        : "Il n'y a actuellement aucune publication créée. Créez-en une pour commencer."}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={openCreateDialog} className="bg-rwdm-blue">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer la première publication
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Publié le</TableHead>
                        <TableHead>Dernière modif</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publications.map((publication) => (
                        <TableRow key={publication.id}>
                          <TableCell className="font-medium">
                            {publication.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                publication.is_active ? "default" : "secondary"
                              }
                            >
                              {publication.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(publication.publishedAt),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(publication.updatedAt),
                              "dd/MM/yyyy HH:mm"
                            )}
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
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nouvelle Publication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image *</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!selectedPublication}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rwdm-blue file:text-white hover:file:bg-rwdm-blue/90"
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
                Annuler
              </Button>
              <Button type="submit" className="bg-rwdm-blue">
                Créer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Modifier la Publication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rwdm-blue file:text-white hover:file:bg-rwdm-blue/90"
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
                    Laissez vide pour conserver l'image actuelle
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
                Annuler
              </Button>
              <Button type="submit" className="bg-rwdm-blue">
                Mettre à jour
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedPublication?.title}</DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-4">
              <div>
                <img
                  src={toImageUrl(selectedPublication.image)}
                  alt={selectedPublication.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    console.error("Erreur de chargement de l'image:", selectedPublication.image);
                    e.currentTarget.src = "/placeholder-logo.png";
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedPublication.description || "Aucune description"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Statut:</span>{" "}
                  <Badge
                    variant={
                      selectedPublication.is_active ? "default" : "secondary"
                    }
                  >
                    {selectedPublication.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Publié le:</span>{" "}
                  {format(
                    new Date(selectedPublication.publishedAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </div>
                <div>
                  <span className="font-medium">Modifié le:</span>{" "}
                  {format(
                    new Date(selectedPublication.updatedAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </div>
                <div>
                  <span className="font-medium">Auteur:</span>{" "}
                  {selectedPublication.firstName} {selectedPublication.lastName}
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