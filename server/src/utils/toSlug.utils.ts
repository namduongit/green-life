
// helper function conver to slug
export function toSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}
