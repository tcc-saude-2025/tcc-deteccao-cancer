document.addEventListener('DOMContentLoaded', () => {
    // Declaração de todas as variáveis e elementos
    const pages = {
        auth: document.getElementById('page-auth'),
        home: document.getElementById('page-home'),
        form: document.getElementById('page-form'),
        results: document.getElementById('page-results'),
        tips: document.getElementById('page-tips'),
        history: document.getElementById('page-history')
    };

    const authForm = pages.auth.querySelector('.card');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const loginButton = document.getElementById('login-button');
    const showRegisterLink = document.getElementById('show-register');
    
    const startButton = document.getElementById('start-button');
    const formContent = document.getElementById('form-content');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const viewTipsButton = document.getElementById('view-tips-button');
    const whatsappShareButton = document.getElementById('whatsapp-share');
    const telegramShareButton = document.getElementById('telegram-share');
    const backFromTipsButton = document.getElementById('back-from-tips-button');
    const viewHistoryButton = document.getElementById('view-history-button');
    const backFromHistoryButton = document.getElementById('back-from-history-button');
    const restartButton = document.getElementById('restart-button');
    const tipsContent = document.getElementById('tips-content');
    const historyContent = document.getElementById('history-content');
    const logoutButtons = document.querySelectorAll('.logout-button');

    let currentStep = 0;
    let answers = {};
    let currentUser = null;

    const questions = [
        {
            type: 'text',
            label: 'Idade',
            id: 'age',
            placeholder: 'Ex: 35'
        },
        {
            type: 'radio',
            label: 'Sexo',
            id: 'sex',
            options: ['Masculino', 'Feminino']
        },
        {
            type: 'radio',
            label: 'Tabagismo',
            id: 'smoking',
            options: ['Não', 'Sim, atualmente', 'Sim, parei']
        },
        {
            type: 'radio',
            label: 'Consumo de álcool',
            id: 'alcohol',
            options: ['Nenhum', 'Ocasional', 'Frequente']
        },
        {
            type: 'radio',
            label: 'Atividade física',
            id: 'physical_activity',
            options: ['Baixa', 'Média', 'Alta']
        },
        {
            type: 'radio',
            label: 'Parente de 1º grau com câncer',
            id: 'family_history',
            options: ['Sim', 'Não']
        },
    ];
    const totalSteps = questions.length;

    // Lógica de Autenticação
    function checkAuth() {
        currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            showPage('page-home');
        } else {
            showPage('page-auth');
        }
    }

    function registerUser(email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[email]) {
            alert('Este email já está cadastrado.');
            return false;
        }
        users[email] = { password: password, history: [] };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
        return true;
    }

    function loginUser(email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[email] && users[email].password === password) {
            localStorage.setItem('currentUser', email);
            currentUser = email;
            alert('Login realizado com sucesso!');
            return true;
        }
        alert('Email ou senha incorretos.');
        return false;
    }

    function logout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        checkAuth();
    }

    // Funções de navegação e lógica da avaliação
    function showPage(pageId) {
        for (const key in pages) {
            pages[key].classList.add('hidden');
        }
        document.getElementById(pageId).classList.remove('hidden');
    }

    function renderStep() {
        if (currentStep < totalSteps) {
            const questionData = questions[currentStep];
            let content = `<h2 class="question-text">${questionData.label}</h2>`;

            if (questionData.type === 'text') {
                content += `
                    <div class="form-field">
                        <input type="number" id="${questionData.id}" placeholder="${questionData.placeholder}" class="input-field">
                    </div>
                `;
            } else if (questionData.type === 'radio') {
                content += questionData.options.map(option => `
                    <button class="option-button" data-value="${option}">${option}</button>
                `).join('');
            }

            content += `<div class="button-group-nav">`;
            if (currentStep > 0) {
                content += `<button class="button button-secondary back-button">Voltar</button>`;
            }
            content += `<button class="button next-button">Próxima</button>`;
            content += `</div>`;

            formContent.innerHTML = content;
            updateProgressBar();
            attachFormListeners(questionData);
        } else {
            showResult();
        }
    }

    function attachFormListeners(questionData) {
        const nextButton = document.querySelector('.next-button');
        const backButton = document.querySelector('.back-button');
        const options = document.querySelectorAll('.option-button');
        let selectedValue = null;

        if (backButton) {
            backButton.addEventListener('click', () => {
                currentStep--;
                renderStep();
            });
        }

        if (questionData.type === 'radio') {
            nextButton.style.display = 'none';
            options.forEach(option => {
                option.addEventListener('click', () => {
                    options.forEach(btn => btn.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedValue = option.dataset.value;
                    nextButton.style.display = 'block';
                });
            });
        }

        nextButton.addEventListener('click', () => {
            if (questionData.type === 'text') {
                const inputField = document.getElementById(questionData.id);
                if (inputField) {
                    selectedValue = inputField.value;
                }
            }
            if (selectedValue) {
                answers[questionData.id] = selectedValue;
                currentStep++;
                renderStep();
            }
        });
    }

    function updateProgressBar() {
        const progress = (currentStep / totalSteps) * 100;
        progressBarFill.style.width = `${progress}%`;
    }

    function calculateRisk() {
        let riskScore = 0;
        if (answers.age > 50) riskScore += 2;
        if (answers.smoking !== 'Não') riskScore += 3;
        if (answers.alcohol !== 'Nenhum') riskScore += 1;
        if (answers.family_history === 'Sim') riskScore += 4;

        if (riskScore >= 7) return 'high';
        if (riskScore >= 4) return 'moderate';
        return 'low';
    }
    
    // Funcionalidade do Histórico: Salvar resultado por usuário
    function saveResult(riskLevel) {
        if (!currentUser) return;
        let users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[currentUser];
        if (user) {
            const result = {
                date: new Date().toISOString(),
                riskLevel: riskLevel
            };
            user.history.push(result);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    function showResult() {
        const riskLevel = calculateRisk();
        const resultText = document.getElementById('result-text');
        const resultDescription = document.getElementById('result-description');
        const pageResults = document.getElementById('page-results');
    
        let message = "";
        let classToAdd = "";
        let iconText = "";

        if (riskLevel === 'low') {
            message = "De acordo com minhas respostas, meu risco estimado é **baixo**.";
            iconText = "Baixo";
            classToAdd = "low-risk";
        } else if (riskLevel === 'moderate') {
            message = "De acordo com minhas respostas, meu risco estimado é **moderado**.";
            iconText = "Moderado";
            classToAdd = "moderate-risk";
        } else {
            message = "De acordo com minhas respostas, meu risco estimado é **alto**.";
            iconText = "Alto";
            classToAdd = "high-risk";
        }

        saveResult(riskLevel);
        
        showPage('page-results');
        pageResults.classList.remove('low-risk', 'moderate-risk', 'high-risk');
        pageResults.classList.add(classToAdd);
        resultText.innerText = iconText;
        resultDescription.innerHTML = message + "<br><br>Recomendamos que consulte um médico para avaliação detalhada.";
        
        const shareMessage = `Minha autoavaliação de risco de câncer indicou um resultado ${iconText}. Faça a sua avaliação e cuide da sua saúde em: ${window.location.href}`;
        const encodedMessage = encodeURIComponent(shareMessage);

        whatsappShareButton.href = `https://wa.me/?text=${encodedMessage}`;
        telegramShareButton.href = `https://t.me/share/url?url=${window.location.href}&text=${encodedMessage}`;
    
        lucide.createIcons();
    }

    function showTipsPage() {
        const tips = [
            "Mantenha um peso saudável, pois a obesidade aumenta o risco de vários tipos de câncer.",
            "Consuma uma dieta rica em frutas, vegetais e grãos integrais, e reduza o consumo de carnes processadas e vermelhas.",
            "Pratique exercícios regularmente. A atividade física contribui para a prevenção de diversas doenças, incluindo o câncer.",
            "Evite o consumo de tabaco e o uso excessivo de álcool.",
            "Proteja-se do sol, usando protetor solar, chapéu e roupas adequadas para evitar o câncer de pele.",
            "Faça exames preventivos de acordo com sua idade e histórico familiar, como mamografia e colonoscopia."
        ];

        let tipsHtml = `<ul class="tips-list">`;
        tips.forEach(tip => {
            tipsHtml += `<li><i data-lucide="check-circle"></i> ${tip}</li>`;
        });
        tipsHtml += `</ul>`;

        tipsContent.innerHTML = tipsHtml;
        showPage('page-tips');
        lucide.createIcons();
    }

    // Funcionalidade do Histórico: Exibir histórico do usuário logado
    function showHistoryPage() {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[currentUser];
        const history = user ? user.history : [];

        if (history.length === 0) {
            historyContent.innerHTML = '<p class="subtitle">Você ainda não fez nenhuma avaliação. Faça sua primeira agora!</p>';
        } else {
            let list = '<ul class="tips-list">';
            history.reverse().forEach(item => {
                const date = new Date(item.date).toLocaleDateString('pt-BR');
                const riskClass = item.riskLevel + '-risk';
                list += `
                    <li>
                        <i data-lucide="calendar"></i>
                        Avaliação de ${date}: <span class="history-risk-text ${riskClass}">${item.riskLevel.toUpperCase()}</span>
                    </li>`;
            });
            list += '</ul>';
            historyContent.innerHTML = list;
        }
        showPage('page-history');
        lucide.createIcons();
    }

    // Lógica de Dark Mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        document.body.classList.add('dark-mode');
        darkModeIcon.setAttribute('data-lucide', 'sun');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark-mode');
            darkModeIcon.setAttribute('data-lucide', 'sun');
        } else {
            localStorage.setItem('theme', 'light-mode');
            darkModeIcon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    });

    // Event listeners dos botões de autenticação
    loginButton.addEventListener('click', () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        if (loginButton.innerText === 'Entrar') {
            if (loginUser(email, password)) {
                showPage('page-home');
            }
        } else {
            if (registerUser(email, password)) {
                showLoginForm();
            }
        }
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (showRegisterLink.innerText === 'Cadastre-se') {
            showRegisterForm();
        } else {
            showLoginForm();
        }
    });

    function showLoginForm() {
        authForm.querySelector('h1').innerText = 'Bem-vindo(a) de volta';
        loginButton.innerText = 'Entrar';
        showRegisterLink.innerText = 'Cadastre-se';
    }

    function showRegisterForm() {
        authForm.querySelector('h1').innerText = 'Criar nova conta';
        loginButton.innerText = 'Cadastrar';
        showRegisterLink.innerText = 'Fazer Login';
    }

    // Event listeners para o fluxo da avaliação
    startButton.addEventListener('click', () => {
        currentStep = 0;
        answers = {};
        showPage('page-form');
        renderStep();
    });

    restartButton.addEventListener('click', () => {
        currentStep = 0;
        answers = {};
        showPage('page-form');
        renderStep();
    });

    viewTipsButton.addEventListener('click', () => {
        showTipsPage();
    });

    backFromTipsButton.addEventListener('click', () => {
        showPage('page-results');
    });

    viewHistoryButton.addEventListener('click', () => {
        showHistoryPage();
    });

    backFromHistoryButton.addEventListener('click', () => {
        showPage('page-results');
    });
    
    // Event listener para todos os botões de logout
    logoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            logout();
        });
    });

    // Inicia a aplicação verificando se há um usuário logado
    checkAuth();
    lucide.createIcons();
});