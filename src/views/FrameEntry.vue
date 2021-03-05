<template>
    <article
        @click="handleClick"
        class="frame-entry"
    >
        <h1>
            {{ entry.name }}
        </h1>
        <section
            v-html="entry.body"
        >
        </section>
    </article>
</template>

<script lang="ts">
/*
    Imports
*/

import Vue from 'vue';
import { Filter } from '../types';

/*
    Filter data
*/

export const entry: Filter = {
    nature: 'multi',
    anchor: 'BUTTON',
    typing: HTMLButtonElement,
    status: 'aria-pressed',
    source: 'textContent',
    isSeen: true
};

/*
    Vue object
*/

export default Vue.extend({
    name: 'FrameEntry',
    props: {
        entry: Object
    },
    methods: {
        handleClick(event: Event): void {
            const target = event.target as HTMLButtonElement;
            if (target.nodeName === entry.anchor) {
                this.toggleButton(target);
                this.$emit('open', entry, 'entry');
                this.$emit('query', 'entry');
            };
        },
        toggleButton(element: HTMLElement): void {
            const isOn: boolean = (element.getAttribute(entry.status) === 'true');
            element.setAttribute(entry.status, String(!isOn));
        },
    }
});
</script>

<style scoped>
</style>
