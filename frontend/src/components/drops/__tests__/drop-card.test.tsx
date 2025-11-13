import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthContextValue } from "@/providers/auth-provider";
import { DropCard } from "../drop-card";
import type { Drop } from "@/types/drop";

const drop: Drop = {
  id: 1,
  name: "Test Drop",
  description: "Description",
  capacity: 10,
  claim_window_start: new Date().toISOString(),
  claim_window_end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-drops", () => ({
  useDrops: jest.fn(),
}));

const { useAuth } = jest.requireMock("@/hooks/use-auth") as {
  useAuth: jest.MockedFunction<() => AuthContextValue>;
};

const { useDrops } = jest.requireMock("@/hooks/use-drops") as {
  useDrops: jest.MockedFunction<() => MockDropsContext>;
};

const createAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  user: null,
  token: null,
  initialized: true,
  isLoading: false,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  ...overrides,
});

type MockDropsContext = {
  joinWaitlist: jest.Mock;
  leaveWaitlist: jest.Mock;
  claimDrop: jest.Mock;
  joinLoading: boolean;
  leaveLoading: boolean;
  claimLoading: boolean;
  dropsQuery: { data: Drop[]; isLoading: boolean; isError: boolean };
  getDropById: jest.Mock;
};

const createDropsContext = (
  overrides?: Partial<MockDropsContext>,
): MockDropsContext => ({
  joinWaitlist: jest.fn().mockResolvedValue({}),
  leaveWaitlist: jest.fn().mockResolvedValue({}),
  claimDrop: jest.fn().mockResolvedValue({}),
  joinLoading: false,
  leaveLoading: false,
  claimLoading: false,
  dropsQuery: { data: [], isLoading: false, isError: false },
  getDropById: jest.fn(),
  ...overrides,
});

describe("DropCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers join waitlist action for authenticated user", async () => {
    const joinWaitlistMock = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue(
      createAuthContext({
        user: {
          id: 1,
          email: "admin@test.com",
          is_active: true,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
    );
    useDrops.mockReturnValue(
      createDropsContext({
        joinWaitlist: joinWaitlistMock,
      }),
    );

    render(<DropCard drop={drop} />);

    await userEvent.click(
      screen.getByRole("button", { name: /bekleme listesine katıl/i }),
    );

    expect(joinWaitlistMock).toHaveBeenCalledWith(drop.id);
    expect(await screen.findByText("İşlem başarıyla tamamlandı.")).toBeInTheDocument();
  });

  it("shows login required error when user is not authenticated", async () => {
    useAuth.mockReturnValue(createAuthContext({ user: null }));
    useDrops.mockReturnValue(createDropsContext());

    render(<DropCard drop={drop} />);

    await userEvent.click(
      screen.getByRole("button", { name: /bekleme listesine katıl/i }),
    );

    expect(await screen.findByText("İşlem için giriş yapmalısın.")).toBeInTheDocument();
  });
});

