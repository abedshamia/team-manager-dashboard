"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUIStore } from "@/store/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Member } from "@/types";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  role: z.enum(["admin", "member"], { message: "Role is required" }),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberModalProps {
  onSuccess: (member?: Member) => void;
}

export function MemberModal({ onSuccess }: MemberModalProps) {
  const { modalType, modalData, closeModal, isModalOpen } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = modalType === "edit-member";
  const teamId =
    (modalData as { teamId?: number; id?: number })?.teamId ||
    (modalData as { teamId?: number; id?: number })?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "member",
    },
  });

  useEffect(() => {
    if (
      isModalOpen &&
      (modalType === "create-member" || modalType === "edit-member")
    ) {
      if (isEdit && modalData) {
        setValue("name", (modalData as { name: string }).name);
        setValue("email", (modalData as { email: string }).email);
        setValue("role", (modalData as { role: "admin" | "member" }).role);
      } else {
        reset();
      }
    }
  }, [isModalOpen, modalType, modalData, isEdit, setValue, reset]);

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/teams/${(modalData as { teamId: number; id: number }).teamId}/members/${(modalData as { teamId: number; id: number }).id}`
        : `/api/teams/${teamId}/members`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const member = await response.json();
        closeModal();
        onSuccess(isEdit ? undefined : member);
        reset();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save member");
      }
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Failed to save member");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    !isModalOpen ||
    (modalType !== "create-member" && modalType !== "edit-member")
  ) {
    return null;
  }

  return (
    <Dialog
      open={modalType === "create-member" || modalType === "edit-member"}
      onOpenChange={closeModal}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the member information below."
              : "Add a new member to the team."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              value={watch("role")}
              onValueChange={(value: "admin" | "member") =>
                setValue("role", value)
              }
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select member role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update" : "Add"} Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
