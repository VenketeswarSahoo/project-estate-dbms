// components/tables/BeneficiaryTable.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Mail,
  Pencil,
  Settings,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import * as React from "react";
import { DataTable } from "./DataTable";

interface BeneficiaryTableProps {
  beneficiaries: User[];
  onAction: (beneficiary: User, action: "edit" | "delete" | "view") => void;
}

// Define columns for TanStack Table
const getColumns = (
  onEdit: (beneficiary: User) => void,
  onDeleteClick: (beneficiary: User) => void
): ColumnDef<User>[] => [
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
            <UserIcon className="mr-2 h-4 w-4" />
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium flex items-center gap-2">
        <Avatar>
          <AvatarImage src={row.original.avatar} alt={row.original.name} />
          <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
            {row.original.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    enableSorting: true,
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer font-bold"
        >
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
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
      const beneficiary = row.original;

      return (
        <div className="flex justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(beneficiary)}
              >
                <Pencil className="h-4 w-4 text-green-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Beneficiary</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDeleteClick(beneficiary)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Beneficiary</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    enableSorting: false,
  },
];

export function BeneficiaryTable({
  beneficiaries,
  onAction,
}: BeneficiaryTableProps) {
  // Create handlers that use the onAction prop
  const handleEdit = React.useCallback(
    (beneficiary: User) => {
      onAction(beneficiary, "edit");
    },
    [onAction]
  );

  const handleDeleteClick = React.useCallback(
    (beneficiary: User) => {
      onAction(beneficiary, "delete");
    },
    [onAction]
  );

  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDeleteClick),
    [handleEdit, handleDeleteClick]
  );

  return (
    <DataTable
      data={beneficiaries}
      columns={columns}
      onAction={onAction}
      searchPlaceholder="Search beneficiary name or email..."
      entityName="Beneficiary"
    />
  );
}
