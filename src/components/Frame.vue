<template>
    <main class="frame">
        <!-- filter (text input) -->
        <frame-input
            @query="handleQuery"
            @toggle="handleToggle"
        />
        <!-- entry & filter (button for terms present) -->
        <router-view
            v-if="filters.entry.isOpen"
            :entry="entry"
            @query="handleQuery"
            @toggle="handleToggle"
            class="border--thin"
        />
        <!-- list of matches -->
        <frame-index
            v-if="indexIsOpen"
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
const termFormat = /(<\/?t\/?>)([\S|\w\d]*)(<\/?t\/?>)/g;

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
        indexIsOpen: function(): boolean {
            /* return true if filtering has begun or current entry is 'start' */
            const matchCount = Object.keys(this.matches).length;
            const nameCount = Object.keys(this.names).length;
            return matchCount < nameCount || this.entry === baseEntries['start'];
        }
    },
    watch: {
        channel(): void {
            /* show FrameEntry & clear queries, to recompute matches & hide -Index */
            if (this.$data.channel === 'clear') {
                this.$data.filters.entry.isOpen = true;
                this.$data.queries = [''];
                return;
            };
            /* show channel filter only, set its queries & clear it to watch again */
            if (this.$data.channel) {
                this.setIsFilterOpen((name: string, channel: string) =>
                    name === channel ? true : false
                );
                this.setQueries(this.$data.filters[this.$data.channel]);
                this.$data.channel = '';
            };
        },
        $route(): void {
            /* show filters, toggle filter statuses off & clear queries & channel */
            this.setIsFilterOpen(() => true);
            this.resetFilterElements();
            this.$data.queries = [''];
            this.$data.channel = '';
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
        handleQuery(value: string): void {
            this.$data.channel = value;
        },
        handleToggle(element: HTMLElement, filter: Filter): void {
            this.toggleFilterElements(element, filter);
        },
        /*
            Filter managers
        */
        /* show or hide each filter as determined by function passed */
        setIsFilterOpen(determine: (name: string, channel: string) => boolean): void {
            const names = Object.keys(this.$data.filters);
            names.forEach(name => {
                this.$data.filters[name].isOpen = determine(name, this.$data.channel);
            });
        },
        /* return an array of all elements with a filter status attribute */
        getFilterElements(filter: Filter): Array<Element> {
            const selector = `[${filter.status}="true"]`;
            const selected: NodeListOf<Element> = document.querySelectorAll(selector);
            return Array.prototype.slice.call(selected);
        },
        /* toggle a filter status attribute to denote the status on or off */
        toggleFilterElements(element: HTMLElement, filter: Filter): void {
            const status: string = filter.status;
            const isOn: boolean = (element.getAttribute(status) === 'true');
            element.setAttribute(status, String(!isOn));
        },
        /* toggle each filter status off & clear any source value attribute */
        resetFilterElements(): void {
            const names = Object.keys(this.$data.filters);
            names.forEach(name => {
                const filter = this.$data.filters[name];
                const els: Array<typeof filter.typing> = this.getFilterElements(filter);
                filter.source === 'value' && els.forEach(el => el.value = '');
                els.forEach(el => el.setAttribute(filter.status, "false"));
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
        setQueries(filter: Filter): void {
            const els: Array<any> = this.getFilterElements(filter);
            const queries: string[] = els.map(el => el[filter.source] || '');
            this.$data.queries = queries;
        }
    }
});
</script>

<style scoped>
</style>
