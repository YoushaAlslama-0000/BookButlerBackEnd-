const getWhatsAppNumber = () => {
  return (process.env.STORE_WHATSAPP_NUMBER || '963980266994').replace(/[^0-9]/g, '');
};

/**
 * Generate WhatsApp Support Link when user has login issues
 */
const generateSupportWhatsAppLink = () => {
  const phone = getWhatsAppNumber();
  const message =
    'مرحبا Book Butler  , لدي مشكلة في تسجيل الدخول لحسابي على موقع متجر الكتب و احتاج لمساعدة';
  return {
    phone: `+${phone}`,
    message,
    whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  };
};

/**
 * Generate WhatsApp Order Link with requested book titles
 * @param {string[]} bookTitles
 */
const generateOrderWhatsAppLink = (bookTitles = []) => {
  const phone = getWhatsAppNumber();
  const formattedBooks = bookTitles.join(' ، ');
  const message = `مرحبا Book Butler , اريد شراء الكتب التالية :  "${formattedBooks}"`;
  return {
    phone: `+${phone}`,
    message,
    whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  };
};

module.exports = {
  generateSupportWhatsAppLink,
  generateOrderWhatsAppLink,
};
