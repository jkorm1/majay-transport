// majay/components/maintenance-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceFormProps {
  onSuccess?: () => void;
}

export default function MaintenanceForm({ onSuccess }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate cost
    if (!formData.cost || Number(formData.cost) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid cost",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          description: "",
          cost: "",
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
        });
        onSuccess?.();
        toast({
          title: "Success",
          description: "Maintenance recorded successfully",
          variant: "success",
        });
      } else {
        throw new Error("Failed to record maintenance");
      }
    } catch (error) {
      console.error("Error recording maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to record maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Maintenance</CardTitle>
        <CardDescription>Track vehicle maintenance and repairs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (GHS)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Recording..." : "Record Maintenance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
