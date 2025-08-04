import { PageManager } from './PageManager.js';
import { TrashManager } from './TrashManager.js';
import { UIManager } from './UIManager.js';
import { StorageManager } from './StorageManager.js';

export class OrdnaApp {
    constructor() {
        this.storage = new StorageManager();
        this.pageManager = new PageManager(this.storage);
        this.trashManager = new TrashManager(this.storage);
        this.ui = new UIManager(this.pageManager, this.trashManager);
        
        this.init();
    }

    init() {
        this.pageManager.loadPages();
        this.trashManager.loadTrash();
        this.ui.setupEventListeners();
        this.ui.renderPages();
        this.ui.renderTrash();
        
        if (this.pageManager.pages.length === 0) {
            this.pageManager.createInitialPage();
        } else {
            this.ui.switchToPage(this.pageManager.pages[0].id);
        }
    }
} 