import type { ReelScript } from './types';

// Local-only script generator. Builds a structured reel script from a topic
// using proven social-media structures. No external API required.

const HOOKS_URDU = [
  'آپ کو یقین نہیں آئے گا کہ {topic} کے بارے میں یہ بات کتنی اہم ہے',
  'اگر آپ {topic} سے جڑے ہیں تو یہ ویڈیو آپ کے لیے ہے',
  'سب سے پہلے یہ جان لیں کہ {topic} میں کون سی غلطی آپ کر رہے ہیں',
  '{topic} کو آپ نے پہلے بھی سنا ہوگا، مگر یہ نکتہ آپ کے لیے نیا ہے',
  'روکیں! {topic} کے تین راز جو کوئی نہیں بتاتے',
];

const HOOKS_ROMAN = [
  'Yaqeen nahi aayega ke {topic} ke baray mein yeh baat kitni zaroori hai',
  'Agar aap {topic} se jure hain toh yeh video aap ke liye hai',
  'Sab se pehle yeh jaan lein ke {topic} mein kaun si ghalti aap kar rahe hain',
  '{topic} ko aap ne pehle bhi suna hoga, magar yeh nuqta aap ke liye naya hai',
  'Roken! {topic} ke teen raaz jo koi nahi batate',
];

const POINTS_URDU = [
  'سب سے پہلا نکتہ: {topic} میں اصرار ہی کامیابی کی کنجی ہے',
  'دوسرا اہم پہلو: چھوٹے چھوٹے قدم باقاعدگی سے اٹھاتے رہیں',
  'تیسرا راز: دوسروں سے سیکھنا اور اپنے تجربے کو بڑھانا',
  'چوتھی بات: وقت کو ضائع نہ کریں، آج ہی شروع کریں',
  'پانچواں نکتہ: مثبت سوچ اور صبر کام پر لاتے ہیں',
];

const POINTS_ROMAN = [
  'Sab se pehla nuqta: {topic} mein israr hi kamyabi ki kunji hai',
  'Doosra ahem pahlu: chote chote qadam baqaidagi se uthate rahen',
  'Teesra raaz: dusron se seekhna aur apne tajurbe ko barhana',
  'Chothi baat: waqt ko zaya na karein, aaj hi shuru karein',
  'Panchwaan nuqta: musbat soch aur sabar kaam par latay hain',
];

const CTAS_URDU = [
  'اگر یہ ویڈیو پسند آئی تو فالو ضرور کریں اور دوستوں کے ساتھ شیئر کریں',
  'کمنٹس میں بتائیں کہ {topic} کے بارے میں آپ کی رائے کیا ہے',
  'مزید ایسی ویڈیوز کے لیے فالو بٹن دبائیں',
  'شیئر کریں تاکہ یہ معلومات دوسروں تک پہنچے',
];

const CTAS_ROMAN = [
  'Agar yeh video pasand aayi toh follow zaroor karein aur doston ke sath share karein',
  'Comments mein batayen ke {topic} ke baray mein aap ki raye kya hai',
  'Mazaid aisi videos ke liye follow button dabayen',
  'Share karein takay yeh maloomat dusron tak pohnche',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(tpl: string, topic: string): string {
  return tpl.split('{topic}').join(topic);
}

export function generateScript(
  topicRaw: string,
  language: 'urdu' | 'roman-urdu',
): ReelScript {
  const topic = topicRaw.trim() || 'سیکس اور کامیابی';
  const isUrdu = language === 'urdu';
  const hooks = isUrdu ? HOOKS_URDU : HOOKS_ROMAN;
  const points = isUrdu ? POINTS_URDU : POINTS_ROMAN;
  const ctas = isUrdu ? CTAS_URDU : CTAS_ROMAN;

  // Pick 3 distinct points
  const shuffled = [...points].sort(() => Math.random() - 0.5);
  const [p1, p2, p3] = shuffled;

  return {
    hook: fill(pick(hooks), topic),
    point1: fill(p1, topic),
    point2: fill(p2, topic),
    point3: fill(p3, topic),
    cta: fill(pick(ctas), topic),
  };
}

export function scriptToSpoken(script: ReelScript): string {
  return [script.hook, script.point1, script.point2, script.point3, script.cta].join('. ') + '.';
}

export function scriptToText(script: ReelScript): string {
  return [
    `🪝 Hook: ${script.hook}`,
    `1️⃣ ${script.point1}`,
    `2️⃣ ${script.point2}`,
    `3️⃣ ${script.point3}`,
    `📣 CTA: ${script.cta}`,
  ].join('\n\n');
}
