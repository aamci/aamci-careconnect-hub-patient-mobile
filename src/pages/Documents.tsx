import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Eye, 
  Filter,
  Search,
  Pill,
  TestTube,
  Stethoscope,
  Receipt,
  File
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { documents } from "@/data/mockData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types";

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

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = activeFilter === "all" || doc.type === activeFilter;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.practitioner?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "prescription", label: "Ordonnances" },
    { value: "lab_result", label: "Analyses" },
    { value: "report", label: "Comptes-rendus" },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <PageContainer noPadding>
        <Header title="Mes documents" showBack />
        
        <div className="px-4 pb-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
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
          {filteredDocuments.length === 0 ? (
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
                  <Card key={doc.id} className="p-4">
                    <div className="flex gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${typeConfig.color}15` }}
                      >
                        <TypeIcon 
                          className="h-6 w-6" 
                          style={{ color: typeConfig.color }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {doc.practitioner && `Dr. ${doc.practitioner.lastName} • `}
                          {doc.issuedAt && format(new Date(doc.issuedAt), "d MMM yyyy", { locale: fr })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="muted" className="text-xs">
                            {typeConfig.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => console.log("View", doc.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => console.log("Download", doc.id)}
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
