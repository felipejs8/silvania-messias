document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Preloader Control
  const preloader = document.querySelector('.preloader');
  
  // Let the SVG animation complete first (minimum 2.5s)
  setTimeout(() => {
    preloader.classList.add('fade-out');
    // Remove from DOM after transition
    setTimeout(() => {
      preloader.remove();
    }, 1000);
  }, 2500);

  // 2. Floating Lavender Petals Generator
  const petalsContainer = document.querySelector('.petals-container');
  const petalCount = 25; // Controlled count for GPU performance

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    
    // Randomize properties
    const size = Math.random() * 8 + 6; // 6px to 14px
    const left = Math.random() * 100; // 0% to 100% width
    const duration = Math.random() * 15 + 12; // 12s to 27s
    const delay = Math.random() * -20; // negative delay to spawn instantly
    const rotate = Math.random() * 360;
    
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.5}px`; // oval shape
    petal.style.left = `${left}vw`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.transform = `rotate(${rotate}deg)`;
    
    petalsContainer.appendChild(petal);
  }

  // 3. Sticky Navigation Scroll Effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      nav.classList.toggle('active');
    });

    // Close menu when clicking links
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        nav.classList.remove('active');
      });
    });
  }

  // 4. Live Countdown Timer
  // Target: September 19, 2026 at 14:30 in Brazil/Brasilia Time (UTC-3)
  const targetDate = new Date('2026-09-19T14:30:00-03:00').getTime();
  
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');
  const countdownEl = document.querySelector('.countdown-container');

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      if (countdownEl) {
        countdownEl.innerHTML = '<span style="font-family: var(--font-title); font-size: 1.8rem; color: var(--color-gold-dark); text-transform: uppercase; letter-spacing: 0.05em;">O Grande Dia Chegou!</span>';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (timerDays) timerDays.textContent = String(days).padStart(2, '0');
    if (timerHours) timerHours.textContent = String(hours).padStart(2, '0');
    if (timerMinutes) timerMinutes.textContent = String(minutes).padStart(2, '0');
    if (timerSeconds) timerSeconds.textContent = String(seconds).padStart(2, '0');
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 5. Compliant BR Code/PIX Static Code Generator
  // Standard CRC16 calculation for PIX EMV-Co
  function calculateCRC16(str) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    
    for (let i = 0; i < str.length; i++) {
      let b = str.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        let bit = ((b >> (7 - j)) & 1) == 1;
        let c15 = ((crc >> 15) & 1) == 1;
        crc <<= 1;
        if (c15 ^ bit) crc ^= polynomial;
      }
    }
    
    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function generatePixPayload(key, merchantName, merchantCity, amount = 0, transactionId = '***') {
    let payload = '000201'; // Payload Format Indicator
    
    // Merchant Account Information - PIX (Tag 26)
    let merchantAccount = '0014br.gov.bcb.pix';
    // If phone number has no prefix (+55), format it
    let cleanKey = key.replace(/\D/g, '');
    if (cleanKey.length === 11 && !key.startsWith('+')) {
      cleanKey = '+55' + cleanKey;
    }
    merchantAccount += '01' + String(cleanKey.length).padStart(2, '0') + cleanKey;
    payload += '26' + String(merchantAccount.length).padStart(2, '0') + merchantAccount;
    
    payload += '52040000'; // Merchant Category Code (Tag 52)
    payload += '5303986';  // Transaction Currency - BRL (Tag 53)
    
    if (amount > 0) {
      let amountStr = amount.toFixed(2);
      payload += '54' + String(amountStr.length).padStart(2, '0') + amountStr;
    }
    
    payload += '5802BR'; // Country Code (Tag 58)
    
    // Merchant Name (Tag 59)
    let cleanName = merchantName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25);
    payload += '59' + String(cleanName.length).padStart(2, '0') + cleanName;
    
    // Merchant City (Tag 60)
    let cleanCity = merchantCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 15).toUpperCase();
    payload += '60' + String(cleanCity.length).padStart(2, '0') + cleanCity;
    
    // Additional Data Field Template (Tag 62)
    let additionalData = '05' + String(transactionId.length).padStart(2, '0') + transactionId;
    payload += '62' + String(additionalData.length).padStart(2, '0') + additionalData;
    
    payload += '6304'; // CRC16 Signature (Tag 63)
    let crc = calculateCRC16(payload);
    
    return payload + crc;
  }

  // Chave Pix data
  const pixKey = '33999120267';
  const pixPayload = generatePixPayload(pixKey, 'Silvania e Messias', 'Aguas Formosas');

  // Load and generate the QR Code
  const qrcodeContainer = document.getElementById('qrcode');
  if (qrcodeContainer && window.QRCode) {
    new QRCode(qrcodeContainer, {
      text: pixPayload,
      width: 200,
      height: 200,
      colorDark: '#3F2C52',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  // Toast alert triggering function
  const toast = document.getElementById('toast');
  const showToast = (message) => {
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  };

  // Clipboard Copier Buttons
  const btnCopyKey = document.getElementById('btn-copy-key');
  const btnCopyPayload = document.getElementById('btn-copy-payload');

  if (btnCopyKey) {
    btnCopyKey.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKey).then(() => {
        showToast('Chave PIX copiada para a área de transferência!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }

  if (btnCopyPayload) {
    btnCopyPayload.addEventListener('click', () => {
      navigator.clipboard.writeText(pixPayload).then(() => {
        showToast('Código Copia e Cola copiado! Abra o app do seu banco.');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }

  // 6. Interactive RSVP WhatsApp Form Router
  const rsvpForm = document.getElementById('wedding-rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const guestName = document.getElementById('guest-name').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked');
      const guestsCount = document.getElementById('guests-count').value || '0';
      const guestMessage = document.getElementById('guest-message').value.trim();

      if (!guestName) {
        showToast('Por favor, informe seu nome.');
        return;
      }
      if (!attendance) {
        showToast('Por favor, confirme se você comparecerá.');
        return;
      }

      const isAttending = attendance.value === 'yes';
      const attendanceText = isAttending ? 'Sim, com certeza!' : 'Infelizmente não poderei comparecer';
      
      // WhatsApp contact (bride/groom number) - using the PIX phone number as target
      const whatsappNumber = '5533999120267'; 
      
      // Build WhatsApp message content
      let msg = `Olá Silvânia & Messias!\n\n`;
      msg += `Gostaria de responder ao RSVP do casamento:\n\n`;
      msg += `*Nome:* ${guestName}\n`;
      msg += `*Confirmado:* ${attendanceText}\n`;
      
      if (isAttending) {
        msg += `*Acompanhantes:* ${guestsCount}\n`;
      }
      
      if (guestMessage) {
        msg += `*Mensagem:* "${guestMessage}"\n`;
      }

      // Encode and launch link
      const encodedMsg = encodeURIComponent(msg);
      const waUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMsg}`;
      
      showToast('Redirecionando para o WhatsApp...');
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    });
  }

  // Dynamic RSVP Accompaniment showing
  const radioYes = document.getElementById('rsvp-yes');
  const radioNo = document.getElementById('rsvp-no');
  const accompanimentGroup = document.getElementById('guests-count-group');

  if (radioYes && radioNo && accompanimentGroup) {
    radioYes.addEventListener('change', () => {
      if (radioYes.checked) {
        accompanimentGroup.style.display = 'block';
      }
    });
    radioNo.addEventListener('change', () => {
      if (radioNo.checked) {
        accompanimentGroup.style.display = 'none';
      }
    });
  }

  // 7. Scroll Reveal Animation Triggering (Intersection Observer)
  const reveals = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback: activate everything immediately
    reveals.forEach(el => el.classList.add('active'));
  }
});
