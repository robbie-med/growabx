// Main game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        TutorialScene,
        GameScene,
        ResultsScene
    ]
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game settings
const GAME_SETTINGS = {
    difficulty: 'easy', // 'easy', 'normal', 'hard'
    sessionLength: 480, // 8 minutes in seconds
    fortHealth: 100,
    score: 0
};

// Track global game state
let gameState = {
    currentLevel: 0,
    pathogens: {
        destroyed: 0,
        escaped: 0,
        resisted: 0
    },
    antibioticsUsed: {}
};

// Responsive sizing
window.addEventListener('resize', () => {
    if (game) {
        // Adjust game size based on window size
        const gameContainer = document.getElementById('game-container');
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;
        
        // Calculate new game size maintaining aspect ratio
        let newWidth = containerWidth;
        let newHeight = containerWidth * (config.height / config.width);
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * (config.width / config.height);
        }
        
        game.scale.resize(newWidth, newHeight);
    }
});
