# rhizo

A set of five components forming a single-page, blog-like hypertext viewer, including routes and types, written with Vue.js in TypeScript.

The components contain structure and logic, but are left style-free for flexibility in how and where they are used. They are ready to be built into a preferred 'index.html' file with any accompanying assets and with the entries themselves in JSON format in a separate file.

An implementation of the app is the basis for [./notes](https://barcek.github.io/notes).

## Getting started

The contents of the 'src' folder here can be added to the corresponding locations of a Vue project set up to allow for TypeScript compilation.

This could be a new setup generated using [Vue CLI](https://cli.vuejs.org/). In this case, the generated 'App.vue', 'main.ts' and 'router/index.ts' files can be replaced with those from this repository and any unwanted default files in the 'components' and 'views' folders removed.

The rhizo 'App.vue' component assumes that the entries to be shown by the app are in the 'public' folder in a file by default named 'entries.json'. The set of entries is assumed to be an array of objects each with a name, date and body.

## App.vue & main.ts

The 'App.vue' file is the overarching single-file component associated via the 'main.ts' file with an 'index.html'.

## components/

The 'components' directory contains three single-file components: 'Frame.vue', 'FrameInput.vue' and 'FrameIndex.vue'.

## views/

The 'views' directory contains one single-file component: 'FrameEntry.vue'.

## router/

The 'router' directory contains a single 'index.ts' file with the routes for the app.

## types/

The 'types' directory contains a single 'index.ts' file with an interface each for the `filter` and `entry` objects.

## Development plan

The following are possible next steps in the development of the code base. Pull requests are welcome for these and any other potential improvements.

- introduce memoization of completed matches & formatted entries
- modify filtering to prioritize exact entry name match
- extend filtering to entry body text
