# Security

Use the newest tested image for your chosen Playwright version and check its
release notes for component updates. Security fixes are published under new tags;
older images remain available but are not updated.

Report sensitive vulnerabilities through GitHub's **Report a vulnerability**
feature when available. Keep credentials and exploit details out of public issues.

For vulnerabilities in bundled software, follow that project's security policy
as well. The container runs as root by default; use additional isolation when
testing untrusted content.
