// Test poem content and expected stats used by the enhanced test system

export const POEM_CONTENT = {
    russian: `Имя твое — птица в руке,
Имя твое — льдинка на языке.
Одно единственное движенье губ.
Имя твое — пять букв.
Мячик, пойманный на лету,
Серебряный бубенец во рту.
Камень, кинутый в тихий пруд,
Всхлипнет так, как тебя зовут.
В легком щелканье ночных копыт
Громкое имя твое гремит.
И назовет его нам в висок
Звонко щелкающий курок.
Имя твое — ах, нельзя! —
Имя твое — поцелуй в глаза,
В нежную стужу недвижных век,
Имя твое — поцелуй в снег.
Ключевой, ледяной, голубой глоток.
С именем твоим — сон глубок.`,

    english: `Your name is a bird in my hand,
Your name is an ice chip on my tongue.
One single movement of the lips.
Your name is five letters.
A ball caught on the fly,
A silver bell in the mouth.
A stone thrown into a quiet pond,
Will sob as you are called.
In the light click of night hooves
Your loud name thunders.
And will call it to us in the temple
Loudly clicking the trigger.
Your name — oh, cannot be! —
Your name is a kiss on the eyes,
In the gentle cold of motionless eyelids,
Your name is a kiss in the snow.
Key, icy, blue gulp.
With your name — sleep deep.`,

    chinese: `你的名字在风中，
你的名字在雨里。
我们在这里，你们在那里，他们在远方。
我们的名字在清晨醒来，
你们的故事在夜里回响，
他们的梦想在星空下生长。
她们的心在黎明歌唱，它们的影子在水面摇晃。
这是我们的诗，也是你们的梦，更是他们的路。
我 们 的 朋友记得我们，你 们 的 朋友想念你们，
他 们 的 回声告诉她们：我们的、你们的、他们的，都在这首诗里。`
} as const;

// Expected statistics for each language - keep in sync with dictionary behavior
export const EXPECTED_STATS = {
    russian: {
        totalWords: 82,
        uniqueWords: 59,
        topWords: [
            { word: 'имя', count: 8 },
            { word: 'твой', count: 8 },
            { word: 'в', count: 8 },
            { word: 'на', count: 2 },
            { word: 'поцелуй', count: 2 },
            { word: 'птица', count: 1 },
            { word: 'рука', count: 1 }
        ]
    },
    english: {
        totalWords: 114,
        uniqueWords: 69,
        topWords: [
            { word: 'the', count: 9 },
            { word: 'your', count: 8 },
            { word: 'name', count: 8 },
            { word: 'a', count: 8 },
            { word: 'in', count: 6 },
            { word: 'is', count: 5 },
            { word: 'on', count: 3 },
            { word: 'of', count: 3 }
        ]
    },
    chinese: {
        totalWords: 120,
        uniqueWords: 62,
        topWords: [
            { word: '的', count: 12 },
            { word: '名字', count: 6 },
            { word: '你的', count: 4 },
            { word: '我们的', count: 4 },
            { word: '你们的', count: 4 },
            { word: '他们的', count: 4 },
            { word: '在', count: 6 }
        ]
    }
} as const;
