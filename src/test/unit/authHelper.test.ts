import { expect } from "chai";
import { AuthHelper } from "../../AuthHelper";

describe("AuthHelper", () => {
  it("calls getToken on provided credential", async () => {
    const cred = {
      getToken: async (scope: string) => ({ token: "t", expiresOnTimestamp: 0, scope }),
    } as any;
    const token = await AuthHelper.ensureCliCredential(cred, "scope");
    expect(token.token).to.equal("t");
  });
});
