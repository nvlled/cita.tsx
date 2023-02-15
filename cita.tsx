#!/usr/bin/env -S deno run -A

/*
# cita.tsx (read backwards as xstatic)

## What is this?

cita.tsx is a static-site generator based on deno.
Goals are to be able to create type-safe pages
with typescript and jsx with minimal setup.
(Minimal if already have vscode and deno setup)

## Who's this for?

Ideally, you are someone who knows how
to use the commandline, and is comfortable
with typescript and jsx/tsx DSL.

Getting started
================================================================================
1. install and setup deno (see below)
2. create a new directory
   $ mkdir my-new-site 
   $ cd my-new-site
3. setup cita.tsx (see below)
4. run the command
   $ ./cita.tsx

If using vscode, run do `Deno: Initialize Workspace Configuration`


Setup Deno
================================================================================
1. install deno 
   https://deno.land/manual@v1.30.3/getting_started/installation

2. If using vscode, install extension 
   https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno

Setup cita.tsx
================================================================================
1. Copy or download this file into a directory
   where your static site is
2. Inspect and read this file before running
3. Make sure it's running correctly
   $ deno run cita.tsx -h
4. $ chmod +x cita.tsx

Note: this uses deno -A for convenience. You can remove this or, just manually
run do deno run cita.tsx


Development and work flow
================================================================================
1. ./cita.tsx new posts/new-page.tsx
2. ./cita.tsx dev
3. open page in browser 
   http://localhost:8000 or whatever url is shown
4. edit any page, for example some-page.tsx
   then save changes
5. refresh browser

The .tsx files maps to .html
For example, to view index.tsx, open http://localhost:8000/index.html,
or to view posts/hello.tsx, open http://localhost:8000/posts/hello.html

Note: If you create new pages or directory, rerun ./cita.tsx dev

Build
================================================================================
$ ./cita.tsx build
You static site should be in _build, or whatever is in config.buildDir.
   

Configuring and extension
================================================================================
You are free to modify and make changes to this file as you see fit.
On the minimum, you can change or add entries in the config variable below.
As the site gets more complex, you can add modules.


*/

import { createElement, h } from "preact";
import type { JSX } from "preact";
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
  siteName: "personal website",
  // You add can more entries here

  // Where the html output will be placed
  buildDir: "./_build",

  // Where to write the auto-generated sitemap.
  sitemapFile: "./sitemap_gen.ts",

  // These files are copied to the build output
  assets: ["favicon.ico", "./assets"],
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

// --------------------------------------------------------------------------------

const initDefaults = {
  denoConfig: {
    compilerOptions: {
      jsxFactory: "h",
    },
    imports: {
      preact: "https://esm.sh/preact@10.12.1",
    },
  },

  defaultLayout: `
import { h, ComponentChildren } from "preact";
import { config, getSiteTitle } from "./cita.tsx";

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

  `,
};

export function getSiteTitle(pageTitle?: string) {
  if (pageTitle) {
    return `${pageTitle}- ${config.siteName}`;
  }
  return config.siteName;
}

// --------------------------------------------------------------------------------
type LoadedPage = Page & {
  path: string;
  valid: boolean;
};

const internal = {
  renderPage(page: LoadedPage): string {
    const domParser = new DOMParser();
    const html = renderToString(page.render());
    const dom = domParser.parseFromString(html, "text/html");
    for (const a of dom.querySelectorAll("a")) {
      const anchor = a as HTMLAnchorElement;
      anchor.href = anchor.href?.replace(".tsx", ".html");
      anchor.href = path.relative(page.path, anchor.href);
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
      const key = path.parse(page.path).name.replace(/[ \.]/g, "_");

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

  async buildHTML(pages: LoadedPage[]) {
    await ensureDir(config.buildDir);

    for (const page of pages) {
      if (!page.valid) {
        continue;
      }

      const output = internal.renderPage(page);
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
    filename = filename.replace(/[._-]/, " ");
    filename = filename.split(/\s+/).join(" ");
    return filename.slice(0, 1).toUpperCase() + filename.slice(1);
  },

  async createNewPage(filename: string) {
    const contents = `
import { h } from "preact";
import { PageData, PageRender } from "./cita.tsx";

export const data: PageData = {
  title: "${internal.formatTitle(filename)}",
};

export const render: PageRender = () => {
  return <div>hello world</div>;
};`;

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

type GlobalOptions = {
  generateSitemap?: boolean | undefined;
};

const commands = {
  async build(options: GlobalOptions, filenames: string[]) {
    let pages: LoadedPage[] = [];
    let allPages: LoadedPage[] | undefined;
    if (filenames.length === 0) {
      allPages = await internal.getPageFiles();
      pages = allPages;
    } else {
      const ps = filenames.map((f) => internal.getPageFile(f));
      pages = await Promise.all(ps);
    }

    if (options.generateSitemap || filenames.length === 0) {
      if (!allPages) {
        allPages = await internal.getPageFiles();
      }
      await internal.generateSiteMapFile(allPages);
      await internal.copyAssets();
    }

    await internal.buildHTML(pages);
  },

  async devWatch(options: GlobalOptions, _: string[]) {
    await commands.build({ generateSitemap: true }, []);
    const watcher = Deno.watchFs(".");

    const handleChange = debounce(async (paths: string[]) => {
      paths = paths
        .map((p) => path.relative(".", p))
        .filter((p) => p.endsWith(".tsx"));

      if (paths.length > 0) {
        const cmd = ["deno", "run", "-A", "cita.tsx", "build", ...paths];
        const proc = await Deno.run({
          cmd,
          stdout: "inherit",
          stderr: "inherit",
        });
        await proc.status();
      }
    }, 50);

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

  async createNewPages(filenames: string[]) {
    for (const filename of filenames) {
      await internal.createNewPage(filename);
    }
    const pages = await internal.getPageFiles();
    await internal.generateSiteMapFile(pages);
  },

  async init() {
    if (!internal.fileExists("deno.json")) {
      await Deno.writeTextFile(
        "deno.json",
        JSON.stringify(initDefaults.denoConfig, null, 2)
      );
    }
    if (!internal.fileExists("components.tsx")) {
      await Deno.writeTextFile("components.tsx", initDefaults.defaultLayout);
    }
    if (!internal.fileExists("index.tsx")) {
      await internal.createNewPage("index.tsx");
    }
    console.log(import.meta.url);
  },
};

async function main() {
  await new Command()
    .name("cliffy")
    .version("0.1.0")
    .description("Command line framework for Deno")
    .globalOption("-g, --generate-sitemap", "Generate sitemap")

    .command("build", "build HTML")
    .arguments("[files...:string]")
    .action((options, ...args) => {
      commands.build(options, args);
    })

    .command("dev", "build and watch for file changes")
    .action((options, ...args) => commands.devWatch(options, args))

    .command("new", "create a new pages")
    .arguments("<file:string> [more-files...:string]")
    .action((options, ...args) => commands.createNewPages(args))

    .command("init", "initializes with some config file and an index page")
    .action((options, ...args) => commands.init())

    .parse(Deno.args);
}

if (import.meta.main) {
  main();
}
