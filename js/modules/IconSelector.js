export class IconSelector {
    constructor() {
        this.onIconSelected = null;
        this.predefinedIcons = [
            '📄', '📝', '📖', '📚', '📓', '📔', '📒', '📃', '📋', '📌',
            '💡', '💭', '💬', '💼', '🎯', '🎨', '🎭', '🎪', '🎟️', '🎫',
            '📱', '💻', '🖥️', '⌨️', '🖱️', '📷', '🎥', '📺', '📻', '🎵',
            '🏠', '🏢', '🏭', '🏪', '🏫', '🏥', '🏦', '🏧', '🏨', '🏩',
            '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🌋', '🗻', '🏔️', '⛰️',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '⭐', '🌟', '✨', '⚡', '💫', '🌈', '☀️', '🌤️', '⛅', '🌥️'
        ];
    }

    show(pageId, iconContainer) {
        this.closeActiveSelectors();

        const selector = this.createSelector();
        this.positionSelector(selector, iconContainer);
        this.setupSelectorEventListeners(selector, pageId);
        document.body.appendChild(selector);
    }

    showForNewPage(iconBtn) {
        this.closeActiveSelectors();

        const selector = this.createSelector();
        this.positionSelectorCentered(selector);
        this.setupSelectorEventListeners(selector, null, iconBtn);
        document.body.appendChild(selector);
    }

    createSelector() {
        const selector = document.createElement('div');
        selector.className = 'icon-selector';
        
        selector.innerHTML = `
            <div class="icon-selector-header">
                <h3>Escolher ícone</h3>
                <button class="close-icon-selector">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="icon-grid">
                ${this.predefinedIcons.map(icon => `
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

        return selector;
    }

    positionSelector(selector, iconContainer) {
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

    positionSelectorCentered(selector) {
        selector.style.position = 'fixed';
        selector.style.top = '50%';
        selector.style.left = '50%';
        selector.style.transform = 'translate(-50%, -50%)';
        selector.style.zIndex = '1000';
    }

    setupSelectorEventListeners(selector, pageId, iconBtn = null) {
        selector.addEventListener('click', (e) => {
            if (e.target.classList.contains('icon-option')) {
                const selectedIcon = e.target.dataset.icon;
                this.handleIconSelection(selectedIcon, pageId, iconBtn);
                selector.remove();
            }
            
            if (e.target.closest('.close-icon-selector')) {
                selector.remove();
            }
            
            if (e.target.closest('.emoji-picker-btn')) {
                this.showEmojiPicker(pageId, iconBtn);
                selector.remove();
            }
        });

        // Fechar ao clicar fora
        const closeSelector = (e) => {
            if (!selector.contains(e.target) && !e.target.closest('.page-menu-btn') && !e.target.closest('.icon-select-btn')) {
                selector.remove();
                document.removeEventListener('click', closeSelector);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeSelector);
        }, 0);
    }

    handleIconSelection(icon, pageId, iconBtn) {
        if (this.onIconSelected) {
            if (pageId) {
                this.onIconSelected(pageId, icon);
            } else if (iconBtn) {
                // Para nova página, atualizar o botão diretamente
                iconBtn.innerHTML = icon;
            }
        }
    }

    showEmojiPicker(pageId, iconBtn = null) {
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
                this.handleIconSelection(emoji, pageId, iconBtn);
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

    closeActiveSelectors() {
        const existingSelectors = document.querySelectorAll('.icon-selector');
        existingSelectors.forEach(selector => selector.remove());
    }
} 