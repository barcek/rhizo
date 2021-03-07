/* convert entry name to URI substring */
const URIFormat = (name: string) => {
    return name.replace(/\W/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

export default URIFormat;
