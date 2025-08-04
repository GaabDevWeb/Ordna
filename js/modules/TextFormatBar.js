export class TextFormatBar {
    constructor() {
        this.formatBar = null;
        this.isVisible = false;
        this.createFormatBar();
    }

    createFormatBar() {
        this.formatBar = document.createElement('div');
        this.formatBar.className = 'text-format-bar';
        this.formatBar.innerHTML = `
            <button class="format-btn" data-format="bold" title="Negrito (Ctrl+B)">
                <i class="fas fa-bold"></i>
            </button>
            <button class="format-btn" data-format="italic" title="Itálico (Ctrl+I)">
                <i class="fas fa-italic"></i>
            </button>
            <button class="format-btn" data-format="underline" title="Sublinhado (Ctrl+U)">
                <i class="fas fa-underline"></i>
            </button>
            <button class="format-btn" data-format="strikethrough" title="Tachado">
                <i class="fas fa-strikethrough"></i>
            </button>
        `;

        this.setupEventListeners();
        document.body.appendChild(this.formatBar);
    }

    setupEventListeners() {
        this.formatBar.addEventListener('click', (e) => {
            if (e.target.closest('.format-btn')) {
                const formatBtn = e.target.closest('.format-btn');
                const format = formatBtn.dataset.format;
                this.applyFormat(format);
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.applyFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormat('underline');
                        break;
                }
            }
        });


    }

    show(x, y) {
        if (this.isVisible) return;

        this.formatBar.style.left = `${x}px`;
        this.formatBar.style.top = `${y}px`;
        this.formatBar.style.display = 'flex';
        this.isVisible = true;

        // Atualizar estado dos botões baseado na seleção atual
        this.updateButtonStates();
    }

    hide() {
        if (!this.isVisible) return;

        this.formatBar.style.display = 'none';
        this.isVisible = false;
    }

    updateButtonStates() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Verificar se a seleção está dentro do editor
        const editor = document.getElementById('editor');
        if (!editor.contains(container)) return;

        // Verificar estados atuais
        const isBold = this.isFormatActive('bold');
        const isItalic = this.isFormatActive('italic');
        const isUnderline = this.isFormatActive('underline');
        const isStrikethrough = this.isFormatActive('strikethrough');

        // Atualizar classes dos botões
        this.formatBar.querySelector('[data-format="bold"]').classList.toggle('active', isBold);
        this.formatBar.querySelector('[data-format="italic"]').classList.toggle('active', isItalic);
        this.formatBar.querySelector('[data-format="underline"]').classList.toggle('active', isUnderline);
        this.formatBar.querySelector('[data-format="strikethrough"]').classList.toggle('active', isStrikethrough);
    }

    isFormatActive(format) {
        return document.queryCommandState(format);
    }

    applyFormat(format) {
        console.log('Aplicando formatação:', format);
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            console.log('Nenhuma seleção encontrada');
            return;
        }

        // Focar no editor
        const editor = document.getElementById('editor');
        editor.focus();

        // Aplicar formatação
        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'strikethrough':
                document.execCommand('strikethrough', false, null);
                break;
        }

        console.log('Formatação aplicada');

        // Atualizar estados dos botões
        this.updateButtonStates();

        // Disparar evento de input para salvar
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    positionNearSelection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Verificar se a seleção tem tamanho
        if (rect.width === 0 || rect.height === 0) {
            return;
        }

        // Posicionar acima da seleção
        const x = rect.left + (rect.width / 2);
        const y = rect.top - 50; // 50px acima da seleção

        // Verificar se vai sair da tela
        const barWidth = 200; // Largura aproximada da barra
        const barHeight = 40; // Altura aproximada da barra

        let finalX = x - (barWidth / 2);
        let finalY = y;

        // Ajustar se sair pela esquerda
        if (finalX < 10) {
            finalX = 10;
        }

        // Ajustar se sair pela direita
        if (finalX + barWidth > window.innerWidth - 10) {
            finalX = window.innerWidth - barWidth - 10;
        }

        // Ajustar se sair por cima
        if (finalY < 10) {
            finalY = rect.bottom + 10; // Posicionar abaixo da seleção
        }

        this.show(finalX, finalY);
    }
} 