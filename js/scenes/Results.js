class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
    }
    
    init(data) {
        // Game results data
        this.score = data.score || 0;
        this.waveNumber = data.waveNumber || 1;
        this.fortHealth = data.fortHealth || 0;
        this.gameTime = data.gameTime || 0;
    }
    
    create() {
        // Background
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x0E2A47)
            .setOrigin(0, 0);
        
        // Calculate performance metrics
        const isVictory = this.fortHealth > 0;
        const rank = this.calculateRank();
        const performance = this.calculatePerformance();
        
        // Title text varies based on win/loss
        const titleText = isVictory ? 'MISSION ACCOMPLISHED!' : 'MISSION FAILED';
        const titleColor = isVictory ? '#00FF00' : '#FF0000';
        
        // Add title
        this.add.text(
            this.game.config.width / 2,
            80,
            titleText,
            { fontSize: '40px', fill: titleColor, fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Add subtitle with rank
        this.add.text(
            this.game.config.width / 2,
            130,
            `Rank: ${rank}`,
            { fontSize: '30px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Create stats panel
        this.createStatsPanel();
        
        // Create performance feedback
        this.createPerformanceText(performance);
        
        // Create action buttons
        this.createButtons();
    }
    
    calculateRank() {
        // Calculate rank based on score and completion
        if (this.fortHealth <= 0) {
            return 'D'; // Failed mission
        }
        
        // Base rank on score
        if (this.score >= 500) {
            return 'S'; // Excellent
        } else if (this.score >= 350) {
            return 'A'; // Great
        } else if (this.score >= 250) {
            return 'B'; // Good
        } else {
            return 'C'; // Fair
        }
    }
    
    calculatePerformance() {
        // Generate performance text based on game results
        const performance = {
            positives: [],
            negatives: [],
            tips: []
        };
        
        // Check positives
        if (this.score >= 350) {
            performance.positives.push("High score! Excellent antibiotic selection.");
        }
        if (this.fortHealth >= 80) {
            performance.positives.push("Patient well protected. Fort integrity maintained.");
        }
        if (gameState.pathogens.destroyed >= 20) {
            performance.positives.push("Eliminated many pathogens effectively.");
        }
        
        // Check negatives
        if (this.fortHealth <= 0) {
            performance.negatives.push("Patient protection failed. Fort overrun by pathogens.");
        } else if (this.fortHealth < 50) {
            performance.negatives.push("Patient health critical. Need better protection.");
        }
        
        if (gameState.pathogens.escaped >= 10) {
            performance.negatives.push("Too many pathogens reached the patient.");
        }
        
        if (gameState.pathogens.resisted >= 5) {
            performance.negatives.push("Multiple antibiotic resistance events observed.");
        }
        
        // Add tips
        if (performance.negatives.length > 0) {
            performance.tips.push("Remember to scan unknown pathogens to identify them.");
            performance.tips.push("Match antibiotics to pathogen susceptibility for best results.");
            performance.tips.push("Prioritize fast-moving or dangerous pathogens first.");
        }
        
        return performance;
    }
    
    createStatsPanel() {
        // Create statistics panel
        const panelWidth = 300;
        const panelHeight = 200;
        const panelX = this.game.config.width / 2;
        const panelY = 250;
        
        // Panel background
        this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x000000, 0.7)
            .setStrokeStyle(2, 0xFFFFFF);
        
        // Stats lines
        const stats = [
            `Score: ${this.score}`,
            `Waves Completed: ${this.waveNumber - 1}`,
            `Patient Health: ${this.fortHealth > 0 ? this.fortHealth + '%' : 'Critical'}`,
            `Pathogens Destroyed: ${gameState.pathogens.destroyed}`,
            `Pathogens Reached Patient: ${gameState.pathogens.escaped}`,
            `Mission Time: ${Math.floor(this.gameTime / 60)}m ${Math.floor(this.gameTime % 60)}s`
        ];
        
        let yPos = panelY - panelHeight/2 + 30;
        stats.forEach(stat => {
            this.add.text(
                panelX,
                yPos,
                stat,
                { fontSize: '18px', fill: '#FFFFFF' }
            ).setOrigin(0.5);
            
            yPos += 30;
        });
    }
    
    createPerformanceText(performance) {
        const startY = 380;
        let currentY = startY;
        
        // Add positive feedback
        if (performance.positives.length > 0) {
            this.add.text(
                this.game.config.width / 2,
                currentY,
                "SUCCESSES:",
                { fontSize: '20px', fill: '#00FF00', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            currentY += 30;
            
            performance.positives.forEach(positive => {
                this.add.text(
                    this.game.config.width / 2,
                    currentY,
                    positive,
                    { fontSize: '16px', fill: '#FFFFFF' }
                ).setOrigin(0.5);
                
                currentY += 25;
            });
            
            currentY += 10;
        }
        
        // Add negative feedback
        if (performance.negatives.length > 0) {
            this.add.text(
                this.game.config.width / 2,
                currentY,
                "AREAS FOR IMPROVEMENT:",
                { fontSize: '20px', fill: '#FF6666', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            currentY += 30;
            
            performance.negatives.forEach(negative => {
                this.add.text(
                    this.game.config.width / 2,
                    currentY,
                    negative,
                    { fontSize: '16px', fill: '#FFFFFF' }
                ).setOrigin(0.5);
                
                currentY += 25;
            });
            
            currentY += 10;
        }
        
        // Add tips if appropriate
        if (performance.tips.length > 0) {
            this.add.text(
                this.game.config.width / 2,
                currentY,
                "TIPS:",
                { fontSize: '20px', fill: '#FFFF00', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            currentY += 30;
            
            performance.tips.forEach(tip => {
                this.add.text(
                    this.game.config.width / 2,
                    currentY,
                    tip,
                    { fontSize: '16px', fill: '#FFFFFF' }
                ).setOrigin(0.5);
                
                currentY += 25;
            });
        }
    }
    
    createButtons() {
        const buttonY = this.game.config.height - 70;
        const buttonWidth = 180;
        const buttonHeight = 50;
        const buttonSpacing = 40;
        
        // Play Again button
        const playAgainButton = this.add.rectangle(
            this.game.config.width / 2 - buttonWidth/2 - buttonSpacing/2,
            buttonY,
            buttonWidth,
            buttonHeight,
            0x0066CC,
            1
        ).setInteractive();
        
        this.add.text(
            this.game.config.width / 2 - buttonWidth/2 - buttonSpacing/2,
            buttonY,
            'PLAY AGAIN',
            { fontSize: '20px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Main Menu button
        const menuButton = this.add.rectangle(
            this.game.config.width / 2 + buttonWidth/2 + buttonSpacing/2,
            buttonY,
            buttonWidth,
            buttonHeight,
            0x444444,
            1
        ).setInteractive();
        
        this.add.text(
            this.game.config.width / 2 + buttonWidth/2 + buttonSpacing/2,
            buttonY,
            'MAIN MENU',
            { fontSize: '20px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Button hover effects
        [playAgainButton, menuButton].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(1.05);
            });
            
            button.on('pointerout', () => {
                button.setScale(1);
            });
        });
        
        // Button click handlers
        playAgainButton.on('pointerdown', () => {
            // Reset game state
            gameState = {
                currentLevel: 0,
                pathogens: {
                    destroyed: 0,
                    escaped: 0,
                    resisted: 0
                },
                antibioticsUsed: {}
            };
            
            // Start game again with same difficulty
            this.scene.start('GameScene', { difficulty: GAME_SETTINGS.difficulty });
        });
        
        menuButton.on('pointerdown', () => {
            // Return to menu
            this.scene.start('MenuScene');
        });
    }
}
