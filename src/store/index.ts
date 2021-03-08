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

    /* entries as array */
    entriesArr: Array<Entry>;

    /* entries as object, incl. base entries, keyed by name & with full view */
    entriesObj = {} as Record<string, Entry>;

    /* number of base entries, to avoid inclusion when an entry is requested */
    baseNumber = Object.keys(entryBase).length;

    constructor(entriesArr: Array<Entry>) {
        this.entriesArr = entriesArr;
    };

    /*
        Entry set readiers
    */

    /* transfer entries array to object to allow each to be accessed by name */
    keyEntriesByName = (): Record<string, Entry> => {
        const keyed: Record<string, Entry> = {};
        let nameLower = '';
        this.entriesArr.forEach(entry => {
            /* replace 'start' base entry with new if new indicated */
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

    /* retain any view values ex. index, adding values or full view as needed */
    ensureEntryView = (name: string, entry: Entry, index: number): Entry => {
        if (!entry.view) {
            entry.view = {} as View;
        };
        const view = entry.view as View;
        entry.view = {
            index,
            route: view.route || URIFormat(name),
            isSet: view.isSet || false
        } as View;
        return entry;
    };

    /* combine entries object with base entries object */
    appendEntriesToBase = (entries: Record<string, Entry>): Record<string, Entry> => {
        return { ...entryBase, ...entries};
    };

    /* call to key entries by name, ensure a view & incl. base w/ any new 'start' */
    finalizeEntries = (): Record<string, Entry> => {
        const keyed = this.keyEntriesByName();
        const names = Object.keys(keyed).sort();
        const keyedWithView = keyed;
        names.forEach((name, index) => {
            keyedWithView[name] = this.ensureEntryView(name, keyed[name], index);
        });
        this.entriesObj = this.appendEntriesToBase(keyedWithView);
        return this.entriesObj;
    };

    /*
        Content handlers
    */

    /* return an object holding each entry name which includes every query string */
    getQueryEntryMatches = (queries = ['']): Record<number, Entry> => {
        let entriesNested = Object.entries(this.entriesObj).slice(this.baseNumber);
        queries.forEach(query => {
            entriesNested = entriesNested.filter(name =>
                name[0].toLowerCase().includes(query.toLowerCase()));
        });
        return Object.fromEntries(entriesNested);
    };

    /* if term is in 1+ entry names, return in a filter element, else tag-free */
    setEntryTerm = (element: string, opening: string, term: string): string => {
        const matches = this.getQueryEntryMatches([ term ]);
        const { anchor, status } = entry;
        const tag: string = anchor.toLowerCase();
        return Object.keys(matches).length > 0
            ? `<${tag} ${status}="false">${term}</${tag}>`
            : term;
    };

    /* replace each term in an entry body & note set on the entry view object */
    replaceEntryTerms = (name: string): Entry => {
        const entry = this.entriesObj[name];
        entry.body = entry.body.replace(termMatch, this.setEntryTerm);
        const view = entry.view as View;
        view.isSet = true;
        entry.view = view;
        return entry;
    };

    /*
        Value providers
    */

    /* return each unformatted entry name indexed by the URI-formatted version */
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

    /* return an entry previously formatted, or format first, else a base entry */
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
        entry = this.replaceEntryTerms(name);
        return entry;
    };
};
