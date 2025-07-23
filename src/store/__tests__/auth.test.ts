import "@testing-library/jest-dom";
import { useAuthStore } from "../auth";

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("AuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  it("initializes with correct default state", () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("handles successful login", async () => {
    const mockUser = { id: 1, email: "test@test.com", role: "admin" as const };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    } as Response);

    const { login } = useAuthStore.getState();
    const result = await login("test@test.com", "password");

    expect(result).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("handles failed login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    } as Response);

    const { login } = useAuthStore.getState();
    const result = await login("wrong@test.com", "wrongpassword");

    expect(result).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("handles logout", () => {
    const mockUser = { id: 1, email: "test@test.com", role: "admin" as const, createdAt: new Date().toISOString()}
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });

    const { logout } = useAuthStore.getState();
    logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("handles login network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { login } = useAuthStore.getState();
    const result = await login("test@test.com", "password");

    expect(result).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
