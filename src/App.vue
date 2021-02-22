<template>
  <div id="app" class="cont--flex cont--flex--col">
    <div
        v-if="!didLoad"
        class="loader cont--flex cont--flex--col cont--flex--center">
        <div
            v-if="!isError"
        >
        </div>
        <p
            v-if="isError"
            class="text--center">
            <strong>Oops...</strong>
            <br><br>
            Something went wrong.
        </p>
    </div>
    <Frame
        v-if="didLoad"
        :content="content"
    />
  </div>
</template>

<script lang="ts">
/*
    Imports
*/

import Vue from 'vue';
import { Entry } from './types';
import Frame from './components/Frame.vue';

/*
    Constants
*/

const publicDir = './';

const resources = {
    default: 'entries.json'
};

const defaultResource = publicDir + resources.default;

/*
    Vue object
*/

export default Vue.extend({
    name: 'App',
    components: {
        Frame
    },
    data(): object {
        return {
            isError: false as boolean,
            content: [] as Array<Entry>
        };
    },
    computed: {
        didLoad: function(): boolean {
            return this.$data.content.length > 0;
        }
    },
    async created(): Promise<void> {
        const content: Array<Entry> = await this.fetchResource(defaultResource);
        this.$data.content = content || [];
    },
    methods: {
        async fetchResource(resource: string): Promise<Array<Entry>> {
            return fetch(resource)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    };
                    return res.json();
                })
                .catch(() => {
                    this.$data.isError = true;
                });
        }
    }
});
</script>

<style scoped>
</style>
