// ==================== CONFIG ====================
const ADMIN_PASSWORD = 'admin121970'; // ⚠️ cambia esto
const STORAGE_KEY = 'catalogo_data';

// ==================== ESTADO ====================
let data = {
  tienda: {
    nombre: 'Ventas CAV',
    descripcion: 'Productos seleccionados con amor para ti',
    whatsapp: '15404780618',
    moneda: 'USD',
    simbolo: '$',
    email: '',
    instagram: '',
    logo: '🛍️',
  },
  productos: [],
};

// Imágenes pendientes: { [productoId]: { base64, filename } }
let imagenesPendientes = {};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ==================== LOCK ====================
function checkLock() {
  if (sessionStorage.getItem('admin_ok') === '1') {
    desbloquear();
  }
}

function intentarDesbloquear() {
  const pass = $('#pass').value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('admin_ok', '1');
    desbloquear();
  } else {
    $('#lock-error').classList.remove('hidden');
    $('#pass').value = '';
  }
}

function desbloquear() {
  $('#lock').classList.add('hidden');
  $('#app').classList.remove('hidden');
  cargarDatos();
}

// ==================== PERSISTENCIA ====================
function guardar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function cargarDatos() {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado) {
    try { data = JSON.parse(guardado); } catch(e) {}
  }
  // Si no hay datos locales, cargar products.json inicial
  if (!data.productos || data.productos.length === 0) {
    fetch('products.json').then(r => r.json()).then(json => {
      data = json;
      guardar();
      renderTodo();
    }).catch(() => renderTodo());
  } else {
    renderTodo();
  }
}

// ==================== RENDER ====================
function renderTodo() {
  renderSettings();
  renderCategorias();
  renderListaProductos();
  renderCount();
}

function renderSettings() {
  const t = data.tienda;
  $('#s-nombre').value = t.nombre || '';
  $('#s-logo').value = t.logo || '';
  $('#s-descripcion').value = t.descripcion || '';
  $('#s-whatsapp').value = t.whatsapp || '';
  $('#s-simbolo').value = t.simbolo || '$';
  $('#s-moneda').value = t.moneda || 'USD';
  $('#s-email').value = t.email || '';
  $('#s-instagram').value = t.instagram || '';
}

function renderCategorias() {
  const cats = [...new Set(data.productos.map(p => p.categoria).filter(Boolean))];
  $('#lista-categorias').innerHTML = cats.map(c => `<option value="${c}">`).join('');
}

function renderCount() {
  $('#count-productos').textContent = `(${data.productos.length})`;
}

function renderListaProductos() {
  const cont = $('#lista-productos');
  if (data.productos.length === 0) {
    cont.innerHTML = `<p class="text-sm text-slate-500 col-span-full text-center py-8">No hay productos aún. Añade el primero arriba ↑</p>`;
    return;
  }

  cont.innerHTML = data.productos.map(p => `
    <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-3 items-center bg-slate-50 dark:bg-slate-800/40">
      <img src="${p.imagen}" alt="" class="w-14 h-14 rounded-lg object-cover shrink-0" onerror="this.src='https://placehold.co/100x100/eee/999?text=?'">
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-sm truncate">${p.nombre}</h4>
        <p class="text-xs text-slate-500">${p.categoria || '—'} · ${data.tienda.simbolo || '$'}${Number(p.precio).toFixed(2)}</p>
      </div>
      <div class="flex flex-col gap-1">
        <button data-edit="${p.id}" class="text-xs px-2 py-1 rounded bg-white dark:bg-slate-700 hover:bg-violet-500 hover:text-white transition-colors">Editar</button>
        <button data-delete="${p.id}" class="text-xs px-2 py-1 rounded bg-white dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors">Borrar</button>
      </div>
    </div>
  `).join('');

  cont.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editarProducto(b.dataset.edit)));
  cont.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => borrarProducto(b.dataset.delete)));
}

// ==================== FORM PRODUCTO ====================
function limpiarFormulario() {
  $('#form-producto').reset();
  $('#p-id').value = '';
  $('#p-stock').checked = true;
  $('#preview-wrap').classList.add('hidden');
  $('#file-info').textContent = '';
  $('#form-title').textContent = '➕ Añadir producto';
  $('#btn-submit-text').textContent = 'Añadir producto';
  $('#cancel-edit').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function editarProducto(id) {
  const p = data.productos.find(x => x.id === id);
  if (!p) return;
  $('#p-id').value = p.id;
  $('#p-nombre').value = p.nombre || '';
  $('#p-precio').value = p.precio ?? '';
  $('#p-categoria').value = p.categoria || '';
  $('#p-descripcion').value = p.descripcion || '';
  $('#p-etiquetas').value = (p.etiquetas || []).join(', ');
  $('#p-stock').checked = p.stock !== false;
  $('#p-imagen-url').value = p.imagen?.startsWith('data:') ? '' : (p.imagen || '');
  $('#p-stripe').value = p.stripeLink || '';
  $('#p-mp').value = p.mercadopagoLink || '';

  // Preview imagen
  if (p.imagen) {
    $('#preview-img').src = p.imagen;
    $('#preview-wrap').classList.remove('hidden');
  } else {
    $('#preview-wrap').classList.add('hidden');
  }

  $('#form-title').textContent = '✏️ Editando: ' + p.nombre;
  $('#btn-submit-text').textContent = 'Guardar cambios';
  $('#cancel-edit').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function borrarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  data.productos = data.productos.filter(p => p.id !== id);
  delete imagenesPendientes[id];
  guardar();
  renderTodo();
  showToast('Producto eliminado');
}

// ==================== SUBMIT FORM ====================
function manejarSubmit(e) {
  e.preventDefault();

  const id = $('#p-id').value || 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nombre = $('#p-nombre').value.trim();
  const precio = parseFloat($('#p-precio').value);
  const categoria = $('#p-categoria').value.trim();
  const descripcion = $('#p-descripcion').value.trim();
  const etiquetas = $('#p-etiquetas').value.split(',').map(s => s.trim()).filter(Boolean);
  const stock = $('#p-stock').checked;
  const stripeLink = $('#p-stripe').value.trim();
  const mercadopagoLink = $('#p-mp').value.trim();

  // Imagen
  let imagen = $('#p-imagen-url').value.trim();
  if (imagenesPendientes[id]) {
    // Se subió archivo nuevo
    imagen = `images/${imagenesPendientes[id].filename}`;
  }
  if (!imagen) imagen = 'https://placehold.co/600x600/eee/999?text=Sin+imagen';

  const producto = {
    id, nombre, precio, categoria, descripcion, imagen,
    etiquetas, stock, stripeLink, mercadopagoLink
  };

  const idx = data.productos.findIndex(p => p.id === id);
  if (idx >= 0) data.productos[idx] = producto;
  else data.productos.push(producto);

  guardar();
  renderTodo();
  limpiarFormulario();
  showToast(idx >= 0 ? 'Producto actualizado ✓' : 'Producto añadido ✓');
}

// ==================== SUBIR IMAGEN ====================
function manejarArchivo(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validar tamaño (max 2MB recomendado)
  if (file.size > 3 * 1024 * 1024) {
    showToast('Imagen muy grande (máx 3MB)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target.result;
    const id = $('#p-id').value || 'tmp_' + Date.now();
    // Generar nombre seguro
    const ext = file.name.split('.').pop().toLowerCase();
    const safeName = (($('#p-nombre').value || 'producto')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)) + '-' + Date.now().toString(36) + '.' + ext;

    imagenesPendientes[id] = { base64, filename: safeName, dataUrl: base64 };

    // Preview
    $('#preview-img').src = base64;
    $('#preview-wrap').classList.remove('hidden');
    $('#file-info').textContent = `📎 ${safeName} (${(file.size / 1024).toFixed(0)} KB)`;
    showToast('Imagen cargada ✓');
  };
  reader.readAsDataURL(file);
}

// ==================== EXPORT ZIP ====================
async function exportarZIP() {
  if (typeof JSZip === 'undefined') {
    showToast('JSZip no cargó, revisa tu conexión', 'error');
    return;
  }

  const zip = new JSZip();
  const imagesFolder = zip.folder('images');

  // Copia de data (sin base64)
  const exportData = JSON.parse(JSON.stringify(data));

  // Guardar imágenes pendientes y sustituir base64 en data si hay
  for (const [id, img] of Object.entries(imagenesPendientes)) {
    const base64Data = img.base64.split(',')[1];
    imagesFolder.file(img.filename, base64Data, { base64: true });

    // Actualizar producto para referenciar el archivo
    const p = exportData.productos.find(x => x.id === id);
    if (p) p.imagen = `images/${img.filename}`;
  }

  zip.file('products.json', JSON.stringify(exportData, null, 2));

  // README
  zip.file('LEEME.txt', `CÓMO SUBIR ESTE CATÁLOGO A GITHUB PAGES
=============================================

1. Descomprime este ZIP.
2. Crea un repositorio público nuevo en GitHub.
3. Sube TODOS los archivos (products.json + carpeta images/).
4. Ve a Settings → Pages → Source: main / root.
5. Tu sitio estará en: https://tu-usuario.github.io/tu-repo/

Para añadir más productos: usa de nuevo el panel admin (admin.html) 
y vuelve a subir products.json + imágenes.

Generado el ${new Date().toLocaleString('es')}
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalogo.zip';
  a.click();
  URL.revokeObjectURL(url);
  showToast('ZIP descargado ✓');
}

// ==================== IMPORT JSON ====================
function importarJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const json = JSON.parse(ev.target.result);
      if (!json.productos || !Array.isArray(json.productos)) throw new Error('Formato inválido');
      data = json;
      guardar();
      renderTodo();
      showToast(`Importados ${json.productos.length} productos ✓`);
    } catch (err) {
      showToast('JSON inválido', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ==================== TOAST ====================
function showToast(msg, tipo = 'success') {
  const cont = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${tipo === 'error' ? 'bg-red-500' : 'bg-slate-900 dark:bg-slate-700'}`;
  el.textContent = msg;
  cont.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// ==================== EVENTOS ====================
function bindEventos() {
  $('#btn-unlock').addEventListener('click', intentarDesbloquear);
  $('#pass').addEventListener('keydown', e => { if (e.key === 'Enter') intentarDesbloquear(); });

  $('#logout').addEventListener('click', () => {
    sessionStorage.removeItem('admin_ok');
    location.reload();
  });

  $('#form-producto').addEventListener('submit', manejarSubmit);
  $('#p-imagen-file').addEventListener('change', manejarArchivo);
  $('#p-imagen-url').addEventListener('input', (e) => {
    if (e.target.value) {
      $('#preview-img').src = e.target.value;
      $('#preview-wrap').classList.remove('hidden');
      $('#file-info').textContent = '';
    }
  });

  $('#cancel-edit').addEventListener('click', limpiarFormulario);
  $('#btn-export').addEventListener('click', exportarZIP);
  $('#import-json').addEventListener('change', importarJSON);

  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('⚠️ Esto borrará TODOS los productos y configuración. ¿Continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    imagenesPendientes = {};
    location.reload();
  });

  $('#save-settings').addEventListener('click', () => {
    data.tienda = {
      nombre: $('#s-nombre').value.trim(),
      logo: $('#s-logo').value.trim(),
      descripcion: $('#s-descripcion').value.trim(),
      whatsapp: $('#s-whatsapp').value.trim(),
      simbolo: $('#s-simbolo').value.trim() || '$',
      moneda: $('#s-moneda').value.trim() || 'USD',
      email: $('#s-email').value.trim(),
      instagram: $('#s-instagram').value.trim(),
    };
    guardar();
    renderListaProductos();
    showToast('Configuración guardada ✓');
  });

  // Toggle settings
  $('#toggle-settings').addEventListener('click', () => {
    const panel = $('#settings-panel');
    const icon = $('#toggle-settings svg');
    const hidden = panel.style.display === 'none';
    panel.style.display = hidden ? '' : 'none';
    icon.style.transform = hidden ? 'rotate(0)' : 'rotate(-90deg)';
  });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  bindEventos();
  checkLock();
});
