<template>
    <nav class="frame-index">
        <transition appear>
            <frame-index-batch
                v-if="batchIsSeen"
                :queries="queries"
                @untoggle="handleUntoggle"
            />
        </transition>
        <p
            v-if="!hasMatches"
        >
            No entries found.
        </p>
        <ul
            v-else
        >
            <frame-index-entry
                v-for="(match) in matches"
                v-bind:key="match.view.index"
                :match="match"
            />
        </ul>
    </nav>
</template>

<script lang="ts">
/*
    Imports
*/

import Vue from 'vue';
import FrameIndexBatch from './FrameIndexBatch.vue';
import FrameIndexEntry from './FrameIndexEntry.vue';

/*
    Vue object
*/

export default Vue.extend({
    name: 'FrameIndex',
    components: {
        FrameIndexBatch,
        FrameIndexEntry
    },
    props: {
        queries: Array,
        matches: Object,
        channelNature: String
    },
    computed: {
        hasMatches(): boolean {
            return Object.keys(this.matches).length > 0;
        },
        batchIsSeen: function(): boolean {
            return this.queries[0] != '' && this.channelNature === 'multi';
        }
    },
    methods: {
        /*
            Event handlers
        */
        handleUntoggle(query: string) {
            this.$emit('untoggle', query);
        }
    }
});
</script>

<style scoped>
</style>
