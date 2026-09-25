const db = require('../config/db');

class NotificationService {
  constructor() {
    this.notifications = [
      {
        id: 'NOTIF-001',
        recipient_role: 'ASHA_WORKER',
        recipient_name: 'Sunita Devi (ASHA, Bundu)',
        phone_masked: '+91 9835X-XXXX1',
        channel: 'WHATSAPP',
        type: 'COLD_CHAIN_ALERT',
        template_hindi: '⚠️ आरोग्यग्रिड सूचना: नामकुम पीएचसी के रेफ्रिजरेटर का तापमान 7.9°C पहुँच गया है। कृपया वैक्सीन सुरक्षित करें।',
        template_english: '⚠️ ArogyaGrid Alert: Refrigerator at Namkum PHC reached 7.9°C. Please verify ILR power supply.',
        status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
      },
      {
        id: 'NOTIF-002',
        recipient_role: 'COMMUNITY_HEALTH_OFFICER',
        recipient_name: 'Dr. Ramesh Oraon (CHO, Bundu HWC)',
        phone_masked: '+91 9431X-XXXX8',
        channel: 'WHATSAPP',
        type: 'FEFO_SHIPMENT_ARRIVAL',
        template_hindi: '📦 आरोग्यग्रिड सूचना: JSMSCL से इन्सुलिन और एंटी-रेबीज का नया बैच आपके केंद्र के लिए रवाना हो चुका है।',
        template_english: '📦 ArogyaGrid Logistics: New batch of Insulin & ARV dispatched from JSMSCL. Expected arrival in 45 mins.',
        status: 'READ',
        dispatched_at: new Date(Date.now() - 1000 * 60 * 65).toISOString()
      },
      {
        id: 'NOTIF-003',
        recipient_role: 'DISTRICT_OFFICER',
        recipient_name: 'Dr. B. K. Singh (Civil Surgeon)',
        phone_masked: '+91 9430X-XXXX3',
        channel: 'SMS_GATEWAY',
        type: 'IDSP_EPIDEMIC_SURGE',
        template_hindi: '🚨 IDSP अलर्ट: नामकुम पीएचसी में ओआरएस खपत में 240% वृद्धि। हैजा/डायरिया क्लस्टर की आशंका।',
        template_english: '🚨 IDSP Alert: Acute Diarrhea spike (+240% ORS burn) detected at Namkum. Pre-position buffers.',
        status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ];
  }

  getRecentNotifications(role = null) {
    if (!role || role === 'ALL') return this.notifications;
    return this.notifications.filter(n => n.recipient_role === role);
  }

  simulateDispatch({ recipient_role, recipient_name, channel, type, message_hi, message_en }) {
    const newNotif = {
      id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
      recipient_role: recipient_role || 'ASHA_WORKER',
      recipient_name: recipient_name || 'Frontline Health Worker',
      phone_masked: '+91 9835X-XXXX9',
      channel: channel || 'WHATSAPP',
      type: type || 'SUPPLY_ALERT',
      template_hindi: message_hi || 'आरोग्यग्रिड: आपकी आवश्यक दवा आपूर्ति स्वीकृत हो चुकी है।',
      template_english: message_en || 'ArogyaGrid: Essential supply request has been approved.',
      status: 'DELIVERED',
      dispatched_at: new Date().toISOString()
    };

    this.notifications.unshift(newNotif);
    if (this.notifications.length > 20) this.notifications.pop();
    return newNotif;
  }
}

module.exports = new NotificationService();
