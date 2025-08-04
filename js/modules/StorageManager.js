export class StorageManager {
    constructor() {
        this.pagesKey = 'ordna_pages';
        this.trashKey = 'ordna_trash';
    }

    loadPages() {
        const savedPages = localStorage.getItem(this.pagesKey);
        return savedPages ? JSON.parse(savedPages) : [];
    }

    loadTrash() {
        const savedTrash = localStorage.getItem(this.trashKey);
        return savedTrash ? JSON.parse(savedTrash) : [];
    }

    savePages(pages, trash) {
        localStorage.setItem(this.pagesKey, JSON.stringify(pages));
        localStorage.setItem(this.trashKey, JSON.stringify(trash));
    }

    clearAll() {
        localStorage.removeItem(this.pagesKey);
        localStorage.removeItem(this.trashKey);
    }
} 