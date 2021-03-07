<template>
    <main class="frame">
        <!-- filter (text input) -->
        <frame-input
            filterId="searchbar"
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
                filterId="entry"
                :entry="entry"
                @open="handleChannelOpen"
                @query="handleIncomingQuery"
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
import { Entry, Filter } from '../types';

/* components & objects implementing the Filter interface */
import FrameInput, { input } from './FrameInput.vue';
import { entry } from '../views/FrameEntry.vue';
import FrameIndex from './FrameIndex.vue';

/* other modules */
// @ts-ignore
import Store from '../store';

/*
    Constants
*/

/* assign input filter object to identifier matching FrameInput filterId */
const searchbar = JSON.parse(JSON.stringify(input));

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
            storage: new Store(this.$props.content),
            filters: { searchbar, entry } as object,
            channel: '' as string, // the filter ready to emit queries
            queries: [] as string[],
            invoked: [] as string[]
        };
    },
    computed: {
        entry: function(): Entry {
            /* return a named entry, 'start' or 'error'; prop passed to FrameEntry */
            return this.$data.storage.getEntry(this.$route.params.name, this.routes);
        },
        routes: function(): Record<string, string> {
            /* return each unformatted entry name indexed by URI-formatted version */
            return this.$data.storage.computeRoutes();
        },
        matches: function(): Record<string, Entry> {
            /* return subset of views object; prop passed to FrameInput & -Index */
            return this.$data.storage.getMatches(this.$data.queries);
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
        this.$data.storage.prepareEntries();
    }
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
            const selector = `#${name} [${filter.status}="true"]`;
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
        /* assign to queries each string on a toggled filter element source attribute */
        extractQueries(name: string, filter: Filter): void {
            const els: Array<any> = this.getToggledElements(name, filter);
            const queries: string[] = els.map(el => el[filter.source] || '');
            this.$data.queries = queries;
        },
        clearQuery(query: string) {
            this.$data.queries.splice(this.$data.queries.indexOf(query), 1);
        }
    }
});
</script>

<style scoped>
</style>
