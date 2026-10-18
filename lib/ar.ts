// Arabic UI text. Register (user, 2026-10-19): mixed. Titles, questions and
// buttons in white Saudi dialect; numbers, facts and labels in simple MSA.

export const levelLabel: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

// CoderHub tag names (GET /challenge) -> Arabic.
export const tagLabel: Record<string, string> = {
  Algorithms: "خوارزميات",
  Boolean: "قيم منطقية",
  Conditions: "شروط",
  Date: "تواريخ",
  Lists: "قوائم",
  Loop: "تكرار",
  Math: "رياضيات",
  Numbers: "أعداد",
  Objects: "كائنات",
  "Project Euler": "Project Euler",
  Random: "عشوائية",
  Searching: "بحث",
  Sorting: "ترتيب",
  String: "نصوص",
};

// A counted noun agrees with the last two digits of the number (MSA):
// 0, 1 and 2 have their own forms (CLDR "zero", "one", "two"); 3 to 10 take
// the plural; 11 to 99 take the accusative singular; 100, 101 and 102 take
// the genitive singular.
type Forms = {
  zero: string;
  one: string;
  two: string;
  plural: string;
  accusative: string;
  genitive: string;
};

function counted(n: number, f: Forms): string {
  if (n === 0) return f.zero;
  if (n === 1) return f.one;
  if (n === 2) return f.two;
  const r = n % 100;
  if (r >= 3 && r <= 10) return `${n} ${f.plural}`;
  if (r >= 11) return `${n} ${f.accusative}`;
  return `${n} ${f.genitive}`;
}

export const challengeCount = (n: number) =>
  counted(n, {
    zero: "لا توجد تحديات",
    one: "تحدٍ واحد",
    two: "تحديان",
    plural: "تحديات",
    accusative: "تحديًا",
    genitive: "تحدٍ",
  });

export const pointCount = (n: number) =>
  counted(n, {
    zero: "لا توجد نقاط",
    one: "نقطة واحدة",
    two: "نقطتان",
    plural: "نقاط",
    accusative: "نقطة",
    genitive: "نقطة",
  });

export const acceptedCount = (n: number) =>
  counted(n, {
    zero: "لا توجد حلول مقبولة",
    one: "حل مقبول واحد",
    two: "حلان مقبولان",
    plural: "حلول مقبولة",
    accusative: "حلًا مقبولًا",
    genitive: "حل مقبول",
  });

// Fumadocs UI strings (keys from fumadocs-ui .translations). Buttons are
// imperatives; status messages are MSA. "تم النسخ" is the fixed UI form for
// "Copied" (review 2026-10-19: "منسوخ" also means "abrogated").
export const uiTranslations: Record<string, string> = {
  displayName: "العربية",
  "Search(search trigger)": "ابحث",
  "Search(search dialog)": "ابحث",
  "Open Search(search trigger)(aria-label)": "افتح البحث",
  "Close Search(search dialog)(aria-label)": "أغلق البحث",
  "No results found(search dialog)": "لا توجد نتائج",
  "Search failed(search dialog)": "تعذّر البحث",
  "Search failed, showing results for {query}(search dialog)":
    "تعذّر البحث، وهذه نتائج {query}",
  "On this page(table of contents)": "في هذه الصفحة",
  "No Headings(table of contents)": "لا توجد عناوين",
  "Table of Contents(inline table of contents)": "المحتويات",
  "Next Page(pagination)": "التالي",
  "Previous Page(pagination)": "السابق",
  "Copy Markdown(page actions)": "انسخ Markdown",
  "Copied Markdown(page actions)": "تم النسخ",
  "View as Markdown(page actions)": "اعرض بصيغة Markdown",
  "Open(page actions)": "افتح",
  "Open in GitHub(page actions)": "افتح في GitHub",
  "Open in ChatGPT(page actions)": "افتح في ChatGPT",
  "Open in Claude(page actions)": "افتح في Claude",
  "Open in Cursor(page actions)": "افتح في Cursor",
  "Open in Scira AI(page actions)": "افتح في Scira AI",
  "Read {url}, I want to ask questions about it.(page actions)":
    "اقرأ {url}، وعندي أسئلة عنها.",
  "Copy Text(code block)(aria-label)": "انسخ الكود",
  "Copied Text(code block)(aria-label)": "تم النسخ",
  "Copy Anchor Link(heading anchor)(aria-label)": "انسخ رابط العنوان",
  "Copied Anchor Link(heading anchor)(aria-label)": "تم النسخ",
  "Open Sidebar(aria-label)": "افتح القائمة",
  "Close Sidebar(aria-label)": "أغلق القائمة",
  "Open Sidebar(sidebar)(aria-label)": "افتح القائمة",
  "Close Sidebar(sidebar)(aria-label)": "أغلق القائمة",
  "Collapse Sidebar(sidebar)(aria-label)": "أخفِ القائمة",
  "Hide Sidebar(sidebar)": "أخفِ القائمة",
  "Show Sidebar(sidebar)": "أظهر القائمة",
  "Toggle Menu(home layout header)(aria-label)": "افتح القائمة",
  "Toggle Theme(theme switcher)(aria-label)": "بدّل المظهر",
  "Light(theme switcher)(aria-label)": "فاتح",
  "Dark(theme switcher)(aria-label)": "داكن",
  "System(theme switcher)(aria-label)": "حسب الجهاز",
  "Theme(site menu)": "المظهر",
  "Options(aria-label)": "خيارات",
  "Edit on GitHub(edit page)": "عدّل في GitHub",
  "Last updated on(page footer)": "آخر تحديث",
  "Page Not Found(404 not found page)": "الصفحة غير موجودة",
  "Back to Home(404 not found page)": "ارجع للرئيسية",
  "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)":
    "تأكد من الرابط، أو ارجع للرئيسية.",
};
