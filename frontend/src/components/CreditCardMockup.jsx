import React from 'react';

const CreditCardMockup = ({ cardNumber, cardHolder, expiry, cvv, isFlipped }) => {
  // Brand detection based on first digits
  const getCardType = () => {
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(cleanNum)) return 'mastercard';
    if (/^3[47]/.test(cleanNum)) return 'amex';
    return 'generic';
  };

  const cardType = getCardType();

  // Format card number to groups of 4 digits
  const formatCardNumber = () => {
    const cleanNum = cardNumber.replace(/\D/g, '').slice(0, 16);
    if (!cleanNum) return '••••  ••••  ••••  ••••';
    const parts = cleanNum.match(/.{1,4}/g);
    const formatted = parts ? parts.join('  ') : '';
    // Pad remaining
    const remainingDots = 16 - cleanNum.length;
    let pad = '';
    if (remainingDots > 0) {
      const dotGroups = Math.ceil(remainingDots / 4);
      pad = '  ' + Array(dotGroups).fill('••••').join('  ');
    }
    return (formatted + pad).slice(0, 24);
  };

  return (
    <div style={styles.cardContainer}>
      <div 
        style={{
          ...styles.cardInner,
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* CARD FRONT */}
        <div style={{...styles.cardFront, ...styles.cardGradients[cardType]}}>
          {/* Top Row: Chip & Wireless icon + Brand Logo */}
          <div style={styles.topRow}>
            <div style={styles.chipWrapper}>
              <div style={styles.chip}></div>
              <span style={styles.contactless}>📡</span>
            </div>
            <div style={styles.brandLogo}>
              {cardType === 'visa' && <span style={styles.visaText}>VISA</span>}
              {cardType === 'mastercard' && (
                <div style={styles.mastercardLogo}>
                  <div style={{...styles.mcCircle, background: '#eb001b'}}></div>
                  <div style={{...styles.mcCircle, background: '#f79e1b', marginLeft: '-12px'}}></div>
                </div>
              )}
              {cardType === 'amex' && <span style={styles.amexText}>AMEX</span>}
              {cardType === 'generic' && <span style={styles.genericText}>CARD</span>}
            </div>
          </div>

          {/* Middle Row: Card Number */}
          <div style={styles.numberRow}>
            {formatCardNumber()}
          </div>

          {/* Bottom Row: Holder & Expiry */}
          <div style={styles.bottomRow}>
            <div style={styles.holderBlock}>
              <span style={styles.label}>CARDHOLDER</span>
              <span style={styles.holderValue}>
                {cardHolder.trim() ? cardHolder.toUpperCase() : 'YOUR NAME HERE'}
              </span>
            </div>
            <div style={styles.expiryBlock}>
              <span style={styles.label}>EXPIRES</span>
              <span style={styles.expiryValue}>
                {expiry.trim() ? expiry : 'MM/YY'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD BACK (FLIPPED VIEW FOR CVV) */}
        <div style={{...styles.cardBack, ...styles.cardGradients[cardType]}}>
          <div style={styles.magneticStripe}></div>
          <div style={styles.cvvContainer}>
            <div style={styles.cvvLabel}>SECURITY CODE (CVV)</div>
            <div style={styles.cvvBox}>
              <span style={styles.cvvValue}>{cvv ? '•'.repeat(cvv.length) : '•••'}</span>
            </div>
          </div>
          <div style={styles.backFooter}>
            Authorized Signature • Simulated Test Mode
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    width: '100%',
    maxWidth: '380px',
    height: '220px',
    perspective: '1000px',
    margin: '0 auto 28px auto'
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d'
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 16px 35px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    userSelect: 'none'
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '18px',
    transform: 'rotateY(180deg)',
    boxShadow: '0 16px 35px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '20px 0',
    color: '#ffffff',
    userSelect: 'none'
  },
  cardGradients: {
    visa: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)'
    },
    mastercard: {
      background: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #9a3412 100%)'
    },
    amex: {
      background: 'linear-gradient(135deg, #111827 0%, #374151 50%, #4b5563 100%)'
    },
    generic: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    }
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chipWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  chip: {
    width: '45px',
    height: '34px',
    background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)',
    borderRadius: '6px',
    border: '1px solid #ca8a04',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.5)'
  },
  contactless: {
    fontSize: '1.2rem',
    opacity: 0.85
  },
  brandLogo: {
    fontWeight: '800',
    fontStyle: 'italic',
    fontSize: '1.3rem',
    letterSpacing: '1px'
  },
  visaText: {
    fontFamily: 'sans-serif',
    fontWeight: '900',
    color: '#60a5fa',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  mastercardLogo: {
    display: 'flex',
    alignItems: 'center'
  },
  mcCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    opacity: 0.9
  },
  amexText: {
    color: '#38bdf8',
    fontWeight: '800'
  },
  genericText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700'
  },
  numberRow: {
    fontSize: '1.25rem',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '2px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    margin: '14px 0'
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  holderBlock: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingRight: '12px'
  },
  expiryBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  label: {
    fontSize: '0.62rem',
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
    letterSpacing: '1px',
    marginBottom: '2px'
  },
  holderValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px'
  },
  expiryValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1px',
    fontFamily: 'Courier New, monospace'
  },
  magneticStripe: {
    width: '100%',
    height: '42px',
    background: '#090a0f',
    marginTop: '10px'
  },
  cvvContainer: {
    padding: '0 24px'
  },
  cvvLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginBottom: '4px',
    fontWeight: '700'
  },
  cvvBox: {
    background: '#ffffff',
    height: '38px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '16px'
  },
  cvvValue: {
    color: '#0f172a',
    fontFamily: 'Courier New, monospace',
    fontWeight: '800',
    fontSize: '1.1rem',
    letterSpacing: '3px'
  },
  backFooter: {
    textAlign: 'center',
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: '10px'
  }
};

export default CreditCardMockup;
