const { generateSupportWhatsAppLink, generateOrderWhatsAppLink } = require('../utils/whatsappHelper');

// GET /api/store/config
// Provides Book Butler store info, theme colors, and support WhatsApp link for the frontend
const getStoreConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    store: {
      name: 'Book Butler',
      about:
        'مرحباً بك في متجر Book Butler — وجهتك المثالية لاكتشاف واقتناء أفضل الكتب والروايات في مختلف التصنيفات، مع ترشيحات أسبوعية وشهرية منتقاة بعناية لعشاق القراءة.',
      support: generateSupportWhatsAppLink(),
      themeColors: {
        primary: '#001D51',
        warning: '#ff5c40',
        dark: {
          text: '#F1EBE3',
          background: '#F1EBE3',
          navBackground: '#001334',
          iconColor: '#737373',
          iconColorFocused: '#F1EBE3',
          gradient: ['#000B21', '#001334', '#072761', '#001334', '#000B21'],
        },
        light: {
          text: '#001D51',
          title: '#001D51',
          background: '#F1EBE3',
          navBackground: '#001D51',
          iconColor: '#737373',
          iconColorFocused: '#F1EBE3',
        },
      },
    },
  });
};

// POST /api/store/whatsapp-order-preview
// Allows generating a WhatsApp order URL directly from a list of book titles (even without auth if needed)
const buildDirectWhatsAppOrder = (req, res) => {
  const { bookTitles } = req.body;
  if (!Array.isArray(bookTitles) || bookTitles.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إرسال مصفوفة بأسماء الكتب المطلوب شراؤها (bookTitles)',
    });
  }

  return res.status(200).json({
    success: true,
    order: generateOrderWhatsAppLink(bookTitles),
  });
};

module.exports = {
  getStoreConfig,
  buildDirectWhatsAppOrder,
};
