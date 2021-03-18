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
                <div
                    role='presentation'
                >
                </div>
                <section
                    v-html="renderUntabbable(match.body)"
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

const tabindexMatch = /(?<=tabindex=")-?\d+(?=")/g;
const tabbableMatch = /(?<=<)(a|button|input|select|textarea|area|object|audio|video|summary|link)(?=\s+|\/?>)/g;

export default Vue.extend({
    name: 'FrameIndexEntry',
    props: {
        match: Object
    },
    methods: {
        renumberTabindex() {
            return '-1';
        },
        addFalseTabindex(tag: string) {
            return tag + ' tabindex="-1"';
        },
        renderUntabbable(text: string) {
            return text
                .replace(tabindexMatch, this.renumberTabindex)
                .replace(tabbableMatch, this.addFalseTabindex);
        }
    }
});
</script>

<style scoped>
</style>
