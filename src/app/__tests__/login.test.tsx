import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../login/page";
import { useAuthStore } from "@/store/auth";
import { loginAction } from "@/lib/actions";

// Mock the loginAction to return success/failure
const mockLoginAction = loginAction as jest.MockedFunction<typeof loginAction>;

jest.mock("@/lib/actions", () => ({
  loginAction: jest.fn(),
}));

jest.mock("@/store/auth");
jest.mock("@/store/ui", () => ({
  useUIStore: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    isModalOpen: false,
    modalType: null,
    modalData: null,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockSetUser = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      setUser: mockSetUser,
    });
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /team manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows demo credentials", () => {
    render(<LoginPage />);

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@demo.com/)).toBeInTheDocument();
    expect(screen.getByText(/member@demo.com/)).toBeInTheDocument();
  });

  it("has pre-filled admin credentials", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i,
    ) as HTMLInputElement;

    expect(emailInput.value).toBe("admin@demo.com");
    expect(passwordInput.value).toBe("admin123");
  });
});
