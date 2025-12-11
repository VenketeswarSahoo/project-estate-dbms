"use client";

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
  Trash,
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-72">
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
            <Button onClick={() => router.push("/dashboard/items/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {selectedItems.length > 0 && canEdit && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm animate-in fade-in slide-in-from-top-2">
          <span className="font-medium px-2">
            {selectedItems.length} selected
          </span>
          <div className="h-4 w-px bg-border mx-2" />
          <Select
            value={bulkAction}
            onValueChange={(value) => {
              setBulkAction(value);
              handleBulkAction(value);
            }}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="DISTRIBUTE">Distribute</SelectItem>
              <SelectItem value="DONATE">Donate</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleBulkMessage()}>
            Send Message
          </Button>
        </div>
      )}

      {viewMode === "list" ? (
        <>
          <Card className="px-4 py-2">
            <Table>
              <TableHeader className="text-center">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        paginatedItems.length > 0 &&
                        selectedItems.length === paginatedItems.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                  {showPhotos && <TableHead className="w-20">Photo</TableHead>}
                  <TableHead>
                    <div className="flex items-center font-bold">
                      <Hash className="mr-2 h-4 w-4" />
                      UID
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center font-bold">
                      <Type className="mr-2 h-4 w-4" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center font-bold">
                      <UserRound className="mr-2 h-4 w-4" />
                      Client
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center font-bold">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="flex justify-center">
                    <div className="flex items-center font-bold">
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
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found.
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
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(item.id, !!checked)
                            }
                          />
                        </TableCell>
                        {showPhotos && (
                          <TableCell>
                            {item.photos?.[0] ? (
                              <Image
                                src={item.photos[0]}
                                alt=""
                                className="h-10 w-10 object-cover rounded"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">
                                No Img
                              </div>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="font-mono">{item.uid}</TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {clients.find((c) => c.id === item.clientId)?.name ||
                            "Unknown"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {statusDisplay}
                          </span>
                          {statusNote && (
                            <span className="block text-xs text-muted-foreground mt-1">
                              {statusNote}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center flex items-center gap-2 justify-center">
                          {(user?.role === "ADMIN" ||
                            user?.role === "AGENT") && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/items/${item.id}`);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 text-green-700" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Item</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/items/${item.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Item</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  onDelete?.(item.id);
                                }}
                              >
                                <Trash className="w-4 h-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Item</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {totalItems} items
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="w-[80px]">
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
              <div className="flex items-center gap-2">
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

                <div className="flex items-center gap-1">
                  <span className="px-2">Page</span>
                  <span className="font-medium px-2 min-w-[2rem] text-center">
                    {currentPage}
                  </span>
                  <span className="px-2">of {totalPages}</span>
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
    </div>
  );
}
