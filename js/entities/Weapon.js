/**
 * Weapon class - represents an antibiotic missile
 */
class Weapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, antibioticData) {
        super(scene, x, y, 'missile');
        
        // Store antibiotic data
        this.antibioticData = antibioticData;
        this.antibioticId = antibioticData.id;
        
        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Generate texture if needed
        this.generateTexture();
        
        // Set properties
        this.setDisplaySize(8, 20);
        this.setTint(antibioticData.color);
        
        // Set velocity upward
        this.setVelocityY(-400);
        
        // Destroy when off-screen
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        
        // Add trail effect
        this.createTrailEffect();
    }
    
    generateTexture() {
        if (!this.scene.textures.exists('missile')) {
            const graphics = this.scene.add.graphics();
            
            // Base missile shape
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillRect(3, 0, 2, 12);
            
            // Different shapes based on antibiotic type
            if (this.antibioticData.icon === 'pill') {
                // Pill-shaped missile
                graphics.fillRoundedRect(2, 0, 4, 10, 2);
                graphics.fillStyle(0x000000, 0.3);
                graphics.fillRect(2, 5, 4, 1);
            } else if (this.antibioticData.icon === 'syringe') {
                // Syringe-shaped missile
                graphics.fillRect(2, 0, 4, 14);
                graphics.fillCircle(4, 0, 2);
                graphics.fillStyle(0x000000, 0.3);
                graphics.fillRect(2, 3, 4, 1);
                graphics.fillRect(2, 5, 4, 1);
                graphics.fillRect(2, 7, 4, 1);
            }
            
            // Generate texture
            graphics.generateTexture('missile', 8, 16);
            graphics.destroy();
        }
    }
    
    createTrailEffect() {
        // Create trail particles behind missile
        if (!this.scene.textures.exists('trail_particle')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(2, 2, 2);
            graphics.generateTexture('trail_particle', 4, 4);
            graphics.destroy();
        }
        
        // Create emitter
        this.trailEmitter = this.scene.add.particles(this.x, this.y, 'trail_particle', {
            tint: this.antibioticData.color,
            speed: 5,
            angle: 90,
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            frequency: 15,
            alpha: { start: 0.8, end: 0 }
        });
    }
    
    update() {
        // Update trail particles position
        if (this.trailEmitter) {
            this.trailEmitter.setPosition(this.x, this.y + 10);
        }
    }
    
    hitPathogen(pathogen) {
        // Create hit effect
        this.createHitEffect(pathogen);
        
        // Destroy missile
        this.destroy();
    }
    
    createHitEffect(pathogen) {
        // Get result of the hit
        const hitResult = pathogen.hit(this.antibioticId);
        
        // Create appropriate effect based on result
        if (hitResult.result === 'destroyed') {
            // Success effect
            this.scene.add.particles(pathogen.x, pathogen.y, 'particle', {
                tint: 0x00FF00,
                speed: { min: 50, max: 100 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                quantity: 20
            }).explode();
            
            // Show success text
            this.showFloatingText(pathogen, 'ELIMINATED!', 0x00FF00);
        } else if (hitResult.result === 'resistant') {
            // Resistance effect - red shield flash
            this.scene.add.particles(pathogen.x, pathogen.y, 'particle', {
                tint: 0xFF0000,
                speed: { min: 20, max: 40 },
                scale: { start: 0.3, end: 0 },
                lifespan: 300,
                quantity: 10
            }).explode();
            
            // Show resistance text
            this.showFloatingText(pathogen, 'RESISTANT!', 0xFF0000);
        } else {
            // Ineffective hit - orange indication
            this.scene.add.particles(pathogen.x, pathogen.y, 'particle', {
                tint: 0xFFAA00,
                speed: { min: 20, max: 30 },
                scale: { start: 0.3, end: 0 },
                lifespan: 200,
                quantity: 5
            }).explode();
            
            // Show ineffective text
            this.showFloatingText(pathogen, 'Ineffective', 0xFFAA00);
        }
    }
    
    showFloatingText(pathogen, message, color) {
        // Convert hex color to CSS color
        const hexString = color.toString(16).padStart(6, '0');
        
        // Create floating text
        const text = this.scene.add.text(
            pathogen.x, 
            pathogen.y,
            message,
            { 
                fontSize: message === 'ELIMINATED!' ? '16px' : '14px', 
                color: `#${hexString}`,
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Animate text rising and fading
        this.scene.tweens.add({
            targets: text,
            y: pathogen.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    destroy() {
        // Clean up emitter
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        
        super.destroy();
    }
}
