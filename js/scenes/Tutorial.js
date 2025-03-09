class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
        this.currentStep = 0;
        this.tutorialSteps = [];
    }
    
    init(data) {
        this.difficulty = data.difficulty || 'easy';
    }
    
    create() {
        // Background
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x0E2A47)
            .setOrigin(0, 0);
        
        // Tutorial title
        this.add.text(
            this.game.config.width / 2,
            50,
            'HOW TO PLAY',
            { fontSize: '32px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Create the player aircraft for demonstration
        this.player = this.add.sprite(this.game.config.width / 2, 400, 'player')
            .setDisplaySize(40, 40);
        
        // Create the fort
        this.fort = this.add.sprite(this.game.config.width / 2, 500, 'fort')
            .setDisplaySize(80, 90);
            
        // Example pathogen
        this.pathogen = this.add.circle(200, 200, 20, 0xAA4444)
            .setVisible(false);
        
        // Create tutorial steps
        this.createTutorialSteps();
        
        // Container for tutorial text
        this.tutorialContainer = this.add.container(this.game.config.width / 2, 150);
        
        // Next button
        this.nextButton = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height - 80,
            160,
            50,
            0x0066CC,
            1
        ).setInteractive();
        
        this.nextButtonText = this.add.text(
            this.game.config.width / 2,
            this.game.config.height - 80,
            'NEXT',
            { fontSize: '20px', fill: '#FFFFFF', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // Button hover effect
        this.nextButton.on('pointerover', () => {
            this.nextButton.setScale(1.05);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setScale(1);
        });
        
        // Button click
        this.nextButton.on('pointerdown', () => {
            this.nextStep();
        });
        
        // Skip tutorial button
        this.skipButton = this.add.text(
            this.game.config.width - 20,
            20,
            'SKIP',
            { fontSize: '16px', fill: '#CCCCCC' }
        ).setOrigin(1, 0)
          .setInteractive();
        
        this.skipButton.on('pointerover', () => {
            this.skipButton.setStyle({ fill: '#FFFFFF' });
        });
        
        this.skipButton.on('pointerout', () => {
            this.skipButton.setStyle({ fill: '#CCCCCC' });
        });
        
        this.skipButton.on('pointerdown', () => {
            this.startGame();
        });
        
        // Show first step
        this.showTutorialStep(0);
        
        // Create arrow key visual guides
        this.createArrowKeys();
    }
    
    createTutorialSteps() {
        this.tutorialSteps = [
            {
                title: "Welcome to Antibiotic Defense!",
                text: "In this game, you'll learn to match the right antibiotics to different pathogens.\n\nYou control a medical aircraft defending a patient from invading microbes.",
                setup: () => {
                    // Reset everything to default position
                    this.player.setPosition(this.game.config.width / 2, 400);
                    this.pathogen.setVisible(false);
                    this.hideArrowKeys();
                }
            },
            {
                title: "Moving Your Aircraft",
                text: "Use the ARROW KEYS to move your aircraft around the screen.\n\nStay mobile to intercept pathogens before they reach the patient!",
                setup: () => {
                    this.showArrowKeys();
                    
                    // Animate the player moving
                    this.tweens.add({
                        targets: this.player,
                        x: { from: 200, to: 600 },
                        yoyo: true,
                        duration: 2000,
                        repeat: -1
                    });
                }
            },
            {
                title: "Scanning Pathogens",
                text: "Press and hold SPACE to scan nearby pathogens.\n\nScanning reveals the pathogen's identity and which antibiotics are effective against it.",
                setup: () => {
                    this.hideArrowKeys();
                    this.tweens.killTweensOf(this.player);
                    this.player.setPosition(300, 300);
                    
                    // Show example pathogen
                    this.pathogen.setPosition(300, 200).setVisible(true);
                    
                    // Create scan example
                    if (!this.scanExample) {
                        this.scanExample = this.add.container(300, 130);
                        
                        const scanBg = this.add.rectangle(0, 0, 180, 100, 0x000000, 0.8)
                            .setOrigin(0.5);
                        this.scanExample.add(scanBg);
                        
                        const scanTitle = this.add.text(0, -35, "Staphylococcus aureus", 
                            { fontSize: '14px', fill: '#FFFFFF' })
                            .setOrigin(0.5);
                        this.scanExample.add(scanTitle);
                        
                        const scanDetails = this.add.text(0, -10, "Gram+ cocci in clusters", 
                            { fontSize: '12px', fill: '#FFFFFF' })
                            .setOrigin(0.5);
                        this.scanExample.add(scanDetails);
                        
                        const scanAntibiotics = this.add.text(0, 20, "Effective: Nafcillin, Vancomycin", 
                            { fontSize: '10px', fill: '#FFFFFF' })
                            .setOrigin(0.5);
                        this.scanExample.add(scanAntibiotics);
                        
                        this.scanExample.setAlpha(0);
                    }
                    
                    // Animation to show scanning effect
                    this.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            // Scan line animation
                            const scanLine = this.add.rectangle(300, 200, 50, 2, 0x00FFFF);
                            this.tweens.add({
                                targets: scanLine,
                                y: { from: 180, to: 220 },
                                alpha: { from: 1, to: 0.2 },
                                yoyo: true,
                                repeat: 2,
                                duration: 500,
                                onComplete: () => {
                                    scanLine.destroy();
                                    
                                    // Show scan results
                                    this.tweens.add({
                                        targets: this.scanExample,
                                        alpha: 1,
                                        duration: 300
                                    });
                                }
                            });
                        },
                        loop: true
                    });
                }
            },
            {
                title: "Choosing Antibiotics",
                text: "Select antibiotics using NUMBER KEYS (1-9) or by clicking on the antibiotic buttons at the bottom of the screen.\n\nDifferent pathogens are vulnerable to different antibiotics!",
                setup: () => {
                    if (this.scanExample) {
                        this.scanExample.setAlpha(0);
                    }
                    
                    // Create example antibiotic buttons
                    if (!this.antibioticExample) {
                        this.antibioticExample = this.add.container(this.game.config.width / 2, 350);
                        
                        const buttonWidth = 60;
                        const buttonHeight = 40;
                        const buttonSpacing = 10;
                        const totalWidth = (buttonWidth * 3) + (buttonSpacing * 2);
                        const startX = -totalWidth / 2;
                        
                        const antibiotics = [
                            { name: "Nafcillin", color: 0xFFAA00 },
                            { name: "Vanco", color: 0xAA00AA },
                            { name: "Cipro", color: 0x00FF00 }
                        ];
                        
                        antibiotics.forEach((antibiotic, index) => {
                            const x = startX + (buttonWidth / 2) + (buttonWidth + buttonSpacing) * index;
                            
                            const button = this.add.rectangle(x, 0, buttonWidth, buttonHeight, antibiotic.color);
                            this.antibioticExample.add(button);
                            
                            const keyText = this.add.text(x, -buttonHeight/2 - 15, `${index + 1}`, 
                                { fontSize: '14px', fill: '#FFFFFF' })
                                .setOrigin(0.5);
                            this.antibioticExample.add(keyText);
                            
                            const text = this.add.text(x, 0, antibiotic.name.substring(0, 5), 
                                { fontSize: '10px', fill: '#000000' })
                                .setOrigin(0.5);
                            this.antibioticExample.add(text);
                            
                            // Highlight animation for the first button
                            if (index === 0) {
                                this.tweens.add({
                                    targets: button,
                                    scaleX: 1.1,
                                    scaleY: 1.1,
                                    yoyo: true,
                                    repeat: -1,
                                    duration: 500
                                });
                            }
                        });
                    }
                    
                    this.antibioticExample.setAlpha(1);
                }
            },
            {
                title: "Firing Antibiotics",
                text: "Press F or click in the game area to fire the selected antibiotic.\n\nEach antibiotic has limited ammo and cooldown time, so choose wisely!",
                setup: () => {
                    // Reset position
                    this.player.setPosition(this.game.config.width / 2, 350);
                    this.pathogen.setPosition(this.game.config.width / 2, 200).setVisible(true);
                    
                    if (this.antibioticExample) {
                        this.antibioticExample.setAlpha(0);
                    }
                    
                    // Show firing animation
                    this.time.addEvent({
                        delay: 1500,
                        callback: () => {
                            // Create missile
                            const missile = this.add.rectangle(
                                this.player.x, 
                                this.player.y - 20, 
                                6, 
                                18, 
                                0xFFAA00
                            );
                            
                            // Animate missile
                            this.tweens.add({
                                targets: missile,
                                y: this.pathogen.y,
                                duration: 500,
                                onComplete: () => {
                                    missile.destroy();
                                    
                                    // Explosion effect
                                    const particles = [];
                                    for (let i = 0; i < 20; i++) {
                                        const particle = this.add.circle(
                                            this.pathogen.x, 
                                            this.pathogen.y, 
                                            Phaser.Math.Between(2, 4), 
                                            0x00FF00
                                        );
                                        
                                        this.tweens.add({
                                            targets: particle,
                                            x: this.pathogen.x + Phaser.Math.Between(-50, 50),
                                            y: this.pathogen.y + Phaser.Math.Between(-50, 50),
                                            alpha: 0,
                                            duration: 500,
                                            onComplete: () => {
                                                particle.destroy();
                                            }
                                        });
                                        
                                        particles.push(particle);
                                    }
                                    
                                    // Hide pathogen
                                    this.pathogen.setVisible(false);
                                    
                                    // Show success text
                                    const successText = this.add.text(
                                        this.pathogen.x, 
                                        this.pathogen.y, 
                                        "ELIMINATED!", 
                                        { fontSize: '16px', fill: '#00FF00' }
                                    ).setOrigin(0.5);
                                    
                                    this.tweens.add({
                                        targets: successText,
                                        y: this.pathogen.y - 30,
                                        alpha: 0,
                                        duration: 1000,
                                        onComplete: () => {
                                            successText.destroy();
                                        }
                                    });
                                }
                            });
                        },
                        loop: true
                    });
                }
            },
            {
                title: "Defending the Patient",
                text: "Don't let pathogens reach the patient! Each hit will damage the patient's health.\n\nMatching the correct antibiotic is vital - using the wrong one may have no effect or even cause resistance!",
                setup: () => {
                    // Show fort and pathogen
                    this.player.setPosition(this.game.config.width / 2, 300);
                    this.pathogen.setPosition(this.game.config.width / 2, 150).setVisible(true);
                    
                    // Animate pathogen moving toward fort
                    this.tweens.add({
                        targets: this.pathogen,
                        y: 450,
                        duration: 3000,
                        onComplete: () => {
                            // Flash the fort red
                            this.tweens.add({
                                targets: this.fort,
                                alpha: 0.5,
                                yoyo: true,
                                repeat: 3,
                                duration: 100
                            });
                            
                            // Shake camera
                            this.cameras.main.shake(200, 0.01);
                            
                            // Reset pathogen
                            this.pathogen.setPosition(this.game.config.width / 2, 150);
                            
                            // Restart animation
                            this.tweens.add({
                                targets: this.pathogen,
                                y: 450,
                                duration: 3000,
                                delay: 2000,
                                onComplete: () => {
                                    // Flash the fort red
                                    this.tweens.add({
                                        targets: this.fort,
                                        alpha: 0.5,
                                        yoyo: true,
                                        repeat: 3,
                                        duration: 100
                                    });
                                    
                                    // Shake camera
                                    this.cameras.main.shake(200, 0.01);
                                    
                                    // Hide pathogen
                                    this.pathogen.setVisible(false);
                                }
                            });
                        }
                    });
                }
            },
            {
                title: "Ready to Start?",
                text: "Now you're ready to defend against the incoming pathogens!\n\nRemember: scan to identify, select the right antibiotic, and fire to eliminate the threat.\n\nGood luck!",
                setup: () => {
                    // Show all elements in ready position
                    this.player.setPosition(this.game.config.width / 2, 400);
                    this.tweens.killTweensOf(this.player);
                    
                    this.pathogen.setVisible(false);
                    
                    // Change button text for final step
                    this.nextButtonText.setText('START GAME');
                }
            }
        ];
    }
    
    showTutorialStep(stepIndex) {
        // Clear previous content
        this.tutorialContainer.removeAll();
        
        // Get step data
        const step = this.tutorialSteps[stepIndex];
        
        // Kill any running tweens/timers
        this.tweens.killAll();
        this.time.removeAllEvents();
        
        // Run setup function for this step
        if (step.setup) {
            step.setup();
        }
        
        // Create title text
        const title = this.add.text(
            0, -40,
            step.title,
            { fontSize: '24px', fill: '#FFFF00', fontStyle: 'bold' }
        ).setOrigin(0.5, 0);
        
        // Create body text
        const text = this.add.text(
            0, 0,
            step.text,
            { fontSize: '18px', fill: '#FFFFFF', align: 'center', wordWrap: { width: 600 } }
        ).setOrigin(0.5, 0);
        
        // Add to container
        this.tutorialContainer.add([title, text]);
        
        // Update current step
        this.currentStep = stepIndex;
        
        // Update step indicator
        this.updateStepIndicator();
    }
    
    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.showTutorialStep(this.currentStep + 1);
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.scene.start('GameScene', { difficulty: this.difficulty });
    }
    
    updateStepIndicator() {
        // Remove existing indicators
        this.children.list
            .filter(child => child.stepIndicator)
            .forEach(indicator => indicator.destroy());
        
        // Create step indicators
        const totalSteps = this.tutorialSteps.length;
        const dotRadius = 5;
        const dotSpacing = 15;
        const totalWidth = (dotRadius * 2 * totalSteps) + (dotSpacing * (totalSteps - 1));
        const startX = (this.game.config.width - totalWidth) / 2 + dotRadius;
        
        for (let i = 0; i < totalSteps; i++) {
            const x = startX + (dotRadius * 2 + dotSpacing) * i;
            const color = i === this.currentStep ? 0xFFFFFF : 0x666666;
            
            const dot = this.add.circle(x, this.game.config.height - 40, dotRadius, color);
            dot.stepIndicator = true;
        }
    }
    
    createArrowKeys() {
        // Position for arrow keys
        const centerX = this.game.config.width / 2;
        const centerY = 250;
        const keySize = 40;
        const keySpacing = 5;
        
        // Create container for keys
        this.arrowKeysContainer = this.add.container(centerX, centerY);
        this.arrowKeysContainer.setAlpha(0);
        
        // Up arrow
        const upKey = this.add.rectangle(0, -keySize - keySpacing, keySize, keySize, 0xAAAAAA, 1)
            .setStrokeStyle(2, 0xFFFFFF);
        const upArrow = this.add.text(0, -keySize - keySpacing, '↑', { fontSize: '24px', fill: '#FFFFFF' })
            .setOrigin(0.5);
        
        // Left arrow
        const leftKey = this.add.rectangle(-keySize - keySpacing, 0, keySize, keySize, 0xAAAAAA, 1)
            .setStrokeStyle(2, 0xFFFFFF);
        const leftArrow = this.add.text(-keySize - keySpacing, 0, '←', { fontSize: '24px', fill: '#FFFFFF' })
            .setOrigin(0.5);
        
        // Down arrow
        const downKey = this.add.rectangle(0, keySize + keySpacing, keySize, keySize, 0xAAAAAA, 1)
            .setStrokeStyle(2, 0xFFFFFF);
        const downArrow = this.add.text(0, keySize + keySpacing, '↓', { fontSize: '24px', fill: '#FFFFFF' })
            .setOrigin(0.5);
        
        // Right arrow
        const rightKey = this.add.rectangle(keySize + keySpacing, 0, keySize, keySize, 0xAAAAAA, 1)
            .setStrokeStyle(2, 0xFFFFFF);
        const rightArrow = this.add.text(keySize + keySpacing, 0, '→', { fontSize: '24px', fill: '#FFFFFF' })
            .setOrigin(0.5);
        
        // Add all to container
        this.arrowKeysContainer.add([upKey, upArrow, leftKey, leftArrow, downKey, downArrow, rightKey, rightArrow]);
    }
    
    showArrowKeys() {
        this.arrowKeysContainer.setAlpha(1);
        
        // Animation for keys
        const keys = this.arrowKeysContainer.list.filter(item => item.type === 'Rectangle');
        
        // Highlight keys in sequence
        this.time.addEvent({
            delay: 800,
            callback: () => {
                // Reset all keys
                keys.forEach(key => key.setFillStyle(0xAAAAAA));
                
                // Highlight random key
                const randomKey = Phaser.Utils.Array.GetRandom(keys);
                randomKey.setFillStyle(0x00AAFF);
            },
            loop: true
        });
    }
    
    hideArrowKeys() {
        this.arrowKeysContainer.setAlpha(0);
    }
}
