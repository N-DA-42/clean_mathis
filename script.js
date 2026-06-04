<script>
        // Database des véhicules (Basé sur le script original)
        const carDB = {
            citadine: ['clio', 'twingo', 'zoe', 'modus', 'wind', 'r5', 'sandero', 'spring', '208', '207', '206', '108', '107', '106', '205', 'c3', 'c2', 'c1', 'ds3', 'ami', 'saxo', 'polo', 'up', 'fox', 'fabia', 'ibiza', 'a1', '500', 'fiat 500', 'panda', 'punto', 'mito', 'fiesta', 'ka', 'corsa', 'yaris', 'aygo', 'micra', 'swift', 'picanto', 'rio', 'i10', 'i20', 'mini', 'smart'],
            berline: ['megane', 'talisman', 'laguna', '308', '307', '508', '407', 'c4', 'c5', 'ds4', 'ds5', 'golf', 'passat', 'arteon', 'leon', 'octavia', 'a3', 'a4', 'a5', 'serie 1', 'serie 2', 'serie 3', 'classe a', 'classe c', 'focus', 'mondeo', 'astra', 'corolla', 'civic', 'model 3', 'giulia'],
            suv: ['captur', 'arkana', 'austral', 'kadjar', 'koleos', 'scenic', 'espace', 'duster', '2008', '3008', '5008', 'c3 aircross', 'c5 aircross', 'ds7', 'tiguan', 't-roc', 'touareg', 'q2', 'q3', 'q5', 'q7', 'ateca', 'karoq', 'x1', 'x3', 'x5', 'gla', 'glc', 'kuga', 'puma', 'yaris cross', 'rav4', 'qashqai', 'tucson', 'sportage', 'macan', 'cayenne', 'model y', 'model x']
        };

        // Configuration des prix
        const prices = {
            cleaning: {
                basic: { int: 45, ext: 35, pack: 75 },
                avancer: { int: 70, ext: 60, pack: 110 },
                pro: { int: 90, ext: 80, pack: 160 }
            },
            polishing: {
                leger: [250, 325, 400], // [Citadine, Berline, SUV]
                intermediaire: [350, 475, 600]
            },
            ceramic: { 3: 120, 5: 180 },
            options: { opt_dep_carr: 10, opt_dep_vitre: 15 }
        };

        // Textes descriptifs par niveau
        const features = {
            basic: { int: ["Aspiration & Moquette", "Tableau de bord"], ext: ["Lavage à la main", "Nettoyage vitres"] },
            avancer: { int: ["Pack Basic inclus", "Ventilation & Portes"], ext: ["Pack Basic inclus", "Passages de roues & Jantes"] },
            pro: { int: ["Pack Avancé inclus", "Detailing Poussé"], ext: ["Pack Avancé inclus", "Detailing Poussé"] }
        };

        // Etat du simulateur
        let state = {
            vehicleIndex: 0, 
            level: 'basic',
            interieur: false,
            exterieur: false,
            polishing: null,
            ceramic: null,
            opt_dep_carr: false,
            opt_dep_vitre: false
        };

        // Navbar Scroll Effect
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            if (window.scrollY > 20) {
                nav.classList.add('bg-darker/95', 'shadow-lg', 'border-b', 'border-white/10');
            } else {
                nav.classList.remove('bg-darker/95', 'shadow-lg', 'border-b', 'border-white/10');
            }
        });

        // Mobile Menu Toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // Logic : Recherche véhicule
        function searchCar() {
            const input = document.getElementById('car-input').value.toLowerCase().trim();
            const feedback = document.getElementById('car-feedback');
            
            if(input.length < 2) {
                feedback.innerHTML = "";
                return;
            }

            let found = null;
            let categoryName = "";

            if(carDB.citadine.some(car => input.includes(car))) { found = 'citadine'; categoryName = "Catégorie : Citadine"; }
            else if(carDB.berline.some(car => input.includes(car))) { found = 'berline'; categoryName = "Catégorie : Berline"; }
            else if(carDB.suv.some(car => input.includes(car))) { found = 'suv'; categoryName = "Catégorie : SUV / Break"; }

            if(found) {
                feedback.innerHTML = `<span class="text-green-400 font-bold"><i class="fas fa-check-circle mr-1"></i> ${categoryName}</span>`;
                if(found === 'citadine') document.getElementById('default-vehicle').click();
                if(found === 'berline') document.getElementById('btn-berline').click();
                if(found === 'suv') document.getElementById('btn-suv').click();
            } else {
                feedback.innerHTML = "<span class="text-gray-400">Modèle non trouvé, sélectionnez manuellement ci-dessous.</span>";
            }
        }

        // Logic : Sélection véhicule
        function selectVehicle(type, el) {
            document.querySelectorAll('#simulateur .option-card').forEach(c => {
                if(c.id === 'default-vehicle' || c.id === 'btn-berline' || c.id === 'btn-suv') {
                    c.classList.remove('selected');
                }
            });
            el.classList.add('selected');
            
            if(type === 'citadine') state.vehicleIndex = 0;
            if(type === 'berline') state.vehicleIndex = 1;
            if(type === 'suv') state.vehicleIndex = 2;
            
            updatePolishingDisplay();
            calculateTotal();
        }

        // Logic : Niveau nettoyage
        function setLevel(lvl, el) {
            state.level = lvl;
            document.querySelectorAll('.level-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('text-gray-300');
            });
            el.classList.remove('text-gray-300');
            el.classList.add('active', 'bg-primary', 'text-white');
            
            // Update Prices on UI
            document.getElementById('price-int').innerText = prices.cleaning[lvl].int + '€';
            document.getElementById('price-ext').innerText = prices.cleaning[lvl].ext + '€';
            
            // Update Features on UI
            document.getElementById('features-int').innerHTML = features[lvl].int.map(f => `<li><i class="fas fa-check text-primary mr-2 text-xs"></i> ${f}</li>`).join('');
            document.getElementById('features-ext').innerHTML = features[lvl].ext.map(f => `<li><i class="fas fa-check text-primary mr-2 text-xs"></i> ${f}</li>`).join('');
            
            calculateTotal();
        }

        // Logic : Options simples
        function toggleOption(opt, el) {
            state[opt] = !state[opt];
            el.classList.toggle('selected');
            calculateTotal();
        }
