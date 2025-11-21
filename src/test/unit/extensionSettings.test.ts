import { expect } from "chai";
import { ExtensionSettings } from "../../ExtensionSettings";

describe("ExtensionSettings", () => {
  it("computes graphUri for AzureCloud", () => {
    const settings = new ExtensionSettings("AzureCloud", "kv", true, true, 1024, 0.5);
    expect(settings.graphUri).to.equal("https://graph.microsoft.com/.default");
  });

  it("computes graphUri for AzureUSGovernment", () => {
    const settings = new ExtensionSettings("AzureUSGovernment", "kv", true, true, 1024, 0.5);
    expect(settings.graphUri).to.equal("https://graph.microsoft.us/.default");
  });

  it("computes vaultUri for AzureCloud", () => {
    const settings = new ExtensionSettings("AzureCloud", "myvault", true, true, 1024, 0.5);
    expect(settings.vaultUri).to.equal("https://myvault.vault.azure.net");
  });

  it("computes vaultUri for AzureUSGovernment", () => {
    const settings = new ExtensionSettings("AzureUSGovernment", "myvault", true, true, 1024, 0.5);
    expect(settings.vaultUri).to.equal("https://myvault.vault.usgovcloudapi.net");
  });

  it("returns error string for invalid cloud", () => {
    const settings = new ExtensionSettings("FooCloud" as any, "myvault", true, true, 1024, 0.5);
    expect(settings.graphUri).to.equal("[Error]: Invalid Azure Cloud setting");
    expect(settings.vaultUri).to.equal("[Error]: Invalid Azure Cloud setting");
  });
});
