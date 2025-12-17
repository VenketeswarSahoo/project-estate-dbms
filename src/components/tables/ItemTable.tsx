"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth";
import { Client, Item, User } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheck,
  Eye,
  Filter,
  Grid3x3,
  Hash,
  List,
  Pencil,
  Plus,
  Search,
  Settings,
  Settings2,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DataTable } from "./DataTable";
import { ItemGridView } from "./item-grid-view";

interface ItemTableProps {
  items: Item[];
  clients: Client[];
  onAction: (item: Item, action: "edit" | "delete" | "view") => void;
  canEdit: boolean;
}

type ViewMode = "list" | "grid";

// Define columns for TanStack Table
const getColumns = (
  router: ReturnType<typeof useRouter>,
  clients: Client[],
  canEdit: boolean,
  showPhotos: boolean,
  selectedItems: string[],
  onSelectItem: (id: string, checked: boolean) => void,
  onAction: (item: Item, action: "edit" | "delete" | "view") => void,
  user: User
): ColumnDef<Item>[] => {
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown";
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getRowModel().rows.length > 0 &&
            selectedItems.length === table.getRowModel().rows.length
          }
          onCheckedChange={(checked) => {
            table.getRowModel().rows.forEach((row) => {
              onSelectItem(row.original.id, !!checked);
            });
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedItems.includes(row.original.id)}
          onCheckedChange={(checked) =>
            onSelectItem(row.original.id, !!checked)
          }
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...(showPhotos
      ? [
          {
            accessorKey: "photos",
            header: () => <div className="text-center font-bold">Photo</div>,
            cell: ({ row }) => (
              <div className="flex justify-center">
                {row.original.photos?.[0] ? (
                  <Image
                    src={row.original.photos[0]}
                    alt=""
                    className="h-10 w-10 object-cover rounded"
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground">
                    No Img
                  </div>
                )}
              </div>
            ),
            enableSorting: false,
          } as ColumnDef<Item>,
        ]
      : []),
    {
      accessorKey: "uid",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer font-bold"
          >
            <div className="flex items-center">
              <Hash className="mr-2 h-4 w-4" />
              UID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("uid")}</div>
      ),
    },
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer font-bold"
          >
            <div className="flex items-center">
              <Type className="mr-2 h-4 w-4" />
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "clientId",
      header: () => (
        <div className="flex items-center font-bold">
          <UserRound className="mr-2 h-4 w-4" />
          Client
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm">{getClientName(row.getValue("clientId"))}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => (
        <div className="flex items-center font-bold">
          <BadgeCheck className="mr-2 h-4 w-4" />
          Status
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const statusDisplay = item.action || "Active";
        const statusNote = item.actionNote;

        return (
          <div>
            <Badge variant="secondary" className="whitespace-nowrap">
              {statusDisplay}
            </Badge>
            {statusNote && (
              <div
                className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]"
                title={statusNote}
              >
                {statusNote}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center font-bold">
          <Settings className="mr-2 h-4 w-4" />
          Action
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div
            className="flex justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-700 hover:text-green-800 hover:bg-green-100"
                    onClick={() => onAction(item, "edit")}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Item</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  onClick={() => onAction(item, "view")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Item</p>
              </TooltipContent>
            </Tooltip>
            {user.role === "ADMIN" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-100"
                    onClick={() => onAction(item, "delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Item</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];
};

export function ItemTable({
  items = [],
  clients = [],
  onAction,
  canEdit,
}: ItemTableProps) {
  const router = useRouter();

  const { user } = useAuth();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");
  const [bulkAction, setBulkAction] = useState("");

  // Handle individual item selection
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    toast.success(
      `${action} set to ${selectedItems.length} ${
        selectedItems.length === 1 ? "item" : "items"
      }`
    );
    setSelectedItems([]);
  };

  const handleBulkMessage = () => {
    toast.success(`Message sent to ${selectedItems.length} items`);
    setSelectedItems([]);
  };

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.uid.toLowerCase().includes(term) ||
        item.barcode.includes(term) ||
        item.description.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" || item.action === statusFilter;

      const matchesClient =
        clientFilter === "ALL" || item.clientId === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [items, searchQuery, statusFilter, clientFilter]);

  const columns = React.useMemo(
    () =>
      getColumns(
        router,
        clients,
        canEdit,
        showPhotos,
        selectedItems,
        handleSelectItem,
        onAction,
        user as User
      ),
    [router, clients, canEdit, showPhotos, selectedItems, onAction]
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between md:items-end lg:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, UID, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={statusFilter !== "ALL" ? "bg-accent" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "ALL" ? "Status" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["ALL", "SALE", "DONATE", "DISTRIBUTE", "OTHER"].map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
                  >
                    {status === "ALL" ? "All Statuses" : status}
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Client Filter (Admin/Agent only) */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={clientFilter !== "ALL" ? "bg-accent" : ""}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Client
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Client</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={clientFilter === "ALL"}
                  onCheckedChange={() => setClientFilter("ALL")}
                >
                  All Clients
                </DropdownMenuCheckboxItem>
                {clients.map((client) => (
                  <DropdownMenuCheckboxItem
                    key={client.id}
                    checked={clientFilter === client.id}
                    onCheckedChange={() => setClientFilter(client.id)}
                  >
                    {client.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => {
                    setViewMode("list");
                    setShowPhotos(false);
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>List View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => {
                    setViewMode("grid");
                    setShowPhotos(true);
                  }}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grid View</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>View Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showPhotos}
                  onCheckedChange={setShowPhotos}
                >
                  Show Photos
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {canEdit && (
              <div className="lg:block hidden">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => router.push("/dashboard/items/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && canEdit && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-md text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center">
            <span className="font-medium px-2 whitespace-nowrap">
              {selectedItems.length} selected
            </span>
            <div className="h-4 w-px bg-border mx-2" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={bulkAction}
              onValueChange={(value) => {
                setBulkAction(value);
                handleBulkAction(value);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="DISTRIBUTE">Distribute</SelectItem>
                <SelectItem value="DONATE">Donate</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleBulkMessage}
              className="flex-1"
            >
              Send Message
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === "list" ? (
        <DataTable
          data={filteredItems}
          columns={columns}
          onAction={onAction}
          entityName="Item"
          searchField={false}
        />
      ) : (
        <>
          <ItemGridView
            items={filteredItems}
            clients={clients}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            canEdit={canEdit}
            showPhotos={showPhotos}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {filteredItems.length} items</div>
          </div>
        </>
      )}
    </div>
  );
}
