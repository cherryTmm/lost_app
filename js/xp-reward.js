/**
 * XP & Level-up Reward System
 */

class RewardSystem {
    constructor() {
        this.overlay = document.getElementById('reward-overlay');
        this.xpBar = document.getElementById('reward-xp-bar');
        this.xpText = document.getElementById('reward-xp-current');
        this.lvlText = document.getElementById('reward-lvl');
        this.levelUpBanner = document.getElementById('level-up-banner');
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.currentXP = 650;
        this.maxXP = 1000;
        this.currentLvl = 24;
        this.isAnimating = false;
        
        this.confetti = [];
        this.confettiColors = ['#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#E91E63', '#FFFFFF'];
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    trigger(gain = 25) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Reset overlay
        this.overlay.classList.add('active');
        this.levelUpBanner.classList.remove('active');
        
        // 1. Floating XP Animation (Handled by CSS triggered by adding 'active')
        
        // 2. Smooth XP Bar Fill
        const startXP = this.currentXP;
        this.currentXP += gain;
        
        let didLevelUp = false;
        if (this.currentXP >= this.maxXP) {
            didLevelUp = true;
        }

        this.animateBar(startXP, this.currentXP, didLevelUp);
    }

    animateBar(start, end, levelUp) {
        const duration = 1500;
        const startTime = performance.now();

        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const current = start + (end - start) * easeProgress;
            const displayXP = Math.min(current, this.maxXP);
            const percent = (displayXP / this.maxXP) * 100;

            this.xpBar.style.width = `${percent}%`;
            this.xpText.textContent = Math.floor(displayXP);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (levelUp) {
                    this.handleLevelUp();
                } else {
                    this.finish();
                }
            }
        };

        requestAnimationFrame(update);
    }

    handleLevelUp() {
        this.currentLvl++;
        this.currentXP = this.currentXP - this.maxXP; // Carry over leftovers
        this.lvlText.textContent = this.currentLvl;
        
        // Trigger Banner & Confetti
        this.levelUpBanner.classList.add('active');
        this.startConfetti();
        
        setTimeout(() => {
            // Reset bar for new level
            this.xpBar.style.transition = 'none';
            this.xpBar.style.width = '0%';
            setTimeout(() => {
                this.xpBar.style.transition = 'width 1s ease';
                this.animateBar(0, this.currentXP, false);
            }, 50);
        }, 1000);
    }

    startConfetti() {
        this.confetti = [];
        for (let i = 0; i < 150; i++) {
            this.confetti.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 10 + 10,
                color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
                tilt: Math.random() * 10 - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }
        this.animateConfetti();
    }

    animateConfetti() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let active = false;

        this.confetti.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 15;

            if (p.y < this.canvas.height) active = true;

            this.ctx.beginPath();
            this.ctx.lineWidth = p.r;
            this.ctx.strokeStyle = p.color;
            this.ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
            this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
            this.ctx.stroke();
        });

        if (active) {
            requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.finish();
        }
    }

    finish() {
        setTimeout(() => {
            this.overlay.classList.remove('active');
            this.isAnimating = false;
        }, 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const rewards = new RewardSystem();
    const btn = document.getElementById('test-xp-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            // Randomly gain 25 or 400 XP to test level up
            const gain = Math.random() > 0.7 ? 400 : 25;
            rewards.trigger(gain);
        });
    }
});
