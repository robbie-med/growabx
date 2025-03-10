class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        console.log("BootScene constructor called");
    }

    preload() {
        console.log("BootScene preload started");
        
        // Make loading text more visible against black background
        const loadingText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 - 50,
            'Loading...',
            { fontSize: '32px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add visible background
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x0000AA)
            .setOrigin(0, 0);
            
        // Add visible progress bar
        const progressBar = this.add.rectangle(
            this.game.config.width / 2 - 150, 
            this.game.config.height / 2, 
            0, 
            30, 
            0x00FF00
        ).setOrigin(0, 0.5);
        
        const progressBox = this.add.rectangle(
            this.game.config.width / 2 - 160, 
            this.game.config.height / 2, 
            320, 
            50, 
            0x000000
        ).setOrigin(0, 0.5);
        
        // Add event listeners to update progress bar
        this.load.on('progress', (value) => {
            progressBar.width = 300 * value;
            console.log(`Loading progress: ${Math.floor(value * 100)}%`);
        });
        
        // Only load a single dummy file
        this.load.image('dummy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    }

    create() {
        console.log("BootScene create started");
        
        // Add visible text to confirm we're in create
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 2 + 50,
            'Starting Game...',
            { fontSize: '24px', fill: '#FFFFFF' }
        ).setOrigin(0.5);
        
        // Generate basic textures
        this.generateTextures();
        
        console.log("BootScene complete - waiting before starting MenuScene");
        
        // Add a delay before starting MenuScene to ensure we can see what's happening
        this.time.delayedCall(2000, () => {
            console.log("Starting MenuScene now");
            this.scene.start('MenuScene');
        });
    }
    
    generateTextures() {
        console.log("Generating basic textures");
        
        // Generate particle texture
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFFFFF, 1);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();
        
        // Generate player texture  
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00AAFF, 1);
        playerGraphics.fillTriangle(20, 0, 0, 40, 40, 40);
        playerGraphics.generateTexture('player', 40, 40);
        playerGraphics.destroy();
        
        console.log("Basic textures generated successfully");
    }
}
