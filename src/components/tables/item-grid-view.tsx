import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/store/useAppStore";
import { Client, Item } from "@/types";
import { BadgeCheck, Eye, Pencil, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageSlider } from "../slider/image-slider";

interface ItemGridViewProps {
  items: Item[];
  clients: Client[];
  selectedItems: string[];
  onSelectItem: (id: string, checked: boolean) => void;
  canEdit: boolean;
  showPhotos: boolean;
}

export function ItemGridView({
  items,
  clients,
  selectedItems,
  onSelectItem,
  canEdit,
  showPhotos,
}: ItemGridViewProps) {
  const router = useRouter();
  const { user } = useAppStore();

  if (!showPhotos) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No items found.
          </div>
        ) : (
          items?.map((item) => {
            const client = clients.find((c) => c.id === item.clientId);
            let statusNote = item.actionNote;

            return (
              <Card
                key={item.id}
                className={`p-3 hover:shadow-md transition-shadow relative gap-2 ${
                  selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
                }`}
              >
                <div
                  className={`absolute ${
                    showPhotos ? "top-6 left-6" : "top-6 right-6"
                  } z-10 cursor-pointer`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      onSelectItem(item.id, !!checked)
                    }
                    className="w-5 h-5"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <h3 className="font-semibold text-lg flex-wrap">
                      {item.name}
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground">
                      UID: {item.uid}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserRound className="h-4 w-4" />
                      <span className="truncate">
                        {client?.name || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="capitalize">
                        {item.action || "Active"}
                      </span>
                    </div>
                  </div>

                  {statusNote && (
                    <p className="text-xs text-muted-foreground truncate">
                      {statusNote}
                    </p>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/items/${item.id}`);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/items/${item.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items?.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No items found.
        </div>
      ) : (
        items?.map((item) => {
          const client = clients.find((c) => c.id === item.clientId);
          let statusNote = item.actionNote;

          return (
            <Card
              key={item.id}
              className={`p-3 hover:shadow-md transition-shadow relative gap-3 ${
                selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
              }`}
            >
              <div
                className="absolute top-5 left-5 z-10 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) =>
                    onSelectItem(item.id, !!checked)
                  }
                  className="w-5 h-5"
                />
              </div>

              <ImageSlider images={item.photos || []} itemName={item.name} />

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg flex-wrap">
                    {item.name}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    UID: {item.uid}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <UserRound className="h-4 w-4" />
                    <span className="truncate">
                      {client?.name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="capitalize">
                      {item.action || "Active"}
                    </span>
                  </div>
                </div>

                {statusNote && (
                  <p className="text-xs text-muted-foreground truncate">
                    {statusNote}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  {(user?.role === "ADMIN" || user?.role === "AGENT") && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/items/${item.id}`);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/items/${item.id}`);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
