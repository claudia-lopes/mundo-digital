const digiContainer = document.getElementById('digiContainer');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

let allDigimons = [];

async function fetchDigimons() {
    try {
        const response = await fetch('https://digi-api.com/api/v1/digimon?pageSize=100');
        const data = await response.json();
        allDigimons = data.content;
        renderCards(allDigimons);
    } catch (error) {
        digiContainer.innerHTML = '<div class="text-center text-danger p-20 font-bold uppercase">Erro de Conexão Digital.</div>';
    } finally {
        loading.style.display = 'none';
    }
}

function renderCards(list) {
    let htmlContent = '';
    list.forEach(digi => {
        
        const proxyImg = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(digi.image)}`;
        
        htmlContent += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="digi-card rounded-3xl p-4 text-center h-full d-flex flex-column shadow-lg" onclick="showDetails(${digi.id})">
                    <div class="scanline"></div>
                    <div class="img-wrapper mb-4">
                        <img src="${proxyImg}" class="max-h-full max-w-full object-contain" onerror="this.src='https://via.placeholder.com/200?text=Digital';">
                    </div>
                    <div>
                        <h5 class="neon-font text-xs md:text-sm font-bold truncate text-white uppercase">${digi.name}</h5>
                        <div class="mt-2 py-1 px-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <span class="text-[10px] text-sky-400 font-bold italic">ID: ${digi.id}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    digiContainer.innerHTML = htmlContent;
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allDigimons.filter(d => d.name.toLowerCase().includes(term));
    renderCards(filtered);
});

async function showDetails(id) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<div class="p-20 text-center"><div class="spinner-border text-sky-500"></div></div>';
    
    const myModal = new bootstrap.Modal(document.getElementById('digiModal'));
    myModal.show();

    try {
        const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
        const data = await response.json();

        const translate = (v) => {
            const terms = {
                'Rookie': 'Novato', 'Champion': 'Campeão', 'Ultimate': 'Perfeito', 'Mega': 'Mega',
                'Adult': 'Adulto', 'Child': 'Criança', 'Vaccine': 'Vacina', 'Virus': 'Vírus', 'Data': 'Dados'
            };
            return terms[v] || v;
        };

       
        const googleProxy = "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=";
        const digiImg = data.image ? `${googleProxy}${encodeURIComponent(data.image)}` : 'https://via.placeholder.com/400?text=Sem+Sinal';

        modalContent.innerHTML = `
            <div class="modal-body p-0 rounded-3xl overflow-hidden bg-slate-950">
                <div class="row g-0 align-items-stretch"> 
                    <div class="col-lg-5 col-12 d-flex align-items-center justify-content-center p-5 border-e border-slate-800" style="background-color: #0f172a; min-height: 350px;">
                        <img src="${digiImg}" class="img-fluid rounded-2xl drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]" 
                             style="max-height: 300px; width: 100%; object-fit: contain;"
                             onerror="this.src='https://via.placeholder.com/400?text=Erro+de+Sinal';">
                    </div>
                    <div class="col-lg-7 col-12 p-6 p-md-8 text-start d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h2 class="text-3xl font-black neon-font text-white m-0 uppercase">${data.name}</h2>
                                <span class="text-sky-900 font-bold text-[10px] tracking-widest border border-sky-900 px-2 rounded">VER. 2.0</span>
                            </div>
                            <div class="flex flex-wrap gap-2 mb-6">
                                ${data.levels.map(l => `<span class="px-3 py-1 bg-sky-500 text-black text-[10px] font-black rounded uppercase">${translate(l.level)}</span>`).join('')}
                                ${data.attributes.map(a => `<span class="px-3 py-1 border border-sky-500 text-sky-500 text-[10px] font-bold rounded uppercase">${translate(a.attribute)}</span>`).join('')}
                            </div>
                            <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/50 mb-6">
                                <label class="text-[9px] uppercase tracking-[0.3em] text-sky-600 font-bold d-block mb-2">Log de Dados Interno:</label>
                                <p class="text-sm text-slate-300 m-0" style="max-height: 140px; overflow-y: auto;">
                                    ${data.descriptions.find(d => d.language === 'en_us')?.description || 'Sem dados.'}
                                </p>
                            </div>
                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="text-[10px] text-sky-600 font-bold uppercase d-block">Espécie</label>
                                    <span class="text-white text-sm font-semibold">${data.types.map(t => t.type).join(', ')}</span>
                                </div>
                                <div class="col-6 text-end">
                                    <label class="text-[10px] text-sky-600 font-bold uppercase d-block">ID Arquivo</label>
                                    <span class="text-white text-sm font-mono">#${data.id}</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-neon w-full mt-8 py-3 font-bold bg-slate-950/50" data-bs-dismiss="modal">Encerrar Sessão</button>
                    </div>
                </div>
            </div>`;
    } catch (e) {
        modalContent.innerHTML = '<div class="p-20 text-center text-danger font-bold uppercase">Erro ao decodificar.</div>';
    }
}

fetchDigimons();
