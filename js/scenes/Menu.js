class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x0E2A47)
            .setOrigin(0, 0);
        
        // Title
        this.add.text(
            this.game.config.width / 2,
            100,
            'ANTIBIOTIC DEFENSE',
            { fontSize: '40px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Subtitle
        this.add.text(
            this.game.config.width / 2,
            160,
            'Match the right antibiotics to defeat pathogens!',
            { fontSize: '18px', fill: '#CCCCCC' }
        ).setOrigin(0.5);
        
        // Create difficulty selection buttons
        this.createDifficultyButtons();
        
        // Instructions
        const instructions = [
            'HOW TO PLAY:',
            '• Move with arrow keys',
            '• Press SPACE to scan pathogens',
            '• Select antibiotics with number keys or click',
            '• Press F or click to fire',
            '• Defend your fort from invading pathogens',
            '• Match the right antibiotic to each pathogen!'
        ];
        
        let yPosition = 350;
        instructions.forEach((line, index) => {
            const textColor = index === 0 ? '#FFFF00' : '#FFFFFF';
            this.add.text(
                this.game.config.width / 2,
                yPosition,
                line,
                { fontSize: '16px', fill: textColor }
            ).setOrigin(0.5);
            
            yPosition += 25;
        });
        
        // Credits
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height - 40,
            'An educational game for medical students',
            { fontSize: '14px', fill: '#AAAAAA' }
        ).setOrigin(0.5);
    }
    
    createDifficultyButtons() {
        const buttonWidth = 180;
        const buttonHeight = 50;
        const buttonSpacing = 30;
        const startY = 230;
        
        const difficulties = [
            { text: 'EASY', value: 'easy', color: 0x00AA00 },
            { text: 'NORMAL', value: 'normal', color: 0xAAAA00 },
            { text: 'HARD', value: 'hard', color: 0xAA0000 }
        ];
        
        difficulties.forEach((difficulty, index) => {
            // Position buttons horizontally centered with spacing
            const totalWidth = (buttonWidth * difficulties.length) + (buttonSpacing * (difficulties.length - 1));
            const startX = (this.game.config.width - totalWidth) / 2;
            const x = startX + (buttonWidth + buttonSpacing) * index;
            
            // Create button background
            const button = this.add.rectangle(
                x + buttonWidth / 2,
                startY,
                buttonWidth,
                buttonHeight,
                difficulty.color,
                0.8
            ).setInteractive();
            
            // Add text to button
            const text = this.add.text(
                x + buttonWidth / 2,
                startY,
                difficulty.text,
                { fontSize: '20px', fill: '#FFFFFF', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            // Button hover effect
            button.on('pointerover', () => {
                button.setScale(1.05);
                button.setAlpha(1);
            });
            
            button.on('pointerout', () => {
                button.setScale(1);
                button.setAlpha(0.8);
            });
            
            // Button click
            button.on('pointerdown', () => {
                // Set game difficulty
                GAME_SETTINGS.difficulty = difficulty.value;
                
                // Transition to tutorial or directly to game
                this.showStartButton(difficulty.value);
            });
        });
    }
    
    showStartButton(difficulty) {
        // Clear existing buttons
        this.children.list
            .filter(child => child.type === 'Rectangle' && child.input && child.input.enabled)
            .forEach(button => {
                button.input.enabled = false;
                button.setAlpha(0.4);
            });
        
        // Create start button
        const startButton = this.add.rectangle(
            this.game.config.width / 2,
            500,
            250,
            60,
            0x0066CC,
            1
        ).setInteractive();
        
        // Add text to button
        this.add.text(
            this.game.config.width / 2,
            500,
            'START GAME',
            { fontSize: '24px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Button hover effect
        startButton.on('pointerover', () => {
            startButton.setScale(1.05);
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(1);
        });
        
        // Button click
        startButton.on('pointerdown', () => {
            // Start tutorial or game directly
            const skipTutorial = localStorage.getItem('antibioticGame_skipTutorial');
            
            if (skipTutorial === 'true') {
                this.scene.start('GameScene', { difficulty });
            } else {
                this.scene.start('TutorialScene', { difficulty });
            }
        });
        
        // Add skip tutorial checkbox for repeat players
        const checkboxSize = 20;
        const checkboxX = this.game.config.width / 2 - 120;
        const checkboxY = 550;
        
        const checkbox = this.add.rectangle(
            checkboxX,
            checkboxY,
            checkboxSize,
            checkboxSize,
            0xFFFFFF,
            1
        ).setOrigin(0.5).setInteractive();
        
        const checkmark = this.add.text(
            checkboxX,
            checkboxY,
            '✓',
            { fontSize: '16px', fill: '#000000' }
        ).setOrigin(0.5);
        
        // Initially hide checkmark
        let skipTutorial = localStorage.getItem('antibioticGame_skipTutorial') === 'true';
        checkmark.setVisible(skipTutorial);
        
        // Toggle checkbox
        checkbox.on('pointerdown', () => {
            skipTutorial = !skipTutorial;
            checkmark.setVisible(skipTutorial);
            localStorage.setItem('antibioticGame_skipTutorial', skipTutorial);
        });
        
        // Checkbox label
        this.add.text(
            checkboxX + 15,
            checkboxY,
            'Skip tutorial next time',
            { fontSize: '16px', fill: '#FFFFFF' }
        ).setOrigin(0, 0.5);
    }
}
