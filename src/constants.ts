// Shared dictionaries and URLs
export const DICTIONARY_URLS = {
    russian: "https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/dictionaries/russian_lemmas.txt",
    english: "https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/dictionaries/english_lemmas.txt",
    chinese: "https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/dictionaries/chinese_words.txt"
};

export const DEFAULT_DICTIONARIES = {
    russian: `# Russian Lemmas Dictionary
# Format: wordform=lemma

# Предлоги (объединяем формы)
в=в
во=в
со=с
об=о
обо=о
из=из
изо=из
ко=к
ото=от
надо=над
передо=перед
пред=перед
предо=перед

# Местоимения (оставляем как есть)
я=я
мне=мне
меня=меня
мной=мной
ты=ты
тебе=тебе
тебя=тебя
тобой=тобой
он=он
его=его
ему=ему
им=им
нем=нем
она=она
её=её
ей=ей
ею=ею
ней=ней
оно=оно
мы=мы
нам=нам
нас=нас
нами=нами
вы=вы
вас=вас
вам=вам
вами=вами
они=они
их=их
им=им
ними=ними
них=них

# Существительные
дом=дом
дома=дом
дому=дом
домом=дом
доме=дом
дома=дом
домов=дом
стол=стол
стола=стол
столу=стол
столом=стол
столе=стол
столы=стол
столов=стол
книга=книга
книги=книга
книгу=книга
книгой=книга
книге=книга
книги=книга
книг=книга

# Глаголы
бежать=бежать
бегу=бежать
бежишь=бежать
бежит=бежать
бежим=бежать
бежите=бежать
бегут=бежать
бежал=бежать
бежала=бежать
бежало=бежать
бежали=бежать
читать=читать
читаю=читать
читаешь=читать
читает=читать
читаем=читать
читаете=читать
читают=читать
читал=читать
читала=читать
читало=читать
читали=читать

# Прилагательные
красивый=красивый
красивого=красивый
красивому=красивый
красивым=красивый
красивом=красивый
красивая=красивый
красивой=красивый
красивую=красивый
красивою=красивый
красивое=красивый
красивые=красивый
красивых=красивый
красивыми=красивый

# Слова из полного стихотворения
имя=имя
твое=твой
птица=птица
руке=рука
льдинка=льдинка
языке=язык
движенье=движение
губ=губа
букв=буква
мячик=мячик
пойманный=поймать
лету=лет
серебряный=серебряный
бубенец=бубенец
рту=рот
камень=камень
кинутый=кинуть
тихий=тихий
пруд=пруд
всхлипнет=всхлипнуть
зовут=звать
легком=легкий
щелканье=щёлкать
ночных=ночной
копыт=копыто
громкое=громкий
гремит=греметь
назовет=назвать
висок=висок
звонко=звонкий
щелкающий=щёлкать
курок=курок
поцелуй=поцелуй
глаза=глаз
нежную=нежный
стужу=стужа
недвижных=недвижный
век=век
снег=снег
ключевой=ключевой
ледяной=ледяной
голубой=голубой
глоток=глоток
именем=имя
твоим=твой
сон=сон
глубок=глубокий
ё=е
щёлкать=щёлкать`,

    english: `# English Lemmas Dictionary
# Format: wordform=lemma

# Pronouns (keep as is)
I=I
me=me
my=my
mine=mine
you=you
your=your
yours=yours
he=he
him=him
his=his
she=she
her=her
hers=hers
it=it
its=its
we=we
us=us
our=our
ours=ours
they=they
them=them
their=their
theirs=theirs

# Common verbs
be=be
am=be
is=be
are=be
was=be
were=be
being=be
been=be
have=have
has=have
had=have
having=have
do=do
does=do
did=do
doing=do
run=run
running=run
ran=run
read=read
reading=read
reads=read
write=write
writing=write
writes=write
wrote=write
written=write

# Common nouns
book=book
books=book
house=house
houses=house
table=table
tables=table
computer=computer
computers=computer

# Words from full poem translation
your=your
name=name
is=be
bird=bird
in=in
hand=hand
ice=ice
chip=chip
on=on
tongue=tongue
one=one
single=single
movement=movement
of=of
lips=lip
five=five
letters=letter
ball=ball
caught=catch
flight=flight
silver=silver
bell=bell
mouth=mouth
stone=stone
thrown=throw
into=into
quiet=quiet
pond=pond
will=will
sob=sob
as=as
called=call
light=light
click=click
night=night
hooves=hoof
loud=loud
thunders=thunder
call=call
temple=temple
loudly=loud
clicking=click
trigger=trigger
cannot=cannot
kiss=kiss
eyes=eye
gentle=gentle
cold=cold
motionless=motionless
eyelids=eyelid
snow=snow
key=key
icy=icy
blue=blue
gulp=gulp
sleep=sleep
deep=deep
the=the
a=a`,

    chinese: `# Chinese Words Dictionary - Optimized for Poem Segmentation
# All words from the poem in frequency order

# High frequency words from poem (appear 2+ times)
的
名字
你的
在
是
中
响亮
吻

# Medium frequency words from poem (appear once)
鸟
冰
唯一
双唇
动作
手中
舌尖
五个
字母
球
空中
被
接住
银铃
嘴里
石头
扔进
安静
池塘
啜泣
着
夜间
马蹄
轻响
你
雷鸣
它
会
太阳穴
呼唤
我们
扣动
扳机
不能
眼睛
上
不动
眼睑
温柔
寒冷
雪中
关键
冰冷
蓝色
一口
带着
沉睡

# Basic Chinese particles and common words
了
不
这
那
个
人
和
有
来
去
看
说`
};

// Language-specific prepositions/particles to optionally exclude from statistics
export const PREPOSITIONS: Record<string, string[]> = {
    russian: [
        // Simple prepositions + common variants
        "в","во","на","с","со","к","ко","о","об","обо","от","ото","по",
        "за","для","из","изо","у","над","надо","под","перед","пред","предо",
        "при","между","через","про","без","после","около","вместо","среди","сквозь",
        "В","Во","На","С","Со","К","Ко","О","Об","Обо","От","Ото","По",
        "За","Для","Из","Изо","У","Над","Надо","Под","Перед","Пред","Предо",
        "При","Между","Через","Про","Без","После","Около","Вместо","Среди","Сквозь"
    ],
    english: [
        "of","to","in","for","on","with","at","from","into","during","including",
        "until","against","among","throughout","despite","towards","upon","concerning",
        "about","over","before","between","after","since","without","under","within",
        "along","following","across","behind","beyond","plus","except","but","up","out",
        "around","down","off","above","near"
    ],
    chinese: [
        // Coverbs/prepositions/particles commonly excluded from frequency stats
        "在","对","给","从","到","向","往","被","把","和","跟","与","于","对于","关于","到",
        "了","着","过","的"
    ]
};
