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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, User } from "@/types";
import {
  MapPin,
  Pencil,
  User as Person,
  Settings,
  Trash2,
  Type,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ClientTableProps {
  clients: Client[];
  users: User[];
  onDelete: (id: string) => void;
}

export function ClientTable({ clients, users, onDelete }: ClientTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const getUserName = (id: string) => {
    return users.find((u) => u.id === id)?.name || "Unknown";
  };

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className=":border-border [&>:not(:last-child)]:border-r">
            <TableHead>
              <div className="flex items-center font-bold">
                <Type className="mr-2 h-4 w-4" />
                Name
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center font-bold">
                <MapPin className="mr-2 h-4 w-4" />
                Address
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center font-bold">
                <Person className="mr-2 h-4 w-4" />
                Executor
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center justify-center font-bold">
                <Settings className="mr-2 h-4 w-4" />
                Action
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center h-24 text-muted-foreground"
              >
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                className="hover:bg-muted/50 *:border-border [&>:not(:last-child)]:border-r"
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getUserName(client.executorId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div
                    className="flex justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            router.push(`/dashboard/clients/${client.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4 text-green-700" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Client</p>
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(client)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Client</p>
                          </TooltipContent>
                        </Tooltip>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "
                            {clientToDelete?.name}"? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/80"
                            onClick={() => {
                              clientToDelete && onDelete(clientToDelete.id);
                              setDeleteDialogOpen(false);
                              setClientToDelete(null);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
