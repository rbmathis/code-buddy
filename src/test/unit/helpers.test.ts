import { expect } from "chai";
import { ensureCodeBlocks } from "../../Helpers";

describe("Helpers.ensureCodeBlocks", () => {
  it("should leave even code fences untouched and append separator", () => {
    const input = "```\ncode\n```\nplain";
    const output = ensureCodeBlocks(input);
    expect(output).to.equal("```\ncode\n```\nplain\n\n---\n");
  });

  it("should close a dangling code fence", () => {
    const input = "```\ncode";
    const output = ensureCodeBlocks(input);
    expect(output).to.equal("```\ncode\n```\n\n---\n");
  });

  it("should handle strings without code fences", () => {
    const input = "plain text";
    const output = ensureCodeBlocks(input);
    expect(output).to.equal("plain text\n\n---\n");
  });
});
