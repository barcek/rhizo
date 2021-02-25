<template>
    <section class="frame-input cont--flex">
        <label for="frame-input-bar" class="visually-hidden">
            explore
        </label>
        <input
            id="frame-input-bar" type="text" placeholder="Explore"
            data-toggled="false"
            @focus="handleInputFocus"
            @keyup="handleInputKeyup"
        />
        <button @click="handleButtonClick">
            <svg viewBox="0 0 10 10">
                <path d="M1,1 L9,9 M1,9 L9,1"/>
            </svg>
        </button>
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
    isSeen: true
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
        handleInputFocus(event: Event): void {
            this.$emit('open', event.target, input, 'input');
        },
        handleInputKeyup(event: Event): void {
            const target = event.target as HTMLInputElement;
            target.value
                ? this.$emit('query', 'input')
                : this.$emit('clear', ['input']);
        },
        handleButtonClick(): void {
            /* ensure handleChannelOpen is run for input, to revert all other filters*/
            if (this.$parent.$data.channel != 'input') {
                const inputElement = document.querySelector('#frame-input-bar');
                this.$emit('open', inputElement, input, 'input');
            };
            this.$emit('clear', ['input']);
            this.$emit('close', 'input');
        }
    }
});
</script>

<style scoped>
</style>
