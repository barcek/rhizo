<template>
    <nav class="frame-index">
        <transition appear>
            <frame-batch
                v-if="batchIsSeen"
                :queries="queries"
                @untoggle="handleUntoggle"
            />
        </transition>

        <p v-if="!hasMatches">
            No entries found.
        </p>
        <ul v-else>
            <li v-for="(match, name) in matches" v-bind:key="match.view.index">
                <router-link v-bind:to="match.view.route">
                    {{ name }}
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
/*
    Imports
*/

import Vue from 'vue';
import FrameBatch from './FrameBatch.vue';

/*
    Vue object
*/

export default Vue.extend({
    name: 'FrameIndex',
    components: {
        FrameBatch
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
