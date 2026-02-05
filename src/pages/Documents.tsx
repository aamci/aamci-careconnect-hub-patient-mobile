import { useState } from "react";
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
  X
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

const documentTypeConfig: Record<DocumentType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
}> = {
  prescription: { label: "Ordonnance", icon: Pill, color: "#0891b2" },
  lab_result: { label: "Analyse", icon: TestTube, color: "#7c3aed" },
  imaging: { label: "Imagerie", icon: Eye, color: "#3b82f6" },
  report: { label: "Compte-rendu", icon: Stethoscope, color: "#22c55e" },
  certificate: { label: "Certificat", icon: FileText, color: "#f59e0b" },
  invoice: { label: "Facture", icon: Receipt, color: "#ec4899" },
  other: { label: "Autre", icon: File, color: "#6b7280" },
};

type FilterType = "all" | DocumentType;

function useDocuments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: profiles } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (!profiles?.length) return [];
      
      const profileIds = profiles.map(p => p.id);
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          practitioner:practitioners(first_name, last_name)
        `)
        .in('patient_profile_id', profileIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: documents, isLoading } = useDocuments();

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
  ];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Mes documents" showBack />
        
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
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
            />
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => {
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
                            // Download logic
                            const link = document.createElement('a');
                            link.href = doc.file_url;
                            link.download = doc.name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
