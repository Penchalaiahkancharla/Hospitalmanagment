(function(){
  const LS_KEY = 'hms_patients_v1'
  let patients = []

  const $ = sel => document.querySelector(sel)
  const tbody = $('#patients-table tbody')
  const form = $('#patient-form')
  const emptyMsg = $('#empty-msg')
  const searchInput = $('#search')

  function load(){
    try{ patients = JSON.parse(localStorage.getItem(LS_KEY)) || [] }catch(e){ patients = [] }
  }

  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(patients)) }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

  function updateStats(){
    const statCount = document.getElementById('stat-count')
    if(statCount) statCount.textContent = patients.length
  }

  function render(filter=''){
    tbody.innerHTML = ''
    const list = patients.filter(p => {
      const q = filter.trim().toLowerCase()
      if(!q) return true
      return p.name.toLowerCase().includes(q) || (p.ailment||'').toLowerCase().includes(q)
    })
    if(list.length===0){ emptyMsg.style.display='block'; return }
    emptyMsg.style.display='none'
    list.forEach(p => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${escapeHtml(p.name)}</td>
        <td>${p.age}</td>
        <td>${escapeHtml(p.gender||'')}</td>
        <td>${escapeHtml(p.ailment||'')}</td>
        <td>
          <button class="action-btn" data-id="${p.id}" data-action="edit">Edit</button>
          <button class="action-btn" data-id="${p.id}" data-action="delete">Delete</button>
        </td>`
      tbody.appendChild(tr)
    })
    updateStats()
  }

  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

  function resetForm(){ form.reset(); $('#patient-id').value=''; $('#form-title').textContent='Add Patient' }

  form.addEventListener('submit', e => {
    e.preventDefault()
    const id = $('#patient-id').value
    const name = $('#name').value.trim()
    const age = parseInt($('#age').value,10) || 0
    const gender = $('#gender').value
    const ailment = $('#ailment').value.trim()
    if(!name) return alert('Name required')

    if(id){
      const idx = patients.findIndex(p => p.id===id)
      if(idx>-1){ patients[idx] = { ...patients[idx], name, age, gender, ailment } }
    } else {
      patients.push({ id: uid(), name, age, gender, ailment, createdAt: Date.now() })
    }
    save()
    render(searchInput.value)
    resetForm()
  })

  $('#reset-btn').addEventListener('click', resetForm)

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('button')
    if(!btn) return
    const id = btn.getAttribute('data-id')
    const action = btn.getAttribute('data-action')
    if(action==='delete'){
      if(confirm('Delete this patient?')){
        patients = patients.filter(p => p.id!==id)
        save()
        render(searchInput.value)
      }
    } else if(action==='edit'){
      const p = patients.find(x=>x.id===id)
      if(!p) return
      $('#patient-id').value = p.id
      $('#name').value = p.name
      $('#age').value = p.age
      $('#gender').value = p.gender
      $('#ailment').value = p.ailment
      $('#form-title').textContent = 'Edit Patient'
      window.scrollTo({top:0,behavior:'smooth'})
    }
  })

  searchInput.addEventListener('input', () => render(searchInput.value))

  // initial load
  load()
  render()
})();