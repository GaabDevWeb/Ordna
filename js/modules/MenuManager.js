export class MenuManager {
    constructor() {
        this.activeMenu = null;
    }

    showPageMenu(pageId, button, uiManager) {
        this.closeActiveMenu();

        const menu = document.createElement('div');
        menu.className = 'page-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="rename">
                <i class="fas fa-edit"></i>
                <span>Renomear</span>
            </div>
            <div class="menu-item" data-action="duplicate">
                <i class="fas fa-copy"></i>
                <span>Duplicar</span>
            </div>
            <div class="menu-item" data-action="moveToTrash">
                <i class="fas fa-trash"></i>
                <span>Mover para lixeira</span>
            </div>
        `;

        this.positionMenu(menu, button, 150, 120);
        this.setupMenuEventListeners(menu, pageId, uiManager, 'page');
        this.activeMenu = menu;
    }

    showTrashItemMenu(itemId, button, uiManager) {
        this.closeActiveMenu();

        const menu = document.createElement('div');
        menu.className = 'page-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="restore">
                <i class="fas fa-undo"></i>
                <span>Restaurar</span>
            </div>
            <div class="menu-item" data-action="deletePermanently">
                <i class="fas fa-trash-alt"></i>
                <span>Excluir permanentemente</span>
            </div>
        `;

        this.positionMenu(menu, button, 150, 80);
        this.setupMenuEventListeners(menu, itemId, uiManager, 'trash');
        this.activeMenu = menu;
    }

    positionMenu(menu, button, menuWidth, menuHeight) {
        const buttonRect = button.getBoundingClientRect();
        
        // Calcular posição inicial
        let left = buttonRect.left - menuWidth;
        let top = buttonRect.bottom + 5;
        
        // Verificar se o menu sairia da tela pela esquerda
        if (left < 10) {
            left = buttonRect.right + 5;
        }
        
        // Verificar se o menu sairia da tela pela direita
        if (left + menuWidth > window.innerWidth - 10) {
            left = window.innerWidth - menuWidth - 10;
        }
        
        // Verificar se o menu sairia da tela por baixo
        if (top + menuHeight > window.innerHeight - 10) {
            top = buttonRect.top - menuHeight - 5;
        }
        
        // Verificar se o menu sairia da tela por cima
        if (top < 10) {
            top = 10;
        }
        
        menu.style.position = 'fixed';
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.zIndex = '1000';
    }

    setupMenuEventListeners(menu, itemId, uiManager, type) {
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            if (!action) return;

            this.handleMenuAction(action, itemId, uiManager, type);
            this.closeActiveMenu();
        });

        // Fechar menu ao clicar fora
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !e.target.closest('.page-menu-btn')) {
                this.closeActiveMenu();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);

        document.body.appendChild(menu);
    }

    handleMenuAction(action, itemId, uiManager, type) {
        switch (type) {
            case 'page':
                this.handlePageMenuAction(action, itemId, uiManager);
                break;
            case 'trash':
                this.handleTrashMenuAction(action, itemId, uiManager);
                break;
        }
    }

    handlePageMenuAction(action, pageId, uiManager) {
        switch (action) {
            case 'rename':
                uiManager.editPageTitleInSidebar(pageId, document.querySelector(`[data-page-id="${pageId}"] .page-title`));
                break;
            case 'duplicate':
                const duplicatedPage = uiManager.pageManager.duplicatePage(pageId);
                if (duplicatedPage) {
                    uiManager.renderPages();
                    uiManager.switchToPage(duplicatedPage.id);
                }
                break;
            case 'moveToTrash':
                uiManager.moveToTrash(pageId);
                break;
        }
    }

    handleTrashMenuAction(action, itemId, uiManager) {
        switch (action) {
            case 'restore':
                uiManager.restoreFromTrash(itemId);
                break;
            case 'deletePermanently':
                uiManager.deletePermanently(itemId);
                break;
        }
    }

    closeActiveMenu() {
        if (this.activeMenu) {
            this.activeMenu.remove();
            this.activeMenu = null;
        }
    }
} 