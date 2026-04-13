const digiContainer = document.getElementById('digiContainer');
const searchInput = document.getElementById('searchInput');
const loading = document.getElementById('loading');

let allDigimons = [];

// 1. Busca inicial dos dados
async function fetchDigimons() {
    try {
        const response = await fetch('https://digi-api.com/api/v1/digimon?pageSize=100');
        const data = await response.json();
        allDigimons = data.content;
        renderCards(allDigimons);
    } catch (error) {
        digiContainer.innerHTML = '<div class="text-center text-danger font-bold uppercase p-20">Falha crítica na conexão com o Mundo Digital.</div>';
    } finally {
        loading.style.display = 'none';
    }
}

// 2. Renderização otimizada dos cards
function renderCards(list) {
    let htmlContent = '';
    
    if (list.length === 0) {
        digiContainer.innerHTML = '<p class="text-center py-20 text-slate-500 font-mono italic">Nenhum registro encontrado no servidor local.</p>';
        return;
    }

    list.forEach(digi => {
        htmlContent += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="digi-card rounded-3xl p-4 text-center h-full d-flex flex-column shadow-lg" onclick="showDetails(${digi.id})">
                    <div class="scanline"></div>
                    <div class="img-wrapper mb-4">
                        <img src="${digi.image}" alt="${digi.name}" class="max-h-full max-w-full object-contain drop-shadow-2xl" 
                             onerror="this.src='https://via.placeholder.com/200x200/0f172a/38bdf8?text=Offline';">
                    </div>
                    <div>
                        <h5 class="neon-font text-xs md:text-sm font-bold truncate text-white uppercase tracking-tighter">${digi.name}</h5>
                        <div class="mt-2 py-1 px-2 bg-sky-500/10 rounded-lg border border-sky-500/20">
                            <span class="text-[10px] text-sky-400 font-bold uppercase tracking-widest italic">ID: ${digi.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    digiContainer.innerHTML = htmlContent;
}

// 3. Sistema de filtro em tempo real
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allDigimons.filter(d => d.name.toLowerCase().includes(term));
    renderCards(filtered);
});

// 4. Detalhes no Modal 
async function showDetails(id) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '<div class="p-20 text-center"><div class="spinner-border text-sky-500"></div></div>';
    
    const myModal = new bootstrap.Modal(document.getElementById('digiModal'));
    myModal.show();

    try {
        const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
        const data = await response.json();

        // Dicionário de tradução
        const translate = (v) => {
            const terms = {
                'Rookie': 'Novato', 'Champion': 'Campeão', 'Ultimate': 'Perfeito', 'Mega': 'Mega',
                'Adult': 'Adulto', 'Vaccine': 'Vacina', 'Virus': 'Vírus', 'Data': 'Dados', 'None': 'Nenhum'
            };
            return terms[v] || v;
        };

        const digiImg = data.image ? data.image : 'https://via.placeholder.com/400x400/0f172a/38bdf8?text=Imagem+N%C3%A3o+Encontrada';

        modalContent.innerHTML = `
            <div class="modal-body p-0 rounded-3xl overflow-hidden bg-slate-950">
                <div class="row g-0 align-items-stretch" style="min-height: 420px;"> 
                    
                    <div class="col-lg-5 col-12 d-flex align-items-center justify-content-center p-5 border-e border-slate-800 shadow-inner" style="background-color: #0f172a;">
                        <img src="${digiImg}" alt="${data.name}" class="img-fluid rounded-2xl drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]" 
                             style="max-height: 320px; object-fit: contain;"
                             onerror="this.src='https://via.placeholder.com/400x400/0f172a/38bdf8?text=Erro+de+Sinal';">
                    </div>
                    
                    <div class="col-lg-7 col-12 p-6 p-md-8 d-flex flex-column justify-content-between text-start">
                        <div>
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h2 class="text-3xl font-black neon-font text-white m-0 uppercase tracking-tighter">${data.name}</h2>
                                <span class="text-sky-900 font-bold text-[10px] tracking-widest border border-sky-900 px-2 rounded">VER. 2.0</span>
                            </div>
                            
                            <div class="flex flex-wrap gap-2 mb-6">
                                ${data.levels.map(l => `<span class="px-3 py-1 bg-sky-500 text-black text-[10px] font-black rounded uppercase">${translate(l.level)}</span>`).join('')}
                                ${data.attributes.map(a => `<span class="px-3 py-1 border border-sky-500 text-sky-500 text-[10px] font-bold rounded uppercase">${translate(a.attribute)}</span>`).join('')}
                            </div>
                            
                            <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/50 mb-6">
                                <label class="text-[9px] uppercase tracking-[0.3em] text-sky-600 font-bold d-block mb-2">Log de Dados Interno:</label>
                                <p class="text-sm text-slate-300 leading-relaxed m-0" style="max-height: 140px; overflow-y: auto; padding-right: 8px;">
                                    ${data.descriptions.find(d => d.language === 'en_us')?.description || 'Acesso negado: Descrição corrompida ou inexistente.'}
                                </p>
                            </div>

                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="text-[10px] text-sky-600 font-bold uppercase d-block mb-1">Espécie Primária</label>
                                    <span class="text-white text-sm font-semibold">${data.types.map(t => t.type).join(', ') || 'Desconhecida'}</span>
                                </div>
                                <div class="col-6 text-end">
                                    <label class="text-[10px] text-sky-600 font-bold uppercase d-block mb-1">ID de Arquivo</label>
                                    <span class="text-white text-sm font-mono tracking-widest">#${data.id}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-neon w-full mt-8 py-3 font-bold bg-slate-950/50" data-bs-dismiss="modal">Encerrar Sessão</button>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        modalContent.innerHTML = '<div class="p-20 text-center text-danger font-bold uppercase">Falha crítica na decodificação de dados do Digimon.</div>';
    }
}

// Inicia aplicação chamando a função de busca
fetchDigimons();