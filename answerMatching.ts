import { ChemicalElement } from '../types/element';

const ACCEPTED_NAME_VARIANTS: Record<string, string[]> = {
  aluminium: ['aluminum'],
  sulfur: ['sulphur'],
  cesium: ['caesium'],
};

const ARABIC_TARGET_EXTRA_FORMS: Record<number, string[]> = {
  9: ['فلورين', 'fluorine', 'florin'],
  13: ['ألمنيوم', 'ألومنوم', 'aluminum'],
  15: ['فوسفور', 'phosphorus', 'fosforus'],
  17: ['كلورين', 'chlorine', 'klorin'],
  30: ['زنك', 'خارسين', 'zinc', 'zink'],
  35: ['برومين', 'bromine', 'bromin'],
  51: ['أنتيمون', 'antimony'],
  53: ['أيودين', 'iodine', 'ayodin'],
  74: ['ولفرام', 'wolfram'],
  78: ['بلاتينيوم', 'platinum'],
  92: ['أورانيوم', 'uranium'],
};

function stripLatinDiacritics(val: string): string {
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ø/g, 'o')
    .replace(/ł/g, 'l');
}

function normalizeExact(val: string): string {
  return stripLatinDiacritics(val.trim().replace(/\s+/g, ' '));
}

function normalizeArabicScript(val: string): string {
  return val
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة$/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, '');
}

function hasArabicChars(val: string): boolean {
  return /[\u0600-\u06FF]/.test(val);
}

/**
 * Generates phonetic equivalence keys for Latin-script words (and Arabizi when arabicMode is true).
 * Equivalent sounds (e.g., c/k/ck/q, ph/f, x/ks, soft g/j, ee/ea/ie/y/i, oo/ou/u) map to the same key.
 */
export function getLatinPhoneticKeys(raw: string, arabicMode = false): string[] {
  const s = stripLatinDiacritics(raw);
  const rawVariants = new Set<string>();

  if (arabicMode) {
    // Strip optional Arabic definite article prefix (al-, el-, ash-, etc.)
    const trimmed = s.trim();
    const withoutArticle = trimmed.replace(/^(?:al|el|ar|as|ash|at|ath|ad|adh|an|az)[-\s]+/, '');
    const candidates = [trimmed, withoutArticle];
    if (/^(?:al|el)[a-z0-9]{3,}$/.test(trimmed)) {
      candidates.push(trimmed.slice(2));
    }
    for (const cand of candidates) {
      const base = cand
        .replace(/7/g, 'h')
        .replace(/3/g, 'a')
        .replace(/5/g, 'kh')
        .replace(/6/g, 't')
        .replace(/9/g, 's');
      rawVariants.add(base.replace(/2/g, ''));
      if (base.includes('2')) {
        rawVariants.add(base.replace(/2/g, 'k'));
      }
    }
  } else {
    rawVariants.add(s);
  }

  const out = new Set<string>();
  for (const rv of rawVariants) {
    const clean = rv.replace(/[^a-z]/g, '');
    if (!clean) continue;

    // Apply multi-letter digraphs (ph, ck, ch, qu) before single-letter c->k / c->s
    const preDigraphs = clean
      .replace(/ph/g, 'f')
      .replace(/ck/g, 'k')
      .replace(/ch/g, 'k')
      .replace(/qu/g, 'k')
      .replace(/q/g, 'k');

    // Generate both hard c->k and soft c(e/i/y)->s variants so "c" and "k" always match
    // while soft c sounds like "s" also match (e.g. Cerium/Serium, Calcium/Kalsium).
    const cForms = [
      preDigraphs.replace(/c/g, 'k'),
      preDigraphs.replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k'),
    ];

    for (const f0 of cForms) {
      const gForms = [
        f0,
        f0.replace(/g(?=[eiy])/g, 'j'),
        f0.replace(/j/g, 'g'),
      ];
      for (const f1 of gForms) {
        let v = f1
          .replace(/x/g, 'ks')
          .replace(/rh/g, 'r')
          .replace(/([aeiou])h(?=[bcdfgjklmnpqrstvwxz]|$)/g, '$1')
          .replace(/ai|ay|ei|ey/g, 'ai')
          .replace(/ee|ea|ie/g, 'i')
          .replace(/oo|ou/g, 'u')
          .replace(/ae|oe/g, 'e')
          .replace(/y/g, 'i');

        if (arabicMode) {
          const baseAr = v
            .replace(/gh/g, 'g')
            .replace(/kh/g, 'k')
            .replace(/sh/g, 's')
            .replace(/p/g, 'b')
            .replace(/v/g, 'f')
            .replace(/j/g, 'g');
          for (const thForm of [
            baseAr.replace(/dh/g, 'z').replace(/th/g, 't'),
            baseAr.replace(/dh/g, 'd').replace(/th/g, 'z'),
            baseAr.replace(/dh/g, 'z').replace(/th/g, 's'),
          ]) {
            const collapsed = thForm.replace(/([a-z])\1+/g, '$1');
            out.add(collapsed);
            if (f1.startsWith('x')) {
              out.add(('z' + collapsed.slice(2)).replace(/([a-z])\1+/g, '$1'));
            }
          }
        } else {
          const collapsed = v.replace(/([a-z])\1+/g, '$1');
          out.add(collapsed);
          if (f1.startsWith('x')) {
            out.add(('z' + collapsed.slice(2)).replace(/([a-z])\1+/g, '$1'));
          }
        }
      }
    }
  }

  return Array.from(out);
}

/**
 * Builds a regex over phonetic Latin keys from an Arabic-script word,
 * permitting omitted short vowels between Arabic consonants while preserving
 * Arabic long-vowel quality and consonant phonetic equivalences.
 */
function buildArabicTranslitRegex(arWord: string): RegExp {
  const clean = arWord.replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim();
  const chars = Array.from(clean);
  const vowels = 'اأإآوىيءة';
  let pattern = '^';

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const isFirst = i === 0;
    const prev = chars[i - 1];
    const next = chars[i + 1];
    const isPrevConsonant = i > 0 && !vowels.includes(prev);

    if (isPrevConsonant && !vowels.includes(c)) {
      pattern += '[aeiou]*';
    }

    switch (c) {
      case 'أ':
      case 'آ':
        pattern += isFirst ? '[aeou]+' : '[ae]+';
        break;
      case 'إ':
        pattern += '[ei]+';
        break;
      case 'ا':
      case 'ى':
        pattern += isFirst ? '[aeiou]+' : '[ae]+';
        break;
      case 'ب':
        pattern += 'b';
        break;
      case 'ت':
      case 'ط':
        pattern += 't';
        break;
      case 'ث':
        pattern += '(?:t|s)';
        break;
      case 'ج':
        pattern += 'g';
        break;
      case 'ح':
      case 'ه':
        pattern += 'h';
        break;
      case 'خ':
        pattern += 'k';
        break;
      case 'د':
      case 'ض':
        pattern += 'd';
        break;
      case 'ذ':
        pattern += '(?:z|d)';
        break;
      case 'ر':
        pattern += 'r';
        break;
      case 'ز':
      case 'ظ':
        pattern += 'z';
        break;
      case 'س':
      case 'ص':
      case 'ش':
        pattern += 's';
        break;
      case 'ع':
        pattern += '[aeiou]*';
        break;
      case 'غ':
        pattern += 'g';
        break;
      case 'ف':
        pattern += 'f';
        break;
      case 'ق':
        pattern += '(?:k|g)';
        break;
      case 'ك':
        pattern += 'k';
        break;
      case 'ل':
        pattern += 'l';
        break;
      case 'م':
        pattern += 'm';
        break;
      case 'ن':
        pattern += 'n';
        break;
      case 'ة':
        pattern += '(?:a|e|ah|eh)?';
        break;
      case 'و':
      case 'ؤ':
        pattern += isFirst
          ? '(?:w?[ouae]+)'
          : next && 'اأإآي'.includes(next)
          ? '(?:w|[ou]+)'
          : '[ou]+';
        break;
      case 'ي':
      case 'ئ':
        pattern += isFirst
          ? '[iea]+'
          : next && 'او'.includes(next)
          ? '(?:i|e|a|ai|ia)*[ie]+'
          : '[aie]+';
        break;
      case 'ء':
        break;
      default:
        break;
    }
  }

  pattern += '[aeiou]*h?$';
  return new RegExp(pattern);
}

export function isElementNameMatch(
  input: string,
  targetName: string,
  language: string,
  element: ChemicalElement
): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  const normInput = normalizeExact(trimmed);
  const normTarget = normalizeExact(targetName);
  if (normInput === normTarget) return true;

  const variants = ACCEPTED_NAME_VARIANTS[normTarget];
  if (variants && variants.includes(normInput)) return true;

  if (language === 'ar') {
    const arTargets = [targetName, ...(ARABIC_TARGET_EXTRA_FORMS[element.number] ?? [])];
    const arabicWordTargets = arTargets.filter((t) => hasArabicChars(t));
    const latinExtraTargets = arTargets.filter((t) => !hasArabicChars(t));

    if (hasArabicChars(trimmed)) {
      const normArInput = normalizeArabicScript(trimmed);
      const strippedInput = normArInput.startsWith('ال') ? normArInput.slice(2) : normArInput;
      // Normalize Arabic-script loanword variants (غ<->ج, -يم/-يوم, omitted medial ا)
      const arPhonetic = (s: string) =>
        s
          .replace(/غ/g, 'ج')
          .replace(/وا/g, 'و')
          .replace(/يوم$/, 'يم')
          .replace(/(.)ا(?=.{2,})/g, '$1');
      for (const candidate of arabicWordTargets) {
        const normCand = normalizeArabicScript(candidate);
        if (normArInput === normCand || strippedInput === normCand) return true;
        if (arPhonetic(normArInput) === arPhonetic(normCand)) return true;
        if (arPhonetic(strippedInput) === arPhonetic(normCand)) return true;
      }
      return false;
    }

    // Latin transliteration / Arabizi / phonetic input for Arabic mode
    const inputPhonetics = getLatinPhoneticKeys(trimmed, true);
    for (const arCand of arabicWordTargets) {
      const re = buildArabicTranslitRegex(arCand);
      if (inputPhonetics.some((key) => re.test(key))) {
        return true;
      }
    }
    for (const latCand of latinExtraTargets) {
      const candKeys = getLatinPhoneticKeys(latCand, true);
      if (inputPhonetics.some((k) => candKeys.includes(k))) {
        return true;
      }
    }
    return false;
  }

  // Phonetic equivalence matching for all Latin-script languages (e.g. c == k, ph == f, x == ks)
  if (!hasArabicChars(targetName) && !hasArabicChars(trimmed)) {
    const targetForms = [targetName, ...(ACCEPTED_NAME_VARIANTS[normTarget] ?? [])];
    const inputKeys = getLatinPhoneticKeys(trimmed, false);
    for (const form of targetForms) {
      const targetKeys = getLatinPhoneticKeys(form, false);
      if (inputKeys.some((k) => targetKeys.includes(k))) {
        return true;
      }
    }
  }

  return false;
}
