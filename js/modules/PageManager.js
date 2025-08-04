export class PageManager {
    constructor(storage) {
        this.storage = storage;
        this.pages = [];
        this.currentPageId = null;
        this.searchTerm = '';
    }

    loadPages() {
        this.pages = this.storage.loadPages();
    }

    savePages() {
        this.storage.savePages(this.pages, []);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createInitialPage() {
        const initialPage = {
            id: this.generateId(),
            title: 'Minha Primeira Página',
            content: '<p>Bem-vindo ao Ordna! Esta é sua primeira página.</p><p>Você pode:</p><ul><li>Criar novas páginas clicando em "Nova Página"</li><li>Editar o título da página clicando no ícone de edição</li><li>Escrever e formatar seu conteúdo</li><li>Navegar entre as páginas na barra lateral</li><li>Favoritar páginas importantes clicando na estrela</li></ul>',
            icon: '📄',
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(initialPage);
        this.savePages();
        return initialPage;
    }

    createNewPage() {
        const newPage = {
            id: this.generateId(),
            title: 'Página sem título',
            content: '<p>Comece a escrever sua nova página...</p>',
            icon: '📄',
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(newPage);
        this.savePages();
        return newPage;
    }

    getPage(pageId) {
        return this.pages.find(p => p.id === pageId);
    }

    getCurrentPage() {
        return this.getPage(this.currentPageId);
    }

    setCurrentPage(pageId) {
        this.currentPageId = pageId;
    }

    updatePageContent(pageId, content) {
        const page = this.getPage(pageId);
        if (page) {
            page.content = content;
            page.updatedAt = new Date().toISOString();
            this.savePages();
        }
    }

    updatePageTitle(pageId, title) {
        const page = this.getPage(pageId);
        if (page) {
            page.title = title || 'Página sem título';
            page.updatedAt = new Date().toISOString();
            this.savePages();
        }
    }

    updatePageIcon(pageId, icon) {
        const page = this.getPage(pageId);
        if (page) {
            page.icon = icon;
            page.updatedAt = new Date().toISOString();
            this.savePages();
        }
    }

    toggleFavorite(pageId) {
        const page = this.getPage(pageId);
        if (page) {
            page.isFavorite = !page.isFavorite;
            page.updatedAt = new Date().toISOString();
            this.savePages();
            return page.isFavorite;
        }
        return false;
    }

    deletePage(pageId) {
        const pageIndex = this.pages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            this.pages.splice(pageIndex, 1);
            this.savePages();
            return pageIndex;
        }
        return -1;
    }

    duplicatePage(pageId) {
        const originalPage = this.getPage(pageId);
        if (!originalPage) return null;

        const duplicatedPage = {
            id: this.generateId(),
            title: `${originalPage.title} (cópia)`,
            content: originalPage.content,
            icon: originalPage.icon,
            isFavorite: false, // Cópias não são favoritas por padrão
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(duplicatedPage);
        this.savePages();
        return duplicatedPage;
    }

    getFilteredPages() {
        const filteredPages = this.pages.filter(page => 
            page.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        
        // Ordenar: favoritos primeiro, depois por data de atualização
        return filteredPages.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }

    setSearchTerm(term) {
        this.searchTerm = term;
    }

    hasMultiplePages() {
        return this.pages.length > 1;
    }

    getNextPageAfterDeletion(deletedIndex) {
        return this.pages[Math.min(deletedIndex, this.pages.length - 1)];
    }
} 