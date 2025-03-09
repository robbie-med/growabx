/**
 * Player class - handles the player's medical aircraft
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set properties
        this.setDisplaySize(40, 40);
        this.speed = 300;
        this.fireRate = 300; // milliseconds between shots
        this.lastFired = 0;
        
        // Enable input
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // Set bounds for player movement
        this.boundaryPadding = 20;
        this.setCollideWorldBounds(true);
        
        // Add particle emitter for engine effect
        this.createEngineEffect();
    }
    
    update(time, delta) {
        // Movement controls
        this.handleMovement();
        
        // Update engine effect
        this.updateEngineEffect();
    }
    
    handleMovement() {
        // Reset velocity
        this.setVelocity(0);
        
        // Movement based on cursor keys
        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
        }
        
        if (this.cursors.up.isDown) {
            this.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.speed);
        }
        
        // Keep player within bounds
        const maxY = this.scene.game.config.height - 100; // Above UI
        const minY = this.boundaryPadding;
        
        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY;
    }
    
    createEngineEffect() {
        // Create particle effect for engine
        if (!this.scene.textures.exists('engine_particle')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x88CCFF, 1);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('engine_particle', 8, 8);
            graphics.destroy();
        }
        
        this.engineEmitter = this.scene.add.particles(0, 0, 'engine_particle', {
            speed: { min: 40, max: 60 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: { min: 200, max: 300 },
            frequency: 30,
            quantity: 2,
            alpha: { start: 0.6, end: 0 }
        });
    }
    
    updateEngineEffect() {
        // Position engine particles behind the player
        if (this.engineEmitter) {
            this.engineEmitter.setPosition(this.x, this.y + 20);
        }
    }
    
    canFire(time) {
        // Check if enough time has passed to fire again
        return time - this.lastFired > this.fireRate;
    }
    
    fire(time, antibiotic) {
        if (!this.canFire(time)) return null;
        
        // Create missile
        const missile = new Weapon(this.scene, this.x, this.y - 20, antibiotic);
        
        // Update last fired time
        this.lastFired = time;
        
        return missile;
    }
    
    destroy() {
        // Clean up emitter
        if (this.engineEmitter) {
            this.engineEmitter.destroy();
        }
        
        super.destroy();
    }
}
