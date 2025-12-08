"use client";

import React, { useState } from "react";
import { Item, Client } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ItemTableProps {
  items: Item[];
  clients: Client[];
  onDelete?: (id: string) => void;
  canEdit: boolean;
}

import { useAuth } from "@/providers/auth";

import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { Card } from "../ui/card";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map((item) => item.id));
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
      `Bulk action ${action} triggered for ${selectedItems.length} items`
    );
    setSelectedItems([]);
  };

  const handleBulkMessage = () => {
    toast.success(`Message dialog triggered for ${selectedItems.length} items`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, UID, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Status Filter */}
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
      {/* Bulk Actions Toolbar */}
      {selectedItems.length > 0 && canEdit && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm animate-in fade-in slide-in-from-top-2">
          <span className="font-medium px-2">
            {selectedItems.length} selected
          </span>
          <div className="h-4 w-px bg-border mx-2" />
          <Button variant="outline" onClick={() => handleBulkAction("SALE")}>
            Set Sale
          </Button>
          <Button variant="outline" onClick={() => handleBulkAction("DONATE")}>
            Set Donate
          </Button>
          <Button variant="outline" onClick={() => handleBulkMessage()}>
            Send Message
          </Button>
        </div>
      )}

      <Card className="p-4">
        <Table>
          <TableHeader className="text-center">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    filteredItems.length > 0 &&
                    selectedItems.length === filteredItems.length
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              {showPhotos && <TableHead className="w-[80px]">Photo</TableHead>}
              <TableHead>UID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showPhotos ? 9 : 8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
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
                          <img
                            src={item.photos[0]}
                            alt=""
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">
                            No Img
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell
                      className="font-mono cursor-pointer hover:underline"
                      onClick={() => router.push(`/dashboard/items/${item.id}`)}
                    >
                      {item.uid}
                    </TableCell>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => router.push(`/dashboard/items/${item.id}`)}
                    >
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
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/items/${item.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
