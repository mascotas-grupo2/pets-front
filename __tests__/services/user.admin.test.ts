// Mockeamos la instancia de axios para no tocar la red.
jest.mock("@/services/axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import axiosInstance from "@/services/axios";
import { getAdminUsers } from "@/services/user.admin";

const mockGet = axiosInstance.get as jest.Mock;

describe("getAdminUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pega a 'user/admin/list' y devuelve los datos", async () => {
    const payload = { page: 1, pageSize: 100, total: 1, items: [] };
    mockGet.mockResolvedValue({ data: payload, status: 200 });

    const res = await getAdminUsers({ pageSize: 100 });

    expect(mockGet).toHaveBeenCalledWith("user/admin/list", { params: { pageSize: 100 } });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(payload);
  });

  it("propaga el error como ok:false (vía request)", async () => {
    mockGet.mockRejectedValue({ response: { status: 401 }, message: "Unauthorized" });
    const res = await getAdminUsers();
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });
});
