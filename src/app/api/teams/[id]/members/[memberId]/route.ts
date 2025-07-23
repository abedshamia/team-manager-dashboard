import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const params = await context.params;
    const teamId = parseInt(params.id);
    const memberId = parseInt(params.memberId);
    const { name, email, role } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const existingMember = await db
      .select()
      .from(members)
      .where(and(eq(members.email, email), eq(members.teamId, teamId)))
      .limit(1);

    if (existingMember.length > 0 && existingMember[0].id !== memberId) {
      return NextResponse.json(
        { error: "Email already exists in this team" },
        { status: 400 },
      );
    }

    const updatedMember = await db
      .update(members)
      .set({
        name,
        email,
        role: role || "member",
      })
      .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
      .returning();

    if (!updatedMember.length) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMember[0]);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const params = await context.params;
    const teamId = parseInt(params.id);
    const memberId = parseInt(params.memberId);

    const deletedMember = await db
      .delete(members)
      .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
      .returning();

    if (!deletedMember.length) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 },
    );
  }
}
