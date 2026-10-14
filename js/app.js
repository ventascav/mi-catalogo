// ==================== ESTADO ====================
const state = {
  tienda: {},
  productos: [],
  filtrados: [],
  categoria: 'todas',
  busqueda: '',
  orden: 'recientes',
  carrito: JSON.parse(localStorage.getItem('carrito') || '[]'),
  visibles: 0,
  perPage: 8,
  cargando: false,
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const precio = (n) => `${state.tienda.simbolo || '$'}${Number(n).toFixed(2)}`;

// ==================== TEMA ====================
function initTheme() {
  const guardado = localStorage.getItem('theme');
  const oscuro = guardado ? guardado === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', oscuro);
}

function toggleTheme() {
  const oscuro = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', oscuro ? 'dark' : 'light');
}

// ==================== CARGA DE DATOS ====================
async function cargarDatos() {
  try {
    const res = await fetch('products.json?t=' + Date.now());
    const data = await res.json();
    state.tienda = data.tienda || {};
    state.productos = data.productos || [];
  } catch (e) {
    console.error('Error cargando products.json', e);
    showToast('Error al cargar productos', 'error');
  }
}

// ==================== RENDER TIENDA ====================
function renderTienda() {
  const t = state.tienda;
  if (t.nombre) {
    document.title = `${t.nombre} — Catálogo`;
    $('#nombre-tienda').textContent = t.nombre;
    $('#nombre-footer').textContent = t.nombre;
  }
  if (t.logo) {
    $('#logo').textContent = t.logo;
    $('#logo-footer').textContent = t.logo;
  }
  if (t.descripcion) $('#descripcion-tienda').textContent = t.descripcion;
  $('#anio').textContent = new Date().getFullYear();

  // Footer links
  const links = $('#footer-links');
  links.innerHTML = '';
  if (t.whatsapp) links.innerHTML += `<a href="https://wa.me/${t.whatsapp}" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="WhatsApp">
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  </a>`;
  if (t.instagram) links.innerHTML += `<a href="${t.instagram}" target="_blank" rel="noopener" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Instagram">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  </a>`;
  if (t.email) links.innerHTML += `<a href="mailto:${t.email}" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Email">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
  </a>`;
}

// ==================== CATEGORÍAS ====================
function renderCategorias() {
  const categorias = ['todas', ...new Set(state.productos.map(p => p.categoria).filter(Boolean))];
  const cont = $('#categorias');
  cont.innerHTML = categorias.map(cat => `
    <button data-cat="${cat}" class="chip ${state.categoria === cat ? 'active' : ''} shrink-0 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-violet-500 transition-all">
      ${cat === 'todas' ? 'Todas' : cat}
    </button>
  `).join('');

  cont.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.categoria = btn.dataset.cat;
      cont.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === state.categoria));
      aplicarFiltros();
    });
  });
}

// ==================== FILTROS Y ORDEN ====================
function aplicarFiltros(resetPage = true) {
  let lista = [...state.productos];

  if (state.categoria !== 'todas') lista = lista.filter(p => p.categoria === state.categoria);

  if (state.busqueda) {
    const q = state.busqueda.toLowerCase();
    lista = lista.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      (p.etiquetas || []).some(e => e.toLowerCase().includes(q))
    );
  }

  switch (state.orden) {
    case 'precio-asc': lista.sort((a,b) => a.precio - b.precio); break;
    case 'precio-desc': lista.sort((a,b) => b.precio - a.precio); break;
    case 'nombre': lista.sort((a,b) => a.nombre.localeCompare(b.nombre)); break;
  }

  state.filtrados = lista;
  if (resetPage) {
    state.visibles = 0;
    $('#grid').innerHTML = '';
  }
  renderizarLote();
  actualizarContador();
}

function actualizarContador() {
  const total = state.filtrados.length;
  const mostrados = Math.min(state.visibles, total);
  $('#contador').textContent = total === 0
    ? 'Sin productos'
    : `Mostrando ${mostrados} de ${total} producto${total !== 1 ? 's' : ''}`;
  $('#sin-resultados').classList.toggle('hidden', total !== 0);
}

// ==================== GRID ====================
function renderizarLote() {
  if (state.cargando) return;
  const fin = Math.min(state.visibles + state.perPage, state.filtrados.length);
  if (state.visibles >= fin) return;

  const lote = state.filtrados.slice(state.visibles, fin);
  const grid = $('#grid');

  lote.forEach((p, i) => {
    const el = crearCardProducto(p);
    el.style.animationDelay = `${i * 40}ms`;
    el.classList.add('fade-in-up');
    grid.appendChild(el);
  });

  state.visibles = fin;
  actualizarContador();
}

function crearCardProducto(p) {
  const el = document.createElement('article');
  el.className = 'card group bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer flex flex-col';
  el.dataset.id = p.id;

  const etiquetas = (p.etiquetas || []).map(t => {
    const colores = {
      nuevo: 'bg-emerald-500',
      oferta: 'bg-rose-500',
      hot: 'bg-orange-500',
    };
    return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${colores[t] || 'bg-slate-700'}">${t}</span>`;
  }).join('');

  el.innerHTML = `
    <div class="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
      <img loading="lazy" src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover">
      ${etiquetas ? `<div class="absolute top-2 left-2 flex gap-1">${etiquetas}</div>` : ''}
      ${!p.stock ? `<div class="absolute inset-0 bg-black/60 flex items-center justify-center"><span class="text-white font-bold text-sm">Agotado</span></div>` : ''}
    </div>
    <div class="p-3 sm:p-4 flex flex-col flex-1">
      <p class="text-[11px] uppercase tracking-wider text-violet-500 font-semibold mb-1">${p.categoria || ''}</p>
      <h3 class="font-semibold text-sm sm:text-base leading-tight line-clamp-2 mb-2 flex-1">${p.nombre}</h3>
      <div class="flex items-center justify-between gap-2 mt-auto">
        <span class="font-bold text-base sm:text-lg">${precio(p.precio)}</span>
        <button data-add class="p-2 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md hover:scale-110 active:scale-95 transition-transform" aria-label="Añadir al carrito">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-add]')) {
      e.stopPropagation();
      agregarCarrito(p.id);
      return;
    }
    abrirModal(p);
  });

  return el;
}

// ==================== MODAL ====================
function abrirModal(p) {
  const modal = $('#modal');
  const content = $('#modal-content');
  const etiquetas = (p.etiquetas || []).map(t => `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase bg-violet-600">${t}</span>`).join('');

  const tieneStripe = p.stripeLink && p.stripeLink.trim();
  const tieneMP = p.mercadopagoLink && p.mercadopagoLink.trim();

  content.innerHTML = `
    <button data-close-modal class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:bg-white dark:hover:bg-slate-700 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <div class="grid md:grid-cols-2">
      <div class="aspect-square bg-slate-100 dark:bg-slate-800">
        <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover">
      </div>
      <div class="p-6 flex flex-col">
        <p class="text-xs uppercase tracking-wider text-violet-500 font-semibold mb-2">${p.categoria || ''}</p>
        <h2 class="text-2xl font-bold mb-3 leading-tight">${p.nombre}</h2>
        ${etiquetas ? `<div class="flex gap-1.5 mb-3">${etiquetas}</div>` : ''}
        <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5 flex-1">${p.descripcion || ''}</p>
        <div class="flex items-baseline gap-2 mb-5">
          <span class="text-3xl font-extrabold">${precio(p.precio)}</span>
          <span class="text-xs text-slate-400">${state.tienda.moneda || ''}</span>
        </div>
        <div class="space-y-2">
          <button data-add-modal class="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Añadir al carrito
          </button>
          ${tieneStripe ? `<a href="${p.stripeLink}" target="_blank" rel="noopener" class="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>
            Pagar con Stripe
          </a>` : ''}
          ${tieneMP ? `<a href="${p.mercadopagoLink}" target="_blank" rel="noopener" class="w-full py-3 rounded-xl bg-[#009ee3] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            Pagar con MercadoPago
          </a>` : ''}
        </div>
      </div>
    </div>
  `;

  content.querySelector('[data-add-modal]').addEventListener('click', () => {
    agregarCarrito(p.id);
    cerrarModal();
  });
  content.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', cerrarModal));

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  $('#modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ==================== CARRITO ====================
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(state.carrito));
}

function agregarCarrito(id, cantidad = 1) {
  const item = state.carrito.find(i => i.id === id);
  if (item) item.cantidad += cantidad;
  else state.carrito.push({ id, cantidad });
  guardarCarrito();
  renderCarrito();
  showToast('Añadido al carrito ✓');
}

function quitarCarrito(id) {
  state.carrito = state.carrito.filter(i => i.id !== id);
  guardarCarrito();
  renderCarrito();
}

function cambiarCantidad(id, delta) {
  const item = state.carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) quitarCarrito(id);
  else { guardarCarrito(); renderCarrito(); }
}

function renderCarrito() {
  const cont = $('#cart-items');
  const badge = $('#badge-carrito');
  const totalItems = state.carrito.reduce((s, i) => s + i.cantidad, 0);

  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if (state.carrito.length === 0) {
    cont.innerHTML = `<div class="text-center py-16">
      <div class="text-5xl mb-3">🛒</div>
      <p class="text-slate-500 text-sm">Tu carrito está vacío</p>
    </div>`;
    $('#cart-total').textContent = precio(0);
    return;
  }

  let total = 0;
  cont.innerHTML = state.carrito.map(item => {
    const p = state.productos.find(x => x.id === item.id);
    if (!p) return '';
    total += p.precio * item.cantidad;
    return `
      <div class="flex gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <img src="${p.imagen}" alt="${p.nombre}" class="w-16 h-16 rounded-lg object-cover shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm truncate">${p.nombre}</h4>
          <p class="text-xs text-slate-500 mt-0.5">${precio(p.precio)}</p>
          <div class="flex items-center gap-2 mt-2">
            <button data-qty="-1" data-id="${p.id}" class="w-6 h-6 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center text-sm font-bold hover:bg-violet-500 hover:text-white transition-colors">−</button>
            <span class="text-sm font-semibold min-w-[20px] text-center">${item.cantidad}</span>
            <button data-qty="1" data-id="${p.id}" class="w-6 h-6 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center text-sm font-bold hover:bg-violet-500 hover:text-white transition-colors">+</button>
            <button data-remove="${p.id}" class="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors">Eliminar</button>
          </div>
        </div>
        <span class="font-semibold text-sm shrink-0">${precio(p.precio * item.cantidad)}</span>
      </div>
    `;
  }).join('');

  $('#cart-total').textContent = precio(total);

  cont.querySelectorAll('[data-qty]').forEach(b => b.addEventListener('click', () => cambiarCantidad(b.dataset.id, Number(b.dataset.qty))));
  cont.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => quitarCarrito(b.dataset.remove)));
}

function abrirCarrito() {
  $('#cart-overlay').classList.remove('hidden');
  $('#cart-drawer').classList.remove('translate-x-full');
  document.body.style.overflow = 'hidden';
}
function cerrarCarrito() {
  $('#cart-overlay').classList.add('hidden');
  $('#cart-drawer').classList.add('translate-x-full');
  document.body.style.overflow = '';
}

// ==================== CHECKOUT WHATSAPP ====================
function pedirPorWhatsApp() {
  if (state.carrito.length === 0) { showToast('El carrito está vacío', 'error'); return; }
  const num = state.tienda.whatsapp;
  if (!num) { showToast('WhatsApp no configurado', 'error'); return; }

  let total = 0;
  let msg = `¡Hola *${state.tienda.nombre || 'tienda'}*! 👋\n\nQuiero hacer el siguiente pedido:\n\n`;

  state.carrito.forEach((item, i) => {
    const p = state.productos.find(x => x.id === item.id);
    if (!p) return;
    const sub = p.precio * item.cantidad;
    total += sub;
    msg += `${i+1}. *${p.nombre}*\n   Cantidad: ${item.cantidad}\n   Precio: ${precio(p.precio)} c/u\n   Subtotal: ${precio(sub)}\n\n`;
  });

  msg += `*TOTAL: ${precio(total)}*\n\n¿Está disponible? 🛒`;

  const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==================== TOAST ====================
function showToast(mensaje, tipo = 'success') {
  const cont = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${tipo === 'error' ? 'bg-red-500' : 'bg-slate-900 dark:bg-slate-700'}`;
  el.textContent = mensaje;
  cont.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

// ==================== INFINITE SCROLL ====================
function initInfiniteScroll() {
  const sentinel = $('#sentinel');
  const loader = $('#loader');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && state.visibles < state.filtrados.length && !state.cargando) {
        state.cargando = true;
        loader.classList.remove('hidden');
        setTimeout(() => {
          renderizarLote();
          loader.classList.add('hidden');
          state.cargando = false;
        }, 350);
      }
    });
  }, { rootMargin: '200px' });

  obs.observe(sentinel);
}

// ==================== SCROLL EFFECTS ====================
function initScrollEffects() {
  const header = $('#header');
  const btnTop = $('#scroll-top');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    const visible = window.scrollY > 400;
    btnTop.style.opacity = visible ? '1' : '0';
    btnTop.style.pointerEvents = visible ? 'auto' : 'none';
  });

  btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==================== EVENTOS ====================
function bindEventos() {
  $('#theme-toggle').addEventListener('click', toggleTheme);
  $('#btn-carrito').addEventListener('click', abrirCarrito);
  $('#cerrar-carrito').addEventListener('click', cerrarCarrito);
  $('#cart-overlay').addEventListener('click', cerrarCarrito);
  $('#btn-whatsapp').addEventListener('click', pedirPorWhatsApp);
  $('#vaciar-carrito').addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')) {
      state.carrito = [];
      guardarCarrito();
      renderCarrito();
    }
  });

  const buscar = (v) => {
    state.busqueda = v.trim();
    aplicarFiltros();
  };
  $('#buscador').addEventListener('input', (e) => { buscar(e.target.value); $('#buscador-mobile').value = e.target.value; });
  $('#buscador-mobile').addEventListener('input', (e) => { buscar(e.target.value); $('#buscador').value = e.target.value; });
  $('#orden').addEventListener('change', (e) => { state.orden = e.target.value; aplicarFiltros(); });

  // Escape cierra modal/carrito
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModal();
      cerrarCarrito();
    }
  });
}

// ==================== INIT ====================
async function init() {
  initTheme();
  await cargarDatos();
  renderTienda();
  renderCategorias();
  aplicarFiltros();
  renderCarrito();
  bindEventos();
  initInfiniteScroll();
  initScrollEffects();
}

document.addEventListener('DOMContentLoaded', init);