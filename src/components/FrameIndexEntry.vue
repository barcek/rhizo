<template>
    <li>
        <router-link
            v-bind:to="match.view.route"
        >
            <article
                class='frame-index-entry'
            >
                <h1
                    v-html="match.name"
                >
                </h1>
                <section
                    v-html="match.body"
                >
                </section>
            </article>
        </router-link>
    </li>
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
    name: 'FrameIndexEntry',
    props: {
        match: Object
    }
});
</script>

<style scoped>
</style>
