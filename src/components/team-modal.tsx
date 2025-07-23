"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useUIStore } from "@/store/ui";
import { createTeamAction, updateTeamAction } from "@/lib/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface TeamModalProps {
  onSuccess: () => void;
}

interface User {
  id: number;
  email: string;
  role: string;
}

interface TeamFormState {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? "Updating..." : "Creating..."}
        </>
      ) : isEdit ? (
        "Update Team"
      ) : (
        "Create Team"
      )}
    </Button>
  );
}

export function TeamModal({ onSuccess }: TeamModalProps) {
  const { modalType, modalData, closeModal } = useUIStore();
  const [users, setUsers] = useState<User[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = modalType === "edit-team";
  const isOpen = modalType === "create-team" || modalType === "edit-team";

  const action = isEdit ? updateTeamAction : createTeamAction;

  const [state, formAction] = useActionState(action, {
    success: false,
    message: "",
    errors: {},
  } as TeamFormState);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (state.success) {
      closeModal();
      onSuccess();
      formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const teamData = isEdit
    ? (modalData as {
        id: number;
        name: string;
        description?: string;
        leadId?: number;
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team" : "Create New Team"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the team information below."
              : "Fill in the details to create a new team."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* Hidden field for team ID when editing */}
          {isEdit && teamData && (
            <input type="hidden" name="id" value={teamData.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter team name"
              defaultValue={isEdit ? teamData?.name || "" : ""}
              required
              className={state.errors?.name ? "border-red-500" : ""}
            />
            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter team description (optional)"
              defaultValue={isEdit ? teamData?.description || "" : ""}
              className={state.errors?.description ? "border-red-500" : ""}
            />
            {state.errors?.description && (
              <p className="text-sm text-red-500">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadId">Team Lead</Label>
            <Select
              name="leadId"
              defaultValue={isEdit ? teamData?.leadId?.toString() || "0" : "0"}
            >
              <SelectTrigger
                className={state.errors?.leadId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a team lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No team lead</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.email} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.leadId && (
              <p className="text-sm text-red-500">{state.errors.leadId[0]}</p>
            )}
          </div>

          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
