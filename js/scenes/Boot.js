class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading text
        const loadingText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 50,
            'Loading...',
            { fontSize: '24px', fill: '#FFFFFF' }
        ).setOrigin(0.5);

        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            this.game.config.width / 2 - 160,
            this.game.config.height / 2,
            320,
            50
        );

        // Loading progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFFFFFF, 1);
            progressBar.fillRect(
                this.game.config.width / 2 - 150,
                this.game.config.height / 2 + 10,
                300 * value,
                30
            );
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // If you have actual image assets, load them here
        // For this example, we'll generate everything programmatically
        
        // Load any audio assets (optional)
        // this.load.audio('shoot', 'assets/audio/shoot.mp3');
        // this.load.audio('explosion', 'assets/audio/explosion.mp3');
        
        // Simulate loading time
        for (let i = 0; i < 100; i++) {
            this.load.spritesheet(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', { frameWidth: 1, frameHeight: 1 });
        }
    }

    create() {
        // Generate any needed textures
        this.generateTextures();
        
        // Set up any global game settings
        
        // Start the menu scene
        this.scene.start('MenuScene');
    }
    
    generateTextures() {
        // Generate common textures used across the game
        // This avoids having to create them in each scene
        
        // Generate basic particle
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFFFFF, 1);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();
        
        // Generate player texture
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00AAFF, 1);
        playerGraphics.fillTriangle(20, 0, 0, 40, 40, 40);
        playerGraphics.fillStyle(0xFFFFFF, 1);
        playerGraphics.fillCircle(20, 20, 5);
        playerGraphics.generateTexture('player', 40, 40);
        playerGraphics.destroy();
        
        // Generate fort texture
        const fortGraphics = this.add.graphics();
        fortGraphics.fillStyle(0x888888, 1);
        fortGraphics.fillRect(0, 10, 80, 80);
        fortGraphics.fillStyle(0x666666, 1);
        fortGraphics.fillRect(10, 0, 60, 10);
        fortGraphics.generateTexture('fort', 80, 90);
        fortGraphics.destroy();
        
        // Generate missile texture
        const missileGraphics = this.add.graphics();
        missileGraphics.fillStyle(0xFFFFFF, 1);
        missileGraphics.fillRect(2, 0, 4, 16);
        missileGraphics.generateTexture('missile', 8, 16);
        missileGraphics.destroy();
    }
}
