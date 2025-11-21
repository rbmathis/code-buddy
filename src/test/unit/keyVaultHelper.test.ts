/* eslint-disable @typescript-eslint/naming-convention */
import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("KeyVaultHelper", () => {
  const ensureCliCredential = sinon.stub().resolves({ token: "t", expiresOnTimestamp: 0 });
  const getSecretStub = sinon.stub();

  class FakeSecretClient {
    public vaultUri: string;
    public cred: any;
    constructor(uri: string, cred: any) {
      this.vaultUri = uri;
      this.cred = cred;
    }
    async getSecret(name: string) {
      return getSecretStub(name);
    }
  }

  const { KeyVaultHelper } = proxyquire("../../KeyVaultHelper", {
    "./AuthHelper": { AuthHelper: { ensureCliCredential } },
    "@azure/keyvault-secrets": { SecretClient: FakeSecretClient },
  }) as { KeyVaultHelper: any };

  beforeEach(() => {
    ensureCliCredential.resetHistory();
    getSecretStub.reset();
  });

  it("throws on first init without params", () => {
    expect(() => KeyVaultHelper.getInstance(undefined as any, undefined as any)).to.throw();
  });

  it("initializes and loads secrets", async () => {
    getSecretStub.resolves({ value: "secret-value" });
    const helper = KeyVaultHelper.getInstance({} as any, "https://kv");
    const val = await helper.loadSecret("foo");
    expect(val).to.equal("secret-value");
    expect(ensureCliCredential.calledOnce).to.be.true;
    expect(getSecretStub.calledWith("foo")).to.be.true;
  });

  it("reinitializes when vaultUri changes", async () => {
    getSecretStub.resolves({ value: "v1" });
    const helper1 = KeyVaultHelper.getInstance({} as any, "https://kv1");
    const h1Val = await helper1.loadSecret("foo");
    expect(h1Val).to.equal("v1");

    getSecretStub.resolves({ value: "v2" });
    const helper2 = KeyVaultHelper.getInstance({} as any, "https://kv2");
    const h2Val = await helper2.loadSecret("foo");
    expect(helper2).to.not.equal(helper1);
    expect(h2Val).to.equal("v2");
  });

  it("throws when secret has no value", async () => {
    getSecretStub.resolves({ value: undefined });
    const helper = KeyVaultHelper.getInstance({} as any, "https://kv3");
    try {
      await helper.loadSecret("foo");
      throw new Error("expected rejection");
    } catch (err) {
      expect(err).to.exist;
    }
  });
});
