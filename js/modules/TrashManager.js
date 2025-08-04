export class TrashManager {
    constructor(storage) {
        this.storage = storage;
        this.trash = [];
    }

    loadTrash() {
        this.trash = this.storage.loadTrash();
    }

    saveTrash() {
        this.storage.savePages([], this.trash);
    }

    addToTrash(page) {
        page.movedToTrashAt = new Date().toISOString();
        this.trash.push(page);
        this.saveTrash();
    }

    getTrashItem(itemId) {
        return this.trash.find(item => item.id === itemId);
    }

    removeFromTrash(itemId) {
        const itemIndex = this.trash.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const item = this.trash[itemIndex];
            this.trash.splice(itemIndex, 1);
            this.saveTrash();
            return item;
        }
        return null;
    }

    restoreFromTrash(itemId) {
        const item = this.removeFromTrash(itemId);
        if (item) {
            delete item.movedToTrashAt;
            return item;
        }
        return null;
    }

    deletePermanently(itemId) {
        const itemIndex = this.trash.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.trash.splice(itemIndex, 1);
            this.saveTrash();
            return true;
        }
        return false;
    }

    emptyTrash() {
        this.trash = [];
        this.saveTrash();
    }

    getTrashCount() {
        return this.trash.length;
    }

    hasItems() {
        return this.trash.length > 0;
    }
} 