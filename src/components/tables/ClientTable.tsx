"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MapPin,
  Pencil,
  Settings,
  Trash2,
  Type,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { DataTable } from "./DataTable";

interface ClientTableProps {
  clients: User[];
  users: User[];
  onAction: (client: User, action: "edit" | "delete" | "view") => void;
}

const getColumns = (
  router: ReturnType<typeof useRouter>,
  users: User[],
  onEdit: (client: User) => void,
  onDeleteClick: (client: User) => void
): ColumnDef<User>[] => {
  const getUserName = (id: string) => {
    return users.find((u) => u.id === id)?.name || "Unknown";
  };

  return [
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
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "address",
      header: () => (
        <div className="flex items-center font-bold">
          <MapPin className="mr-2 h-4 w-4" />
          Address
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
      accessorKey: "executorId",
      header: () => (
        <div className="flex items-center font-bold">
          <UserIcon className="mr-2 h-4 w-4" />
          Executor
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.getValue("executorId")
            ? getUserName(row.getValue("executorId"))
            : "Unassigned"}
        </Badge>
      ),
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
        const client = row.original;

        return (
          <div
            className="flex justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                >
                  <Pencil className="h-4 w-4 text-green-700" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Client</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteClick(client)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Client</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
};

export function ClientTable({ clients, users, onAction }: ClientTableProps) {
  const router = useRouter();

  const handleEdit = React.useCallback(
    (client: User) => {
      onAction(client, "edit");
    },
    [onAction]
  );

  const handleDeleteClick = React.useCallback(
    (client: User) => {
      onAction(client, "delete");
    },
    [onAction]
  );

  const columns = React.useMemo(
    () => getColumns(router, users, handleEdit, handleDeleteClick),
    [router, users, handleEdit, handleDeleteClick]
  );

  return (
    <DataTable
      data={clients}
      columns={columns}
      onAction={onAction}
      searchPlaceholder="Search client name or address..."
      entityName="Client"
    />
  );
}
