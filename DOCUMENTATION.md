# 📚 Полное руководство и архитектурная документация: PDF Compressor Front

> **Цель этого документа**: не просто описать, что делает приложение, а разобрать **ключевые инженерные концепции**, современные практики **React 18**, **Tailwind CSS v4**, работу с **бинарными данными в браузере (Blob, File, ArrayBuffer)** и принципы **сжатия PDF-документов**.

---

## 📑 Содержание
1. [Архитектура проекта и структура компонентов](#1-архитектура-проекта-и-структура-компонентов)
2. [Работа с бинарными данными в браузере (File, Blob, Object URLs)](#2-работа-с-бинарными-данными-в-браузере-file-blob-object-urls)
3. [Продвинутый HTML5 Drag and Drop API](#3-продвинутый-html5-drag-and-drop-api)
4. [Асинхронные пайплайны и эмуляция многошаговых процессов](#4-асинхронные-пайплайны-и-эмуляция-многошаговых-процессов)
5. [Секреты дизайн-системы: Черный, Белый и Красный](#5-секреты-дизайн-системы-черный-белый-и-красный)
6. [Теория: Как на самом деле устроено сжатие PDF](#6-теория-как-на-самом-деле-устроено-сжатие-pdf)
7. [Интеграция: Как связать этот React-фронтенд с Java-бэкендом](#7-интеграция-как-связать-этот-react-фронтенд-с-java-бэкендом)
8. [Чек-лист ключевых навыков для прокачки](#8-чек-лист-ключевых-навыков-для-прокачки)

---

## 1. Архитектура проекта и структура компонентов

### Паттерн «Lifting State Up» (Поднятие состояния)
В нашем приложении единым источником правды (**Single Source of Truth**) является корневой компонент [`App.jsx`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/App.jsx).

```text
               ┌────────────────┐
               │    App.jsx     │  ← Хранит files[], settings{}, status, progress
               └───────┬────────┘
     ┌─────────────────┼──────────────────┐
     ▼                 ▼                  ▼
┌──────────┐ ┌───────────────────┐ ┌────────────┐
│ DropZone │ │CompressionSettings│ │ ResultCard │
└──────────┘ └───────────────────┘ └────────────┘
(Загрузка)     (Пресеты и DPI)     (Скачивание)
```

#### Почему это важно:
- `DropZone` не знает, как будут сжиматься файлы — он лишь отвечает за ввод (`onFilesSelected`).
- `CompressionSettings` не знает, какие конкретно файлы загружены — он просто передает объект конфигурации (`onSettingsChange`).
- `ResultCard` принимает уже готовые результаты и отвечает за скачивание.
- **Итог**: Все дочерние компоненты являются «чистыми» (dumb/presentational components), а вся бизнес-логика сосредоточена в одном контроллере.

---

## 2. Работа с бинарными данными в браузере (File, Blob, Object URLs)

Веб-разработчики часто работают только с JSON-строками. Однако работа с PDF требует понимания бинарных структур в браузере.

### Иерархия: `ArrayBuffer` → `Blob` → `File`

```
  ArrayBuffer (Сырые байты в памяти)
       ▲
       │ обёртка с MIME-типом
      Blob (Неизменяемый бинарный объект с метаданными типа)
       ▲
       │ добавление имени файла и даты изменения
      File (Объект файла из <input> или Drag&Drop)
```

### Как работает скачивание без бэкенда (`ResultCard.jsx`):
В коде [`ResultCard.jsx`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/components/ResultCard.jsx) используется классический паттерн **Synthetic Download Link**:

```javascript
const handleDownload = (result) => {
  // 1. Создаем псевдо-URL в памяти браузера, указывающий на Blob
  const url = URL.createObjectURL(result.blob);
  
  // 2. Программно создаем невидимый тег <a>
  const a = document.createElement('a');
  a.href = url;
  a.download = result.name.replace(/\.pdf$/i, '_compressed.pdf');
  
  // 3. Добавляем в DOM, симулируем клик и удаляем
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // 4. ВАЖНО: Освобождаем память!
  URL.revokeObjectURL(url);
};
```

> 💡 **Что здесь нового и важного:**  
> Функция `URL.createObjectURL(blob)` удерживает ссылку на объект в оперативной памяти до тех пор, пока документ жив. Если не вызывать `URL.revokeObjectURL(url)`, при частых операциях возникнет **утечка памяти (Memory Leak)**.

---

## 3. Продвинутый HTML5 Drag and Drop API

В компоненте [`DropZone.jsx`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/components/DropZone.jsx) реализована надежная обработка перетаскивания файлов.

### Почему `e.preventDefault()` обязателен?
По умолчанию браузер при броске файла пытается открыть его во вкладке (например, отобразить PDF в своем встроенном просмотрщике). Чтобы отменить это поведение по умолчанию:

```javascript
const handleDragOver = (e) => {
  e.preventDefault(); // Запрещаем открытие файла браузером!
  setIsDragOver(true);
};

const handleDrop = (e) => {
  e.preventDefault(); // Запрещаем открытие файла браузером!
  setIsDragOver(false);

  // Файлы извлекаются из DataTransfer:
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
};
```

### Валидация по MIME и расширению:
Пользователь может переименовать файл или ОС может не передать точный MIME-тип (`application/pdf`). Поэтому безопасная проверка делается двойной:
```javascript
const pdfFiles = files.filter(
  (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
);
```

---

## 4. Асинхронные пайплайны и эмуляция многошаговых процессов

Пользователь не должен видеть застывший экран при выполнении «тяжелых» операций. В [`App.jsx`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/App.jsx) реализован пошаговый асинхронный процесс:

```javascript
const stages = [
  { pct: 25, label: 'Scanning for embedded PDImageXObject images...' },
  { pct: 55, label: `Downsampling images to ${settings.dpi} DPI (Quality ${settings.quality}%)...` },
  { pct: 75, label: 'Recompressing FlateDecode streams and removing redundant metadata...' },
  { pct: 90, label: 'Building optimized cross-reference tables (PDFBox 3.0)...' },
  { pct: 100, label: 'Finalizing compressed document output!' },
];

for (const stage of stages) {
  // Асинхронная пауза с передачей управления браузеру для перерисовки UI
  await new Promise((resolve) => setTimeout(resolve, 650));
  setProgress(stage.pct);
  setCurrentStage(stage.label);
}
```

> 💡 **Чему учит этот прием:**  
> В реальном приложении длительную задачу можно разбить на шаги (через Server-Sent Events, WebSockets или опрос статуса задачи). UI при этом отображает текущий прогресс без блокировки основного потока рендеринга (**Event Loop**).

---

## 5. Секреты дизайн-системы: Черный, Белый и Красный

Сочетание черного, белого и красного — одно из самых мощных в графическом дизайне (стили *Cyberpunk*, *Industrial Tech*, *Swiss High-Contrast*).

### Правила баланса:
1. **Черный (60–70%)**: Глубокий базовый фон (`#09090b`), карточки чуть светлее (`#121217` и `#181820`). Это создает визуальную глубину (слоистость).
2. **Белый / Светло-серый (20–25%)**: Заголовки — чистый белый (`#ffffff`), второстепенный текст — приглушенный цинк (`#a1a1aa`, `#71717a`).
3. **Красный (5–10%)**: **Строго дозированно** для ключевых точек внимания:
   - Кнопка призыва к действию (CTA — *Compress Now*).
   - Индикатор процента сэкономленного места (`-75%`).
   - Активный прогресс-бар и границы при Drag & Drop.

### Эффект фоновой сетки (`bg-grid`):
В [`index.css`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/index.css) мы применили CSS-паттерн, не требующий картинок:
```css
.bg-grid {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
```
Это придает интерфейсу инженерную эстетику CAD-программ и современных дашбордов.

---

## 6. Теория: Как на самом деле устроено сжатие PDF

Чтобы понимать, почему интерфейс предлагает именно такие настройки, разберем анатомию PDF:

```text
%PDF-1.7
1 0 obj  << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj  << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj  << /Type /Page /Resources << /XObject << /Im1 4 0 R >> >> >> endobj
4 0 obj  << /Type /XObject /Subtype /Image /Filter /DCTDecode ... >>
stream
... (Бинарные данные JPEG-картинки) ...
endstream
endobj
xref
0 5
trailer << /Size 5 /Root 1 0 R >>
startxref
```

### За счет чего достигается сжатие?
1. **Растровые изображения (`PDImageXObject`) — 80-95% веса файла**:
   - В презентациях и сканах картинки часто вставлены в разрешении 300–600 DPI.
   - Для экрана достаточно **72–150 DPI**.
   - Перекодирование из PNG/TIFF в JPEG с качеством 75% уменьшает вес картинки в 5–10 раз.
2. **Потоки контента (`FlateDecode`)**:
   - Текст и векторные линии упаковываются алгоритмом Deflate (аналог zlib/gzip).
3. **Метаданные и неиспользуемые объекты**:
   - Программы вроде Adobe InDesign или Word сохраняют огромные XML-блоки XMP-метаданных, превью страниц и шрифты целиком. Удаление неиспользуемых глифов шрифтов (Font Subsetting) существенно экономит размер.

---

## 7. Интеграция: Как связать этот React-фронтенд с Java-бэкендом

В вашем первом репозитории (`pdf-helper`) написан Java-класс `Service.java`, использующий **Apache PDFBox 3.0**.

### Архитектура связки:
```text
React (Браузер)           HTTP POST multipart/form-data           Java Backend
[Выбор файла + DPI]  ───────────────────────────────────────►  [Spring Boot / Javalin]
                                                                      │
                                                                      ▼
                                                                Service.java
                                                                (PDFBox 3.0)
                                                                      │
[Скачивание файла]  ◄───────────────────────────────────────  Отдает сжатый PDF
```

### 1. Как отправлять файл из React:
В [`App.jsx`](file:///Users/danyloostaprnkov/.gemini/antigravity/scratch/pdf-compressor-front/src/App.jsx) реальный запрос к бэкенду выглядит так:

```javascript
const compressWithBackend = async (file, settings) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', settings.quality);
  formData.append('dpi', settings.dpi);
  formData.append('grayscale', settings.grayscale);

  const response = await fetch('http://localhost:8080/api/compress', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Compression failed');

  // Получаем бинарный поток сжатого PDF
  const compressedBlob = await response.blob();
  return compressedBlob;
};
```

### 2. Пример простого REST-контроллера на Java (Spring Boot):
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // Разрешаем запросы с React
public class CompressionController {

    @Autowired
    private Service pdfService;

    @PostMapping("/compress")
    public ResponseEntity<byte[]> compressPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "75") int quality,
            @RequestParam(defaultValue = "150") int dpi) throws IOException {

        // Вызываем ваш сервис
        byte[] compressedData = pdfService.compress(file.getBytes(), quality, dpi);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"compressed.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(compressedData);
    }
}
```

---

## 8. Чек-лист ключевых навыков для прокачки

- [x] **React 18 State Management**: Поднятие состояния и работа со сложными объектами в `useState`.
- [x] **HTML5 Drag & Drop API**: `preventDefault`, события переноса и работа с объектом `DataTransfer`.
- [x] **Браузерные Blob и File API**: Генерация `objectURL` для скачивания и очистка памяти.
- [x] **Tailwind CSS v4**: `@import "tailwindcss"` без громоздких конфигураций, CSS-переменные для дизайн-системы.
- [x] **UX/UI принципы**: Цветовая триада (Black / White / Red), контрастность, визуализация прогресса и понятные метрики экономии памяти.
- [x] **WebStorm & Git**: Проект готов для открытия, инспекции кода, расширения и коммитов через терминал или UI WebStorm.
