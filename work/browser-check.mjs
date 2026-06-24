const { setupBrowserRuntime } = await import("C:/Users/amyph/.codex/plugins/cache/openai-bundled/browser/26.616.51431/scripts/browser-client.mjs");
await setupBrowserRuntime({ globals: globalThis });
globalThis.browser = await agent.browsers.get("iab");
nodeRepl.write(await browser.documentation());
