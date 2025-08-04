# Ordna - Aplicação Modular

## Estrutura do Projeto

```
Ordna/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── js/
│   ├── main.js             # Ponto de entrada da aplicação
│   └── modules/
│       ├── App.js          # Classe principal que coordena os módulos
│       ├── StorageManager.js # Gerenciamento de localStorage
│       ├── PageManager.js  # Lógica de negócio das páginas
│       ├── TrashManager.js # Lógica de negócio da lixeira
│       ├── UIManager.js    # Gerenciamento da interface do usuário
│       ├── MenuManager.js  # Gerenciamento de menus contextuais
│       └── IconSelector.js # Seleção de ícones e emojis
└── script.js               # Versão antiga (monolítica)
```

## Módulos

### 1. App.js
- **Responsabilidade**: Coordenação entre todos os módulos
- **Dependências**: Todos os outros módulos
- **Função**: Inicialização e orquestração da aplicação

### 2. StorageManager.js
- **Responsabilidade**: Persistência de dados
- **Dependências**: Nenhuma
- **Função**: Gerenciar localStorage para páginas e lixeira

### 3. PageManager.js
- **Responsabilidade**: Lógica de negócio das páginas
- **Dependências**: StorageManager
- **Função**: CRUD de páginas, filtros, operações de negócio

### 4. TrashManager.js
- **Responsabilidade**: Lógica de negócio da lixeira
- **Dependências**: StorageManager
- **Função**: CRUD da lixeira, restauração, exclusão permanente

### 5. UIManager.js
- **Responsabilidade**: Interface do usuário
- **Dependências**: PageManager, TrashManager, MenuManager, IconSelector
- **Função**: Renderização, eventos, navegação, edição

### 6. MenuManager.js
- **Responsabilidade**: Menus contextuais
- **Dependências**: Nenhuma
- **Função**: Criação, posicionamento e gerenciamento de menus

### 7. IconSelector.js
- **Responsabilidade**: Seleção de ícones
- **Dependências**: Nenhuma
- **Função**: Interface de seleção de ícones e emojis

## Benefícios da Modularização

### ✅ **Separação de Responsabilidades**
- Cada módulo tem uma responsabilidade específica
- Código mais organizado e fácil de entender

### ✅ **Manutenibilidade**
- Mudanças em um módulo não afetam outros
- Debugging mais fácil e isolado

### ✅ **Reutilização**
- Módulos podem ser reutilizados em outras partes
- Testes unitários mais fáceis de implementar

### ✅ **Escalabilidade**
- Fácil adicionar novos recursos
- Estrutura preparada para crescimento

### ✅ **Colaboração**
- Múltiplos desenvolvedores podem trabalhar em módulos diferentes
- Menos conflitos de merge

## Como Usar

1. **Desenvolvimento**: Use a versão modular (`js/main.js`)
2. **Produção**: Mantenha a versão monolítica (`script.js`) como fallback

## Migração

A versão modular mantém 100% de compatibilidade com a versão anterior. Todos os recursos funcionam exatamente da mesma forma.

## Próximos Passos

- [ ] Adicionar testes unitários para cada módulo
- [ ] Implementar sistema de plugins
- [ ] Adicionar validação de dados
- [ ] Implementar cache de ícones
- [ ] Adicionar sistema de temas 