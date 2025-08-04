export class ContextMenu {
    constructor() {
        this.menu = null;
        this.currentLine = null;
        this.isVisible = false;
        this.createContextMenu();
        this.setupEventListeners();
    }

    createContextMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.innerHTML = `
            <div class="context-menu-section">
                <div class="context-menu-title">Indentação</div>
                <div class="context-menu-item" data-action="indent">
                    <i class="fas fa-indent"></i>
                    <span>Aumentar Indentação</span>
                </div>
                <div class="context-menu-item" data-action="outdent">
                    <i class="fas fa-outdent"></i>
                    <span>Diminuir Indentação</span>
                </div>
            </div>
                         <div class="context-menu-section">
                 <div class="context-menu-title">Títulos</div>
                 <div class="context-menu-item" data-action="h1">
                     <i class="fas fa-heading"></i>
                     <span>Título 1</span>
                 </div>
                 <div class="context-menu-item" data-action="h2">
                     <i class="fas fa-heading"></i>
                     <span>Título 2</span>
                 </div>
                 <div class="context-menu-item" data-action="h3">
                     <i class="fas fa-heading"></i>
                     <span>Título 3</span>
                 </div>
                 <div class="context-menu-item" data-action="h4">
                     <i class="fas fa-heading"></i>
                     <span>Título 4</span>
                 </div>
             </div>
            <div class="context-menu-section">
                <div class="context-menu-title">Texto</div>
                <div class="context-menu-item" data-action="paragraph">
                    <i class="fas fa-paragraph"></i>
                    <span>Parágrafo</span>
                </div>
                <div class="context-menu-item" data-action="list">
                    <i class="fas fa-list"></i>
                    <span>Lista</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.menu);
        this.setupMenuEventListeners();
    }

    setupMenuEventListeners() {
        this.menu.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.context-menu-item');
            if (menuItem) {
                const action = menuItem.dataset.action;
                this.handleMenuAction(action);
                this.hide();
            }
        });

        // Esconder menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('#editor')) {
                this.hide();
            }
        });
    }

    setupEventListeners() {
        const editor = document.getElementById('editor');
        
        // Evento de clique em linha para mostrar menu de 6 pontinhos
        editor.addEventListener('click', (e) => {
            const line = this.getLineElement(e.target);
            if (line) {
                // Verificar se clicou no botão de menu
                if (e.target.closest('.line-menu-btn')) {
                    return; // Não fazer nada se clicou no próprio botão
                }
                
                // Esconder menu anterior se clicou em linha diferente
                if (this.currentLine && this.currentLine !== line) {
                    this.hideMenuButton();
                }
                
                this.currentLine = line;
                this.showMenuButton(line, e);
            }
        });

        // Esconder menu quando há seleção de texto
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                this.hideMenuButton();
            }
        });

        // Esconder menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.line-menu-btn') && !e.target.closest('.context-menu') && !e.target.closest('#editor')) {
                this.hideMenuButton();
            }
        });
    }

    getLineElement(element) {
        // Encontrar o elemento de linha (p, h1, h2, etc.) mais próximo
        let current = element;
        while (current && current !== document.getElementById('editor')) {
            if (current.tagName && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI'].includes(current.tagName)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    showMenuButton(line, event) {
        if (!line) return;

        // Remover TODOS os botões de menu existentes primeiro
        const existingButtons = document.querySelectorAll('.line-menu-btn');
        existingButtons.forEach(btn => btn.remove());

        // Criar botão de menu de 6 pontinhos
        const menuBtn = document.createElement('button');
        menuBtn.className = 'line-menu-btn';
        menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        menuBtn.style.cssText = `
            position: absolute;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 4px;
            color: #888;
            cursor: pointer;
            padding: 4px 6px;
            font-size: 12px;
            z-index: 999;
            transition: all 0.2s ease;
            opacity: 0;
        `;

        // Posicionar botão à esquerda da linha
        const rect = line.getBoundingClientRect();
        const editorRect = document.getElementById('editor').getBoundingClientRect();
        
        menuBtn.style.left = `${rect.left - 35}px`;
        menuBtn.style.top = `${rect.top + (rect.height / 2) - 12}px`;

        // Adicionar ao editor
        document.getElementById('editor').appendChild(menuBtn);

        // Mostrar botão com animação
        setTimeout(() => {
            menuBtn.style.opacity = '1';
        }, 10);

        // Event listener para o botão
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showContextMenu(line, e);
        });

        // Hover effects
        menuBtn.addEventListener('mouseenter', () => {
            menuBtn.style.background = '#2a2a2a';
            menuBtn.style.color = '#ffffff';
            menuBtn.style.borderColor = '#3a3a3a';
        });

        menuBtn.addEventListener('mouseleave', () => {
            menuBtn.style.background = '#1a1a1a';
            menuBtn.style.color = '#888';
            menuBtn.style.borderColor = '#2a2a2a';
        });

        this.currentMenuBtn = menuBtn;
    }

    hideMenuButton() {
        if (this.currentMenuBtn) {
            this.currentMenuBtn.remove();
            this.currentMenuBtn = null;
        }
        this.currentLine = null;
        this.hide();
    }

    showContextMenu(line, event) {
        if (!line) return;

        const rect = line.getBoundingClientRect();
        const editorRect = document.getElementById('editor').getBoundingClientRect();
        
        // Posicionar menu à esquerda da linha
        const menuX = rect.left - 220; // 220px é a largura do menu
        const menuY = rect.top + (rect.height / 2) - 50;
        
        this.menu.style.left = `${menuX}px`;
        this.menu.style.top = `${menuY}px`;
        this.menu.style.display = 'block';
        this.isVisible = true;
    }

    hide() {
        if (this.menu) {
            this.menu.style.display = 'none';
            this.isVisible = false;
        }
    }

    handleMenuAction(action) {
        if (!this.currentLine) return;

        const editor = document.getElementById('editor');
        editor.focus();

        console.log('Aplicando ação:', action, 'para elemento:', this.currentLine);

                 switch (action) {
             case 'indent':
                 this.applyIndentation('increase');
                 break;
             case 'outdent':
                 this.applyIndentation('decrease');
                 break;
             case 'h1':
             case 'h2':
             case 'h3':
             case 'h4':
                 this.applyHeading(action);
                 break;
             case 'paragraph':
                 this.applyParagraph();
                 break;
             case 'list':
                 this.applyList();
                 break;
         }
    }

    applyIndentation(type) {
        const currentIndent = parseInt(this.currentLine.style.marginLeft) || 0;
        const indentStep = 20;
        
        if (type === 'increase') {
            this.currentLine.style.marginLeft = `${currentIndent + indentStep}px`;
        } else {
            this.currentLine.style.marginLeft = `${Math.max(0, currentIndent - indentStep)}px`;
        }
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyHeading(level) {
        console.log('Aplicando heading:', level);
        
        const newElement = document.createElement(level);
        newElement.innerHTML = this.currentLine.innerHTML;
        
        // Manter apenas a indentação, remover outros estilos inline que possam interferir
        newElement.style.marginLeft = this.currentLine.style.marginLeft;
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        
        // NÃO limpar fontSize, fontWeight, color - deixar o CSS aplicar
        // newElement.style.fontSize = '';
        // newElement.style.fontWeight = '';
        // newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Forçar reflow para aplicar os estilos CSS
        newElement.offsetHeight;
        
        console.log('Elemento criado:', newElement.tagName, 'com conteúdo:', newElement.innerHTML);
        console.log('Estilos aplicados:', window.getComputedStyle(newElement).fontSize, window.getComputedStyle(newElement).fontWeight);
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyParagraph() {
        const newElement = document.createElement('p');
        newElement.innerHTML = this.currentLine.innerHTML;
        
        // Manter apenas a indentação, remover outros estilos inline que possam interferir
        newElement.style.marginLeft = this.currentLine.style.marginLeft;
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        
        // NÃO limpar fontSize, fontWeight, color - deixar o CSS aplicar
        // newElement.style.fontSize = '';
        // newElement.style.fontWeight = '';
        // newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyList() {
        // Verificar se já é uma lista
        if (this.currentLine.tagName === 'LI') {
            return;
        }

        // Criar lista se não existir
        let listContainer = this.currentLine.previousElementSibling;
        if (!listContainer || !['UL', 'OL'].includes(listContainer.tagName)) {
            listContainer = document.createElement('ul');
            this.currentLine.parentNode.insertBefore(listContainer, this.currentLine);
        }

        // Criar item da lista
        const listItem = document.createElement('li');
        listItem.innerHTML = this.currentLine.innerHTML;
        listItem.className = this.currentLine.className;
        listItem.style.marginLeft = this.currentLine.style.marginLeft;
        
        listContainer.appendChild(listItem);
        this.currentLine.remove();
        this.currentLine = listItem;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }
} 