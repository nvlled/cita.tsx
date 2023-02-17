# cita.tsx (backwards for xstatic)

## What is this
cita.tsx is a single-file static site generator based on deno.
It aims are to be able to create type-safe pages
with typescript and jsx with minimal setup.
(Minimal if you already have vscode and deno setup)

## Target users
Ideally, this tool would be used by people
who knows how to use the commandline, and is comfortable
and likes working with typescript and jsx/tsx DSL.
This is purely a html build tool,
client-side scripts are not supported.


## Getting started

1. install and setup deno (see below)
2. create a new directory
```
$ mkdir my-new-site
$ cd my-new-site
```
3. setup cita.tsx (see blow)
4. create a page: `$ ./cita.tsx new homepage.tsx`
5. build output: `$ ./cita.tsx build`
> If you are using vscode, run do `Deno: Initialize Workspace Configuration`

### Setup dino

1. [install deno](https://deno.land/manual@v1.30.3/getting_started/installation)
2. If you are using vscode, [install extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

### Setup cita

1. Copy or download `cita.tsx` into a directory where your static site is
2. Inspect and read this file before running
3. Make sure it's running correctly: `$ deno run cita.tsx -h`
4. `$ chmod +x cita.tsx`

## Development and work flow

1. `./cita.tsx new posts/new-page.tsx`
2. `./cita.tsx dev`
3. open page in browser `http://localhost:8000` or whatever url is shown
4. edit any page, for example `some-page.tsx`, then save changes
5. refresh browser
6. goto step 4 or 1

Each `.tsx` files maps to `.html`
For example, to view `index.tsx` open http://localhost:8000/index.html,
or to view `posts/hello.tsx` open http://localhost:8000/posts/hello.html

> If you create new pages or directory, rerun `./cita.tsx dev`

## Building
To build and output the HTML files:
```
$ ./cita.tsx build
```
Your static site should be in _build, or whatever is in config.buildDir.

## Configuring and extension
You are free to modify and make changes to `cita.tsx` as you see fit.
On the minimum, you can change or add entries in the `config` variable below.
As the site gets more complex, you can add modules and split the
larger pages into files.