<template>
    <main class="frame">
        <!-- filter (text input) -->
        <frame-input
            :queries="queries"
            :matches="matches"
            @open="handleChannelOpen"
            @query="handleIncomingQuery"
            @clear="handleFilterClear"
            @close="handleChannelClose"
            @invoke="handleFeatureInvoke"
        />
        <!-- entry & filter (buttons) -->
        <transition appear>
            <router-view
                v-if="filters.entry.isSeen"
                :entry="entry"
                @open="handleChannelOpen"
                @query="handleIncomingQuery"
                class="border--thin"
            />
        </transition>
        <!-- list of matches -->
        <transition appear>
            <frame-index
                v-if="indexIsSeen"
                :queries="queries"
                :matches="matches"
                :channelNature="channelNature"
                @untoggle="handleUntoggle"
         />
        </transition>
    </main>
</template>

<script lang="ts">
/*
    Imports
*/

import Vue from 'vue';
/* interfaces */
import { Entry, Filter, View } from '../types';
/* components & objects implementing the Filter interface */
import FrameInput, { input } from './FrameInput.vue';
import { entry } from '../views/FrameEntry.vue';
import FrameIndex from './FrameIndex.vue';
// @ts-ignore
import { debounce } from '../utils/index.js';

/*
    Constants
*/

const baseEntries = {
    start: { name: 'Get started', body: 'Start browsing...'} as Entry,
    error: { name: 'Oops', body: 'Something seems off...' } as Entry
};

/* regular expression to match <t></t> elements, containing terms */
const termMatch = /(<\/?t\/?>)([\s\w.]*)(<\/?t\/?>)/g;

/* function to convert base entry name to URI substring */
const URIFormat = (name: string) => {
    return name.replace(/\W/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

/*
    Vue object
*/

export default Vue.extend({
    name: 'Frame' as string,
    components: {
        FrameInput,
        FrameIndex
    },
    props: {
        content: Array
    },
    data(): object {
        return {
            entries: {} as object,
            filters: { input, entry } as object,
            channel: '' as string, // the filter ready to emit queries
            queries: [] as string[],
            invoked: [] as string[]
        };
    },
    computed: {
        entry: function(): Entry {
            /* return a named entry, 'start' or 'error'; prop passed to FrameEntry */
            return this.getEntry(this.$data.entries, this.$route.params.name);
        },
        views: function(): Record<string, View> {
            /*
                return id, URI-formatted name & body format status for all entries
                exc. 'start' & 'error', indexed by entry name alphabetically sorted
            */
            const viewsArr = Object.keys(this.$data.entries).slice(2).sort();
            const viewsObj: Record<string, View> = {};
            viewsArr.forEach((name, index) => {
                viewsObj[name] = {
                    index,
                    route: URIFormat(name),
                    isSet: false
                };
            });
            return viewsObj;
        },
        routes: function(): Record<string, string> {
            /* return each unformatted entry name indexed by URI-formatted version */
            const routes: Record<string, string> = {};
            Object.keys(this.views).forEach(name => {
                routes[URIFormat(name)] = name;
            });
            return routes;
        },
        matches: function(): Record<string, View> {
            /* return subset of views object; prop passed to FrameInput & -Index */
            return this.getMatches(this.views, this.$data.queries);
        },
        indexIsSeen: function(): boolean {
            /* return true if index has been invoked or filtering is in progress */
            return this.$data.invoked.includes('index') || !!this.$data.queries[0];
        },
        channelNature: function(): string {
            /* return the current channel nature, whether single- or multi-element*/
            return this.$data.filters[this.$data.channel]?.nature || '';
        }
    },
    watch: {
        $route(): void {
            /* clear, toggle off & show all filters & empty queries & channel */
            this.handleFilterClear(Object.keys(this.$data.filters));
            this.handleChannelClose(this.$data.channel);
        },
        invoked(): void {
            /* show only index if index listed in invoked array */
            this.$data.invoked.includes('index')
                ? this.setFiltersSeen([])
                : this.setFiltersSeen(Object.keys(this.$data.filters));
        }
    },
    created(): void {
        /* convert content array to object & incl. base entries w/ any new 'start' */
        const contentArr: Array<Entry> = this.$props.content;
        const contentObj: Record<string, Entry> = {};
        let nameLower = '';
        contentArr.forEach(entry => {
            if (entry.meta && entry.meta === 'start') {
                baseEntries.start = entry;
                return;
            };
            nameLower = entry.name;
            nameLower.toLowerCase();
            contentObj[nameLower] = entry;
        });
        this.$data.entries = { ...baseEntries, ...contentObj };
    },
    methods: {
        /*
            Event handlers
        */
        /* ensure emitting filter is set as channel & toggle off & empty all others */
        handleChannelOpen(filter: Filter, name: string): void {
            if (this.$data.channel != name) {
                const otherFilters = Object.keys(this.$data.filters)
                    .filter(key => key != name);
                this.resetToggledElements(otherFilters);
                this.clearFilterValues(otherFilters);
                this.$data.channel = name;
            };
        },
        /* show only the active filter & pull queries from its toggled element(s) */
        handleIncomingQuery(name: string): void {
            this.setFiltersSeen([name]);
            this.extractQueries(name, this.$data.filters[this.$data.channel]);
        },
        /* empty values on named filters, show all filters & clear queries array */
        handleFilterClear(names: string[]): void {
            this.clearFilterValues(names);
            this.setFiltersSeen(Object.keys(this.$data.filters));
            this.$data.queries = [''];
        },
        /* untoggle the element(s) on a named filter & unset the current channel */
        handleChannelClose(name: string): void {
            if (name) {
                this.resetToggledElements([name]);
                this.$data.channel = '';
            };
            this.$data.invoked = [];
        },
        /* untoggle the element on the channel holding a query & clear the query */
        handleUntoggle(query: string): void {
            this.resetToggledElement(this.$data.channel, query);
            this.clearQuery(query);
        },
        /* add a named feature to invoked array if not present, else remove it */
        handleFeatureInvoke(name: string): void {
            this.$data.invoked.indexOf(name) != -1
                ? this.$data.invoked.splice(this.$data.invoked.indexOf(name), 1)
                : this.$data.invoked.splice(-1, 0, name)
        },
        /*
            Filter managers
        */
        /* return the element(s) of a filter with status attribute true, i.e. on */
        getToggledElements(name: string, filter: Filter): Array<Element> {
            const selector = `.frame-${name} [${filter.status}="true"]`;
            const selected: NodeListOf<Element> = document.querySelectorAll(selector);
            return Array.prototype.slice.call(selected);
        },
        /* set the status attribute for an element sending a query to false, i.e. off */
        resetToggledElement(name: string, value: string): void {
            const filter = this.$data.filters[name];
            const els: Array<typeof filter.typing>
                = this.getToggledElements(name, filter);
            els.forEach(el => {
                el[filter.source] === value && el.setAttribute(filter.status, "false");
            });
        },
        /* ensure every status attribute on each named filter is false, i.e. off */
        resetToggledElements(names: string[]): void {
            names.forEach(name => {
                const filter = this.$data.filters[name];
                const els: Array<typeof filter.typing>
                    = this.getToggledElements(name, filter);
                els.forEach(el => el.setAttribute(filter.status, "false"));
            });
        },
        /* set any source value attribute of each named filter to an empty string */
        clearFilterValues(names: string[]): void {
            names.forEach(name => {
                const filter = this.$data.filters[name];
                const els: Array<typeof filter.typing>
                    = this.getToggledElements(name, filter);
                filter.source === 'value' && els.forEach(el => el.value = '');
            });
        },
        /* show each named filter */
        setFiltersSeen(names: string[]): void {
            const filters = Object.keys(this.$data.filters);
            filters.forEach(filter => {
                this.$data.filters[filter].isSeen = names.includes(filter) ? true : false;
            });
        },
        /*
            Query managers
        */
        clearQuery(query: string) {
            this.$data.queries.splice(this.$data.queries.indexOf(query), 1);
        },
        /*
            Prop providers
        */
        /* return an entry formatted & stored, or format & store first, else 'error' */
        getEntry(entries: Record<string, Entry>, route: string): Entry {
            const name = this.routes[route] || 'start';
            if (!entries[name]) {
                return this.$data.entries['error'];
            };
            if (name === 'start') {
                return this.$data.entries['start'];
            };
            if (entries[name] && this.views[name].isSet === true) {
                return entries[name];
            };
            entries[name].body = entries[name].body.replace(termMatch, this.setTerms);
            this.views[name].isSet = true;
            return entries[name];
        },
        /* if term is in 1+ entry names, return in a filter element, else tag-free */
        setTerms(element: string, opening: string, term: string): string {
            const matches = this.getMatches(this.views, [ term ]);
            const { anchor, status } = this.$data.filters.entry;
            const tag: string = anchor.toLowerCase();
            return Object.keys(matches).length > 0
                ? `<${tag} ${status}="false">${term}</${tag}>`
                : term;
        },
        /* return an object holding each entry name which includes every query string */
        getMatches(views: Record<string, View>, queries = ['']): Record<number, View> {
            let viewsNested = Object.entries(views);
            queries.forEach(query => {
                viewsNested = viewsNested.filter(name =>
                    name[0].toLowerCase().includes(query.toLowerCase()));
            });
            return Object.fromEntries(viewsNested);
        },
        /* assign to queries each string on a toggled filter element source attribute */
        extractQueries(name: string, filter: Filter): void {
            const els: Array<any> = this.getToggledElements(name, filter);
            const queries: string[] = els.map(el => el[filter.source] || '');
            this.$data.queries = queries;
        }
    }
});
</script>

<style scoped>
</style>
