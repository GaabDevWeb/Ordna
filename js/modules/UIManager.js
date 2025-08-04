import { MenuManager } from './MenuManager.js';
import { IconSelector } from './IconSelector.js';
import { TextFormatBar } from './TextFormatBar.js';
import { ContextMenu } from './ContextMenu.js';

export class UIManager {
    constructor(pageManager, trashManager) {
        this.pageManager = pageManager;
        this.trashManager = trashManager;
        this.menuManager = new MenuManager();
        this.iconSelector = new IconSelector();
        this.textFormatBar = new TextFormatBar();
        this.contextMenu = new ContextMenu();
        

        
        this.setupIconSelectorCallbacks();
    }

    setupEventListeners() {
        // Botões principais
        document.getElementById('newPageBtn').addEventListener('click', () => {
            this.createNewPage();
        });

        document.getElementById('editTitleBtn').addEventListener('click', () => {
            this.editPageTitle();
        });

        document.getElementById('favoritePageBtn').addEventListener('click', () => {
            this.toggleCurrentPageFavorite();
        });

        // Editor
        const editor = document.getElementById('editor');
        editor.addEventListener('input', () => {
            this.saveCurrentPageContent();
        });

        // Event listeners para formatação de texto
        editor.addEventListener('mouseup', () => {
            setTimeout(() => this.handleTextSelection(), 50);
        });

        editor.addEventListener('keyup', (e) => {
            // Verificar se há seleção após teclas de navegação
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                setTimeout(() => this.handleTextSelection(), 0);
            }
        });

        // Detectar mudanças na seleção
        document.addEventListener('selectionchange', () => {
            setTimeout(() => this.handleTextSelection(), 10);
        });

        // Esconder barra de formatação ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.text-format-bar') && !e.target.closest('#editor')) {
                this.textFormatBar.hide();
            }
        });



        // Pesquisa
        document.getElementById('searchPages').addEventListener('input', (e) => {
            this.pageManager.setSearchTerm(e.target.value);
            this.renderPages();
        });

        // Lixeira
        document.getElementById('emptyTrashBtn').addEventListener('click', () => {
            this.emptyTrash();
        });

        document.getElementById('trashHeader').addEventListener('click', () => {
            this.toggleTrash();
        });
    }

    renderPages() {
        const pagesList = document.getElementById('pagesList');
        pagesList.innerHTML = '';

        const filteredPages = this.pageManager.getFilteredPages();

        if (filteredPages.length === 0 && this.pageManager.searchTerm) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <span>Nenhuma página encontrada</span>
            `;
            pagesList.appendChild(noResults);
            return;
        }

        filteredPages.forEach(page => {
            const pageItem = this.createPageItem(page);
            pagesList.appendChild(pageItem);
        });
    }

    createPageItem(page) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.dataset.pageId = page.id;
        
        if (page.id === this.pageManager.currentPageId) {
            pageItem.classList.add('active');
        }

        pageItem.innerHTML = `
            <div class="page-icon-container">
                <span class="page-icon" data-page-id="${page.id}">${page.icon || '📄'}</span>
                <span class="icon-edit-indicator">✏️</span>
            </div>
            <span class="page-title">${page.title}</span>
            <div class="page-actions-container">
                ${page.isFavorite ? '<span class="favorite-indicator"><i class="fas fa-star"></i></span>' : ''}
                <button class="page-menu-btn" data-page-id="${page.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;

        // Event listeners
        pageItem.addEventListener('click', (e) => {
            if (e.target.closest('.page-menu-btn') || e.target.closest('.page-icon-container')) {
                return;
            }
            this.switchToPage(page.id);
        });

        const menuBtn = pageItem.querySelector('.page-menu-btn');
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuManager.showPageMenu(page.id, menuBtn, this);
        });

        const iconContainer = pageItem.querySelector('.page-icon-container');
        iconContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            this.iconSelector.show(page.id, iconContainer);
        });

        return pageItem;
    }

    renderTrash() {
        const trashList = document.getElementById('trashList');
        const emptyTrashBtn = document.getElementById('emptyTrashBtn');
        const trashCount = document.getElementById('trashCount');
        
        trashList.innerHTML = '';
        
        if (!this.trashManager.hasItems()) {
            emptyTrashBtn.style.display = 'none';
            trashCount.style.display = 'none';
            trashList.style.display = 'none';
            return;
        }
        
        emptyTrashBtn.style.display = 'flex';
        trashCount.style.display = 'inline';
        trashCount.textContent = `(${this.trashManager.getTrashCount()})`;
        trashList.style.display = 'block';

        this.trashManager.trash.forEach(item => {
            const trashItem = this.createTrashItem(item);
            trashList.appendChild(trashItem);
        });
    }

    createTrashItem(item) {
        const trashItem = document.createElement('div');
        trashItem.className = 'trash-item';
        trashItem.dataset.itemId = item.id;
        
        trashItem.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span class="trash-item-title">${item.title}</span>
            <button class="page-menu-btn" data-item-id="${item.id}">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        `;

        const menuBtn = trashItem.querySelector('.page-menu-btn');
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuManager.showTrashItemMenu(item.id, menuBtn, this);
        });

        return trashItem;
    }

    switchToPage(pageId) {
        const page = this.pageManager.getPage(pageId);
        if (!page) return;

        this.pageManager.setCurrentPage(pageId);
        
        document.getElementById('currentPageTitle').textContent = page.title;
        document.getElementById('editor').innerHTML = page.content;
        
        this.updateFavoriteButton(page);

        this.renderPages();
        this.renderTrash();
    }

    saveCurrentPageContent() {
        if (!this.pageManager.currentPageId) return;

        const editor = document.getElementById('editor');
        this.pageManager.updatePageContent(this.pageManager.currentPageId, editor.innerHTML);
    }

    createNewPage() {
        const newPage = this.pageManager.createNewPage();
        this.renderPages();
        this.switchToPage(newPage.id);
        
        // Inicializar botão de favorito
        this.updateFavoriteButton(newPage);
        
        setTimeout(() => {
            this.editPageTitleAndIcon();
        }, 100);
    }



    moveToTrash(pageId) {
        if (!this.pageManager.hasMultiplePages()) {
            alert('Não é possível mover a última página para a lixeira.');
            return;
        }

        const page = this.pageManager.getPage(pageId);
        if (!page) return;

        const currentIndex = this.pageManager.pages.findIndex(p => p.id === pageId);
        this.pageManager.deletePage(pageId);
        this.trashManager.addToTrash(page);

        if (this.pageManager.currentPageId === pageId) {
            const nextPage = this.pageManager.getNextPageAfterDeletion(currentIndex);
            this.switchToPage(nextPage.id);
        } else {
            this.renderPages();
        }
        this.renderTrash();
    }

    restoreFromTrash(itemId) {
        const item = this.trashManager.restoreFromTrash(itemId);
        if (item) {
            this.pageManager.pages.push(item);
            this.pageManager.savePages();
            this.renderPages();
            this.renderTrash();
        }
    }

    deletePermanently(itemId) {
        if (!confirm('Tem certeza que deseja excluir permanentemente esta página? Esta ação não pode ser desfeita.')) {
            return;
        }

        this.trashManager.deletePermanently(itemId);
        this.renderTrash();
    }

    emptyTrash() {
        if (!this.trashManager.hasItems()) return;

        if (!confirm(`Tem certeza que deseja esvaziar a lixeira? ${this.trashManager.getTrashCount()} item(s) serão excluídos permanentemente.`)) {
            return;
        }

        this.trashManager.emptyTrash();
        this.renderTrash();
    }

    toggleTrash() {
        const trashList = document.getElementById('trashList');
        const trashHeader = document.getElementById('trashHeader');
        
        if (trashList.style.display === 'none' || trashList.style.display === '') {
            trashList.style.display = 'block';
            trashHeader.classList.add('expanded');
        } else {
            trashList.style.display = 'none';
            trashHeader.classList.remove('expanded');
        }
    }

    editPageTitle() {
        const currentTitle = document.getElementById('currentPageTitle');
        const currentText = currentTitle.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'title-edit-input';
        input.style.cssText = `
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
            border: 2px solid #3a3a3a;
            border-radius: 4px;
            padding: 4px 8px;
            outline: none;
            background: #0d0d0d;
            width: 100%;
            max-width: 400px;
        `;

        currentTitle.style.display = 'none';
        currentTitle.parentNode.insertBefore(input, currentTitle);
        input.focus();
        input.select();

        input.addEventListener('input', () => {
            const newTitle = input.value.trim();
            this.pageManager.updatePageTitle(this.pageManager.currentPageId, newTitle);
            this.renderPages();
        });

        const finishEditing = () => {
            const newTitle = input.value.trim();
            currentTitle.textContent = newTitle || 'Página sem título';
            currentTitle.style.display = 'block';
            input.remove();
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                currentTitle.textContent = currentText;
                currentTitle.style.display = 'block';
                input.remove();
            }
        });
    }

    editPageTitleInSidebar(pageId, titleElement) {
        const page = this.pageManager.getPage(pageId);
        if (!page) return;

        const currentText = titleElement.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'sidebar-title-edit-input';

        titleElement.style.display = 'none';
        titleElement.parentNode.insertBefore(input, titleElement);
        input.focus();
        input.select();

        input.addEventListener('input', () => {
            const newTitle = input.value.trim();
            this.pageManager.updatePageTitle(pageId, newTitle);
            
            if (this.pageManager.currentPageId === pageId) {
                document.getElementById('currentPageTitle').textContent = this.pageManager.getPage(pageId).title;
            }
        });

        const finishEditing = () => {
            const newTitle = input.value.trim();
            titleElement.textContent = newTitle || 'Página sem título';
            titleElement.style.display = 'block';
            input.remove();
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                titleElement.textContent = currentText;
                titleElement.style.display = 'block';
                input.remove();
            }
        });
    }

    editPageTitleAndIcon() {
        const currentTitle = document.getElementById('currentPageTitle');
        const currentText = currentTitle.textContent;
        const page = this.pageManager.getCurrentPage();
        if (!page) return;

        const container = document.createElement('div');
        container.className = 'title-icon-edit-container';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            max-width: 500px;
        `;

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = currentText;
        titleInput.className = 'title-edit-input';
        titleInput.style.cssText = `
            font-size: 28px;
            font-weight: 600;
            color: #ffffff;
            border: 2px solid #3a3a3a;
            border-radius: 4px;
            padding: 4px 8px;
            outline: none;
            background: #0d0d0d;
            flex: 1;
        `;

        const iconBtn = document.createElement('button');
        iconBtn.className = 'icon-select-btn';
        iconBtn.innerHTML = page.icon || '📄';
        iconBtn.style.cssText = `
            font-size: 24px;
            padding: 8px 12px;
            border: 2px solid #3a3a3a;
            border-radius: 4px;
            background: #0d0d0d;
            color: #ffffff;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 50px;
        `;

        currentTitle.style.display = 'none';
        currentTitle.parentNode.insertBefore(container, currentTitle);
        container.appendChild(titleInput);
        container.appendChild(iconBtn);

        titleInput.focus();
        titleInput.select();

        iconBtn.addEventListener('click', () => {
            this.iconSelector.showForNewPage(iconBtn);
        });

        titleInput.addEventListener('input', () => {
            const newTitle = titleInput.value.trim();
            this.pageManager.updatePageTitle(this.pageManager.currentPageId, newTitle);
            this.renderPages();
        });

        const updateIconBtn = () => {
            iconBtn.innerHTML = this.pageManager.getCurrentPage().icon || '📄';
        };

        const finishEditing = () => {
            const newTitle = titleInput.value.trim();
            currentTitle.textContent = newTitle || 'Página sem título';
            currentTitle.style.display = 'block';
            container.remove();
        };

        titleInput.addEventListener('blur', finishEditing);
        titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                currentTitle.textContent = currentText;
                currentTitle.style.display = 'block';
                container.remove();
            }
        });
    }

    setupIconSelectorCallbacks() {
        this.iconSelector.onIconSelected = (pageId, icon) => {
            this.pageManager.updatePageIcon(pageId, icon);
            this.renderPages();
        };
    }

    updateFavoriteButton(page) {
        const favoriteBtn = document.getElementById('favoritePageBtn');
        if (page.isFavorite) {
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
        }
    }

    toggleCurrentPageFavorite() {
        if (!this.pageManager.currentPageId) return;

        const isFavorite = this.pageManager.toggleFavorite(this.pageManager.currentPageId);
        const page = this.pageManager.getPage(this.pageManager.currentPageId);
        
        this.updateFavoriteButton(page);
        this.renderPages();
    }

    handleTextSelection() {
        const selection = window.getSelection();
        
        // Verificar se há seleção de texto
        if (selection.toString().trim().length > 0 && selection.rangeCount > 0) {
            // Verificar se a seleção está dentro do editor
            const editor = document.getElementById('editor');
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            
            if (editor.contains(container)) {
                // Esconder menu de contexto quando há seleção
                this.contextMenu.hide();
                // Aguardar um pouco para garantir que a seleção foi finalizada
                setTimeout(() => {
                    this.textFormatBar.positionNearSelection();
                }, 10);
            } else {
                this.textFormatBar.hide();
            }
        } else {
            this.textFormatBar.hide();
        }
    }
} 