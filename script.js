document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      header.style.padding = '10px 0';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.96)';
    } else {
      header.classList.remove('scrolled');
      header.style.padding = '16px 0';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
    }
  });

  // 2. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all other active items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current item
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // 3. Connect Pricing Package Selection to Form Dropdown
  const selectPackageButtons = document.querySelectorAll('.select-package-btn');
  const packageSelect = document.getElementById('product-package');

  selectPackageButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = button.getAttribute('data-qty');
      
      if (qty === '1') {
        packageSelect.value = '1-bottle';
      } else if (qty === '2') {
        packageSelect.value = '2-bottles';
      }

      // Smooth scroll to order section
      const orderSection = document.getElementById('order-form-section');
      orderSection.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on the form (first input)
      setTimeout(() => {
        document.getElementById('full-name').focus();
      }, 800);
    });
  });

  // 4. Handle Order Form Submit and Redirect to WhatsApp
  const orderForm = document.getElementById('order-form');
  const submitBtn = document.getElementById('submit-btn');

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.innerHTML = '<span>Redirecting to WhatsApp...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

    // Get Form values
    const fullName = document.getElementById('full-name').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const whatsappNumber = document.getElementById('whatsapp-number').value.trim();
    const selectedPackageVal = packageSelect.value;
    const deliveryAddress = document.getElementById('delivery-address').value.trim();

    // Translate package details and price
    let packageName = "";
    let packagePrice = "";
    if (selectedPackageVal === '1-bottle') {
      packageName = "1 Bottle (500ml) Pack";
      packagePrice = "₦29,000";
    } else if (selectedPackageVal === '2-bottles') {
      packageName = "2 Bottles (1,000ml Total) Double Pack";
      packagePrice = "₦50,000";
    }

    // Build the WhatsApp message payload
    const textMessage = `Hello Fenkang Hair Nigeria,\n\n` +
      `I would like to place an order for Fenkang Hair Color:\n\n` +
      `📦 *Package:* ${packageName}\n` +
      `💰 *Total Amount:* ${packagePrice}\n` +
      `👤 *Name:* ${fullName}\n` +
      `📞 *Phone Number:* ${phoneNumber}\n` +
      `💬 *WhatsApp Number:* ${whatsappNumber}\n` +
      `📍 *Delivery Address:* ${deliveryAddress}\n\n` +
      `🚛 *Shipping:* FREE Delivery\n` +
      `💵 *Payment Mode:* Payment on Delivery (POD)\n\n` +
      `Please confirm my order. Thank you!`;

    // WhatsApp Direct Link Construction (2348141360753)
    const encodedMessage = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/2348141360753?text=${encodedMessage}`;

    // Redirect to WhatsApp
    setTimeout(() => {
      window.location.href = whatsappUrl;
      
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerHTML = '<span>Submit Order via WhatsApp</span> <i class="fa-brands fa-whatsapp"></i>';
    }, 1000);
  });
});
