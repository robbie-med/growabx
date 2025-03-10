/**
 * Pathogen definitions
 * - id: unique identifier
 * - name: display name
 * - type: classification (gram+, gram-, fungal)
 * - shape: visual shape (cocci, rod, etc)
 * - color: primary color for rendering
 * - speed: movement speed (varies by difficulty)
 * - details: additional info shown when scanned
 * - vulnerableTo: array of antibiotic IDs that are effective
 * - resistantTo: array of antibiotic IDs that are ineffective
 * - points: score awarded for destroying this pathogen
 * - difficulty: minimum difficulty level where this appears
 */
const PATHOGENS = [
    // EASY LEVEL PATHOGENS
    {
        id: 'staph_aureus',
        name: 'Staphylococcus aureus',
        type: 'gram_positive',
        shape: 'cocci',
        color: 0xAA4444, // reddish
        speed: { easy: 50, normal: 70, hard: 100 },
        details: "Gram+ cocci in clusters, coagulase+",
        vulnerableTo: ['nafcillin', 'vancomycin', 'ceftaroline'],
        resistantTo: ['aztreonam'],
        points: 10,
        difficulty: 'easy'
    },
    {
        id: 'strep_pneumo',
        name: 'Streptococcus pneumoniae',
        type: 'gram_positive',
        shape: 'cocci',
        color: 0xCC7744, // orange
        speed: { easy: 40, normal: 60, hard: 90 },
        details: "Gram+ diplococci, alpha-hemolytic",
        vulnerableTo: ['penicillin', 'ceftriaxone', 'levofloxacin'],
        resistantTo: ['aztreonam', 'tobramycin'],
        points: 10,
        difficulty: 'easy'
    },
    {
        id: 'e_coli',
        name: 'Escherichia coli',
        type: 'gram_negative',
        shape: 'rod',
        color: 0x4444AA, // blue
        speed: { easy: 60, normal: 80, hard: 110 },
        details: "Gram- rod, lactose fermenter",
        vulnerableTo: ['ceftriaxone', 'ciprofloxacin', 'piperacillin_tazo'],
        resistantTo: ['nafcillin', 'vancomycin'],
        points: 15,
        difficulty: 'easy'
    },

    // NORMAL LEVEL PATHOGENS
    {
        id: 'pseudomonas',
        name: 'Pseudomonas aeruginosa',
        type: 'gram_negative',
        shape: 'rod',
        color: 0x44AA44, // green
        speed: { easy: 60, normal: 90, hard: 130 },
        details: "Gram- rod, non-fermenter, oxidase+",
        vulnerableTo: ['piperacillin_tazo', 'cefepime', 'tobramycin', 'meropenem'],
        resistantTo: ['ceftriaxone', 'nafcillin', 'vancomycin'],
        points: 20,
        difficulty: 'normal'
    },
    {
        id: 'klebsiella',
        name: 'Klebsiella pneumoniae',
        type: 'gram_negative',
        shape: 'rod',
        color: 0x7744AA, // purple
        speed: { easy: 50, normal: 80, hard: 120 },
        details: "Gram- rod, encapsulated, mucoid",
        vulnerableTo: ['ceftriaxone', 'meropenem', 'ciprofloxacin'],
        resistantTo: ['nafcillin', 'vancomycin'],
        points: 15,
        difficulty: 'normal'
    },
    {
        id: 'enterococcus',
        name: 'Enterococcus faecalis',
        type: 'gram_positive',
        shape: 'cocci',
        color: 0xAAAA44, // yellowish
        speed: { easy: 45, normal: 65, hard: 95 },
        details: "Gram+ cocci in chains, VRE risk",
        vulnerableTo: ['ampicillin', 'vancomycin', 'daptomycin'],
        resistantTo: ['ceftriaxone', 'aztreonam'],
        points: 15,
        difficulty: 'normal'
    },
    
    // HARD LEVEL PATHOGENS
    {
        id: 'mrsa',
        name: 'MRSA',
        type: 'gram_positive',
        shape: 'cocci',
        color: 0xDD0000, // bright red
        speed: { easy: 70, normal: 100, hard: 150 },
        details: "Methicillin-resistant S. aureus",
        vulnerableTo: ['vancomycin', 'daptomycin', 'ceftaroline'],
        resistantTo: ['nafcillin', 'ceftriaxone', 'ampicillin'],
        points: 30,
        difficulty: 'hard'
    },
    {
        id: 'cre',
        name: 'CRE',
        type: 'gram_negative',
        shape: 'rod',
        color: 0x000088, // dark blue
        speed: { easy: 80, normal: 120, hard: 180 },
        details: "Carbapenem-resistant Enterobacteriaceae",
        vulnerableTo: ['colistin', 'tigecycline'],
        resistantTo: ['meropenem', 'ceftriaxone', 'piperacillin_tazo'],
        points: 40,
        difficulty: 'hard'
    },
    {
        id: 'c_diff',
        name: 'Clostridioides difficile',
        type: 'gram_positive',
        shape: 'rod',
        color: 0xAA22AA, // magenta
        speed: { easy: 65, normal: 90, hard: 135 },
        details: "Gram+ spore forming rod, toxin producer",
        vulnerableTo: ['vancomycin', 'fidaxomicin', 'metronidazole'],
        resistantTo: ['levofloxacin', 'ceftriaxone'],
        points: 35,
        difficulty: 'hard'
    },
    {
        id: 'candida',
        name: 'Candida albicans',
        type: 'fungal',
        shape: 'yeast',
        color: 0xFFFFAA, // light yellow
        speed: { easy: 40, normal: 60, hard: 90 },
        details: "Fungal pathogen, yeast form",
        vulnerableTo: ['fluconazole', 'micafungin'],
        resistantTo: ['all_antibiotics'],
        points: 30,
        difficulty: 'hard'
    }
];
