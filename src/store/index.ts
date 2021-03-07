/*
    Imports
*/

/* interfaces */
import { Entry, View } from '../types';

/* implementation of the Filter interface in FrameEntry */
import { entry } from '../views/FrameEntry.vue';

/* customizables */
import entryBase from './entry-base';
import URIFormat from './uri-format';
import termMatch from './term-match';

/*
    Exports
*/

export default class Store {

    entriesArr: Array<Entry>;
    entriesObj = {} as Record<string, Entry>;
    baseNumber = Object.keys(entryBase).length;

    constructor(entriesArr: Array<Entry>) {
        this.entriesArr = entriesArr;
    };

    /*
        Store initializers
    */

    /* allow each entry to be accessed by name as key */
    keyEntriesByName = (): Record<string, Entry> => {
        const keyed: Record<string, Entry> = {};
        let nameLower = '';
        this.entriesArr.forEach(entry => {
            /* replace 'start' base entry if new provided */
            if (entry.meta && entry.meta === 'start') {
                entryBase.start = entry;
                return;
            };
            nameLower = entry.name;
            nameLower.toLowerCase();
            keyed[nameLower] = entry;
        });
        return keyed;
    };

    /* retain existing view values exc. index, adding values or entire view as needed */
    ensureView = (keyed: Record<string, Entry>): Record<string, Entry> => {
        const names = Object.keys(keyed).sort();
        names.forEach((name, index) => {
            if (!keyed[name].view) {
                keyed[name].view = {} as View;
            };
            const view = keyed[name].view as View;
            keyed[name].view = {
                index,
                route: view.route || URIFormat(name),
                isSet: view.isSet || false
            } as View;
        });
        return keyed;
    };

    /* combine all entries */
    appendToBase = (keyedWithView: Record<string, Entry>): Record<string, Entry> => {
        return { ...entryBase, ...keyedWithView};
    };

    prepareEntries = (): Record<string, Entry> => {
        const keyed = this.keyEntriesByName();
        const keyedWithView = this.ensureView(keyed);
        this.entriesObj = this.appendToBase(keyedWithView);
        return this.entriesObj;
    };

    /*
        Content handlers
    */

    /* return an object holding each entry name which includes every query string */
    getMatches = (queries = ['']): Record<number, Entry> => {
        let entriesNested = Object.entries(this.entriesObj).slice(this.baseNumber);
        queries.forEach(query => {
            entriesNested = entriesNested.filter(name =>
                name[0].toLowerCase().includes(query.toLowerCase()));
        });
        return Object.fromEntries(entriesNested);
    };

    /* if term is in 1+ entry names, return in a filter element, else tag-free */
    setTerms = (element: string, opening: string, term: string): string => {
        const matches = this.getMatches([ term ]);
        const { anchor, status } = entry;
        const tag: string = anchor.toLowerCase();
        return Object.keys(matches).length > 0
            ? `<${tag} ${status}="false">${term}</${tag}>`
            : term;
    };

    replaceTerms = (name: string): Entry => {
        const entry = this.entriesObj[name];
        entry.body = entry.body.replace(termMatch, this.setTerms);
        const view = entry.view as View;
        view.isSet = true;
        entry.view = view;
        return entry;
    };

    /*
        Value providers
    */

    computeRoutes(): Record<string, string> {
        const routes: Record<string, string> = {};
        Object.keys(this.entriesObj).slice(this.baseNumber).forEach(name => {
            const view = this.entriesObj[name].view as View;
            routes[view.route] = name;
        });
        return routes;
    };

    getEntries(): Record<string, Entry> {
        return this.entriesObj;
    };

    /* return an entry formatted & stored, or format & store first, else 'error' */
    getEntry(route: string, routes: Record<string, string>): Entry {
        const name = routes[route] || 'start';
        if (!this.entriesObj[name]) {
            return this.entriesObj['error'];
        };
        if (name === 'start') {
            return this.entriesObj['start'];
        };
        const view = this.entriesObj[name].view as View;
        if (view.isSet === true) {
            return this.entriesObj[name];
        };
        let entry = this.entriesObj[name];
        entry = this.replaceTerms(name);
        return entry;
    };
};
