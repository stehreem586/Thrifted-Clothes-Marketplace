import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const ModerationContext = createContext(null);

// Policy Sections Reference Database
export const POLICY_SECTIONS = {
  'EXTERNAL_PAYMENTS': {
    code: 'Section A.2',
    title: 'External Payments & Off-Platform Settlement',
    summary: 'Soliciting, offering, or accepting payment through methods outside of the SecondLife secure checkout is strictly prohibited to protect buyers and sellers from fraud.',
    fullText: `Section A.2: External Payments Policy
1. All transactions on SecondLife must take place through our integrated secure payment system.
2. Soliciting or agreeing to receive funds via off-platform channels (such as PayPal, Bank Transfers, Easypaisa, JazzCash, Wire Transfers, WhatsApp, or Telegram) is strictly forbidden.
3. Violations result in immediate listing removal and account suspension or permanent banning.`
  },
  'FRAUD_SCAM': {
    code: 'Section D.3',
    title: 'Fraud & Scam Attempts',
    summary: 'Attempting to deceive users, misrepresent high-value items, or engage in suspicious payment activity leads to permanent expulsion.',
    fullText: `Section D.3: Anti-Fraud & Scam Standards
1. Fraudulent behavior including fake tracking numbers, non-delivery, phishing links, and identity misrepresentation is prohibited.
2. High-priority flags trigger immediate account holds and security investigation.`
  },
  'COUNTERFEIT': {
    code: 'Section C.4',
    title: 'Counterfeit & Replica Items',
    summary: 'Selling, attempting to sell, or encouraging the purchase of counterfeit or unauthorized replica goods is illegal and strictly forbidden.',
    fullText: `Section C.4: Intellectual Property & Authenticity
1. Sellers must verify authenticity before listing branded luxury items.
2. Counterfeit items will be deleted immediately, and seller accounts will be subject to 30-day or permanent bans.`
  },
  'HARASSMENT_ABUSE': {
    code: 'Section B.1',
    title: 'Abusive Language & Harassment',
    summary: 'SecondLife enforces a zero-tolerance policy against hate speech, abusive language, bullying, and harassment.',
    fullText: `Section B.1: Community Conduct & Respect
1. Respectful communication is required in all chats, reviews, and community comments.
2. Using profanity, slurs, threats, or unsolicited aggressive messages will result in warning points or account bans.`
  },
  'MISLEADING_REVIEWS': {
    code: 'Section E.1',
    title: 'Fake Reviews & Rating Manipulation',
    summary: 'Posting deceptive, coerced, or fabricated reviews undermines marketplace trust.',
    fullText: `Section E.1: Review Authenticity
1. Buyers and sellers may not post false reviews or manipulate feedback ratings.
2. Fabricated reviews will be purged from storefront profiles.`
  },
  'GENERAL_GUIDELINES': {
    code: 'Section G.1',
    title: 'General Community Guidelines',
    summary: 'All users must abide by platform safety, spam prevention, and listing accuracy standards.',
    fullText: `Section G.1: General Guidelines
1. Ensure all listing images and descriptions accurately represent item condition.
2. Spam messages and duplicate listings are automatically cleaned up by moderation tools.`
  }
};

// Default Keyword Scanner List
export const AUTO_DETECTION_KEYWORDS = [
  'paypal', 'easypaisa', 'jazzcash', 'bank transfer', 'wire transfer', 'iban',
  'pay outside', 'send directly', 'whatsapp me', 'telegram', 'contact me privately',
  'sadapay', 'nayapay', 'zindigi', 'venmo', 'cashapp', 'zelle', 'call me on'
];

// Initial Rich Mock Report Dataset (Normalized Structure)
const INITIAL_REPORTS = [
  {
    id: 'REP-4823',
    ticketId: '#4823',
    title: 'Suspicious Transaction & External Payment',
    reportType: 'External Payment Request',
    priority: 'High',
    priorityType: 'high',
    source: 'System Detected',
    policyKey: 'EXTERNAL_PAYMENTS',
    status: 'Pending',
    statusType: 'open',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    timeAgo: '4 mins ago',

    reporter: {
      id: 'usr_lydia_01',
      username: '@LydiaV',
      name: 'Lydia Vance',
      email: 'lydia.vance@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
      verified: true,
      accountAge: '14 Days',
      listingsCount: 2,
      totalSales: 0,
      warningsCount: 1,
      suspensionsCount: 0,
      reportsCount: 1,
      lastLogin: '10 mins ago'
    },
    accused: {
      id: 'usr_merchant_x',
      username: '@Merchant_X',
      name: 'Merchant X',
      email: 'merchant.x@example.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80',
      verified: false,
      accountAge: '3 Days',
      listingsCount: 12,
      totalSales: 2,
      warningsCount: 3,
      suspensionsCount: 0,
      reportsCount: 4,
      lastLogin: 'Just now'
    },

    listing: {
      id: '#46-4682',
      title: 'Vintage Gold Trench Coat',
      price: '$450.00',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
      seller: '@Merchant_X'
    },

    evidence: {
      summary: 'System flag detected attempt to redirect payment off-platform via Venmo / CashApp.',
      flaggedMessageId: 'msg_901',
      messages: [
        { id: 'msg_899', sender: '@LydiaV', text: 'Hi! Is this Vintage Gold Trench available for instant dispatch?', time: '10:20 AM' },
        { id: 'msg_900', sender: '@Merchant_X', text: 'Yes! It is ready to ship out today.', time: '10:22 AM' },
        { id: 'msg_901', sender: '@Merchant_X', text: 'Can we do this outside of SecondLife? I can pay via Venmo/CashApp directly or bank transfer to avoid fees.', time: '10:24 AM', isFlagged: true, flagReason: 'External Payment Solicit' },
        { id: 'msg_902', sender: '@LydiaV', text: 'I only buy through SecondLife secure checkout for protection.', time: '10:25 AM' }
      ],
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80'
      ]
    }
  },
  {
    id: 'REP-4824',
    ticketId: '#4824',
    title: 'Counterfeit Luxury Bag Claim',
    reportType: 'Counterfeit Item',
    priority: 'High',
    priorityType: 'high',
    source: 'User Report',
    policyKey: 'COUNTERFEIT',
    status: 'Under Review',
    statusType: 'open',
    createdAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    timeAgo: '34 mins ago',

    reporter: {
      id: 'usr_luxury_reseller',
      username: '@luxury_reseller',
      name: 'Elena Archive',
      email: 'elena@archivelux.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
      verified: true,
      accountAge: '2 Years',
      listingsCount: 45,
      totalSales: 128,
      warningsCount: 0,
      suspensionsCount: 0,
      reportsCount: 0,
      lastLogin: '1 hour ago'
    },
    accused: {
      id: 'usr_alex_vintg',
      username: '@alex_vintg',
      name: 'Alex Vintage Store',
      email: 'alex.vintg@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      verified: false,
      accountAge: '45 Days',
      listingsCount: 8,
      totalSales: 5,
      warningsCount: 1,
      suspensionsCount: 0,
      reportsCount: 2,
      lastLogin: '3 hours ago'
    },

    listing: {
      id: '#46-9901',
      title: 'Chanel 19 Flap Bag',
      price: '$2,800.00',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
      seller: '@alex_vintg'
    },

    evidence: {
      summary: 'Buyer claims interior label heat stamp does not match Chanel authentic production guidelines.',
      messages: [
        { id: 'msg_701', sender: '@alex_vintg', text: 'I assure you it is 100% authentic. I bought it from the Paris flagship store.', time: '09:12 AM' },
        { id: 'msg_702', sender: '@luxury_reseller', text: 'The heat stamp font and serial code placement are completely off. Filing dispute.', time: '09:15 AM', isFlagged: true, flagReason: 'Counterfeit Item Report' }
      ],
      images: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'
      ]
    }
  },
  {
    id: 'REP-4827',
    ticketId: '#4827',
    title: 'Abusive Language in Messages',
    reportType: 'Abusive Language',
    priority: 'Medium',
    priorityType: 'medium',
    source: 'User Report',
    policyKey: 'HARASSMENT_ABUSE',
    status: 'Pending',
    statusType: 'open',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeAgo: '15 mins ago',

    reporter: {
      id: 'usr_euro_chic',
      username: '@Seller_EuroChic',
      name: 'EuroChic Vintage',
      email: 'eurochic@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      verified: true,
      accountAge: '6 Months',
      listingsCount: 30,
      totalSales: 64,
      warningsCount: 0,
      suspensionsCount: 0,
      reportsCount: 0,
      lastLogin: '25 mins ago'
    },
    accused: {
      id: 'usr_mod_lover',
      username: '@mod_lover',
      name: 'Sam Brown',
      email: 'sam.brown@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      verified: false,
      accountAge: '20 Days',
      listingsCount: 0,
      totalSales: 0,
      warningsCount: 2,
      suspensionsCount: 0,
      reportsCount: 3,
      lastLogin: '12 mins ago'
    },

    listing: {
      id: '#46-2210',
      title: 'Saint Laurent Wyatt Boots',
      price: '$620.00',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
      seller: '@Seller_EuroChic'
    },

    evidence: {
      summary: 'Buyer used aggressive profanity and harassment after lowball offer rejection.',
      messages: [
        { id: 'msg_601', sender: '@mod_lover', text: 'Will you take $100 for these boots right now?', time: '11:00 AM' },
        { id: 'msg_602', sender: '@Seller_EuroChic', text: 'No sorry, price is firm at $620.', time: '11:02 AM' },
        { id: 'msg_603', sender: '@mod_lover', text: 'You are a scammer and pathetic idiot sell it to me or else!', time: '11:04 AM', isFlagged: true, flagReason: 'Abusive Language & Harassment' }
      ],
      images: []
    }
  },
  {
    id: 'REP-4828',
    ticketId: '#4828',
    title: 'Duplicate & Spam Listing',
    reportType: 'Duplicate Listings',
    priority: 'Low',
    priorityType: 'low',
    source: 'System Detected',
    policyKey: 'GENERAL_GUIDELINES',
    status: 'Resolved',
    statusType: 'resolved',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    timeAgo: '2 hours ago',

    reporter: {
      id: 'sys_auto',
      username: 'System Auto-Guardian',
      name: 'System Bot',
      email: 'system@secondlife.com',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80',
      verified: true,
      accountAge: 'System',
      listingsCount: 0,
      totalSales: 0,
      warningsCount: 0,
      suspensionsCount: 0,
      reportsCount: 0,
      lastLogin: 'Active'
    },
    accused: {
      id: 'usr_promo_deals',
      username: '@promo_deals_32',
      name: 'Promo Deals 32',
      email: 'promo32@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      verified: false,
      accountAge: '5 Days',
      listingsCount: 28,
      totalSales: 0,
      warningsCount: 1,
      suspensionsCount: 0,
      reportsCount: 5,
      lastLogin: '1 hour ago'
    },

    listing: {
      id: '#46-4671',
      title: 'Bulk Nike Sneakers - Brand New',
      price: '$120.00',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      seller: '@promo_deals_32'
    },

    evidence: {
      summary: 'System identified 15 identical listing posts with identical stock photos within 10 minutes.',
      messages: [],
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80']
    }
  }
];

export const ModerationProvider = ({ children }) => {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('secondlife_admin_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_REPORTS;
  });

  const [auditLog, setAuditLog] = useState(() => {
    const saved = localStorage.getItem('secondlife_moderation_audit_log');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'LOG-101',
        moderator: 'Admin Sarah',
        action: 'System Initialized',
        date: new Date(Date.now() - 3600 * 1000).toLocaleString(),
        reason: 'Platform Trust & Safety Engine Online',
        notes: 'Monitoring active policy compliance.'
      }
    ];
  });

  const [userNotifications, setUserNotifications] = useState(() => {
    const saved = localStorage.getItem('secondlife_user_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Supabase Database Hydration on Mount
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        // Attempt to fetch reports from Supabase 'reports' table
        const { data: dbReports, error: reportsErr } = await supabase
          .from('reports')
          .select('*, report_evidence(*)');

        if (!reportsErr && dbReports && dbReports.length > 0) {
          console.log('Successfully loaded moderation reports from Supabase Database!');
          const mappedDbReports = dbReports.map(r => ({
            id: r.id,
            ticketId: r.ticket_id || `#${r.id}`,
            title: r.title,
            reportType: r.report_type,
            priority: r.priority,
            priorityType: r.priority_type || r.priority?.toLowerCase(),
            source: r.source,
            policyKey: r.policy_key,
            status: r.status,
            statusType: r.status_type,
            createdAt: r.created_at,
            timeAgo: 'Recently',
            reporter: {
              id: r.reporter_id,
              username: '@reporter',
              name: 'Reporter'
            },
            accused: {
              id: r.accused_id,
              username: '@accused',
              name: 'Accused User'
            },
            evidence: r.report_evidence?.[0] ? {
              summary: r.report_evidence[0].summary,
              flaggedMessageId: r.report_evidence[0].flagged_message_id,
              messages: r.report_evidence[0].messages_json || [],
              images: r.report_evidence[0].images_json || []
            } : { summary: 'No evidence payload attached.' }
          }));

          setReports(prev => {
            // Merge database reports with local state avoiding duplicates
            const existingIds = new Set(prev.map(p => p.id));
            const newAdditions = mappedDbReports.filter(m => !existingIds.has(m.id));
            return [...newAdditions, ...prev];
          });
        }
      } catch (err) {
        console.info('Supabase moderation table sync fallback:', err.message);
      }
    };

    loadSupabaseData();
  }, []);

  // Save to local storage on update
  useEffect(() => {
    localStorage.setItem('secondlife_admin_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('secondlife_moderation_audit_log', JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    localStorage.setItem('secondlife_user_notifications', JSON.stringify(userNotifications));
  }, [userNotifications]);

  // Priority Calculator based on Specification Rules
  const calculatePriority = (reportType, userViolationsCount = 0) => {
    const highPriorityTypes = ['Fraud / Scam Attempt', 'Counterfeit Item', 'Identity Impersonation', 'Suspicious Transaction'];
    const mediumPriorityTypes = ['Abusive Language', 'Harassment', 'Spam', 'Fake Listing', 'Duplicate Listings', 'Fake Reviews', 'Inappropriate Content'];

    if (highPriorityTypes.includes(reportType) || userViolationsCount > 2) {
      return { priority: 'High', priorityType: 'high' };
    }
    if (mediumPriorityTypes.includes(reportType)) {
      return { priority: 'Medium', priorityType: 'medium' };
    }
    return { priority: 'Low', priorityType: 'low' };
  };

  // Automated Keyword Scanner for Messages & Listings
  const scanTextForViolations = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase();

    for (const kw of AUTO_DETECTION_KEYWORDS) {
      if (lower.includes(kw)) {
        return {
          type: 'External Payment Request',
          policyKey: 'EXTERNAL_PAYMENTS',
          keyword: kw,
          reason: `Auto-Detected keyword: "${kw}" soliciting external transaction.`
        };
      }
    }

    const phoneRegex = /(?:\+92|0)?3\d{2}[- ]?\d{7}\b|\b\d{10,11}\b/;
    if (phoneRegex.test(text)) {
      return {
        type: 'External Payment Request',
        policyKey: 'EXTERNAL_PAYMENTS',
        keyword: 'Phone Number',
        reason: 'Auto-Detected phone number contact solicitation.'
      };
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(text)) {
      return {
        type: 'External Payment Request',
        policyKey: 'EXTERNAL_PAYMENTS',
        keyword: 'Email Address',
        reason: 'Auto-Detected email contact solicitation.'
      };
    }

    return null;
  };

  // Submit User-Generated Report (With Supabase Insert)
  const submitUserReport = async ({
    reportType,
    description,
    reporter,
    accused,
    listing = null,
    messageId = null,
    evidenceImages = []
  }) => {
    const reportIdNum = Math.floor(1000 + Math.random() * 9000);
    const reportId = `REP-${reportIdNum}`;
    const ticketId = `#${reportIdNum}`;

    const priorityInfo = calculatePriority(reportType, accused?.warningsCount || 0);

    let policyKey = 'GENERAL_GUIDELINES';
    if (reportType.includes('Payment') || reportType.includes('External')) policyKey = 'EXTERNAL_PAYMENTS';
    else if (reportType.includes('Fraud') || reportType.includes('Scam')) policyKey = 'FRAUD_SCAM';
    else if (reportType.includes('Counterfeit')) policyKey = 'COUNTERFEIT';
    else if (reportType.includes('Abusive') || reportType.includes('Harassment')) policyKey = 'HARASSMENT_ABUSE';
    else if (reportType.includes('Review')) policyKey = 'MISLEADING_REVIEWS';

    const newReport = {
      id: reportId,
      ticketId,
      title: `${reportType}: ${listing ? listing.title : 'User Behavior'}`,
      reportType,
      priority: priorityInfo.priority,
      priorityType: priorityInfo.priorityType,
      source: 'User Report',
      policyKey,
      status: 'Pending',
      statusType: 'open',
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
      reporter: {
        id: reporter?.id || 'usr_anonymous',
        username: reporter?.username || (reporter?.name ? `@${reporter.name.replace(/\s+/g, '_')}` : '@anonymous'),
        name: reporter?.name || 'Community Buyer',
        email: reporter?.email || 'user@example.com',
        avatar: reporter?.avatar_url || reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
        verified: !!reporter?.verified,
        accountAge: '30 Days',
        listingsCount: reporter?.listingsCount || 0,
        totalSales: reporter?.sales_count || 0,
        warningsCount: 0,
        suspensionsCount: 0,
        reportsCount: 1,
        lastLogin: 'Active now'
      },
      accused: {
        id: accused?.id || 'usr_target',
        username: accused?.username || (accused?.name ? `@${accused.name.replace(/\s+/g, '_')}` : '@accused_user'),
        name: accused?.name || 'Reported User',
        email: accused?.email || 'accused@example.com',
        avatar: accused?.avatar_url || accused?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        verified: !!accused?.verified,
        accountAge: '60 Days',
        listingsCount: accused?.listingsCount || 3,
        totalSales: accused?.sales_count || 1,
        warningsCount: 1,
        suspensionsCount: 0,
        reportsCount: 2,
        lastLogin: '15 mins ago'
      },
      listing: listing ? {
        id: listing.id ? String(listing.id) : '#46-0000',
        title: listing.title || 'Marketplace Item',
        price: listing.price || '$0.00',
        image: listing.image || listing.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
        seller: accused?.name || 'Seller'
      } : null,
      evidence: {
        summary: description || `Report filed regarding ${reportType}.`,
        flaggedMessageId: messageId,
        messages: messageId ? [
          { id: messageId, sender: accused?.name || 'Reported User', text: description || 'Flagged message content.', time: 'Just now', isFlagged: true }
        ] : [],
        images: evidenceImages
      }
    };

    setReports(prev => [newReport, ...prev]);

    // Persist to Supabase Database
    try {
      const isUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      const dbReport = {
        id: reportId,
        ticket_id: ticketId,
        title: newReport.title,
        report_type: reportType,
        priority: priorityInfo.priority,
        priority_type: priorityInfo.priorityType,
        source: 'User Report',
        policy_key: policyKey,
        status: 'Pending',
        status_type: 'open',
        reporter_id: isUuid(reporter?.id) ? reporter.id : null,
        accused_id: isUuid(accused?.id) ? accused.id : null,
        listing_id: isUuid(listing?.id) ? listing.id : null
      };

      const { error: insertErr } = await supabase.from('reports').insert(dbReport);
      if (!insertErr) {
        await supabase.from('report_evidence').insert({
          report_id: reportId,
          summary: description,
          flagged_message_id: messageId,
          messages_json: newReport.evidence.messages,
          images_json: evidenceImages
        });
      }
    } catch (err) {
      console.info('Supabase database sync optional notice:', err.message);
    }

    return newReport;
  };

  // Perform Moderation Action (With Supabase Sync)
  const takeModerationAction = async ({
    reportId,
    actionType,
    moderatorName = 'Admin',
    reason = '',
    notes = ''
  }) => {
    let statusUpdate = null;

    setReports(prev => prev.map(r => {
      if (r.id === reportId || r.ticketId === reportId) {
        let newStatus = r.status;
        let newStatusType = r.statusType;

        if (actionType === 'under_review') {
          newStatus = 'Under Review';
          newStatusType = 'open';
        } else if (actionType === 'dismiss') {
          newStatus = 'Dismissed';
          newStatusType = 'dismissed';
        } else if (['send_warning', 'delete_message', 'remove_listing', 'hide_listing', 'suspend_1', 'suspend_7', 'suspend_30', 'ban_user'].includes(actionType)) {
          newStatus = 'Resolved';
          newStatusType = 'resolved';
        } else if (actionType === 'restore_listing') {
          newStatus = 'Resolved';
          newStatusType = 'resolved';
        }

        statusUpdate = {
          ...r,
          status: newStatus,
          statusType: newStatusType
        };
        return statusUpdate;
      }
      return r;
    }));

    const actionTitles = {
      'under_review': 'Marked Under Review',
      'dismiss': 'Dismissed Report',
      'send_warning': 'Issued Official Warning',
      'delete_message': 'Deleted Offending Message',
      'remove_listing': 'Removed Listing Permanently',
      'hide_listing': 'Hidden Listing from Public Search',
      'restore_listing': 'Restored Listing',
      'suspend_1': 'Suspended User (1 Day)',
      'suspend_7': 'Suspended User (7 Days)',
      'suspend_30': 'Suspended User (30 Days)',
      'ban_user': 'Permanently Banned User'
    };

    const newLogId = `LOG-${Date.now().toString().slice(-4)}`;
    const newLogEntry = {
      id: newLogId,
      moderator: moderatorName,
      action: actionTitles[actionType] || actionType,
      reportId,
      date: new Date().toLocaleString(),
      reason: reason || 'Violation of Marketplace Policy',
      notes: notes || 'Moderation action applied successfully.'
    };

    setAuditLog(prev => [newLogEntry, ...prev]);

    // Persist Moderation Action to Supabase
    try {
      await supabase.from('reports').update({
        status: statusUpdate?.status || 'Resolved',
        status_type: statusUpdate?.statusType || 'resolved'
      }).eq('id', reportId);

      await supabase.from('moderation_actions').insert({
        id: newLogId,
        report_id: reportId,
        moderator_name: moderatorName,
        action_type: actionType,
        reason: reason || 'Violation of Marketplace Policy',
        notes: notes
      });
    } catch (err) {
      console.info('Supabase moderation audit sync notice:', err.message);
    }

    return true;
  };

  return (
    <ModerationContext.Provider value={{
      reports,
      auditLog,
      userNotifications,
      POLICY_SECTIONS,
      AUTO_DETECTION_KEYWORDS,
      scanTextForViolations,
      submitUserReport,
      takeModerationAction
    }}>
      {children}
    </ModerationContext.Provider>
  );
};

export const useModeration = () => {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};
