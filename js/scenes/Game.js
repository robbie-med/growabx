class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state variables
        this.player = null;
        this.pathogens = null;
        this.missiles = null;
        this.fort = null;
        this.selectedAntibiotic = null;
        this.antibioticButtons = {};
        this.waveTimer = 0;
        this.waveNumber = 1;
        this.gameTime = 0;
        this.score = 0;
        this.scanning = false;
        this.scanTarget = null;
        this.scanWindow = null;
        this.difficulty = GAME_SETTINGS.difficulty;
        
        // Internal tracking
        this.pathogenSpawnTimer = 0;
        this.pathogenPool = [];
        this.availableAntibiotics = [];
        
        // Entity groups
        this.pathogenGroup = null;
        this.missileGroup = null;
    }

    init(data) {
        // Initialize with data passed from previous scene
        this.difficulty = data.difficulty || GAME_SETTINGS.difficulty;
        this.waveNumber = data.level || 1;
        this.score = data.score || 0;
        
        // Reset game state
        this.gameTime = 0;
        this.pathogenSpawnTimer = 0;
    }

    preload() {
        // Preload any additional assets needed
        // In a full implementation, most assets would be loaded in the Boot scene
    }

    create() {
        // Setup background
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0xE0E0FF)
            .setOrigin(0, 0);
        
        // Create the fort (patient)
        this.createFort();
        
        // Setup physics groups
        this.pathogenGroup = this.add.group();
        this.missileGroup = this.add.group();
        
        // Create player (medical aircraft)
        this.createPlayer();
        
        // Create antibiotics selection UI
        this.createAntibioticsUI();
        
        // Create HUD (heads-up display)
        this.createHUD();
        
        // Setup collisions
        this.physics.add.overlap(this.missileGroup, this.pathogenGroup, this.handleMissilePathogenCollision, null, this);
        this.physics.add.overlap(this.pathogenGroup, this.fort, this.handlePathogenFortCollision, null, this);
        
        // Prepare pathogen pool for this level
        this.preparePathogenPool();
        
        // Setup input
        this.setupInput();
        
        // Start wave
        this.startWave();
    }

    update(time, delta) {
        // Update game timer (in seconds)
        this.gameTime += delta / 1000;
        
        // Update wave timer
        this.waveTimer -= delta;
        this.updateHUD();
        
        // Check for wave completion
        if (this.waveTimer <= 0) {
            this.endWave();
            return;
        }
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update all missiles
        this.missileGroup.getChildren().forEach(missile => {
            missile.update();
        });
        
        // Update all pathogens
        this.pathogenGroup.getChildren().forEach(pathogen => {
            pathogen.update();
        });
        
        // Spawn pathogens
        this.pathogenSpawnTimer -= delta;
        if (this.pathogenSpawnTimer <= 0) {
            this.spawnPathogen();
            // Reset timer with some randomness
            this.pathogenSpawnTimer = this.getPathogenSpawnInterval();
        }
        
        // Handle scanning
        if (this.scanning && this.scanTarget) {
            this.updateScanWindow();
        }
    }

    createFort() {
        // Create the fort (patient) that needs to be defended
        const centerX = this.game.config.width / 2;
        const bottomY = this.game.config.height - 50;
        
        // Fort visual (placeholder)
        this.fort = this.physics.add.sprite(centerX, bottomY, 'fort');
        
        // If no sprite is loaded, create a simple shape as placeholder
        if (!this.textures.exists('fort')) {
            const fortGraphics = this.add.graphics();
            fortGraphics.fillStyle(0x888888, 1);
            fortGraphics.fillRect(-40, -40, 80, 80);
            fortGraphics.fillStyle(0x666666, 1);
            fortGraphics.fillRect(-30, -50, 60, 10);
            
            // Create texture from graphics
            fortGraphics.generateTexture('fort', 80, 90);
            fortGraphics.destroy();
            
            // Now apply the texture
            this.fort.setTexture('fort');
        }
        
        this.fort.setDisplaySize(80, 90);
        this.fort.health = 100;
        this.fort.body.setImmovable(true);
    }

    createPlayer() {
        // Create player aircraft
        const centerX = this.game.config.width / 2;
        const playerY = this.game.config.height - 150;
        
        // Use our Player class
        this.player = new Player(this, centerX, playerY);
    }

    createAntibioticsUI() {
        // Create antibiotic selection UI at bottom of screen
        const startX = 20;
        const buttonY = this.game.config.height - 30;
        const buttonWidth = 60;
        const buttonHeight = 40;
        const buttonSpacing = 10;
        const buttonTextConfig = { fontSize: '12px', color: '#000000' };
        
        // Get antibiotics available for this difficulty
        this.availableAntibiotics = ANTIBIOTICS.filter(antibiotic => 
            this.getDifficultyLevel(antibiotic.unlockLevel) <= this.getDifficultyLevel(this.difficulty)
        );
        
        // Create a button for each available antibiotic
        this.availableAntibiotics.forEach((antibiotic, index) => {
            const buttonX = startX + (buttonWidth + buttonSpacing) * index;
            
            // Button background
            const button = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, antibiotic.color)
                .setInteractive()
                .on('pointerdown', () => this.selectAntibiotic(antibiotic.id));
            
            // Button text
            const text = this.add.text(buttonX, buttonY, antibiotic.name.substring(0, 5), buttonTextConfig)
                .setOrigin(0.5)
                .setFontSize(10); // Small text to fit
            
            // Button ammo counter
            const ammoText = this.add.text(buttonX, buttonY + 12, `${antibiotic.ammo}`, buttonTextConfig)
                .setOrigin(0.5);
            
            // Store references to button elements
            this.antibioticButtons[antibiotic.id] = {
                button,
                text,
                ammoText,
                antibiotic: {...antibiotic}, // Clone the antibiotic data
                cooldownTimer: 0
            };
        });
        
        // Initially select the first antibiotic
        if (this.availableAntibiotics.length > 0) {
            this.selectAntibiotic(this.availableAntibiotics[0].id);
        }
    }

    createHUD() {
        // Create heads-up display elements
        const padding = 10;
        
        // Score display
        this.scoreText = this.add.text(padding, padding, 'Score: 0', { fontSize: '18px', color: '#000000' });
        
        // Wave timer
        this.waveText = this.add.text(this.game.config.width / 2, padding, 'Wave 1: 60s', {
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5, 0);
        
        // Fort health bar
        this.healthBarBg = this.add.rectangle(
            this.game.config.width - padding - 100, 
            padding + 10, 
            100, 
            20, 
            0x000000
        ).setOrigin(0, 0.5);
        
        this.healthBar = this.add.rectangle(
            this.game.config.width - padding - 100, 
            padding + 10, 
            100, 
            20, 
            0x00FF00
        ).setOrigin(0, 0.5);
        
        this.healthText = this.add.text(
            this.game.config.width - padding - 50, 
            padding + 10, 
            '100%', 
            { fontSize: '16px', color: '#FFFFFF' }
        ).setOrigin(0.5);
        
        // Selected antibiotic indicator
        this.selectedText = this.add.text(
            padding, 
            this.game.config.height - 80, 
            'Selected: None', 
            { fontSize: '16px', color: '#000000' }
        );
    }

    setupInput() {
        // Spacebar for scanning
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startScanning();
        });
        
        this.input.keyboard.on('keyup-SPACE', () => {
            this.stopScanning();
        });
        
        // Fire button
        this.input.keyboard.on('keydown-F', () => {
            this.fireAntibiotic();
        });
        
        // Mouse click to fire
        this.input.on('pointerdown', (pointer) => {
            // Only fire if click is in the game area (not on UI)
            if (pointer.y < this.game.config.height - 60) {
                this.fireAntibiotic();
            }
        });
        
        // Number keys to select antibiotics (1-9)
        for (let i = 1; i <= 9; i++) {
            this.input.keyboard.on(`keydown-${i}`, () => {
                if (i <= this.availableAntibiotics.length) {
                    this.selectAntibiotic(this.availableAntibiotics[i-1].id);
                }
            });
        }
        
        // Key for pausing the game (ESC)
        this.input.keyboard.on('keydown-ESC', () => {
            // Toggle pause state
            if (this.scene.isPaused('GameScene')) {
                this.scene.resume('GameScene');
                if (this.pauseText) {
                    this.pauseText.destroy();
                    this.pauseText = null;
                }
            } else {
                this.scene.pause('GameScene');
                this.pauseText = this.add.text(
                    this.game.config.width / 2,
                    this.game.config.height / 2,
                    'PAUSED\nPress ESC to resume',
                    { fontSize: '32px', fill: '#FFFFFF', align: 'center' }
                ).setOrigin(0.5).setDepth(999);
            }
        });
    }

    startWave() {
        // Set up wave timer based on difficulty
        const waveDuration = this.getWaveDuration();
        this.waveTimer = waveDuration;
        
        // Reset pathogen spawn timer
        this.pathogenSpawnTimer = this.getPathogenSpawnInterval();
        
        // Update HUD
        this.updateHUD();
    }

    endWave() {
        // Stop spawning
        this.pathogenSpawnTimer = Infinity;
        
        // Wait for all pathogens to be cleared or timeout
        const remainingPathogens = this.pathogenGroup.getChildren().length;
        
        if (remainingPathogens === 0 || this.fort.health <= 0) {
            // Wave completed
            if (this.waveNumber >= this.getMaxWaves()) {
                // Game completed
                this.endGame();
            } else {
                // Advance to next wave
                this.waveNumber++;
                this.startWave();
            }
        } else {
            // Give player time to clear remaining pathogens
            if (!this.cleanupTimer) {
                this.cleanupTimer = this.time.addEvent({
                    delay: 5000,
                    callback: () => {
                        this.endGame();
                    },
                    callbackScope: this
                });
            }
        }
    }

    endGame() {
        // Transition to results scene
        this.scene.start('ResultsScene', {
            score: this.score,
            waveNumber: this.waveNumber,
            fortHealth: this.fort.health,
            gameTime: this.gameTime
        });
    }

    // Player movement is now handled in the Player class
    // This method is no longer needed


    selectAntibiotic(id) {
        // Deselect previous
        if (this.selectedAntibiotic) {
            this.antibioticButtons[this.selectedAntibiotic].button.setStrokeStyle();
        }
        
        // Select new
        this.selectedAntibiotic = id;
        this.antibioticButtons[id].button.setStrokeStyle(4, 0xFFFFFF);
        
        // Update HUD
        this.selectedText.setText(`Selected: ${this.antibioticButtons[id].antibiotic.name}`);
    }

    fireAntibiotic() {
        // Check if we have a selected antibiotic
        if (!this.selectedAntibiotic) return;
        
        const buttonData = this.antibioticButtons[this.selectedAntibiotic];
        const antibiotic = buttonData.antibiotic;
        
        // Check cooldown
        if (buttonData.cooldownTimer > 0) return;
        
        // Check ammo
        if (antibiotic.ammo <= 0) return;
        
        // Reduce ammo
        antibiotic.ammo--;
        buttonData.ammoText.setText(`${antibiotic.ammo}`);
        
        // Start cooldown
        buttonData.cooldownTimer = antibiotic.cooldown;
        buttonData.button.setFillStyle(0x777777); // Darken while on cooldown
        
        // Create missile using the player's fire method
        const missile = this.player.fire(this.time.now, antibiotic);
        
        // Add missile to the group if created
        if (missile) {
            this.missileGroup.add(missile);
        }
        
        // Schedule cooldown end
        this.time.addEvent({
            delay: antibiotic.cooldown,
            callback: () => {
                buttonData.cooldownTimer = 0;
                buttonData.button.setFillStyle(antibiotic.color); // Restore color
            },
            callbackScope: this
        });
    }

    // Missile creation is now handled in the Player and Weapon classes
    // This method is no longer needed


    spawnPathogen() {
        // Select a random pathogen from the pool
        if (this.pathogenPool.length === 0) return;
        
        const pathogenData = Phaser.Utils.Array.GetRandom(this.pathogenPool);
        
        // Random x position at top of screen
        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        const y = -20; // Start above screen
        
        // Create pathogen using our Pathogen class
        const pathogen = new Pathogen(this, x, y, pathogenData);
        
        // Add to the group
        this.pathogenGroup.add(pathogen);
        
        return pathogen;
    }

    startScanning() {
        this.scanning = true;
        
        // Find nearest pathogen to scan
        const pathogens = this.pathogenGroup.getChildren();
        if (pathogens.length === 0) return;
        
        let nearestDistance = Infinity;
        let nearestPathogen = null;
        
        pathogens.forEach(pathogen => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                pathogen.x, pathogen.y
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPathogen = pathogen;
            }
        });
        
        // Only scan if within range
        if (nearestDistance < 150) {
            this.scanTarget = nearestPathogen;
            this.createScanWindow(nearestPathogen);
            
            // Use the pathogen's scanning method
            this.scanTarget.startScanning();
        }
    }

    stopScanning() {
        this.scanning = false;
        
        // Destroy scan window
        if (this.scanWindow) {
            this.scanWindow.destroy();
            this.scanWindow = null;
        }
        
        // Use the pathogen's method to stop scanning
        if (this.scanTarget && this.scanTarget.active) {
            this.scanTarget.stopScanning();
            this.scanTarget = null;
        }
    }

    createScanWindow(pathogen) {
        // Create a window showing pathogen details
        const windowWidth = 200;
        const windowHeight = 120;
        const padding = 10;
        
        // Position window near but not on top of the pathogen
        const windowX = Phaser.Math.Clamp(
            pathogen.x, 
            windowWidth/2 + padding, 
            this.game.config.width - windowWidth/2 - padding
        );
        const windowY = Phaser.Math.Clamp(
            pathogen.y - 80, 
            windowHeight/2 + padding, 
            this.game.config.height - windowHeight/2 - padding
        );
        
        // Create window background
        this.scanWindow = this.add.container(windowX, windowY);
        
        const background = this.add.rectangle(0, 0, windowWidth, windowHeight, 0x000000, 0.8)
            .setOrigin(0.5);
        this.scanWindow.add(background);
        
        // Add pathogen info
        const data = pathogen.pathogenData;
        const textConfig = { fontSize: '14px', color: '#FFFFFF', align: 'center' };
        
        // Title
        const title = this.add.text(0, -windowHeight/2 + 20, data.name, textConfig)
            .setOrigin(0.5);
        this.scanWindow.add(title);
        
        // Details in smaller text
        const details = this.add.text(0, -10, data.details, {...textConfig, fontSize: '12px'})
            .setOrigin(0.5);
        this.scanWindow.add(details);
        
        // Suggested antibiotics
        let antiText = "Effective antibiotics:";
        data.vulnerableTo.forEach(id => {
            const antibiotic = ANTIBIOTICS.find(a => a.id === id);
            if (antibiotic) {
                antiText += `\n${antibiotic.name}`;
            }
        });
        
        const antibiotics = this.add.text(0, 20, antiText, {...textConfig, fontSize: '10px'})
            .setOrigin(0.5);
        this.scanWindow.add(antibiotics);
    }

    updateScanWindow() {
        // Update scan window position if target moves
        if (this.scanWindow && this.scanTarget && this.scanTarget.active) {
            const windowX = Phaser.Math.Clamp(
                this.scanTarget.x, 
                100 + 10, 
                this.game.config.width - 100 - 10
            );
            const windowY = Phaser.Math.Clamp(
                this.scanTarget.y - 80, 
                60 + 10, 
                this.game.config.height - 60 - 10
            );
            
            this.scanWindow.setPosition(windowX, windowY);
        }
    }

    handleMissilePathogenCollision(missile, pathogen) {
        // Use the missile's hit method
        missile.hitPathogen(pathogen);
        
        // Get result
        const hitResult = pathogen.hit(missile.antibioticId);
        
        // Process result
        if (hitResult.result === 'destroyed') {
            // Destroy pathogen
            this.destroyPathogen(pathogen, true);
            
            // Award points
            this.score += hitResult.points;
            
            // Update HUD
            this.updateHUD();
        } else if (hitResult.result === 'resistant') {
            // Track resistance
            gameState.pathogens.resisted++;
        }
    }

    handlePathogenFortCollision(pathogen, fort) {
        // Pathogen reached the fort (patient)
        // Damage fort
        fort.health -= 10;
        
        // Destroy pathogen
        this.destroyPathogen(pathogen, false);
        
        // Visual feedback
        this.cameras.main.shake(200, 0.01);
        
        // Show damage text
        this.showFloatingText(fort.x, fort.y - 40, "DAMAGE! -10%", 0xFF0000);
        
        // Update health bar
        this.updateHUD();
        
        // Check for game over
        if (fort.health <= 0) {
            this.endGame();
        }
    }

    destroyPathogen(pathogen, wasDestroyed) {
        // Explosion effect
        this.createExplosion(pathogen.x, pathogen.y, wasDestroyed);
        
        // Track stats
        if (wasDestroyed) {
            gameState.pathogens.destroyed++;
        } else {
            gameState.pathogens.escaped++;
        }
        
        // Destroy pathogen
        pathogen.destroy();
    }

    createExplosion(x, y, isSuccess) {
        // Create particle explosion
        const color = isSuccess ? 0x00FF00 : 0xFF0000;
        
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 20,
            tint: color
        });
        
        // If particle texture doesn't exist, create one
        if (!this.textures.exists('particle')) {
            const particleGraphics = this.add.graphics();
            particleGraphics.fillStyle(0xFFFFFF, 1);
            particleGraphics.fillCircle(0, 0, 4);
            
            // Create texture
            particleGraphics.generateTexture('particle', 8, 8);
            particleGraphics.destroy();
        }
        
        // Clean up particles after animation
        this.time.delayedCall(500, () => {
            particles.destroy();
        });
        
        // Show success/fail text
        if (isSuccess) {
            this.showFloatingText(x, y, "ELIMINATED!", 0x00FF00);
        } else {
            this.showFloatingText(x, y, "FORT DAMAGED!", 0xFF0000);
        }
    }

    showFloatingText(x, y, message, color) {
        // Create floating text that rises and fades
        const hexColor = color.toString(16).padStart(6, '0');
        const text = this.add.text(x, y, message, {
            fontSize: '16px',
            color: `#${hexColor}`,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Animation
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
    }

    updateHUD() {
        // Update score
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Update wave timer
        const timeRemaining = Math.max(0, Math.ceil(this.waveTimer / 1000));
        this.waveText.setText(`Wave ${this.waveNumber}: ${timeRemaining}s`);
        
        // Update health bar
        const healthPercent = this.fort.health / 100;
        this.healthBar.width = 100 * healthPercent;
        
        // Change health bar color based on health
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00FF00; // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xFFAA00; // Orange
        } else {
            this.healthBar.fillColor = 0xFF0000; // Red
        }
        
        this.healthText.setText(`${this.fort.health}%`);
    }

    // Utility methods
    preparePathogenPool() {
        // Create pool of pathogens for this level based on difficulty
        this.pathogenPool = PATHOGENS.filter(pathogen => 
            this.getDifficultyLevel(pathogen.difficulty) <= this.getDifficultyLevel(this.difficulty)
        );
    }

    getDifficultyLevel(difficultyName) {
        // Convert difficulty name to numeric level
        const levels = { 'easy': 1, 'normal': 2, 'hard': 3 };
        return levels[difficultyName] || 1;
    }

    getWaveDuration() {
        // Duration for each wave in milliseconds
        const baseDuration = 60000; // 1 minute
        const durationByWave = {
            1: baseDuration,
            2: baseDuration * 1.5,
            3: baseDuration * 2
        };
        
        return durationByWave[this.waveNumber] || baseDuration;
    }

    getPathogenSpawnInterval() {
        // Time between pathogen spawns in milliseconds
        const baseInterval = 2000; // 2 seconds
        const difficultyMultiplier = {
            'easy': 1.5,
            'normal': 1,
            'hard': 0.7
        };
        
        // As wave progresses, spawn faster
        const waveProgressMultiplier = 1 - (this.gameTime / (this.getWaveDuration() / 1000) * 0.5);
        
        // Add randomness
        const randomFactor = Phaser.Math.FloatBetween(0.8, 1.2);
        
        return baseInterval * 
               (difficultyMultiplier[this.difficulty] || 1) * 
               waveProgressMultiplier * 
               randomFactor;
    }

    getMaxWaves() {
        // Maximum number of waves based on difficulty
        return 3; // Each difficulty has 3 waves
    }
}
