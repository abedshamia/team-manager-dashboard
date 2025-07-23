"use client";

import { useState, useEffect, useOptimistic } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/animated-card";
import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { MemberModal } from "@/components/member-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Mail,
  UserCog,
} from "lucide-react";
import { Team, Member } from "@/types";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = parseInt(params.id as string);

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { openModal } = useUIStore();

  const [optimisticMembers, addOptimisticMember] = useOptimistic(
    members,
    (state, newMember: Member) => [...state, newMember],
  );

  const [optimisticMembersDelete, removeOptimisticMember] = useOptimistic(
    optimisticMembers,
    (state, memberId: number) =>
      state.filter((member) => member.id !== memberId),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchTeam();
    fetchMembers();
  }, [isAuthenticated, teamId, page, search]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      if (response.ok) {
        const teamData = await response.json();
        setTeam(teamData);
      } else {
        router.push("/teams");
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      router.push("/teams");
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/teams/${teamId}/members?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
      );
      const data = await response.json();
      setMembers(data.members || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (
      !confirm("Are you sure you want to remove this member from the team?")
    ) {
      return;
    }

    removeOptimisticMember(memberId);

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMembers();
      } else {
        fetchMembers();
        alert("Failed to remove member");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      fetchMembers();
      alert("Failed to remove member");
    }
  };

  const handleMemberAdded = (newMember: Member) => {
    addOptimisticMember(newMember);
    setTimeout(fetchMembers, 100);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (!isAuthenticated || !team) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/teams")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teams
                </Button>
                <div className="border-l h-6"></div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Team Info */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    <Users className="h-3 w-3 mr-1" />
                    {optimisticMembersDelete.length} members
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {team.description || "No description provided"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Members Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Team Members</h2>
              {user?.role === "admin" && (
                <Button
                  onClick={() => openModal("create-member", { teamId })}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members by name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : optimisticMembersDelete.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {search ? "No members found" : "No team members yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {search
                  ? "Try adjusting your search terms"
                  : "Add members to get started"}
              </p>
              {!search && user?.role === "admin" && (
                <Button onClick={() => openModal("create-member", { teamId })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {optimisticMembersDelete.map((member, index) => (
                  <AnimatedCard key={member.id} delay={index * 0.1}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {member.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center">
                            <UserCog className="h-3 w-3 mr-1" />
                            <Badge
                              variant={
                                member.role === "admin"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        {user?.role === "admin" && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openModal("edit-member", member)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined:{" "}
                        {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        <MemberModal
          onSuccess={(newMember) => {
            if (newMember) handleMemberAdded(newMember);
            fetchMembers();
          }}
        />
      </div>
    </PageTransition>
  );
}
