"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Edit2, Trash2, RefreshCw, Loader2, Plus } from "lucide-react";
import EditHotelForm from "@/components/hotels/EditHotelForm";
import { toast } from "sonner";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function fetchHotels() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hotel");
      if (response.status === 401) {
        window.location.href = "/sign-in";
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch hotels");
      const data = await response.json();

      setHotels(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load hotels");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHotels();
  }, []);

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/hotel/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete hotel");
      toast.success("Hotel deleted successfully");
      setHotels(hotels.filter(h => h.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">My Hotels</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHotels()}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/hotels/create")}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Hotel</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading hotels...</div>
          ) : hotels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.starRating ? `${hotel.starRating}` : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={hotel.status === "ACTIVE" ? "default" : "secondary"}>
                        {hotel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingHotel(hotel);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This hotel and all its data will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(hotel.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                You haven't added any hotels yet.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/hotels/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first hotel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
          </DialogHeader>
          {editingHotel && (
            <EditHotelForm
              hotel={editingHotel}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchHotels();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
