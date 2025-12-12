"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Item } from "@/types";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Filter,
  Grid3x3,
  Hash,
  List,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ItemTableProps {
  items: Item[];
  clients: Client[];
  onDelete?: (id: string) => void;
  canEdit: boolean;
}

import { useAuth } from "@/providers/auth";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ItemGridView } from "./item-grid-view";

type ViewMode = "list" | "grid";

export function ItemTable({
  items,
  clients,
  onDelete,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Add this handler
  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter items
  const filteredItems = items.filter((item) => {
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

  // Calculate pagination values for list view
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // For grid view, use filtered items directly (or implement different pagination if needed)
  const gridViewItems = filteredItems;

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page

    // Update selected items if needed
    const newStartIndex = (currentPage - 1) * newRowsPerPage;
    const newEndIndex = Math.min(newStartIndex + newRowsPerPage, totalItems);
    const newPageItems = filteredItems.slice(newStartIndex, newEndIndex);
    const newSelectedItems = selectedItems.filter((id) =>
      newPageItems.some((item) => item.id === id)
    );
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const itemsToSelect =
        viewMode === "list" ? paginatedItems : filteredItems;
      setSelectedItems(itemsToSelect.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, clientFilter]);

  return (
    <div className="space-y-4">
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
          {(user?.role === "ADMIN" || user?.role === "AGENT") && (
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
          </div>
          {canEdit && (
            <div className="lg:block hidden">
              <Button onClick={() => router.push("/dashboard/items/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          )}
        </div>
      </div>

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
              onClick={() => handleBulkMessage()}
              className="flex-1"
            >
              Send Message
            </Button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <>
          <Card className="p-0 overflow-hidden border">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/50 text-center">
                  <TableRow className="border-b [&>:not(:last-child)]:border-r">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={
                          paginatedItems.length > 0 &&
                          selectedItems.length === paginatedItems.length
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(!!checked)
                        }
                      />
                    </TableHead>
                    {showPhotos && (
                      <TableHead className="w-20 text-center">Photo</TableHead>
                    )}
                    <TableHead className="min-w-[120px]">
                      <div className="flex items-center font-bold">
                        <Hash className="mr-2 h-4 w-4" />
                        UID
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <div className="flex items-center font-bold">
                        <Type className="mr-2 h-4 w-4" />
                        Name
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <div className="flex items-center font-bold">
                        <UserRound className="mr-2 h-4 w-4" />
                        Client
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <div className="flex items-center font-bold">
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead className="text-center min-w-[140px]">
                      <div className="flex items-center justify-center font-bold">
                        <Settings className="mr-2 h-4 w-4" />
                        Action
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={showPhotos ? 7 : 6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                          <p>No items found matching your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item) => {
                      let statusDisplay = item.action || "Active";
                      let statusNote = item.actionNote;

                      if (
                        user?.role === "BENEFICIARY" &&
                        item.action === "DISTRIBUTE"
                      ) {
                        if (statusNote !== user.name) {
                          statusNote = "DISTRIBUTION";
                        }
                      } else if (item.action === "DISTRIBUTE") {
                        statusNote = `To: ${item.actionNote}`;
                      }

                      return (
                        <TableRow
                          key={item.id}
                          className="hover:bg-muted/50 transition-colors [&>:not(:last-child)]:border-r"
                        >
                          <TableCell
                            className="text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(item.id, !!checked)
                              }
                            />
                          </TableCell>
                          {showPhotos && (
                            <TableCell className="text-center">
                              {item.photos?.[0] ? (
                                <Image
                                  src={item.photos[0]}
                                  alt=""
                                  className="h-10 w-10 object-cover rounded mx-auto"
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-[10px] mx-auto text-muted-foreground">
                                  No Img
                                </div>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="font-mono text-sm whitespace-nowrap">
                            {item.uid}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {clients.find((c) => c.id === item.clientId)
                              ?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground whitespace-nowrap">
                              {statusDisplay}
                            </span>
                            {statusNote && (
                              <span
                                className="block text-xs text-muted-foreground mt-1 truncate max-w-[120px]"
                                title={statusNote}
                              >
                                {statusNote}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-1 justify-center">
                              {(user?.role === "ADMIN" ||
                                user?.role === "AGENT") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-700 hover:text-green-800 hover:bg-green-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/dashboard/items/${item.id}`
                                        );
                                      }}
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/dashboard/items/${item.id}`
                                      );
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Item</p>
                                </TooltipContent>
                              </Tooltip>
                              {user?.role === "ADMIN" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(item);
                                      }}
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
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
            <div className="text-sm text-muted-foreground order-2 lg:order-1">
              Showing {startIndex + 1} to {endIndex} of {totalItems} items
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto order-1 lg:order-2">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Rows per page
                </span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-1 text-sm">
                  <span className="text-muted-foreground">Page</span>
                  <span className="font-medium min-w-[1.5rem] text-center">
                    {currentPage}
                  </span>
                  <span className="text-muted-foreground">of {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <ItemGridView
            items={gridViewItems}
            clients={clients}
            selectedItems={selectedItems}
            onSelectItem={handleSelectOne}
            canEdit={canEdit}
            showPhotos={showPhotos}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {gridViewItems.length} items</div>
          </div>
        </>
      )}
      {itemToDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{itemToDelete.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/80"
                onClick={() => {
                  onDelete?.(itemToDelete.id);
                  setDeleteDialogOpen(false);
                  setItemToDelete(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
