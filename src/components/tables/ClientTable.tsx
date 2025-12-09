"use client";

import React from "react";
import { Client, User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { Card } from "../ui/card";

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
    <Card className="px-4 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Executor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getUserName(client.executorId)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/dashboard/clients/${client.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
