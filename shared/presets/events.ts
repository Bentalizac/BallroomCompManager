export interface EventPreset {
    name: string;
    level: string;
    catagory: string;
    
    different_final: boolean;

    dances: string[];
    final_dances: string[];

    target_round_length: number; // seconds
    target_final_round_length: number; // seconds
    target_callback_percent: number; // 0-1

    final_max_couples: number;
    final_min_couples: number;
    final_target_couples: number;

    min_time_between_rounds: number; // seconds

    target_couples_per_heat: number;
    max_couples_per_heat: number;
    min_couples_per_heat: number;

    min_judges: number;
    max_judges: number;
    target_judges: number;
}

// Multi-tier inheritance system
export const basePresets = {
    
    /////////////////////////////////////////////////////
    // Tier 1: Global defaults for all ballroom events //
    /////////////////////////////////////////////////////

    global: {
        target_round_length: 90,
        target_final_round_length: 120,
        target_callback_percent: 0.5,
        min_time_between_rounds: 1800,
        target_couples_per_heat: 6,
        max_couples_per_heat: 8,
        min_couples_per_heat: 4,
        min_judges: 1,
        max_judges: 0,
        target_judges: 1,
        final_max_couples: 8,
        final_min_couples: 6,
        final_target_couples: 8,
        different_final: true,
        final_dances: [] as string[]
    },


    ///////////////////////////////////////////////////
    // Tier 2: Level-specific (inherits from global) //
    ///////////////////////////////////////////////////

    proAm: {
        level: "ProAm",
        min_judges: 5,
        target_judges: 5
    },

    professional: {
        level: "Professional",
        min_judges: 7,
        target_judges: 7
    },

    championship: {
        level: "Championship",
        min_judges: 7,
        target_judges: 7
    },

    preChampionship: {
        level: "PreChampionship",
        min_judges: 3,
        target_judges: 3
    },

    novice: {
        level: "Novice",
        min_judges: 5,
        target_judges: 5
    },

    gold: {
        level: "Gold",
        min_judges: 3,
        target_judges: 3
    },

    silver: {
        level: "Silver",
        min_judges: 3,
        target_judges: 3
    },
    
    bronze: {
        level: "Bronze",
        min_judges: 3,
        target_judges: 3
    },
    
    Newcomer: {
        level: "Newcomer",
        min_judges: 3,
        target_judges: 3
    },


    //////////////////////////////////////////////////////////////
    // Tier 3: Category-specific (inherits from level + global) //
    //////////////////////////////////////////////////////////////

    // proAm
    proAmLatin: {
        catagory: "Latin",
    },
    proAmStandard: {
        catagory: "Standard",
    },
    proAmRhythm: {
        catagory: "Rhythm",
    },
    proAmSmooth: {
        catagory: "Smooth",
    },

    // professional
    professionalLatin: {
        catagory: "Latin",
    },

    professionalStandard: {
        catagory: "Standard",
    },

    professionalRhythm: {
        catagory: "Rhythm",
    },

    professionalSmooth: {
        catagory: "Smooth",
    },

    // championship
    championshipLatin: {
        catagory: "Latin",
    },

    championshipStandard: {
        catagory: "Standard", 
    },

    championshipRhythm: {
        catagory: "Rhythm",
    },

    championshipSmooth: {
        catagory: "Smooth",
    },


    // preChampionship
    preChampionshipLatin: {
        catagory: "Latin",
    },

    preChampionshipStandard: {
        catagory: "Standard",
    },

    preChampionshipRhythm: {
        catagory: "Rhythm",
    },

    preChampionshipSmooth: {
        catagory: "Smooth",
    },

    // novice
    noviceLatin: {
        catagory: "Latin",
    },

    noviceStandard: {
        catagory: "Standard",
    },

    noviceRhythm: {
        catagory: "Rhythm",
    },

    noviceSmooth: {
        catagory: "Smooth",
    },

    // gold
    goldLatin: {
        catagory: "Latin",
    },

    goldStandard: {
        catagory: "Standard",
    },

    goldRhythm: {
        catagory: "Rhythm",
    },

    goldSmooth: {
        catagory: "Smooth",
    },

    // silver
    silverLatin: {
        catagory: "Latin",
    },

    silverStandard: {
        catagory: "Standard",
    },

    silverRhythm: {
        catagory: "Rhythm",
    },

    silverSmooth: {
        catagory: "Smooth",
    },

    // bronze
    bronzeLatin: {
        catagory: "Latin",
    },

    bronzeStandard: {
        catagory: "Standard",
    },

    bronzeRhythm: {
        catagory: "Rhythm",
    },

    bronzeSmooth: {
        catagory: "Smooth",
    },

    // newcomer
    newcomerLatin: {
        catagory: "Latin",
    },

    newcomerStandard: {
        catagory: "Standard",
    },

    newcomerRhythm: {
        catagory: "Rhythm",
    },

    newcomerSmooth: {
        catagory: "Smooth",
    },
};

// Helper function to create preset with multi-tier inheritance
function createPreset(
    levelBase: Partial<EventPreset>, 
    categoryBase: Partial<EventPreset>, 
    overrides: Partial<EventPreset>
): EventPreset {
    return {
        ...basePresets.global,
        ...levelBase,
        ...categoryBase,
        ...overrides,
        final_dances: overrides.final_dances || overrides.dances || []
    } as EventPreset;
}


export const eventPresets: EventPreset[] = [
    // Amateur Latin: Global -> Amateur -> Amateur Latin -> Specific
    createPreset(
        basePresets.amateur, 
        basePresets.amateurLatin, 
        {
            name: "Amateur Latin",
            dances: ["Cha Cha", "Rumba", "Samba", "Paso Doble", "Jive"]
        }
    ),
    
    // Amateur Standard: Global -> Amateur -> Amateur Standard -> Specific  
    createPreset(
        basePresets.amateur,
        basePresets.amateurStandard,
        {
            name: "Amateur Standard", 
            dances: ["Waltz", "Tango", "Viennese Waltz", "Foxtrot", "Quickstep"]
        }
    ),
    
    // Novice Latin: Global -> Novice -> Novice Latin -> Specific
    createPreset(
        basePresets.novice,
        basePresets.noviceLatin,
        {
            name: "Novice Latin",
            dances: ["Cha Cha", "Rumba"],
            final_target_couples: 4 // Even more specific override
        }
    )
];