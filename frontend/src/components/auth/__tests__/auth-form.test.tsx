import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthContextValue } from "@/providers/auth-provider";
import { AuthForm } from "../auth-form";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = jest.requireMock("@/hooks/use-auth") as {
  useAuth: jest.MockedFunction<() => AuthContextValue>;
};

const createAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  user: null,
  token: null,
  initialized: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue({}),
  signup: jest.fn().mockResolvedValue({}),
  logout: jest.fn(),
  ...overrides,
});

describe("AuthForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("submits login credentials and redirects on success", async () => {
    const loginMock = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue(createAuthContext({ login: loginMock }));

    render(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText(/e-posta/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/parola/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /giriş yap/i }));

    expect(loginMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(pushMock).toHaveBeenCalledWith("/drops");
  });

  it("shows error detail when request fails", async () => {
    const rejection = {
      data: { detail: "Geçersiz kimlik bilgileri" },
    };
    const loginMock = jest.fn().mockRejectedValue(rejection);
    useAuth.mockReturnValue(createAuthContext({ login: loginMock }));

    render(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText(/e-posta/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/parola/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /giriş yap/i }));

    expect(await screen.findByText(/geçersiz kimlik bilgileri/i)).toBeInTheDocument();
  });
});

