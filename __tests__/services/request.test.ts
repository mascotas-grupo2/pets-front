import { request, requestSafe } from "@/services/request";

// Evitamos toasts reales (ErrorGeneric -> sonner) en el camino de error.
jest.mock("@/components/utils/catchErrors", () => ({
  ErrorGeneric: jest.fn(),
}));
import { ErrorGeneric } from "@/components/utils/catchErrors";

describe("request", () => {
  it("envuelve una respuesta exitosa en { ok:true, data, status }", async () => {
    const call = jest.fn().mockResolvedValue({ data: { hello: "world" }, status: 200 });
    const res = await request(call);
    expect(res).toEqual({ ok: true, data: { hello: "world" }, status: 200 });
  });

  it("captura el error y devuelve ok:false con el status de la respuesta", async () => {
    const call = jest
      .fn()
      .mockRejectedValue({ response: { status: 404 }, message: "Not Found" });
    const res = await request(call);
    expect(res.ok).toBe(false);
    expect(res.data).toBeNull();
    expect(res.status).toBe(404);
    expect(res.error).toBe("Not Found");
  });

  it("usa 500 como status por defecto si el error no trae response", async () => {
    const call = jest.fn().mockRejectedValue({ message: "Network Error" });
    const res = await request(call);
    expect(res.status).toBe(500);
  });
});

describe("requestSafe", () => {
  beforeEach(() => jest.clearAllMocks());

  it("devuelve { ok:true, data } en éxito", async () => {
    const call = jest.fn().mockResolvedValue({ data: 42, status: 201 });
    const res = await requestSafe(call);
    expect(res).toEqual({ ok: true, data: 42, status: 201 });
  });

  it("ante error llama a ErrorGeneric y devuelve undefined", async () => {
    const boom = new Error("falló");
    const call = jest.fn().mockRejectedValue(boom);
    const res = await requestSafe(call);
    expect(res).toBeUndefined();
    expect(ErrorGeneric).toHaveBeenCalledWith(boom);
  });
});
