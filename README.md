# rhizo

A set of seven components forming a single-page, blog-like hypertext viewer, including routes and types, written with Vue.js in TypeScript.

The whole has been spun out of the [notes](https://barcek.github.io/notes) project, a styled and extended implementation of the concept.

The components contain structure and logic, but are here left style-free for flexibility in how and where they are used. They are ready to be built into a preferred 'index.html' file with any accompanying assets and with the entries themselves in JSON format in a separate file.

For the whole at a glance, see [the current repository tree](#repository-tree).

- [Getting started](#getting-started)
    - [With an existing Vue project](#with-an-existing-vue-project)
    - [With no Vue project available](#with-no-vue-project-available)
    - [Entries & styling](#entries--styling)
- [Content summary](#content-summary)
    - [App.vue & main.ts](#appvue--maints)
        - [App.vue](#appvue)
    - [components/](#components)
        - [Frame.vue](#framevue)
        - [FrameIndex.vue](#frameindexvue)
        - [FrameInput.vue](#frameinputvue)
    - [views/](#views)
        - [FrameEntry.vue](#frameentryvue)
    - [router/](#router)
        - [index.ts](#indexts)
    - [store/](#store)
        - [index.ts](#indexts)
        - [entry-base.ts](#entry-basets)
        - [term-match.ts](#term-matchts)
        - [uri-format.ts](#uri-formatts)
    - [types/](#types)
        - [index.ts](#indexts)
- [Development plan](#development-plan)
- [Repository tree](#repository-tree)

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

## Content summary

### App.vue & main.ts

The 'App.vue' file is the overarching single-file component associated via the 'main.ts' file with an 'index.html'.

#### App.vue

The 'App.vue' file uses the `Frame` component and `Entry` interface.

A loader is shown while the `created` lifecycle hook fetches a file from the 'public' folder named by default 'entries.json'. If found, the JSON is deserialized, with an array of entries implementing the `Entry` interface expected. Otherwise, an error message is shown.

If at least one entry is present, the loader is removed and the array is passed as a prop to the `Frame` component.

### components/

The 'components' directory contains five single-file components: 'Frame.vue', 'FrameInput.vue', 'FrameIndex.vue', 'FrameIndexBatch.vue' and 'FrameIndexEntry.vue'.

#### Frame.vue

The 'Frame.vue' file uses the `FrameInput` and `FrameIndex` components directly as well as the `Entry` and `Filter` interfaces. A third component - `FrameEntry` - is the sole view component used by the app, via the `router-view` element.

From each of the `FrameInput` and `FrameEntry` components the file also imports an implementation of the `Filter` interface, providing the values used later in managing these filter components. These implementations are assigned to `data.filters`. Finally, the file imports the `Store` class.

##### Setup

The `data.storage` property is assigned a new instance of the `Store` class and the `created` lifecycle hook calls the store instance `finalizeEntries` method to do the following:

1. convert the array to an object, allowing entries to be accessed by name;
2. ensure that each entry has a unique index, a URI component and a boolean value denoting whether or not the entry body has been formatted ready for display;
3. include the base entries 'start' and 'error'.

The `FrameInput` and `FrameEntry` components are visible initially. The `entry` computed value for the entry to be displayed is found by the store instance using `route.params.name` and the `routes` computed value and passed as a prop via the `router-view` element. Whether or not the `FrameIndex` component is visible is determined by the `indexIsSeen` boolean value.

The filter components are each also passed a unique `filterId` prop and the `FrameIndex` component is passed the `channelNature` computed value indicating whether the channel is single or multi-element.

##### Events

Two key events may be emitted by a filter component:

1. `open` to reset the other filters and assign the emitting filter name to the `data.channel` property;
2. `query` to ensure that the channel is the sole visible filter component and extract the query or queries from its relevant elements per the implementation of the `Filter` interface, assigning these to the `data.queries` property.

The two stages allow a filter to be single-element in nature, e.g. a searchbar, or multi-element, e.g. a set of toggles.

The `matches` value is computed based on the queries assigned and the `data.queries` and `matches` values are passed to the `FrameInput` and `FrameIndex` components.

Four additional events may be emitted:

1. `clear` to reset all filters and clear all queries;
2. `close` to handle channel closure;
3. `invoke` to use a particular feature, currently only to show `FrameIndex` on request;
4. `untoggle` to toggle off a specific filter component element and clear its query.

With each route change the handlers for the `clear` and `close` events are called.

#### FrameIndex.vue

The 'App.vue' file uses the `FrameIndexBatch` and `FrameIndexEntry` components.

The component receives as props:

- a `queries` array of string values, which is used in computing the `batchIsSeen` boolean value indicating whether or not the `FrameIndexBatch` component is visible, and also passed to it;
- a `matches` object containing `entry` objects, which is used to compute the `hasMatches` boolean value indicating whether the list of `FrameIndexEntry` instances is visible, each instance corresponding to one match, or the 'No entries found' message is displayed;
- a `channelNature` string value indicating whether the channel is single or multi-element, also used in computing the `batchIsSeen` boolean value;

##### Listener

A listener for the `untoggle` event on the `FrameIndexBatch` component calls the `handleUntoggle` method, which emits an `untoggle` event in turn.

#### FrameInput.vue

The 'FrameInput.vue' file uses the `Filter` interface and exports an implementation of the same. This implementation provides the values used by the `Frame` component in managing the `FrameInput` component in its role as a filter.

The component receives as props:

- a `filterId` string value, which is passed to the `id` attribute on the parent element;
- a `queries` array of string values, which is used in computing the `ariaPressed` boolean value indicating whether or not the `FrameIndex` component is visible, passed to the 'show all' button element;
- a `matches` object containing `entry` objects, which is used to compute the `matchCount` integer value indicating the number of matches, also passed to the 'show all' button element;

##### Listeners

A focus and a keyup listener on the input element call the `handleInputBarFocus` and `handleInputBarKeyup` methods, respectively. On focus, the input element has its `status` attribute toggled and the `open` event is emitted. On keyup, the `query` event is emitted if a value is present, else the `clear` event.

A click listener on the 'show all' button element calls the `handleShowAllBtnClick` method. This controls the emission of the `invoke` event to show or hide the `FrameIndex` component.

A click listener on the 'clear' button element calls the `handleClearBtnClick` method. This emits the `open` event if `FrameInput` is not the current channel, ensuring that the `handleChannelOpen` method is run to revert all other filters, then emits the `clear` and `close` events.

Notes on remaining components to follow.

### views/

The 'views' directory contains one single-file component: 'FrameEntry.vue'.

#### FrameEntry.vue

The 'FrameEntry.vue' file uses the `Filter` interface and exports an implementation of the same. This implementation provides the values used by the `Frame` component in managing the `FrameEntry` component in its role as a filter.

The `FrameEntry` component is the sole view component used by the app.

The component receives as props:

- a `filterId` string value, which is passed to the `id` attribute on the parent element;
- an `entry` object with a `name` string value which is passed to the heading element and a `body` string value - which may contain HTML - which is passed via the `v-html` directive to the `section` element.

##### Listener

A click listener on the parent element calls the `handleClick` method. If the target of the event is the `anchor` element defined in the implementation of the filter interface, that element has its `status` attribute toggled and the `open` and `query` events are emitted.

### router/

The 'router' directory contains a single 'index.ts' file with the routes for the app.

#### index.ts

The 'index.ts' file defines two paths: the entrypoint '/' and a path with the dynamic segment ':name' for the name of the entry to be shown. Both paths use the `FrameEntry` component.

Scroll behaviour is also set, to return to the top of the page when navigating to a new route, with smooth scrolling requested.

### store/

The 'store' directory contains four files: 'index.ts', 'entry-base.ts', 'term-match.ts' and 'uri-format.ts'.

#### index.ts

The 'index.ts' file destructures the `Entry` and `View` interfaces from the 'types' folder and the implementation of the `Filter` interface in the `FrameEntry` component, imports the customizables `entryBase`, `termMatch` and `URIFormat` from their modules and exports the `Store` class.

#### entry-base.ts

The 'entry-base.ts' file destructures the `Entry` interface from the 'types' folder and exports an object containing the base 'error' and 'start' entries.

#### term-match.ts

The 'term-match.ts' file exports the regular expression used to match each term in an entry.

#### uri-format.ts

The 'uri-format.ts' file exports the function used to convert each entry name to a URI substring.

### types/

The 'types' directory contains a single 'index.ts' file with an interface each for the `entry`, `filter` and `view` objects.

#### index.ts

The 'index.ts' file defines three interfaces: `Entry`, `Filter` and `View`.

- `Entry` suggests minimal values for a blog-like entry, specifically the string values `name` for the identifier, e.g. title, and `body` for the remainder of the entry. Others can be added as required. The component `FrameEntry` makes use of `name` and `body` only, leaving the use and positioning of any remaining values to be determined. A `meta` key is also present for a string value used by the `Frame` component to determine whether an alternative start entry is present: if the value is 'start', that entry becomes the initial entry. The `view` key takes an implementation of the `View` interface (see below). If not provided in full or part, the absence is handled by the `Frame` component in its use of the `Store` class.
- `Filter` provides for the values required by the filter components `FrameInput` and `FrameEntry` and used elsewhere, specifically the string value `nature` to indicate whether the filter is single- or multi-element, the string value `anchor` for the nodeName of the element from which the query will be extracted, e.g. `'INPUT'`, `typing` for the type of that element, e.g. `HTMLInputElement`, the string value `status` for the attribute used to indicate toggled status, e.g. `'data-toggled'`, the string value `source` for the property on which the query string can be found, e.g. `'value'` and the boolean value `isSeen` for whether the filter component is shown.
- `View` provides for values used by the `Frame` component and `Store` class in processing and handling each entry, specifically the number value `index` as a unique identifier, the string value `route` for the name as URI segment and the boolean value `isSet` to indicate whether the body of the entry has been formatted, in order that the formatted version can be reused.

## Development plan

The following are possible next steps in the development of the code base. The general medium-term aim is a lightweight, modular component set scaleable to large libraries of highly-interlinked entries. Pull requests are welcome for these and any other potential improvements.

- support the use of multiple Frames
- extend FrameEntry to replace FrameIndexEntry
- simplify & further generalize the filter components
- extract entry ordering & formatting to server-side tasks
- modify filtering to prioritize exact entry name match
- extend filtering to entry body text
- introduce memoization of matches
- allow term aliasing

## Repository tree

```
./
├── src
│   ├── components
│   │   ├── Frame.vue
│   │   ├── FrameIndex.vue
│   │   ├── FrameIndexBatch.vue
│   │   ├── FrameIndexEntry.vue
│   │   └── FrameInput.vue
│   ├── router
│   │   └── index.ts
│   ├── store
│   │   ├── entry-base.ts
│   │   ├── index.ts
│   │   ├── term-match.ts
│   │   └── uri-format.ts
│   ├── types
│   │   └── index.ts
│   ├── views
│   │   └── FrameEntry.vue
│   ├── App.vue
│   └── main.ts
├── LICENSE.txt
└── README.md
```
