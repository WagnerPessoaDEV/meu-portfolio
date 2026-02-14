
class SmoothScroll {
    constructor() {
        this.target = 0;
        this.current = 0;
        this.ease = 0.04; // Muito suave e lento (era 0.08)
        
        this.body = document.body;
        this.html = document.documentElement;
        
        // Verificar se é mobile (desativar em touch devices para scroll nativo)
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 992;
        
        if (!this.isMobile) {
            this.init();
        }
    }

    init() {
        // Obter wrapper existente
        this.scrollContainer = document.getElementById('smooth-wrapper');
        
        if (!this.scrollContainer) {
            console.error('Smooth Scroll: Wrapper #smooth-wrapper não encontrado.');
            return;
        }

        this.scrollContainer.classList.add('smooth-scroll-wrapper');
        
        // Estilos essenciais
        this.html.style.scrollBehavior = 'auto'; // Desativar scroll nativo
        Object.assign(this.scrollContainer.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 1 // Garantir que fique acima do background e abaixo de modais/header
        });
        
        // Altura "falsa" para o body permitir scroll nativo
        this.setHeight();
        
        // Listeners
        window.addEventListener('resize', () => this.setHeight());
        window.addEventListener('scroll', () => {
            if (!this.isScrollingToAnchor) {
                this.target = window.scrollY;
            }
        });
        
        // Interceptar cliques em links âncora
        this.initAnchorLinks();
        
        this.animate();
    }

    initAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Calcular posição real considerando o container virtual
                    // Como o container está transformado, getBoundingClientRect() retorna posição visual
                    // Precisamos somar o scroll atual para pegar a posição absoluta
                    const rect = targetElement.getBoundingClientRect();
                    const absoluteTop = rect.top + this.current;
                    
                    // Ajuste para header fixo (ex: 90px)
                    const headerOffset = 100;
                    const targetPosition = absoluteTop - headerOffset;
                    
                    // Iniciar scroll suave personalizado
                    this.smoothScrollTo(targetPosition, 2500); // 2.5s de duração (bem lento)
                }
            });
        });
    }

    smoothScrollTo(targetY, duration) {
        this.isScrollingToAnchor = true;
        const startY = this.current;
        const distance = targetY - startY;
        const startTime = performance.now();

        // Função de Easing (easeInOutQuint) para suavidade extrema
        // Começa muito lento, acelera no meio, e termina muito lento
        const easeInOutQuint = t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeInOutQuint(progress);

            // Atualizar variáveis de estado
            this.current = startY + (distance * ease);
            this.target = this.current; // Sincronizar target para evitar pulo ao fim
            
            // Sincronizar scroll nativo (para manter barra de rolagem correta)
            window.scrollTo(0, this.current);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrollingToAnchor = false;
            }
        };

        requestAnimationFrame(animateScroll);
    }

    setHeight() {
        // Restaurar altura real do container para medir
        this.scrollContainer.style.height = 'auto';
        const height = this.scrollContainer.getBoundingClientRect().height;
        document.body.style.height = `${height}px`;
        
        // Voltar para fixed
        this.scrollContainer.style.height = '100%';
    }

    animate() {
        // Se estiver em animação automática (âncora), pular lógica de inércia
        if (this.isScrollingToAnchor) {
            // Apenas aplicar a transformação baseada no valor atualizado pelo loop de animação
            this.current = Math.floor(this.current * 100) / 100;
            this.scrollContainer.style.transform = `translate3d(0, -${this.current}px, 0)`;
            requestAnimationFrame(() => this.animate());
            return;
        }

        // Interpolação Linear (LERP)
        this.current = this.lerp(this.current, this.target, this.ease);
        
        // Arredondar para performance e evitar jitter (sub-pixel)
        this.current = Math.floor(this.current * 100) / 100;
        
        // Aplicar transformação
        // Usar translate3d para aceleração de hardware
        this.scrollContainer.style.transform = `translate3d(0, -${this.current}px, 0)`;
        
        // Loop
        requestAnimationFrame(() => this.animate());
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new SmoothScroll();
});
