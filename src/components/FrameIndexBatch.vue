<template>
    <nav class="frame-batch">
        <ul>
            <transition-group appear>
                <li
                    v-for="query in queries" v-bind:key="query"
                    tabindex="0"
                    @click="handleLabelClick"
                    @keyup="handleLabelKeyup"
                >
                    {{ query }}
                    <svg viewBox="0 0 10 10">
                        <path d="M1,1 L9,9 M1,9 L9,1"/>
                    </svg>
                </li>
            </transition-group>
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
    name: 'FrameBatch',
    props: {
        queries: Array
    },
    methods: {
        /*
            Event handlers
        */
        handleLabelClick(event: Event): void {
            const target = event.target as HTMLLIElement;
            const query = target.textContent as string;
            this.$emit('untoggle', query.trim());
        },
        handleLabelKeyup(event: KeyboardEvent): void {
            if (event.keyCode === 13 || event.keyCode === 32) {
                event.preventDefault();
                this.handleLabelClick(event);
            };
        }
    }
});
</script>

<style scoped>
</style>
