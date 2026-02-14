
class CodeBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.codeSnippet = this.getCodeSnippet();
        this.charIndex = 0;
        this.cursorBlink = true;
        this.resizeTimeout = null;

        this.init();
    }

    init() {
        // Configuração do Canvas
        this.canvas.id = 'bg-code-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.3'; // Opacidade ajustada para ser um pouco mais visível
        document.body.prepend(this.canvas);

        this.resize();
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.resize(), 100);
        });

        // Loop de animação
        this.animateCursor();
        
        // Iniciar digitação automática
        this.typeWriter();
    }

    typeWriter() {
        // Velocidade de digitação (ms)
        const minSpeed = 30; // Mais lento
        const maxSpeed = 100; // Mais lento
        
        // Caracteres por frame
        const charsPerFrame = 1;

        if (this.charIndex < this.codeSnippet.length) {
            this.charIndex += charsPerFrame;
            this.draw();

            // Delay aleatório para parecer humano
            const randomDelay = Math.random() * (maxSpeed - minSpeed) + minSpeed;
            
            const currentChar = this.codeSnippet[this.charIndex];
            let delay = randomDelay;
            
            // Pausas naturais
            if (currentChar === '\n') delay += 300;
            if (currentChar === ';' || currentChar === '}') delay += 150;

            setTimeout(() => this.typeWriter(), delay);
        } else {
            // Reiniciar após pausa longa
            setTimeout(() => {
                this.charIndex = 0;
                this.typeWriter();
            }, 8000);
        }
    }

    // Removido listener de scroll para updateCodeVisibility, pois agora é automático
    // updateCodeVisibility() removido

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.fontSize = Math.max(14, window.innerWidth / 100); // Responsivo
        this.ctx.font = `${this.fontSize}px 'Fira Code', monospace`;
        this.lineHeight = this.fontSize * 1.5;
        this.maxLines = Math.floor(this.canvas.height / this.lineHeight);
        // Não chamamos mais updateCodeVisibility, apenas draw se houver algo
        if (this.charIndex > 0) this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fundo escuro leve (opcional, já que o site tem fundo)
        // this.ctx.fillStyle = '#050505';
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let currentX = 20;
        let currentY = 40;
        let visibleText = this.codeSnippet.substring(0, this.charIndex);
        
        // Simular "rolagem" do terminal se o texto for muito longo
        // Contar linhas
        const lines = visibleText.split('\n');
        
        // Se exceder a altura da tela, cortar linhas do topo
        // Mantendo sempre o cursor visível na parte inferior ou meio
        let startIndex = 0;
        if (lines.length > this.maxLines - 2) {
            startIndex = lines.length - (this.maxLines - 2);
        }
        
        const visibleLines = lines.slice(startIndex);

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        visibleLines.forEach((line, index) => {
            // Syntax Highlighting Simples
            this.drawHighlightedLine(line, 20, currentY + (index * this.lineHeight), isLight);
        });

        // Desenhar Cursor
        if (this.cursorBlink) {
            const lastLine = visibleLines[visibleLines.length - 1] || '';
            const lastLineWidth = this.ctx.measureText(lastLine).width;
            const cursorY = currentY + ((visibleLines.length - 1) * this.lineHeight);
            
            // Se for nova linha (linha vazia ou array vazio)
            let finalX = 20 + lastLineWidth;
            let finalY = cursorY > 0 ? cursorY : currentY;
            
            if (visibleLines.length === 0) {
                finalX = 20;
                finalY = currentY;
            }

            this.ctx.fillStyle = isLight ? '#1565c0' : '#00ff88';
            this.ctx.fillRect(finalX + 2, finalY - this.fontSize + 4, 10, this.fontSize);
        }
    }

    drawHighlightedLine(text, x, y, isLight) {
        // Regex simples para keywords
        const keywords = ['const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'async', 'await', 'new', 'this', 'super'];
        const types = ['String', 'Number', 'Boolean', 'Object', 'Array', 'Promise', 'void', 'any'];
        const strings = /(['"`])(.*?)\1/g;
        const comments = /\/\/.*/g;
        
        // Tokenização básica (muito simplificada para performance)
        // Vamos desenhar palavra por palavra
        
        const words = text.split(/(\s+|[{}()[\],.;])/);
        let currentX = x;

        words.forEach(word => {
            if (!word) return;

            this.ctx.font = `${this.fontSize}px 'Fira Code', monospace`;
            
            if (keywords.includes(word)) {
                this.ctx.fillStyle = isLight ? '#6a1b9a' : '#ff79c6';
            } else if (types.includes(word)) {
                this.ctx.fillStyle = isLight ? '#1565c0' : '#8be9fd';
            } else if (word.match(/^[A-Z]/)) {
                this.ctx.fillStyle = isLight ? '#9c6f00' : '#f1fa8c';
            } else if (word.match(/^\d+$/)) {
                this.ctx.fillStyle = isLight ? '#512da8' : '#bd93f9';
            } else if (word.startsWith('"') || word.startsWith("'") || word.startsWith('`')) {
                 this.ctx.fillStyle = isLight ? '#8e5a00' : '#f1fa8c';
            } else if (word.startsWith('//')) {
                this.ctx.fillStyle = isLight ? '#455a64' : '#6272a4';
            } else {
                this.ctx.fillStyle = isLight ? 'rgba(20, 20, 40, 0.75)' : 'rgba(255, 255, 255, 0.6)';
            }

            // Correção para strings quebradas pelo split (não perfeito, mas serve para bg)
            // Idealmente faria um parser real, mas para animação de fundo é overkill.
            
            this.ctx.fillText(word, currentX, y);
            currentX += this.ctx.measureText(word).width;
        });
    }

    animateCursor() {
        setInterval(() => {
            this.cursorBlink = !this.cursorBlink;
            this.draw(); // Redesenhar apenas para piscar cursor
        }, 500);
    }

    getCodeSnippet() {
        return `
/* 
 * @WagmePessoaDe SYSTEM INITIALIZATION 
 * Loading core modules...
 */

import { Future } from '@WagnerPessoaDev/time';
import { Innovation } from '@WagnerPessoaDev/core';
import { Design } from '@WagnerPessoaDev/ui';

class DigitalExperience extends Innovation {
    constructor() {
        super();
        this.version = '2.0.0';
        this.status = 'READY';
    }

    async initialize() {
        console.log('Starting @WagnerPessoaDev engines...');
        
        // Carregando interface neural
        const ui = await Design.loadSystem({
            theme: 'dark_glass',
            animations: 'fluid',
            responsiveness: 'adaptive'
        });

        // Conectando ao futuro
        const connection = await Future.connect();
        
        if (connection.isStable()) {
            this.renderHero();
            this.startMagic();
        }
    }

    renderHero() {
        const hero = new HeroSection({
            title: 'Transformamos Ideias',
            subtitle: 'Realidade Digital',
            cta: 'Start Project'
        });
        
        return hero.mount('#app');
    }

    /*
     * Nossos Serviços
     * Otimizados para performance máxima
     */
    
    getServices() {
        return [
            {
                id: 'web',
                name: 'Desenvolvimento Web',
                tech: ['React', 'Next.js', 'Node'],
                features: ['SEO', 'PWA', 'Speed']
            },
            {
                id: 'mobile',
                name: 'Apps Mobile',
                tech: ['Flutter', 'Native', 'Swift'],
                platform: 'iOS & Android'
            },
            {
                id: 'ecommerce',
                name: 'Lojas Virtuais',
                integration: ['Stripe', 'PayPal', 'Pix'],
                security: 'High'
            }
        ];
    }

    // Processamento de Dados em Tempo Real
    async processData(input) {
        const ai = new AIProcessor();
        const result = await ai.analyze(input);
        
        return result.optimize();
    }

    /*
     * Contato
     * Estamos prontos para atender
     */
     
    sendMessage(msg) {
        const mailer = new SecureMail();
        return mailer.send({
            to: 'contact WagnerPessoa.me',
            body: msg,
            priority: 'HIGH'
        });
    }
    
    // Finalizing system...
    // System ready.
    // Waiting for user input...
    
    /* 
     * Role para baixo para ver mais...
     * Explorando o código fonte...
     */
    
    optimizePerformance() {
        return true;
    }
    
    generateSuccess() {
        while(true) {
            this.grow();
            this.innovate();
        }
    }
`;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new CodeBackground();
});