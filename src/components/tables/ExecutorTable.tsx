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
import { User } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Pencil,
  Search,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ExecutorTableProps {
  executors: User[];
  onAction: (executor: User, action: "edit" | "delete") => void;
}

export function ExecutorTable({ executors, onAction }: ExecutorTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executorToDelete, setExecutorToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDeleteClick = (executor: User) => {
    setExecutorToDelete(executor);
    setDeleteDialogOpen(true);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter items
  const filteredItems = executors.filter((executor) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      executor.name.toLowerCase().includes(term) ||
      executor.email?.toLowerCase().includes(term);

    return matchesSearch;
  });

  // Calculate pagination values for list view
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <div className="relative w-full lg:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search executor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 *:border-border [&>:not(:last-child)]:border-r">
              <TableHead>
                <div className="flex items-center font-bold">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Name
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center font-bold">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center font-bold">
                  Action
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center h-24 text-muted-foreground"
                >
                  No executors found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((executor) => (
                <TableRow
                  key={executor.id}
                  className="hover:bg-muted/50 *:border-border [&>:not(:last-child)]:border-r"
                >
                  <TableCell className="font-medium">{executor.name}</TableCell>
                  <TableCell>{executor.email}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onAction(executor, "edit")}
                          >
                            <Pencil className="h-4 w-4 text-green-700" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Executor</p>
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
                                onClick={() => handleDeleteClick(executor)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Executor</p>
                            </TooltipContent>
                          </Tooltip>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Executor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {executorToDelete?.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/80"
                              onClick={() => {
                                if (executorToDelete) {
                                  onAction(executorToDelete, "delete");
                                  setDeleteDialogOpen(false);
                                  setExecutorToDelete(null);
                                }
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
  );
}
