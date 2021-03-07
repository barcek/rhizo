# rhizo

A set of six components forming a single-page, blog-like hypertext viewer, including routes and types, written with Vue.js in TypeScript.

The whole has been spun out of the [notes](https://barcek.github.io/notes) project, a styled and extended implementation of the concept.

The components contain structure and logic, but are here left style-free for flexibility in how and where they are used. They are ready to be built into a preferred 'index.html' file with any accompanying assets and with the entries themselves in JSON format in a separate file.

## Getting started

### With an existing Vue project

If you have an existing Vue 2 project set up for TypeScript compilation, and can use this or a copy of it, the contents of the 'src' folder can be placed in the corresponding locations in the 'src' folder, either in full or in part according to preference. For a pure rhizo app, in full. For rhizo to work within an existing app, files could be merged as appropriate.

### With no Vue project available

A new Vue 2 project can be generated from scratch using [Vue CLI](https://cli.vuejs.org/). In this case:

1. the 'App.vue', 'main.ts' and 'router/index.ts' files in the 'src' folder generated through Vue CLI can be replaced with those from this repository;
2. the 'store' and 'types' folders in this repository can be copied into the generated 'src' folder;
3. the components in the 'components' and 'views' directories in this repository can be copied into the corresponding directories in the generated 'src' folder;
4. any unwanted default files in the generated 'components' and 'views' folders can be removed.

### Entries & styling

The 'App.vue' component in rhizo assumes that the entries to be shown by the app are in the 'public' folder in a file by default named 'entries.json'. The set of entries is assumed to be an array of objects each implementing the `Entry` interface defined in 'types/index.ts' (see [types/](#types) below).

The components are left style-free for flexibility, although each component has a class name. Styles can be added by the usual means, whether in or via the 'index.html' file in the 'public' folder, or in the individual component files, scoped to the component or otherwise.

## App.vue & main.ts

The 'App.vue' file is the overarching single-file component associated via the 'main.ts' file with an 'index.html'.

### App.vue

The 'App.vue' file imports the `Frame` component and `Entry` interface.

A loader is shown while fetching a file from the 'public' folder by default named 'entries.json'. If found, the JSON is deserialized, with an array of entries implementing the `Entry` interface expected. Otherwise, an error message is shown.

If at least one entry is present, the loader is removed and the array is passed as a prop to the `Frame` component.

## components/

The 'components' directory contains four single-file components: 'Frame.vue', 'FrameBatch.vue', 'FrameInput.vue' and 'FrameIndex.vue'.

Notes on the components to follow.

## views/

The 'views' directory contains one single-file component: 'FrameEntry.vue'.

Notes on the component to follow.

## router/

The 'router' directory contains a single 'index.ts' file with the routes for the app.

### index.ts

The 'index.ts' file defines two paths: the entrypoint '/' and a path with the dynamic segment ':name' for the name of the entry to be shown. Both paths use the `FrameEntry` component.

Scroll behaviour is also set, to return to the top of the page when navigating to a new route, with smooth scrolling requested.

## store/

The 'store' directory contains four files: 'index.ts', 'entry-base.ts', 'term-match.ts' and 'uri-format.ts'.

### index.ts

The 'index.ts' file destructures the `Entry` and `View` interfaces from the 'types' folder and the implementation of the `Filter` interface in the `FrameEntry` component, imports the customizables `entryBase`, `termMatch` and `URIFormat` from their modules and exports the `Store` class.

### entry-base.ts

The 'entry-base.ts' file destructures the `Entry` interface from the 'types' folder and exports an object containing the base 'error' and 'start' entries.

### term-match.ts

The 'term-match.ts' file exports the regular expression used to match each term in an entry.

### uri-format.ts

The 'uri-format.ts' file exports the function used to convert each entry name to a URI substring.

## types/

The 'types' directory contains a single 'index.ts' file with an interface each for the `entry`, `filter` and `view` objects.

### index.ts

The 'index.ts' file defines three interfaces: `Entry`, `Filter` and `View`.

- `Entry` suggests minimal values for a blog-like entry, specifically the string values `name` for the identifier, e.g. title, and `body` for the remainder of the entry. Others can be added as required. The component `FrameEntry` makes use of `name` and `body` only, leaving the use and positioning of any remaining values to be determined. A `meta` key is also present for a string value used by the `Frame` component to determine whether an alternative start entry is present: if the value is 'start', that entry becomes the initial entry. The `view` key takes an implementation of the `View` interface (see below). If not provided in full or part, the absence is handled by the `Frame` component in its use of the `Store` class.
- `Filter` provides for the values required by the filter components `FrameInput` and `FrameEntry` and used elsewhere, specifically the string value `nature` to indicate whether the filter is single- or multi-element, the string value `anchor` for the nodeName of the element from which the query will be extracted, e.g. `'INPUT'`, `typing` for the type of that element, e.g. `HTMLInputElement`, the string value `status` for the attribute used to indicate toggled status, e.g. `'data-toggled'`, the string value `source` for the property on which the query string can be found, e.g. `'value'` and the boolean value `isSeen` for whether the filter component is shown.
- `View` provides for values used by the `Frame` component and `Store` class in processing and handling each entry, specifically the number value `index` as a unique identifier, the string value `route` for the name as URI segment and the boolean value `isSet` to indicate whether the body of the entry has been formatted, in order that the formatted version can be reused.

## Development plan

The following are possible next steps in the development of the code base. Pull requests are welcome for these and any other potential improvements.

- extract entry ordering & formatting to server-side tasks
- modify filtering to prioritize exact entry name match
- extend filtering to entry body text
- introduce memoization of matches
- allow term aliasing
