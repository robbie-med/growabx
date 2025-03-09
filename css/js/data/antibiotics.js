/**
 * Antibiotic weapons definitions
 * - id: unique identifier
 * - name: display name
 * - class: antibiotic class (for grouping)
 * - color: color for rendering missile/button
 * - icon: icon or shape to use for the missile
 * - spectrum: what types of pathogens it works against
 * - effectiveness: base damage against vulnerable pathogens
 * - cooldown: reload time in milliseconds
 * - ammo: number of shots available per level
 * - description: educational info about this antibiotic
 * - unlockLevel: minimum difficulty level where available
 */
const ANTIBIOTICS = [
    // EASY LEVEL ANTIBIOTICS
    {
        id: 'penicillin',
        name: 'Penicillin',
        class: 'beta_lactam',
        color: 0xFFFF00, // yellow
        icon: 'pill',
        spectrum: ['gram_positive'],
        effectiveness: 10,
        cooldown: 1000,
        ammo: 10,
        description: "First antibiotic discovered. Effective against many gram-positive bacteria.",
        unlockLevel: 'easy'
    },
    {
        id: 'nafcillin',
        name: 'Nafcillin',
        class: 'penicillin',
        color: 0xFFAA00, // orange
        icon: 'pill',
        spectrum: ['gram_positive'],
        effectiveness: 12,
        cooldown: 1200,
        ammo: 8,
        description: "Beta-lactamase resistant penicillin. Good for Staph (except MRSA).",
        unlockLevel: 'easy'
    },
    {
        id: 'ceftriaxone',
        name: 'Ceftriaxone',
        class: 'cephalosporin',
        color: 0x00AAFF, // light blue
        icon: 'syringe',
        spectrum: ['gram_positive', 'gram_negative'],
        effectiveness: 10,
        cooldown: 1500,
        ammo: 8,
        description: "3rd gen cephalosporin. Broad spectrum but doesn't cover Pseudomonas.",
        unlockLevel: 'easy'
    },
    {
        id: 'vancomycin',
        name: 'Vancomycin',
        class: 'glycopeptide',
        color: 0xAA00AA, // purple
        icon: 'syringe',
        spectrum: ['gram_positive'],
        effectiveness: 15,
        cooldown: 2000,
        ammo: 6,
        description: "Glycopeptide active against most gram-positive bacteria including MRSA.",
        unlockLevel: 'easy'
    },

    // NORMAL LEVEL ANTIBIOTICS
    {
        id: 'ciprofloxacin',
        name: 'Ciprofloxacin',
        class: 'fluoroquinolone',
        color: 0x00FF00, // green
        icon: 'pill',
        spectrum: ['gram_negative', 'gram_positive'],
        effectiveness: 10,
        cooldown: 1500,
        ammo: 7,
        description: "Fluoroquinolone. Good against gram negatives and some gram positives.",
        unlockLevel: 'normal'
    },
    {
        id: 'piperacillin_tazo',
        name: 'Piperacillin-Tazobactam',
        class: 'penicillin_plus_inhibitor',
        color: 0xFF00FF, // pink
        icon: 'syringe',
        spectrum: ['gram_positive', 'gram_negative'],
        effectiveness: 14,
        cooldown: 1800,
        ammo: 6,
        description: "Anti-pseudomonal penicillin with beta-lactamase inhibitor. Very broad spectrum.",
        unlockLevel: 'normal'
    },
    {
        id: 'cefepime',
        name: 'Cefepime',
        class: 'cephalosporin',
        color: 0x0088FF, // blue
        icon: 'syringe',
        spectrum: ['gram_positive', 'gram_negative'],
        effectiveness: 12,
        cooldown: 1700,
        ammo: 7,
        description: "4th gen cephalosporin. Covers Pseudomonas and many resistant organisms.",
        unlockLevel: 'normal'
    },
    {
        id: 'tobramycin',
        name: 'Tobramycin',
        class: 'aminoglycoside',
        color: 0xFFAAAA, // light pink
        icon: 'syringe',
        spectrum: ['gram_negative'],
        effectiveness: 12,
        cooldown: 2000,
        ammo: 5,
        description: "Aminoglycoside. Strong against gram negatives, especially Pseudomonas.",
        unlockLevel: 'normal'
    },

    // HARD LEVEL ANTIBIOTICS
    {
        id: 'meropenem',
        name: 'Meropenem',
        class: 'carbapenem',
        color: 0xFF0000, // red
        icon: 'syringe',
        spectrum: ['gram_positive', 'gram_negative'],
        effectiveness: 16,
        cooldown: 2500,
        ammo: 4,
        description: "Carbapenem. Very broad spectrum. Reserve for serious infections.",
        unlockLevel: 'hard'
    },
    {
        id: 'daptomycin',
        name: 'Daptomycin',
        class: 'lipopeptide',
        color: 0xDD88FF, // lavender
        icon: 'syringe',
        spectrum: ['gram_positive'],
        effectiveness: 15,
        cooldown: 2200,
        ammo: 4,
        description: "Lipopeptide. Active against resistant gram positives including VRE.",
        unlockLevel: 'hard'
    },
    {
        id: 'ceftaroline',
        name: 'Ceftaroline',
        class: 'cephalosporin',
        color: 0x00FFFF, // cyan
        icon: 'syringe',
        spectrum: ['gram_positive', 'gram_negative'],
        effectiveness: 14,
        cooldown: 2000,
        ammo: 5,
        description: "5th gen cephalosporin. Works against MRSA unlike other cephalosporins.",
        unlockLevel: 'hard'
    },
    {
        id: 'colistin',
        name: 'Colistin',
        class: 'polymyxin',
        color: 0x333333, // dark gray
        icon: 'syringe',
        spectrum: ['gram_negative'],
        effectiveness: 18,
        cooldown: 3000,
        ammo: 3,
        description: "Polymyxin. Last resort for multi-drug resistant gram negatives.",
        unlockLevel: 'hard'
    },
    {
        id: 'fluconazole',
        name: 'Fluconazole',
        class: 'azole',
        color: 0xFFFF99, // light yellow
        icon: 'pill',
        spectrum: ['fungal'],
        effectiveness: 14,
        cooldown: 2000,
        ammo: 4,
        description: "Antifungal medication. Used for yeast infections like Candida.",
        unlockLevel: 'hard'
    },
    {
        id: 'micafungin',
        name: 'Micafungin',
        class: 'echinocandin',
        color: 0xDDDD00, // dark yellow
        icon: 'syringe',
        spectrum: ['fungal'],
        effectiveness: 16,
        cooldown: 2500,
        ammo: 3,
        description: "Echinocandin antifungal. Used for serious Candida infections.",
        unlockLevel: 'hard'
    }
];
