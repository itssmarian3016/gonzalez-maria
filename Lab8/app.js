(() => {
  const App = (() => {
    // Elements
    const els = {
      form: document.getElementById('student-form'),
      nombre: document.getElementById('nombre'),
      apellido: document.getElementById('apellido'),
      email: document.getElementById('email'),
      edad: document.getElementById('edad'),
      carrera: document.getElementById('carrera'),
      studentsBody: document.getElementById('students-body'),
      countBadge: document.getElementById('student-count'),
      deleteAllBtn: document.getElementById('delete-all'),
      clearBtn: document.getElementById('clear-btn'),
      searchInput: document.getElementById('search'),
      addBtn: document.getElementById('add-btn'),
      tableInfo: document.getElementById('table-info')
    };

    // Templates
    const tpl = {
      noResults: () => {
        const tr = document.createElement('tr');
        tr.className = 'no-results';
        tr.innerHTML = '<td colspan="7" class="no-results">No hay resultados.</td>';
        return tr;
      },
      row: (index, s) => {
        return `
          <tr>
            <td>${index}</td>
            <td>${escapeHtml(s.nombre)}</td>
            <td>${escapeHtml(s.apellido)}</td>
            <td>${escapeHtml(s.email)}</td>
            <td>${s.edad !== '' ? String(s.edad) : '-'}</td>
            <td>${s.carrera ? escapeHtml(s.carrera) : '-'}</td>
            <td class="actions">
              <button class="btn" data-action="edit" data-id="${s.id}" title="Editar">Editar</button>
              <button class="btn danger" data-action="delete" data-id="${s.id}">Eliminar</button>
            </td>
          </tr>
        `;
      }
    };

    // Utils / private methods
    const utils = {
      STORAGE_KEY: 'registro_estudiantes_v1',
      save(students) {
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
        } catch (err) {
          console.warn('No se pudo guardar en storage', err);
        }
      },
      load() {
        try {
          const raw = localStorage.getItem(this.STORAGE_KEY);
          if (!raw) return [];
          return JSON.parse(raw);
        } catch (err) {
          console.warn('Error leyendo storage', err);
          return [];
        }
      },
      cryptoRandomId() {
        if (window.crypto && crypto.getRandomValues) {
          const array = new Uint32Array(4);
          crypto.getRandomValues(array);
          return Array.from(array).map(n => n.toString(36)).join('');
        } else {
          return String(Date.now()) + Math.random().toString(36).slice(2,9);
        }
      },
      escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }
    };

    // make escapeHtml available to tpl
    const escapeHtml = utils.escapeHtml.bind(utils);

    // State (private)
    let students = [];
    let editId = null;

    // Handlers
    const handlers = {
      onFormSubmit(e) {
        e.preventDefault();
        if (!handlers.validateForm()) return;

        const studentData = {
          nombre: els.nombre.value.trim(),
          apellido: els.apellido.value.trim(),
          email: els.email.value.trim(),
          edad: els.edad.value.trim() ? Number(els.edad.value) : '',
          carrera: els.carrera.value || ''
        };

        if (editId) {
          const idx = students.findIndex(s => s.id === editId);
          if (idx !== -1) {
            students[idx] = { ...students[idx], ...studentData };
            editId = null;
            els.addBtn.textContent = 'Agregar estudiante';
          }
        } else {
          students.push({ id: utils.cryptoRandomId(), ...studentData });
        }

        utils.save(students);
        handlers.renderStudents();
        handlers.resetForm();
        els.nombre.focus();
      },

      validateForm() {
        // reset custom validity
        els.email.setCustomValidity('');
        els.edad.setCustomValidity('');
        els.nombre.setCustomValidity('');
        els.apellido.setCustomValidity('');

        if (!els.nombre.value.trim()) {
          els.nombre.setCustomValidity('El nombre es obligatorio.');
        }
        if (!els.apellido.value.trim()) {
          els.apellido.setCustomValidity('El apellido es obligatorio.');
        }
        if (!els.email.value.trim()) {
          els.email.setCustomValidity('El correo es obligatorio.');
        } else if (!els.email.checkValidity()) {
          els.email.setCustomValidity('Introduce un correo válido.');
        }
        if (els.edad.value.trim()) {
          const val = Number(els.edad.value);
          if (Number.isNaN(val) || val < 18 || val > 100) {
            els.edad.setCustomValidity('La edad debe estar entre 18 y 100.');
          }
        }

        return els.form.reportValidity();
      },

      onClearClick() {
        handlers.resetForm();
        els.nombre.focus();
      },

      onDeleteAllClick() {
        if (!students.length) {
          alert('No hay estudiantes para borrar.');
          return;
        }
        if (!confirm('¿Eliminar todos los estudiantes? Esta acción no se puede deshacer.')) return;
        students = [];
        utils.save(students);
        handlers.renderStudents();
      },

      onTableClick(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'delete') {
          if (!confirm('¿Eliminar este estudiante?')) return;
          students = students.filter(s => s.id !== id);
          utils.save(students);
          handlers.renderStudents();
        } else if (action === 'edit') {
          handlers.startEdit(id);
        }
      },

      startEdit(id) {
        const s = students.find(x => x.id === id);
        if (!s) return;
        editId = id;
        els.nombre.value = s.nombre;
        els.apellido.value = s.apellido;
        els.email.value = s.email;
        els.edad.value = s.edad !== '' ? s.edad : '';
        els.carrera.value = s.carrera || '';
        els.addBtn.textContent = 'Guardar cambios';
        els.nombre.focus();
      },

      resetForm() {
        els.form.reset();
        editId = null;
        els.addBtn.textContent = 'Agregar estudiante';
        els.nombre.setCustomValidity('');
        els.apellido.setCustomValidity('');
        els.email.setCustomValidity('');
        els.edad.setCustomValidity('');
      },

      renderStudents() {
        const q = els.searchInput.value.trim().toLowerCase();
        const filtered = students.filter(s => {
          if (!q) return true;
          return (s.nombre + ' ' + s.apellido + ' ' + s.email + ' ' + (s.carrera||'')).toLowerCase().includes(q);
        });

        els.countBadge.textContent = `${students.length} ${students.length === 1 ? 'estudiante' : 'estudiantes'}`;
        if (els.tableInfo) els.tableInfo.textContent = `${filtered.length} mostrados`;

        els.studentsBody.innerHTML = '';

        if (!filtered.length) {
          els.studentsBody.appendChild(tpl.noResults());
          return;
        }

        filtered.forEach((s, idx) => {
          els.studentsBody.innerHTML += tpl.row(idx + 1, s);
        });
      }
    };

    // Public API
    return {
      init() {
        // load state
        students = utils.load();

        // wire events
        els.form.addEventListener('submit', handlers.onFormSubmit);
        els.clearBtn.addEventListener('click', handlers.onClearClick);
        els.deleteAllBtn.addEventListener('click', handlers.onDeleteAllClick);
        els.studentsBody.addEventListener('click', handlers.onTableClick);
        els.searchInput.addEventListener('input', handlers.renderStudents);
        els.edad.addEventListener('blur', () => {
          if (!els.edad.value) return;
          const v = Number(els.edad.value);
          if (Number.isNaN(v) || v < 18 || v > 100) {
            els.edad.setCustomValidity('La edad debe estar entre 18 y 100.');
          } else {
            els.edad.setCustomValidity('');
          }
        });

        // initial render & focus
        handlers.renderStudents();
        els.nombre.focus();
      }
    };
  })();

  // Expose small helpers for debugging if needed (no global state)
  window.App = App;

  // Initialize
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
