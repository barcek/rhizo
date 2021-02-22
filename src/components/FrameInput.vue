<template>
    <section class="frame-input">
        <label for="text" class="visually-hidden">
            explore
        </label>
        <input
            id="text" type="text" placeholder="Explore"
            data-toggled="false"
            @focus="handleFocus"
            @keyup="handleKeyup"
        />
    </section>
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

export const input: Filter = {
    anchor: 'INPUT',
    typing: HTMLInputElement,
    status: 'data-toggled',
    source: 'value',
    isOpen: true
};

/*
    Vue object
*/

export default Vue.extend({
    name: 'FrameInput',
    methods: {
        /*
            Event handlers
        */
        handleFocus(event: Event): void {
            this.$emit('toggle', event.target, input);
        },
        handleKeyup(event: Event): void {
            const target = event.target as HTMLInputElement;
            this.$emit('query', target.value ? 'input' : 'clear');
        }
    }
});
</script>

<style scoped>
</style>
