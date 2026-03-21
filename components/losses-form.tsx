"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export function LossesForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    product: "",
    quantity: "",
    price: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/losses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
          potentialValue: Number(formData.quantity) * Number(formData.price),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Loss recorded successfully",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          product: "",
          quantity: "",
          price: "",
          reason: "",
        });
      } else {
        throw new Error("Failed to record loss");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record loss. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="product">Product</Label>
              <Select
                value={formData.product}
                onValueChange={(value) =>
                  setFormData({ ...formData, product: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popcorn">Popcorn</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="sweets">Sweets</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price per unit</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared (Dashed)</SelectItem>
                <SelectItem value="spoiled">Spoiled</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="destroyed">Destroyed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Recording..." : "Record Loss"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
