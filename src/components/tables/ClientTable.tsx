"use client";

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
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ClientTableProps {
  clients: Client[];
  users: User[];
  onDelete: (id: string) => void;
}

export function ClientTable({ clients, users, onDelete }: ClientTableProps) {
  const router = useRouter();

  const getUserName = (id: string) => {
    return users.find((u) => u.id === id)?.name || "Unknown";
  };

  return (
    <Card className="px-4 py-0">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableRow key={client.id} className="hover:bg-muted/50">
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
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Client</p>
                      </TooltipContent>
                    </Tooltip>
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
