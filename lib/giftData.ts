// ============================================================
// 🎁 GIFT DATA — EDIT HERE to add or change customer content
// ============================================================
// Each key is the URL slug: /gift/aya → id = "aya"
// ============================================================

export interface GiftData {
  name: string;           // Shown in the intro "Make a wish, [name]!"
  senderName?: string;    // Signature at the bottom of the letter (e.g., "Aya ✨")
  envelopeImage: string;  // Path inside /public — the envelope image
  birthdayImage: string;  // Path inside /public — the main birthday card image
  message: string;        // The birthday message (supports \n for line breaks)
  musicUrl?: string;      // Optional: URL to a background music mp3
  accentColor?: string;   // Optional: custom accent color (default: #38bdf8)
}

// ============================================================
// CUSTOMER DATA
// ============================================================
const giftData: Record<string, GiftData> = {

  // ----------------------------------------------------------
  // CUSTOMER: Aya
  // Link: yourdomain.com/gift/aya
  // ----------------------------------------------------------
  aya: {
    name: "Youssef",                                     // اسم مستلم الهدية
    senderName: "your love",                                   // التوقيع في آخر الرسالة (اختياري)
    envelopeImage: "/images/envelope-aya.png",           // صورة الظرف
    birthdayImage: "/images/birthday-aya.png",           // صورة الهدية النهائية
    accentColor: "#38bdf8",                              // اللون الأزرق الفاتح المتوافق مع التصميم الجديد
    musicUrl: "",                                        // رابط الموسيقى هنا
    message: `yesterday is all about celebrating you — your kindness, your strength, your growth, and all the little things that make you who you are.

I hope you take a moment to look back on everything you've been through and realize just how far you've come. Life hasn't always been easy, but you've handled it in your own way, and that's something worth being proud of.

You deserve a day filled with genuine happiness, laughter that doesn't feel forced, and moments that make you forget all your worries, even just for a while. I hope you're surrounded by people who truly appreciate you — people who see your worth even when you don't, and people who remind you that you matter more than you think.

As you step into another year of your life, I hope you carry with you the lessons of the past, but don't let them weigh you down. There are still so many experiences waiting for you, so many opportunities to grow, and so many dreams that are still within reach. Take your time — there's no need to rush anything. Everything meant for you will come at the right moment.

I hope this year brings you peace in your mind, clarity in your decisions, and courage to go after what you truly want. May you find happiness in both the big milestones and the small, quiet moments.

And even on the days when things don't go as planned, I hope you remember that you're stronger than you think.

Thank you for being you. Never change the parts of yourself that make you unique, because those are the things that make you special.

Once again, happy birthday! 🎂✨
I hope this day marks the beginning of one of your best years yet.`,
  },

};

export default giftData;