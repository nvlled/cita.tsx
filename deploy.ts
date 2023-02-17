#!/usr/bin/env -S deno run -A

// This script does the following:
// - rebuild all files
// - regenerate readme
// - copy _build to docs/ (for gh-pages)
// And optionally
// - tag new version
// - push to remote

import $ from "https://deno.land/x/dax@0.27.0/mod.ts";
import { version } from "./cita.tsx";

await $`./cita.tsx clean`;
await $`./cita.tsx build`;

const readmeContent = await $`./cita.tsx doc`.text();
await Deno.writeTextFile("README.md", readmeContent);

const docs = $.path("./docs");
if (await docs.exists()) {
  await docs.remove({ recursive: true });
}

await docs.mkdir({ recursive: true });
await $.fs.copy("./_build/", "./docs", { overwrite: true });

if (Deno.env.get("TAG")) {
  console.log("tagging new version", version);
  await $`git tag v${version}`;
}
if (Deno.env.get("PUSH")) {
  console.log("push to remote repo");
  await $`git push --all`;
  await $`git push --tags`;
}
