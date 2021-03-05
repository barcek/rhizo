<template>
    <section class="frame-input cont--flex">
        <label for="frame-input-bar" class="visually-hidden">
            explore
        </label>
        <input
            id="frame-input-bar" type="text" placeholder="Explore"
            :data-toggled="false"
            @focus="handleInputBarFocus"
            @keyup="handleInputBarKeyup"
        />
        <button
            :aria-pressed="ariaPressed"
            @click="handleShowAllBtnClick"
        >
            {{ matchCount }}
        </button>
        <button @click="handleClearBtnClick">
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
    nature: 'single',
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
    props: {
        queries: Array,
        matches: Object
    },
    data(): object {
        return {
            isIndexInvoked: false as boolean
        };
    },
    computed: {
        matchCount: function(): number {
            return Object.keys(this.matches).length;
        },
        ariaPressed: function(): boolean {
            return this.$data.isIndexInvoked || !!this.queries[0];
        }
    },
    watch: {
        $route(): void {
            this.$data.isIndexInvoked = false;
        }
    },
    methods: {
        /*
            Event handlers
        */
        handleInputBarFocus(): void {
            this.$data.isIndexInvoked && this.revokeIndex();
            this.toggleFilterOn();
            this.$emit('open', input, 'input');
        },
        handleInputBarKeyup(event: KeyboardEvent): void {
            const target = event.target as HTMLInputElement;
            /*
                if value not emptied by keyup, pass as query,
                else reset queries & all filter values & visibilities to default
            */
            target.value
                ? this.$emit('query', 'input')
                : this.$emit('clear', ['input']);
        },
        handleShowAllBtnClick(): void {
            if (!this.ariaPressed && !this.$data.isIndexInvoked) {
                this.invokeIndex();
            } else if (this.$data.isIndexInvoked) {
                this.revokeIndex();
            };
        },
        handleClearBtnClick(): void {
            this.$data.isIndexInvoked && this.revokeIndex();
            if (this.$parent.$data.channel != 'input') {
                /* ensure handleChannelOpen is run, to revert all other filters*/
                this.$emit('open', input, 'input');
            };
            this.$emit('clear', ['input']);
            this.$emit('close', 'input');
        },
        /*
            Utility methods
        */
        invokeIndex(): void {
            this.$data.isIndexInvoked = true;
            this.$emit('invoke', 'index');
        },
        revokeIndex(): void {
            this.$data.isIndexInvoked = false;
            this.$emit('invoke', 'index');
        },
        toggleFilterOn(): void {
            const element = document.querySelector('#frame-input-bar') as HTMLElement;
            element.setAttribute(input.status, "true");
        }
    }
});
</script>

<style scoped>
</style>
