"use server";

import { db } from "@/db";
import { teams, members, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const teamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name too long"),
  description: z.string().max(500, "Description too long").optional(),
  leadId: z
    .string()
    .optional()
    .transform((val) => (val && val !== "0" ? parseInt(val) : undefined)),
});

const memberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email").max(255, "Email too long"),
  role: z.enum(["admin", "member"], { message: "Role is required" }),
  teamId: z.number(),
});

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    const validatedData = authSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user.length) {
      return {
        success: false,
        message: "Invalid credentials",
        errors: { email: ["User not found"] },
      };
    }

    if (user[0].password !== validatedData.password) {
      return {
        success: false,
        message: "Invalid credentials",
        errors: { password: ["Incorrect password"] },
      };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role,
        createdAt: user[0].createdAt,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: "Authentication failed",
      errors: {},
    };
  }
}

export async function createTeamAction(prevState: unknown, formData: FormData) {
  try {
    const validatedData = teamSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      leadId: formData.get("leadId") || undefined,
    });

    const newTeam = await db
      .insert(teams)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        leadId: validatedData.leadId || null,
        updatedAt: new Date().toISOString(),
      })
      .returning();

    revalidatePath("/teams");

    return {
      success: true,
      message: "Team created successfully",
      team: newTeam[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Error creating team:", error);
    return {
      success: false,
      message: "Failed to create team",
      errors: {},
    };
  }
}

export async function updateTeamAction(prevState: unknown, formData: FormData) {
  try {
    const teamId = parseInt(formData.get("id") as string);

    const validatedData = teamSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      leadId: formData.get("leadId") || undefined,
    });

    const updatedTeam = await db
      .update(teams)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        leadId: validatedData.leadId || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(teams.id, teamId))
      .returning();

    if (!updatedTeam.length) {
      return {
        success: false,
        message: "Team not found",
        errors: {},
      };
    }

    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "Team updated successfully",
      team: updatedTeam[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Error updating team:", error);
    return {
      success: false,
      message: "Failed to update team",
      errors: {},
    };
  }
}

export async function deleteTeamAction(prevState: unknown, formData: FormData) {
  try {
    const teamId = parseInt(formData.get("id") as string);

    await db.delete(members).where(eq(members.teamId, teamId));

    const deletedTeam = await db
      .delete(teams)
      .where(eq(teams.id, teamId))
      .returning();

    if (!deletedTeam.length) {
      return {
        success: false,
        message: "Team not found",
        errors: {},
      };
    }

    revalidatePath("/teams");

    return {
      success: true,
      message: "Team deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting team:", error);
    return {
      success: false,
      message: "Failed to delete team",
      errors: {},
    };
  }
}

export async function createMemberAction(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const teamId = parseInt(formData.get("teamId") as string);

    const validatedData = memberSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      teamId,
    });

    const existingMember = await db
      .select()
      .from(members)
      .where(
        and(eq(members.email, validatedData.email), eq(members.teamId, teamId)),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return {
        success: false,
        message: "Email already exists in this team",
        errors: { email: ["Email already exists in this team"] },
      };
    }

    const newMember = await db
      .insert(members)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        teamId: validatedData.teamId,
      })
      .returning();

    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "Member added successfully",
      member: newMember[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Error creating member:", error);
    return {
      success: false,
      message: "Failed to add member",
      errors: {},
    };
  }
}

export async function updateMemberAction(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const teamId = parseInt(formData.get("teamId") as string);
    const memberId = parseInt(formData.get("memberId") as string);

    const validatedData = memberSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      teamId,
    });

    const existingMember = await db
      .select()
      .from(members)
      .where(
        and(eq(members.email, validatedData.email), eq(members.teamId, teamId)),
      )
      .limit(1);

    if (existingMember.length > 0 && existingMember[0].id !== memberId) {
      return {
        success: false,
        message: "Email already exists in this team",
        errors: { email: ["Email already exists in this team"] },
      };
    }

    const updatedMember = await db
      .update(members)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
      })
      .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
      .returning();

    if (!updatedMember.length) {
      return {
        success: false,
        message: "Member not found",
        errors: {},
      };
    }

    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "Member updated successfully",
      member: updatedMember[0],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Error updating member:", error);
    return {
      success: false,
      message: "Failed to update member",
      errors: {},
    };
  }
}

export async function deleteMemberAction(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const teamId = parseInt(formData.get("teamId") as string);
    const memberId = parseInt(formData.get("memberId") as string);

    const deletedMember = await db
      .delete(members)
      .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
      .returning();

    if (!deletedMember.length) {
      return {
        success: false,
        message: "Member not found",
        errors: {},
      };
    }

    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "Member deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting member:", error);
    return {
      success: false,
      message: "Failed to delete member",
      errors: {},
    };
  }
}
