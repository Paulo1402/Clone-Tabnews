import email from "infra/email";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email", () => {
  test("send", async () => {
    await email.send({
      from: "Test <test@example.com>",
      to: "recipient@example.com",
      subject: "Test email",
      text: "This is a test email.",
    });

    await email.send({
      from: "Test <test@example.com>",
      to: "recipient@example.com",
      subject: "Last email",
      text: "This is the last email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@example.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@example.com>");
    expect(lastEmail.subject).toBe("Last email");
    expect(lastEmail.text).toBe("This is the last email.\n");
  });
});
