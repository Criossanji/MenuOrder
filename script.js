(function(){
  const restaurantPhone = '96170673328';
  const ORDER_TYPE_KEY = 'croissanji_order_type_v1';
  const PRICE_MULTIPLIER = 1.25;

  const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));
  const $ = (sel, parent=document) => parent.querySelector(sel);

  const toMoney = (num) => {
    return (Math.round(num * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  function parsePrice(text){
    const match = (text||'').match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  function formatPriceValue(value){
    return `${toMoney(value)} $`;
  }

  function getItemFromCard(card){
    const name = card.querySelector('h3')?.textContent?.trim() || '';
    const desc = card.querySelector('.item-info p:not(.calories):not(.price)')?.textContent?.trim() || '';
    const price = parsePrice(card.querySelector('.price')?.textContent || '0');
    const img = card.querySelector('img')?.getAttribute('src') || '';
    return { id: name, name, desc, price, img };
  }

  const CART_KEY = 'croissanji_cart_v1';
  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)||'{}'); }catch(_){ return {}; }
  }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function addToCart(item, qty){
    const cart = loadCart();
    const current = cart[item.id] || { ...item, qty: 0 };
    current.qty = Math.min(99, Math.max(0, (current.qty||0) + qty));
    if(current.qty <= 0){ delete cart[item.id]; } else { cart[item.id] = current; }
    saveCart(cart);
    renderCart();
  }

  function setQty(id, qty){
    const cart = loadCart();
    if(!cart[id]) return;
    const next = Math.min(99, Math.max(0, qty));
    if(next <= 0){ delete cart[id]; } else { cart[id].qty = next; }
    saveCart(cart);
    renderCart();
  }

  function clearCart(){ saveCart({}); renderCart(); }

  function getOrderType(){
    return localStorage.getItem(ORDER_TYPE_KEY) || '';
  }

  function isDeliveryMode(){
    return getOrderType() === 'delivery';
  }

  function renderCart(){
    const container = document.querySelector('#cart');
    if(!container) return;
    if(!isDeliveryMode()){
      container.innerHTML = '';
      return;
    }
    const cart = loadCart();
    const entries = Object.values(cart);
    if(entries.length === 0){
      container.innerHTML = '<div class="cart"><h3>Your Cart</h3><div class="cart-empty">Your cart is empty.</div></div>';
      return;
    }
    const lines = entries.map(item => {
      const lineTotal = item.qty * item.price;
      return `\n        <div class="cart-line" data-id="${item.id}">\n          <div style="flex:1;min-width:0">\n            <div style="font-weight:600">${item.name}</div>\n            <div class="muted" style="font-size:12px;color:#b9bec7">$${toMoney(item.price)} × ${item.qty}</div>\n          </div>\n          <div class="qty">\n            <button class="dec">-</button>\n            <input class="qty-input" type="number" min="0" max="99" value="${item.qty}">\n            <button class="inc">+</button>\n          </div>\n          <div class="line-total">$${toMoney(lineTotal)}</div>\n        </div>`;
    }).join('');
    const subtotal = entries.reduce((s, it) => s + it.qty * it.price, 0);
    container.innerHTML = `\n      <div class="cart">\n        <h3>Your Cart</h3>\n        ${lines}\n        <div class="cart-summary">\n          <div style="display:flex;justify-content:space-between;margin-top:4px">\n            <div>Subtotal</div><div style="font-weight:700">$${toMoney(subtotal)}</div>\n          </div>\n          <div class="checkout">\n            <button class="btn-clear" id="clearCart">Clear</button>\n            <button class="btn-wa" id="checkoutWa">Checkout</button>\n          </div>\n        </div>\n      </div>`;

    // Bind qty controls
    $$('.cart-line').forEach(line => {
      const id = line.getAttribute('data-id');
      line.querySelector('.dec')?.addEventListener('click', () => {
        const cart = loadCart();
        const q = (cart[id]?.qty||0) - 1;
        setQty(id, q);
      });
      line.querySelector('.inc')?.addEventListener('click', () => {
        const cart = loadCart();
        const q = (cart[id]?.qty||0) + 1;
        setQty(id, q);
      });
      line.querySelector('.qty-input')?.addEventListener('change', (e) => {
        const v = parseInt(e.target.value || '0', 10);
        setQty(id, isNaN(v) ? 0 : v);
      });
    });

    $('#clearCart')?.addEventListener('click', clearCart);
  }

  function buildOrderMessage(customer = {}){
    const cart = loadCart();
    const lines = Object.values(cart);
    if(lines.length === 0) return '';
    const parts = [
      'Hello Croissanji Team! 👋',
      'I would like to place a delivery order.',
      '',
      '🧾 *Order Details*',
      '------------------------------'
    ];
    let subtotal = 0;
    lines.forEach((it, idx) => {
      const lineTotal = it.qty * it.price;
      subtotal += lineTotal;
      parts.push(`${idx + 1}. *${it.name}*`);
      parts.push(`   Qty: ${it.qty} × $${toMoney(it.price)} = $${toMoney(lineTotal)}`);
    });
    parts.push(
      '------------------------------',
      `💵 *Subtotal:* $${toMoney(subtotal)}`,
      '',
      `👤 *Name:* ${customer.name || '-'}`,
      `📍 *Delivery Address:* ${customer.address || '-'}`,
      `📞 *Phone Number:* ${customer.phone || '-'}`,
      `📝 *Notes:* ${customer.notes || '-'}`,
      '',
      'Thank you! 🙏'
    );
    return parts.join('\n');
  }

  function goToWhatsApp(customer){
    const msg = buildOrderMessage(customer);
    if(!msg){ alert('Your cart is empty.'); return; }
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${restaurantPhone}?text=${encoded}`;
    window.location.href = url;
  }

  function setupCheckoutModal(){
    const modal = $('#checkoutModal');
    if(!modal) return;
    const backBtn = $('#checkoutBack');
    const submitBtn = $('#checkoutSubmit');
    const nameInput = $('#customerName');
    const addressInput = $('#customerAddress');
    const phoneInput = $('#customerPhone');
    const notesInput = $('#customerNotes');

    const closeModal = () => modal.classList.add('hidden');
    const openModal = () => modal.classList.remove('hidden');

    backBtn?.addEventListener('click', closeModal);
    submitBtn?.addEventListener('click', () => {
      const customer = {
        name: (nameInput?.value || '').trim(),
        address: (addressInput?.value || '').trim(),
        phone: (phoneInput?.value || '').trim(),
        notes: (notesInput?.value || '').trim()
      };
      if(!customer.name || !customer.address || !customer.phone){
        alert('Please fill name, address, and phone number.');
        return;
      }
      closeModal();
      goToWhatsApp(customer);
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if(target && target.id === 'checkoutWa'){
        e.preventDefault();
        openModal();
      }
    });
  }

  function enhanceMenuCards(){
    if(!isDeliveryMode()) return;
    $$('.menu-item').forEach(card => {
      if(card.querySelector('.add-row')) return;
      const price = parsePrice(card.querySelector('.price')?.textContent || '0');
      if(!price) return; // skip non-sale items
      const row = document.createElement('div');
      row.className = 'add-row';
      row.style.marginTop = '6px';
      row.innerHTML = `\n        <div style="display:flex;gap:8px;align-items:center">\n          <div class="qty">\n            <button class="minus">-</button>\n            <input class="qty-input" type="number" min="1" max="99" value="1">\n            <button class="plus">+</button>\n          </div>\n          <button class="add-btn" style="background:#22c55e;border:none;border-radius:10px;color:#111;padding:8px 10px;font-weight:700;cursor:pointer">Add to cart</button>\n        </div>`;
      card.querySelector('.item-info')?.appendChild(row);
      const qtyInput = row.querySelector('.qty-input');
      row.querySelector('.minus')?.addEventListener('click',()=>{ qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value||'1',10)||1)-1)); });
      row.querySelector('.plus')?.addEventListener('click',()=>{ qtyInput.value = String(Math.min(99, (parseInt(qtyInput.value||'1',10)||1)+1)); });
      row.querySelector('.add-btn')?.addEventListener('click',()=>{
        const item = getItemFromCard(card);
        const qty = Math.max(1, parseInt(qtyInput.value||'1', 10)||1);
        addToCart(item, qty);
      });
    });
  }

  function applyPriceIncrease(){
    $$('.price').forEach(priceEl => {
      if(priceEl.dataset.updatedPrice === '1') return;
      const base = parsePrice(priceEl.textContent || '0');
      if(!base) return;
      const updated = Math.round(base * PRICE_MULTIPLIER * 100) / 100;
      priceEl.textContent = formatPriceValue(updated);
      priceEl.dataset.updatedPrice = '1';
      priceEl.dataset.basePrice = String(base);
    });
  }

  function setupOrderTypeModal(){
    const modal = $('#orderTypeModal');
    if(!modal) return;
    localStorage.removeItem(ORDER_TYPE_KEY);
    const deliveryBtn = $('#selectDelivery');
    const tableBtn = $('#selectTable');

    const applyChoice = (choice) => {
      localStorage.setItem(ORDER_TYPE_KEY, choice);
      if(choice !== 'delivery') clearCart();
      modal.classList.add('hidden');
      applyPriceIncrease();
      enhanceMenuCards();
      renderCart();
    };

    deliveryBtn?.addEventListener('click', () => applyChoice('delivery'));
    tableBtn?.addEventListener('click', () => applyChoice('table'));
    modal.classList.remove('hidden');
  }

  function filterByHash(){
    const hash = (location.hash||'').replace('#','');
    const sections = $$('#breakfast, #dinner_chicken, #dinner_beef, #burgers, #meals, #healthy_meals, #appetizers, #side_orders, #drinks, #desserts, #mini');
    if(!hash){
      sections.forEach(s => s.style.display = '');
      return;
    }
    sections.forEach(s => {
      s.style.display = (s.id === hash) ? '' : 'none';
    });
    // Scroll to selected section header for better UX
    const target = document.getElementById(hash);
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  }

  function setupNavButtons(){
    // Rewire nav buttons to change hash instead of manual scroll so it works cross page
    $$('.category-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-target');
        if(!id) return;
        location.hash = id;
      });
    });
  }

  function init(){
    setupOrderTypeModal();
    setupCheckoutModal();
    applyPriceIncrease();
    enhanceMenuCards();
    renderCart();
    filterByHash();
    setupNavButtons();
    window.addEventListener('hashchange', filterByHash);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();


