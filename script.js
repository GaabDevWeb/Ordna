// Classe principal da aplicação
class OrdnaApp {
    constructor() {
        this.pages = [];
        this.trash = [];
        this.currentPageId = null;
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadPages();
        this.setupEventListeners();
        this.renderPages();
        this.renderTrash();
        
        if (this.pages.length === 0) {
            this.createInitialPage();
        } else {
            this.switchToPage(this.pages[0].id);
        }
    }

    loadPages() {
        const savedPages = localStorage.getItem('ordna_pages');
        if (savedPages) {
            this.pages = JSON.parse(savedPages);
        }
        
        const savedTrash = localStorage.getItem('ordna_trash');
        if (savedTrash) {
            this.trash = JSON.parse(savedTrash);
        }
    }

    savePages() {
        localStorage.setItem('ordna_pages', JSON.stringify(this.pages));
        localStorage.setItem('ordna_trash', JSON.stringify(this.trash));
    }

    setupEventListeners() {
        document.getElementById('newPageBtn').addEventListener('click', () => {
            this.createNewPage();
        });

        document.getElementById('editTitleBtn').addEventListener('click', () => {
            this.editPageTitle();
        });

        document.getElementById('deletePageBtn').addEventListener('click', () => {
            this.deleteCurrentPage();
        });

        const editor = document.getElementById('editor');
        editor.addEventListener('input', () => {
            this.saveCurrentPageContent();
        });

        // Campo de pesquisa
        document.getElementById('searchPages').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderPages();
        });

        // Botão esvaziar lixeira
        document.getElementById('emptyTrashBtn').addEventListener('click', () => {
            this.emptyTrash();
        });

        // Cabeçalho da lixeira (para expandir/colapsar)
        document.getElementById('trashHeader').addEventListener('click', () => {
            this.toggleTrash();
        });

    }

    createInitialPage() {
        const initialPage = {
            id: this.generateId(),
            title: 'Minha Primeira Página',
            content: '<p>Bem-vindo ao Ordna! Esta é sua primeira página.</p><p>Você pode:</p><ul><li>Criar novas páginas clicando em "Nova Página"</li><li>Editar o título da página clicando no ícone de edição</li><li>Escrever e formatar seu conteúdo</li><li>Navegar entre as páginas na barra lateral</li></ul>',
            icon: '📄',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(initialPage);
        this.savePages();
        this.switchToPage(initialPage.id);
    }



    createNewPage() {
        const newPage = {
            id: this.generateId(),
            title: 'Página sem título',
            content: '<p>Comece a escrever sua nova página...</p>',
            icon: '📄',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(newPage);
        this.savePages();
        this.renderPages();
        this.switchToPage(newPage.id);
        
        // Automaticamente abrir edição do título e ícone
        setTimeout(() => {
            this.editPageTitleAndIcon();
        }, 100);
    }

    renderPages() {
        const pagesList = document.getElementById('pagesList');
        pagesList.innerHTML = '';

        // Filtrar páginas baseado no termo de pesquisa
        const filteredPages = this.pages.filter(page => 
            page.title.toLowerCase().includes(this.searchTerm)
        );

        if (filteredPages.length === 0 && this.searchTerm) {
            // Mostrar mensagem quando não há resultados
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
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.dataset.pageId = page.id;
            
            if (page.id === this.currentPageId) {
                pageItem.classList.add('active');
            }

            pageItem.innerHTML = `
                <div class="page-icon-container">
                    <span class="page-icon" data-page-id="${page.id}">${page.icon || '📄'}</span>
                    <span class="icon-edit-indicator">✏️</span>
                </div>
                <span class="page-title">${page.title}</span>
                <button class="page-menu-btn" data-page-id="${page.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            `;

            // Event listener para clicar na página
            pageItem.addEventListener('click', (e) => {
                // Se clicar no menu ou no ícone, não navegar
                if (e.target.closest('.page-menu-btn') || e.target.closest('.page-icon-container')) {
                    return;
                }
                // Navegar para a página
                this.switchToPage(page.id);
            });

            // Event listener para o menu de opções
            const menuBtn = pageItem.querySelector('.page-menu-btn');
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showPageMenu(page.id, menuBtn);
            });

            // Event listener para o ícone da página
            const iconContainer = pageItem.querySelector('.page-icon-container');
            iconContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showIconSelector(page.id);
            });

            pagesList.appendChild(pageItem);
        });
    }

    switchToPage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        this.currentPageId = pageId;
        
        document.getElementById('currentPageTitle').textContent = page.title;
        document.getElementById('editor').innerHTML = page.content;
        
        const deleteBtn = document.getElementById('deletePageBtn');
        if (this.pages.length > 1) {
            deleteBtn.style.display = 'flex';
        } else {
            deleteBtn.style.display = 'none';
        }

        this.renderPages();
        this.renderTrash();
    }

    saveCurrentPageContent() {
        if (!this.currentPageId) return;

        const page = this.pages.find(p => p.id === this.currentPageId);
        if (!page) return;

        const editor = document.getElementById('editor');
        page.content = editor.innerHTML;
        page.updatedAt = new Date().toISOString();
        
        this.savePages();
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

        // Salvar em tempo real conforme digita
        input.addEventListener('input', () => {
            const newTitle = input.value.trim();
            const page = this.pages.find(p => p.id === this.currentPageId);
            if (page) {
                page.title = newTitle || 'Página sem título';
                page.updatedAt = new Date().toISOString();
                this.savePages();
                this.renderPages();
            }
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
        const page = this.pages.find(p => p.id === pageId);
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

        // Salvar em tempo real conforme digita
        input.addEventListener('input', () => {
            const newTitle = input.value.trim();
            if (page) {
                page.title = newTitle || 'Página sem título';
                page.updatedAt = new Date().toISOString();
                this.savePages();
                
                // Atualizar o título na página atual se for a mesma
                if (this.currentPageId === pageId) {
                    document.getElementById('currentPageTitle').textContent = page.title;
                }
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

    deleteCurrentPage() {
        if (!this.currentPageId || this.pages.length <= 1) return;

        if (!confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
            return;
        }

        const currentIndex = this.pages.findIndex(p => p.id === this.currentPageId);
        this.pages.splice(currentIndex, 1);
        this.savePages();

        if (this.pages.length > 0) {
            const nextPage = this.pages[Math.min(currentIndex, this.pages.length - 1)];
            this.switchToPage(nextPage.id);
        } else {
            this.createInitialPage();
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showPageMenu(pageId, button) {
        // Remover menus existentes
        const existingMenus = document.querySelectorAll('.page-menu');
        existingMenus.forEach(menu => menu.remove());

        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

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

        // Posicionar o menu com verificação de limites da tela
        const buttonRect = button.getBoundingClientRect();
        const menuWidth = 150; // Largura aproximada do menu
        const menuHeight = 120; // Altura aproximada do menu (3 itens)
        
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

        // Event listeners para as opções do menu
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            if (!action) return;

            switch (action) {
                case 'rename':
                    this.renamePageInSidebar(pageId);
                    break;
                case 'duplicate':
                    this.duplicatePage(pageId);
                    break;
                case 'moveToTrash':
                    this.moveToTrash(pageId);
                    break;
            }
            menu.remove();
        });

        // Fechar menu ao clicar fora
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);

        document.body.appendChild(menu);
    }

    renamePage(pageId) {
        this.switchToPage(pageId);
        setTimeout(() => {
            this.editPageTitle();
        }, 100);
    }

    renamePageInSidebar(pageId) {
        const pageItem = document.querySelector(`[data-page-id="${pageId}"]`);
        if (!pageItem) return;
        
        const titleElement = pageItem.querySelector('.page-title');
        if (titleElement) {
            this.editPageTitleInSidebar(pageId, titleElement);
        }
    }

    showIconSelector(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        // Remover seletores existentes
        const existingSelectors = document.querySelectorAll('.icon-selector');
        existingSelectors.forEach(selector => selector.remove());

        const selector = document.createElement('div');
        selector.className = 'icon-selector';
        
        const predefinedIcons = [
            '📄', '📝', '📖', '📚', '📓', '📔', '📒', '📃', '📋', '📌',
            '💡', '💭', '💬', '💼', '🎯', '🎨', '🎭', '🎪', '🎟️', '🎫',
            '📱', '💻', '🖥️', '⌨️', '🖱️', '📷', '🎥', '📺', '📻', '🎵',
            '🏠', '🏢', '🏭', '🏪', '🏫', '🏥', '🏦', '🏧', '🏨', '🏩',
            '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🌋', '🗻', '🏔️', '⛰️',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '⭐', '🌟', '✨', '⚡', '💫', '🌈', '☀️', '🌤️', '⛅', '🌥️'
        ];

        selector.innerHTML = `
            <div class="icon-selector-header">
                <h3>Escolher ícone</h3>
                <button class="close-icon-selector">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="icon-grid">
                ${predefinedIcons.map(icon => `
                    <button class="icon-option" data-icon="${icon}">
                        ${icon}
                    </button>
                `).join('')}
            </div>
            <div class="icon-selector-footer">
                <button class="emoji-picker-btn">
                    <i class="fas fa-smile"></i>
                    Escolher emoji
                </button>
            </div>
        `;

        // Posicionar o seletor próximo ao ícone com verificação de limites da tela
        const pageItem = document.querySelector(`[data-page-id="${pageId}"]`);
        if (pageItem) {
            const iconContainer = pageItem.querySelector('.page-icon-container');
            const rect = iconContainer.getBoundingClientRect();
            
            // Dimensões do seletor (aproximadas)
            const selectorWidth = 400;
            const selectorHeight = 450;
            
            // Calcular posição inicial
            let left = rect.left - (selectorWidth / 2) + (rect.width / 2);
            let top = rect.bottom + 5;
            
            // Verificar se vai sair da tela pela direita
            if (left + selectorWidth > window.innerWidth) {
                left = window.innerWidth - selectorWidth - 10;
            }
            
            // Verificar se vai sair da tela pela esquerda
            if (left < 10) {
                left = 10;
            }
            
            // Verificar se vai sair da tela por baixo
            if (top + selectorHeight > window.innerHeight) {
                // Posicionar acima do ícone
                top = rect.top - selectorHeight - 5;
            }
            
            // Verificar se vai sair da tela por cima
            if (top < 10) {
                top = 10;
            }
            
            selector.style.position = 'fixed';
            selector.style.top = `${top}px`;
            selector.style.left = `${left}px`;
            selector.style.zIndex = '1000';
        }

        // Event listeners
        selector.addEventListener('click', (e) => {
            if (e.target.classList.contains('icon-option')) {
                const selectedIcon = e.target.dataset.icon;
                this.changePageIcon(pageId, selectedIcon);
                selector.remove();
            }
            
            if (e.target.closest('.close-icon-selector')) {
                selector.remove();
            }
            
            if (e.target.closest('.emoji-picker-btn')) {
                this.showEmojiPicker(pageId);
                selector.remove();
            }
        });

        // Fechar ao clicar fora
        const closeSelector = (e) => {
            if (!selector.contains(e.target) && !e.target.closest('.page-menu-btn')) {
                selector.remove();
                document.removeEventListener('click', closeSelector);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeSelector);
        }, 0);

        document.body.appendChild(selector);
    }

    showEmojiPicker(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        // Criar input para emoji
        const emojiInput = document.createElement('input');
        emojiInput.type = 'text';
        emojiInput.placeholder = 'Digite ou cole um emoji...';
        emojiInput.className = 'emoji-input';
        emojiInput.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1001;
            padding: 12px 16px;
            border: 2px solid #3a3a3a;
            border-radius: 8px;
            background: #111111;
            color: #ffffff;
            font-size: 16px;
            outline: none;
            min-width: 200px;
        `;

        document.body.appendChild(emojiInput);
        emojiInput.focus();

        const handleEmojiInput = () => {
            const emoji = emojiInput.value.trim();
            if (emoji) {
                this.changePageIcon(pageId, emoji);
            }
            emojiInput.remove();
        };

        emojiInput.addEventListener('blur', handleEmojiInput);
        emojiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleEmojiInput();
            }
        });
        emojiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                emojiInput.remove();
            }
        });
    }

    changePageIcon(pageId, icon) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        page.icon = icon;
        page.updatedAt = new Date().toISOString();
        this.savePages();
        this.renderPages();
    }

    editPageTitleAndIcon() {
        const currentTitle = document.getElementById('currentPageTitle');
        const currentText = currentTitle.textContent;
        const page = this.pages.find(p => p.id === this.currentPageId);
        if (!page) return;

        // Criar container para título e ícone
        const container = document.createElement('div');
        container.className = 'title-icon-edit-container';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            max-width: 500px;
        `;

        // Input para o título
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

        // Botão para selecionar ícone
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

        // Substituir o título pelo container
        currentTitle.style.display = 'none';
        currentTitle.parentNode.insertBefore(container, currentTitle);
        container.appendChild(titleInput);
        container.appendChild(iconBtn);

        titleInput.focus();
        titleInput.select();

        // Event listener para o botão de ícone
        iconBtn.addEventListener('click', () => {
            this.showIconSelectorForNewPage();
        });

        // Salvar título em tempo real
        titleInput.addEventListener('input', () => {
            const newTitle = titleInput.value.trim();
            if (page) {
                page.title = newTitle || 'Página sem título';
                page.updatedAt = new Date().toISOString();
                this.savePages();
                this.renderPages();
            }
        });

        // Atualizar ícone no botão quando mudar
        const updateIconBtn = () => {
            iconBtn.innerHTML = page.icon || '📄';
        };

        // Sobrescrever o método changePageIcon temporariamente
        const originalChangePageIcon = this.changePageIcon;
        this.changePageIcon = (pageId, icon) => {
            originalChangePageIcon.call(this, pageId, icon);
            if (pageId === this.currentPageId) {
                updateIconBtn();
            }
        };

        const finishEditing = () => {
            const newTitle = titleInput.value.trim();
            currentTitle.textContent = newTitle || 'Página sem título';
            currentTitle.style.display = 'block';
            container.remove();
            
            // Restaurar método original
            this.changePageIcon = originalChangePageIcon;
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
                this.changePageIcon = originalChangePageIcon;
            }
        });
    }

    showIconSelectorForNewPage() {
        const page = this.pages.find(p => p.id === this.currentPageId);
        if (!page) return;

        // Remover seletores existentes
        const existingSelectors = document.querySelectorAll('.icon-selector');
        existingSelectors.forEach(selector => selector.remove());

        const selector = document.createElement('div');
        selector.className = 'icon-selector';
        
        const predefinedIcons = [
            '📄', '📝', '📖', '📚', '📓', '📔', '📒', '📃', '📋', '📌',
            '💡', '💭', '💬', '💼', '🎯', '🎨', '🎭', '🎪', '🎟️', '🎫',
            '📱', '💻', '🖥️', '⌨️', '🖱️', '📷', '🎥', '📺', '📻', '🎵',
            '🏠', '🏢', '🏭', '🏪', '🏫', '🏥', '🏦', '🏧', '🏨', '🏩',
            '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🌋', '🗻', '🏔️', '⛰️',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '⭐', '🌟', '✨', '⚡', '💫', '🌈', '☀️', '🌤️', '⛅', '🌥️'
        ];

        selector.innerHTML = `
            <div class="icon-selector-header">
                <h3>Escolher ícone</h3>
                <button class="close-icon-selector">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="icon-grid">
                ${predefinedIcons.map(icon => `
                    <button class="icon-option" data-icon="${icon}">
                        ${icon}
                    </button>
                `).join('')}
            </div>
            <div class="icon-selector-footer">
                <button class="emoji-picker-btn">
                    <i class="fas fa-smile"></i>
                    Escolher emoji
                </button>
            </div>
        `;

        // Posicionar o seletor no centro da tela
        selector.style.position = 'fixed';
        selector.style.top = '50%';
        selector.style.left = '50%';
        selector.style.transform = 'translate(-50%, -50%)';
        selector.style.zIndex = '1000';

        // Event listeners
        selector.addEventListener('click', (e) => {
            if (e.target.classList.contains('icon-option')) {
                const selectedIcon = e.target.dataset.icon;
                this.changePageIcon(this.currentPageId, selectedIcon);
                selector.remove();
            }
            
            if (e.target.closest('.close-icon-selector')) {
                selector.remove();
            }
            
            if (e.target.closest('.emoji-picker-btn')) {
                this.showEmojiPicker(this.currentPageId);
                selector.remove();
            }
        });

        // Fechar ao clicar fora
        const closeSelector = (e) => {
            if (!selector.contains(e.target) && !e.target.closest('.icon-select-btn')) {
                selector.remove();
                document.removeEventListener('click', closeSelector);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeSelector);
        }, 0);

        document.body.appendChild(selector);
    }

    duplicatePage(pageId) {
        const originalPage = this.pages.find(p => p.id === pageId);
        if (!originalPage) return;

        const duplicatedPage = {
            id: this.generateId(),
            title: `${originalPage.title} (cópia)`,
            content: originalPage.content,
            icon: originalPage.icon,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.pages.push(duplicatedPage);
        this.savePages();
        this.renderPages();
        this.switchToPage(duplicatedPage.id);
    }

    moveToTrash(pageId) {
        if (this.pages.length <= 1) {
            alert('Não é possível mover a última página para a lixeira.');
            return;
        }

        const pageIndex = this.pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = this.pages[pageIndex];
        page.movedToTrashAt = new Date().toISOString();
        
        // Mover para lixeira
        this.trash.push(page);
        this.pages.splice(pageIndex, 1);
        this.savePages();

        if (this.currentPageId === pageId) {
            // Se a página movida era a atual, navegar para a próxima
            const nextPage = this.pages[Math.min(pageIndex, this.pages.length - 1)];
            this.switchToPage(nextPage.id);
        } else {
            this.renderPages();
        }
        this.renderTrash();
    }

    renderTrash() {
        const trashList = document.getElementById('trashList');
        const emptyTrashBtn = document.getElementById('emptyTrashBtn');
        const trashCount = document.getElementById('trashCount');
        
        trashList.innerHTML = '';
        
        if (this.trash.length === 0) {
            emptyTrashBtn.style.display = 'none';
            trashCount.style.display = 'none';
            trashList.style.display = 'none';
            return;
        }
        
        emptyTrashBtn.style.display = 'flex';
        trashCount.style.display = 'inline';
        trashCount.textContent = `(${this.trash.length})`;
        trashList.style.display = 'block';

        console.log('Renderizando lixeira com', this.trash.length, 'itens');

        this.trash.forEach(item => {
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

            // Event listener para o menu de opções
            const menuBtn = trashItem.querySelector('.page-menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Menu da lixeira clicado para item:', item.id);
                    this.showTrashItemMenu(item.id, menuBtn);
                });
            }

            trashList.appendChild(trashItem);
        });
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

    showTrashItemMenu(itemId, button) {
        console.log('Mostrando menu da lixeira para item:', itemId);
        
        // Remover menus existentes
        const existingMenus = document.querySelectorAll('.page-menu');
        existingMenus.forEach(menu => menu.remove());

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

        // Posicionar o menu com verificação de limites da tela
        const buttonRect = button.getBoundingClientRect();
        const menuWidth = 150; // Largura aproximada do menu
        const menuHeight = 80; // Altura aproximada do menu
        
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

        // Event listeners para as opções do menu
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            if (!action) return;

            switch (action) {
                case 'restore':
                    this.restoreFromTrash(itemId);
                    break;
                case 'deletePermanently':
                    this.deletePermanently(itemId);
                    break;
            }
            menu.remove();
        });

        // Fechar menu ao clicar fora
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);

        document.body.appendChild(menu);
    }

    restoreFromTrash(itemId) {
        const itemIndex = this.trash.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        const item = this.trash[itemIndex];
        delete item.movedToTrashAt;
        
        this.pages.push(item);
        this.trash.splice(itemIndex, 1);
        this.savePages();
        
        this.renderPages();
        this.renderTrash();
    }

    deletePermanently(itemId) {
        if (!confirm('Tem certeza que deseja excluir permanentemente esta página? Esta ação não pode ser desfeita.')) {
            return;
        }

        const itemIndex = this.trash.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        this.trash.splice(itemIndex, 1);
        this.savePages();
        this.renderTrash();
    }

    emptyTrash() {
        if (this.trash.length === 0) return;

        if (!confirm(`Tem certeza que deseja esvaziar a lixeira? ${this.trash.length} item(s) serão excluídos permanentemente.`)) {
            return;
        }

        this.trash = [];
        this.savePages();
        this.renderTrash();
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    new OrdnaApp();
}); 