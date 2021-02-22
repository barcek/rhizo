<template>
    <nav class="frame-index">
        <p v-if="!hasMatches">
            No entries found.
        </p>
        <ul v-if="hasMatches">
            <li v-for="(match, id) in matches" v-bind:key="id">
                <router-link v-bind:to="match">
                    {{ match }}
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

/*
    Vue object
*/

export default Vue.extend({
    name: 'FrameIndex',
    props: {
        matches: Object
    },
    computed: {
        hasMatches(): boolean {
            return Object.keys(this.matches).length > 0;
        }
    }
});
</script>

<style scoped>
</style>
