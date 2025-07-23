import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teams, members, users } from "@/db/schema";
import { eq, desc, like, or, count, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (search) {
      whereConditions.push(
        or(like(teams.name, `%${search}%`), like(users.email, `%${search}%`)),
      );
    }

    const teamsData = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        leadId: teams.leadId,
        leadName: users.email,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        memberCount: sql<number>`count(${members.id})`,
      })
      .from(teams)
      .leftJoin(users, eq(teams.leadId, users.id))
      .leftJoin(members, eq(teams.id, members.teamId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(teams.id, users.email)
      .orderBy(desc(teams.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(teams)
      .leftJoin(users, eq(teams.leadId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json({
      teams: teamsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, leadId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 },
      );
    }

    const newTeam = await db
      .insert(teams)
      .values({
        name,
        description,
        leadId: leadId || null,
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTeam[0], { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}
