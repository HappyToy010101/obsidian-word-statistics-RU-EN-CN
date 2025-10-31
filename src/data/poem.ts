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

    chinese: `你的名字是手中的鸟，
你的名字是舌尖的冰。
唯一双唇的动作。
你的名字是五个字母。
球在空中被接住，
银铃在嘴里。
石头扔进安静的池塘，
啜泣着你的名字。
在夜间马蹄的轻响中
你响亮的名字雷鸣。
它会在太阳穴呼唤我们
响亮的扣动扳机。
你的名字——不能！——
你的名字是吻在眼睛上，
在不动眼睑的温柔寒冷中，
你的名字是雪中的吻。
关键，冰冷，蓝色的一口。
带着你的名字——沉睡。`
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
        totalWords: 91,
        uniqueWords: 50,
        topWords: [
            { word: '的', count: 10 },
            { word: '名字', count: 9 },
            { word: '你的', count: 8 },
            { word: '在', count: 6 },
            { word: '是', count: 5 },
            { word: '中', count: 2 },
            { word: '响亮', count: 2 },
            { word: '吻', count: 2 }
        ]
    }
} as const;
