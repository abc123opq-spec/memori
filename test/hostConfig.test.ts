import "mocha";
import { expect } from "chai";
import { HostConfig_webPath, HostConfig_baseUrl } from "../src/utils/webPath";

describe("HostConfig_webPath", () => {
  it("makes root-absolute paths relative", () => {
    expect(HostConfig_webPath("/images/logo.svg")).to.equal("./images/logo.svg");
  });

  it("keeps relative, data and protocol-relative urls", () => {
    expect(HostConfig_webPath("images/logo.svg")).to.equal("images/logo.svg");
    expect(HostConfig_webPath("data:image/png;base64,AA")).to.equal("data:image/png;base64,AA");
    expect(HostConfig_webPath("//cdn.example.com/x")).to.equal("//cdn.example.com/x");
    expect(HostConfig_webPath("https://example.com/x")).to.equal("https://example.com/x");
  });
});

describe("HostConfig_baseUrl", () => {
  it("returns an absolute url outside the browser", () => {
    expect(() => new URL("/user/p/1", HostConfig_baseUrl("https://host.example"))).to.not.throw();
  });
});
