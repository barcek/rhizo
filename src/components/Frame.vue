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
            /* return names of all entries excl. 'start' & 'error' sorted & id keyed */
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
            /* return true if filtering has begun or current entry is 'start' */
            const matchCount = Object.keys(this.matches).length;
            const nameCount = Object.keys(this.names).length;
            return matchCount <= nameCount || this.entry === baseEntries['start'];
        }
    },
    watch: {
        channel(): void {
            /* show & use channel filter & empty channel string to watch again */
            if (this.$data.channel) {
                this.setFiltersSeen([this.$data.channel]);
                const otherFilters = Object.keys(this.$data.filters)
                    .filter(key => key != this.$data.channel);
                this.resetToggledElements(otherFilters);
                this.clearFilterValues(otherFilters);
                this.extractQueries(this.$data.filters[this.$data.channel]);
                this.$data.channel = '';
            };
        },
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
            if (entry.date === '00.00.00') {
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
        handleChannelOpen(element: HTMLElement, filter: Filter): void {
            this.toggleFilterElement(element, filter);
        },
        handleIncomingQuery(name: string): void {
            this.$data.channel = name;
        },
        /*
            clear any value on filters named, show all filters & clear queries,
            to recompute matches & hide FrameIndex
        */
        handleFilterClear(names: string[]): void {
            this.clearFilterValues(names);
            this.setFiltersSeen(Object.keys(this.$data.filters));
            this.$data.queries = [''];
        },
        /* toggle off all channel else all filter elements & empty to watch again */
        handleChannelClose(name: string): void {
            name
                ? this.resetToggledElements([name])
                : this.resetToggledElements(Object.keys(this.$data.filters));
            this.$data.channel = '';
        },
        /*
            Filter managers
        */
        /* toggle a filter status attribute to denote the status on or off */
        toggleFilterElement(element: HTMLElement, filter: Filter): void {
            const status: string = filter.status;
            const isOn: boolean = (element.getAttribute(status) === 'true');
            element.setAttribute(status, String(!isOn));
        },
        /* return all elements for a filter with status attribute set to true, i.e. on */
        getToggledElements(filter: Filter): Array<Element> {
            const selector = `[${filter.status}="true"]`;
            const selected: NodeListOf<Element> = document.querySelectorAll(selector);
            return Array.prototype.slice.call(selected);
        },
        /* set every status attribute of each named filter to false, i.e. off */
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
        /* toggle visibility of each named filter */
        setFiltersSeen(names: string[]): void {
            const filters = Object.keys(this.$data.filters);
            filters.forEach(filter => {
                this.$data.filters[filter].isSeen = names.includes(filter) ? true : false;
            });
        },
        /*
            Prop providers
        */
        /* return an entry by name or use 'error', formatting terms in the body */
        getEntry(entries: Record<string, Entry>, name: string): Entry {
            const entry: Entry = entries?.[name] || this.$data.entries?.['error'];
            entry.body = entry.body.replaceAll(termFormat, this.formatTerms);
            return entry;
        },
        /* if in 1+ entry names, return term in a filter element, else tag-free */
        formatTerms(element: string, opening: string, term: string): string {
            const matches = this.getMatches(this.names, [ term ]);
            const { anchor, status } = this.$data.filters.entry;
            return Object.keys(matches).length > 0 ?
                `<${anchor} ${status}="false">${term}</${anchor}>` : term;
        },
        /* return an object with all entry names containing every query string */
        getMatches(names: Record<number, string>, queries = ['']): Record<number, string> {
            let namesNst = Object.entries(names);
            queries.forEach(query => {
                namesNst = namesNst.filter(name =>
                    name[1].toLowerCase().includes(query.toLowerCase()));
            });
            return Object.fromEntries(namesNst);
        },
        /* assign to $data.queries each source string on a filter status */
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
