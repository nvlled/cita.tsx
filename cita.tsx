#!/usr/bin/env -S deno run -A

export const documentation = {
  $what_is_this: [
    "cita.tsx is a single-file static site generator based on deno.",
    "It aims are to be able to create type-safe pages",
    "with typescript and jsx with minimal setup.",
    "(Minimal if you already have vscode and deno setup)",
    "",
    "## [demo/documentation](https://nvlled.github.io/cita.tsx/index.html)",
    "",
    "![](assets/demo.gif)",
  ].join("\n"),

  $target_users: [
    "Ideally, this tool would be used by people ",
    "who knows how to use the commandline, and is comfortable",
    "and likes working with typescript and jsx/tsx DSL.",
    "This is purely a html build tool,",
    "client-side scripts are not supported.",
  ].join("\n"),

  $getting_started: {
    [1]: "install and setup deno (see below)",
    [2]: [
      `create a new directory`,
      "```",
      "$ mkdir my-new-site",
      "$ cd my-new-site",
      "```",
    ].join("\n"),
    [3]: "setup cita.tsx (see blow)",
    [4]: `create a page: \`$ ./cita.tsx new homepage.tsx\` `,
    [5]: `build output: \`$ ./cita.tsx build\` `,

    NOTE: "> If you are using vscode, run do `Deno: Initialize Workspace Configuration`",

    $$setup_dino: {
      [1]: "[install deno](https://deno.land/manual@v1.30.3/getting_started/installation)",
      [2]: "If you are using vscode, [install extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)",
    },

    $$setup_cita: {
      [1]: "Copy or download `cita.tsx` into a directory where your static site is",
      [2]: "Inspect and read this file before running",
      [3]: "Make sure it's running correctly: `$ deno run cita.tsx -h`",
      [4]: "`$ chmod +x cita.tsx`",
      NOTE: "> this uses deno -A for convenience. You can remove this or, just run do deno run cita.tsx and manually set the permissions.",
    },
  },

  $development_and_work_flow: {
    [1]: "`./cita.tsx new posts/new-page.tsx`",
    [2]: "`./cita.tsx dev`",
    [3]: "open page in browser `http://localhost:8000` or whatever url is shown",
    [4]: "edit any page, for example `some-page.tsx`, then save changes",
    [5]: "refresh browser",
    [6]: "goto step 4 or 1",

    mapping: [
      "Each `.tsx` files maps to `.html`",
      "For example, to view `index.tsx` open http://localhost:8000/index.html,",
      "or to view `posts/hello.tsx` open http://localhost:8000/posts/hello.html",
    ].join("\n"),

    NOTE: "> If you create new pages or directory, rerun `./cita.tsx dev`",
  },

  $building: [
    "To build and output the HTML files:",
    "```",
    "$ ./cita.tsx build",
    "```",
    "Your static site should be in _build, or whatever is in config.buildDir.",
  ].join("\n"),

  $configuring_and_extension: [
    "You are free to modify and make changes to `cita.tsx` as you see fit.",
    "On the minimum, you can change or add entries in the `config` variable below.",
    "As the site gets more complex, you can add modules and split the ",
    "larger pages into files.",
  ].join("\n"),

  toMarkdown() {
    type header = keyof typeof documentation;
    type gsHeader = keyof typeof documentation.$getting_started;
    const formatHeader = (header: header | gsHeader) => {
      let str = header as string;
      let count = 0;
      while (str[count] === "$") count++;
      str = str.replaceAll("$", "");
      str = str.replace(/[._-]/g, " ");
      str = str.slice(0, 1).toUpperCase() + str.slice(1);
      str = "#".repeat(count + 1) + " " + str;
      return str;
    };
    const getSteps = (obj: Record<string, unknown>) => {
      const result: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        const i = parseInt(k, 10);
        if (typeof v === "string" && !isNaN(i)) {
          result[i] = i + ". " + v;
        }
      }
      return result.join("\n");
    };

    const deindent = (str: string) => {
      str = str.trim();
      const lines = str.split("\n");
      return lines.map((line) => line.trim()).join("\n");
    };

    return deindent(`
      # cita.tsx (backwards for xstatic)

      ${formatHeader("$what_is_this")}
      ${documentation.$what_is_this}

      ${formatHeader("$target_users")}
      ${documentation.$target_users}


      ${formatHeader("$getting_started")}
      ${getSteps(documentation.$getting_started)}
      ${documentation.$getting_started.NOTE}

      ${formatHeader("$$setup_dino")}
      ${getSteps(documentation.$getting_started.$$setup_dino)}

      ${formatHeader("$$setup_cita")}
      ${getSteps(documentation.$getting_started.$$setup_cita)}

      ${formatHeader("$development_and_work_flow")}
      ${getSteps(documentation.$development_and_work_flow)}

      ${documentation.$development_and_work_flow.mapping}

      ${documentation.$development_and_work_flow.NOTE}

      ${formatHeader("$building")}
      ${documentation.$building}

      ${formatHeader("$configuring_and_extension")}
      ${documentation.$configuring_and_extension}
  `);
  },

  getSteps(obj: Record<string, unknown>) {
    const result: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const i = parseInt(k, 10);
      if (typeof v === "string" && !isNaN(i)) {
        result[i] = Marked.parse(v).content;
      }
    }
    return result;
  },
} as const;

import { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
import { createElement, h } from "https://esm.sh/preact@10.12.1";
import type { JSX, ComponentChildren } from "https://esm.sh/preact@10.12.1";
import { render as renderToString } from "https://esm.sh/preact-render-to-string@5.2.6";
import { DOMParser } from "https://esm.sh/linkedom@0.14.22";
import * as path from "https://deno.land/std@0.177.0/path/mod.ts";
import { copy, ensureDir, walk } from "https://deno.land/std@0.177.0/fs/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/command.ts";
import { debounce } from "https://deno.land/std@0.177.0/async/debounce.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";

// --------------------------------------------------------------------------------

export const config = {
  // The site title, to be used on your layout or pages
  siteName: "cita.tsx (xstatic)",
  // You add can more entries here

  // Where the html output will be placed
  buildDir: "./_build",

  // Where to write the auto-generated sitemap.
  sitemapFile: "./sitemap_gen.ts",

  // These files are copied to the build output
  assets: ["favicon.ico", "./assets"],

  dev: {
    autoReloadOnFocus: true,
  },
};

export interface PageData {
  title: string;
  desc?: string;
  image?: string;
  date?: string;
}

export type PageRender = () => JSX.Element;

export interface Page {
  data: PageData;
  render: PageRender;
}

export { h, JSX, ComponentChildren };

// --------------------------------------------------------------------------------

const templates = {
  newPageTemplate: (filename: string) =>
    `
/** @jsx h */
import { h, PageData, PageRender } from "${templates.getRelativeImport(
      filename
    )}";

export const data: PageData = {
  title: "${internal.formatTitle(filename)}",
};

export const render: PageRender = () => {
  return <div>hello world</div>;
};`.trim(),

  layoutTemplate: `
/** @jsx h */
import { h, ComponentChildren, config, getSiteTitle } from "./cita.tsx";

export type LayoutProps = {
  title?: string;
  children: ComponentChildren;
};

export function Layout({ title, children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>{getSiteTitle(title)}</title>
      </head>
      <body>
        {config.siteName}
        <hr />
        <div>{children}</div>
      </body>
    </html>
  );
}
  `.trim(),

  reloadOnFocusScript: `
var reload = false;
  console.log("blur")
window.onblur = function() { 
  console.log("blur")
  reload = true 
};
window.onfocus = function() { 
  console.log("focus")
  if (reload) {
  console.log("reloading")
  setTimeout(() => {
    window.location = window.location;
  }, 512)
  }
};
  `,

  getRelativeImport: (filename: string) => {
    filename = path.relative(path.dirname(filename), "./cita.tsx");
    if (!filename.match(/\.\/\w/)) {
      filename = "./" + filename;
    }
    return filename;
  },
};

export function getSiteTitle(pageTitle?: string) {
  if (pageTitle) {
    return `${pageTitle}- ${config.siteName}`;
  }
  return config.siteName;
}

export function md(markdown: string) {
  return Marked.parse(markdown).content;
}

// --------------------------------------------------------------------------------
type LoadedPage = Page & {
  path: string;
  valid: boolean;
};

const internal = {
  mapRelativePath(pagePath: string, href: string) {
    if (!href) return "";
    if (!href.match(/^https?:\/\//)) {
      href = href.replace(".tsx", ".html");
      href = path.relative(pagePath, href).replace("../", "./");
    }
    return href;
  },
  renderPage(page: LoadedPage, autoReloadOnFocus?: boolean): string {
    const domParser = new DOMParser();
    const html = renderToString(page.render());
    const dom = domParser.parseFromString(html, "text/html");

    // rewrite local hrefs to relative path
    for (const a of dom.querySelectorAll("a, link, area, base")) {
      const anchor = a as { href: string };
      anchor.href = internal.mapRelativePath(page.path, anchor.href);
    }

    // rewrite local srcs to relative path
    for (const a of dom.querySelectorAll(
      "audio, img, video, script, input, track, embed"
    )) {
      const node = a as { src: string };
      node.src = internal.mapRelativePath(page.path, node.src);
    }

    if (autoReloadOnFocus && config.dev.autoReloadOnFocus) {
      const script = dom.createElement("script");
      script.textContent = templates.reloadOnFocusScript;
      dom.appendChild(script);
    }

    return dom.toString();
  },

  async getPageFile(filename: string): Promise<LoadedPage> {
    filename = path.normalize(filename.replace(/(\.html|\.tsx)$/, "")) + ".tsx";

    const buildDir = path.normalize(config.buildDir);
    const dir = path.normalize(path.dirname(filename)) + path.sep;

    let page: LoadedPage = {
      path: filename,
      data: { title: "" },
      valid: false,
      render: () => createElement("div", {}),
    };

    if (dir.startsWith(buildDir)) {
      return page;
    }

    try {
      const obj = await import("./" + filename);
      if (internal.isPage(obj)) {
        page = {
          ...obj,
          valid: true,
          path: filename,
        };
      }
    } catch (_) {}

    return page;
  },

  async getPageFiles(): Promise<LoadedPage[]> {
    const pages: LoadedPage[] = [];
    const buildDir = path.normalize(config.buildDir);

    for await (const entry of walk(".", { exts: [".tsx"] })) {
      const dir = path.normalize(path.dirname(entry.path)) + path.sep;
      if (dir.startsWith(buildDir)) {
        continue;
      }

      let page: LoadedPage = {
        path: entry.path,
        data: { title: "" },
        valid: false,
        render: () => createElement("div", {}),
      };

      try {
        const obj = await import("./" + entry.path);
        if (internal.isPage(obj)) {
          page = {
            ...obj,
            valid: true,
            path: entry.path,
          };
        }
      } catch (_) {
        console.log(entry.path, "cannot be imported");
      }

      pages.unshift(page);
    }
    return pages;
  },

  isPage(obj: unknown): obj is Page {
    if (!obj) return false;
    if (typeof obj !== "object") return false;

    {
      if (!("data" in obj)) return false;
      const data = obj.data;
      if (!data || typeof data !== "object") return false;
      if (!("title" in data)) return false;
      if (!data.title || typeof data.title !== "string") return false;
    }

    {
      if (!("render" in obj)) return false;
      const render = obj.render;
      if (!render || typeof render !== "function") return false;
    }

    return true;
  },

  async loadCurrentSiteMap(): Promise<Record<string, unknown>> {
    let existingSitemap = {};
    try {
      const path = config.sitemapFile;
      existingSitemap = (await import(path))?.sitemap;
    } catch (_) {}
    return existingSitemap ?? {};
  },

  async generateSiteMap(pages: LoadedPage[]): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const page of pages) {
      if (!page.valid) continue;
      if (path.extname(page.path) !== ".tsx") {
        continue;
      }
      const paths = path.dirname(page.path).split(path.sep);
      const key = path.parse(page.path).name.replace(/[- \.]/g, "_");

      if (paths[0] === ".") {
        paths.shift();
      }

      let base = result;
      for (const p of paths) {
        if (!base[p]) {
          base[p] = {};
        }
        base = base[p] as Record<string, unknown>;
      }
      base[key] = {
        ...page.data,
        path: page.path,
      };
    }

    const sitemap = await internal.loadCurrentSiteMap();
    return { ...sitemap, ...result };
  },

  async buildHTML(pages: LoadedPage[], autoReloadOnFocus?: boolean) {
    await ensureDir(config.buildDir);

    for (const page of pages) {
      if (!page.valid) {
        continue;
      }

      const output = internal.renderPage(page, autoReloadOnFocus);
      const dest = path.join(
        config.buildDir,
        page.path.replace(".tsx", ".html")
      );
      await ensureDir(path.dirname(dest));

      console.log("-> ", dest);
      await Deno.writeTextFile(dest, output, {
        create: true,
      });
    }
  },

  async copyAssets() {
    for (const entry of config.assets) {
      if (!entry) continue;
      try {
        await copy(entry, path.join(config.buildDir, entry), {
          overwrite: true,
        });
      } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
          console.log("failed to copy asset", entry, ":", e);
        }
      }
    }
  },

  async generateSiteMapFile(pages: LoadedPage[]) {
    const sitemap = await internal.generateSiteMap(pages);
    const content = `
/* This is a generated file, any manual changes may be overwritten. 
 * If you move or delete pages, delete this file to remove old, unused entries.
 */
export const sitemap = ${JSON.stringify(sitemap, null, 2)};
export default sitemap;
`.trim();

    await Deno.writeTextFile("sitemap_gen.ts", content, {
      create: true,
    });
  },

  formatTitle(filename: string) {
    filename = path.basename(filename, ".tsx");
    filename = filename.replace(/[._-]/g, " ");
    filename = filename.split(/\s+/).join(" ");
    return filename.slice(0, 1).toUpperCase() + filename.slice(1);
  },

  async createNewPage(filename: string) {
    const contents = templates.newPageTemplate(filename);

    const dirname = path.dirname(filename);
    const basename = path.basename(filename, ".tsx") + ".tsx";

    await ensureDir(dirname);
    filename = path.join(dirname, basename);

    try {
      await Deno.writeTextFile(filename, contents, { createNew: true });
    } catch (e) {
      if (e instanceof Deno.errors.AlreadyExists) {
        console.log(`${filename} already exists.`);
      } else {
        console.log("failed to create new page:", e);
      }
    }
  },

  fileExists(filename: string) {
    try {
      Deno.statSync(filename);
      return true;
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
      return false;
    }
  },
};

// --------------------------------------------------------------------------------

const commands = {
  async build(options: { autoReloadOnFocus?: boolean }, filenames: string[]) {
    let pages: LoadedPage[] = [];
    let allPages: LoadedPage[] | undefined;
    if (filenames.length === 0) {
      allPages = await internal.getPageFiles();
      pages = allPages;
    } else {
      const ps = filenames.map((f) => internal.getPageFile(f));
      pages = await Promise.all(ps);
    }

    if (filenames.length === 0) {
      if (!allPages) {
        allPages = await internal.getPageFiles();
      }
      await internal.generateSiteMapFile(allPages);
      await internal.copyAssets();
    }

    if (pages.every((p) => !p.valid)) {
      if (!allPages) {
        allPages = await internal.getPageFiles();
      }
      pages = allPages;
    }

    await internal.buildHTML(pages, options.autoReloadOnFocus);
  },

  async devWatch(options: {}, _: string[]) {
    await commands.build({ autoReloadOnFocus: true }, []);
    const watcher = Deno.watchFs(".");

    const assets = config.assets.map((p) => path.normalize(p));

    const handleChange = debounce(async (paths: string[]) => {
      let assetChanged = false;
      const sourceFiles: string[] = [];

      for (let p of paths) {
        p = path.relative(".", p);
        if (p.endsWith(".tsx")) {
          sourceFiles.push(p);
        } else if (!assetChanged) {
          assetChanged = assets.some((a) => p.startsWith(a));
        }
      }
      console.log({ assetChanged, sourceFiles });

      if (assetChanged) {
        internal.copyAssets();
      }
      if (sourceFiles.length > 0) {
        const cmd = [
          "deno",
          "run",
          "-A",
          "cita.tsx",
          "build",
          "--auto-reload-on-focus",
          ...sourceFiles,
        ];
        const proc = await Deno.run({
          cmd,
          stdout: "inherit",
          stderr: "inherit",
        });
        await proc.status();
      }
    }, 20);

    serve((req) => {
      return serveDir(req, {
        fsRoot: config.buildDir,
      });
    });

    for await (const event of watcher) {
      if (event.kind === "modify") {
        handleChange(event.paths);
      }
    }
  },

  async generateSitemap() {
    const pages = await internal.getPageFiles();
    await internal.generateSiteMapFile(pages);
  },

  async createNewPages(filenames: string[]) {
    for (const filename of filenames) {
      await internal.createNewPage(filename);
    }
    const pages = await internal.getPageFiles();
    await internal.generateSiteMapFile(pages);
  },

  async clean() {
    try {
      await Deno.remove(config.buildDir, { recursive: true });
    } catch (_) {}
  },

  async init() {
    if (!internal.fileExists("components.tsx")) {
      await Deno.writeTextFile("components.tsx", templates.layoutTemplate);
    }
    if (!internal.fileExists("index.tsx")) {
      await internal.createNewPage("index.tsx");
    }
  },
};

async function main() {
  await new Command()
    .name("cliffy")
    .version("0.1.0")
    .description("Command line framework for Deno")
    .action(() => {
      console.log(documentation.$what_is_this);
      console.log("add -h to see help");
    })

    .command("doc", "show markdown documentation")
    .action((options, ...args) => {
      console.log(documentation.toMarkdown());
    })

    .command("build", "build HTML")
    .arguments("[files...:string]")
    .option(
      "-a, --auto-reload-on-focus",
      "adds a script on pages that makes it auto-reload when the page is focused"
    )
    .action((options, ...args) => {
      commands.build(options, args);
    })

    .command("clean", "clean and remove all files from the build directory")
    .action((options, ...args) => commands.clean())

    .command("gen-sitemap", "generate sitemap")
    .action((options, ...args) => commands.generateSitemap())

    .command("dev", "build and watch for file changes")
    .action((options, ...args) => commands.devWatch({}, args))

    .command("new", "create a new pages")
    .arguments("<file:string> [more-files...:string]")
    .action((options, ...args) => commands.createNewPages(args))

    .command("init", "creates an index page and a simple layout file")
    .action((options, ...args) => commands.init())

    .parse(Deno.args);
}

if (import.meta.main) {
  main();
}
