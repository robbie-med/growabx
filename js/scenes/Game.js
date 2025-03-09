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
        
        // Create player (medical aircraft)
        this.createPlayer();
        
        // Setup physics groups
        this.pathogens = this.physics.add.group();
        this.missiles = this.physics.add.group();
        
        // Create antibiotics selection UI
        this.createAntibioticsUI();
        
        // Create HUD (heads-up display)
        this.createHUD();
        
        // Setup collisions
        this.physics.add.overlap(this.missiles, this.pathogens, this.handleMissilePathogenCollision, null, this);
        this.physics.add.overlap(this.pathogens, this.fort, this.handlePathogenFortCollision, null, this);
        
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
        
        // Handle player movement
        this.handlePlayerMovement();
        
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
        
        this.player = this.physics.add.sprite(centerX, playerY, 'player');
        
        // If no sprite is loaded, create a simple shape as placeholder
        if (!this.textures.exists('player')) {
            const playerGraphics = this.add.graphics();
            playerGraphics.fillStyle(0x00AAFF, 1);
            playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
            playerGraphics.fillStyle(0xFFFFFF, 1);
            playerGraphics.fillCircle(0, 0, 5);
            
            // Create texture from graphics
            playerGraphics.generateTexture('player', 40, 40);
            playerGraphics.destroy();
            
            // Now apply the texture
            this.player.setTexture('player');
        }
        
        this.player.setDisplaySize(40, 40);
        this.player.speed = 300;
        this.player.fireRate = 300; // milliseconds between shots
        this.player.lastFired = 0;
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
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        
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
        const remainingPathogens = this.pathogens.getChildren().length;
        
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

    handlePlayerMovement() {
        // Reset velocity
        this.player.setVelocity(0);
        
        // Movement based on cursor keys
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.player.speed);
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.player.speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.player.speed);
        }
        
        // Keep player within bounds
        const halfWidth = this.player.displayWidth / 2;
        const halfHeight = this.player.displayHeight / 2;
        const maxX = this.game.config.width - halfWidth;
        const maxY = this.game.config.height - 100 - halfHeight; // Above UI
        const minX = halfWidth;
        const minY = halfHeight;
        
        this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
        this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);
    }

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
        
        // Create missile
        this.createMissile(antibiotic);
        
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

    createMissile(antibiotic) {
        // Create missile from player position
        const missile = this.missiles.create(this.player.x, this.player.y, 'missile');
        
        // If no sprite exists, create one
        if (!this.textures.exists('missile')) {
            const missileGraphics = this.add.graphics();
            missileGraphics.fillStyle(0xFFFFFF, 1);
            missileGraphics.fillRect(-2, -8, 4, 16);
            
            // Create texture
            missileGraphics.generateTexture('missile', 4, 16);
            missileGraphics.destroy();
            
            // Now apply texture
            missile.setTexture('missile');
        }
        
        // Set properties
        missile.setDisplaySize(6, 18);
        missile.setTint(antibiotic.color);
        missile.antibioticId = antibiotic.id;
        missile.antibioticData = antibiotic;
        
        // Set velocity (upward)
        missile.setVelocityY(-400);
        
        // Destroy when out of bounds
        missile.checkWorldBounds = true;
        missile.outOfBoundsKill = true;
    }

    spawnPathogen() {
        // Select a random pathogen from the pool
        if (this.pathogenPool.length === 0) return;
        
        const pathogenData = Phaser.Utils.Array.GetRandom(this.pathogenPool);
        
        // Random x position at top of screen
        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        const y = -20; // Start above screen
        
        // Create pathogen sprite
        const pathogen = this.pathogens.create(x, y, `pathogen_${pathogenData.id}`);
        
        // If texture doesn't exist, create one
        if (!this.textures.exists(`pathogen_${pathogenData.id}`)) {
            const pathogenGraphics = this.add.graphics();
            
            // Draw basic circle
            pathogenGraphics.fillStyle(pathogenData.color, 1);
            pathogenGraphics.fillCircle(0, 0, 15);
            
            // Add shape details based on type
            if (pathogenData.shape === 'rod') {
                // Add elongation for rods
                pathogenGraphics.fillRect(-10, -5, 20, 10);
            } else if (pathogenData.shape === 'cocci' && pathogenData.name.includes('Strep')) {
                // Draw diplococci pattern for Strep
                pathogenGraphics.fillStyle(0xFFFFFF, 0.3);
                pathogenGraphics.fillCircle(-5, 0, 7);
                pathogenGraphics.fillCircle(5, 0, 7);
            } else if (pathogenData.shape === 'cocci' && pathogenData.name.includes('Staph')) {
                // Draw clustered pattern for Staph
                pathogenGraphics.fillStyle(0xFFFFFF, 0.3);
                pathogenGraphics.fillCircle(-5, -5, 5);
                pathogenGraphics.fillCircle(5, -5, 5);
                pathogenGraphics.fillCircle(0, 5, 5);
            }
            
            // Create texture
            pathogenGraphics.generateTexture(`pathogen_${pathogenData.id}`, 40, 40);
            pathogenGraphics.destroy();
            
            // Apply texture
            pathogen.setTexture(`pathogen_${pathogenData.id}`);
        }
        
        // Set properties
        pathogen.setDisplaySize(40, 40);
        pathogen.pathogenData = pathogenData;
        
        // Set movement speed based on difficulty
        const speed = pathogenData.speed[this.difficulty];
        
        // Calculate direction toward fort with some randomness
        const fortX = this.fort.x;
        const angle = Phaser.Math.Angle.Between(x, y, fortX, this.fort.y);
        const variance = Phaser.Math.FloatBetween(-0.2, 0.2); // Add some randomness
        
        // Set velocity based on angle
        pathogen.setVelocity(
            Math.cos(angle + variance) * speed,
            Math.sin(angle + variance) * speed
        );
        
        return pathogen;
    }

    startScanning() {
        this.scanning = true;
        
        // Find nearest pathogen to scan
        const pathogens = this.pathogens.getChildren();
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
            
            // Slow down the pathogen while scanning
            this.scanTarget.oldVelocity = {
                x: this.scanTarget.body.velocity.x,
                y: this.scanTarget.body.velocity.y
            };
            this.scanTarget.setVelocity(
                this.scanTarget.body.velocity.x * 0.3,
                this.scanTarget.body.velocity.y * 0.3
            );
        }
    }

    stopScanning() {
        this.scanning = false;
        
        // Destroy scan window
        if (this.scanWindow) {
            this.scanWindow.destroy();
            this.scanWindow = null;
        }
        
        // Restore pathogen speed
        if (this.scanTarget && this.scanTarget.active && this.scanTarget.oldVelocity) {
            this.scanTarget.setVelocity(
                this.scanTarget.oldVelocity.x,
                this.scanTarget.oldVelocity.y
            );
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
        // Check if antibiotic is effective against this pathogen
        const isEffective = pathogen.pathogenData.vulnerableTo.includes(missile.antibioticId);
        const isResistant = pathogen.pathogenData.resistantTo.includes(missile.antibioticId);
        
        if (isEffective) {
            // Destroy pathogen
            this.destroyPathogen(pathogen, true);
            missile.destroy();
            
            // Award points
            this.score += pathogen.pathogenData.points;
            
            // Update HUD
            this.updateHUD();
        } else if (isResistant) {
            // Pathogen is resistant - no effect
            missile.destroy();
            
            // Visual feedback
            this.showFloatingText(pathogen.x, pathogen.y, "RESISTANT!", 0xFF0000);
            
            // Mark as resistant (visual cue)
            pathogen.setTint(0xFF0000);
        } else {
            // Partial effect (wrong antibiotic but not resistant)
            missile.destroy();
            
            // Visual feedback
            this.showFloatingText(pathogen.x, pathogen.y, "Ineffective", 0xFFAA00);
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
