import { writeFileSync } from "node:fs";
import { APP_NAME } from "../config.ts";
import { configureHttpDispatcher } from "../core/http-dispatcher.ts";

export function setupCli(): void {
	// Identify the process as `pi` without destroying /proc/<pid>/cmdline. On Linux,
	// `process.title` overwrites argv memory (libuv), which erases the launch args an
	// external supervisor reads to replay them on restart; writing /proc/self/comm sets
	// the kernel task name while leaving argv intact. Exception: if a secret is on the
	// command line (--api-key VALUE or --api-key=VALUE), keep the argv-overwriting assignment
	// so the key is not left readable in /proc/cmdline for the process lifetime (that session
	// is not replayable).
	if (process.platform === "linux" && !process.argv.some((a) => a === "--api-key" || a.startsWith("--api-key="))) {
		try {
			writeFileSync("/proc/self/comm", APP_NAME);
		} catch {
			process.title = APP_NAME;
		}
	} else {
		process.title = APP_NAME;
	}
	process.env.PI_CODING_AGENT = "true";
	process.env.AI_AGENT = "pi";
	process.emitWarning = (() => {}) as typeof process.emitWarning;

	// Configure undici before provider SDKs issue requests. Settings are applied
	// once SettingsManager has loaded global/project configuration.
	configureHttpDispatcher();
}
