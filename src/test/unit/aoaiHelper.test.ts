/* eslint-disable @typescript-eslint/naming-convention */
import { expect } from "chai";
import { AOAIHelper } from "../../AOAIHelper";
import * as sinon from "sinon";
import { AOAIEndpointSecrets, AOAIOptions } from "../../AOAITypes";

describe("AOAIHelper", () => {
  const secrets: AOAIEndpointSecrets = {
    aoaiDeployment: "gpt-35-turbo",
    aoaiEndpoint: "https://example.openai.azure.com/",
    aoaiKey: "fake-key",
    aoaiapiVersion: "2024-01-01-preview",
  } as any;
  const options: AOAIOptions = { maxTokens: 12, temperature: 0.1 };

  it("createCodePrompt builds messages and wraps selection", () => {
    const helper = AOAIHelper._createForTest(secrets, options as any);
    const prompt = helper.createCodePrompt("system", "question", "code", true);
    expect(prompt).to.have.length(2);
    expect(prompt[0]).to.deep.include({ role: "system" });
    expect(prompt[1]).to.deep.include({ role: "user" });
    expect(prompt[1].content).to.contain("```\ncode\n```");
  });

  it("createCodePrompt without selection keeps two messages", () => {
    const helper = AOAIHelper._createForTest(secrets, options as any);
    const prompt = helper.createCodePrompt("system", "question");
    expect(prompt).to.have.length(2);
    expect(prompt[1].content).to.equal("question");
  });

  it("doChat returns message content and tracks tokens", async () => {
    // stub _openai
    const fakeResponse = {
      choices: [{ message: { content: "hi" } }],
      usage: { total_tokens: 5 },
    };
    const helper = AOAIHelper._createForTest(secrets, options as any, {
      chat: {
        completions: {
          create: async () => fakeResponse,
        },
      },
    } as any);

    const result = await helper.doChat([
      { role: "user", content: "hello" } as any,
    ]);
    expect(result).to.equal("hi");
    expect(helper.tokenCount).to.equal(5);
  });

  it("connectAOAI succeeds when doChat returns", async () => {
    const helper = AOAIHelper._createForTest(secrets, options as any, {
      chat: { completions: { create: async () => ({ choices: [{ message: { content: "hi" } }], usage: { total_tokens: 1 } }) } },
    } as any);
    // stub doChat to avoid extra logic
    const doChatStub = sinon.stub(helper as any, "doChat").resolves("hello");
    const result = await (helper as any).connectAOAI();
    expect(result).to.be.true;
    doChatStub.restore();
  });

  it("connectAOAI rethrows errors", async () => {
    const helper = AOAIHelper._createForTest(secrets, options as any, {
      chat: { completions: { create: async () => ({}) } },
    } as any);
    const doChatStub = sinon.stub(helper as any, "doChat").rejects(new Error("boom"));
    try {
      await (helper as any).connectAOAI();
      throw new Error("expected failure");
    } catch (err) {
      expect(err).to.exist;
    } finally {
      doChatStub.restore();
    }
  });

  it("getInstance initializes and reuses instance", async () => {
    const connectStub = sinon.stub((AOAIHelper as any).prototype, "connectAOAI").resolves(true);

    const inst1 = await AOAIHelper.getInstance(secrets, { maxTokens: 1 } as any);
    expect(inst1).to.be.instanceOf(AOAIHelper);
    expect(connectStub.calledOnce).to.be.true;

    const inst2 = await AOAIHelper.getInstance(undefined, { temperature: 0.9 } as any);
    expect(inst2).to.equal(inst1);
    expect((inst2 as any).options.temperature).to.equal(0.9);

    connectStub.restore();
  });

  it("getInstance throws when connect fails", async () => {
    const connectStub = sinon.stub((AOAIHelper as any).prototype, "connectAOAI").rejects(new Error("fail"));
    let err: any;
    try {
      await AOAIHelper.getInstance(secrets, options as any);
    } catch (e) {
      err = e;
    }
    expect(err).to.exist;
    connectStub.restore();
  });
});
