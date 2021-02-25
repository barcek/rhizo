<template>
    <main class="frame">
        <!-- filter (text input) -->
        <frame-input
            @open="handleChannelOpen"
            @query="handleIncomingQuery"
            @clear="handleFilterClear"
            @close="handleChannelClose"
        />
        <!-- entry & filter (button for terms present) -->
        <router-view
            v-if="filters.entry.isSeen"
            :entry="entry"
            @open="handleChannelOpen"
            @query="handleIncomingQuery"
            class="border--thin"
        />
        <!-- list of matches -->
        <frame-index
            v-if="indexIsSeen"
            :matches="matches"
            class="border--thin"
         />
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

/*
    Constants
*/

const baseEntries = {
    start: { name: 'Get started', body: 'Start browsing...'} as Entry,
    error: { name: 'Oops', body: 'Something seems off...' } as Entry
};

/* regular expression to match <t></t> elements, containing terms */
const termFormat = /(<\/?t\/?>)([\s\w.]*)(<\/?t\/?>)/g;

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
            queries: [''] as string[]
        };
    },
    computed: {
        entry: function(): Entry {
            /* return prop passed to FrameEntry */
            return this.getEntry(this.$data.entries, this.$route.params.name || 'start');
        },
        names: function(): Record<number, string> {
            /* return names of all entries exc. 'start' & 'error', sorted & id keyed */
            const namesArr = Object.keys(this.$data.entries).slice(2).sort();
            const namesObj: Record<number, string> = {};
            namesArr.forEach((name, index) => {
                namesObj[index] = name;
            });
            return namesObj;
        },
        matches: function(): Record<number, string> {
            /* return prop passed to FrameIndex */
            return this.getMatches(this.names, this.$data.queries);
        },
        indexIsSeen: function(): boolean {
            /* return true if filtering is in progress */
            return this.$data.queries[0];
        }
    },
    watch: {
        $route(): void {
            /* clear, toggle off & show all filters & empty queries & channel */
            this.handleFilterClear(Object.keys(this.$data.filters));
            this.handleChannelClose(this.$data.channel);
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
        /* ensure filter toggled here is set as channel & revert all other filters */
        handleChannelOpen(element: HTMLElement, filter: Filter, name: string): void {
            this.toggleFilterElement(element, filter);
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
            this.extractQueries(this.$data.filters[this.$data.channel]);
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
        },
        /*
            Filter managers
        */
        /* toggle a filter status attribute to denote the status either on or off */
        toggleFilterElement(element: HTMLElement, filter: Filter): void {
            const status: string = filter.status;
            const isOn: boolean = (element.getAttribute(status) === 'true');
            element.setAttribute(status, String(!isOn));
        },
        /* return the element(s) of a filter with status attribute true, i.e. on */
        getToggledElements(filter: Filter): Array<Element> {
            const selector = `[${filter.status}="true"]`;
            const selected: NodeListOf<Element> = document.querySelectorAll(selector);
            return Array.prototype.slice.call(selected);
        },
        /* ensure every status attribute on each named filter is false, i.e. off */
        resetToggledElements(names: string[]): void {
            names.forEach(name => {
                const filter = this.$data.filters[name];
                const els: Array<typeof filter.typing> = this.getToggledElements(filter);
                els.forEach(el => el.setAttribute(filter.status, "false"));
            });
        },
        /* set any source value attribute of each named filter to an empty string */
        clearFilterValues(names: string[]): void {
            names.forEach(name => {
                const filter = this.$data.filters[name];
                const els: Array<typeof filter.typing> = this.getToggledElements(filter);
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
            Prop providers
        */
        /* return an entry by name or use 'error', formatting any terms in the body */
        getEntry(entries: Record<string, Entry>, name: string): Entry {
            const entry: Entry = entries?.[name] || this.$data.entries?.['error'];
            entry.body = entry.body.replaceAll(termFormat, this.formatTerms);
            return entry;
        },
        /* if term is in 1+ entry names, return in a filter element, else tag-free */
        formatTerms(element: string, opening: string, term: string): string {
            const matches = this.getMatches(this.names, [ term ]);
            const { anchor, status } = this.$data.filters.entry;
            return Object.keys(matches).length > 0 ?
                `<${anchor} ${status}="false">${term}</${anchor}>` : term;
        },
        /* return an object holding each entry name which includes every query string */
        getMatches(names: Record<number, string>, queries = ['']): Record<number, string> {
            let namesNested = Object.entries(names);
            queries.forEach(query => {
                namesNested = namesNested.filter(name =>
                    name[1].toLowerCase().includes(query.toLowerCase()));
            });
            return Object.fromEntries(namesNested);
        },
        /* assign to queries each string on a toggled filter element source attribute */
        extractQueries(filter: Filter): void {
            const els: Array<any> = this.getToggledElements(filter);
            const queries: string[] = els.map(el => el[filter.source] || '');
            this.$data.queries = queries;
        }
    }
});
</script>

<style scoped>
</style>
