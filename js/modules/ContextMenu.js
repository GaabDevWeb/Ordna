export class ContextMenu {
    constructor() {
        this.menu = null;
        this.currentLine = null;
        this.editorLine = null; // Nova propriedade para armazenar a linha do editor
        this.isVisible = false;
        this.createContextMenu();
        this.setupEventListeners();
    }

    createContextMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.innerHTML = `
            <div class="context-menu-content">
                <div class="context-menu-section">
                    <div class="context-menu-title">Indentação</div>
                    <div class="context-menu-item" data-action="indent">
                        <i class="fas fa-indent"></i>
                        <span>Aumentar</span>
                    </div>
                    <div class="context-menu-item" data-action="outdent">
                        <i class="fas fa-outdent"></i>
                        <span>Diminuir</span>
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
                    <div class="context-menu-title">Listas</div>
                    <div class="context-menu-item" data-action="ul">
                        <i class="fas fa-list-ul"></i>
                        <span>Marcadores</span>
                    </div>
                    <div class="context-menu-item" data-action="ol">
                        <i class="fas fa-list-ol"></i>
                        <span>Numerada</span>
                    </div>
                    <div class="context-menu-item" data-action="todo">
                        <i class="fas fa-tasks"></i>
                        <span>Todo list</span>
                    </div>
                </div>
                <div class="context-menu-section">
                    <div class="context-menu-title">Elementos</div>
                    <div class="context-menu-item" data-action="quote">
                        <i class="fas fa-quote-left"></i>
                        <span>Citação</span>
                    </div>
                    <div class="context-menu-item" data-action="divider">
                        <i class="fas fa-minus"></i>
                        <span>Divisor</span>
                    </div>
                    <div class="context-menu-item" data-action="table">
                        <i class="fas fa-table"></i>
                        <span>Tabela</span>
                    </div>
                </div>
                <div class="context-menu-section">
                    <div class="context-menu-title">Texto</div>
                    <div class="context-menu-item" data-action="paragraph">
                        <i class="fas fa-paragraph"></i>
                        <span>Parágrafo</span>
                    </div>
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
                e.preventDefault();
                e.stopPropagation();
                
                const action = menuItem.dataset.action;
                console.log('Menu item clicado:', action);
                console.log('Linha do editor armazenada:', this.editorLine);
                
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
                
                this.currentLine = line;
                this.showMenuButton(line, e);
            }
        });

        // Evento para clicar nos checkboxes das todo lists
        editor.addEventListener('click', (e) => {
            if (e.target.classList.contains('todo-item') || e.target.closest('.todo-item')) {
                const todoItem = e.target.classList.contains('todo-item') ? e.target : e.target.closest('.todo-item');
                if (todoItem) {
                    todoItem.classList.toggle('completed');
                    // Disparar evento de input para salvar
                    document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
                }       
            }
        });

        // Detectar mudanças no cursor e navegação
        editor.addEventListener('keyup', (e) => {
            // Detectar quando o usuário navega com setas ou Enter
            if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                setTimeout(() => {
                    this.updateMenuButtonForCurrentLine();
                }, 10);
            }
        });

        // Detectar mudanças na seleção
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                this.hideMenuButton();
            } else {
                setTimeout(() => {
                    this.updateMenuButtonForCurrentLine();
                }, 10);
            }
        });

        // Eventos de mouse para mostrar/esconder botão
        editor.addEventListener('mouseover', (e) => {
            const line = this.getLineElement(e.target);
            if (line) {
                this.currentLine = line;
                this.showMenuButton(line, e);
            }
        });

        editor.addEventListener('mouseout', (e) => {
            // Só esconder se não estiver em uma linha vazia e o cursor não estiver nela
            const line = this.getLineElement(e.target);
            if (line && !this.isLineEmpty(line) && !this.isCursorInLine(line)) {
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

    updateMenuButtonForCurrentLine() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const line = this.getLineElement(range.startContainer);
        
        if (line) {
            this.currentLine = line;
            this.showMenuButton(line);
        }
    }

    isLineEmpty(line) {
        const text = line.textContent || line.innerText || '';
        return text.trim() === '';
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

        // Só mostrar o botão se a linha estiver vazia, se o mouse estiver sobre ela, ou se o cursor estiver nela
        const isEmpty = this.isLineEmpty(line);
        const isMouseOver = event && event.type === 'mouseover';
        const isCursorInLine = this.isCursorInLine(line);
        
        if (!isEmpty && !isMouseOver && !isCursorInLine) {
            return;
        }

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

        // Garantir que a linha é válida e está dentro do editor
        const editor = document.getElementById('editor');
        if (!editor.contains(line)) {
            console.log('Linha não está dentro do editor');
            return;
        }

        // Armazenar a linha do editor separadamente
        this.editorLine = line;
        this.currentLine = line;
        console.log('Menu de contexto aberto para linha:', line);
        console.log('Conteúdo da linha:', line.textContent);

        const rect = line.getBoundingClientRect();
        const editorRect = document.getElementById('editor').getBoundingClientRect();
        
        // Posicionar menu à esquerda da linha (ajustado para menu maior)
        const menuX = rect.left - 360; // 360px é a largura do menu
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
        // Limpar a linha do editor quando o menu é fechado
        this.editorLine = null;
    }

    handleMenuAction(action) {
        // Usar a linha do editor que foi armazenada quando o menu foi aberto
        const editor = document.getElementById('editor');
        let targetLine = this.editorLine;
        
        // Se não temos a linha do editor, tentar encontrar pelo cursor
        if (!targetLine) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                targetLine = this.getLineElement(range.startContainer);
            }
        }
        
        if (!targetLine) {
            console.log('Não foi possível encontrar uma linha válida');
            return;
        }
        
        // Verificar se a linha é realmente do editor
        if (!editor.contains(targetLine)) {
            console.log('Linha não está dentro do editor');
            return;
        }
        
        // Definir a linha atual
        this.currentLine = targetLine;
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
            case 'ul':
                this.applyList('ul');
                break;
            case 'ol':
                this.applyList('ol');
                break;
            case 'todo':
                this.applyTodoList();
                break;
            case 'quote':
                this.applyQuote();
                break;
            case 'divider':
                this.applyDivider();
                break;
            case 'table':
                this.applyTable();
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
        
        // Criar o novo elemento
        const newElement = document.createElement(level);
        
        // Copiar o conteúdo, mas apenas o texto, não elementos HTML
        const textContent = this.currentLine.textContent || this.currentLine.innerText || '';
        newElement.textContent = textContent;
        
        // Manter apenas a indentação
        newElement.style.marginLeft = this.currentLine.style.marginLeft || '';
        
        // Limpar outros estilos inline que possam interferir
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        newElement.style.fontSize = '';
        newElement.style.fontWeight = '';
        newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        // Substituir o elemento
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Forçar reflow para aplicar os estilos CSS
        newElement.offsetHeight;
        
        console.log('Elemento criado:', newElement.tagName, 'com conteúdo:', newElement.textContent);
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyParagraph() {
        const newElement = document.createElement('p');
        
        // Copiar o conteúdo, mas apenas o texto, não elementos HTML
        const textContent = this.currentLine.textContent || this.currentLine.innerText || '';
        newElement.textContent = textContent;
        
        // Manter apenas a indentação
        newElement.style.marginLeft = this.currentLine.style.marginLeft || '';
        
        // Limpar outros estilos inline que possam interferir
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        newElement.style.fontSize = '';
        newElement.style.fontWeight = '';
        newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        // Substituir o elemento
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyList(type) {
        // Verificar se já é uma lista
        if (this.currentLine.tagName === 'LI') {
            return;
        }

        // Criar lista se não existir
        let listContainer = this.currentLine.previousElementSibling;
        if (!listContainer || !['UL', 'OL'].includes(listContainer.tagName)) {
            listContainer = document.createElement(type);
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

    applyTodoList() {
        // Verificar se já é uma lista de tarefas
        if (this.currentLine.tagName === 'LI' && this.currentLine.classList.contains('todo-item')) {
            return;
        }

        // Criar lista de tarefas se não existir
        let todoListContainer = this.currentLine.previousElementSibling;
        if (!todoListContainer || !['UL'].includes(todoListContainer.tagName)) {
            todoListContainer = document.createElement('ul');
            todoListContainer.className = 'todo-list'; // Adicionar classe para identificação
            this.currentLine.parentNode.insertBefore(todoListContainer, this.currentLine);
        }

        // Criar item da lista de tarefas
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item'; // Adicionar classe para identificação
        todoItem.innerHTML = this.currentLine.innerHTML;
        todoItem.style.marginLeft = this.currentLine.style.marginLeft;
        
        todoListContainer.appendChild(todoItem);
        this.currentLine.remove();
        this.currentLine = todoItem;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyQuote() {
        const newElement = document.createElement('blockquote');
        
        // Copiar o conteúdo, mas apenas o texto, não elementos HTML
        const textContent = this.currentLine.textContent || this.currentLine.innerText || '';
        newElement.textContent = textContent;
        
        // Manter apenas a indentação
        newElement.style.marginLeft = this.currentLine.style.marginLeft || '';
        
        // Limpar outros estilos inline que possam interferir
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        newElement.style.fontSize = '';
        newElement.style.fontWeight = '';
        newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        // Substituir o elemento
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyDivider() {
        const newElement = document.createElement('hr');
        
        // Manter apenas a indentação
        newElement.style.marginLeft = this.currentLine.style.marginLeft || '';
        
        // Limpar outros estilos inline que possam interferir
        newElement.style.marginTop = '';
        newElement.style.marginBottom = '';
        newElement.style.marginRight = '';
        newElement.style.fontSize = '';
        newElement.style.fontWeight = '';
        newElement.style.color = '';
        
        // Remover classes que possam interferir
        newElement.className = '';
        
        // Substituir o elemento
        this.currentLine.parentNode.replaceChild(newElement, this.currentLine);
        this.currentLine = newElement;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    applyTable() {
        const tableElement = document.createElement('table');
        
        // Manter apenas a indentação
        tableElement.style.marginLeft = this.currentLine.style.marginLeft || '';
        
        // Limpar outros estilos inline que possam interferir
        tableElement.style.marginTop = '';
        tableElement.style.marginBottom = '';
        tableElement.style.marginRight = '';
        tableElement.style.fontSize = '';
        tableElement.style.fontWeight = '';
        tableElement.style.color = '';
        
        // Remover classes que possam interferir
        tableElement.className = '';
        
        // Criar estrutura da tabela
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Criar linha do cabeçalho
        const headerRow = document.createElement('tr');
        const header1 = document.createElement('th');
        const header2 = document.createElement('th');
        const header3 = document.createElement('th');
        
        header1.textContent = 'Coluna 1';
        header2.textContent = 'Coluna 2';
        header3.textContent = 'Coluna 3';
        
        headerRow.appendChild(header1);
        headerRow.appendChild(header2);
        headerRow.appendChild(header3);
        thead.appendChild(headerRow);
        
        // Criar linha de dados de exemplo
        const dataRow = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
        
        cell1.textContent = 'Dado 1';
        cell2.textContent = 'Dado 2';
        cell3.textContent = 'Dado 3';
        
        dataRow.appendChild(cell1);
        dataRow.appendChild(cell2);
        dataRow.appendChild(cell3);
        tbody.appendChild(dataRow);
        
        // Montar tabela
        tableElement.appendChild(thead);
        tableElement.appendChild(tbody);
        
        // Substituir o elemento
        this.currentLine.parentNode.replaceChild(tableElement, this.currentLine);
        this.currentLine = tableElement;
        
        // Disparar evento de input para salvar
        document.getElementById('editor').dispatchEvent(new Event('input', { bubbles: true }));
    }

    isCursorInLine(line) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;

        const range = selection.getRangeAt(0);
        const cursorContainer = range.startContainer;
        
        // Verificar se o cursor está dentro da linha
        return line.contains(cursorContainer) || line === cursorContainer;
    }
} 