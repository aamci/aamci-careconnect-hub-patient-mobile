import { useState, useRef } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Pill,
  TestTube,
  Stethoscope,
  Receipt,
  File,
  X,
  Plus,
  Upload,
  Loader2,
  Trash2
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { usePatientProfiles } from "@/hooks/usePatientProfiles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

const documentTypeConfig: Record<DocumentType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
}> = {
  prescription: { label: "Ordonnance", icon: Pill, color: "hsl(var(--chart-1))" },
  lab_result: { label: "Analyse", icon: TestTube, color: "hsl(var(--chart-2))" },
  imaging: { label: "Imagerie", icon: Eye, color: "hsl(var(--chart-3))" },
  report: { label: "Compte-rendu", icon: Stethoscope, color: "hsl(var(--chart-4))" },
  certificate: { label: "Certificat", icon: FileText, color: "hsl(var(--chart-5))" },
  invoice: { label: "Facture", icon: Receipt, color: "hsl(var(--accent))" },
  other: { label: "Autre", icon: File, color: "hsl(var(--muted-foreground))" },
};

type FilterType = "all" | DocumentType;

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("other");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: documents, isLoading } = useDocuments();
  const { data: profiles } = usePatientProfiles();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!uploadFile || !uploadName || !profiles?.length) return;
    try {
      await uploadDocument.mutateAsync({
        file: uploadFile,
        name: uploadName,
        type: uploadType,
        patientProfileId: profiles[0].id,
      });
      toast({ title: "Document ajouté", description: "Le document a été téléversé avec succès" });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadName("");
      setUploadType("other");
    } catch {
      toast({ title: "Erreur", description: "Impossible de téléverser le document", variant: "destructive" });
    }
  };

  const filteredDocuments = documents?.filter((doc) => {
    const matchesFilter = activeFilter === "all" || doc.type === activeFilter;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.practitioner?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "prescription", label: "Ordonnances" },
    { value: "lab_result", label: "Analyses" },
    { value: "report", label: "Comptes-rendus" },
    { value: "certificate", label: "Certificats" },
  ];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument.mutateAsync(docId);
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    }
  };

  // Group documents by month
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const monthKey = format(new Date(doc.created_at), "MMMM yyyy", { locale: fr });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(doc);
    return acc;
  }, {} as Record<string, typeof filteredDocuments>);

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header 
          title="Mes documents" 
          showBack 
          rightElement={
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="soft" size="icon-sm">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-sm">
                <DialogHeader>
                  <DialogTitle>Ajouter un document</DialogTitle>
                  <DialogDescription>
                    Téléversez vos documents médicaux pour les conserver en sécurité
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadFile(f);
                        if (!uploadName) setUploadName(f.name.replace(/\.[^.]+$/, ''));
                      }
                    }}
                  />
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadFile ? (
                      <div>
                        <File className="h-10 w-10 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground truncate">{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} Mo
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Appuyez pour sélectionner un fichier
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG, PNG jusqu'à 10 Mo
                        </p>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Nom du document</Label>
                    <Input
                      id="doc-name"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Ex: Ordonnance Dr. Martin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de document</Label>
                    <Select value={uploadType} onValueChange={(v) => setUploadType(v as DocumentType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prescription">Ordonnance</SelectItem>
                        <SelectItem value="lab_result">Analyse</SelectItem>
                        <SelectItem value="imaging">Imagerie</SelectItem>
                        <SelectItem value="report">Compte-rendu</SelectItem>
                        <SelectItem value="certificate">Certificat</SelectItem>
                        <SelectItem value="invoice">Facture</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={!uploadFile || !uploadName || uploadDocument.isPending}
                    onClick={handleUpload}
                  >
                    {uploadDocument.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Téléverser
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[36px]",
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Documents List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun document"
              description="Vos documents médicaux apparaîtront ici"
              action={{
                label: "Ajouter un document",
                onClick: () => {},
              }}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([month, docs]) => (
                <div key={month}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                    {month}
                  </h3>
                  <div className="space-y-3">
                    {docs.map((doc) => {
                      const typeConfig = documentTypeConfig[doc.type];
                      const TypeIcon = typeConfig.icon;
                      
                      return (
                        <Card key={doc.id} className="p-3 sm:p-4">
                          <div className="flex gap-3">
                            <div 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${typeConfig.color}15` }}
                            >
                              <TypeIcon 
                                className="h-5 w-5 sm:h-6 sm:w-6" 
                                style={{ color: typeConfig.color }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                {doc.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {doc.practitioner && `Dr. ${doc.practitioner.last_name} • `}
                                {doc.issued_at && format(new Date(doc.issued_at), "d MMM yyyy", { locale: fr })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="muted" className="text-[10px] sm:text-xs">
                                  {typeConfig.label}
                                </Badge>
                                {doc.size && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatFileSize(doc.size)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.file_url, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const link = document.createElement('a');
                                  link.href = doc.file_url;
                                  link.download = doc.name;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4 max-w-sm">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Le document sera définitivement supprimé.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(doc.id)}
                                      className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                                    >
                                      {deleteDocument.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Supprimer"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
