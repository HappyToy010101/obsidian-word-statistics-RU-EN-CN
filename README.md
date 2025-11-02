<div align="center">

# Word Statistics RU/EN/CN — Obsidian Plugin

Analyze words across Russian, English, and Chinese notes with smart lemmatization/segmentation, filtering, and a clean UI.

[English](#english) • [Русский](#русский) • [中文](#中文)

</div>

---

## English

> Alpha status: actively evolving. Expect rapid improvements and occasional changes.

### Features

- 📊 Word frequency analysis for Russian, English, and Chinese
- 🧠 Lemmatization (RU/EN) and segmentation (CN)
- ✂️ Optional preposition/particle exclusion per language
- 🇨🇳 Chinese: improved segmentation with custom phrases + manual segmentation modal
- 🇷🇺 Russian: advanced fallback rules for unknown words (optional)
- 📈 Interactive chart view and full table view
- 🎛️ Rich settings: content filtering, exclude common words, custom exclusions
- ⚡ Caching for faster reloads, batched processing to keep UI responsive
- 🪄 Lazy‑load dictionaries only for the active language
- 🧭 First‑run auto‑detect of default language
- 🌐 Fully localized UI (RU/EN/CN)
- 🧪 Built‑in strict test with reference poem
- 💾 Export to CSV/JSON (filtered) and Export All

### Installation (super easy)

1) One‑click (Windows, recommended)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; irm https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/scripts/install_from_github.ps1 | iex; install_from_github.ps1 -VaultPath "E:\\Path\\To\\Your\\Vault"
```

2) BRAT (no terminal): install BRAT → BRAT: Add a beta plugin → add `HappyToy010101/obsidian-word-statistics-RU-EN-CN` → enable.

3) Manual ZIP: download latest Release (`manifest.json`, `main.js`, `styles.css`) → put into `<Vault>/.obsidian/plugins/word-statistics-ru-en-cn/` → enable in Obsidian.

Notes: Minimum Obsidian 0.15. BRAT can auto‑update. For manual updates, replace `main.js`, `manifest.json`, `styles.css`.

### Usage

1. Open 📊 Word Statistics view from the ribbon.
2. Choose language (RU/EN/CN), set “Exclude top words”.
3. Click “Refresh Statistics”. Switch table/chart anytime.
4. Export CSV/JSON; files are saved to the vault root.

Tips: add user words to exclude; enable content filters; see “Longest word” and “Last updated”.

### Settings overview

- Language (auto‑detect on first run; optional follow system language)
- Minimum word length, exclude common words (%), content filters (Markdown/URLs/code/math/tags)
- Ignore prepositions/particles per language
- Chinese segmentation: dictionary vs segmentit, custom phrases, manual segmentation
- Russian: advanced fallback rules for unknown words (optional)
- Tools: reload dictionaries, create test file, show expected stats, run strict test

### Developer quick start

```powershell
npm install
npm run build
npm run build:watch
npm run typecheck
```

Windows helpers:

```powershell
./scripts/build_and_package.ps1
./scripts/build_and_package.ps1 -VaultPath "E:\\Path\\To\\Your\\Vault"
```

### License

MIT

---

## Русский

> Статус: альфа. Проект активно развивается; ожидайте частые улучшения.

### Возможности

- 📊 Частотный анализ слов для русского, английского и китайского
- 🧠 Лемматизация (RU/EN) и сегментация (CN)
- ✂️ Опциональное исключение предлогов/частиц
- 🇨🇳 Китайский: улучшенная сегментация + ручная правка + пользовательские фразы
- 🇷🇺 Русский: расширенные правила fallback для неизвестных слов (опция)
- 📈 График и полная таблица
- 🎛️ Гибкие настройки: фильтрация контента, исключение частотных слов, собственные исключения
- ⚡ Кэш, пакетная обработка — интерфейс не «висит»
- 🪄 Ленивая загрузка словарей (только для активного языка)
- 🧭 Автоопределение языка при первом запуске
- 🌐 Полная локализация интерфейса (RU/EN/CN)
- 🧪 Встроенный строгий тест на эталонном стихотворении
- 💾 Экспорт CSV/JSON (фильтр) и «Экспорт всего»

### Установка (очень просто)

1) One‑click (Windows, рекомендовано)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; irm https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/scripts/install_from_github.ps1 | iex; install_from_github.ps1 -VaultPath "E:\\Ваш\\Vault"
```

2) Через BRAT: установите BRAT → команда `BRAT: Add a beta plugin` → добавьте `HappyToy010101/obsidian-word-statistics-RU-EN-CN` → включите плагин.

3) Ручной ZIP: скачайте релиз (`manifest.json`, `main.js`, `styles.css`) → скопируйте в `<Vault>/.obsidian/plugins/word-statistics-ru-en-cn/` → включите в Obsidian.

Примечания: Минимальная версия Obsidian 0.15. BRAT умеет авто‑обновлять. Для ручного обновления замените `main.js`, `manifest.json`, `styles.css`.

### Как пользоваться

1. Откройте вид 📊 «Статистика слов» (значок на панели).
2. Выберите язык (RU/EN/CN), настройте «Исключить топ слов».
3. Нажмите «Обновить статистику». Переключайте таблицу/график в любой момент.
4. Экспортируйте CSV/JSON; файлы сохраняются в корень вашего vault.

Подсказки: добавляйте свои слова для исключения; используйте фильтрацию контента; обращайте внимание на «Самое длинное слово» и «Последнее обновление».

### Настройки — обзор

- Язык (автоопределение; опция «следовать системному языку»)
- Минимальная длина, исключение частых слов (%), фильтры (Markdown/URL/код/математика/теги)
- Игнорировать предлоги/частицы
- Китайский: segmentit vs словарь, пользовательские фразы, ручная сегментация
- Русский: расширенные fallback‑правила для неизвестных слов (опция)
- Инструменты: перезагрузка словарей, тестовый файл, ожидаемая статистика, строгий тест

### Для разработчиков

```powershell
npm install
npm run build
npm run build:watch
npm run typecheck
```

Windows‑скрипты:

```powershell
./scripts/build_and_package.ps1
./scripts/build_and_package.ps1 -VaultPath "E:\\Ваш\\Vault"
```

### Лицензия

MIT

---

## 中文

> 开发中（Alpha）：持续改进，更新频繁。

### 功能

- 📊 统计俄/英/中文的词频
- 🧠 词形还原（俄/英）与分词（中文）
- ✂️ 可选排除介词/助词
- 🇨🇳 中文：改进分词，支持自定义词与手动分词面板
- 🇷🇺 俄文：未知词高级回退规则（可选）
- 📈 图表视图 + 完整表格视图
- 🎛️ 丰富设置：内容过滤、排除常见词、自定义排除
- ⚡ 缓存与分批处理，保证界面流畅
- 🪄 仅按需加载当前语言的字典
- 🧭 首次运行自动检测默认语言
- 🌐 全面本地化（RU/EN/CN）
- 🧪 内置严格测试（参考诗歌）
- 💾 导出 CSV/JSON（过滤）与“导出全部”

### 安装（非常简单）

1) 一键安装（Windows，推荐）

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; irm https://raw.githubusercontent.com/HappyToy010101/obsidian-word-statistics-RU-EN-CN/main/scripts/install_from_github.ps1 | iex; install_from_github.ps1 -VaultPath "E:\\Your\\Vault"
```

2) 通过 BRAT：安装 BRAT → “BRAT: Add a beta plugin” → 添加 `HappyToy010101/obsidian-word-statistics-RU-EN-CN` → 启用插件。

3) 手动 ZIP：下载最新 Release（`manifest.json`, `main.js`, `styles.css`）→ 放入 `<Vault>/.obsidian/plugins/word-statistics-ru-en-cn/` → 在 Obsidian 启用。

说明：最低支持 Obsidian 0.15。BRAT 可自动更新；手动更新替换 `main.js`、`manifest.json`、`styles.css`。

### 使用方法

1. 点击侧栏📊图标打开统计视图。
2. 选择语言（RU/EN/CN），调整“排除常见词”。
3. 点击“刷新统计”。可随时在表格/图表之间切换。
4. 导出 CSV/JSON；文件保存到库根目录。

提示：可添加要排除的用户词；启用内容过滤；查看“最长单词”和“上次更新时间”。

### 设置概览

- 语言（首次自动检测；可跟随系统语言）
- 最小词长、排除常见词（百分比）、过滤（Markdown/URL/代码/数学/标签）
- 忽略介词/助词
- 中文：segmentit / 字典模式，自定义词，手动分词
- 俄文：未知词高级回退规则（可选）
- 工具：重载字典、创建测试文件、查看预期统计、运行严格测试

### 许可协议

MIT