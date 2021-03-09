/* regular expression literal to match term in <t> element in entry body */
const termMatch = /(?<=<t>).*?(?=<\/t>)/g;

export default termMatch;
