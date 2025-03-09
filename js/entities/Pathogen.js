/**
 * Pathogen class - represents a bacterial or fungal pathogen
 */
class Pathogen extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, pathogenData) {
        super(scene, x, y, `pathogen_${pathogenData.id}`);
        
        // Store reference to pathogen data
        this.pathogenData = pathogenData;
        
        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Generate texture if it doesn't exist
        this.generateTexture();
        
        // Set properties
        this.setDisplaySize(40, 40);
        this.speed = pathogenData.speed[GAME_SETTINGS.difficulty];
        this.health = 100;
        this.resistant = false;
        this.scanned = false;
        
        // Add pulse animation
        this.createPulseAnimation();
        
        // Set random movement pattern
        this.setMovementPattern();
    }
    
    generateTexture() {
        const textureKey = `pathogen_${this.pathogenData.id}`;
        
        // Only generate if texture doesn't exist
        if (!this.scene.textures.exists(textureKey)) {
            const graphics = this.scene.add.graphics();
            
            // Draw basic shape based on pathogen type
            graphics.fillStyle(this.pathogenData.color, 1);
            
            // Different shapes based on pathogen type
            if (this.pathogenData.shape === 'rod') {
                // Draw capsule shape for rod bacteria
                graphics.fillRoundedRect(-15, -8, 30, 16, 8);
            } else if (this.pathogenData.shape === 'cocci') {
                // Draw circle for cocci bacteria
                graphics.fillCircle(0, 0, 15);
                
                // Add visual distinction for different cocci
                if (this.pathogenData.name.includes('Strep')) {
                    // Streptococcus - diplococci pattern
                    graphics.fillStyle(0xFFFFFF, 0.3);
                    graphics.fillCircle(-5, 0, 7);
                    graphics.fillCircle(5, 0, 7);
                } else if (this.pathogenData.name.includes('Staph')) {
                    // Staphylococcus - cluster pattern
                    graphics.fillStyle(0xFFFFFF, 0.3);
                    graphics.fillCircle(-5, -5, 5);
                    graphics.fillCircle(5, -5, 5);
                    graphics.fillCircle(0, 5, 5);
                }
            } else if (this.pathogenData.shape === 'yeast') {
                // Draw yeast cell (slightly oval with buds)
                graphics.fillCircle(0, 0, 15);
                graphics.fillCircle(10, -5, 8);
                graphics.fillCircle(-8, 7, 6);
            }
            
            // Add extra details for special pathogens
            if (this.pathogenData.id === 'mrsa') {
                // Add resistance marker
                graphics.lineStyle(2, 0xFF0000, 1);
                graphics.strokeCircle(0, 0, 17);
            } else if (this.pathogenData.id === 'c_diff') {
                // Add spore indication
                graphics.fillStyle(0xFFFFFF, 0.5);
                graphics.fillCircle(10, -10, 4);
                graphics.fillCircle(-10, 10, 4);
            }
            
            // Generate the texture
            graphics.generateTexture(textureKey, 40, 40);
            graphics.destroy();
        }
        
        // Set the texture
        this.setTexture(textureKey);
    }
    
    createPulseAnimation() {
        // Create subtle pulse animation
        this.scene.tweens.add({
            targets: this,
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 1000 + Math.random() * 500, // Slight randomness
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    setMovementPattern() {
        // Set initial velocity toward fort
        const fort = this.scene.fort;
        
        // Calculate angle to fort with some randomness
        const angleToFort = Phaser.Math.Angle.Between(
            this.x, this.y, 
            fort.x, fort.y
        );
        
        // Add some randomness to movement
        const angleVariance = Phaser.Math.FloatBetween(-0.3, 0.3);
        const finalAngle = angleToFort + angleVariance;
        
        // Set velocity based on angle and speed
        const vx = Math.cos(finalAngle) * this.speed;
        const vy = Math.sin(finalAngle) * this.speed;
        
        this.setVelocity(vx, vy);
        
        // Add slight wobble to path
        this.wobbleTimer = this.scene.time.addEvent({
            delay: 2000 + Math.random() * 1000,
            callback: this.adjustTrajectory,
            callbackScope: this,
            loop: true
        });
    }
    
    adjustTrajectory() {
        // Skip if destroyed
        if (!this.active) return;
        
        // Get current velocity
        const currentVx = this.body.velocity.x;
        const currentVy = this.body.velocity.y;
        
        // Calculate current angle and speed
        const currentAngle = Math.atan2(currentVy, currentVx);
        const currentSpeed = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
        
        // Add small random adjustment to angle
        const newAngle = currentAngle + Phaser.Math.FloatBetween(-0.2, 0.2);
        
        // Calculate new velocity components
        const newVx = Math.cos(newAngle) * currentSpeed;
        const newVy = Math.sin(newAngle) * currentSpeed;
        
        // Apply new velocity
        this.setVelocity(newVx, newVy);
    }
    
    startScanning() {
        // Slow down while being scanned
        this.oldVelocity = {
            x: this.body.velocity.x,
            y: this.body.velocity.y
        };
        
        // Reduce speed
        this.setVelocity(
            this.body.velocity.x * 0.2,
            this.body.velocity.y * 0.2
        );
        
        // Visual indication of scanning
        this.scanEffect = this.scene.add.rectangle(
            this.x, this.y,
            this.displayWidth + 10,
            this.displayHeight + 10,
            0x00FFFF, 0.3
        );
    }
    
    stopScanning() {
        // Restore original speed if we have stored velocity
        if (this.oldVelocity) {
            this.setVelocity(
                this.oldVelocity.x,
                this.oldVelocity.y
            );
            this.oldVelocity = null;
        }
        
        // Remove scan effect
        if (this.scanEffect) {
            this.scanEffect.destroy();
            this.scanEffect = null;
        }
        
        // Mark as scanned
        this.scanned = true;
    }
    
    hit(antibioticId) {
        // Check if antibiotic is effective
        const isEffective = this.pathogenData.vulnerableTo.includes(antibioticId);
        const isResistant = this.pathogenData.resistantTo.includes(antibioticId);
        
        if (isEffective) {
            // Pathogen destroyed
            return {
                result: 'destroyed',
                points: this.pathogenData.points
            };
        } else if (isResistant) {
            // Pathogen is resistant
            this.markAsResistant();
            return { 
                result: 'resistant',
                points: 0
            };
        } else {
            // Wrong antibiotic - partial effect
            this.health -= 20;
            
            if (this.health <= 0) {
                // Eventually destroyed with wrong antibiotics (less efficient)
                return {
                    result: 'destroyed',
                    points: Math.floor(this.pathogenData.points / 2)
                };
            }
            
            return {
                result: 'ineffective',
                points: 0
            };
        }
    }
    
    markAsResistant() {
        // Visual indication of resistance
        this.resistant = true;
        this.setTint(0xFF0000);
        
        // Particle effect for resistance
        this.scene.add.particles(this.x, this.y, 'particle', {
            tint: 0xFF0000,
            speed: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 10
        }).explode();
    }
    
    update() {
        // Update scan effect position if it exists
        if (this.scanEffect) {
            this.scanEffect.setPosition(this.x, this.y);
        }
        
        // Add nametag for scanned pathogens
        if (this.scanned && !this.nameTag) {
            this.addNameTag();
        }
        
        // Update name tag position
        if (this.nameTag) {
            this.nameTag.setPosition(this.x, this.y - 25);
        }
    }
    
    addNameTag() {
        // Add small name tag above pathogen
        const name = this.pathogenData.name.split(' ')[0]; // Just use genus
        this.nameTag = this.scene.add.text(
            this.x, this.y - 25,
            name,
            { fontSize: '10px', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 2 }
        ).setOrigin(0.5);
    }
    
    destroy() {
        // Clean up any attached objects
        if (this.scanEffect) {
            this.scanEffect.destroy();
        }
        
        if (this.nameTag) {
            this.nameTag.destroy();
        }
        
        if (this.wobbleTimer) {
            this.wobbleTimer.remove();
        }
        
        super.destroy();
    }
}
