import "@testing-library/jest-dom";
import { User, Team, Member } from "../index";

describe("Type definitions", () => {
  it("should define User interface correctly", () => {
    const user: User = {
      id: 1,
      email: "test@example.com",
      role: "admin",
      createdAt: "2024-01-01T00:00:00Z",
    };

    expect(user.id).toBe(1);
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe("admin");
  });

  it("should define Team interface correctly", () => {
    const team: Team = {
      id: 1,
      name: "Development Team",
      description: "Main development team",
      leadId: 1,
      leadName: "John Doe",
      memberCount: 5,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    expect(team.id).toBe(1);
    expect(team.name).toBe("Development Team");
    expect(team.memberCount).toBe(5);
  });

  it("should define Member interface correctly", () => {
    const member: Member = {
      id: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "member",
      teamId: 1,
      createdAt: "2024-01-01T00:00:00Z",
    };

    expect(member.id).toBe(1);
    expect(member.name).toBe("Jane Smith");
    expect(member.teamId).toBe(1);
  });

  it("should allow optional fields in Team", () => {
    const team: Team = {
      id: 1,
      name: "Basic Team",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    expect(team.description).toBeUndefined();
    expect(team.leadId).toBeUndefined();
    expect(team.leadName).toBeUndefined();
    expect(team.memberCount).toBeUndefined();
  });
});
