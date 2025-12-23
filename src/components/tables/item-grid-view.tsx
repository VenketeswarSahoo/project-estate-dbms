import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Client, Item } from "@/types";
import {
  AlertCircle,
  BadgeCheck,
  Barcode,
  Eye,
  FileText,
  Pencil,
  Shield,
  Tag,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageSlider } from "../slider/image-slider";

interface ItemGridViewProps {
  items: Item[];
  clients: Client[];
  selectedItems: string[];
  onSelectItem: (id: string, checked: boolean) => void;
  canEdit: boolean;
  showPhotos: boolean;
  columnVisibility: {
    photos: boolean;
    uid: boolean;
    name: boolean;
    clientId: boolean;
    description: boolean;
    barcode: boolean;
    action: boolean;
    actions: boolean;
  };
}

export function ItemGridView({
  items,
  clients,
  selectedItems,
  onSelectItem,
  canEdit,
  showPhotos,
  columnVisibility,
}: ItemGridViewProps) {
  const router = useRouter();
  const { user } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <BadgeCheck className="h-3 w-3" />;
      case "inactive":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items?.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Tag className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        </div>
      ) : (
        items.map((item) => {
          const client = clients.find((c) => c.id === item.clientId);
          const statusNote = item.actionNote;

          return (
            <Card
              key={item.id}
              className={cn(
                "p-4 hover:shadow-lg transition-all duration-200 relative border border-gray-200/50",
                "hover:border-primary/20 group",
                selectedItems.includes(item.id) &&
                  "ring-2 ring-primary border-primary/30"
              )}
            >
              {/* Selection Checkbox */}
              <div
                className="absolute top-4 left-4 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) =>
                    onSelectItem(item.id, !!checked)
                  }
                  className="h-5 w-5 border-2 data-[state=checked]:border-primary"
                />
              </div>

              {/* Status Badge */}
              {columnVisibility.action && item.action && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
                      getStatusColor(item.action)
                    )}
                  >
                    {getStatusIcon(item.action)}
                    <span className="capitalize">
                      {item.action || "Active"}
                    </span>
                  </Badge>
                </div>
              )}

              {/* Photos */}
              {showPhotos && (
                <div className="mb-4 -mx-4 -mt-4">
                  <ImageSlider
                    images={item.photos || []}
                    itemName={item.name}
                  />
                </div>
              )}

              <div className="space-y-4">
                {/* Header Section */}
                <div className="space-y-2">
                  {columnVisibility.name && (
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      {item.uid && columnVisibility.uid && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          ID: {item.uid}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Client Info */}
                  {columnVisibility.clientId && client && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-full">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserRound className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {client.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Grid */}
                {columnVisibility.barcode && item.barcode && (
                  <div className="flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate font-mono">{item.barcode}</span>
                  </div>
                )}

                {/* Description */}
                {columnVisibility.description && item.description && (
                  <div className="pt-2 border-t">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Note */}
                {statusNote && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{statusNote}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {columnVisibility.actions && (
                  <div className="pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/items/${item.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                      {(user?.role === "ADMIN" || user?.role === "AGENT") &&
                        canEdit && (
                          <Button
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/items/${item.id}/edit`);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
